import React, { useState, useEffect } from "react";
import { loadFromStorage, saveToStorage } from "../../utils/storage";
import TaskList from "../../components/Task/List";
import EditModal from "../../components/Modal/Edit";
import SearchBar from "../../components/Search";
import Snackbar from "../../components/Snackbar"; // Import Snackbar component

import { Button, TextField, Divider } from "@mui/material";

const Section = () => {
  const [tasks, setTasks] = useState([]);
  const [sections, setSections] = useState([]);
  const [editTask, setEditTask] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingSection, setEditingSection] = useState(null);
  const [newSectionName, setNewSectionName] = useState("");
  const [snackbarVisible, setSnackbarVisible] = useState(false); // Control Snackbar visibility
  const [taskToUndo, setTaskToUndo] = useState(null); // Store task to undo
  const [prevTasksState, setPrevTasksState] = useState([]); // Store previous tasks state for undo

  // Load tasks and sections on first render
  useEffect(() => {
    const { tasks, sections } = loadFromStorage(); // Load data from localStorage
    setTasks(tasks);
    setSections(sections);
  }, []);

  // Save tasks and sections to storage whenever they change
  useEffect(() => {
    if (tasks.length || sections.length) {
      saveToStorage(tasks, sections); // Save the tasks and sections
    }
  }, [tasks, sections]);

  // Add task
  const handleAddTask = (newTask) => {
    setTasks((prev) => [...prev, newTask]);
  };

  // Add section
  const handleAddSection = (name) => {
    setSections((prev) => [...prev, name]);
  };

  // Delete task
  const handleDeleteTask = (id) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  // Save edited task
  const handleSaveEdit = (updated) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === updated.id ? updated : task))
    );
    setEditTask(null);
  };

  // Delete section and its tasks
  const handleDeleteSection = (name) => {
    setSections((prev) => prev.filter((sec) => sec !== name));
    setTasks((prev) => prev.filter((task) => task.category !== name));
  };

  // Edit section name
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

  // Toggle task completion
  const handleCompleteTask = (taskId) => {
    setTasks((prev) => {
      const updatedTasks = prev.map((task) => {
        if (task.id === taskId) {
          const updatedTask = { ...task, completed: !task.completed };

          // If task is being completed, save the current state before change
          if (!task.completed) {
            // Save current tasks state for undo
            setPrevTasksState(prev);
            setSnackbarVisible(true);
            setTaskToUndo(updatedTask); // Set the task to undo
          }

          return updatedTask;
        }
        return task;
      });
      return updatedTasks;
    });
  };

  // Clear completed tasks (history)
  const handleClearHistory = () => {
    setTasks((prev) => {
      const remainingTasks = prev.filter((task) => !task.completed);
      saveToStorage(remainingTasks, sections);
      return remainingTasks;
    });
  };

  // Delete completed task
  const handleDeleteCompletedTask = (id) => {
    setTasks((prevTasks) => {
      const updatedTasks = prevTasks.filter((task) => task.id !== id);
      saveToStorage(updatedTasks, sections);
      return updatedTasks;
    });
  };

  // Filter tasks based on search query
  const filteredTasks = tasks.filter((task) =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Separate completed and non-completed tasks
  const incompleteTasks = filteredTasks.filter((task) => !task.completed);
  const completedTasks = filteredTasks.filter((task) => task.completed);

  // Reorder tasks
  const handleReorderTasks = (newList) => {
    setTasks(newList);
    saveToStorage(newList, sections);
  };

  // Undo task completion
  const handleUndoComplete = () => {
    if (taskToUndo && prevTasksState.length > 0) {
      const updatedTasks = prevTasksState.map((task) => {
        if (task.id === taskToUndo.id) {
          return { ...task, completed: false }; // Undo the completion by marking it as incomplete
        }
        return task;
      });

      // Update tasks state and localStorage
      setTasks(updatedTasks);
      saveToStorage(updatedTasks, sections);

      // Hide the snackbar after undoing
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
        overflow: "visible" /* 👈 allows dragged item to be seen outside */,
        position: "relative",
      }}
    >
      <h1>📋 To-Do List with Sections</h1>

      <SearchBar query={searchQuery} setQuery={setSearchQuery} />

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
          style={{ gap: 8, marginTop: 10, marginBottom: 30, padding: 4 }}
        >
          <TextField
            fullWidth
            id="section"
            name="section"
            size="small"
            placeholder="New section name"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <div style={{ marginTop: "8px" }}>
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

      {/* Non-Completed Tasks */}
      <TaskList
        tasksByCategory={sections.reduce((acc, section) => {
          acc[section] = incompleteTasks.filter(
            (task) => task.category === section
          );
          return acc;
        }, {})}
        onDelete={handleDeleteTask}
        onEdit={(task) => setEditTask(task)}
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

      {/* Completed Tasks (History) */}
      {/* <CompletedTaskList
        completedTasks={completedTasks}
        onClearHistory={handleClearHistory}
        onDeleteCompletedTask={handleDeleteCompletedTask}
      /> */}

      {editTask && (
        <EditModal
          task={editTask}
          onSave={handleSaveEdit}
          onClose={() => setEditTask(null)}
        />
      )}

      {/* Snackbar for undo task completion */}
      {snackbarVisible && <Snackbar onUndo={handleUndoComplete} />}
    </div>
  );
};

export default Section;
