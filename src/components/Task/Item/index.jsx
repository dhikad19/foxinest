import React, { useState, useEffect } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Divider,
  Checkbox,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  List,
  ListItem,
  ListItemText,
  Menu,
  MenuItem,
} from "@mui/material";
import CommentsIcon from "@mui/icons-material/ChatBubbleOutline";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import EditIcon from "@mui/icons-material/EditOutlined";
import DragIcon from "@mui/icons-material/DragIndicator";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import DateIcon from "@mui/icons-material/DateRangeOutlined";

// Styles
const containerStyle = (isDragging, transform, transition) => ({
  transform: CSS.Transform.toString(transform),
  transition,
  background: "#fff",
  marginBottom: 10,
  borderRadius: 4,
  display: "flex",
  flexDirection: "column",
  gap: 8,
  boxShadow: isDragging ? "0 2px 6px rgba(0, 0, 0, 0.1)" : "none",
  touchAction: "none",
  zIndex: isDragging ? 9999 : "auto",
  position: isDragging ? "relative" : "static",
});

const TaskItem = ({ task, onDelete, onEdit, onComplete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    setActivatorNodeRef,
    isDragging,
  } = useSortable({ id: task.id });

  // State for managing comments dialog and input
  const [openDialog, setOpenDialog] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState([]);

  // Load comments from localStorage when the component mounts
  useEffect(() => {
    const storedComments = JSON.parse(
      localStorage.getItem(`task_${task.id}_comments`)
    );
    if (storedComments) {
      setComments(storedComments);
    }
  }, [task.id]);

  // Function to open the comments dialog
  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  // Function to close the comments dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const [menuAnchor, setMenuAnchor] = useState(null);

  const handleMenuOpen = (event) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  // Function to add a new comment
  const handleAddComment = () => {
    if (newComment.trim()) {
      const newCommentObj = {
        text: newComment,
        date: new Date().toLocaleString(), // Date when the comment was created
      };
      const updatedComments = [...comments, newCommentObj];
      setComments(updatedComments);
      localStorage.setItem(
        `task_${task.id}_comments`,
        JSON.stringify(updatedComments)
      ); // Save to localStorage
      setNewComment(""); // Clear the comment input
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={containerStyle(isDragging, transform, transition)}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        {/* Task Details */}
        <div
          style={{ flex: 1, display: "flex", height: "100%", marginTop: 10 }}>
          <div style={{ marginRight: 10 }}>
            <Checkbox
              checked={task.completed}
              onChange={() => onComplete(task.id)}
              style={{ marginLeft: -2, marginTop: -9 }}
              size="small"
              sx={{
                "& .MuiSvgIcon-root": {
                  color:
                    task.priority === "High"
                      ? "#ff77009d"
                      : task.priority === "Medium"
                      ? "#4f4f4f9f"
                      : task.priority === "Low"
                      ? "#1f50ff93"
                      : "black", // Default color for unchecked state
                },
                "&.Mui-checked .MuiSvgIcon-root": {
                  color:
                    task.priority === "High"
                      ? "#ff77009d"
                      : task.priority === "Medium"
                      ? "#4f4f4f9f"
                      : task.priority === "Low"
                      ? "#1f50ff93"
                      : "black", // Same color for checked state
                },
                p: 0,
              }}
            />
          </div>
          <div style={{ width: "100%" }}>
            <div
              style={{
                width: "100%",
                alignItems: "start",
                display: "flex",
                flexDirection: "column",
              }}>
              <span
                style={{
                  fontWeight: "bold",
                  fontSize: 15,
                  maxWidth: "93%",
                  display: "-webkit-box",
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  wordBreak: "break-word",
                  whiteSpace: "normal",
                  lineHeight: "normal",
                  marginBottom: "3px",
                }}>
                {task.title}
              </span>
            </div>

            <div
              style={{
                margin: 0,
                fontSize: 14,
                maxWidth: "93%",
                display: "-webkit-box",
                WebkitLineClamp: 1,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "normal",
                wordBreak: "break-word",
              }}
              dangerouslySetInnerHTML={{ __html: task.description }}></div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
              }}>
              {/* Due Date */}
              {/* Due Date and Comment Count */}
              {(task.dueDate || comments.length > 0) && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    marginTop: "5px",
                  }}>
                  {/* Due Date */}
                  {task.dueDate && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        marginTop: 5,
                      }}>
                      <DateIcon style={{ fontSize: "14px", color: "grey" }} />
                      <p
                        style={{
                          fontSize: "13px",
                          color: "grey",
                          marginLeft: "5px",
                        }}>
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
                  )}

                  {/* Comment Count */}
                  {comments.length > 0 && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        cursor: "pointer",
                        marginTop: 5,
                      }}
                      onClick={handleOpenDialog}
                      title="View comments">
                      <CommentsIcon
                        style={{
                          fontSize: "14px",
                          color: "grey",
                          marginLeft: 6,
                        }}
                      />
                      <p
                        style={{
                          fontSize: "13px",
                          color: "grey",
                          marginLeft: "5px",
                        }}>
                        {comments.length}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Priority */}
            </div>
          </div>
        </div>
        {/* Action Buttons */}

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {/* Action Menu Trigger */}
          <MoreVertIcon
            style={{ fontSize: "20px", cursor: "pointer" }}
            onClick={handleMenuOpen}
          />

          {/* Action Menu */}
          <Menu
            anchorEl={menuAnchor}
            open={Boolean(menuAnchor)}
            MenuListProps={{ sx: { py: 0 } }}
            onClose={handleMenuClose}>
            <MenuItem
              onClick={() => {
                onEdit(task);
                handleMenuClose();
              }}>
              <EditIcon style={{ fontSize: "19px", marginRight: 12 }} />{" "}
              <p style={{ fontSize: "13px" }}>Edit</p>
            </MenuItem>
            <MenuItem
              onClick={() => {
                onDelete(task.id);
                handleMenuClose();
              }}>
              <DeleteIcon style={{ fontSize: "19px", marginRight: 12 }} />{" "}
              <p style={{ fontSize: "13px" }}>Delete</p>
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleOpenDialog();
                handleMenuClose();
              }}>
              <CommentsIcon
                style={{ fontSize: "17px", marginRight: 12, marginLeft: 2 }}
              />{" "}
              <p style={{ fontSize: "13px" }}>Comments</p>
            </MenuItem>
          </Menu>

          {/* Drag Handle */}
          <div
            ref={setActivatorNodeRef}
            {...attributes}
            {...listeners}
            title="Drag"
            style={{
              cursor: "grab",
              padding: "4px 4px 0px 4px",
              background: "#eee",
              borderRadius: 4,
            }}
            aria-label="Drag task">
            <DragIcon style={{ fontSize: "18px" }} />
          </div>
        </div>
      </div>

      {!isDragging && <Divider />}

      {/* Dialog for Comments */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Comments</DialogTitle>
        <DialogContent>
          <List>
            {comments.map((comment, index) => (
              <ListItem key={index}>
                <ListItemText
                  primary={comment.text}
                  secondary={`Posted on: ${comment.date}`}
                />
              </ListItem>
            ))}
          </List>
          <TextField
            label="Add a comment"
            fullWidth
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            multiline
            rows={3}
            variant="outlined"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Close
          </Button>
          <Button onClick={handleAddComment} color="primary">
            Add Comment
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default TaskItem;
