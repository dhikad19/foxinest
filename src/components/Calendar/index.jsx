import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import listPlugin from "@fullcalendar/list";
import "@fullcalendar/common/main.css"; // Common FullCalendar styles

const Calendar = () => {
  const [events, setEvents] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [calendarView, setCalendarView] = useState("dayGridMonth");

  const fetchHolidayData = async () => {
    try {
      const response = await fetch(
        "https://raw.githubusercontent.com/guangrei/APIHariLibur_V2/main/calendar.json"
      );
      const json = await response.json();

      const eventMap = {};
      Object.entries(json)
        .filter(([date]) => date !== "info") // Exclude metadata
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

      setEvents(Object.values(eventMap));
      setIsLoaded(true);
    } catch (error) {
      console.error("Failed to fetch holiday data:", error);
    }
  };

  useEffect(() => {
    fetchHolidayData();

    const handleResize = () => {
      setCalendarView(window.innerWidth < 768 ? "listMonth" : "dayGridMonth");
    };
    handleResize(); // Set initial view
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div style={{ maxWidth: "100%", margin: "0 auto" }}>
      {isLoaded ? (
        <FullCalendar
          plugins={[dayGridPlugin, listPlugin]}
          initialView={calendarView}
          events={events}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,listMonth",
          }}
          aspectRatio={window.innerWidth < 768 ? 1.5 : 2}
          eventDisplay="block"
        />
      ) : (
        <p>Loading calendar...</p>
      )}
    </div>
  );
};

export default Calendar;
