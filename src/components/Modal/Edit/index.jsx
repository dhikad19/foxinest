import React, { useState, useEffect } from "react";
import {
  Modal,
  Box,
  Typography,
  Button,
  Popover,
  Menu,
  MenuItem,
  ListItemText,
  List,
  ListItem,
  ListItemIcon,
  Divider,
  Stack,
  ListItemButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/Check";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Bold from "@tiptap/extension-bold";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
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
    display: (d) => d.format("ddd"), // e.g., Mon
  },
  {
    label: "Tomorrow",
    date: dayjs().add(1, "day"),
    icon: <CalendarTodayIcon fontSize="small" />,
    display: (d) => d.format("ddd"), // e.g., Tue
  },
  {
    label: "This Weekend",
    date: dayjs().day(6), // Saturday
    icon: <WeekendIcon fontSize="small" />,
    display: (d) => d.format("ddd"), // e.g., Sat
  },
  {
    label: "Next Week",
    date: dayjs().add(1, "week").startOf("week").add(1, "day"), // Next Monday
    icon: <EventIcon fontSize="small" />,
    display: (d) => `${d.format("ddd")}, ${d.format("D MMM")}`, // Mon • 20 May
  },
];

const buttonMenu = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  paddingLeft: 8,
  paddingRight: 8,
  paddingBottom: 2,
  cursor: "pointer",
  paddingTop: 2,
  border: "1px solid #e0e0e0",
  marginRight: 6,
  borderRadius: 4,
  fontSize: 13,
  color: "#4f4f4f",
};

const EditModal = ({ task, onSave, onClose }) => {
  const [form, setForm] = useState(task);
  const [sections, setSections] = useState([]);

  // Popover controls
  const [dueAnchor, setDueAnchor] = useState(null);
  const [priorityAnchor, setPriorityAnchor] = useState(null);
  const [categoryAnchor, setCategoryAnchor] = useState(null);

  const titleEditor = useEditor({
    extensions: [StarterKit, Bold],
    content: task.title,
    editorProps: { attributes: { class: "title-editor" } },
    onUpdate: ({ editor }) => {
      if (!editor.isActive("bold")) editor.commands.setMark("bold");
      const text = editor.getText().trim();
      setForm((prev) => ({ ...prev, title: text }));
    },
  });

  const descriptionEditor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: "Description" }),
    ],
    content: task.description,
    editorProps: { attributes: { class: "description-editor" } },
    onUpdate: ({ editor }) => {
      setForm((prev) => ({ ...prev, description: editor.getHTML() }));
    },
  });

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("home_projects_data"));
    if (data?.sections) setSections(data.sections);
    setForm(task);
  }, [task]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
    onClose();
  };

  const selectedPriority = priorities.find((p) => p.value === form.priority);

  return (
    <Modal
      open={true}
      onClose={onClose}
      style={{ margin: "0px 10px 0px 10px" }}>
      <Box component="form" sx={modalStyle} onSubmit={handleSubmit}>
        <div style={{ padding: "0px 15px 0px 15px" }}>
          <Box sx={{ padding: 2 }}>
            {/* Header */}
            {/* '<Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            mb={1}>
            <Typography variant="h6">Edit Task</Typography>
          </Box>' */}

            {/* Title Editor */}
            <Box sx={editorBoxStyle}>
              <EditorContent
                editor={titleEditor}
                style={{ fontWeight: "bold" }}
              />
              {form.title === "" && (
                <div style={placeholderStyle}>Edit task title</div>
              )}
            </Box>

            {/* Description Editor */}
            <Box sx={editorBoxStyle}>
              <EditorContent editor={descriptionEditor} />
              {form.description === "" && (
                <div style={placeholderStyleDescription}>Description</div>
              )}
            </Box>

            {/* Menu Selectors */}
            <Box display="flex" mt={2}>
              {/* Due Date */}
              <div
                onClick={(e) => setDueAnchor(e.currentTarget)}
                style={buttonMenu}>
                <EventIcon
                  color="#4f4f4f"
                  style={{ fontSize: 15, marginRight: 5 }}
                />
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
                  <List dense style={{ marginTop: 10 }}>
                    {quickDates.map((item) => (
                      <ListItem disablePadding key={item.label}>
                        <ListItemButton
                          onClick={() => {
                            setForm((prev) => ({
                              ...prev,
                              dueDate: item.date.format("YYYY-MM-DD"),
                            }));
                            setDueAnchor(null);
                          }}
                          sx={{ justifyContent: "space-between" }}>
                          <ListItemIcon
                            sx={{ minWidth: 30 }}
                            style={{ marginLeft: "7px" }}>
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
                            style={{ marginRight: "7px" }}
                            sx={{ fontSize: 13, color: "#666" }}>
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
                onClick={(e) => setPriorityAnchor(e.currentTarget)}
                style={buttonMenu}>
                <FlagIcon
                  style={{
                    color: selectedPriority.color,
                    fontSize: 16,
                    marginRight: 5,
                  }}
                />
                {selectedPriority?.label || "Priority"}
              </div>
              <Menu
                anchorEl={priorityAnchor}
                open={Boolean(priorityAnchor)}
                MenuListProps={{ sx: { py: 0 } }}
                onClose={() => setPriorityAnchor(null)}>
                {priorities.map((p) => {
                  const isSelected = form.priority === p.value;
                  const iconColor = isSelected ? p.color : "#bdbdbd";
                  const textColor = isSelected ? p.color : "#4f4f4f";

                  return (
                    <MenuItem
                      key={p.value}
                      onClick={() => {
                        setForm((prev) => ({ ...prev, priority: p.value }));
                        setPriorityAnchor(null);
                      }}>
                      <span
                        style={{
                          fontSize: 13,
                          color: textColor,
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}>
                        <FlagIcon style={{ color: iconColor, fontSize: 16 }} />
                        <p>Priority {p.label}</p>
                      </span>
                    </MenuItem>
                  );
                })}
              </Menu>

              {/* Category */}
              <div
                onClick={(e) => setCategoryAnchor(e.currentTarget)}
                style={buttonMenu}>
                {form.category || "Category 🏷️"}
              </div>
              <Menu
                anchorEl={categoryAnchor}
                MenuListProps={{ sx: { py: 0 } }}
                open={Boolean(categoryAnchor)}
                onClose={() => setCategoryAnchor(null)}>
                <Divider />
                {sections.map((section, index) => {
                  const isSelected = form.category === section;
                  const textColor = isSelected ? "#ff7800" : "#4f4f4f"; // Blue for selected, gray otherwise

                  return (
                    <MenuItem
                      key={index}
                      onClick={() => {
                        setForm((prev) => ({ ...prev, category: section }));
                        setCategoryAnchor(null);
                      }}
                      sx={{
                        fontWeight: isSelected ? 600 : 400,
                        fontSize: 13,
                        color: textColor,
                      }}>
                      {section}
                    </MenuItem>
                  );
                })}
              </Menu>
            </Box>

            {/* Action Buttons */}
            <Divider style={{ margin: "15px 0px 15px 0px" }}></Divider>
            <Box display="flex" justifyContent="flex-end">
              <Button
                size="small"
                variant="contained"
                disableElevation
                style={{
                  textTransform: "capitalize",
                  marginRight: "6px",
                }}
                onClick={onClose}
                sx={{
                  color: "#000000",
                  backgroundColor: "#f0f0f0",
                }}>
                Cancel
              </Button>
              <Button
                size="small"
                type="submit"
                variant="contained"
                sx={{
                  backgroundColor: "#ff7800",
                  textTransform: "capitalize",
                  boxShadow: "none",
                  fontWeight: "bold",
                  "&:hover": { backgroundColor: "#e06f00" },
                }}>
                Save
              </Button>
            </Box>
          </Box>
        </div>
      </Box>
    </Modal>
  );
};

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  maxWidth: 450,
  width: "100%",
  bgcolor: "background.paper",
  borderRadius: "8px",
  outline: "none",
};

const editorBoxStyle = {
  borderRadius: 4,
  padding: 0,
  position: "relative",
  backgroundColor: "#fff",
};

const placeholderStyle = {
  position: "absolute",
  top: 6,
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
  fontSize: "15px",
  pointerEvents: "none",
};

export default EditModal;
