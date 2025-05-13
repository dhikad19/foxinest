import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import listPlugin from "@fullcalendar/list";
import timeGridPlugin from "@fullcalendar/timegrid";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  useTheme,
  useMediaQuery,
  Typography,
  CircularProgress,
} from "@mui/material";

import interactionPlugin from "@fullcalendar/interaction"; // Required for interactions
import "@fullcalendar/common/main.css";

const Calendar = () => {
  const [events, setEvents] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [calendarView, setCalendarView] = useState("dayGridMonth");
  const [editTitle, setEditTitle] = useState("");
  const [editStart, setEditStart] = useState("");
  const [editEnd, setEditEnd] = useState("");
  const [isHoliday, setIsHoliday] = useState(false);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventDates, setNewEventDates] = useState({ start: "", end: "" });
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const addOneDay = (dateStr) => {
    const date = new Date(dateStr);
    date.setDate(date.getDate() + 1);
    return date.toISOString().split("T")[0];
  };

  const handleEditEvent = () => {
    if (!selectedEvent) return;

    const updatedEvents = events.map((evt) => {
      if (
        evt.title === selectedEvent.title &&
        evt.start === selectedEvent.start &&
        evt.end === selectedEvent.end &&
        evt.backgroundColor === "#4caf50"
      ) {
        return {
          ...evt,
          title: editTitle,
          start: editStart,
          end: addOneDay(editEnd),
        };
      }
      return evt;
    });

    setEvents(updatedEvents);
    setDetailDialogOpen(false);
  };

  const handleDeleteEvent = () => {
    if (!selectedEvent) return;
    const filtered = events.filter((evt) => {
      return !(
        evt.title === selectedEvent.title &&
        evt.start === selectedEvent.start &&
        evt.end === selectedEvent.end &&
        evt.backgroundColor === "#4caf50"
      );
    });

    setEvents(filtered);
    setDetailDialogOpen(false);
  };

  // Load holidays and local events
  const fetchHolidayData = async () => {
    try {
      const response = await fetch(
        "https://raw.githubusercontent.com/guangrei/APIHariLibur_V2/main/calendar.json"
      );
      const json = await response.json();

      const eventMap = {};
      Object.entries(json)
        .filter(([date]) => date !== "info")
        .forEach(([date, details]) => {
          const title = details.summary[0];
          if (!eventMap[title]) {
            eventMap[title] = {
              title,
              start: date,
              end: date,
              description: details.description.join(", "),
              backgroundColor: details.holiday ? "#ff5722" : "#2196f3",
              textColor: "#fff",
            };
          } else {
            if (new Date(date) < new Date(eventMap[title].start)) {
              eventMap[title].start = date;
            }
            if (new Date(date) > new Date(eventMap[title].end)) {
              eventMap[title].end = date;
            }
          }
        });

      const storedEvents = JSON.parse(
        localStorage.getItem("user_events") || "[]"
      );
      setEvents([...Object.values(eventMap), ...storedEvents]);
      setIsLoaded(true);
    } catch (error) {
      console.error("Failed to fetch holiday data:", error);
    }
  };

  // Save user-added events to localStorage
  const saveUserEvents = (allEvents) => {
    // Separate user events from holiday events
    const userEvents = allEvents.filter(
      (event) => event.backgroundColor === "#4caf50"
    );
    localStorage.setItem("user_events", JSON.stringify(userEvents));
  };

  useEffect(() => {
    fetchHolidayData();

    const handleResize = () => {
      setCalendarView(window.innerWidth < 768 ? "listMonth" : "dayGridMonth");
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Whenever events change, update localStorage for user events
  useEffect(() => {
    if (isLoaded) {
      saveUserEvents(events);
    }
  }, [events]);

  const mergeUserEvent = (existingEvents, newEvent) => {
    const oneDay = 24 * 60 * 60 * 1000;
    let merged = false;

    const updatedEvents = existingEvents.map((event) => {
      if (
        event.title === newEvent.title &&
        event.backgroundColor === "#4caf50"
      ) {
        const existingStart = new Date(event.start);
        const existingEnd = new Date(event.end);
        const newStart = new Date(newEvent.start);
        const newEnd = new Date(newEvent.end);

        // Merge if adjacent or overlapping
        if (
          Math.abs(existingEnd.getTime() - newStart.getTime()) <= oneDay ||
          Math.abs(newEnd.getTime() - existingStart.getTime()) <= oneDay ||
          (newStart <= existingEnd && newEnd >= existingStart)
        ) {
          const mergedStart = new Date(Math.min(existingStart, newStart));
          const mergedEnd = new Date(Math.max(existingEnd, newEnd));

          merged = true;
          return {
            ...event,
            start: mergedStart.toISOString().split("T")[0],
            end: addOneDay(mergedEnd.toISOString().split("T")[0]),
          };
        }
      }
      return event;
    });

    return merged ? updatedEvents : [...updatedEvents, newEvent];
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleAddEvent = (newEvent) => {
    setEvents((prevEvents) => mergeUserEvent(prevEvents, newEvent));
  };

  return (
    <div
      style={{
        maxWidth: "100%",
        height: "100%",
        margin: "0 auto",
        padding: isMobile ? "0px 15px 0px 15px" : "0px 25px 0px 25px",
      }}
    >
      {isLoaded ? (
        <FullCalendar
          eventClick={(info) => {
            const startStr = info.event.startStr;
            const endStr = info.event.endStr || info.event.startStr;

            const holiday = info.event.backgroundColor !== "#4caf50"; // libur jika bukan user event

            setSelectedEvent({
              title: info.event.title,
              start: startStr,
              end: endStr,
            });
            setEditTitle(info.event.title);
            setEditStart(startStr);
            setEditEnd(endStr);
            setIsHoliday(holiday);
            setDetailDialogOpen(true);
          }}
          plugins={[
            dayGridPlugin,
            listPlugin,
            interactionPlugin,
            timeGridPlugin,
          ]}
          initialView={calendarView || "timeGridWeek"}
          events={events}
          selectable={true}
          selectMirror={true}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay,listMonth",
          }}
          aspectRatio={window.innerWidth < 768 ? 0.5 : 2}
          eventDisplay="block"
          dateClick={(info) => {
            setNewEventTitle("");
            setNewEventDates({
              start: info.dateStr,
              end: info.dateStr, // Ubah jadi sama dengan start
            });
            setDialogOpen(true);
          }}
          select={(selectionInfo) => {
            setNewEventTitle("");
            setNewEventDates({
              start: selectionInfo.startStr,
              end: selectionInfo.endStr, // Gunakan endStr langsung, jangan ditambah
            });
            setDialogOpen(true);
          }}
        />
      ) : (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
          }}
        >
          <CircularProgress sx={{ color: "#ff7800" }} />
          <Typography variant="subtitle1" sx={{ marginTop: 2 }}>
            Please wait
          </Typography>
        </Box>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Tambah Event</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Judul Event"
            fullWidth
            value={newEventTitle}
            onChange={(e) => setNewEventTitle(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Batal</Button>
          <Button
            onClick={() => {
              if (newEventTitle.trim() !== "") {
                handleAddEvent({
                  title: newEventTitle,
                  start: newEventDates.start,
                  end: addOneDay(newEventDates.end),
                  backgroundColor: "#4caf50",
                  textColor: "#fff",
                });
              }
              setDialogOpen(false);
            }}
          >
            Simpan
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
      >
        <DialogTitle>Detail Event</DialogTitle>
        <DialogContent>
          {selectedEvent && (
            <>
              <p>
                <strong>Judul:</strong> {selectedEvent.title}
              </p>
              <p>
                <strong>Tanggal:</strong>{" "}
                {selectedEvent.end && selectedEvent.start !== selectedEvent.end
                  ? `${formatDate(selectedEvent.start)} sampai ${formatDate(
                      selectedEvent.end
                    )}`
                  : formatDate(selectedEvent.start)}
              </p>

              {!isHoliday && (
                <>
                  <TextField
                    label="Edit Judul Event"
                    fullWidth
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    margin="dense"
                  />
                  <TextField
                    label="Tanggal Mulai"
                    type="date"
                    fullWidth
                    margin="dense"
                    value={editStart}
                    onChange={(e) => setEditStart(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                  <TextField
                    label="Tanggal Selesai"
                    type="date"
                    fullWidth
                    margin="dense"
                    value={editEnd}
                    onChange={(e) => setEditEnd(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </>
              )}
            </>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setDetailDialogOpen(false)}>Tutup</Button>
          {!isHoliday && (
            <>
              <Button onClick={handleDeleteEvent} color="error">
                Hapus
              </Button>
              <Button onClick={handleEditEvent}>Simpan</Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Calendar;
