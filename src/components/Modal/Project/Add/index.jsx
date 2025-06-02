// components/ProjectDialog.jsx
import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  OutlinedInput,
  FormControl,
  FormControlLabel,
  Switch,
  Button,
  Box,
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

const ProjectDialog = ({
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
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ fontSize: 18 }}>
        {editProject ? "Edit Project" : "Add New Project"}
      </DialogTitle>

      <DialogContent>
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
                return <em style={{ color: "#aaa" }}>Select a color</em>;
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
            inputProps={{ "aria-label": "Select color" }}
          >
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
                  color: "#ff7800",
                },
                "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                  backgroundColor: "#ff7800",
                },
              }}
            />
          }
          label="Add to favorite"
          sx={{
            "& .MuiFormControlLabel-label": {
              fontSize: 14,
            },
          }}
        />
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={onClose}
          sx={{ textTransform: "capitalize", color: "#ff7800" }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={onSubmit}
          disableElevation
          sx={{
            backgroundColor: "#ff7800",
            textTransform: "capitalize",
            fontWeight: "bold",
            fontSize: "12px",
            "&:hover": {
              backgroundColor: "#ff871f",
            },
          }}
        >
          {editProject ? "Save Changes" : "Add Project"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProjectDialog;
