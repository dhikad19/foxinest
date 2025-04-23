import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Box,
  CssBaseline,
  useTheme,
  useMediaQuery,
  Modal,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  IconButton as MuiIconButton,
} from "@mui/material";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import MenuIcon from "@mui/icons-material/Menu";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

const drawerWidth = 240;

const ResponsiveLayout = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [projects, setProjects] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("projects")) || [];
    } catch {
      return [];
    }
  });

  const navigate = useNavigate();
  const location = useLocation();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  useEffect(() => {
    if (mobileOpen) {
      setMobileOpen(false); // Close drawer on route change
    }
  }, [location.pathname]);

  const handleModalOpen = () => setOpenModal(true);
  const handleModalClose = () => {
    setOpenModal(false);
    setEditProject(null); // Reset the edit project state when modal is closed
  };

  const handleAddProject = () => {
    if (projectName.trim()) {
      const newProject = {
        id: Date.now(),
        name: projectName.trim(),
        color: selectedColor || "default", // Default color if no selection is made
        isFavorite,
      };
      const updatedProjects = [...projects, newProject];

      setProjects(updatedProjects);
      localStorage.setItem("projects", JSON.stringify(updatedProjects));

      setProjectName("");
      setSelectedColor("");
      setIsFavorite(false);
      setOpenModal(false);
      navigate(`/project/${newProject.id}`);
    }
  };

  const handleEditProject = (project) => {
    setEditProject(project);
    setProjectName(project.name);
    setSelectedColor(project.color);
    setIsFavorite(project.isFavorite);
    setOpenModal(true);
  };

  const handleDeleteProject = (projectId) => {
    const updatedProjects = projects.filter(
      (project) => project.id !== projectId
    );
    setProjects(updatedProjects);
    localStorage.setItem("projects", JSON.stringify(updatedProjects));
  };

  const handleSaveProjectEdit = () => {
    if (editProject) {
      const updatedProjects = projects.map((project) =>
        project.id === editProject.id
          ? { ...project, name: projectName, color: selectedColor, isFavorite }
          : project
      );

      setProjects(updatedProjects);
      localStorage.setItem("projects", JSON.stringify(updatedProjects));

      setProjectName("");
      setSelectedColor("");
      setIsFavorite(false);
      setOpenModal(false);
      setEditProject(null);
    }
  };

  const isActiveLink = (path) => location.pathname === path;

  const favoriteProjects = projects.filter((project) => project.isFavorite);
  const drawer = (
    <div>
      <Toolbar />
      <List>
        {/* Static Pages */}
        {[
          { label: "Home", path: "/" },
          { label: "About", path: "/about" },
          { label: "Completed", path: "/completed" },
        ].map(({ label, path }) => (
          <ListItem button key={label}>
            <NavLink
              to={path}
              className={({ isActive }) => (isActive ? "active-link" : "")}
              style={{
                textDecoration: "none",
                width: "100%",
                color: "inherit",
              }}
            >
              <ListItemText primary={label} />
            </NavLink>
          </ListItem>
        ))}

        {favoriteProjects.length > 0 && (
          <>
            <ListItem>
              <ListItemText primary="Favorites" />
            </ListItem>
            {favoriteProjects.map((project) => (
              <ListItem button key={project.id}>
                <NavLink
                  to={`/project/${project.id}`}
                  className={({ isActive }) => (isActive ? "active-link" : "")}
                  style={{
                    textDecoration: "none",
                    width: "100%",
                    color: "inherit",
                  }}
                >
                  <ListItemText primary={project.name} />
                </NavLink>
              </ListItem>
            ))}
          </>
        )}

        {/* My Projects header */}
        <ListItem
          secondaryAction={
            <IconButton edge="end" onClick={handleModalOpen}>
              <AddIcon />
            </IconButton>
          }
        >
          <NavLink
            to="/project"
            className={({ isActive }) => (isActive ? "active-link" : "")}
            style={{
              textDecoration: "none",
              width: "100%",
              color: "inherit",
            }}
            end // Only activate when exactly at "/project"
          >
            <ListItemText primary="My Projects" />
          </NavLink>
        </ListItem>

        {/* Dynamic project list */}
        {projects.map((project) => (
          <ListItem button key={project.id}>
            <NavLink
              to={`/project/${project.id}`}
              className={({ isActive }) => (isActive ? "active-link" : "")}
              style={{
                textDecoration: "none",
                width: "100%",
                color: "inherit",
              }}
            >
              <ListItemText primary={project.name} />
            </NavLink>

            {/* Edit & Delete icons */}
            <MuiIconButton
              edge="end"
              onClick={() => handleEditProject(project)}
              sx={{ color: "blue" }}
            >
              <EditIcon />
            </MuiIconButton>
            <MuiIconButton
              edge="end"
              onClick={() => handleDeleteProject(project.id)}
              sx={{ color: "red" }}
            >
              <DeleteIcon />
            </MuiIconButton>
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      <CssBaseline />

      {/* Sidebar */}
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="sidebar"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": { width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>

        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", sm: "block" },
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              boxSizing: "border-box",
              height: "100vh",
              position: "fixed",
              top: 0,
              left: 0,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* AppBar & content */}
      <Box sx={{ flexGrow: 1, width: "100%", pl: { sm: `${drawerWidth}px` } }}>
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            borderBottom: "1px solid #ddd",
            backgroundColor: "#fff",
            color: "#000",
          }}
        >
          <Toolbar>
            {isMobile && (
              <IconButton
                color="inherit"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
            )}
            <Typography variant="h6" noWrap>
              My App
            </Typography>
          </Toolbar>
        </AppBar>

        <Box component="main" sx={{ p: 3 }}>
          {children}
        </Box>
      </Box>

      {/* Add/Edit project modal */}
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
            onClick={editProject ? handleSaveProjectEdit : handleAddProject}
          >
            {editProject ? "Save Changes" : "Add Project"}
          </Button>
        </Box>
      </Modal>
    </Box>
  );
};

export default ResponsiveLayout;
