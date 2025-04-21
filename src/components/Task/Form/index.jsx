import React, { useState, useEffect, useMemo } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Bold from "@tiptap/extension-bold";

const TaskForm = ({ onAdd, defaultCategory = "", onCancel }) => {
  const [form, setForm] = useState({
    title: "",
    dueDate: "",
    priority: "Medium",
    description: "",
    category: defaultCategory,
  });

  // Random placeholder list for title
  const randomPlaceholders = [
    "Write blog post ✍️",
    "Buy groceries 🛒",
    "Fix the bug 🐛",
    "Water the plants 🌱",
    "Call mom ❤️",
    "Finish side project 🚀",
    "Plan weekend trip 🗺️",
  ];

  const randomTitlePlaceholder = useMemo(() => {
    const index = Math.floor(Math.random() * randomPlaceholders.length);
    return randomPlaceholders[index];
  }, []);

  // Tiptap for title (light setup, single-line feel)
  const titleEditor = useEditor({
    extensions: [StarterKit, Bold], // DON'T disable paragraph
    content: "",
    editorProps: {
      attributes: {
        class: "title-editor",
      },
    },
    onCreate: ({ editor }) => {
      editor.chain().focus().setMark("bold").run();
    },
    onUpdate: ({ editor }) => {
      editor.chain().focus().setMark("bold").run();
      const text = editor.getText().trim();
      setForm((prev) => ({ ...prev, title: text }));
    },
  });

  // Tiptap for description
  const descriptionEditor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Description",
      }),
    ],
    content: "", // or "<p></p>" to make it valid
    onUpdate: ({ editor }) => {
      setForm((prev) => ({ ...prev, description: editor.getHTML() }));
    },
  });

  useEffect(() => {
    setForm((prev) => ({ ...prev, category: defaultCategory }));
  }, [defaultCategory]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.title.trim()) return;

    const newTask = {
      ...form,
      id: Date.now().toString(),
    };

    onAdd(newTask);

    // Reset form and editors
    setForm({
      title: "",
      dueDate: "",
      priority: "Medium",
      description: "",
      category: defaultCategory,
    });

    titleEditor?.commands.setContent("");
    descriptionEditor?.commands.setContent("");

    if (onCancel) onCancel();
  };

  return (
    <form onSubmit={handleSubmit} style={formStyles}>
      {/* Title (Tiptap) */}
      <div>
        <div style={editorBoxStyle}>
          <EditorContent
            className="tiptap-editor title-editor"
            editor={titleEditor}
          />
          {form.title === "" && (
            <div style={placeholderStyle}>{randomTitlePlaceholder}</div>
          )}
        </div>
      </div>

      {/* Description (Tiptap) */}
      <div style={{ marginBottom: "20px", marginTop: "3px" }}>
        <div style={editorBoxStyle}>
          <EditorContent
            className="tiptap-editor title-editor"
            editor={descriptionEditor}
          />
          {form.description === "" && (
            <div style={placeholderStyleDescription}>Description</div>
          )}
        </div>
      </div>

      {/* Due Date */}
      <input
        type="date"
        name="dueDate"
        value={form.dueDate}
        onChange={handleChange}
      />

      {/* Priority */}
      <select name="priority" value={form.priority} onChange={handleChange}>
        <option value="High">High 🔥</option>
        <option value="Medium">Medium ⚖️</option>
        <option value="Low">Low 🧊</option>
      </select>

      {/* Category */}
      <input
        type="text"
        name="category"
        placeholder="Category"
        value={form.category}
        onChange={handleChange}
      />

      {/* Buttons */}
      <div style={{ display: "flex", gap: 10 }}>
        <button type="submit">➕ Add Task</button>
        {onCancel && (
          <button type="button" onClick={onCancel}>
            ❌ Cancel
          </button>
        )}
      </div>
    </form>
  );
};

// Styles
const formStyles = {
  display: "flex",
  marginTop: "30px",
  flexDirection: "column",
};

const editorBoxStyle = {
  minHeight: "20px",
  position: "relative",
};

const placeholderStyle = {
  position: "absolute",
  top: 0,
  left: 0,
  color: "#aaa",
  fontSize: "17px",
  fontWeight: 600,
  pointerEvents: "none",
};

const placeholderStyleDescription = {
  position: "absolute",
  top: 0,
  left: 0,
  color: "#aaa",
  fontSize: "15px",
  pointerEvents: "none",
};

export default TaskForm;
