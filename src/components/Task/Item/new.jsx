import React, { useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import IconButton from "@mui/material/IconButton";
import InsertEmoticonIcon from "@mui/icons-material/InsertEmoticon";
import Popover from "@mui/material/Popover";
import EmojiPicker from "emoji-picker-react";

const AddComment = () => {
  const [newComment, setNewComment] = useState("");
  const [anchorElEmoji, setAnchorElEmoji] = useState(null);

  const addCommentEditor = useEditor({
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

  const handleOpenEmojiPicker = (event) =>
    setAnchorElEmoji(event.currentTarget);
  const handleCloseEmojiPicker = () => setAnchorElEmoji(null);

  const handleEmojiClick = (_, emojiObject) => {
    addCommentEditor.chain().focus().insertContent(emojiObject.emoji).run();
    handleCloseEmojiPicker();
  };

  return (
    <div className="p-4 border rounded-md shadow-sm">
      <h3 className="text-lg font-bold mb-2">Add a Comment</h3>
      <EditorContent
        editor={addCommentEditor}
        className="border p-2 rounded-md mb-2"
      />
      <IconButton onClick={handleOpenEmojiPicker} size="small">
        <InsertEmoticonIcon style={{ fontSize: 20, color: "#4f4f4f" }} />
      </IconButton>
      <Popover
        open={Boolean(anchorElEmoji)}
        anchorEl={anchorElEmoji}
        onClose={handleCloseEmojiPicker}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      >
        <EmojiPicker onEmojiClick={handleEmojiClick} />
      </Popover>
      <button
        onClick={() => console.log("Submitted comment:", newComment)}
        className="bg-blue-500 text-white px-4 py-2 rounded-md mt-2"
        disabled={!newComment.trim()}
      >
        Submit
      </button>
    </div>
  );
};

const EditComment = () => {
  const [anchorElEmoji, setAnchorElEmoji] = useState(null);

  const editCommentEditor = useEditor({
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

  const handleEmojiClick = (_, emojiObject) => {
    editCommentEditor.chain().focus().insertContent(emojiObject.emoji).run();
    handleCloseEmojiPicker();
  };

  return (
    <div className="p-4 border rounded-md shadow-sm mt-4">
      <h3 className="text-lg font-bold mb-2">Edit a Comment</h3>
      <EditorContent
        editor={editCommentEditor}
        className="border p-2 rounded-md mb-2"
      />
      <IconButton onClick={handleOpenEmojiPicker} size="small">
        <InsertEmoticonIcon style={{ fontSize: 20, color: "#4f4f4f" }} />
      </IconButton>
      <Popover
        open={Boolean(anchorElEmoji)}
        anchorEl={anchorElEmoji}
        onClose={handleCloseEmojiPicker}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      >
        <EmojiPicker onEmojiClick={handleEmojiClick} />
      </Popover>
      <button
        onClick={() =>
          console.log("Edited content:", editCommentEditor?.getHTML())
        }
        className="bg-green-500 text-white px-4 py-2 rounded-md mt-2"
      >
        Save Changes
      </button>
    </div>
  );
};

const App = () => {
  return (
    <div>
      <AddComment />
      <EditComment />
    </div>
  );
};

export default App;
