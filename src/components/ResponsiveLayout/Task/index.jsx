import React, { useEffect, useState } from "react";
import PendingActionsOutlinedIcon from "@mui/icons-material/PendingActionsOutlined";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemText,
  Typography,
  Snackbar,
  Divider,
  useTheme,
  Alert,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import useMediaQuery from "@mui/material/useMediaQuery";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import NotificationImportantIcon from "@mui/icons-material/NotificationImportant";
import RunningWithErrorsOutlinedIcon from "@mui/icons-material/RunningWithErrorsOutlined";
import TimerOutlinedIcon from "@mui/icons-material/TimerOutlined";
import { toast } from "react-toastify";

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

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const loadTasksFromLocalStorage = () => {
    const todayDate = getTodayDateString();
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
      (task) => task.dueDate === todayDate || task.dueDate === tomorrowDate
    );

    setTodayTasks(filteredTasks);
    const lastToastTime = localStorage.getItem("lastToastTime");
    const currentTime = Date.now();

    if (filteredTasks.length > 0) {
      if (!lastToastTime || currentTime - lastToastTime > 3600000) {
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
        setTimeout(() => {
          localStorage.setItem("lastToastTime", currentTime.toString());
        }, 100);
      }
    }
  };

  useEffect(() => {
    // Load tasks from localStorage and check for toast on mount
    loadTasksFromLocalStorage();
  }, []); // Empty dependency array ensures this only runs once on mount

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleToastClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setToastOpen(false);
  };

  // Tidak render tombol jika tidak ada tugas
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
            style={{ padding: "12px 24px", marginTop: 5 }}
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
                <ListItemText
                  primary={task.title}
                  secondary={
                    <>
                      <div
                        dangerouslySetInnerHTML={{
                          __html: task.description || "",
                        }}
                      />
                      <Typography variant="caption">
                        Category: {task.category}
                      </Typography>
                    </>
                  }
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default TodayTasksButton;
