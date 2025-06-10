import React, { useEffect, useState } from "react";
import CompletedTaskList from "./List";
import {
  Button,
  Menu,
  MenuItem,
  TextField,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import ChecklistRtlOutlinedIcon from "@mui/icons-material/ChecklistRtlOutlined";
import SortOutlinedIcon from "@mui/icons-material/SortOutlined";
import { FaChevronDown } from "react-icons/fa";
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

    // === START: Remove completed tasks older than 7 days ===
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Filter tasks to keep only those completed within last 7 days
    const filteredTasks = combinedCompletedTasks.filter((task) => {
      if (!task.dateCompleted) return true; // keep if no completion date
      const completedDate = new Date(task.dateCompleted);
      return completedDate >= sevenDaysAgo;
    });

    // Clean up localStorage - remove old completed tasks from projects_data
    if (projectsRaw) {
      const projects = JSON.parse(projectsRaw);
      Object.entries(projects).forEach(([projectId, project]) => {
        if (project.tasks && Array.isArray(project.tasks)) {
          projects[projectId].tasks = project.tasks.filter((task) => {
            if (!task.completed) return true;
            if (!task.dateCompleted) return true;
            const completedDate = new Date(task.dateCompleted);
            return completedDate >= sevenDaysAgo;
          });
        }
      });
      localStorage.setItem("projects_data", JSON.stringify(projects));
    }

    // Clean up localStorage - remove old completed tasks from home_projects_data
    if (todoRaw) {
      const todo = JSON.parse(todoRaw);
      if (todo.tasks && Array.isArray(todo.tasks)) {
        todo.tasks = todo.tasks.filter((task) => {
          if (!task.completed) return true;
          if (!task.dateCompleted) return true;
          const completedDate = new Date(task.dateCompleted);
          return completedDate >= sevenDaysAgo;
        });
        localStorage.setItem("home_projects_data", JSON.stringify(todo));
      }
    }
    // === END: cleanup ===

    setProjectList([...new Set(tempProjects)].sort());

    let sorted = sortTasks(filteredTasks);

    if (searchQuery.trim()) {
      sorted = sorted.filter((task) =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

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

  const handleSortOptionChange = (value) => {
    setSortOption(value);
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

  const showAllProjects = "all"
    .toLowerCase()
    .includes(projectSearch.toLowerCase());

  const listItemStyle = {
    padding: "6px 12px",
    cursor: "pointer",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    transition: "background-color 0.2s",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: 210,
  };

  const nameTextStyle = {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    fontSize: 14,
    flexGrow: 1,
    marginRight: 8,
  };

  const fetchCompletedTasks = () => {
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

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const filteredTasks = combinedCompletedTasks.filter((task) => {
      if (!task.dateCompleted) return true;
      const completedDate = new Date(task.dateCompleted);
      return completedDate >= sevenDaysAgo;
    });

    setProjectList([...new Set(tempProjects)].sort());

    let sorted = sortTasks(filteredTasks);

    if (searchQuery.trim()) {
      sorted = sorted.filter((task) =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedProject !== "all") {
      sorted = sorted.filter(
        (task) =>
          (task.source === "projects_data" &&
            task.projectId === selectedProject) ||
          (task.source === "home_projects_data" && selectedProject === "home")
      );
    }

    setCompletedTasks(sorted);
  };

  const handleCompleteTask = (id) => {
    const taskToUpdate = completedTasks.find((task) => task.id === id);
    if (!taskToUpdate) return;

    if (taskToUpdate.source === "projects_data") {
      const raw = localStorage.getItem("projects_data");
      if (!raw) return;
      const projects = JSON.parse(raw);

      const updatedProjectTasks = projects[taskToUpdate.projectId].tasks.map(
        (task) =>
          task.id === id ? { ...task, completed: !task.completed } : task
      );

      projects[taskToUpdate.projectId].tasks = updatedProjectTasks;

      localStorage.setItem("projects_data", JSON.stringify(projects));
    }

    if (taskToUpdate.source === "home_projects_data") {
      const raw = localStorage.getItem("home_projects_data");
      if (!raw) return;
      const todo = JSON.parse(raw);

      const updatedTasks = todo.tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      );

      todo.tasks = updatedTasks;

      localStorage.setItem("home_projects_data", JSON.stringify(todo));
    }

    // Refresh state
    fetchCompletedTasks();
  };

  useEffect(() => {
    fetchCompletedTasks();
  }, [sortOption, searchQuery, selectedProject]);

  const filteredProjects = projectList.filter((name) =>
    name.toLowerCase().includes(projectSearch.toLowerCase())
  );

  const { text } = getButtonTextAndIcon();

  return (
    <div
      style={{
        paddingTop: "60px",
        paddingLeft: "48px",
        paddingRight: "48px",
        maxWidth: "700px",
        margin: "0 auto",
      }}
    >
      <h2
        style={{
          marginBottom: 8,
          marginTop: "10px",
        }}
      >
        Completed
      </h2>

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
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginTop: 15,
          marginBottom: 50,
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 14,
            alignItems: "center",
            marginRight: 15,
          }}
        >
          <ChecklistRtlOutlinedIcon />
          <div
            onClick={handleProjectClick}
            style={{
              backgroundColor: "#fafafa",
              borderRadius: 2,
              padding: "4px 7px 4px 7px",
              display: "flex",
              cursor: "pointer",
              marginLeft: 6,
              alignItems: "center",
            }}
          >
            <p
              style={{
                maxWidth: 110,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {selectedProject === "all" ? "All Projects" : selectedProject}
            </p>
            {/* <FaChevronDown style={{ marginLeft: 6, color: "grey" }} size={15} /> */}
          </div>

          <Menu
            anchorEl={projectAnchorEl}
            open={openProjectMenu}
            onClose={handleProjectClose}
            sx={{
              "& .MuiMenu-paper": {
                maxHeight: 300,
                overflowY: "auto",
                padding: 1,
                minWidth: 250,
              },
            }}
          >
            <TextField
              placeholder="Search project..."
              size="small"
              fullWidth
              sx={{
                "& .MuiOutlinedInput-root.Mui-focused": {
                  "& fieldset": {
                    borderColor: "#ff7800",
                  },
                },
              }}
              value={projectSearch}
              style={{ marginBottom: 15 }}
              onChange={(e) => setProjectSearch(e.target.value)}
              autoFocus
            />

            {showAllProjects && (
              <div
                onClick={() => handleProjectSelect("all")}
                style={listItemStyle}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#f0f0f0")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                <span style={nameTextStyle}>All Projects</span>
                {selectedProject === "all" && (
                  <CheckIcon style={{ fontSize: "16px", color: "grey" }} />
                )}
              </div>
            )}

            {filteredProjects.length > 0 ? (
              filteredProjects.map((name) => (
                <div
                  key={name}
                  onClick={() => handleProjectSelect(name)}
                  style={listItemStyle}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#f0f0f0")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                >
                  <span style={nameTextStyle}>{name}</span>
                  {selectedProject === name && (
                    <CheckIcon style={{ fontSize: "16px", color: "grey" }} />
                  )}
                </div>
              ))
            ) : (
              <div style={{ padding: "6px 12px", color: "#999" }}>
                No matching projects
              </div>
            )}
          </Menu>
        </div>
        <div style={{ fontSize: 14 }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <SortOutlinedIcon style={{ marginRight: 5 }} />
            <div
              style={{
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
                backgroundColor: "#fafafa",
                borderRadius: 2,
                padding: "4px 7px 4px 7px",
              }}
              onClick={handleClick}
            >
              <p
                style={{
                  textTransform: "capitalize",
                }}
              >
                {text}
              </p>
              {/* <FaChevronDown
                style={{ marginLeft: 6, color: "grey" }}
                size={15}
              /> */}
            </div>
          </div>
          <Menu
            id="simple-menu"
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            sx={{
              "& .MuiMenu-paper": {
                padding: 1,
                minWidth: 160,
              },
            }}
          >
            {[
              { value: "newest", label: "Newest First" },
              { value: "alphabetical", label: "Alphabetical" },
              { value: "dueDate", label: "By Due Date" },
            ].map((option) => (
              <div
                key={option.value}
                onClick={() => {
                  handleSortOptionChange(option.value);
                  handleClose();
                }}
                style={{
                  padding: "6px 12px",
                  fontSize: 14,
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  transition: "background-color 0.2s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#f0f0f0")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                <span
                  style={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    flexGrow: 1,
                    marginRight: 8,
                  }}
                >
                  {option.label}
                </span>
                {sortOption === option.value && (
                  <CheckIcon style={{ fontSize: "16px", color: "grey" }} />
                )}
              </div>
            ))}
          </Menu>
        </div>
      </div>
      <CompletedTaskList
        onComplete={handleCompleteTask}
        tasks={completedTasks}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default CompletedSection;
