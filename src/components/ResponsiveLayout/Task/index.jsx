import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  Divider,
  useTheme,
} from "@mui/material";
import DateIcon from "@mui/icons-material/DateRangeOutlined";
import CloseIcon from "@mui/icons-material/Close";
import useMediaQuery from "@mui/material/useMediaQuery";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { toast } from "react-toastify";
import RunningWithErrorsOutlinedIcon from "@mui/icons-material/RunningWithErrorsOutlined";

const showNotification = (titleOrCount, optionalBody) => {
  if ("Notification" in window && Notification.permission === "granted") {
    const options = {
      icon: "/fox.png",
      body:
        typeof titleOrCount === "number"
          ? `You have ${titleOrCount} tasks with deadline today or tomorrow!`
          : optionalBody,
    };
    const title =
      typeof titleOrCount === "number" ? "Task Reminder" : titleOrCount;

    new Notification(title, options);
  }
};

function TodayTasksButton() {
  const [todayTasks, setTodayTasks] = useState([]);
  const [open, setOpen] = useState(false);

  const getTodayDateString = () => {
    const today = new Date();
    return today.toISOString().split("T")[0]; // Returns today's date in YYYY-MM-DD format
  };

  const getTomorrowDateString = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0]; // Returns tomorrow's date in YYYY-MM-DD format
  };

  const fetchTasks = () => {
    const tasks = [];
    const homeDataRaw = localStorage.getItem("home_projects_data");
    if (homeDataRaw) {
      try {
        const homeData = JSON.parse(homeDataRaw);
        if (Array.isArray(homeData.tasks)) {
          tasks.push(...homeData.tasks);
        }
      } catch (error) {
        console.error("Error parsing home_projects_data:", error);
      }
    }

    const projectsDataRaw = localStorage.getItem("projects_data");
    if (projectsDataRaw) {
      try {
        const projectsData = JSON.parse(projectsDataRaw);
        Object.values(projectsData).forEach((project) => {
          if (Array.isArray(project.tasks)) {
            tasks.push(...project.tasks);
          }
        });
      } catch (error) {
        console.error("Error parsing projects_data:", error);
      }
    }

    return tasks;
  };

  useEffect(() => {
    const todayDate = getTodayDateString();
    const tomorrowDate = getTomorrowDateString();

    const updateTasks = () => {
      const tasks = fetchTasks();
      const filteredTasks = tasks.filter(
        (task) => task.dueDate === todayDate || task.dueDate === tomorrowDate
      );
      setTodayTasks(filteredTasks);

      const currentDate = todayDate;
      const last_notified_date = localStorage.getItem("last_notified_date");

      if (filteredTasks.length > 0 && last_notified_date !== currentDate) {
        showNotification(filteredTasks.length);
        toast.info(
          `You have ${filteredTasks.length} tasks with deadline today or tomorrow!`,
          {
            className: "custom-toast",
            progressClassName: "custom-toast-progress",
            icon: <InfoOutlinedIcon color="inherit" />,
          }
        );
        localStorage.setItem("last_notified_date", currentDate);
      }
    };

    updateTasks();
    const interval = setInterval(updateTasks, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  if (todayTasks.length === 0) {
    return null;
  }

  return (
    <>
      <div
        onClick={handleOpen}
        role="button"
        tabIndex={0}
        aria-label={`Open today's tasks. ${todayTasks.length} tasks due.`}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handleOpen()}
        style={{
          marginRight: 5,
          display: "flex",
          gap: 5,
          padding: "2px 8px",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "rgb(241, 241, 241)",
          borderRadius: 2,
          cursor: "pointer",
          userSelect: "none",
        }}
      >
        <RunningWithErrorsOutlinedIcon style={{ fontSize: 15 }} />
        <p style={{ fontSize: 14, fontWeight: 500 }}>{todayTasks.length}</p>
      </div>

      <Dialog
        fullScreen={fullScreen}
        open={open}
        onClose={handleClose}
        fullWidth
        maxWidth="sm"
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <DialogTitle
            style={{ padding: "12px 24px", fontSize: 17, marginTop: 5 }}
          >
            Today's Tasks
          </DialogTitle>
          <div
            style={{ padding: "12px 19px", marginTop: 5 }}
            onClick={handleClose}
          >
            <CloseIcon />
          </div>
        </div>
        <Divider />
        <DialogContent>
          <List>
            {todayTasks.map((task) => (
              <ListItem
                key={task.id}
                divider
                style={{ paddingLeft: 0, paddingRight: 0 }}
              >
                <div style={{ width: "100%" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      width: "100%",
                      marginBottom: 10,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        width: "100%",
                      }}
                    >
                      <DateIcon
                        style={{
                          fontSize: 19,
                          marginRight: 5,
                          marginLeft: "-2px",
                          color: "#4f4f4f",
                        }}
                      />
                      <p style={{ fontSize: 14 }}>
                        {(() => {
                          const currentYear = new Date().getFullYear();
                          const dueDate = new Date(task.dueDate);
                          const options = {
                            day: "2-digit",
                            month: "short",
                            ...(dueDate.getFullYear() !== currentYear && {
                              year: "numeric",
                            }),
                          };
                          return new Intl.DateTimeFormat(
                            "en-GB",
                            options
                          ).format(dueDate);
                        })()}
                      </p>
                    </div>
                    <p
                      style={{
                        fontSize: 14,
                        whiteSpace: "nowrap",
                        textOverflow: "ellipsis",
                        width: "180px",
                        overflow: "hidden",
                        textAlign: "right",
                      }}
                    >
                      {task.category}
                    </p>
                  </div>
                  <p
                    style={{
                      fontSize: "15px",
                      fontWeight: 500,
                      lineHeight: "normal",
                      marginBottom: 10,
                      marginTop: 0,
                    }}
                  >
                    {task.title}
                  </p>
                  <div
                    style={{ fontSize: "14px", marginBottom: 5 }}
                    dangerouslySetInnerHTML={{ __html: task.description }}
                  />
                </div>
              </ListItem>
            ))}
          </List>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default TodayTasksButton;
