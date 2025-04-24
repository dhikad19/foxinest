import React, { useState, useEffect } from "react";
import { Snackbar, Button } from "@mui/material";

const CustomSnackbar = ({ message, onUndo }) => {
  const [open, setOpen] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setOpen(false);
    }, 5000); // Snackbar will automatically close after 5 seconds

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Snackbar
      open={open}
      onClose={handleClose}
      message={message}
      action={
        <Button color="secondary" size="small" onClick={onUndo}>
          Undo
        </Button>
      }
      anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
    />
  );
};

export default CustomSnackbar;
