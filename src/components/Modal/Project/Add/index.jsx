// components/ProjectModal.jsx
import React from "react";
import {
  Box,
  Button,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Modal,
  Select,
  Switch,
  TextField,
  Typography,
} from "@mui/material";

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
        }}
      >
        <Typography variant="h6" gutterBottom>
          {editProject ? "Edit Project" : "Add New Project"}
        </Typography>
        <TextField
          label="Project Name"
          fullWidth
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          sx={{ mb: 2 }}
        />
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Color</InputLabel>
          <Select
            value={selectedColor}
            label="Color"
            onChange={(e) => setSelectedColor(e.target.value)}
          >
            <MenuItem value="default">Default</MenuItem>
            <MenuItem value="blue">Blue</MenuItem>
            <MenuItem value="green">Green</MenuItem>
            <MenuItem value="red">Red</MenuItem>
          </Select>
        </FormControl>
        <FormControlLabel
          control={
            <Switch
              checked={isFavorite}
              onChange={() => setIsFavorite(!isFavorite)}
            />
          }
          label="Favorite"
        />
        <Button variant="contained" fullWidth onClick={onSubmit}>
          {editProject ? "Save Changes" : "Add Project"}
        </Button>
      </Box>
    </Modal>
  );
};

export default ProjectModal;
