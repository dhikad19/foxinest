import React, { useEffect, useState } from "react";
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
import InboxIcon from "@mui/icons-material/Inbox";
import FlagIcon from "@mui/icons-material/Flag";
import CloseIcon from "@mui/icons-material/Close";
import DateIcon from "@mui/icons-material/DateRangeOutlined";

const EventDetailDialog = ({
  open,
  onClose,
  event,
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
  const [events, setEvents] = useState(null);

  // useEffect(() => {
  //   if (!selectedEvent?.id) return;

  //   const data = JSON.parse(localStorage.getItem("user_events") || "[]");
  //   setEvents(data.filter((event) => event.id === selectedEvent.id));
  // }, [selectedEvent]);

  const renderContent = () => (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
        <DialogTitle
          style={{
            padding: "12px 24px",
            fontSize: 17,
            marginTop: 5,
          }}>
          Detail Event
        </DialogTitle>
        <div
          onClick={onClose}
          style={{
            padding: "12px 19px",
            cursor: "pointer",
            marginTop: 5,
          }}>
          <CloseIcon />
        </div>
      </div>
      <Divider />
      <DialogContent style={{ padding: 0 }}>
        {selectedEvent && (
          <>
            {isHoliday ? (
              <div style={{ display: "flex", width: "100%" }}>
                <div style={{ width: "100%", padding: "20px 24px" }}>
                  <p
                    style={{
                      marginBottom: 2,
                      fontWeight: 500,
                      lineHeight: "normal",
                    }}>
                    {selectedEvent.title}
                  </p>

                  <div
                    style={{ fontSize: 15 }}
                    dangerouslySetInnerHTML={{
                      __html: selectedEvent.description || "",
                    }}
                  />
                </div>
                {/* <p style={{ marginBottom: 2, fontWeight: 500 }}>
                  {selectedEvent.description}
                </p> */}
                {/* <p style={{ marginBottom: 2, fontWeight: 500 }}>
                  {selectedEvent.completed}
                </p> */}
                <div
                  style={{
                    maxWidth: "230px",
                    width: "100%",
                    padding: "20px 24px",
                    backgroundColor: "#fcfaf8",
                  }}>
                  {selectedEvent.category && (
                    <>
                      <p
                        style={{
                          fontSize: 12,
                          fontWeight: 500,
                          color: "grey",
                          marginBottom: 2,
                        }}>
                        Category
                      </p>
                      <div
                        style={{
                          display: "flex",
                          fontSize: 13,
                          alignItems: "center",
                        }}>
                        <InboxIcon style={{ marginRight: 5, fontSize: 20 }} />
                        <p
                          style={{
                            marginBottom: 2,
                            fontWeight: 500,
                            fontSize: 13,
                          }}>
                          {selectedEvent.category}
                        </p>
                      </div>
                      <Divider style={{ marginBottom: 10, marginTop: 10 }} />
                    </>
                  )}
                  {selectedEvent.priority && (
                    <>
                      <p
                        style={{
                          fontSize: 12,
                          fontWeight: 500,
                          color: "grey",
                          marginBottom: 2,
                        }}>
                        Priority
                      </p>
                      <div
                        style={{
                          display: "flex",
                          fontSize: 13,
                          alignItems: "center",
                        }}>
                        <FlagIcon style={{ marginRight: 5, fontSize: 20 }} />
                        <p style={{ marginBottom: 2, fontWeight: 500 }}>
                          {selectedEvent.priority}
                        </p>
                      </div>
                      <Divider style={{ marginBottom: 10, marginTop: 10 }} />
                    </>
                  )}

                  {selectedEvent.priority && (
                    <p
                      style={{
                        fontSize: 12,
                        fontWeight: 500,
                        color: "grey",
                        marginBottom: 2,
                      }}>
                      Date
                    </p>
                  )}
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <DateIcon style={{ fontSize: 20, marginRight: 5 }} />
                    <p
                      style={{
                        fontSize: 13,
                        marginTop: 2,
                        lineHeight: "normal",
                      }}>
                      {selectedEvent.end &&
                      selectedEvent.start !== selectedEvent.end
                        ? `${formatDate(selectedEvent.start)} - ${formatDate(
                            selectedEvent.end
                          )}`
                        : formatDate(selectedEvent.start)}
                    </p>
                  </div>
                  {selectedEvent.priority && (
                    <Divider style={{ marginBottom: 10, marginTop: 10 }} />
                  )}
                </div>
              </div>
            ) : (
              <div style={{ padding: "20px 24px" }}>
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
              </div>
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
            }}>
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
            }}>
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
