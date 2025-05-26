// REFACTORED TaskForm based on EditModal structure

import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Button,
  Typography,
  Popover,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  List,
  ListItem,
  ListItemButton,
  Divider,
} from "@mui/material";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Bold from "@tiptap/extension-bold";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import dayjs from "dayjs";

import FlagIcon from "@mui/icons-material/Flag";
import EventIcon from "@mui/icons-material/Event";
import TodayIcon from "@mui/icons-material/Today";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import WeekendIcon from "@mui/icons-material/Weekend";

const priorities = [
  { label: "High", value: "High", color: "#ff77009d" },
  { label: "Medium", value: "Medium", color: "#4f4f4f9f" },
  { label: "Low", value: "Low", color: "#1f50ff93" },
];

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
    date: dayjs().day(6),
    icon: <WeekendIcon fontSize="small" />,
    display: (d) => d.format("ddd"),
  },
  {
    label: "Next Week",
    date: dayjs().add(1, "week").startOf("week").add(1, "day"),
    icon: <EventIcon fontSize="small" />,
    display: (d) => `${d.format("ddd")}, ${d.format("D MMM")}`,
  },
];

const buttonMenu = {
  display: "flex",
  alignItems: "center",
  padding: "4px 8px",
  border: "1px solid #e0e0e0",
  borderRadius: 4,
  fontSize: 13,
  color: "#4f4f4f",
  cursor: "pointer",
  marginRight: 6,
};

const TaskForm = ({ onAdd, defaultCategory = "", onCancel }) => {
  const [form, setForm] = useState({
    title: "",
    description: "",
    dueDate: "",
    priority: "Medium",
    category: defaultCategory,
  });

  const [sections, setSections] = useState([]);
  const [dueAnchor, setDueAnchor] = useState(null);
  const [priorityAnchor, setPriorityAnchor] = useState(null);
  const [categoryAnchor, setCategoryAnchor] = useState(null);

  const randomPlaceholder = useMemo(() => {
    const items = [
      "Write blog post",
      "Buy groceries",
      "Fix the bug",
      "Water the plants",
      "Call mom",
      "Finish side project",
    ];
    return items[Math.floor(Math.random() * items.length)];
  }, []);

  const titleEditor = useEditor({
    extensions: [StarterKit, Bold],
    content: "",
    editorProps: { attributes: { class: "title-editor" } },
    onUpdate: ({ editor }) => {
      setForm((prev) => ({ ...prev, title: editor.getText().trim() }));
    },
  });

  const descriptionEditor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: "Description" }),
    ],
    content: "",
    editorProps: { attributes: { class: "description-editor" } },
    onUpdate: ({ editor }) => {
      setForm((prev) => ({ ...prev, description: editor.getHTML() }));
    },
  });

  useEffect(() => {
    setForm((prev) => ({ ...prev, category: defaultCategory }));
    const stored = JSON.parse(localStorage.getItem("home_projects_data"));
    if (stored?.sections) setSections(stored.sections);
  }, [defaultCategory]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;

    onAdd({
      ...form,
      id: Date.now().toString(),
    });

    setForm({
      title: "",
      description: "",
      dueDate: "",
      priority: "Medium",
      category: defaultCategory,
    });

    titleEditor?.commands.setContent("");
    descriptionEditor?.commands.setContent("");

    if (onCancel) onCancel();
  };

  const selectedPriority = priorities.find((p) => p.value === form.priority);

  return (
    <Box component="form" sx={modalStyle} onSubmit={handleSubmit}>
      <Box sx={{ padding: 1 }}>
        {/* Title */}
        <Box sx={editorBoxStyle}>
          <EditorContent editor={titleEditor} />
          {form.title === "" && (
            <div style={placeholderStyle}>{randomPlaceholder}</div>
          )}
        </Box>

        {/* Description */}
        <Box sx={editorBoxStyle}>
          <EditorContent editor={descriptionEditor} />
          {form.description === "" && (
            <div style={placeholderStyleDescription}>Description</div>
          )}
        </Box>

        {/* Menus */}
        <Box display="flex" mt={2}>
          {/* Due Date */}
          <div
            style={buttonMenu}
            onClick={(e) => setDueAnchor(e.currentTarget)}>
            <EventIcon style={{ fontSize: 16, marginRight: 4 }} />
            {form.dueDate
              ? dayjs(form.dueDate).format("MMM D, YYYY")
              : "Select Date"}
          </div>
          <Popover
            open={Boolean(dueAnchor)}
            anchorEl={dueAnchor}
            onClose={() => setDueAnchor(null)}
            anchorOrigin={{ vertical: "bottom", horizontal: "left" }}>
            <Box>
              <List dense sx={{ mt: 1 }}>
                {quickDates.map((item) => (
                  <ListItem disablePadding key={item.label}>
                    <ListItemButton
                      onClick={() => {
                        setForm((prev) => ({
                          ...prev,
                          dueDate: item.date.format("YYYY-MM-DD"),
                        }));
                        setDueAnchor(null);
                      }}>
                      <ListItemIcon sx={{ minWidth: 30 }}>
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography sx={{ fontSize: 13 }}>
                            {item.label}
                          </Typography>
                        }
                      />
                      <Typography sx={{ fontSize: 13, mr: 1 }}>
                        {item.display(item.date)}
                      </Typography>
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>

              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DateCalendar
                  disablePast
                  value={form.dueDate ? dayjs(form.dueDate) : null}
                  onChange={(date) => {
                    if (date) {
                      setForm((prev) => ({
                        ...prev,
                        dueDate: date.format("YYYY-MM-DD"),
                      }));
                      setDueAnchor(null);
                    }
                  }}
                />
              </LocalizationProvider>
            </Box>
          </Popover>

          {/* Priority */}
          <div
            style={buttonMenu}
            onClick={(e) => setPriorityAnchor(e.currentTarget)}>
            <FlagIcon
              style={{
                color: selectedPriority?.color,
                fontSize: 16,
                marginRight: 4,
              }}
            />
            {selectedPriority?.label || "Priority"}
          </div>
          <Menu
            anchorEl={priorityAnchor}
            open={Boolean(priorityAnchor)}
            onClose={() => setPriorityAnchor(null)}>
            {priorities.map((p) => (
              <MenuItem
                key={p.value}
                onClick={() => {
                  setForm((prev) => ({ ...prev, priority: p.value }));
                  setPriorityAnchor(null);
                }}>
                <FlagIcon
                  style={{
                    fontSize: 16,
                    marginRight: 6,
                    color: form.priority === p.value ? p.color : "#bdbdbd",
                  }}
                />
                <Typography sx={{ fontSize: 13 }}>
                  Priority {p.label}
                </Typography>
              </MenuItem>
            ))}
          </Menu>

          {/* Category */}
          <div
            style={buttonMenu}
            onClick={(e) => setCategoryAnchor(e.currentTarget)}>
            {form.category || "Category 🏷️"}
          </div>
          <Menu
            anchorEl={categoryAnchor}
            open={Boolean(categoryAnchor)}
            onClose={() => setCategoryAnchor(null)}>
            {sections.map((section) => (
              <MenuItem
                key={section}
                onClick={() => {
                  setForm((prev) => ({ ...prev, category: section }));
                  setCategoryAnchor(null);
                }}>
                {section}
              </MenuItem>
            ))}
          </Menu>
        </Box>

        {/* Footer Buttons */}
        <Divider sx={{ my: 2 }} />
        <Box display="flex" justifyContent="flex-end">
          {onCancel && (
            <Button
              size="small"
              variant="contained"
              disableElevation
              onClick={onCancel}
              sx={{
                backgroundColor: "#f0f0f0",
                color: "#000",
                textTransform: "capitalize",
                mr: 1,
              }}>
              Cancel
            </Button>
          )}
          <Button
            size="small"
            type="submit"
            variant="contained"
            disableElevation
            sx={{
              backgroundColor: "#ff7800",
              "&:hover": { backgroundColor: "#e06f00" },
              textTransform: "capitalize",
            }}
            disabled={!form.title.trim()}>
            Add Task
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

// Styles
const modalStyle = {
  width: "100%",
  bgcolor: "background.paper",
  borderRadius: 2,
};

const editorBoxStyle = {
  minHeight: 24,
  position: "relative",
};

const placeholderStyle = {
  position: "absolute",
  top: 0,
  left: 0,
  color: "#aaa",
  fontWeight: 500,
  pointerEvents: "none",
};

const placeholderStyleDescription = {
  position: "absolute",
  top: 2,
  left: 0,
  color: "#aaa",
  fontSize: "14px",
  pointerEvents: "none",
};

export default TaskForm;
