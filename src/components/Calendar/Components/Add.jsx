import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Drawer,
  IconButton,
  Divider,
  Box,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
const AddEventDialog = ({
  isMobile,
  dialogOpen,
  setDialogOpen,
  newEventTitle,
  setNewEventTitle,
  newEventDates,
  handleAddEvent,
}) => {
  const renderContent = () => {
    return (
      <>
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
            Add Event
          </DialogTitle>
          <div
            style={{ padding: "12px 19px", marginTop: 5, cursor: "pointer" }}
            onClick={handleClose}
          >
            <CloseIcon />
          </div>
        </div>
        <Divider />
        <DialogContent>
          <TextField
            margin="dense"
            label="Event"
            sx={{
              minWidth: isMobile ? "" : 400,
              "& label.Mui-focused": { color: "#4f4f4f" },
              "& .MuiOutlinedInput-root.Mui-focused": {
                "& fieldset": {
                  borderColor: "#4f4f4f",
                },
                "& input": {
                  color: "#4f4f4f",
                },
              },
            }}
            fullWidth
            size="small"
            value={newEventTitle}
            onChange={(e) => setNewEventTitle(e.target.value)}
          />
        </DialogContent>
        <DialogActions style={{ paddingRight: "24px", paddingBottom: "24px" }}>
          {/* <Button onClick={handleClose}>Batal</Button> */}
          <Button
            onClick={() => {
              if (newEventTitle.trim() !== "") {
                handleAddEvent({
                  title: newEventTitle,
                  start: newEventDates.start,
                  end: newEventDates.end,
                  backgroundColor: "#4caf50",
                  textColor: "#fff",
                });
              }
              handleClose();
            }}
            size="small"
            sx={{
              backgroundColor: "#4f4f4f",
              textTransform: "capitalize",
              fontWeight: "bold",
              fontSize: "12px",
              color: "white",
              "&:hover": {
                backgroundColor: "#4f4f4f",
              },
            }}
          >
            Simpan
          </Button>
        </DialogActions>
      </>
    );
  };

  const handleClose = () => setDialogOpen(false);
  return isMobile ? (
    <Drawer anchor="bottom" open={dialogOpen} onClose={handleClose}>
      {renderContent()}
    </Drawer>
  ) : (
    <Dialog fullScreen={isMobile} open={dialogOpen} onClose={handleClose}>
      {renderContent()}
    </Dialog>
  );
};

export default AddEventDialog;
