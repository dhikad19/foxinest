import React from "react";
import CompletedTaskItem from "./Item"; // Adjust path if needed

const CompletedTaskList = ({
  completedTasks,
  onDeleteCompletedTask,
  onClearHistory,
}) => {
  return (
    <div style={{ marginTop: 30 }}>
      <h2>Completed Tasks (History)</h2>

      <button
        onClick={onClearHistory}
        style={{
          background: "#e53935",
          color: "white",
          border: "none",
          padding: "6px 12px",
          borderRadius: "4px",
          marginBottom: 10,
          cursor: "pointer",
        }}
      >
        Clear History
      </button>

      <div>
        {completedTasks.length === 0 ? (
          <p style={{ fontStyle: "italic", color: "#777" }}>
            No completed tasks yet.
          </p>
        ) : (
          completedTasks.map((task) => (
            <CompletedTaskItem
              key={task.id}
              task={task}
              onDelete={onDeleteCompletedTask}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default CompletedTaskList;
