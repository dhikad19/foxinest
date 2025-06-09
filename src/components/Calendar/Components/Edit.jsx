import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Divider,
  IconButton,
  Drawer,
  Box,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DateIcon from "@mui/icons-material/DateRangeOutlined";

const EventDetailDialog = ({
  open,
  onClose,
  selectedEvent,
  editTitle,
  editStart,
  editEnd,
  isHoliday,
  setEditTitle,
  setEditStart,
  setEditEnd,
  handleEditEvent,
  handleDeleteEvent,
  formatDate,
  isMobile,
}) => {
  const renderContent = () => (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <DialogTitle
          style={{
            padding: "12px 24px",
            fontSize: 17,
            marginTop: 5,
          }}
        >
          Detail Event
        </DialogTitle>
        <div
          onClick={onClose}
          style={{ padding: "12px 19px", cursor: "pointer", marginTop: 5 }}
        >
          <CloseIcon />
        </div>
      </div>
      <Divider />
      <DialogContent>
        {selectedEvent && (
          <>
            {isHoliday ? (
              <>
                <p style={{ marginBottom: 2, fontWeight: 500 }}>
                  {selectedEvent.title}
                </p>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <DateIcon style={{ fontSize: 20, marginRight: 5 }} />
                  <p style={{ fontSize: 14, marginTop: 2 }}>
                    {selectedEvent.end &&
                    selectedEvent.start !== selectedEvent.end
                      ? `${formatDate(selectedEvent.start)} - ${formatDate(
                          selectedEvent.end
                        )}`
                      : formatDate(selectedEvent.start)}
                  </p>
                </div>
              </>
            ) : (
              <>
                <TextField
                  label="Event"
                  fullWidth
                  value={editTitle}
                  size="small"
                  onChange={(e) => setEditTitle(e.target.value)}
                  margin="dense"
                  sx={{
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
                  style={{ marginBottom: 12 }}
                />
                <TextField
                  label="Start Date"
                  type="date"
                  fullWidth
                  margin="dense"
                  style={{ marginBottom: 12 }}
                  size="small"
                  sx={{
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
                  value={editStart}
                  onChange={(e) => setEditStart(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  label="End Date"
                  type="date"
                  size="small"
                  sx={{
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
                  margin="dense"
                  value={editEnd}
                  onChange={(e) => setEditEnd(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </>
            )}
          </>
        )}
      </DialogContent>
      {!isHoliday && (
        <DialogActions style={{ paddingRight: "24px", paddingBottom: "24px" }}>
          <Button
            variant="text"
            onClick={handleDeleteEvent}
            style={{
              textTransform: "capitalize",
              fontWeight: "bold",
              fontSize: "12px",
              color: "#4f4f4f",
            }}
          >
            Hapus
          </Button>
          <Button
            onClick={handleEditEvent}
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
      )}
    </>
  );

  return isMobile ? (
    <Drawer anchor="bottom" open={open} onClose={onClose}>
      {renderContent()}
    </Drawer>
  ) : (
    <Dialog open={open} onClose={onClose} fullWidth>
      {renderContent()}
    </Dialog>
  );
};

export default EventDetailDialog;
