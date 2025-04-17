import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const TaskItem = ({ task, onDelete, onEdit, onComplete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    background: "#fff",
    border: "1px solid #ddd",
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    display: "flex",
    justifyContent: "space-between",
    gap: 10,
    alignItems: "center",
  };

  return (
    <div ref={setNodeRef} style={style}>
      <div style={{ flex: 1 }}>
        <h4>{task.title}</h4>
        <p>
          <strong>Due:</strong> {task.dueDate || "—"} |{" "}
          <strong>Priority:</strong> {task.priority}
        </p>
        <p>{task.description}</p>
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <button onClick={() => onEdit(task)}>✏️</button>
        <button onClick={() => onDelete(task.id)}>🗑️</button>
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
        >
          ⠿
        </div>
        {/* Checkbox for task completion */}
        <input
          type="checkbox"
          checked={task.completed}
          onChange={() => onComplete(task.id)} // Toggle completion status on change
        />
      </div>
    </div>
  );
};

export default TaskItem;
