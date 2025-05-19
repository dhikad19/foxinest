import React from "react";
import CompletedTaskItem from "../Item"; // Adjust path if needed

const CompletedTaskList = ({ tasks, onDelete }) => {
  return (
    <>
      {tasks.length > 0 ? (
        tasks.map((task) => (
          <CompletedTaskItem key={task.id} task={task} onDelete={onDelete} />
        ))
      ) : (
        <p>No completed tasks found.</p>
      )}
    </>
  );
};

export default CompletedTaskList;
