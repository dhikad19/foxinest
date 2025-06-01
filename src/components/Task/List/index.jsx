import React, { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  Menu,
  MenuItem,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemButton,
  ListItemText,
  Typography,
} from "@mui/material";
import { Dialog, DialogTitle, DialogActions } from "@mui/material";

import MoreHorizOutlinedIcon from "@mui/icons-material/MoreHorizOutlined";

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
import EditTask from "../../Modal/Edit";
// import EditModal from "../../components/Modal/Edit";
// Tiptap
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

// Icons
import {
  Today as TodayIcon,
  CalendarToday as CalendarTodayIcon,
  Weekend as WeekendIcon,
  Event as EventIcon,
} from "@mui/icons-material";
import { FaChevronDown, FaChevronRight } from "react-icons/fa";

// Date Picker
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import dayjs from "dayjs";

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
  const [activeId, setActiveId] = useState(null);
  const [draggedItem, setDraggedItem] = useState(null);
  // 📅 Date picker state
  const [selectedDate, setSelectedDate] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const today = dayjs();
  const tomorrow = dayjs().add(1, "day");
  const [isDragging, setIsDragging] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [menuCategory, setMenuCategory] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDeleteCategory, setPendingDeleteCategory] = useState(null);

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

  // const handleDragStart = (event) => {
  //   const { active } = event;
  //   setActiveId(active.id);
  //   setDraggedItem(active.data.current); // Ambil data item yang sedang di-drag
  // };

  // const handleDragEnd = (event) => {
  //   const { active, over } = event;
  //   if (over && active.id !== over.id) {
  //     const updatedTasks = arrayMove(tasksByCategory, active.index, over.index);
  //     onReorderTasks(updatedTasks);
  //   }
  //   setActiveId(null);
  // };

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMenuOpen = (event, category) => {
    setMenuAnchorEl(event.currentTarget);
    setMenuCategory(category);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setMenuCategory(null);
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

  const onClose = () => {
    setEditingTaskId(null); // Tutup mode edit
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

  const handleEdit = (updatedTask) => {
    // Update tasksByCategory dengan task yang telah diubah
    const updatedTasksByCategory = { ...tasksByCategory };
    const category = updatedTask.category;
    const taskIndex = updatedTasksByCategory[category].findIndex(
      (task) => task.id === updatedTask.id
    );
    if (taskIndex !== -1) {
      updatedTasksByCategory[category][taskIndex] = updatedTask;
    }
    onReorderTasks(updatedTasksByCategory);
  };

  const handleDateChange = (newDate) => {
    if (!newDate) return;
    const formatted = newDate.format("YYYY-MM-DD");

    const updatedTasks = Object.values(tasksByCategory)
      .flat()
      .map((task) =>
        task.dueDate && task.dueDate < todayStr
          ? { ...task, dueDate: formatted }
          : task
      );

    setSelectedDate(newDate);
    setEditingTaskId(null);
    setAnchorEl(null);

    onReorderTasks(updatedTasks);
  };

  return (
    <>
      <DndContext
        modifiers={[restrictToVerticalAxis]}
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart} // Menangani drag start
        onDragEnd={handleDragEnd} // Menangani drag end
      >
        <div>
          <DragOverlay>
            {draggedItem ? (
              <div
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#fff",
                  borderRadius: "12px",
                  boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.1)",
                  opacity: isDragging ? 0.7 : 0.9, // Adjust opacity dynamically
                  cursor: "move",
                  fontSize: "16px",
                  fontWeight: "500",
                  color: "#333",
                  // Disable transition during dragging for smooth behavior
                  transition: isDragging ? "none" : "all 0.3s ease",
                }}>
                {draggedItem.name}
              </div>
            ) : null}
          </DragOverlay>

          {overdueTasks.length > 0 && (
            <div style={{ marginBottom: "1rem", borderRadius: 8, padding: 4 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 10,
                }}>
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
                    }}>
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
                      backgroundColor: "rgb(241, 241, 241)",
                      fontWeight: 500,
                      fontSize: 14,
                    }}>
                    {selectedDate
                      ? selectedDate.format("MMM D, YYYY")
                      : "Select Date"}
                  </div>

                  <Popover
                    open={Boolean(anchorEl)}
                    anchorEl={anchorEl}
                    onClose={() => setAnchorEl(null)}
                    anchorOrigin={{ vertical: "bottom", horizontal: "left" }}>
                    <Box>
                      <List dense sx={{ mt: 1 }}>
                        {quickDates.map((item) => (
                          <ListItem disablePadding key={item.label}>
                            <ListItemButton
                              onClick={() => handleDateChange(item.date)}
                              sx={{ justifyContent: "space-between" }}>
                              <ListItemIcon sx={{ minWidth: 30, ml: 1 }}>
                                {item.icon}
                              </ListItemIcon>
                              <ListItemText
                                primary={
                                  <Typography
                                    sx={{ fontSize: 13, fontWeight: 500 }}>
                                    {item.label}
                                  </Typography>
                                }
                              />
                              <Typography
                                sx={{ fontSize: 13, color: "#666", mr: 1 }}>
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
                      <EditTask
                        key={task.id}
                        task={task}
                        onSave={(updatedTask) => {
                          onEdit(updatedTask);
                          setEditingTaskId(null);
                        }}
                        onCancel={() => onClose()} // Panggil onClose saat Cancel
                        onClose={onClose} // Pass fungsi onClose ke EditTask
                      />
                    ) : (
                      <TaskItem
                        key={task.id}
                        task={task}
                        onDelete={onDelete} // Fungsi untuk menghapus task
                        onEdit={() => setEditingTaskId(task.id)} // Masuk ke mode edit ketika tombol edit diklik
                        onComplete={onComplete} // Fungsi untuk menyelesaikan task
                      />
                    )
                  )}
                </div>
              )}
            </div>
          )}

          {/* ✅ Regular Sections */}
          {Object.entries(filteredTasksByCategory).map(([category, tasks]) => (
            <div
              key={category}
              style={{ marginBottom: "1rem", borderRadius: 8, padding: 4 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 10,
                }}>
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
                    }}>
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
                <MoreHorizOutlinedIcon
                  style={{ fontSize: "20px", cursor: "pointer" }}
                  onClick={(e) => handleMenuOpen(e, category)}
                />

                <Menu
                  anchorEl={menuAnchorEl}
                  open={Boolean(menuAnchorEl) && menuCategory === category}
                  onClose={handleMenuClose}>
                  <MenuItem
                    onClick={() => {
                      setPendingDeleteCategory(category);
                      setConfirmOpen(true);
                      handleMenuClose();
                    }}
                    style={{ fontSize: 14 }}>
                    Delete Section
                  </MenuItem>
                </Menu>
              </div>

              <Divider style={{ marginBottom: 6 }} />
              <div
                style={{
                  overflow: "hidden",
                  paddingLeft: 4,
                  paddingRight: 4,
                  maxHeight: expandedSections[category] ? "100%" : "0",
                }}>
                <SortableContext
                  items={tasks.map((t) => t.id)}
                  strategy={verticalListSortingStrategy}>
                  {tasks.map((task) =>
                    editingTaskId === task.id ? (
                      <EditTask
                        key={task.id}
                        task={task}
                        onSave={(updatedTask) => {
                          onEdit(updatedTask);
                          setEditingTaskId(null);
                        }}
                        onCancel={() => onClose()} // Panggil onClose saat Cancel
                        onClose={onClose} // Pass fungsi onClose ke EditTask
                      />
                    ) : (
                      <TaskItem
                        key={task.id}
                        task={task}
                        onDelete={onDelete}
                        onEdit={() => setEditingTaskId(task.id)}
                        onComplete={onComplete}
                      />
                    )
                  )}
                </SortableContext>

                {!openForms[category] && (
                  <div
                    onClick={() => toggleForm(category)}
                    onMouseEnter={() => setHoveredCategory(category)}
                    onMouseLeave={() => setHoveredCategory(null)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      color:
                        hoveredCategory === category ? "#ff7800" : "inherit",
                      cursor: "pointer",
                      marginTop: 10,
                    }}>
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
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Are you sure you want to delete this section?</DialogTitle>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} color="primary">
            Cancel
          </Button>
          <Button
            onClick={() => {
              onDeleteSection(pendingDeleteCategory);
              setConfirmOpen(false);
            }}
            color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default TaskList;
