import React, { useEffect, useState } from "react";
import CompletedTaskList from "./List";
import {
  Button,
  Menu,
  MenuItem,
  TextField,
  useTheme,
  useMediaQuery,
  Tooltip,
} from "@mui/material";
import { SortByAlpha, DateRange, NewReleases } from "@mui/icons-material";

const CompletedSection = () => {
  const [completedTasks, setCompletedTasks] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("newest");
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedProject, setSelectedProject] = useState("all");
  const [projectSearch, setProjectSearch] = useState("");
  const [projectList, setProjectList] = useState([]);
  const [projectAnchorEl, setProjectAnchorEl] = useState(null);
  const openProjectMenu = Boolean(projectAnchorEl);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

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
        return tasks.sort((a, b) => b.id - a.id);
    }
  };

  const filterTasks = (tasks) => {
    if (!searchQuery.trim()) return tasks;
    return tasks.filter((task) =>
      task.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  useEffect(() => {
    const combinedCompletedTasks = [];
    const tempProjects = [];

    const projectsRaw = localStorage.getItem("projects_data");
    if (projectsRaw) {
      const projects = JSON.parse(projectsRaw);
      tempProjects.push(...Object.keys(projects));
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

    const todoRaw = localStorage.getItem("home_projects_data");
    if (todoRaw) {
      const todo = JSON.parse(todoRaw);
      tempProjects.push("home");
      if (todo && todo.tasks && Array.isArray(todo.tasks)) {
        todo.tasks
          .filter((task) => task.completed)
          .forEach((task) =>
            combinedCompletedTasks.push({
              ...task,
              source: "home_projects_data",
            })
          );
      }
    }

    setProjectList(tempProjects); // Set project names (home, yuk ah, asd, etc.)

    // SORT
    let sorted = sortTasks([...combinedCompletedTasks]);

    // SEARCH FILTER
    if (searchQuery.trim()) {
      sorted = sorted.filter((task) =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // PROJECT FILTER
    if (selectedProject !== "all") {
      sorted = sorted.filter(
        (task) =>
          (task.source === "projects_data" &&
            task.projectId === selectedProject) ||
          (task.source === "home_projects_data" && selectedProject === "home")
      );
    }

    setCompletedTasks(sorted);
  }, [sortOption, searchQuery, selectedProject]);

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

    if (taskToRemove.source === "home_projects_data") {
      const raw = localStorage.getItem("home_projects_data");
      if (!raw) return;
      const todo = JSON.parse(raw);
      const updatedTodo = {
        ...todo,
        tasks: todo.tasks.filter((t) => t.id !== taskIdToDelete),
      };
      localStorage.setItem("home_projects_data", JSON.stringify(updatedTodo));
    }

    setCompletedTasks((prev) => prev.filter((t) => t.id !== taskIdToDelete));
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleSortOptionChange = (option) => {
    setSortOption(option);
    handleClose();
  };

  const handleProjectClick = (event) => {
    setProjectAnchorEl(event.currentTarget);
  };

  const handleProjectClose = () => {
    setProjectAnchorEl(null);
  };

  const handleProjectSelect = (project) => {
    setSelectedProject(project);
    handleProjectClose();
  };

  const getButtonTextAndIcon = () => {
    switch (sortOption) {
      case "newest":
        return { text: "Newest First", icon: <NewReleases /> };
      case "alphabetical":
        return { text: "Alphabetical", icon: <SortByAlpha /> };
      case "dueDate":
        return { text: "By Due Date", icon: <DateRange /> };
      default:
        return { text: "Sort", icon: <SortByAlpha /> };
    }
  };

  const { text, icon } = getButtonTextAndIcon();

  return (
    <div
      style={{
        paddingLeft: "16px",
        paddingRight: "16px",
        maxWidth: "700px",
        margin: "0 auto",
      }}
    >
      <h2
        style={{
          marginBottom: 10,
          marginTop: "10px",
        }}
      >
        Completed
      </h2>

      <div>
        <Tooltip title="Filter by Project">
          <Button
            variant="contained"
            onClick={handleProjectClick}
            sx={{
              backgroundColor: "#6c63ff",
              textTransform: "capitalize",
              boxShadow: "none",
              minWidth: "120px",
              fontSize: 14,
              "&:hover": { backgroundColor: "#5a54d1" },
            }}
            disableElevation
          >
            {selectedProject === "all" ? "All Projects" : selectedProject}
          </Button>
        </Tooltip>

        <Menu
          anchorEl={projectAnchorEl}
          open={openProjectMenu}
          onClose={handleProjectClose}
          sx={{
            "& .MuiMenu-paper": {
              maxHeight: 300, // max height in px
              overflowY: "auto", // enables scrolling
            },
          }}
        >
          {/* Search box - always visible */}
          <MenuItem disableRipple>
            <TextField
              placeholder="Search project..."
              size="small"
              fullWidth
              value={projectSearch}
              onChange={(e) => setProjectSearch(e.target.value)}
              autoFocus
            />
          </MenuItem>

          {/* All Projects */}
          <MenuItem onClick={() => handleProjectSelect("all")}>
            All Projects
          </MenuItem>

          {/* Filtered list - show/hide based on search match */}
          {projectList.map((name) => {
            const isMatch = name
              .toLowerCase()
              .includes(projectSearch.toLowerCase());
            return (
              <MenuItem
                key={name}
                onClick={() => handleProjectSelect(name)}
                sx={{ display: isMatch ? "block" : "none" }}
              >
                {name}
              </MenuItem>
            );
          })}
        </Menu>
      </div>

      <div style={{ display: isMobile ? "" : "flex", gap: 10 }}>
        <TextField
          placeholder="Search Tasks"
          variant="outlined"
          fullWidth
          value={searchQuery}
          size="small"
          sx={{
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
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Tooltip title="Sort by">
          <Button
            aria-controls="simple-menu"
            aria-haspopup="true"
            variant="contained"
            style={{
              marginTop: isMobile ? 10 : 0,
              marginBottom: isMobile ? 10 : 0,
              minWidth: "120px",
              fontSize: 14,
              textTransform: "capitalize",
            }}
            sx={{
              backgroundColor: "#ff7800",
              textTransform: "capitalize",
              boxShadow: "none",
              "&:hover": { backgroundColor: "#e06f00" },
            }}
            disableElevation
            onClick={handleClick}
          >
            {text}
          </Button>
        </Tooltip>
        <Menu
          id="simple-menu"
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
        >
          <MenuItem
            style={{ minWidth: "120px", fontSize: 14 }}
            onClick={() => handleSortOptionChange("newest")}
          >
            Newest First
          </MenuItem>
          <MenuItem
            style={{ minWidth: "120px", fontSize: 14 }}
            onClick={() => handleSortOptionChange("alphabetical")}
          >
            Alphabetical
          </MenuItem>
          <MenuItem
            style={{ minWidth: "120px", fontSize: 14 }}
            onClick={() => handleSortOptionChange("dueDate")}
          >
            By Due Date
          </MenuItem>
        </Menu>
      </div>

      <CompletedTaskList tasks={completedTasks} onDelete={handleDelete} />
    </div>
  );
};

export default CompletedSection;
