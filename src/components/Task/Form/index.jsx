import React, { useState, useEffect, useMemo } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Bold from "@tiptap/extension-bold";
import {
  Divider,
  Button,
  Popover,
  Menu,
  Box,
  Stack,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import FlagIcon from "@mui/icons-material/Flag";
import CheckIcon from "@mui/icons-material/Check";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

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

const DueDateMenuPicker = ({ form, setForm }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => setAnchorEl(null);

  const handleDateChange = (date) => {
    if (date) {
      setForm((prev) => ({
        ...prev,
        dueDate: date.format("YYYY-MM-DD"),
      }));
      handleClose();
    }
  };

  const open = Boolean(anchorEl);
  const selectedDate = form.dueDate ? dayjs(form.dueDate) : null;

  const today = dayjs();
  const tomorrow = dayjs().add(1, "day");

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div onClick={handleOpen} style={buttonMenu}>
        <span>
          {selectedDate ? selectedDate.format("MMM D, YYYY") : "Select Date 📅"}
        </span>
      </div>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}>
        <Box p={1}>
          {/* Quick Action Buttons */}
          <Stack direction="row" spacing={1} padding={3}>
            <Button
              size="small"
              variant="outlined"
              onClick={() => handleDateChange(today)}>
              Today
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={() => handleDateChange(tomorrow)}>
              Tomorrow
            </Button>
          </Stack>

          {/* Calendar */}
          <DateCalendar
            disablePast
            value={selectedDate}
            onChange={handleDateChange}
          />
        </Box>
      </Popover>
    </LocalizationProvider>
  );
};

const priorities = [
  { label: "High", value: "High", color: "#ff77009d" },
  { label: "Medium", value: "Medium", color: "#4f4f4f9f" },
  { label: "Low", value: "Low", color: "#1f50ff93" },
];

const PrioritySelector = ({ form, setForm }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  // Default to "Low" if none is selected
  const selectedPriority = form.priority || "Low";

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (priority) => {
    if (priority) {
      setForm((prev) => ({ ...prev, priority }));
    }
    setAnchorEl(null);
  };

  const selected = priorities.find((p) => p.value === selectedPriority);

  return (
    <>
      <div onClick={handleClick} style={buttonMenu}>
        <FlagIcon
          style={{ color: selected.color, fontSize: 16, marginRight: 5 }}
        />
        <span>{selected.label}</span>
      </div>
      <Menu
        MenuListProps={{ sx: { py: 0 } }}
        anchorEl={anchorEl}
        open={open}
        onClose={() => handleClose()}>
        {/* <span
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 14,
            color: "#4f4f4f",
            fontWeight: "bold",
            marginTop: 5,
            marginBottom: 5,
          }}>
          Priority
        </span>
        <Divider></Divider> */}
        {priorities.map((p) => {
          const isSelected = selectedPriority === p.value;
          const iconColor = isSelected ? p.color : "#bdbdbd";
          const textColor = isSelected ? p.color : "#4f4f4f";

          return (
            <MenuItem key={p.value} onClick={() => handleClose(p.value)}>
              <ListItemText>
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
              </ListItemText>
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
};

const TaskForm = ({ onAdd, defaultCategory = "", onCancel }) => {
  const [form, setForm] = useState({
    title: "",
    dueDate: "",
    priority: "Medium",
    description: "",
    category: defaultCategory,
  });

  // Random placeholder list for title
  const randomPlaceholders = [
    "Write blog post",
    "Buy groceries",
    "Fix the bug",
    "Water the plants",
    "Call mom",
    "Finish side project",
    "Plan weekend trip",
  ];

  const randomTitlePlaceholder = useMemo(() => {
    const index = Math.floor(Math.random() * randomPlaceholders.length);
    return randomPlaceholders[index];
  }, []);

  // Tiptap for title (light setup, single-line feel)
  const titleEditor = useEditor({
    extensions: [StarterKit, Bold], // DON'T disable paragraph
    content: "",
    editorProps: {
      attributes: {
        class: "title-editor",
      },
    },
    onCreate: ({ editor }) => {
      editor.chain().focus().setMark("bold").run();
    },
    onUpdate: ({ editor }) => {
      editor.chain().focus().setMark("bold").run();
      const text = editor.getText().trim();
      setForm((prev) => ({ ...prev, title: text }));
    },
  });

  // Tiptap for description
  const descriptionEditor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Description",
      }),
    ],
    content: "", // or "<p></p>" to make it valid
    onUpdate: ({ editor }) => {
      setForm((prev) => ({ ...prev, description: editor.getHTML() }));
    },
  });

  useEffect(() => {
    setForm((prev) => ({ ...prev, category: defaultCategory }));
  }, [defaultCategory]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.title.trim()) return;

    const newTask = {
      ...form,
      id: Date.now().toString(),
    };

    onAdd(newTask);

    // Reset form and editors
    setForm({
      title: "",
      dueDate: "",
      priority: "Medium",
      description: "",
      category: defaultCategory,
    });

    titleEditor?.commands.setContent("");
    descriptionEditor?.commands.setContent("");

    if (onCancel) onCancel();
  };

  return (
    <form onSubmit={handleSubmit} style={formStyles}>
      {/* Title (Tiptap) */}
      <div>
        <div style={editorBoxStyle}>
          <EditorContent
            className="tiptap-editor title-editor"
            editor={titleEditor}
          />
          {form.title === "" && (
            <div style={placeholderStyle}>{randomTitlePlaceholder}</div>
          )}
        </div>
      </div>

      {/* Description (Tiptap) */}
      <div style={{ marginBottom: "15px", marginTop: "3px" }}>
        <div style={editorBoxStyle}>
          <EditorContent
            className="tiptap-editor title-editor"
            editor={descriptionEditor}
          />
          {form.description === "" && (
            <div style={placeholderStyleDescription}>Description</div>
          )}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", marginBottom: 10 }}>
        <DueDateMenuPicker form={form} setForm={setForm} />
        <PrioritySelector form={form} setForm={setForm} />
        {/* <input
          type="text"
          name="category"
          placeholder="Category"
          value={form.category}
          onChange={handleChange}
        /> */}
      </div>

      {/* Buttons */}
      <Divider></Divider>
      <div
        style={{
          display: "flex",
          marginTop: 10,
          alignItems: "center",
          justifyContent: "space-between",
        }}>
        <span style={{ fontSize: 14, fontWeight: "bold", color: "#4f4f4f" }}>
          # {form.category}
        </span>
        <div style={{ display: "flex", gap: 6 }}>
          {onCancel && (
            <Button
              variant="contained"
              size="small"
              disableElevation
              sx={{
                color: "#000000",
                backgroundColor: "#f0f0f0",
              }}
              style={{
                textTransform: "capitalize",
                fontWeight: "bold",
                fontSize: "12px",
              }}
              onClick={onCancel}>
              Cancel
            </Button>
          )}

          <Button
            variant="contained"
            sx={{
              backgroundColor: "#ff7800",
              "&:hover": { backgroundColor: "#ff871f" },
            }}
            disableElevation
            size="small"
            disabled={form.title === ""}
            style={{
              textTransform: "capitalize",
              fontWeight: "bold",
              fontSize: "12px",
              marginRight: "6px",
            }}
            type="submit">
            Add Task
          </Button>
        </div>
      </div>
    </form>
  );
};

// Styles
const formStyles = {
  display: "flex",
  marginTop: "10px",
  flexDirection: "column",
  border: "1px solid #e0e0e0",
  padding: 10,
  borderRadius: 6,
};

const editorBoxStyle = {
  minHeight: "20px",
  position: "relative",
};

const placeholderStyle = {
  position: "absolute",
  top: 0,
  left: 0,
  color: "#aaa",
  fontSize: "17px",
  fontWeight: 600,
  pointerEvents: "none",
};

const placeholderStyleDescription = {
  position: "absolute",
  top: 0,
  left: 0,
  color: "#aaa",
  fontSize: "15px",
  pointerEvents: "none",
};

export default TaskForm;
