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
import { useNavigate } from "react-router-dom";

const Projects = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState(() => {
    const stored = localStorage.getItem("projects");
    return stored ? JSON.parse(stored) : [];
  });

  const [openModal, setOpenModal] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [projectName, setProjectName] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);

  const normalizeName = (str) => str.trim().toLowerCase().replace(/\s+/g, "-");

  const handleModalOpen = (project = null) => {
    if (project) {
      setEditProject(project);
      setProjectName(project.name.replaceAll("-", " "));
      setSelectedColor(project.color);
      setIsFavorite(project.isFavorite);
    } else {
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

  const triggerProjectChange = () => {
    const event = new Event("projectChange");
    window.dispatchEvent(event);
  };

  const handleSave = () => {
    const trimmedName = projectName.trim();
    if (!trimmedName) return;

    const normalizedName = normalizeName(trimmedName);

    const projectExists = projects.some(
      (project) =>
        normalizeName(project.name) === normalizedName &&
        project.id !== editProject?.id
    );

    if (projectExists) {
      alert("A project with this name already exists.");
      return;
    }

    const newProject = {
      id: editProject?.id || Date.now(),
      name: normalizedName,
      color: selectedColor || "default",
      isFavorite,
    };

    let updatedProjects;
    if (editProject) {
      updatedProjects = projects.map((project) =>
        project.id === editProject.id ? newProject : project
      );
    } else {
      updatedProjects = [...projects, newProject];
    }

    setProjects(updatedProjects);
    localStorage.setItem("projects", JSON.stringify(updatedProjects));

    const projectsData =
      JSON.parse(localStorage.getItem("projects_data")) || {};

    if (!editProject && !projectsData[normalizedName]) {
      projectsData[normalizedName] = {
        sections: [],
        tasks: [],
      };
      localStorage.setItem("projects_data", JSON.stringify(projectsData));
    }

    setProjectName("");
    setSelectedColor("");
    setIsFavorite(false);
    setOpenModal(false);
    setEditProject(null);

    if (!editProject) {
      navigate(`/project/${normalizedName}`);
    }

    triggerProjectChange();
  };

  const handleDelete = (id) => {
    const updated = projects.filter((project) => project.id !== id);
    setProjects(updated);
    localStorage.setItem("projects", JSON.stringify(updated));
    triggerProjectChange();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h5">Projects</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleModalOpen()}>
          Add Project
        </Button>
      </Box>

      <List>
        {projects.length > 0 ? (
          projects.map((project) => (
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
              }}>
              <Box>
                <Typography variant="h6">
                  {project.name
                    .replaceAll("-", " ")
                    .split(" ")
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(" ")}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {`Color: ${project.color}`}
                </Typography>
              </Box>
              <Box>
                <IconButton
                  color="primary"
                  onClick={() => handleModalOpen(project)}>
                  <EditIcon />
                </IconButton>
                <IconButton
                  color="error"
                  onClick={() => handleDelete(project.id)}>
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
