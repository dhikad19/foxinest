import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  Divider,
  useTheme,
  Alert,
} from "@mui/material";
import DateIcon from "@mui/icons-material/DateRangeOutlined";
import CloseIcon from "@mui/icons-material/Close";
import useMediaQuery from "@mui/material/useMediaQuery";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import RunningWithErrorsOutlinedIcon from "@mui/icons-material/RunningWithErrorsOutlined";
import { toast } from "react-toastify";

const showNotification = (taskCount) => {
  const todayDate = new Date().toISOString().split("T")[0];
  const lastNotificationDate = localStorage.getItem(
    "lastSystemNotificationDate"
  );

  // Prevent duplicate system notifications on the same day
  if (lastNotificationDate === todayDate) {
    return;
  }
  if ("Notification" in window && Notification.permission === "granted") {
    const options = {
      icon: "/fox.png",
      body: `You have ${taskCount} tasks with deadline today or tomorrow!`,
    };

    new Notification("Task Reminder", options);

    localStorage.setItem("lastSystemNotificationDate", todayDate);
  }
};

function TodayTasksButton() {
  const [todayTasks, setTodayTasks] = useState([]);
  const [open, setOpen] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);

  const getTodayDateString = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const getTomorrowDateString = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  };

  useEffect(() => {
    if ("Notification" in window) {
      Notification.requestPermission().then((permission) => {
        console.log("Notification permission:", permission);
      });
    }
  }, []);

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const loadTasksFromLocalStorage = () => {
    const todayDates = getTodayDateString();
    const tomorrowDate = getTomorrowDateString();
    let allTasks = [];

    const homeDataRaw = localStorage.getItem("home_projects_data");
    if (homeDataRaw) {
      try {
        const homeData = JSON.parse(homeDataRaw);
        if (Array.isArray(homeData.tasks)) {
          allTasks.push(...homeData.tasks);
        }
      } catch (e) {
        console.error("Invalid home_projects_data:", e);
      }
    }

    const projectsDataRaw = localStorage.getItem("projects_data");
    if (projectsDataRaw) {
      try {
        const projectsData = JSON.parse(projectsDataRaw);
        Object.values(projectsData).forEach((project) => {
          if (Array.isArray(project.tasks)) {
            allTasks.push(...project.tasks);
          }
        });
      } catch (e) {
        console.error("Invalid projects_data:", e);
      }
    }

    const filteredTasks = allTasks.filter(
      (task) => task.dueDate === todayDates || task.dueDate === tomorrowDate
    );

    setTodayTasks(filteredTasks);
    const todayDate = getTodayDateString();
    const lastToastDate = localStorage.getItem("lastToastDate");

    if (filteredTasks.length > 0) {
      if (lastToastDate !== todayDate) {
        toast.info(
          `You have ${filteredTasks.length} tasks with deadline today or tomorrow!`,
          {
            className: "custom-toast",
            progressClassName: "custom-toast-progress",
            icon: (
              <div>
                <InfoOutlinedIcon
                  color="#ff7800"
                  style={{ color: "#ff7800" }}
                />
              </div>
            ),
          }
        );

        showNotification(filteredTasks.length);
        localStorage.setItem("lastToastDate", todayDate);
      }
    }
  };

  useEffect(() => {
    loadTasksFromLocalStorage();

    const interval = setInterval(() => {
      loadTasksFromLocalStorage();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().toISOString().split("T")[0]; // Only date
      const homeDataRaw = localStorage.getItem("home_projects_data");
      const projectsDataRaw = localStorage.getItem("projects_data");

      let allTasks = [];

      if (homeDataRaw) {
        try {
          const homeData = JSON.parse(homeDataRaw);
          if (Array.isArray(homeData.tasks)) {
            allTasks.push(...homeData.tasks);
          }
        } catch (e) {
          console.error("Invalid home_projects_data:", e);
        }
      }

      if (projectsDataRaw) {
        try {
          const projectsData = JSON.parse(projectsDataRaw);
          Object.values(projectsData).forEach((project) => {
            if (Array.isArray(project.tasks)) {
              allTasks.push(...project.tasks);
            }
          });
        } catch (e) {
          console.error("Invalid projects_data:", e);
        }
      }

      const notifiedTasks = JSON.parse(
        localStorage.getItem("notified_tasks") || "[]"
      );

      allTasks.forEach((task) => {
        if (task.dueDate === now && !notifiedTasks.includes(task.id)) {
          showNotification("Task Due Today", `"${task.title}" is due today!`);

          // Mark this task as notified so we don't alert again
          localStorage.setItem(
            "notified_tasks",
            JSON.stringify([...notifiedTasks, task.id])
          );
        }
      });
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleToastClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setToastOpen(false);
  };

  if (todayTasks.length === 0) {
    return null;
  }

  return (
    <>
      <div
        onClick={handleOpen}
        style={{
          marginRight: 5,
          display: "flex",
          gap: 5,
          padding: "2px 8px 2px 8px",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "rgb(241 241 241)",
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
