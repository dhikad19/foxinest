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
  Divider,
  useMediaQuery,
  Typography,
  CircularProgress,
} from "@mui/material";
import EventDetailDialog from "./Components/Edit";
import AddEventDialog from "./Components/Add";
import CloseIcon from "@mui/icons-material/Close";
import interactionPlugin from "@fullcalendar/interaction"; // Required for interactions
import "@fullcalendar/common/main.css";
import DateIcon from "@mui/icons-material/DateRangeOutlined";

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
          end: editEnd,
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
            end: mergedEnd.toISOString().split("T")[0],
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
        padding: isMobile ? "60px 15px 0px 15px" : "60px 25px 0px 25px",
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
              end: info.dateStr,
            });
            setDialogOpen(true);
          }}
          select={(selectionInfo) => {
            setNewEventTitle("");
            setNewEventDates({
              start: selectionInfo.startStr,
              end: selectionInfo.endStr,
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
