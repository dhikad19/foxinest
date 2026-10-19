import "@fullcalendar/common/main.css";
import idLocale from "@fullcalendar/core/locales/id";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import {
  Box,
  CircularProgress,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useEffect, useMemo, useRef, useState } from "react";
import { addDays, hasTime, toDate } from "../../utils/date";
import AddEventDialog from "./Components/Add";
import EventDetailDialog from "./Components/Edit";

const HOLIDAY_URL =
  "https://raw.githubusercontent.com/guangrei/APIHariLibur_V2/main/calendar.json";
const STORAGE_KEY = "user_events_v2";
const HOLIDAY_COLOR = "#004ec2";
const INFO_COLOR = "#7C3AED";
const USER_COLOR = "#2DD4BF";

const uid = () =>
  crypto.randomUUID?.() ??
  `${Date.now()}-${Math.random().toString(36).slice(2)}`;

// Gabungkan hanya tanggal berurutan dengan judul yang sama.
const buildHolidayEvents = (json) => {
  const list = [];

  Object.entries(json)
    .filter(([date]) => /^\d{4}-\d{2}-\d{2}$/.test(date))
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([date, details]) => {
      details.summary.forEach((raw, i) => {
        const tentative = /\(belum pasti\)/i.test(raw);
        const title = raw.replace(/\s*\(belum pasti\)/i, "").trim();
        const prev = list.find(
          (e) => e.title === title && e.end === addDays(date, -1),
        );

        if (prev) {
          prev.end = date;
          prev.tentative = prev.tentative || tentative;
        } else {
          list.push({
            id: `holiday-${date}-${i}`,
            title,
            start: date,
            end: date,
            tentative,
            isHoliday: details.holiday,
            text: details.description?.[i] ?? details.description?.[0] ?? "",
          });
        }
      });
    });

  return list.map((e) => ({
    id: e.id,
    kind: "holiday",
    title: e.title,
    start: e.start,
    end: e.end,
    allDay: true,
    description: [e.text, e.tentative ? "Tanggal belum pasti" : ""]
      .filter(Boolean)
      .join(" · "),
    backgroundColor: e.isHoliday ? HOLIDAY_COLOR : INFO_COLOR,
    textColor: "#fff",
  }));
};

const loadUserEvents = () => {
  try {
    const current = localStorage.getItem(STORAGE_KEY);
    if (current) return JSON.parse(current);

    // Migrasi dari format lama: tanpa id, end dari select() bersifat exclusive
    const legacy = JSON.parse(localStorage.getItem("user_events") || "[]");
    return legacy.map((e) => ({
      id: e.id || uid(),
      kind: "user",
      title: e.title,
      start: e.start,
      end: hasTime(e.start)
        ? e.end
        : e.end && e.end > e.start
          ? addDays(e.end, -1)
          : e.start,
      allDay: !hasTime(e.start),
      backgroundColor: e.backgroundColor || USER_COLOR,
      textColor: "#fff",
    }));
  } catch (err) {
    console.error("Failed to load user events:", err);
    return [];
  }
};

const mergeUserEvent = (list, ev) => {
  if (ev.allDay === false) return [...list, ev];

  let merged = false;
  const next = list.map((e) => {
    if (
      merged ||
      e.kind !== "user" ||
      e.allDay === false ||
      e.title !== ev.title
    ) {
      return e;
    }
    // Overlap atau bersebelahan (string YYYY-MM-DD bisa dibandingkan langsung)
    if (ev.start <= addDays(e.end, 1) && ev.end >= addDays(e.start, -1)) {
      merged = true;
      return {
        ...e,
        start: ev.start < e.start ? ev.start : e.start,
        end: ev.end > e.end ? ev.end : e.end,
      };
    }
    return e;
  });

  return merged ? next : [...next, ev];
};

const Calendar = () => {
  const calendarRef = useRef(null);
  const [events, setEvents] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const [editTitle, setEditTitle] = useState("");
  const [editStart, setEditStart] = useState("");
  const [editEnd, setEditEnd] = useState("");
  const [isHoliday, setIsHoliday] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventDates, setNewEventDates] = useState({ start: "", end: "" });
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm")); // dialog/drawer
  const isNarrow = useMediaQuery("(max-width:767px)"); // view kalender

  // Load data: kalau fetch gagal, kalender tetap tampil dengan event user
  useEffect(() => {
    let cancelled = false;

    (async () => {
      let holidays = [];
      try {
        const res = await fetch(HOLIDAY_URL);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        holidays = buildHolidayEvents(await res.json());
      } catch (err) {
        console.error("Failed to fetch holiday data:", err);
      }
      if (cancelled) return;
      setEvents([...holidays, ...loadUserEvents()]);
      setIsLoaded(true);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // Simpan hanya user event
  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(events.filter((e) => e.kind === "user")),
    );
  }, [events, isLoaded]);

  // Ganti view saat berpindah mobile <-> desktop
  useEffect(() => {
    calendarRef.current
      ?.getApi()
      .changeView(isNarrow ? "listMonth" : "dayGridMonth");
  }, [isNarrow]);

  // FullCalendar memakai end exclusive untuk event all-day
  const calendarEvents = useMemo(
    () =>
      events.map((e) => ({
        ...e,
        end: e.allDay !== false && e.end ? addDays(e.end, 1) : e.end,
      })),
    [events],
  );

  const formatDate = (dateStr) =>
    dateStr
      ? toDate(dateStr).toLocaleDateString("id-ID", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "";

  const openAddDialog = (start, end) => {
    setNewEventTitle("");
    setNewEventDates({ start, end });
    setDialogOpen(true);
  };

  const handleAddEvent = ({ title, start, end }) => {
    const ev = {
      id: uid(),
      kind: "user",
      title: title.trim(),
      start,
      end: end || start,
      allDay: !hasTime(start),
      backgroundColor: USER_COLOR,
      textColor: "#fff",
    };
    setEvents((prev) => mergeUserEvent(prev, ev));
  };

  const handleEventClick = ({ event }) => {
    const found = events.find((e) => e.id === event.id);
    if (!found) return;

    setSelectedEvent({ ...found, ...found.details });
    setEditTitle(found.title);
    setEditStart(found.start);
    setEditEnd(found.end || found.start);
    setIsHoliday(found.kind === "holiday");
    setDetailDialogOpen(true);
  };

  const handleEditEvent = () => {
    if (!selectedEvent) return;
    const title = editTitle.trim();
    if (!title) return;
    const end = editEnd < editStart ? editStart : editEnd;

    setEvents((prev) =>
      prev.map((e) =>
        e.id === selectedEvent.id && e.kind === "user"
          ? { ...e, title, start: editStart, end }
          : e,
      ),
    );
    setDetailDialogOpen(false);
  };

  const handleDeleteEvent = () => {
    if (!selectedEvent) return;
    setEvents((prev) =>
      prev.filter((e) => !(e.id === selectedEvent.id && e.kind === "user")),
    );
    setDetailDialogOpen(false);
  };

  return (
    <div
      style={{
        maxWidth: "100%",
        margin: "0 auto",
        padding: isMobile ? "60px 15px 0px 15px" : "60px 25px 0px 25px",
      }}
    >
      {isLoaded ? (
        <FullCalendar
          ref={calendarRef}
          plugins={[
            dayGridPlugin,
            listPlugin,
            interactionPlugin,
            timeGridPlugin,
          ]}
          locale={idLocale}
          initialView={isNarrow ? "listMonth" : "dayGridMonth"}
          headerToolbar={
            isNarrow
              ? {
                  left: "prev,next",
                  center: "title",
                  right: "dayGridMonth,listMonth",
                }
              : {
                  left: "prev,next today",
                  center: "title",
                  right: "dayGridMonth,timeGridWeek,timeGridDay,listMonth",
                }
          }
          events={calendarEvents}
          eventClick={handleEventClick}
          eventDisplay="block"
          dayMaxEvents
          fixedWeekCount={false}
          height="auto"
          aspectRatio={1.8}
          selectable
          selectMirror
          dateClick={(info) =>
            openAddDialog(
              info.dateStr,
              info.allDay
                ? info.dateStr
                : new Date(info.date.getTime() + 60 * 60 * 1000).toISOString(),
            )
          }
          select={(sel) =>
            openAddDialog(
              sel.startStr,
              sel.allDay ? addDays(sel.endStr, -1) : sel.endStr,
            )
          }
        />
      ) : (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "60vh",
          }}
        >
          <CircularProgress sx={{ color: "#0066FF" }} />
          <Typography variant="subtitle1" sx={{ marginTop: 2 }}>
            Please wait
          </Typography>
        </Box>
      )}

      <AddEventDialog
        isMobile={isMobile}
        dialogOpen={dialogOpen}
        setDialogOpen={setDialogOpen}
        newEventTitle={newEventTitle}
        setNewEventTitle={setNewEventTitle}
        newEventDates={newEventDates}
        handleAddEvent={handleAddEvent}
      />
      <EventDetailDialog
        isMobile={isMobile}
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        selectedEvent={selectedEvent}
        editTitle={editTitle}
        editStart={editStart}
        editEnd={editEnd}
        isHoliday={isHoliday}
        setEditTitle={setEditTitle}
        setEditStart={setEditStart}
        setEditEnd={setEditEnd}
        handleEditEvent={handleEditEvent}
        handleDeleteEvent={handleDeleteEvent}
        formatDate={formatDate}
      />
    </div>
  );
};

export default Calendar;
