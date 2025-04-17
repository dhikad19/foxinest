import React, { useEffect, useState } from "react";

const Snackbar = ({ onUndo }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, 7000); // 7 seconds

    return () => clearTimeout(timer); // Cleanup on unmount
  }, []);

  if (!visible) return null;

  return (
    <div style={snackbarStyles}>
      <span>Task completed!</span>
      <button onClick={onUndo} style={undoButtonStyles}>
        Undo
      </button>
    </div>
  );
};

const snackbarStyles = {
  position: "fixed",
  bottom: "20px",
  left: "50%",
  transform: "translateX(-50%)",
  backgroundColor: "#4CAF50",
  color: "white",
  padding: "10px 20px",
  borderRadius: "5px",
  display: "flex",
  alignItems: "center",
  gap: "10px",
};

const undoButtonStyles = {
  backgroundColor: "#f44336",
  color: "white",
  border: "none",
  padding: "5px 10px",
  borderRadius: "3px",
  cursor: "pointer",
};

export default Snackbar;
