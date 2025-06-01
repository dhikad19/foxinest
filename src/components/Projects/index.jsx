import React, { useState } from "react";
import {
  Box,
  List,
  ListItem,
  Typography,
  IconButton,
  Button,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
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

  const [searchQuery, setSearchQuery] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [projectName, setProjectName] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState(null);

  const normalizeName = (str) => str.trim().toLowerCase().replace(/\s+/g, "-");
  const normalizeDisplay = (str) =>
    str
      .replaceAll("-", " ")
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

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

  const filteredProjects = projects.filter((project) =>
    project.name
      .replaceAll("-", " ")
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  return (
    <div
      style={{
        paddingLeft: "45px",
        paddingRight: "45px",
        maxWidth: "700px",
        margin: "0 auto",
        overflow: "visible",
        position: "relative",
      }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h5">Projects</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleModalOpen()}>
          Add Project
        </Button>
      </Box>

      <Box sx={{ mb: 2 }}>
        <input
          type="text"
          placeholder="Search projects..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: "4px",
            border: "1px solid #ccc",
            fontSize: "16px",
          }}
        />
      </Box>

      <List>
        {filteredProjects.length > 0 ? (
          filteredProjects.map((project) => {
            const displayName = normalizeDisplay(project.name);
            const projectPath = `/project/${project.name}`;

            const handleMenuOpen = (event) => {
              setMenuAnchor(event.currentTarget);
            };

            const handleMenuClose = () => {
              setMenuAnchor(null);
            };

            return (
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
                  cursor: "pointer",
                }}
                onClick={() => navigate(projectPath)}>
                <Box>
                  <Typography variant="h6">{displayName}</Typography>
                  {/* <Typography variant="body2" color="text.secondary">
                    {`Color: ${project.color}`}
                  </Typography> */}
                </Box>

                <Box onClick={(e) => e.stopPropagation()}>
                  <IconButton onClick={handleMenuOpen}>
                    <MoreVertIcon />
                  </IconButton>
                  <Menu
                    anchorEl={menuAnchor}
                    open={Boolean(menuAnchor)}
                    onClose={handleMenuClose}>
                    <MenuItem
                      style={{ fontSize: 14 }}
                      onClick={() => {
                        handleMenuClose();
                        handleModalOpen(project);
                      }}>
                      Edit
                    </MenuItem>
                    <MenuItem
                      style={{ fontSize: 14 }}
                      onClick={() => {
                        handleMenuClose();
                        handleDelete(project.id);
                      }}>
                      Delete
                    </MenuItem>
                  </Menu>
                </Box>
              </ListItem>
            );
          })
        ) : (
          <Typography>No projects found.</Typography>
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
    </div>
  );
};

export default Projects;
