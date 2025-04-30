import React, { useEffect, useState } from "react";
import CompletedTaskList from "./List";
import {
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  TextField,
} from "@mui/material";

const CompletedSection = () => {
  const [completedTasks, setCompletedTasks] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("newest");

  // Function to handle sorting
  const sortTasks = (tasks) => {
    switch (sortOption) {
      case "alphabetical":
        return tasks.sort((a, b) => a.title.localeCompare(b.title));
      case "dueDate":
        return tasks.sort(
          (a, b) => new Date(b.dueDate || 0) - new Date(a.dueDate || 0)
        );
      case "newest":
      default:
        return tasks.sort((a, b) => b.id - a.id); // Sort by newest (id assumed to be timestamp)
    }
  };

  // Function to handle filtering by search
  const filterTasks = (tasks) => {
    if (!searchQuery) return tasks;
    return tasks.filter((task) =>
      task.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  useEffect(() => {
    const combinedCompletedTasks = [];

    // Get from `projects_data`
    const projectsRaw = localStorage.getItem("projects_data");
    if (projectsRaw) {
      const projects = JSON.parse(projectsRaw);
      if (projects && typeof projects === "object") {
        Object.entries(projects).forEach(([projectId, project]) => {
          if (project.tasks && Array.isArray(project.tasks)) {
            project.tasks
              .filter((task) => task.completed)
              .forEach((task) =>
                combinedCompletedTasks.push({
                  ...task,
                  source: "projects_data",
                  projectId,
                })
              );
          }
        });
      }
    }

    // Get from `todo-app-data`
    const todoRaw = localStorage.getItem("todo-app-data");
    if (todoRaw) {
      const todo = JSON.parse(todoRaw);
      if (todo && todo.tasks && Array.isArray(todo.tasks)) {
        todo.tasks
          .filter((task) => task.completed)
          .forEach((task) =>
            combinedCompletedTasks.push({ ...task, source: "todo-app-data" })
          );
      }
    }

    // Sort tasks based on selected sort option
    const sortedTasks = sortTasks(combinedCompletedTasks);

    // Filter tasks based on search query
    const filteredTasks = filterTasks(sortedTasks);

    setCompletedTasks(filteredTasks);
  }, [sortOption, searchQuery]); // Re-run when either sortOption or searchQuery changes

  const handleDelete = (taskIdToDelete) => {
    const taskToRemove = completedTasks.find(
      (task) => task.id === taskIdToDelete
    );
    if (!taskToRemove) return;

    if (taskToRemove.source === "projects_data") {
      const raw = localStorage.getItem("projects_data");
      if (!raw) return;
      const projects = JSON.parse(raw);
      const updatedProject = {
        ...projects[taskToRemove.projectId],
        tasks: projects[taskToRemove.projectId].tasks.filter(
          (t) => t.id !== taskIdToDelete
        ),
      };
      const updatedProjects = {
        ...projects,
        [taskToRemove.projectId]: updatedProject,
      };
      localStorage.setItem("projects_data", JSON.stringify(updatedProjects));
    }

    if (taskToRemove.source === "todo-app-data") {
      const raw = localStorage.getItem("todo-app-data");
      if (!raw) return;
      const todo = JSON.parse(raw);
      const updatedTodo = {
        ...todo,
        tasks: todo.tasks.filter((t) => t.id !== taskIdToDelete),
      };
      localStorage.setItem("todo-app-data", JSON.stringify(updatedTodo));
    }

    // Update state
    setCompletedTasks((prev) => prev.filter((t) => t.id !== taskIdToDelete));
  };

  return (
    <div style={{ padding: "1rem", maxWidth: "800px", margin: "0 auto" }}>
      <h1>Completed Section</h1>

      {/* Material UI Select for Sorting */}
      <FormControl style={{ marginBottom: "20px", width: "200px" }}>
        <InputLabel>Sort By</InputLabel>
        <Select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          label="Sort By"
        >
          <MenuItem value="newest">Newest First</MenuItem>
          <MenuItem value="alphabetical">Alphabetical</MenuItem>
          <MenuItem value="dueDate">By Due Date</MenuItem>
        </Select>
      </FormControl>

      {/* Search Input */}
      <TextField
        label="Search Tasks"
        variant="outlined"
        fullWidth
        style={{ marginBottom: "20px" }}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      <CompletedTaskList tasks={completedTasks} onDelete={handleDelete} />
    </div>
  );
};

export default CompletedSection;
