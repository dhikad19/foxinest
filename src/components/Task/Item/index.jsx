import React, { useState, useEffect, useRef } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Divider,
  Checkbox,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  ListItemText,
  Tooltip,
  Menu,
  MenuItem,
} from "@mui/material";
import CommentsIcon from "@mui/icons-material/ChatBubbleOutline";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import EditIcon from "@mui/icons-material/EditOutlined";
import DragIcon from "@mui/icons-material/DragIndicator";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import DateIcon from "@mui/icons-material/DateRangeOutlined";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import EmojiPicker from "emoji-picker-react";
import IconButton from "@mui/material/IconButton";
import InsertEmoticonIcon from "@mui/icons-material/InsertEmoticon";
import AttachFileIcon from "@mui/icons-material/AttachFile";

// Styles
const containerStyle = (isDragging, transform, transition) => ({
  transform: CSS.Transform.toString(transform),
  transition,
  background: "#fff",
  marginBottom: 10,
  borderRadius: 4,
  display: "flex",
  flexDirection: "column",
  gap: 8,
  boxShadow: isDragging ? "0 2px 6px rgba(0, 0, 0, 0.1)" : "none",
  touchAction: "none",
  zIndex: isDragging ? 9999 : "auto",
  position: isDragging ? "relative" : "static",
});

const TaskItem = ({ task, onDelete, onEdit, onComplete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    setActivatorNodeRef,
    isDragging,
  } = useSortable({ id: task.id });

  const [openDialog, setOpenDialog] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState([]);
  const [commentToEdit, setCommentToEdit] = useState(null);
  const [editingContent, setEditingContent] = useState("");
  const [lastFocusedEditor, setLastFocusedEditor] = useState(null); // 'add' | 'edit'

  const [anchorElEmoji, setAnchorElEmoji] = useState(null);
  const [anchorElCommentMenu, setAnchorElCommentMenu] = useState(null);
  const [commentMenuIndex, setCommentMenuIndex] = useState(null);

  const [addCommentEditor, setAddCommentEditor] = useState(null);
  const [editCommentEditor, setEditCommentEditor] = useState(null);
  const commentContainerRef = useRef(null);
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

  const handleOpenCommentMenu = (event, index) => {
    setAnchorElCommentMenu(event.currentTarget);
    setCommentMenuIndex(index);
  };

  const handleCloseCommentMenu = () => {
    setAnchorElCommentMenu(null);
    setCommentMenuIndex(null);
  };

  // Scroll to the bottom of the container
  const scrollToBottom = () => {
    if (commentContainerRef.current) {
      commentContainerRef.current.scrollTo({
        top: commentContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    if (openDialog) {
      // beri delay supaya DOM sudah update
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    }
  }, [openDialog]);

  const prevCommentsLength = useRef(comments.length);

  useEffect(() => {
    if (openDialog) {
      // Kalau ada penambahan komentar baru
      if (comments.length > prevCommentsLength.current) {
        setTimeout(() => {
          scrollToBottom();
        }, 100);
      }
      prevCommentsLength.current = comments.length;
    }
  }, [comments, openDialog]);

  const handleOpenEmojiPicker = (event) =>
    setAnchorElEmoji(event.currentTarget);
  const handleCloseEmojiPicker = () => setAnchorElEmoji(null);

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

  useEffect(() => {
    if (addCommentEditor) {
      const dom = addCommentEditor.view.dom;
      const handleFocus = () => setLastFocusedEditor("add");
      dom.addEventListener("focus", handleFocus);

      return () => {
        dom.removeEventListener("focus", handleFocus);
      };
    }
  }, [addCommentEditor]);

  useEffect(() => {
    if (editCommentEditor) {
      const dom = editCommentEditor.view.dom;
      const handleFocus = () => setLastFocusedEditor("edit");
      dom.addEventListener("focus", handleFocus);

      return () => {
        dom.removeEventListener("focus", handleFocus);
      };
    }
  }, [editCommentEditor]);

  useEffect(() => {
    const storedComments = JSON.parse(
      localStorage.getItem(`task_${task.id}_comments`)
    );
    if (storedComments) {
      setComments(storedComments);
    }
  }, [task.id]);

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

  useEffect(() => {
    setAddCommentEditor(addEditor);
    setEditCommentEditor(editEditor);

    return () => {
      addEditor?.destroy();
      editEditor?.destroy();
    };
  }, [addEditor, editEditor]);

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const [menuAnchor, setMenuAnchor] = useState(null);

  const handleMenuOpen = (event) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
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

  const cancelEdit = () => {
    setCommentToEdit(null);
    editCommentEditor?.commands.clearContent();
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

  const handleDeleteComment = (index) => {
    const updatedComments = comments.filter((_, i) => i !== index);
    setComments(updatedComments);
    localStorage.setItem(
      `task_${task.id}_comments`,
      JSON.stringify(updatedComments)
    );
    handleCloseCommentMenu();
  };

  return (
    <div
      ref={setNodeRef}
      style={containerStyle(isDragging, transform, transition)}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div
          style={{ flex: 1, display: "flex", height: "100%", marginTop: 10 }}>
          <div style={{ marginRight: 10 }}>
            <Checkbox
              checked={task.completed}
              onChange={() => onComplete(task.id)}
              style={{ marginLeft: -2, marginTop: -9 }}
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
          </div>
          <div style={{ width: "100%" }}>
            <div
              style={{
                width: "100%",
                alignItems: "start",
                display: "flex",
                flexDirection: "column",
              }}>
              <span
                style={{
                  fontWeight: "bold",
                  fontSize: 15,
                  maxWidth: "93%",
                  display: "-webkit-box",
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  wordBreak: "break-word",
                  whiteSpace: "normal",
                  lineHeight: "normal",
                  marginBottom: "3px",
                }}>
                {task.title}
              </span>
            </div>

            <div
              style={{
                margin: 0,
                fontSize: 14,
                maxWidth: "93%",
                display: "-webkit-box",
                WebkitLineClamp: 1,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "normal",
                wordBreak: "break-word",
              }}
              dangerouslySetInnerHTML={{ __html: task.description }}></div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
              }}>
              {(task.dueDate || comments.length > 0) && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    marginTop: "5px",
                  }}>
                  {task.dueDate && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        marginTop: 5,
                      }}>
                      <DateIcon style={{ fontSize: "14px", color: "grey" }} />
                      <p
                        style={{
                          fontSize: "13px",
                          color: "grey",
                          marginLeft: "5px",
                        }}>
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
                          return new Intl.DateTimeFormat(
                            "en-GB",
                            options
                          ).format(dueDate);
                        })()}
                      </p>
                    </div>
                  )}

                  {comments.length > 0 && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        cursor: "pointer",
                        marginTop: 5,
                      }}
                      onClick={handleOpenDialog}
                      title="View comments">
                      <CommentsIcon
                        style={{
                          fontSize: "14px",
                          color: "grey",
                          marginLeft: 6,
                        }}
                      />
                      <p
                        style={{
                          fontSize: "13px",
                          color: "grey",
                          marginLeft: "5px",
                        }}>
                        {comments.length}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <MoreVertIcon
            style={{ fontSize: "20px", cursor: "pointer" }}
            onClick={handleMenuOpen}
          />

          <Menu
            anchorEl={menuAnchor}
            open={Boolean(menuAnchor)}
            MenuListProps={{ sx: { py: 0 } }}
            onClose={handleMenuClose}>
            <MenuItem
              onClick={() => {
                onEdit(task);
                handleMenuClose();
              }}>
              <EditIcon style={{ fontSize: "19px", marginRight: 12 }} />{" "}
              <p style={{ fontSize: "13px" }}>Edit</p>
            </MenuItem>
            <MenuItem
              onClick={() => {
                onDelete(task.id);
                handleMenuClose();
              }}>
              <DeleteIcon style={{ fontSize: "19px", marginRight: 12 }} />{" "}
              <p style={{ fontSize: "13px" }}>Delete</p>
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleOpenDialog();
                handleMenuClose();
              }}>
              <CommentsIcon
                style={{ fontSize: "17px", marginRight: 12, marginLeft: 2 }}
              />{" "}
              <p style={{ fontSize: "13px" }}>Comments</p>
            </MenuItem>
          </Menu>

          <div
            ref={setActivatorNodeRef}
            {...attributes}
            {...listeners}
            title="Drag"
            style={{
              cursor: "grab",
              padding: "4px 4px 0px 4px",
              background: "#eee",
              borderRadius: 4,
            }}
            aria-label="Drag task">
            <DragIcon style={{ fontSize: "18px" }} />
          </div>
        </div>
      </div>

      {!isDragging && <Divider />}

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="sm">
        <DialogTitle>Comments</DialogTitle>
        <DialogContent
          style={{
            display: "flex",
            flexDirection: "column",
            maxHeight: "500px",
            overflow: "hidden",
          }}>
          <div
            ref={commentContainerRef}
            style={{ flexGrow: 1, overflowY: "auto", padding: "8px" }}>
            <div
              style={{
                marginBottom: "16px",
                display: "flex",
                alignItems: "flex-start",
              }}>
              {/* Checkbox */}
              <Checkbox
                checked={task.completed}
                onChange={() => onComplete(task.id)}
                style={{ marginRight: "10px", marginLeft: "-10px" }}
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
                    marginTop: 0,
                  }}>
                  {task.title}
                </p>
                <div
                  style={{ fontSize: "14px" }}
                  dangerouslySetInnerHTML={{ __html: task.description }}
                />
              </div>
            </div>

            <List>
              {comments.map((comment, index) => (
                <ListItem
                  key={index}
                  style={{ display: "flex", alignItems: "flex-start" }}>
                  {commentToEdit === index ? (
                    <div style={{ flexGrow: 1 }}>
                      <div
                        style={{ position: "relative", marginBottom: "8px" }}>
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
                          }}>
                          <div
                            style={{
                              position: "relative",
                              marginBottom: "8px",
                            }}>
                            {editCommentEditor?.isEmpty && (
                              <div style={placeholderStyleDescription}>
                                Edit your comment here...
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
                            }}>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "2px",
                              }}>
                              <IconButton
                                onClick={handleOpenEmojiPicker}
                                size="small">
                                <InsertEmoticonIcon
                                  style={{ fontSize: 20, color: "#4f4f4f" }}
                                />
                              </IconButton>

                              <Tooltip title="In development" arrow>
                                <IconButton size="small">
                                  <AttachFileIcon
                                    style={{ fontSize: 20, color: "#4f4f4f" }}
                                  />
                                </IconButton>
                              </Tooltip>
                              <Menu
                                anchorEl={anchorElEmoji}
                                open={Boolean(anchorElEmoji)}
                                onClose={handleCloseEmojiPicker}>
                                <EmojiPicker onEmojiClick={handleEmojiSelect} />
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
                                }}>
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
                                }}>
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
                            dangerouslySetInnerHTML={{ __html: comment.text }}
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
                        onClick={(e) => handleOpenCommentMenu(e, index)}>
                        <MoreVertIcon />
                      </IconButton>
                      <Menu
                        anchorEl={anchorElCommentMenu}
                        open={
                          Boolean(anchorElCommentMenu) &&
                          commentMenuIndex === index
                        }
                        onClose={handleCloseCommentMenu}>
                        <MenuItem onClick={() => handleEditComment(index)}>
                          Edit
                        </MenuItem>
                        <MenuItem onClick={() => handleDeleteComment(index)}>
                          Delete
                        </MenuItem>
                      </Menu>
                    </>
                  )}
                </ListItem>
              ))}
            </List>
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

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
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
                onClose={handleCloseEmojiPicker}>
                <EmojiPicker onEmojiClick={handleEmojiSelect} />
              </Menu>
            </div>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Close
          </Button>
          <Button onClick={handleAddComment} color="primary">
            Add Comment
          </Button>
        </DialogActions>
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

export default TaskItem;
