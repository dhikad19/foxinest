import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Button,
  Tooltip,
  Menu,
  MenuItem,
} from "@mui/material";
import InsertEmoticonIcon from "@mui/icons-material/InsertEmoticon";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import EmojiPicker from "emoji-picker-react";

const CommentsDialog = ({ openDialog, handleCloseDialog, task, comments }) => {
  const [commentToEdit, setCommentToEdit] = useState(null);
  const [editingContent, setEditingContent] = useState("");
  const [anchorElEmoji, setAnchorElEmoji] = useState(null);
  const [anchorElCommentMenu, setAnchorElCommentMenu] = useState(null);
  const [commentMenuIndex, setCommentMenuIndex] = useState(null);

  const addCommentEditor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Write your comment here...",
      }),
    ],
    content: "",
  });

  const editCommentEditor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Edit your comment here...",
      }),
    ],
    content: editingContent,
    onUpdate: ({ editor }) => {
      setEditingContent(editor.getHTML());
    },
  });

  const handleOpenEmojiPicker = (event) =>
    setAnchorElEmoji(event.currentTarget);
  const handleCloseEmojiPicker = () => setAnchorElEmoji(null);

  const handleEmojiSelect = (_, emojiObject) => {
    if (commentToEdit !== null) {
      editCommentEditor.chain().focus().insertContent(emojiObject.emoji).run();
    } else {
      addCommentEditor.chain().focus().insertContent(emojiObject.emoji).run();
    }
    handleCloseEmojiPicker();
  };

  const handleOpenCommentMenu = (event, index) => {
    setAnchorElCommentMenu(event.currentTarget);
    setCommentMenuIndex(index);
  };

  const handleCloseCommentMenu = () => {
    setAnchorElCommentMenu(null);
    setCommentMenuIndex(null);
  };

  const handleEditComment = (index) => {
    setCommentToEdit(index);
    setEditingContent(comments[index].text);
    handleCloseCommentMenu();
  };

  const handleDeleteComment = (index) => {
    console.log(`Delete comment at index ${index}`);
    handleCloseCommentMenu();
  };

  const saveEditedComment = () => {
    console.log("Edited comment content:", editingContent);
    setCommentToEdit(null);
  };

  const handleAddComment = () => {
    const newComment = addCommentEditor.getHTML();
    console.log("Added comment:", newComment);
    addCommentEditor.commands.clearContent();
  };

  return (
    <Dialog
      open={openDialog}
      onClose={handleCloseDialog}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>Comments</DialogTitle>
      <DialogContent
        style={{
          display: "flex",
          flexDirection: "column",
          maxHeight: "500px",
          overflow: "hidden",
        }}
      >
        <div style={{ flexGrow: 1, overflowY: "auto", padding: "8px" }}>
          <div style={{ marginBottom: "16px" }}>
            <h3>{task.title}</h3>
            <p>{task.description}</p>
          </div>

          <List>
            {comments.map((comment, index) => (
              <ListItem key={index} style={{ alignItems: "flex-start" }}>
                {commentToEdit === index ? (
                  <div style={{ flexGrow: 1 }}>
                    <EditorContent
                      editor={editCommentEditor}
                      style={{
                        border: "1px solid #ccc",
                        borderRadius: "4px",
                        padding: "8px",
                        minHeight: "120px",
                      }}
                    />
                    <div
                      style={{
                        display: "flex",
                        marginTop: 10,
                        justifyContent: "space-between",
                      }}
                    >
                      <div>
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
                              style={{ fontSize: 20, color: "#4f4f4f" }}
                            />
                          </IconButton>
                        </Tooltip>
                      </div>
                      <div>
                        <Button
                          onClick={() => setCommentToEdit(null)}
                          variant="outlined"
                          size="small"
                          style={{ marginRight: 6 }}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={saveEditedComment}
                          variant="contained"
                          size="small"
                          style={{ backgroundColor: "#ff7800", color: "#fff" }}
                        >
                          Save
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <ListItemText
                      primary={
                        <div
                          dangerouslySetInnerHTML={{ __html: comment.text }}
                        />
                      }
                      secondary={`Posted on: ${comment.date}`}
                    />
                    <IconButton
                      onClick={(e) => handleOpenCommentMenu(e, index)}
                    >
                      <MoreVertIcon />
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
          <EditorContent
            editor={addCommentEditor}
            style={{
              border: "1px solid #ccc",
              borderRadius: "4px",
              padding: "8px",
              minHeight: "100px",
            }}
          />
          <div style={{ marginTop: "8px" }}>
            <IconButton onClick={handleOpenEmojiPicker}>
              <InsertEmoticonIcon style={{ fontSize: 20, color: "#4f4f4f" }} />
            </IconButton>
            <Tooltip title="In development" arrow>
              <AttachFileIcon style={{ fontSize: 20, color: "#4f4f4f" }} />
            </Tooltip>
          </div>
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCloseDialog}>Close</Button>
        <Button onClick={handleAddComment} color="primary">
          Add Comment
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CommentsDialog;
