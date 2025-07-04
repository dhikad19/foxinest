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
  Menu,
  MenuItem,
  Dialog,
  DialogActions,
  useTheme,
  useMediaQuery,
  DialogContent,
  DialogContentText,
  ListItemButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  DialogTitle,
} from "@mui/material";
import {
  Today as TodayIcon,
  CalendarToday as CalendarTodayIcon,
  Weekend as WeekendIcon,
  Event as EventIcon,
} from "@mui/icons-material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import TaskForm from "../../Task/Form";
import TaskItem from "../../Task/Item";
import EditModal from "../../Modal/Edit";
import DeleteProjectDialog from "../../Modal/Project/Delete";
import EditProjectDialog from "../../Modal/Project/Edit";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { FaChevronDown, FaChevronRight } from "react-icons/fa";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import dayjs from "dayjs";
import MoreHorizOutlinedIcon from "@mui/icons-material/MoreHorizOutlined";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import EditIcon from "@mui/icons-material/EditOutlined";
import { ToastContainer, toast } from "react-toastify";
import { MobileTimePicker } from "@mui/x-date-pickers/MobileTimePicker";
import { DesktopTimePicker } from "@mui/x-date-pickers/DesktopTimePicker";
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

const quickDates = [
  {
    label: "Today",
    date: dayjs(),
    icon: <TodayIcon fontSize="small" />,
    display: (d) => d.format("ddd"),
  },
  {
    label: "Tomorrow",
    date: dayjs().add(1, "day"),
    icon: <CalendarTodayIcon fontSize="small" />,
    display: (d) => d.format("ddd"),
  },
  {
    label: "This Weekend",
    date: dayjs().day(6), // Saturday
    icon: <WeekendIcon fontSize="small" />,
    display: (d) => d.format("ddd"),
  },
  {
    label: "Next Week",
    date: dayjs().add(1, "week").startOf("week").add(1, "day"), // Next Monday
    icon: <EventIcon fontSize="small" />,
    display: (d) => `${d.format("ddd")}, ${d.format("D MMM")}`,
  },
];

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
  const [selectedTime, setSelectedTime] = useState(null); // stores "HH:mm"
  const [anchorEl2, setAnchorEl2] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState(null);
  const [menuAnchor, setMenuAnchor] = useState(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleMenuClick = (event, section) => {
    setAnchorEl2(event.currentTarget);
    setSelectedSection(section);
  };

  const handleMenuClose = () => {
    setAnchorEl2(null);
    setMenuAnchor(null);
  };

  const handleDialogOpen = () => {
    setDialogOpen(true);
    setAnchorEl2(null); // Close menu
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedSection(null);
  };

  const confirmDelete = () => {
    if (selectedSection) {
      handleDeleteSection(selectedSection);
    }
    handleDialogClose();
  };

  const handleMenuOpen = (event) => {
    setMenuAnchor(event.currentTarget);
  };

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

    const formattedDate = newDate.format("YYYY-MM-DD");

    const combinedDateTime = selectedTime
      ? dayjs(`${formattedDate} ${selectedTime}`, "YYYY-MM-DD HH:mm").format()
      : newDate.format(); // fallback if time not selected

    const updatedTasks = projectData.tasks.map((task) =>
      task.dueDate && task.dueDate < dayjs().format("YYYY-MM-DD")
        ? {
            ...task,
            dueDate: formattedDate,
            dueTime: selectedTime || null,
            dueDateTime: combinedDateTime,
          }
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
    if (task.dueDate && task.dueDate.trim() !== "") {
      // Generate a unique ID for the task
      var uniqueId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Update project data with the new task
      setProjectData((prev) => ({
        ...prev,
        tasks: [
          ...prev.tasks,
          { ...task, completed: false, id: uniqueId }, // Assign unique ID to task
        ],
      }));

      const getISOWithTimeZone = (dueDate, dueTime) => {
        // Combine date and time into a local datetime string
        const localDateTimeStr = `${dueDate}T${dueTime}:00`;

        // Create a Date object (local time)
        const localDate = new Date(localDateTimeStr);

        // Format to ISO with local timezone offset
        const tzOffset = -localDate.getTimezoneOffset(); // in minutes
        const sign = tzOffset >= 0 ? "+" : "-";
        const pad = (n) => String(Math.floor(Math.abs(n))).padStart(2, "0");
        const hoursOffset = pad(tzOffset / 60);
        const minutesOffset = pad(tzOffset % 60);

        return (
          localDate.toISOString().split(".")[0] +
          `${sign}${hoursOffset}:${minutesOffset}`
        );
      };

      let finalDateTime = task.dueDate;
      if (task.dueTime) {
        finalDateTime = getISOWithTimeZone(task.dueDate, task.dueTime);
      }
      const newEvent = {
        id: uniqueId,
        title: task.title,
        start: finalDateTime,
        end: finalDateTime,
        backgroundColor: "#00008b",
        textColor: "#fff",
        details: task,
      };

      // Retrieve existing events from localStorage
      const existingEvents =
        JSON.parse(localStorage.getItem("user_events")) || [];

      // Add the new event to the array and save to localStorage
      const updatedEvents = [...existingEvents, newEvent];
      localStorage.setItem("user_events", JSON.stringify(updatedEvents));
    } else {
      console.error("Task dueDate is invalid or empty");
    }
  };

  const handleDeleteTask = (id) => {
    setProjectData((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((t) => t.id !== id),
    }));
  };

  const handleCompleteTask = (id) => {
    const now = new Date();
    let updatedTask = null;

    const updatedTasks = projectData.tasks.map((task) => {
      if (task.id === id) {
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

    setProjectData((prev) => ({ ...prev, tasks: updatedTasks }));

    if (updatedTask && updatedTask.completed) {
      setCompletedTask(updatedTask);

      // Show toast with undo option
      toast.info("Task marked as completed", {
        className: "custom-toast",
        progressClassName: "custom-toast-progress",
        icon: (
          <div>
            <InfoOutlinedIcon style={{ color: "#ff7800" }} />
          </div>
        ),
        position: "bottom-left",
        closeOnClick: true,
        pauseOnHover: true,
        autoClose: 6000,
        draggable: true,
      });
    } else if (updatedTask) {
      // Task marked as incomplete
      toast.info("Task marked as incomplete.", {
        className: "custom-toast",
        progressClassName: "custom-toast-progress",
        icon: (
          <div>
            <InfoOutlinedIcon style={{ color: "#ff7800" }} />
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
        paddingTop: "60px",
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
            <MoreHorizOutlinedIcon
              style={{ fontSize: "20px", cursor: "pointer" }}
              onClick={handleMenuOpen}
            />

            <Menu
              anchorEl={menuAnchor}
              open={Boolean(menuAnchor)}
              onClose={handleMenuClose}
            >
              <MenuItem
                onClick={() => {
                  setEditDialogOpen(true);
                  handleMenuClose();
                }}
              >
                <EditIcon style={{ fontSize: "19px", marginRight: 12 }} />{" "}
                <p style={{ fontSize: "13px" }}>Edit</p>
              </MenuItem>
              <MenuItem
                onClick={() => {
                  setDeleteDialogOpen(true);
                  handleMenuClose();
                }}
              >
                <DeleteIcon style={{ fontSize: "19px", marginRight: 12 }} />{" "}
                <p style={{ fontSize: "13px" }}>Delete</p>
              </MenuItem>
            </Menu>
            {/* <div
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
            </div> */}
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
                  color: "#ff7800",
                  fontWeight: 500,
                  fontSize: 15,
                }}
              >
                {selectedDate
                  ? selectedDate.format("MMM D, YYYY")
                  : "Select Date"}
              </div>

              <Popover
                open={Boolean(anchorEl)}
                anchorEl={anchorEl}
                onClose={() => setAnchorEl(null)}
                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
              >
                <Box>
                  <div
                    style={{
                      padding: 20,
                    }}
                  >
                    {isMobile ? (
                      <MobileTimePicker
                        label="Pick a time"
                        value={
                          selectedTime ? dayjs(selectedTime, "HH:mm") : null
                        }
                        onChange={(newValue) => {
                          setSelectedTime(
                            newValue ? newValue.format("HH:mm") : null
                          );
                        }}
                        slotProps={{
                          textField: {
                            size: "small",
                            sx: { width: "100%", mt: 2 },
                          },
                        }}
                      />
                    ) : (
                      <DesktopTimePicker
                        label="Pick a time"
                        value={
                          selectedTime ? dayjs(selectedTime, "HH:mm") : null
                        }
                        onChange={(newValue) => {
                          setSelectedTime(
                            newValue ? newValue.format("HH:mm") : null
                          );
                        }}
                        slotProps={{
                          textField: {
                            size: "small",
                            sx: { width: "100%", mt: 2 },
                          },
                        }}
                      />
                    )}
                  </div>
                  <Divider />
                  <List dense sx={{ mt: 1 }}>
                    {quickDates.map((item) => (
                      <ListItem disablePadding key={item.label}>
                        <ListItemButton
                          onClick={() => handleDateChange(item.date)}
                          sx={{ justifyContent: "space-between" }}
                        >
                          <ListItemIcon sx={{ minWidth: 30, ml: 1 }}>
                            {item.icon}
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Typography
                                sx={{ fontSize: 13, fontWeight: 500 }}
                              >
                                {item.label}
                              </Typography>
                            }
                          />
                          <Typography
                            sx={{ fontSize: 13, color: "#666", mr: 1 }}
                          >
                            {item.display(item.date)}
                          </Typography>
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </List>

                  <Box px={2} pb={2}>
                    <DateCalendar
                      disablePast
                      value={selectedDate}
                      onChange={handleDateChange}
                    />
                  </Box>
                </Box>
              </Popover>
            </LocalizationProvider>
          </div>

          <Divider />

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

      {filteredSections.length > 0 || !searchQuery ? (
        filteredSections.map((section) => (
          <div
            key={section}
            style={{ marginBottom: "1rem", borderRadius: 8, padding: 4 }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: 10,
              }}
            >
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

                <MoreHorizOutlinedIcon
                  style={{ fontSize: "20px", cursor: "pointer" }}
                  onClick={(event) => handleMenuClick(event, section)}
                />

                <Menu
                  anchorEl={anchorEl2}
                  open={Boolean(anchorEl2)}
                  onClose={handleMenuClose}
                >
                  <MenuItem onClick={handleDialogOpen}>
                    <DeleteIcon style={{ fontSize: "19px", marginRight: 12 }} />{" "}
                    <p style={{ fontSize: "13px" }}>Delete Section</p>
                  </MenuItem>
                </Menu>
              </div>
            </div>
            <Divider style={{ marginBottom: 6 }} />
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
                            // Update project data
                            setProjectData((prev) => ({
                              ...prev,
                              tasks: prev.tasks.map((t) =>
                                t.id === updatedTask.id
                                  ? { ...t, ...updatedTask }
                                  : t
                              ),
                            }));

                            // Sync with localStorage for user_events
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

                            localStorage.setItem(
                              "user_events",
                              JSON.stringify(updatedEvents)
                            );

                            // Close the modal
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
                      onMouseEnter={() => setHoveredSection(section)}
                      onMouseLeave={() => setHoveredSection(null)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        cursor: "pointer",
                        marginTop: 10,
                        color:
                          hoveredSection === section ? "#ff7800" : "inherit",
                      }}
                    >
                      {hoveredSection === section ? (
                        <AddIconFilled
                          style={{ marginRight: 8, fontSize: 20 }}
                        />
                      ) : (
                        <AddIcon style={{ marginRight: 8, fontSize: 20 }} />
                      )}
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

      <Dialog open={dialogOpen} onClose={handleDialogClose}>
        <DialogTitle>Are you sure you want to delete this section?</DialogTitle>
        <DialogActions>
          <Button onClick={handleDialogClose} color="primary">
            Cancel
          </Button>
          <Button onClick={confirmDelete} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {showSnackbar && <ToastContainer />}

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
