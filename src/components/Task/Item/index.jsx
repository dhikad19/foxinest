import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Divider, Checkbox } from "@mui/material";

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
    </div>
  );
};

export default TaskItem;
