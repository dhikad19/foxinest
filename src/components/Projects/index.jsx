import React, { useState, useEffect } from "react";
import {
  Box,
  List,
  ListItem,
  Typography,
  IconButton,
  Button,
} from "@mui/material";
import ProjectModal from "../Modal/Project/Add";
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
    onSave(newProject, !!editProject);
    const event = new Event("projectChange");
    window.dispatchEvent(event);

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

      <ProjectModal
        open={openModal}
        onClose={handleModalClose}
        onSubmit={handleSave}
        projectName={projectName}
        setProjectName={setProjectName}
        selectedColor={selectedColor}
        setSelectedColor={setSelectedColor}
        isFavorite={isFavorite}
        setIsFavorite={setIsFavorite}
        editProject={editProject}
      />
    </Box>
  );
};

export default Projects;
