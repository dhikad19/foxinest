import React, { useState, useEffect } from "react";
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

// Tiptap imports
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

// ✏️ Live inline editor that instantly updates section name

const LiveSectionEditor = ({ initialContent, onChange }) => {
  const [currentText, setCurrentText] = useState(initialContent);

  const editor = useEditor({
    extensions: [StarterKit],
    content: initialContent,
    editorProps: {
      attributes: {
        class: "inline-editor",
        style:
          "border: none; outline: none; font-size: 1.25rem; font-weight: bold;",
      },
      handleDOMEvents: {
        blur: () => {
          const trimmed = currentText.trim();
          if (trimmed !== initialContent && trimmed !== "") {
            onChange(trimmed);
          }
        },
      },
    },
    onUpdate: ({ editor }) => {
      const text = editor.getText();
      setCurrentText(text);
    },
  });

  // Keep in sync with external changes
  useEffect(() => {
    if (editor && initialContent !== editor.getText().trim()) {
      editor.commands.setContent(initialContent);
      setCurrentText(initialContent);
    }
  }, [initialContent]);

  if (!editor) return null;

  return <EditorContent editor={editor} />;
};

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
  onComplete,
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
              <LiveSectionEditor
                initialContent={category}
                onChange={(newName) => {
                  onEditSection(category, newName);
                }}
              />
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => toggleForm(category)}>
                  {openForms[category] ? "– Cancel" : "➕ Add Task"}
                </button>
                <button onClick={() => onDeleteSection(category)}>🗑️</button>
              </div>
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
                  onComplete={onComplete}
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
