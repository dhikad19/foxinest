// components/ProjectModal.jsx
import React from "react";
import {
  Box,
  Button,
  FormControl,
  FormControlLabel,
  InputLabel,
  OutlinedInput,
  MenuItem,
  Modal,
  Select,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
const colorOptions = [
  { value: "default", label: "Default", color: "#ccc" },
  { value: "blue", label: "Blue", color: "#2196f3" },
  { value: "green", label: "Green", color: "#4caf50" },
  { value: "red", label: "Red", color: "#f44336" },
  { value: "orange", label: "Orange", color: "#ff9800" },
  { value: "purple", label: "Purple", color: "#9c27b0" },
  { value: "pink", label: "Pink", color: "#e91e63" },
  { value: "teal", label: "Teal", color: "#009688" },
];

const ProjectModal = ({
  open,
  onClose,
  onSubmit,
  projectName,
  setProjectName,
  selectedColor,
  setSelectedColor,
  isFavorite,
  setIsFavorite,
  editProject,
}) => {
  const handleChange = (event) => {
    setSelectedColor(event.target.value);
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 400,
          bgcolor: "background.paper",
          boxShadow: 24,
          borderRadius: 2,
          p: 3,
        }}>
        <div style={{ paddingRight: 15, paddingLeft: 15 }}>
          <p variant="h6" gutterBottom>
            {editProject ? "Edit Project" : "Add New Project"}
          </p>
          <TextField
            placeholder="Project Name"
            fullWidth
            value={projectName}
            size="small"
            onChange={(e) => setProjectName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <Select
              value={selectedColor}
              onChange={handleChange}
              size="small"
              displayEmpty
              input={<OutlinedInput />}
              renderValue={(value) => {
                if (!value) {
                  return <em style={{ color: "#aaa" }}>Select a color</em>; // placeholder
                }
                const selected = colorOptions.find((c) => c.value === value);
                return (
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Box
                      sx={{
                        width: 14,
                        height: 14,
                        borderRadius: "50%",
                        backgroundColor: selected?.color,
                        marginRight: 1.5,
                      }}
                    />
                    {selected?.label}
                  </Box>
                );
              }}
              inputProps={{ "aria-label": "Select color" }}>
              <MenuItem disabled value="">
                <em>Select a color</em>
              </MenuItem>
              {colorOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  <Box
                    sx={{
                      width: 14,
                      height: 14,
                      borderRadius: "50%",
                      backgroundColor: option.color,
                      display: "inline-block",
                      marginRight: 1.5,
                    }}
                  />
                  <Typography variant="body2">{option.label}</Typography>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControlLabel
            control={
              <Switch
                checked={isFavorite}
                onChange={() => setIsFavorite(!isFavorite)}
                sx={{
                  "& .MuiSwitch-switchBase.Mui-checked": {
                    color: "#ff7800", // thumb color when checked
                  },
                  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                    backgroundColor: "#ff7800", // track color when checked
                  },
                }}
              />
            }
            label="Add to favorite"
            sx={{
              mb: 2,
              "& .MuiFormControlLabel-label": {
                fontSize: 14,
              },
            }}
          />

          <Button
            style={{
              textTransform: "capitalize",
              fontWeight: "bold",
              fontSize: "12px",
              marginRight: "6px",
            }}
            sx={{
              backgroundColor: "#ff7800",
              "&:hover": { backgroundColor: "#ff871f" },
            }}
            variant="contained"
            fullWidth
            disableElevation
            onClick={onSubmit}>
            {editProject ? "Save Changes" : "Add Project"}
          </Button>
        </div>
      </Box>
    </Modal>
  );
};

export default ProjectModal;
