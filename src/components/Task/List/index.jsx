import React, { useState, useEffect } from "react"; // Import useEffect here
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  DragOverlay,
  useSensors,
} from "@dnd-kit/core";
import { Divider } from "@mui/material";
import {
  restrictToVerticalAxis,
  restrictToHorizontalAxis,
} from "@dnd-kit/modifiers";
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

// React-icons for the arrow
import { FaChevronDown, FaChevronRight } from "react-icons/fa";

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
          "border: none; outline: none; font-size: 15px; font-weight: bold;",
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
  const [expandedSections, setExpandedSections] = useState({});
  const [activeTask, setActiveTask] = useState(null);
  const sensors = useSensors(useSensor(PointerSensor));

  const toggleForm = (category) => {
    setOpenForms((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const toggleExpand = (category) => {
    setExpandedSections((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const handleDragStart = (event) => {
    const { active } = event;
    const allTasks = Object.values(tasksByCategory).flat();
    const task = allTasks.find((t) => t.id === active.id);
    if (task) {
      setActiveTask(task);
    }
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

  useEffect(() => {
    if (tasksByCategory && Object.keys(tasksByCategory).length > 0) {
      setExpandedSections((prev) => {
        const updated = { ...prev };
        for (const key of Object.keys(tasksByCategory)) {
          if (updated[key] === undefined) {
            updated[key] = true; // default to expanded
          }
        }
        return updated;
      });
    }
  }, [tasksByCategory]);

  return (
    <DndContext
      modifiers={[restrictToVerticalAxis]}
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div>
        {Object.entries(tasksByCategory).map(([category, tasks]) => (
          <div
            key={category}
            style={{
              marginBottom: "1rem",
              borderRadius: 8,
              padding: 4,
            }}
          >
            {/* Section Header with Expand/Collapse Button */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                userSelect: "none",
                marginBottom: 10,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <div
                  onClick={() => toggleExpand(category)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginLeft: -30,
                  }}
                >
                  {/* Toggle Arrow Icon */}
                  {expandedSections[category] ? (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        cursor: "pointer",
                        marginRight: 8,
                        borderRadius: 4,
                        height: 22,
                        width: 22,
                        backgroundColor: "#fafafa",
                      }}
                    >
                      <FaChevronDown size={10} color="grey" />
                    </div>
                  ) : (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        cursor: "pointer",
                        marginRight: 8,
                        borderRadius: 4,
                        height: 22,
                        width: 22,
                        backgroundColor: "#fafafa",
                      }}
                    >
                      <FaChevronRight size={10} color="grey" />
                    </div>
                  )}
                </div>
                <LiveSectionEditor
                  initialContent={category}
                  onChange={(newName) => {
                    onEditSection(category, newName);
                  }}
                />
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => onDeleteSection(category)}>
                  Delete
                </button>
              </div>
            </div>
            <Divider></Divider>
            <div
              style={{
                overflow: "hidden",
                paddingLeft: 4,
                paddingRight: 4,
                maxHeight: expandedSections[category] ? "100%" : "0",
              }}
            >
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

              {!openForms[category] && (
                <button onClick={() => toggleForm(category)}>
                  {openForms[category] ? "– Cancel" : "➕ Add Task"}
                </button>
              )}

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
          </div>
        ))}
      </div>
    </DndContext>
  );
};

export default TaskList;
