import React, { useState, useEffect } from "react";

const TaskForm = ({ onAdd, defaultCategory = "", onCancel }) => {
  const [form, setForm] = useState({
    title: "",
    dueDate: "",
    priority: "Medium",
    description: "",
    category: defaultCategory,
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

    setForm({
      title: "",
      dueDate: "",
      priority: "Medium",
      description: "",
      category: defaultCategory,
    });

    if (onCancel) onCancel();
  };

  return (
    <form onSubmit={handleSubmit} style={formStyles}>
      <input
        type="text"
        name="title"
        placeholder="Task title"
        value={form.title}
        onChange={handleChange}
        required
      />
      <input
        type="date"
        name="dueDate"
        value={form.dueDate}
        onChange={handleChange}
      />
      <select name="priority" value={form.priority} onChange={handleChange}>
        <option value="High">High 🔥</option>
        <option value="Medium">Medium ⚖️</option>
        <option value="Low">Low 🧊</option>
      </select>
      <input
        type="text"
        name="category"
        placeholder="Category"
        value={form.category}
        onChange={handleChange}
      />
      <textarea
        name="description"
        placeholder="Task description"
        value={form.description}
        onChange={handleChange}
        rows={3}
      />
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

const formStyles = {
  display: "flex",
  flexDirection: "column",
  gap: "10px",
  marginTop: "10px",
};

export default TaskForm;
