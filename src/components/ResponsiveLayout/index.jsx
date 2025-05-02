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
  Menu,
  MenuItem,
  Switch,
  FormControlLabel,
  IconButton as MuiIconButton,
} from "@mui/material";
import ListItemIcon from "@mui/material/ListItemIcon";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/DriveFileRenameOutlineOutlined";
import MoreVertOutlined from "@mui/icons-material/MoreVertOutlined";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import TagIcon from "@mui/icons-material/TagOutlined";
import FolderIcon from "@mui/icons-material/Folder";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import MenuIcon from "@mui/icons-material/Menu";
import {
  AddHomeOutlined as HomeIcon,
  InfoOutlined as InfoIcon,
  CheckCircleOutlined as CompletedIcon,
} from "@mui/icons-material";

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

  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const navigate = useNavigate();
  const location = useLocation();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  useEffect(() => {
    // Load initial projects
    const storedProjects = localStorage.getItem("projects");
    if (storedProjects) {
      setProjects(JSON.parse(storedProjects));
    }

    // Add event listener for project updates
    const handleProjectsUpdate = () => {
      const updatedProjects =
        JSON.parse(localStorage.getItem("projects")) || [];
      setProjects(updatedProjects);
    };

    window.addEventListener("projectsUpdated", handleProjectsUpdate);

    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener("projectsUpdated", handleProjectsUpdate);
    };
  }, []);

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
          {
            label: "Home",
            path: "/",
            icon: <HomeIcon style={{ fontSize: "22px" }} />,
          },
          {
            label: "About",
            path: "/about",
            icon: <InfoIcon style={{ fontSize: "22px" }} />,
          },
          {
            label: "Completed",
            path: "/completed",
            icon: <CompletedIcon style={{ fontSize: "22px" }} />,
          },
        ].map(({ label, path, icon }) => (
          <ListItem
            button
            key={label}
            sx={{
              "&:hover": {
                backgroundColor: "transparent", // Default to transparent
                "& .not-active": {
                  backgroundColor: "#ffe3cb",
                  borderRadius: "4px", // Red background on hover for non-active links
                },
              },
            }}
            style={{ padding: "0px 8px 0px 8px" }}
          >
            <NavLink
              to={path}
              className={({ isActive }) =>
                isActive ? "active-link" : "not-active"
              }
              style={{
                textDecoration: "none",
                width: "100%",
                padding: "8px 10px 8px 10px",
                color: "inherit",
                display: "flex", // Ensures icon and text align properly
                alignItems: "center",
              }}
            >
              <ListItemIcon
                sx={{ minWidth: "36px", color: "inherit" }} // Optional: Adjust spacing and inherit color
              >
                {icon}
              </ListItemIcon>
              <Typography
                variant="body1"
                sx={{
                  fontSize: "14px",
                }}
              >
                {label}
              </Typography>
            </NavLink>
          </ListItem>
        ))}

        {favoriteProjects.length > 0 && (
          <>
            <ListItem
              style={{
                padding: "0px 8px 0px 8px",
                marginTop: "20px",
                marginLeft: "10px",
              }}
              sx={{
                "&:hover": {
                  backgroundColor: "transparent", // Default to transparent
                  "& .not-active": {
                    backgroundColor: "#ffe3cb",
                    borderRadius: "4px", // Red background on hover for non-active links
                  },
                },
              }}
            >
              <ListItemText
                primary={
                  <span
                    style={{
                      fontSize: "15px",
                      fontWeight: "bold",
                    }}
                  >
                    Favorites
                  </span>
                }
              />
            </ListItem>
            {favoriteProjects.map((project) => (
              <ListItem
                button
                style={{ padding: "0px 8px 0px 8px" }}
                key={project.id}
                sx={{
                  "&:hover": {
                    backgroundColor: "transparent", // Default to transparent
                    "& .not-active": {
                      backgroundColor: "#ffe3cb",
                      borderRadius: "4px", // Red background on hover for non-active links
                    },
                  },
                }}
              >
                <NavLink
                  to={`/project/${project.id}`}
                  className={({ isActive }) =>
                    isActive ? "active-link" : "not-active"
                  }
                  style={{
                    textDecoration: "none",
                    width: "100%",
                    padding: "8px 10px 8px 10px",
                    color: "inherit",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <ListItemIcon sx={{ minWidth: "36px", color: "inherit" }}>
                    <TagIcon style={{ fontSize: "22px" }} />{" "}
                    {/* Example icon */}
                  </ListItemIcon>
                  <Typography
                    variant="body1"
                    sx={{
                      fontSize: "14px",
                      maxWidth: "120px",
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                      textOverflow: "ellipsis",
                      fontWeight: "400",
                    }}
                  >
                    {project.name}
                  </Typography>
                </NavLink>
              </ListItem>
            ))}
          </>
        )}

        {/* My Projects header */}
        <ListItem
          style={{ padding: "0px 8px 0px 8px", marginTop: "20px" }}
          sx={{
            "&:hover": {
              backgroundColor: "transparent", // Default to transparent
              "& .not-active": {
                backgroundColor: "#ffe3cb",
                borderRadius: "4px", // Red background on hover for non-active links
              },
            },
          }}
          secondaryAction={
            <IconButton edge="end" onClick={handleModalOpen}>
              <AddIcon style={{ color: "#000000", marginRight: "5px" }} />
            </IconButton>
          }
        >
          <NavLink
            to="/project"
            className={({ isActive }) =>
              isActive ? "active-link" : "not-active"
            }
            style={{
              textDecoration: "none",
              width: "100%",
              color: "inherit",
              display: "flex",
              alignItems: "center",
              padding: "8px 10px 8px 10px",
            }}
            end
          >
            <Typography
              variant="body1"
              sx={{
                fontSize: "14px",
                fontWeight: "bold",
              }}
            >
              My Projects
            </Typography>
          </NavLink>
        </ListItem>

        {/* Dynamic project list */}
        {projects.map((project) => (
          <ListItem
            button
            style={{ padding: "0px 8px 0px 8px" }}
            key={project.id}
            sx={{
              "&:hover": {
                backgroundColor: "transparent", // Default to transparent
                "& .not-active": {
                  backgroundColor: "#ffe3cb",
                  borderRadius: "4px", // Red background on hover for non-active links
                },
              },
            }}
          >
            <NavLink
              to={`/project/${project.id}`}
              className={({ isActive }) =>
                isActive ? "active-link" : "not-active"
              }
              style={{
                textDecoration: "none",
                width: "100%",
                color: "inherit",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "8px 10px 8px 10px",
              }}
            >
              <div style={{ display: "flex" }}>
                <ListItemIcon sx={{ minWidth: "36px", color: "inherit" }}>
                  <TagIcon style={{ fontSize: "22px" }} />
                </ListItemIcon>

                <Typography
                  variant="body1"
                  sx={{
                    fontSize: "14px",
                    maxWidth: "100px",
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                    textOverflow: "ellipsis",
                    fontWeight: "400",
                  }}
                >
                  {project.name}
                </Typography>
              </div>

              <MoreVertOutlined
                style={{ fontSize: "22px" }}
                onClick={(e) => {
                  e.preventDefault(); // Prevents navigation click
                  handleMenuOpen(e);
                }}
              />

              <Menu
                id={`menu-${project.id}`}
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                PaperProps={{
                  elevation: 2, // Adjust elevation to make the shadow lighter
                  sx: {
                    boxShadow: "rgba(0, 0, 0, 0.007) 0px 4px 6px",
                    borderRadius: "6px", // Custom shadow if needed
                    minWidth: "200px",
                  },
                }}
              >
                <MenuItem
                  onClick={(e) => {
                    e.preventDefault();
                    handleEditProject(project);
                    handleMenuClose();
                  }}
                >
                  <EditIcon style={{ marginRight: "20px", fontSize: "22px" }} />
                  <span style={{ fontSize: "14px" }}>Edit</span>
                </MenuItem>
                <MenuItem
                  onClick={(e) => {
                    e.preventDefault();
                    handleDeleteProject(project.id);
                    handleMenuClose();
                  }}
                >
                  <DeleteIcon
                    style={{ marginRight: "20px", fontSize: "22px" }}
                  />
                  <span style={{ fontSize: "14px" }}>Delete</span>
                </MenuItem>
              </Menu>
            </NavLink>
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
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              backgroundColor: "#FFF7E6",
              color: "#000000",
              scrollbarWidth: "thin",
              overflowX: "hidden",
            },
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
              backgroundColor: "#FFF7E6",
              color: "#000000",
              boxSizing: "border-box",
              height: "100vh",
              position: "fixed",
              overflowX: "hidden",
              scrollbarWidth: "thin",
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
