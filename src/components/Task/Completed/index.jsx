import React from "react";
import TaskItem from "./Item";

const CompletedTaskList = ({
  completedTasks,
  onDeleteCompletedTask,
  onClearHistory,
}) => {
  return (
    <div>
      <h2>Completed Tasks (History)</h2>
      <button onClick={onClearHistory}>Clear History</button>
      <div>
        {completedTasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onDelete={onDeleteCompletedTask} // Only delete for completed tasks
            onEdit={() => {}}
            onComplete={() => {}}
          />
        ))}
      </div>
    </div>
  );
};

export default CompletedTaskList;
