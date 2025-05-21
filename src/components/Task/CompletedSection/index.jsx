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

    setProjectList(tempProjects);
    let sorted = sortTasks([...combinedCompletedTasks]);

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

  const [selectedSort, setSelectedSort] = useState("newest");

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSortOptionChange = (value) => {
    setSelectedSort(value);
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
    maxWidth: 240,
  };

  const nameTextStyle = {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    fontSize: 14,
    flexGrow: 1,
    marginRight: 8,
  };

  const filteredProjects = projectList.filter((name) =>
    name.toLowerCase().includes(projectSearch.toLowerCase())
  );

  const { text } = getButtonTextAndIcon();

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
          marginTop: 10,
          marginBottom: 10,
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
          <p>Activity:</p>
          <div
            onClick={handleProjectClick}
            style={{
              display: "flex",
              cursor: "pointer",
              marginLeft: 6,
              alignItems: "center",
            }}
          >
            <p
              style={{
                maxWidth: 150,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {selectedProject === "all" ? "All Projects" : selectedProject}
            </p>
            <FaChevronDown style={{ marginLeft: 6 }} size={15} />
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
              value={projectSearch}
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
                  <CheckIcon style={{ fontSize: "16px" }} />
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
                    <CheckIcon style={{ fontSize: "16px" }} />
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
          <div
            style={{ display: "flex", alignItems: "center" }}
            onClick={handleClick}
          >
            <p
              style={{
                textTransform: "capitalize",
              }}
            >
              {text}
            </p>
            <FaChevronDown style={{ marginLeft: 6 }} size={15} />
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
                {selectedSort === option.value && (
                  <FaChevronDown style={{ marginLeft: 6 }} size={15} />
                )}
              </div>
            ))}
          </Menu>
        </div>
      </div>
      <CompletedTaskList tasks={completedTasks} onDelete={handleDelete} />
    </div>
  );
};

export default CompletedSection;
