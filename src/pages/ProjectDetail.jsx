import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Box, Typography, TextField, Button, Paper } from "@mui/material";
import TaskForm from "../components/Task/Form";
import TaskItem from "../components/Task/Item";
import CompletedTaskList from "../components/Task/Completed"; // ✅ Import this
import CustomSnackbar from "../components/Snackbar";
import EditModal from "../components/Modal/Edit"; // ✅ Import EditModal

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
  const [editTask, setEditTask] = useState(null);
  const [data, setData] = useState(() => {
    const stored = localStorage.getItem("projects_data");
    if (stored) {
      const parsed = JSON.parse(stored);
      // Pastikan projectId yang baru mendapatkan nilai default kosong
      return parsed[projectId] || { sections: [], tasks: [] };
    }
    return { sections: [], tasks: [] };
  });

  const [newSection, setNewSection] = useState("");
  const [openFormSection, setOpenFormSection] = useState(null);
  const [completedTask, setCompletedTask] = useState(null);
  const [showSnackbar, setShowSnackbar] = useState(false);

  // Load project from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("projects_data");
    const allProjects = stored ? JSON.parse(stored) : {};
    if (!allProjects[projectId]) {
      // Inisialisasi proyek baru jika belum ada
      allProjects[projectId] = { sections: [], tasks: [] };
      localStorage.setItem("projects_data", JSON.stringify(allProjects));
    }
    setData(allProjects[projectId]);
  }, [projectId]);

  // Save project to localStorage
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

  const handleDeleteCompletedTask = (id) => {
    setData((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((task) => task.id !== id),
    }));
  };

  const handleClearCompletedTasks = () => {
    setData((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((task) => !task.completed),
    }));
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

  // Handle editing a task
  const handleEditTask = (task) => {
    setEditTask(task);
  };

  // Handle saving the edited task
  const handleSaveEdit = (editedTask) => {
    setData((prev) => ({
      ...prev,
      tasks: prev.tasks.map((task) =>
        task.id === editedTask.id ? editedTask : task
      ),
    }));
    setEditTask(null); // Close the edit modal
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
                  onEdit={() => handleEditTask(task)} // Open Edit Modal
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

      {/* Edit Modal */}
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
    </Box>
  );
};

export default ProjectDetail;
