import React, { useState, useEffect } from "react";
import { loadFromStorage, saveToStorage } from "../../utils/storage";
import TaskList from "../../components/Task/List";
import EditModal from "../../components/Modal/Edit";
import SearchBar from "../../components/Search";
import { ToastContainer, toast } from "react-toastify";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
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
    if (newTask.dueDate) {
      // Generate a unique ID for the task and event
      var uniqueId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Create a new event with the unique ID
      const newEvent = {
        id: uniqueId, // Assign unique ID to the event
        title: newTask.title,
        start: newTask.dueDate,
        end: newTask.dueDate,
        backgroundColor: "#00008b",
        textColor: "#fff",
        details: newTask,
      };

      // Retrieve existing events from localStorage
      const storedEvents = JSON.parse(
        localStorage.getItem("user_events") || "[]"
      );

      // Add the new event to the array and save to localStorage
      const updatedEvents = [...storedEvents, newEvent];
      localStorage.setItem("user_events", JSON.stringify(updatedEvents));
    }

    // Assign a unique ID to the task and update the tasks state
    setTasks((prev) => [
      ...prev,
      {
        ...newTask,
        id: uniqueId,
      },
    ]);
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
    const now = new Date();
    let updatedTask = null;

    const updatedTasks = tasks.map((task) => {
      if (task.id === taskId) {
        updatedTask = {
          ...task,
          completed: !task.completed,
          dateCompleted: !task.completed
            ? now.toISOString().split("T")[0]
            : null,
          timeCompleted: !task.completed
            ? `${now.getHours().toString().padStart(2, "0")}:${now
                .getMinutes()
                .toString()
                .padStart(2, "0")}`
            : null,
        };
        return updatedTask;
      }
      return task;
    });

    setTasks(updatedTasks);

    if (updatedTask && updatedTask.completed) {
      setPrevTasksState(tasks);
      setTaskToUndo(updatedTask);

      toast.info("Task marked as completed", {
        className: "custom-toast",
        progressClassName: "custom-toast-progress",
        icon: (
          <div>
            <InfoOutlinedIcon color="#ff7800" style={{ color: "#ff7800" }} />
          </div>
        ),
        position: "bottom-left",
        closeOnClick: true,
        pauseOnHover: true,
        autoClose: 6000,
        draggable: true,
      });
    }
  };

  const handleEditTask = (updatedTask) => {
    // Update the tasks in the state
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === updatedTask.id ? { ...task, ...updatedTask } : task
      )
    );

    // Update the corresponding event in localStorage
    const storedEvents = JSON.parse(
      localStorage.getItem("user_events") || "[]"
    );

    const updatedEvents = storedEvents.map((event) =>
      event.id === updatedTask.id
        ? {
            ...event,
            title: updatedTask.title,
            start: updatedTask.dueDate,
            end: updatedTask.dueDate,
            details: updatedTask,
          }
        : event
    );

    // Save updated events back to localStorage
    localStorage.setItem("user_events", JSON.stringify(updatedEvents));
  };

  // const handleEditTask = (updatedTask) => {
  //   setTasks((prevTasks) =>
  //     prevTasks.map((task) =>
  //       task.id === updatedTask.id ? { ...task, ...updatedTask } : task
  //     )
  //   );
  // };

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
        paddingTop: "60px",
        paddingLeft: "45px",
        paddingRight: "45px",
        maxWidth: "700px",
        margin: "0 auto",
        overflow: "visible",
        position: "relative",
      }}>
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
          onClick={() => setShowForm(true)}>
          <Divider sx={{ flex: 1, borderColor: "#ff7800" }} />
          <span
            style={{ fontWeight: "bold", color: "#ff7800", fontSize: "15px" }}>
            Add Section
          </span>
          <Divider sx={{ flex: 1, borderColor: "#ff7800" }} />
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          style={{ gap: 8, marginTop: 10, marginBottom: 30, padding: 3 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              userSelect: "none",
              marginBottom: 16,
              marginTop: 7,
            }}>
            <Divider sx={{ flex: 1, borderColor: "#ff7800" }} />
            <span
              style={{
                fontWeight: "bold",
                color: "#ff7800",
                fontSize: "15px",
              }}>
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
              disabled={!inputValue.trim()}>
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
              }}>
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
      {snackbarVisible && <ToastContainer />}
    </div>
  );
};

export default Section;
