import React, { useState, useMemo } from "react";
import dayjs from "dayjs";
import { Button, Divider, IconButton, Menu, MenuItem } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import DateIcon from "@mui/icons-material/DateRangeOutlined";
import MoreHorizOutlinedIcon from "@mui/icons-material/MoreHorizOutlined";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";

const CompletedTaskItem = ({ task, onDelete }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const menuOpen = Boolean(anchorEl);

  // Get project name by task.id from localStorage
  const projectName = useMemo(() => {
    const projects = JSON.parse(localStorage.getItem("projects")) || [];
    const match = projects.find((p) => p.id === task.projectId);
    return match ? match.name : task.projectId;
  }, [task.projectId]);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDelete = () => {
    onDelete(task.id);
    handleMenuClose();
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "start",
          marginTop: 15,
          marginBottom: 15,
        }}
      >
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 15 }}>{task.title}</p>
          <p dangerouslySetInnerHTML={{ __html: task.description }} />
          {/* Show source path */}
          <p>
            {task.source === "home_projects_data"
              ? `Home/${task.category}`
              : `My Projects/${projectName.replaceAll("-", " ")}/${
                  task.category
                }`}
          </p>
          {/* Due date and priority */}
          {task.dueDate && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginTop: 5,
              }}
            >
              <DateIcon style={{ fontSize: "14px", color: "grey" }} />
              <p
                style={{
                  fontSize: "13px",
                  color: "grey",
                  marginLeft: "5px",
                }}
              >
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
                  return new Intl.DateTimeFormat("en-GB", options).format(
                    dueDate
                  );
                })()}
              </p>
            </div>
          )}
          <strong>Priority:</strong> {task.priority}
          <p style={{ margin: "5px 0", fontSize: "14px", color: "#555" }}>
            <strong>Completed on:</strong>{" "}
            {task.dateCompleted ? (
              <>
                {task.dateCompleted} at {task.timeCompleted}
              </>
            ) : (
              "N/A"
            )}
          </p>
        </div>

        <MoreHorizOutlinedIcon
          style={{ fontSize: "20px", cursor: "pointer" }}
          onClick={handleMenuOpen}
        />
        <Menu anchorEl={anchorEl} open={menuOpen} onClose={handleMenuClose}>
          <MenuItem style={{ fontSize: 14 }} onClick={handleDelete}>
            <DeleteIcon style={{ fontSize: "19px", marginRight: 12 }} />{" "}
            <p style={{ fontSize: "13px" }}>Delete</p>
          </MenuItem>
        </Menu>
      </div>
      <Divider />
    </div>
  );
};

export default CompletedTaskItem;
