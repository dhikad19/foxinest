import React from "react";
import CompletedTaskItem from "../Item";

const CompletedTaskList = ({ tasks, onDelete, onComplete }) => {
  return (
    <>
      {tasks.length > 0 ? (
        tasks.map((task) => (
          <CompletedTaskItem
            key={task.id}
            onComplete={onComplete}
            task={task}
            onDelete={onDelete}
          />
        ))
      ) : (
        <p>No completed tasks found.</p>
      )}
    </>
  );
};

export default CompletedTaskList;
