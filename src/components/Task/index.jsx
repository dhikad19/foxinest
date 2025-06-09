// App.jsx
import React, { useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const TodoItem = ({ item }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    backgroundColor: "#fefefe",
    border: "1px solid #ddd",
    borderRadius: 8,
    padding: "15px",
    marginBottom: "10px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "10px",
  };

  const handleStyle = {
    cursor: "grab",
    fontSize: "20px",
    padding: "4px 8px",
    borderRadius: "4px",
    backgroundColor: "#eee",
  };

  const contentStyle = {
    flex: 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <div style={contentStyle}>
        <h3 style={{ margin: 0 }}>{item.title}</h3>
        <p style={{ margin: "4px 0" }}>
          <strong>Due:</strong> {item.dueDate}
        </p>
        <p style={{ margin: "4px 0" }}>
          <strong>Priority:</strong> {item.priority}
        </p>
        <p style={{ margin: "8px 0 0", fontSize: "0.95em" }}>
          {item.description}
        </p>
      </div>
      <div
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
        style={handleStyle}
        title="Drag to reorder"
      >
        ⠿
      </div>
    </div>
  );
};

const App = () => {
  const [tasks, setTasks] = useState([]);

  const [form, setForm] = useState({
    title: "",
    dueDate: "",
    priority: "Medium",
    description: "",
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = tasks.findIndex((task) => task.id === active.id);
      const newIndex = tasks.findIndex((task) => task.id === over.id);
      setTasks((tasks) => arrayMove(tasks, oldIndex, newIndex));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;

    const newTask = {
      ...form,
      id: Date.now().toString(), // unique-ish ID
    };

    setTasks((prev) => [...prev, newTask]);
    setForm({ title: "", dueDate: "", priority: "Medium", description: "" });
  };

  return (
    <div style={{ maxWidth: 600, margin: "2rem auto", padding: "1rem" }}>
      <h2 style={{ textAlign: "center" }}>📝 To-Do List (Sortable)</h2>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        style={{ marginBottom: "2rem", display: "grid", gap: "10px" }}
      >
        <input
          type="text"
          name="title"
          placeholder="Title (required)"
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
        <textarea
          name="description"
          placeholder="Description"
          rows="3"
          value={form.description}
          onChange={handleChange}
        />
        <button type="submit">➕ Add Task</button>
      </form>

      {/* List */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <TodoItem key={task.id} item={task} />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
};

export default App;
