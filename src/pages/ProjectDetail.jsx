import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Dialog,
  DialogActions,
  DialogContent,
  MenuItem,
  FormControl,
  Select,
  DialogContentText,
  DialogTitle,
  FormControlLabel,
  Switch,
} from "@mui/material";
import TaskForm from "../components/Task/Form";
import TaskItem from "../components/Task/Item";
import CustomSnackbar from "../components/Snackbar";
import EditModal from "../components/Modal/Edit";

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
  const [editTask, setEditTask] = useState(null);
  const [data, setData] = useState(() => {
    const stored = localStorage.getItem("projects_data");
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed[projectId] || { sections: [], tasks: [] };
    }
    return { sections: [], tasks: [] };
  });
  const [projects, setProjects] = useState(() => {
    const stored = localStorage.getItem("projects");
    return stored ? JSON.parse(stored) : [];
  });

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editProjectData, setEditProjectData] = useState({
    name: "",
    color: "",
  });

  const [newSection, setNewSection] = useState("");
  const [openFormSection, setOpenFormSection] = useState(null);
  const [completedTask, setCompletedTask] = useState(null);
  const [showSnackbar, setShowSnackbar] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("projects_data");
    const allProjects = stored ? JSON.parse(stored) : {};
    if (!allProjects[projectId]) {
      allProjects[projectId] = { sections: [], tasks: [] };
      localStorage.setItem("projects_data", JSON.stringify(allProjects));
    }
    setData(allProjects[projectId]);
  }, [projectId]);

  useEffect(() => {
    if (!projectId) return;
    const stored = localStorage.getItem("projects_data");
    const allProjects = stored ? JSON.parse(stored) : {};
    allProjects[projectId] = data;
    localStorage.setItem("projects_data", JSON.stringify(allProjects));
  }, [data, projectId]);

  const addSection = () => {
    const trimmed = newSection.trim();
    if (trimmed && !data.sections.includes(trimmed)) {
      setData((prev) => ({
        ...prev,
        sections: [...prev.sections, trimmed],
      }));
      setNewSection("");
    }
  };

  const addTask = (task) => {
    setData((prev) => ({
      ...prev,
      tasks: [...prev.tasks, { ...task, completed: false }],
    }));
  };

  const deleteTask = (id) => {
    setData((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((t) => t.id !== id),
    }));
  };

  const completeTask = (id) => {
    setData((prev) => {
      const updatedTasks = prev.tasks.map((t) =>
        t.id === id ? { ...t, completed: !t.completed } : t
      );
      return { ...prev, tasks: updatedTasks };
    });

    const task = data.tasks.find((t) => t.id === id);
    setCompletedTask(task);
    setShowSnackbar(true);
  };

  const handleUndo = () => {
    if (!completedTask) return;

    setData((prev) => {
      const updatedTasks = prev.tasks.map((task) =>
        task.id === completedTask.id ? { ...task, completed: false } : task
      );
      return { ...prev, tasks: updatedTasks };
    });

    setCompletedTask(null);
    setShowSnackbar(false);
  };

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeIndex = data.tasks.findIndex((t) => t.id === active.id);
    const overIndex = data.tasks.findIndex((t) => t.id === over.id);
    if (activeIndex === -1 || overIndex === -1) return;

    const newTasks = arrayMove(data.tasks, activeIndex, overIndex);
    setData((prev) => ({ ...prev, tasks: newTasks }));
  };

  const tasksByCategory = data.sections.reduce((acc, section) => {
    acc[section] = data.tasks.filter(
      (t) => t.category === section && !t.completed
    );
    return acc;
  }, {});

  const handleEditTask = (task) => {
    setEditTask(task);
  };

  const handleSaveEdit = (editedTask) => {
    setData((prev) => ({
      ...prev,
      tasks: prev.tasks.map((task) =>
        task.id === editedTask.id ? editedTask : task
      ),
    }));
    setEditTask(null);
  };

  useEffect(() => {
    const updateProjects = () => {
      const stored = localStorage.getItem("projects");
      setProjects(stored ? JSON.parse(stored) : []);
    };

    // Listen for storage changes or custom events
    window.addEventListener("localStorage-update", updateProjects);
    window.addEventListener("storage", updateProjects);

    return () => {
      window.removeEventListener("localStorage-update", updateProjects);
      window.removeEventListener("storage", updateProjects);
    };
  }, []);

  const deleteProject = () => {
    const stored = localStorage.getItem("projects");
    const allProjects = stored ? JSON.parse(stored) : [];

    const updatedProjects = allProjects.filter(
      (project) => project.id !== Number(projectId)
    );

    localStorage.setItem("projects", JSON.stringify(updatedProjects));
    window.dispatchEvent(new Event("localStorage-update"));
    setDeleteDialogOpen(false); // Close dialog
    navigate("/project");
  };

  useEffect(() => {
    if (editDialogOpen) {
      const stored = localStorage.getItem("projects");
      const allProjects = stored ? JSON.parse(stored) : [];
      const currentProject = allProjects.find(
        (project) => project.id === Number(projectId)
      );
      if (currentProject) {
        setEditProjectData(currentProject);
      }
    }
  }, [editDialogOpen, projectId]);

  const editProject = () => {
    const stored = localStorage.getItem("projects");
    const allProjects = stored ? JSON.parse(stored) : [];

    const updatedProjects = allProjects.map((project) =>
      project.id === Number(projectId)
        ? { ...project, ...editProjectData }
        : project
    );

    localStorage.setItem("projects", JSON.stringify(updatedProjects));
    window.dispatchEvent(new Event("localStorage-update"));
    setEditDialogOpen(false); // Close dialog
  };

  return (
    <Box p={3}>
      <Typography variant="h4" mb={2}>
        Project: {projectId}
      </Typography>

      <Box display="flex" mb={3}>
        <TextField
          label="Add Section"
          value={newSection}
          onChange={(e) => setNewSection(e.target.value)}
          size="small"
          sx={{ mr: 2 }}
        />
        <Button variant="contained" onClick={addSection}>
          Add Section
        </Button>
      </Box>

      {data.sections.map((section) => (
        <Paper key={section} sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6">{section}</Typography>

          <DndContext
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            sensors={sensors}
          >
            <SortableContext
              items={tasksByCategory[section].map((t) => t.id)}
              strategy={verticalListSortingStrategy}
            >
              {tasksByCategory[section]?.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onDelete={deleteTask}
                  onComplete={completeTask}
                  onEdit={() => handleEditTask(task)}
                />
              ))}
            </SortableContext>
          </DndContext>

          {openFormSection === section ? (
            <TaskForm
              defaultCategory={section}
              onAdd={(task) => {
                addTask(task);
                setOpenFormSection(null);
              }}
              onCancel={() => setOpenFormSection(null)}
            />
          ) : (
            <Button
              onClick={() => setOpenFormSection(section)}
              sx={{ mt: 2, fontSize: "12px" }}
              size="small"
              variant="outlined"
            >
              + Add Task
            </Button>
          )}
        </Paper>
      ))}

      <Box mt={3}>
        <Button
          variant="outlined"
          color="error"
          onClick={() => setDeleteDialogOpen(true)}
          sx={{ mr: 2 }}
        >
          Delete Project
        </Button>
        <Button variant="contained" onClick={() => setEditDialogOpen(true)}>
          Edit Project
        </Button>
      </Box>

      {editTask && (
        <EditModal
          task={editTask}
          onSave={handleSaveEdit}
          onClose={() => setEditTask(null)}
        />
      )}

      {showSnackbar && (
        <CustomSnackbar message="Task completed!" onUndo={handleUndo} />
      )}

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Project</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this project? This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={deleteProject} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
        <DialogTitle>Edit Project</DialogTitle>
        <DialogContent>
          {/* Project Name Input */}
          <TextField
            label="Project Name"
            value={editProjectData.name}
            onChange={(e) =>
              setEditProjectData((prev) => ({
                ...prev,
                name: e.target.value,
              }))
            }
            fullWidth
            margin="normal"
          />

          {/* Project Color Select */}
          <FormControl fullWidth margin="normal">
            <Select
              value={editProjectData.color}
              onChange={(e) =>
                setEditProjectData((prev) => ({
                  ...prev,
                  color: e.target.value,
                }))
              }
              displayEmpty
            >
              <MenuItem value="default">Default</MenuItem>
              <MenuItem value="blue">Blue</MenuItem>
              <MenuItem value="green">Green</MenuItem>
              <MenuItem value="red">Red</MenuItem>
            </Select>
          </FormControl>

          {/* Favorite Switch */}
          <FormControlLabel
            control={
              <Switch
                checked={editProjectData.isFavorite || false}
                onChange={(e) =>
                  setEditProjectData((prev) => ({
                    ...prev,
                    isFavorite: e.target.checked,
                  }))
                }
              />
            }
            label="Favorite"
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={editProject} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProjectDetail;
