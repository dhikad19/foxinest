import React, { useEffect, useState } from "react";
import { Snackbar, Button } from "@mui/material";

const CustomSnackbar = ({ onUndo }) => {
  const [open, setOpen] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setOpen(false);
    }, 7000); // 7 seconds

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Snackbar
      open={open}
      onClose={handleClose}
      message="Task completed!"
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
