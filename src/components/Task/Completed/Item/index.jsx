import React from "react";

const CompletedTaskItem = ({ task, onDelete }) => {
  return (
    <div
      style={{
        background: "#f9f9f9",
        border: "1px solid #ddd",
        borderRadius: 8,
        padding: 15,
        marginBottom: 10,
        display: "flex",
        justifyContent: "space-between",
        gap: 10,
        alignItems: "center",
      }}
    >
      <div style={{ flex: 1 }}>
        <h4>{task.title}</h4>
        <p>
          <strong>Due:</strong> {task.dueDate || "—"} |{" "}
          <strong>Priority:</strong> {task.priority}
        </p>
        <p>{task.description}</p>
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <button
          onClick={() => onDelete(task.id)}
          style={{
            background: "red",
            color: "white",
            border: "none",
            padding: "5px 10px",
            borderRadius: "4px",
          }}
        >
          🗑️
        </button>
      </div>
    </div>
  );
};

export default CompletedTaskItem;
