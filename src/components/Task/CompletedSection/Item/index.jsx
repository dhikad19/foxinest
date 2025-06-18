import React, { useState, useMemo, useEffect } from "react";
import dayjs from "dayjs";
import {
  Dialog,
  Divider,
  IconButton,
  Menu,
  DialogContent,
  MenuItem,
  useTheme,
  DialogTitle,
  Checkbox,
  ListItem,
  ListItemText,
  List,
  Button,
  Tooltip,
} from "@mui/material";
import { Link } from "react-router-dom";
import FlagIcon from "@mui/icons-material/Flag";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import { useEditor, EditorContent } from "@tiptap/react";
import DateIcon from "@mui/icons-material/DateRangeOutlined";
import MoreHorizOutlinedIcon from "@mui/icons-material/MoreHorizOutlined";
import useMediaQuery from "@mui/material/useMediaQuery";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import CloseIcon from "@mui/icons-material/Close";
import CommentsIcon from "@mui/icons-material/ChatBubbleOutline";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import InsertEmoticonIcon from "@mui/icons-material/InsertEmoticon";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import EmojiPicker from "emoji-picker-react";

const CompletedTaskItem = ({ task, onDelete, onComplete }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const menuOpen = Boolean(anchorEl);
  const [editingContent, setEditingContent] = useState("");
  const [anchorElCommentMenu, setAnchorElCommentMenu] = useState(null);
  const [open, setOpen] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentMenuIndex, setCommentMenuIndex] = useState(null);
  const [editCommentEditor, setEditCommentEditor] = useState(null);
  const [commentToEdit, setCommentToEdit] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [addCommentEditor, setAddCommentEditor] = useState(null);
  const [anchorElEmoji, setAnchorElEmoji] = useState(null);
  const [lastFocusedEditor, setLastFocusedEditor] = useState(null);
  function formatDate(date) {
    const currentYear = new Date().getFullYear();
    const parsedDate = new Date(date);

    const options = {
      day: "2-digit",
      month: "short",
      ...(parsedDate.getFullYear() !== currentYear && { year: "numeric" }),
    };

    return new Intl.DateTimeFormat("en-GB", options).format(parsedDate);
  }
  // Get project name by task.id from localStorage
  const projectName = useMemo(() => {
    const projects = JSON.parse(localStorage.getItem("projects")) || [];
    const match = projects.find((p) => p.id === task.projectId);
    return match ? match.name : task.projectId;
  }, [task.projectId]);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleEmojiSelect = (emoji) => {
    if (lastFocusedEditor === "edit" && editCommentEditor) {
      editCommentEditor.chain().focus().insertContent(emoji.emoji).run();
    } else if (lastFocusedEditor === "add" && addCommentEditor) {
      addCommentEditor.chain().focus().insertContent(emoji.emoji).run();
    } else {
      addCommentEditor?.chain().focus().insertContent(emoji.emoji).run();
    }

    handleCloseEmojiPicker();
  };
  const handleEditComment = (index) => {
    const commentText = comments[index]?.text || "";

    // Tampilkan editor edit
    setCommentToEdit(index);
    setEditingContent(commentText);

    // Masukkan konten ke editor dan fokuskan editor
    if (editCommentEditor) {
      editCommentEditor.commands.setContent(commentText);
      editCommentEditor.chain().focus().run();
    }

    handleCloseCommentMenu();
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDelete = () => {
    onDelete(task.id);
    handleMenuClose();
  };

  const handleOpenCommentMenu = (event, index) => {
    setAnchorElCommentMenu(event.currentTarget);
    setCommentMenuIndex(index);
  };

  const handleAddComment = () => {
    if (addCommentEditor && !addCommentEditor.isEmpty) {
      const newComment = {
        text: addCommentEditor.getHTML(),
        date: new Date().toLocaleString(),
      };
      const updatedComments = [...comments, newComment];
      setComments(updatedComments);
      localStorage.setItem(
        `task_${task.id}_comments`,
        JSON.stringify(updatedComments)
      );
      addCommentEditor.commands.clearContent();
    }
  };

  const handleCloseCommentMenu = () => {
    setAnchorElCommentMenu(null);
    setCommentMenuIndex(null);
  };

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const handleOpen = (e) => {
    if (!anchorEl) {
      setOpen(true);
    }
  };
  const handleClose = () => setOpen(false);
  const addEditor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Write your comment here...",
      }),
    ],
    content: "",
    onUpdate: ({ editor }) => {
      setNewComment(editor.getHTML());
    },
  });
  const editEditor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Edit your comment here...",
      }),
    ],
    content: "",
  });
  const handleOpenEmojiPicker = (event) =>
    setAnchorElEmoji(event.currentTarget);
  const handleCloseEmojiPicker = () => setAnchorElEmoji(null);
  const handleDeleteComment = (index) => {
    const updatedComments = comments.filter((_, i) => i !== index);
    setComments(updatedComments);
    localStorage.setItem(
      `task_${task.id}_comments`,
      JSON.stringify(updatedComments)
    );
    handleCloseCommentMenu();
  };
  const saveEditedComment = () => {
    if (editCommentEditor && !editCommentEditor.isEmpty) {
      const updatedComments = comments.map((comment, index) =>
        index === commentToEdit
          ? { ...comment, text: editCommentEditor.getHTML() }
          : comment
      );
      setComments(updatedComments);
      localStorage.setItem(
        `task_${task.id}_comments`,
        JSON.stringify(updatedComments)
      );
      setCommentToEdit(null);
      editCommentEditor.commands.clearContent();
    }
  };

  useEffect(() => {
    setAddCommentEditor(addEditor);
    setEditCommentEditor(editEditor);

    return () => {
      addEditor?.destroy();
      editEditor?.destroy();
    };
  }, [addEditor, editEditor]);

  useEffect(() => {
    const storedComments = JSON.parse(
      localStorage.getItem(`task_${task.id}_comments`)
    );
    if (storedComments) {
      setComments(storedComments);
    }
  }, [task.id]);

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "start",
          marginTop: 15,
          marginBottom: 15,
        }}
      >
        <div style={{ flex: 1 }}>
          {task.dateCompleted && (
            <div
              style={{ display: "flex", alignItems: "center", marginBottom: 5 }}
            >
              <DateIcon
                style={{
                  fontSize: 19,
                  marginRight: 5,
                  marginLeft: "-2px",
                  color: "#4f4f4f",
                }}
              />
              <p style={{ fontSize: "14px" }}>{task.dateCompleted}</p>
            </div>
          )}
          <p style={{ fontSize: 15 }}>
            <b style={{ marginRight: 5 }}>You</b>
            completed a task:
            <span
              style={{
                marginLeft: 5,
                cursor: "pointer",
                textDecoration: "underline",
              }}
              onClick={handleOpen}
            >
              {task.title}
            </span>
          </p>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              marginTop: 10,
            }}
          >
            <p style={{ fontSize: "14px" }}>{task.timeCompleted}</p>
            <Link
              style={{ color: "black" }}
              to={
                task.source === "home_projects_data"
                  ? "/"
                  : `/project/${projectName}`
              }
            >
              <p style={{ fontSize: "14px" }}>
                <b>
                  {task.source === "home_projects_data"
                    ? `#Home`
                    : `#${projectName.replaceAll("-", " ")}`}
                </b>
              </p>
            </Link>
          </div>
        </div>
      </div>
      <Divider />
      <Dialog
        fullScreen={fullScreen}
        open={open}
        onClose={handleClose}
        fullWidth
        maxWidth="sm"
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <DialogTitle
            style={{ padding: "12px 24px", fontSize: 17, marginTop: 5 }}
          >
            Completed
          </DialogTitle>
          <div
            style={{ display: "flex", alignItems: "center", cursor: "pointer" }}
          >
            <MoreHorizOutlinedIcon
              style={{ fontSize: "20px", cursor: "pointer" }}
              onClick={(e) => {
                e.stopPropagation(); // prevent dialog from opening
                handleMenuOpen(e);
              }}
            />

            <Menu anchorEl={anchorEl} open={menuOpen} onClose={handleMenuClose}>
              <MenuItem style={{ fontSize: 14 }} onClick={handleDelete}>
                <DeleteIcon style={{ fontSize: "19px", marginRight: 12 }} />{" "}
                <p style={{ fontSize: "13px" }}>Delete</p>
              </MenuItem>
            </Menu>
            <div
              style={{ padding: "12px 19px", marginTop: 5 }}
              onClick={handleClose}
            >
              <CloseIcon />
            </div>
          </div>
        </div>
        <Divider />
        <DialogContent
          style={{
            display: "flex",
            flexDirection: "column",
            maxHeight: fullScreen ? "92%" : "600px",
            overflow: "hidden",
          }}
        >
          <div>
            <div
              style={{
                marginBottom: "16px",
                display: "flex",
                alignItems: "flex-start",
              }}
            >
              {/* Checkbox */}
              <Checkbox
                checked={task.completed}
                onChange={() => onComplete(task.id)}
                style={{ marginRight: "10px", marginLeft: "-2px" }}
                size="small"
                sx={{
                  "& .MuiSvgIcon-root": {
                    color:
                      task.priority === "High"
                        ? "#ff77009d"
                        : task.priority === "Medium"
                        ? "#4f4f4f9f"
                        : task.priority === "Low"
                        ? "#1f50ff93"
                        : "black",
                  },
                  "&.Mui-checked .MuiSvgIcon-root": {
                    color:
                      task.priority === "High"
                        ? "#ff77009d"
                        : task.priority === "Medium"
                        ? "#4f4f4f9f"
                        : task.priority === "Low"
                        ? "#1f50ff93"
                        : "black",
                  },
                  p: 0,
                }}
              />

              {/* Title & Description */}
              <div style={{ marginLeft: 4 }}>
                <p
                  style={{
                    fontSize: "15px",
                    fontWeight: 500,
                    lineHeight: "normal",
                    marginBottom: 10,
                    textDecoration: "line-through",
                    marginTop: 0,
                  }}
                >
                  {task.title}
                </p>
                <div
                  style={{ fontSize: "14px", textDecoration: "line-through" }}
                  dangerouslySetInnerHTML={{ __html: task.description }}
                />
              </div>
            </div>

            {task.dueDate && (
              <>
                <Divider />
                <div style={{ marginBottom: 12, marginTop: 12 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginTop: 5,
                    }}
                  >
                    <DateIcon
                      style={{
                        fontSize: 19,
                        marginRight: 16,
                        marginLeft: "-2px",
                        color: "#4f4f4f",
                      }}
                    />
                    <p style={{ fontSize: 14 }}>
                      {(() => {
                        const currentYear = new Date().getFullYear();
                        const dueDate = new Date(task.dueDate);
                        const options = {
                          day: "2-digit",
                          month: "short",
                          ...(dueDate.getFullYear() !== currentYear && {
                            year: "numeric",
                          }),
                        };
                        return new Intl.DateTimeFormat("en-GB", options).format(
                          dueDate
                        );
                      })()}
                    </p>
                  </div>
                </div>
              </>
            )}
            {task.dueTime && (
              <>
                <Divider />
                <div style={{ marginBottom: 12, marginTop: 12 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginTop: 5,
                    }}
                  >
                    <AccessTimeOutlinedIcon
                      style={{
                        fontSize: 19,
                        marginRight: 16,
                        marginLeft: "-2px",
                        color: "#4f4f4f",
                      }}
                    />
                    <p style={{ fontSize: 14 }}>{task.dueTime}</p>
                  </div>
                </div>
              </>
            )}
            <Divider />
            <div style={{ marginBottom: 12, marginTop: 12 }}>
              <div
                style={{ display: "flex", alignItems: "center", marginTop: 5 }}
              >
                <FlagIcon
                  style={{
                    fontSize: 19,
                    marginRight: 16,
                    marginLeft: "-2px",
                    color: "#4f4f4f",
                  }}
                />
                <p style={{ fontSize: 14 }}>{task.priority}</p>
              </div>
            </div>
            <Divider />
          </div>
          <div style={{ flexGrow: 1, overflowY: "auto" }}>
            <div>
              <div
                style={{
                  marginTop: 12,
                  marginBottom: 12,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <CommentsIcon
                  style={{
                    fontSize: 17,
                    marginRight: 17,
                    marginLeft: "-2px",
                    color: "#4f4f4f",
                  }}
                />
                <p style={{ fontSize: 14 }}>Comments</p>
              </div>
              <Divider />
              {comments.length > 0 ? (
                <List>
                  {comments.map((comment, index) => (
                    <ListItem
                      key={index}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        paddingLeft: 0,
                        paddingRight: 0,
                      }}
                    >
                      {commentToEdit === index ? (
                        <div style={{ flexGrow: 1 }}>
                          <div
                            style={{
                              position: "relative",
                              marginBottom: "8px",
                            }}
                          >
                            {editingContent.trim() === "" && (
                              <div style={placeholderStyleDescription}>
                                Edit your comment here...
                              </div>
                            )}
                            <div
                              style={{
                                border: "1px solid #ccc",
                                borderRadius: "4px",
                                padding: "8px",
                                minHeight: "120px",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "space-between",
                                fontSize: "14px",
                              }}
                            >
                              <div
                                style={{
                                  position: "relative",
                                  marginBottom: "8px",
                                }}
                              >
                                {editCommentEditor?.isEmpty && (
                                  <div style={placeholderStyleDescription}>
                                    Edit your comment
                                  </div>
                                )}

                                <EditorContent
                                  editor={editCommentEditor}
                                  className="border p-2 rounded-md"
                                  style={{
                                    border: "1px solid #ccc",
                                    borderRadius: "4px",
                                    padding: "8px",
                                    minHeight: "120px",
                                  }}
                                />
                              </div>

                              <div
                                style={{
                                  display: "flex",
                                  marginTop: 10,
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                }}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "2px",
                                  }}
                                >
                                  <IconButton
                                    onClick={handleOpenEmojiPicker}
                                    size="small"
                                  >
                                    <InsertEmoticonIcon
                                      style={{ fontSize: 20, color: "#4f4f4f" }}
                                    />
                                  </IconButton>

                                  <Tooltip title="In development" arrow>
                                    <IconButton size="small">
                                      <AttachFileIcon
                                        style={{
                                          fontSize: 20,
                                          color: "#4f4f4f",
                                        }}
                                      />
                                    </IconButton>
                                  </Tooltip>
                                  <Menu
                                    anchorEl={anchorElEmoji}
                                    open={Boolean(anchorElEmoji)}
                                    onClose={handleCloseEmojiPicker}
                                  >
                                    <EmojiPicker
                                      onEmojiClick={handleEmojiSelect}
                                    />
                                  </Menu>
                                </div>
                                <div style={{ display: "flex", gap: "2px" }}>
                                  <Button
                                    onClick={() => setCommentToEdit(null)}
                                    size="small"
                                    variant="contained"
                                    disableElevation
                                    style={{
                                      textTransform: "capitalize",
                                      marginRight: "6px",
                                    }}
                                    sx={{
                                      color: "#000000",
                                      backgroundColor: "#f0f0f0",
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    onClick={saveEditedComment}
                                    size="small"
                                    variant="contained"
                                    sx={{
                                      backgroundColor: "#ff7800",
                                      textTransform: "capitalize",
                                      boxShadow: "none",
                                      fontWeight: "bold",
                                      "&:hover": { backgroundColor: "#e06f00" },
                                    }}
                                  >
                                    Save
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <>
                          <ListItemText
                            primary={
                              <div
                                style={{ fontSize: "14px" }}
                                dangerouslySetInnerHTML={{
                                  __html: comment.text,
                                }}
                              />
                            }
                            secondary={
                              <p style={{ fontSize: "12px" }}>
                                Posted on: {formatDate(comment.date)}
                              </p>
                            }
                            style={{ flexGrow: 1 }}
                          />
                          <IconButton
                            onClick={(e) => handleOpenCommentMenu(e, index)}
                          >
                            <MoreHorizOutlinedIcon />
                          </IconButton>
                          <Menu
                            anchorEl={anchorElCommentMenu}
                            open={
                              Boolean(anchorElCommentMenu) &&
                              commentMenuIndex === index
                            }
                            onClose={handleCloseCommentMenu}
                          >
                            <MenuItem onClick={() => handleEditComment(index)}>
                              Edit
                            </MenuItem>
                            <MenuItem
                              onClick={() => handleDeleteComment(index)}
                            >
                              Delete
                            </MenuItem>
                          </Menu>
                        </>
                      )}
                    </ListItem>
                  ))}
                </List>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    marginTop: fullScreen ? 140 : 30,
                    marginBottom: fullScreen ? 0 : 40,
                  }}
                >
                  <img
                    style={{
                      objectFit: "contain",
                      width: fullScreen ? 160 : 120,
                      height: fullScreen ? 160 : 120,
                    }}
                    src="/sad.png"
                    alt=""
                  />
                  <p style={{ fontSize: 14, marginTop: 15 }}>
                    It looks like there are no comments here.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div style={{ marginTop: "16px" }}>
            <div style={{ position: "relative", marginBottom: "8px" }}>
              {addCommentEditor?.isEmpty && (
                <div style={placeholderStyleDescription}>
                  Write your comment here...
                </div>
              )}

              <EditorContent
                editor={addCommentEditor}
                style={{
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  padding: "8px",
                  minHeight: "100px",
                }}
                className="border p-2 rounded-md mb-2"
              />
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <InsertEmoticonIcon
                  onClick={handleOpenEmojiPicker}
                  style={{ fontSize: 20, color: "#4f4f4f" }}
                />
                <Tooltip title="In development" arrow>
                  <AttachFileIcon style={{ fontSize: 20, color: "#4f4f4f" }} />
                </Tooltip>
                <Menu
                  anchorEl={anchorElEmoji}
                  open={Boolean(anchorElEmoji)}
                  onClose={handleCloseEmojiPicker}
                >
                  <EmojiPicker onEmojiClick={handleEmojiSelect} />
                </Menu>
              </div>

              <p
                style={{
                  fontSize: 14,
                  color: "#4f4f4f",
                  cursor: "pointer",
                  fontWeight: 500,
                }}
                onClick={handleAddComment}
              >
                Add Comment
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const placeholderStyleDescription = {
  position: "absolute",
  top: "8px",
  left: "12px",
  color: "#aaa",
  fontSize: "15px",
  pointerEvents: "none",
};

export default CompletedTaskItem;
