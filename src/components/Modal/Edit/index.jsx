import React, { useState, useEffect } from "react";

const EditModal = ({ task, onSave, onClose }) => {
  const [form, setForm] = useState(task);

  useEffect(() => {
    setForm(task);
  }, [task]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
    onClose();
  };

  return (
    <div style={modalBackdrop}>
      <form onSubmit={handleSubmit} style={modalContent}>
        <h3>Edit Task</h3>
        <input
          name="title"
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
        <input name="category" value={form.category} onChange={handleChange} />
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
        />
        <div style={{ marginTop: 10 }}>
          <button type="submit">💾 Save</button>
          <button type="button" onClick={onClose} style={{ marginLeft: 10 }}>
            ❌ Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

const modalBackdrop = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0,0,0,0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const modalContent = {
  background: "#fff",
  padding: 20,
  borderRadius: 8,
  minWidth: 300,
  display: "flex",
  flexDirection: "column",
  gap: 10,
};

export default EditModal;
