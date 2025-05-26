import React, { useState, useEffect } from "react";
import { loadFromStorage, saveToStorage } from "../../utils/storage";
import TaskList from "../../components/Task/List";
import EditModal from "../../components/Modal/Edit";
import SearchBar from "../../components/Search";
import Snackbar from "../../components/Snackbar";

import { Button, TextField, Divider, Typography } from "@mui/material";

const Section = () => {
  const [tasks, setTasks] = useState([]);
  const [sections, setSections] = useState([]);
  const [editTask, setEditTask] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingSection, setEditingSection] = useState(null);
  const [newSectionName, setNewSectionName] = useState("");
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [taskToUndo, setTaskToUndo] = useState(null);
  const [prevTasksState, setPrevTasksState] = useState([]);

  useEffect(() => {
    const { tasks, sections } = loadFromStorage();
    setTasks(tasks);
    setSections(sections);
  }, []);

  useEffect(() => {
    if (tasks.length || sections.length) {
      saveToStorage(tasks, sections);
    }
  }, [tasks, sections]);

  const handleAddTask = (newTask) => {
    setTasks((prev) => [...prev, newTask]);
  };

  const handleAddSection = (name) => {
    setSections((prev) => [...prev, name]);
  };

  const handleDeleteTask = (id) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  const handleSaveEdit = (updated) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === updated.id ? updated : task))
    );
    setEditTask(null);
  };

  const handleDeleteSection = (name) => {
    setSections((prev) => prev.filter((sec) => sec !== name));
    setTasks((prev) => prev.filter((task) => task.category !== name));
  };

  const handleEditSection = (oldName, newName) => {
    setSections((prev) => prev.map((sec) => (sec === oldName ? newName : sec)));
    setTasks((prev) =>
      prev.map((task) =>
        task.category === oldName ? { ...task, category: newName } : task
      )
    );
    setEditingSection(null);
    setNewSectionName("");
  };

  const filteredSections = sections.filter((section) =>
    section.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Kemudian, buat tasksByCategory hanya dari filteredSections:
  const filteredTasksByCategory = filteredSections.reduce((acc, section) => {
    acc[section] = tasks.filter(
      (task) => task.category === section && !task.completed
    );
    return acc;
  }, {});

  const handleCompleteTask = (taskId) => {
    setTasks((prev) => {
      const updatedTasks = prev.map((task) => {
        if (task.id === taskId) {
          const updatedTask = { ...task, completed: !task.completed };

          if (!task.completed) {
            setPrevTasksState(prev);
            setSnackbarVisible(true);
            setTaskToUndo(updatedTask);
          }

          return updatedTask;
        }
        return task;
      });
      return updatedTasks;
    });
  };

  const handleEditTask = (updatedTask) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === updatedTask.id ? { ...task, ...updatedTask } : task
      )
    );
  };

  const filteredTasks = tasks.filter((task) =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const incompleteTasks = filteredTasks.filter((task) => !task.completed);
  const handleReorderTasks = (newList) => {
    setTasks(newList);
    saveToStorage(newList, sections);
  };

  const handleUndoComplete = () => {
    if (taskToUndo && prevTasksState.length > 0) {
      const updatedTasks = prevTasksState.map((task) => {
        if (task.id === taskToUndo.id) {
          return { ...task, completed: false };
        }
        return task;
      });

      setTasks(updatedTasks);
      saveToStorage(updatedTasks, sections);
      setSnackbarVisible(false);
      setTaskToUndo(null);
    }
  };

  const [inputValue, setInputValue] = useState("");
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const name = inputValue.trim();
    if (name && !sections.includes(name)) {
      handleAddSection(name);
      setInputValue("");
    }
  };

  return (
    <div
      style={{
        paddingLeft: "45px",
        paddingRight: "45px",
        maxWidth: "700px",
        margin: "0 auto",
        overflow: "visible",
        position: "relative",
      }}
    >
      <div style={{ paddingLeft: "3px", paddingRight: "3px" }}>
        <h2 style={{ marginBottom: "0px", marginTop: "10px" }}>Home</h2>
        <SearchBar query={searchQuery} setQuery={setSearchQuery} />
      </div>

      {!showForm ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            cursor: "pointer",
            userSelect: "none",
            marginBottom: 16,
            padding: 4,
            marginTop: 16,
          }}
          onClick={() => setShowForm(true)}
        >
          <Divider sx={{ flex: 1, borderColor: "#ff7800" }} />
          <span
            style={{ fontWeight: "bold", color: "#ff7800", fontSize: "15px" }}
          >
            Add Section
          </span>
          <Divider sx={{ flex: 1, borderColor: "#ff7800" }} />
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          style={{ gap: 8, marginTop: 10, marginBottom: 30, padding: 3 }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              userSelect: "none",
              marginBottom: 16,
              marginTop: 7,
            }}
          >
            <Divider sx={{ flex: 1, borderColor: "#ff7800" }} />
            <span
              style={{
                fontWeight: "bold",
                color: "#ff7800",
                fontSize: "15px",
              }}
            >
              Add new section
            </span>
            <Divider sx={{ flex: 1, borderColor: "#ff7800" }} />
          </div>
          <TextField
            fullWidth
            id="section"
            name="section"
            size="small"
            placeholder="New section name"
            value={inputValue}
            margin="none"
            onChange={(e) => setInputValue(e.target.value)}
            sx={{
              mb: 2,
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: "#ccc",
                },
                "&:hover fieldset": {
                  borderColor: "#ff7800",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#ff7800",
                },
              },
            }}
          />
          <div>
            <Button
              type="submit"
              variant="contained"
              sx={{
                backgroundColor: "#ff7800",
                "&:hover": { backgroundColor: "#ff871f" },
              }}
              disableElevation
              size="small"
              style={{
                textTransform: "capitalize",
                fontWeight: "bold",
                fontSize: "12px",
                marginRight: "6px",
              }}
              disabled={!inputValue.trim()}
            >
              Add Section
            </Button>
            <Button
              variant="text"
              size="small"
              sx={{
                color: "#000000",
                "&:hover": { backgroundColor: "#f0f0f0" },
              }}
              style={{
                textTransform: "capitalize",
                fontWeight: "bold",
                fontSize: "12px",
              }}
              onClick={() => {
                setShowForm(false);
                setInputValue("");
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}

      <TaskList
        tasksByCategory={filteredTasksByCategory}
        onDelete={handleDeleteTask}
        onEdit={handleEditTask}
        onEditSection={handleEditSection}
        onAdd={handleAddTask}
        onDeleteSection={handleDeleteSection}
        onReorderTasks={handleReorderTasks}
        onComplete={handleCompleteTask}
        editingSection={editingSection}
        setEditingSection={setEditingSection}
        newSectionName={newSectionName}
        setNewSectionName={setNewSectionName}
      />
      {editTask && (
        <EditModal
          task={editTask}
          onSave={handleSaveEdit}
          onClose={() => setEditTask(null)}
        />
      )}
      {snackbarVisible && <Snackbar onUndo={handleUndoComplete} />}
    </div>
  );
};

export default Section;
