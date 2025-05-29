// App.jsx
import React, { useEffect, useState } from "react";
import ListAltIcon from "@mui/icons-material/ListAlt";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemText,
  Typography,
  Badge,
} from "@mui/material";

function TodayTasksButton() {
  const [todayTasks, setTodayTasks] = useState([]);
  const [open, setOpen] = useState(false);

  const getTodayDateString = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const loadTasksFromLocalStorage = () => {
    const todayDate = getTodayDateString();
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

    const todayTasks = allTasks.filter((task) => task.dueDate === todayDate);
    setTodayTasks(todayTasks);
  };

  useEffect(() => {
    loadTasksFromLocalStorage();
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  // ⛔ Jangan render tombol jika tidak ada task
  if (todayTasks.length === 0) {
    return null;
  }

  return (
    <div style={{ padding: 16 }}>
      <Badge badgeContent={todayTasks.length} color="primary">
        <div
          onClick={handleOpen}
          style={{
            display: "flex",
            gap: 5,
            padding: "2px 8px 2px 8px",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgb(241 241 241)",

            borderRadius: 2,
          }}>
          <ListAltIcon style={{ fontSize: 15 }} />
        </div>
      </Badge>

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>Today's Tasks</DialogTitle>
        <DialogContent>
          <List>
            {todayTasks.map((task) => (
              <ListItem key={task.id} divider>
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
    </div>
  );
}

export default TodayTasksButton;
