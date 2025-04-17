import React, { useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import TaskItem from "../Item";
import TaskForm from "../Form";

const TaskList = ({
  tasksByCategory,
  onDelete,
  onEdit,
  onAdd,
  onDeleteSection,
  onEditSection,
  editingSection,
  setEditingSection,
  newSectionName,
  setNewSectionName,
  onReorderTasks,
  onComplete, // New prop for handling task completion
}) => {
  const [openForms, setOpenForms] = useState({});
  const sensors = useSensors(useSensor(PointerSensor));

  const toggleForm = (category) => {
    setOpenForms((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    for (const [section, tasks] of Object.entries(tasksByCategory)) {
      const ids = tasks.map((t) => t.id);
      if (ids.includes(active.id) && ids.includes(over.id)) {
        const oldIndex = ids.indexOf(active.id);
        const newIndex = ids.indexOf(over.id);
        const reordered = arrayMove(tasks, oldIndex, newIndex);

        const allTasks = Object.entries(tasksByCategory).flatMap(
          ([cat, tList]) => (cat === section ? reordered : tList)
        );

        onReorderTasks(allTasks);
        return;
      }
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div>
        {Object.entries(tasksByCategory).map(([category, tasks]) => (
          <div
            key={category}
            style={{
              marginBottom: "2rem",
              border: "1px solid #eee",
              padding: 16,
              borderRadius: 8,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              {editingSection === category ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    onEditSection(category, newSectionName);
                  }}
                  style={{ display: "flex", gap: 8 }}
                >
                  <input
                    value={newSectionName}
                    onChange={(e) => setNewSectionName(e.target.value)}
                    autoFocus
                  />
                  <button type="submit">✅</button>
                  <button type="button" onClick={() => setEditingSection(null)}>
                    ❌
                  </button>
                </form>
              ) : (
                <>
                  <h3>{category}</h3>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={() => {
                        setEditingSection(category);
                        setNewSectionName(category);
                      }}
                    >
                      ✏️
                    </button>
                    <button onClick={() => toggleForm(category)}>
                      {openForms[category] ? "– Cancel" : "➕ Add Task"}
                    </button>
                    <button onClick={() => onDeleteSection(category)}>
                      🗑️
                    </button>
                  </div>
                </>
              )}
            </div>

            <SortableContext
              items={tasks.map((t) => t.id)}
              strategy={verticalListSortingStrategy}
            >
              {tasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onDelete={onDelete}
                  onEdit={onEdit}
                  onComplete={onComplete} // Pass onComplete handler here
                />
              ))}
            </SortableContext>

            {openForms[category] && (
              <TaskForm
                onAdd={(task) => {
                  onAdd(task);
                  toggleForm(category);
                }}
                defaultCategory={category}
                onCancel={() => toggleForm(category)}
              />
            )}
          </div>
        ))}
      </div>
    </DndContext>
  );
};

export default TaskList;
