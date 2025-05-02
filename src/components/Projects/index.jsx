import React, { useState, useEffect } from "react";
import {
  Box,
  List,
  ListItem,
  Typography,
  IconButton,
  TextField,
  Button,
  Modal,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

const Projects = ({ projects, onSave, onDelete }) => {
  const [projectList, setProjectList] = useState(projects);
  const [openModal, setOpenModal] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [projectName, setProjectName] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    // Update local state whenever parent passes updated projects
    setProjectList(projects);
  }, [projects]);

  const handleModalOpen = (project = null) => {
    if (project) {
      // Edit mode
      setEditProject(project);
      setProjectName(project.name);
      setSelectedColor(project.color);
      setIsFavorite(project.isFavorite);
    } else {
      // Add mode
      setEditProject(null);
      setProjectName("");
      setSelectedColor("");
      setIsFavorite(false);
    }
    setOpenModal(true);
  };

  const handleModalClose = () => {
    setOpenModal(false);
    setEditProject(null);
  };

  const handleSave = () => {
    const newProject = {
      id: editProject?.id || Date.now(),
      name: projectName,
      color: selectedColor || "default",
      isFavorite,
    };

    onSave(newProject, !!editProject); // Pass new/edited project to parent
    handleModalClose();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h5">Projects</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleModalOpen()}
        >
          Add Project
        </Button>
      </Box>

      {/* Project List */}
      <List>
        {projectList.length > 0 ? (
          projectList.map((project) => (
            <ListItem
              key={project.id}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 1,
                border: "1px solid #ddd",
                borderRadius: 1,
                p: 2,
              }}
            >
              <Box>
                <Typography variant="h6">{project.name}</Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                >{`Color: ${project.color}`}</Typography>
              </Box>
              <Box>
                <IconButton
                  color="primary"
                  onClick={() => handleModalOpen(project)}
                >
                  <EditIcon />
                </IconButton>
                <IconButton color="error" onClick={() => onDelete(project.id)}>
                  <DeleteIcon />
                </IconButton>
              </Box>
            </ListItem>
          ))
        ) : (
          <Typography>No projects found. Add a new project!</Typography>
        )}
      </List>

      {/* Modal for Add/Edit Project */}
      <Modal open={openModal} onClose={handleModalClose}>
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
          <Button
            variant="contained"
            fullWidth
            onClick={handleSave}
            sx={{ mt: 2 }}
          >
            {editProject ? "Save Changes" : "Add Project"}
          </Button>
        </Box>
      </Modal>
    </Box>
  );
};

export default Projects;
