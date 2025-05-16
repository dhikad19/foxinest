import React, { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { Divider, Popover, Button, Stack, Box } from "@mui/material";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import AddIcon from "@mui/icons-material/Add";
import AddIconFilled from "@mui/icons-material/AddCircle";
import TaskItem from "../Item";
import TaskForm from "../Form";
// import EditModal from "../../components/Modal/Edit";
// Tiptap
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

// Icons
import { FaChevronDown, FaChevronRight } from "react-icons/fa";

// Date Picker
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import dayjs from "dayjs";

// 📝 Section name inline editor
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

const TaskList = ({
  tasksByCategory,
  onDelete,
  onEdit,
  onAdd,
  onDeleteSection,
  onEditSection,
  editingSection,
  setEditingSection,
  newSectionName,
  setNewSectionName,
  onReorderTasks,
  onComplete,
}) => {
  const [openForms, setOpenForms] = useState({});
  const [expandedSections, setExpandedSections] = useState({});
  const [activeTask, setActiveTask] = useState(null);
  const [showOverdue, setShowOverdue] = useState(true);
  const sensors = useSensors(useSensor(PointerSensor));
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [editingTaskId, setEditingTaskId] = useState(null);

  // 📅 Date picker state
  const [selectedDate, setSelectedDate] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const today = dayjs();
  const tomorrow = dayjs().add(1, "day");

  // const startEditing = (taskId) => {
  //   setEditingTaskId(taskId);
  // };

  // const stopEditing = () => {
  //   setEditingTaskId(null);
  // };

  // const handleSave = (updatedTask) => {
  //   onEdit(updatedTask); // Simpan perubahan ke task
  //   setEditingTaskId(null); // Keluar dari mode edit
  // };

  // const handleCancel = () => {
  //   setEditingTaskId(null); // Batalkan mode edit
  // };

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const toggleForm = (category) => {
    setOpenForms((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const toggleExpand = (category) => {
    setExpandedSections((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const handleDragStart = (event) => {
    const { active } = event;
    const allTasks = Object.values(tasksByCategory).flat();
    const task = allTasks.find((t) => t.id === active.id);
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    for (const [section, tasks] of Object.entries(tasksByCategory)) {
      const ids = tasks.map((t) => t.id);
      if (ids.includes(active.id) && ids.includes(over.id)) {
        const oldIndex = ids.indexOf(active.id);
        const newIndex = ids.indexOf(over.id);
        const reordered = arrayMove(tasks, oldIndex, newIndex);

        const allTasks = Object.entries(tasksByCategory).flatMap(
          ([cat, tList]) => (cat === section ? reordered : tList)
        );

        onReorderTasks(allTasks);
        return;
      }
    }
  };

  useEffect(() => {
    if (tasksByCategory && Object.keys(tasksByCategory).length > 0) {
      setExpandedSections((prev) => {
        const updated = { ...prev };
        for (const key of Object.keys(tasksByCategory)) {
          if (updated[key] === undefined) {
            updated[key] = true;
          }
        }
        return updated;
      });
    }
  }, [tasksByCategory]);

  // 🔍 Overdue tasks filter
  const overdueTasks = [];
  const todayStr = today.format("YYYY-MM-DD");

  const filteredTasksByCategory = Object.fromEntries(
    Object.entries(tasksByCategory).map(([category, tasks]) => {
      const validTasks = tasks.filter((task) => {
        const isOverdue = task.dueDate && task.dueDate < todayStr;
        if (isOverdue) {
          overdueTasks.push(task);
        }
        return !isOverdue;
      });
      return [category, validTasks];
    })
  );

  const handleDateChange = (newDate) => {
    if (!newDate) return;
    const formattedDate = newDate.format("YYYY-MM-DD");
    setSelectedDate(newDate);
    handleClose();

    // Update all overdue tasks with new date
    const updatedTasks = overdueTasks.map((task) => ({
      ...task,
      dueDate: formattedDate,
    }));

    // Keep non-overdue tasks
    const remainingTasks = Object.values(tasksByCategory)
      .flat()
      .filter((task) => !(task.dueDate && task.dueDate < todayStr));

    // Call external updater
    onReorderTasks([...remainingTasks, ...updatedTasks]);
  };

  return (
    <DndContext
      modifiers={[restrictToVerticalAxis]}
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div>
        {/* 🔴 Overdue Section */}
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

              {/* 📅 Date Picker Button */}
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <div
                  onClick={handleOpen}
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
                  open={open}
                  anchorEl={anchorEl}
                  onClose={handleClose}
                  anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "left",
                  }}
                >
                  <Box p={1}>
                    <Stack direction="row" spacing={1} padding={2}>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleDateChange(today)}
                      >
                        Today
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleDateChange(tomorrow)}
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
            <Divider />
            {showOverdue && (
              <div style={{ padding: 4 }}>
                {overdueTasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onDelete={onDelete}
                    onEdit={onEdit}
                    onComplete={onComplete}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ✅ Regular Sections */}
        {Object.entries(filteredTasksByCategory).map(([category, tasks]) => (
          <div
            key={category}
            style={{ marginBottom: "1rem", borderRadius: 8, padding: 4 }}
          >
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
                  onClick={() => toggleExpand(category)}
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
                  {expandedSections[category] ? (
                    <FaChevronDown size={10} color="grey" />
                  ) : (
                    <FaChevronRight size={10} color="grey" />
                  )}
                </div>
                <LiveSectionEditor
                  initialContent={category}
                  onChange={(newName) => onEditSection(category, newName)}
                />
              </div>
              <Button
                variant="contained"
                onClick={() => onDeleteSection(category)}
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
            <Divider />
            <div
              style={{
                overflow: "hidden",
                paddingLeft: 4,
                paddingRight: 4,
                maxHeight: expandedSections[category] ? "100%" : "0",
              }}
            >
              <SortableContext
                items={tasks.map((t) => t.id)}
                strategy={verticalListSortingStrategy}
              >
                {tasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onDelete={onDelete}
                    onEdit={onEdit}
                    onComplete={onComplete}
                  />
                ))}
              </SortableContext>

              {!openForms[category] && (
                <div
                  onClick={() => toggleForm(category)}
                  onMouseEnter={() => setHoveredCategory(category)}
                  onMouseLeave={() => setHoveredCategory(null)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    color: hoveredCategory === category ? "#ff7800" : "inherit",
                    cursor: "pointer",
                    marginTop: 10,
                  }}
                >
                  {hoveredCategory === category ? (
                    <AddIconFilled
                      style={{ marginRight: "8px", fontSize: 20 }}
                    />
                  ) : (
                    <AddIcon style={{ marginRight: "8px", fontSize: 20 }} />
                  )}

                  <p style={{ fontSize: 14, fontWeight: 500 }}>Add Task</p>
                </div>
              )}

              {openForms[category] && (
                <TaskForm
                  onAdd={(task) => {
                    onAdd(task);
                    toggleForm(category);
                  }}
                  defaultCategory={category}
                  onCancel={() => toggleForm(category)}
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </DndContext>
  );
};

export default TaskList;
