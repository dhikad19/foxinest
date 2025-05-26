import { useParams, useNavigate, useLocation, replace } from "react-router-dom";
import { useEffect, useState, useMemo, useRef } from "react";
import AddIcon from "@mui/icons-material/Add";
import AddIconFilled from "@mui/icons-material/AddCircle";
import {
  Box,
  Typography,
  TextField,
  Button,
  Divider,
  Stack,
  Popover,
} from "@mui/material";
import TaskForm from "../../Task/Form";
import TaskItem from "../../Task/Item";
import CustomSnackbar from "../../Snackbar";
import EditModal from "../../Modal/Edit";
import DeleteProjectDialog from "../../Modal/Project/Delete";
import EditProjectDialog from "../../Modal/Project/Edit";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { FaChevronDown, FaChevronRight } from "react-icons/fa";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import dayjs from "dayjs";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

const ProjectDetail = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [projectData, setProjectData] = useState({ sections: [], tasks: [] });
  const [projects, setProjects] = useState([]);
  const [newSection, setNewSection] = useState("");
  const [openFormSection, setOpenFormSection] = useState(null);
  const [editTask, setEditTask] = useState(null);
  const [completedTask, setCompletedTask] = useState(null);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState({});
  const [showOverdue, setShowOverdue] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const isFirstRender = useRef(true);
  const [project, setProject] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const fromEdit = location.state?.fromEdit;
  const [searchQuery, setSearchQuery] = useState(""); // Add state for search query
  const [loading, setLoading] = useState(true);
  const [hoveredSection, setHoveredSection] = useState(null);
  const [editProjectData, setEditProjectData] = useState({
    name: "",
    color: "default",
    isFavorite: false,
  });
  const normalize = (str) => str.trim().toLowerCase().replace(/\s+/g, "-");

  const isValidProjectId = projects.some(
    (p) => normalize(p.name) === normalize(projectId)
  );

  const sensors = useSensors(useSensor(PointerSensor));
  useEffect(() => {
    const storedData = JSON.parse(localStorage.getItem("projects_data")) || {};
    const normalizedId = normalize(projectId);
    setProjectData(storedData[normalizedId] || { sections: [], tasks: [] });
  }, [projectId]);

  useEffect(() => {
    const fetchProjects = () => {
      const stored = JSON.parse(localStorage.getItem("projects")) || [];
      setProjects(stored);
    };

    fetchProjects();
    window.addEventListener("localStorage-update", fetchProjects);
    window.addEventListener("storage", fetchProjects);
    return () => {
      window.removeEventListener("localStorage-update", fetchProjects);
      window.removeEventListener("storage", fetchProjects);
    };
  }, []);

  // This will help us track if we are coming from edit

  useEffect(() => {
    const storedProjects = JSON.parse(localStorage.getItem("projects")) || [];
    const storedProjectsData =
      JSON.parse(localStorage.getItem("projects_data")) || {};

    const matchedProject = storedProjects.find(
      (p) => normalize(p.name) === normalize(projectId)
    );

    if (!matchedProject) {
      navigate("/404", { replace: true });
      return;
    }

    const correctedUrlName = normalize(matchedProject.name);
    if (normalize(projectId) !== correctedUrlName) {
      navigate(`/project/${correctedUrlName}`, { replace: true });
      return;
    }

    const hasProjectData = Object.prototype.hasOwnProperty.call(
      storedProjectsData,
      matchedProject.name
    );
    if (!hasProjectData) {
      navigate("/404", { replace: true });
      return;
    }

    setProject(matchedProject);
    setLoading(false);
  }, [projectId, navigate]);

  useEffect(() => {
    if (!projectId || projects.length === 0) return;

    // Ensure that the projectId exists in the updated list of projects
    const cameFromEdit = location.state?.fromEdit;
    // Cleanup after the edit
    if (cameFromEdit) {
      setTimeout(() => {
        window.history.replaceState({}, document.title);
      }, 200); // Delay cleanup to allow state to persist before reset
    }
  }, [projects, projectId, location.state, navigate]);

  useEffect(() => {
    if (fromEdit) {
      // Clean the history state after the first render
      window.history.replaceState({}, document.title);
    }
  }, []);

  useEffect(() => {
    if (!projectId || !projectData || !isValidProjectId) return;

    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (Object.keys(projectData).length === 0) return;

    const normalizedId = normalize(projectId);
    const storedData = JSON.parse(localStorage.getItem("projects_data")) || {};
    storedData[normalizedId] = projectData;
    localStorage.setItem("projects_data", JSON.stringify(storedData));
  }, [projectData, projectId, isValidProjectId]);

  useEffect(() => {
    const normalize = (str) => str.replaceAll(" ", "-").toLowerCase();

    if (editDialogOpen) {
      const currentProject = projects.find(
        (p) => normalize(p.name) === normalize(projectId)
      );
      if (currentProject) {
        setEditProjectData({
          name: currentProject.name || "",
          color: currentProject.color || "default",
          isFavorite: currentProject.isFavorite || false,
        });
      }
    }
  }, [editDialogOpen, projects, projectId]);

  const today = dayjs().format("YYYY-MM-DD");
  const overdueTasks = projectData.tasks.filter(
    (task) => !task.completed && task.dueDate && task.dueDate < today
  );

  const tasksByCategory = useMemo(() => {
    const map = projectData.sections.reduce((acc, section) => {
      acc[section] = projectData.tasks.filter(
        (t) =>
          t.category === section &&
          !t.completed &&
          (!t.dueDate || t.dueDate >= today)
      );
      return acc;
    }, {});
    return map;
  }, [projectData]);

  const toggleExpand = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: prev[section] === false, // toggle false → true, undefined → true
    }));
  };

  useEffect(() => {
    setExpandedSections((prev) => {
      const updated = { ...prev };
      for (const section of projectData.sections) {
        if (updated[section] === undefined) {
          updated[section] = true;
        }
      }
      return updated;
    });
  }, [projectData.sections]);

  const handleDateChange = (newDate) => {
    if (!newDate) return;
    const formatted = newDate.format("YYYY-MM-DD");

    const updatedTasks = projectData.tasks.map((task) =>
      task.dueDate && task.dueDate < today
        ? { ...task, dueDate: formatted }
        : task
    );

    setProjectData((prev) => ({
      ...prev,
      tasks: updatedTasks,
    }));

    setSelectedDate(newDate);
    setAnchorEl(null);
  };

  const handleAddSection = (event) => {
    // Prevent the default form submission (page refresh)
    event.preventDefault();

    const trimmed = newSection.trim();
    if (trimmed && !projectData.sections.includes(trimmed)) {
      const updatedData = {
        ...projectData,
        sections: [...projectData.sections, trimmed],
      };
      setProjectData(updatedData);

      const normalizedId = normalize(projectId);
      const storedData =
        JSON.parse(localStorage.getItem("projects_data")) || {};
      storedData[normalizedId] = updatedData;
      localStorage.setItem("projects_data", JSON.stringify(storedData));

      setNewSection(""); // Clear the input after adding the section
      setShowForm(false); // Close the form after adding the section
    }
  };

  const handleAddTask = (task) => {
    setProjectData((prev) => ({
      ...prev,
      tasks: [...prev.tasks, { ...task, completed: false }],
    }));
  };

  const handleDeleteTask = (id) => {
    setProjectData((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((t) => t.id !== id),
    }));
  };

  const handleCompleteTask = (id) => {
    const updatedTasks = projectData.tasks.map((task) =>
      task.id === id ? { ...task, completed: !task.completed } : task
    );
    setProjectData((prev) => ({ ...prev, tasks: updatedTasks }));
    const completed = projectData.tasks.find((t) => t.id === id);
    setCompletedTask(completed);
    setShowSnackbar(true);
  };

  const handleUndo = () => {
    if (!completedTask) return;
    setProjectData((prev) => ({
      ...prev,
      tasks: prev.tasks.map((task) =>
        task.id === completedTask.id ? { ...task, completed: false } : task
      ),
    }));
    setCompletedTask(null);
    setShowSnackbar(false);
  };

  const onClose = () => {
    setEditingTaskId(null);
  };

  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;
    const oldIndex = projectData.tasks.findIndex((t) => t.id === active.id);
    const newIndex = projectData.tasks.findIndex((t) => t.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    setProjectData((prev) => ({
      ...prev,
      tasks: arrayMove(prev.tasks, oldIndex, newIndex),
    }));
  };

  const handleEditProject = () => {
    const updated = projects.map((project) =>
      normalize(project.name) === normalize(projectId)
        ? { ...project, ...editProjectData }
        : project
    );

    localStorage.setItem("projects", JSON.stringify(updated));
    window.dispatchEvent(new Event("localStorage-update"));
    setProjects(updated);

    const oldKey = projects.find(
      (p) => normalize(p.name) === normalize(projectId)
    )?.name;

    const newKey = editProjectData.name;

    if (oldKey && normalize(oldKey) !== normalize(newKey)) {
      const data = JSON.parse(localStorage.getItem("projects_data")) || {};
      const normalizedOldKey = normalize(oldKey);
      const normalizedNewKey = normalize(newKey);

      data[normalizedNewKey] = data[normalizedOldKey];
      delete data[normalizedOldKey];

      localStorage.setItem("projects_data", JSON.stringify(data));
    }

    navigate(`/project/${normalize(newKey)}`, { state: { fromEdit: true } });
    setEditDialogOpen(false);
  };

  const handleDeleteProject = () => {
    const updated = projects.filter(
      (p) => normalize(p.name) !== normalize(projectId)
    );

    localStorage.setItem("projects", JSON.stringify(updated));
    window.dispatchEvent(new Event("localStorage-update"));

    const data = JSON.parse(localStorage.getItem("projects_data")) || {};
    const projectToDelete = projects.find(
      (p) => normalize(p.name) === normalize(projectId)
    );
    if (projectToDelete && data[projectToDelete.name]) {
      delete data[projectToDelete.name];
      localStorage.setItem("projects_data", JSON.stringify(data));
    }

    setDeleteDialogOpen(false);
    navigate("/project");
  };

  const handleEditSection = (oldName, newName) => {
    if (oldName === newName || !newName.trim()) return;

    const updatedSections = projectData.sections.map((sec) =>
      sec === oldName ? newName : sec
    );

    const updatedTasks = projectData.tasks.map((task) =>
      task.category === oldName ? { ...task, category: newName } : task
    );

    setProjectData((prev) => ({
      ...prev,
      sections: updatedSections,
      tasks: updatedTasks,
    }));
  };

  const handleDeleteSection = (sectionName) => {
    const updatedSections = projectData.sections.filter(
      (sec) => sec !== sectionName
    );
    const updatedTasks = projectData.tasks.filter(
      (task) => task.category !== sectionName
    );

    setProjectData((prev) => ({
      ...prev,
      sections: updatedSections,
      tasks: updatedTasks,
    }));

    // Update localStorage
    const normalizedId = normalize(projectId);
    const storedData = JSON.parse(localStorage.getItem("projects_data")) || {};
    storedData[normalizedId] = {
      ...storedData[normalizedId],
      sections: updatedSections,
      tasks: updatedTasks,
    };
    localStorage.setItem("projects_data", JSON.stringify(storedData));
  };

  const LiveSectionEditor = ({ initialContent, onChange }) => {
    const [currentText, setCurrentText] = useState(initialContent);

    const editor = useEditor({
      extensions: [StarterKit],
      content: initialContent,
      editorProps: {
        attributes: {
          class: "inline-editor",
          style:
            "border: none; outline: none; font-size: 15px; font-weight: bold;",
        },
        handleDOMEvents: {
          blur: () => {
            const trimmed = currentText.trim();
            if (trimmed !== initialContent && trimmed !== "") {
              onChange(trimmed);
            }
          },
        },
      },
      onUpdate: ({ editor }) => {
        const text = editor.getText();
        setCurrentText(text);
      },
    });

    useEffect(() => {
      if (editor && initialContent !== editor.getText().trim()) {
        editor.commands.setContent(initialContent);
        setCurrentText(initialContent);
      }
    }, [initialContent]);

    if (!editor) return null;
    return <EditorContent editor={editor} />;
  };

  function capitalizeEachWord(str) {
    return str.replace(/\b\w/g, (char) => char.toUpperCase());
  }

  const filteredSections = useMemo(() => {
    return projectData.sections.filter((section) =>
      section.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [projectData.sections, searchQuery]);

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };
  if (loading) return null;
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
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <h2 style={{ marginBottom: "0px", marginTop: "10px" }}>
            {capitalizeEachWord(projectId.replaceAll("-", " "))}
          </h2>

          <div style={{ display: "flex" }}>
            <div
              style={{
                padding: 5,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#ff7800",
                marginRight: 6,
                color: "white",
                borderRadius: 4,
              }}
              onClick={() => setEditDialogOpen(true)}
            >
              <EditOutlinedIcon style={{ fontSize: 18 }} />
            </div>
            <div
              style={{
                padding: 4,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#ec2b38",
                color: "white",
                borderRadius: 4,
              }}
              onClick={() => setDeleteDialogOpen(true)}
            >
              <DeleteOutlinedIcon style={{ fontSize: 18 }} />
            </div>
          </div>
        </div>
        <TextField
          fullWidth
          style={{ marginTop: 8, marginBottom: 14 }}
          size="small"
          placeholder="Search sections"
          value={searchQuery}
          onChange={handleSearchChange}
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
        />
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
            marginTop: 18,
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
          onSubmit={handleAddSection}
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
              style={{ fontWeight: "bold", color: "#ff7800", fontSize: "15px" }}
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
            value={newSection}
            onChange={(e) => setNewSection(e.target.value)}
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
              disabled={!newSection.trim()}
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
                setNewSection("");
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}

      {overdueTasks.length > 0 && (
        <div style={{ marginBottom: "1rem", borderRadius: 8, padding: 4 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 10,
            }}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              <div
                onClick={() => setShowOverdue((prev) => !prev)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  marginRight: 8,
                  borderRadius: 4,
                  height: 22,
                  width: 22,
                  marginLeft: "-30px",
                  backgroundColor: "#fafafa",
                }}
              >
                {showOverdue ? (
                  <FaChevronDown size={10} color="grey" />
                ) : (
                  <FaChevronRight size={10} color="grey" />
                )}
              </div>
              <strong style={{ fontSize: 15 }}>Overdue</strong>
            </div>

            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <div
                onClick={(e) => setAnchorEl(e.currentTarget)}
                style={{
                  marginLeft: "auto",
                  cursor: "pointer",
                  padding: "4px 10px",
                  borderRadius: 4,
                  backgroundColor: "#f5f5f5",
                  fontSize: 13,
                }}
              >
                {selectedDate
                  ? selectedDate.format("MMM D, YYYY")
                  : "Select Date 📅"}
              </div>
              <Popover
                open={Boolean(anchorEl)}
                anchorEl={anchorEl}
                onClose={() => setAnchorEl(null)}
                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
              >
                <Box p={1}>
                  <Stack direction="row" spacing={1} padding={2}>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleDateChange(dayjs())}
                    >
                      Today
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleDateChange(dayjs().add(1, "day"))}
                    >
                      Tomorrow
                    </Button>
                  </Stack>
                  <DateCalendar
                    disablePast
                    value={selectedDate}
                    onChange={handleDateChange}
                  />
                </Box>
              </Popover>
            </LocalizationProvider>
          </div>

          <Divider sx={{ my: 1 }} />

          {showOverdue && (
            <div style={{ padding: 4 }}>
              {overdueTasks.map((task) =>
                editingTaskId === task.id ? (
                  <EditModal
                    key={task.id}
                    task={task}
                    onSave={(updatedTask) => {
                      setProjectData((prev) => ({
                        ...prev,
                        tasks: prev.tasks.map((t) =>
                          t.id === updatedTask.id ? updatedTask : t
                        ),
                      }));
                      setEditingTaskId(null);
                    }}
                    onCancel={() => onClose()}
                    onClose={() => setEditingTaskId(null)}
                  />
                ) : (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onDelete={handleDeleteTask}
                    onEdit={() => setEditingTaskId(task.id)}
                    onComplete={handleCompleteTask}
                  />
                )
              )}
            </div>
          )}
        </div>
      )}

      {filteredSections.length > 0 ? (
        filteredSections.map((section) => (
          <div
            key={section}
            style={{ marginBottom: "1rem", borderRadius: 8, padding: 4 }}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              <div
                onClick={() => toggleExpand(section)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  marginRight: 8,
                  borderRadius: 4,
                  height: 22,
                  width: 22,
                  marginLeft: "-30px",
                  backgroundColor: "#fafafa",
                }}
              >
                {expandedSections[section] !== false ? (
                  <FaChevronDown size={10} color="grey" />
                ) : (
                  <FaChevronRight size={10} color="grey" />
                )}
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  width: "100%",
                  justifyContent: "space-between",
                }}
              >
                <LiveSectionEditor
                  initialContent={section}
                  onChange={(newName) => handleEditSection(section, newName)}
                />

                <Button
                  variant="contained"
                  onClick={() => handleDeleteSection(section)}
                  sx={{
                    backgroundColor: "#ff7800",
                    boxShadow: "none",
                    "&:hover": {
                      backgroundColor: "#e06600", // Adjust hover color if needed
                      boxShadow: "none",
                    },
                    textTransform: "capitalize",
                  }}
                  size="small"
                >
                  Delete
                </Button>
              </div>
            </div>

            <DndContext
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
              sensors={sensors}
            >
              {expandedSections[section] !== false && (
                <>
                  <SortableContext
                    items={tasksByCategory[section]?.map((t) => t.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {tasksByCategory[section]?.map((task) =>
                      editingTaskId === task.id ? (
                        <EditModal
                          key={task.id}
                          task={task}
                          onSave={(updatedTask) => {
                            setProjectData((prev) => ({
                              ...prev,
                              tasks: prev.tasks.map((t) =>
                                t.id === updatedTask.id ? updatedTask : t
                              ),
                            }));
                            setEditingTaskId(null);
                          }}
                          onCancel={() => onClose()}
                          onClose={() => setEditingTaskId(null)}
                        />
                      ) : (
                        <TaskItem
                          key={task.id}
                          task={task}
                          onDelete={handleDeleteTask}
                          onEdit={() => setEditingTaskId(task.id)}
                          onComplete={handleCompleteTask}
                        />
                      )
                    )}
                  </SortableContext>
                  {!openFormSection && (
                    <div
                      onClick={() => setOpenFormSection(section)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        cursor: "pointer",
                        marginTop: 10,
                      }}
                    >
                      <AddIcon style={{ marginRight: "8px", fontSize: 20 }} />
                      <p style={{ fontSize: 14, fontWeight: 500 }}>Add Task</p>
                    </div>
                  )}
                  {openFormSection === section && (
                    <TaskForm
                      defaultCategory={section}
                      onAdd={handleAddTask}
                      onCancel={() => setOpenFormSection(null)}
                    />
                  )}
                </>
              )}
            </DndContext>
          </div>
        ))
      ) : (
        <Typography variant="h6" color="textSecondary" align="center">
          No sections match your search.
        </Typography>
      )}

      {editTask && (
        <EditModal
          task={editTask}
          onSave={(editedTask) => {
            setProjectData((prev) => ({
              ...prev,
              tasks: prev.tasks.map((task) =>
                task.id === editedTask.id ? editedTask : task
              ),
            }));
            setEditTask(null);
          }}
          onClose={() => setEditTask(null)}
        />
      )}

      {showSnackbar && (
        <CustomSnackbar message="Task completed!" onUndo={handleUndo} />
      )}

      <DeleteProjectDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onDelete={handleDeleteProject}
      />

      <EditProjectDialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        onSave={handleEditProject}
        projectData={editProjectData}
        setProjectData={setEditProjectData}
      />
    </div>
  );
};

export default ProjectDetail;
