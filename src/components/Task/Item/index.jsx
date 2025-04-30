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
} from "@mui/material";

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
  cursor: "grab",
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
      style={containerStyle(isDragging, transform, transition)}
    >
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        {/* Task Details */}
        <div
          style={{ flex: 1, display: "flex", height: "100%", marginTop: 10 }}
        >
          <div style={{ marginRight: 10 }}>
            <Checkbox
              checked={task.completed}
              onChange={() => onComplete(task.id)}
              style={{ marginLeft: -2 }}
              size="small"
              sx={{
                "&.Mui-checked": { color: "#ff7800" },
                p: 0,
              }}
            />
          </div>
          <div>
            <span style={{ fontWeight: "bold", fontSize: 15 }}>
              {task.title}
            </span>
            <div
              style={{ margin: 0, fontSize: 14 }}
              dangerouslySetInnerHTML={{ __html: task.description }}
            ></div>
            <p>
              <strong>Due:</strong> {task.dueDate || "—"} |{" "}
              <strong>Priority:</strong> {task.priority}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button onClick={() => onEdit(task)} aria-label="Edit task">
            ✏️
          </button>
          <button onClick={() => onDelete(task.id)} aria-label="Delete task">
            🗑️
          </button>

          {/* Comments Button */}
          <Button variant="outlined" size="small" onClick={handleOpenDialog}>
            💬 Comments
          </Button>

          <div
            ref={setActivatorNodeRef}
            {...attributes}
            {...listeners}
            title="Drag"
            style={{
              cursor: "grab",
              padding: "4px 8px",
              background: "#eee",
              borderRadius: 4,
              fontSize: 18,
            }}
            aria-label="Drag task"
          >
            ⠿
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
