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
import CalendarIcon from "@mui/icons-material/CalendarMonthOutlined";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import MenuIcon from "@mui/icons-material/Menu";
import {
  AddHomeOutlined as HomeIcon,
  InfoOutlined as InfoIcon,
  CheckCircleOutlined as CompletedIcon,
  Home,
} from "@mui/icons-material";
import ProjectDetail from "../../pages/ProjectDetail";

const drawerWidth = 240;

const ResponsiveLayout = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [projects, setProjects] = useState(() => {
    const storedProjects = localStorage.getItem("projects");
    return storedProjects ? JSON.parse(storedProjects) : [];
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [showBorder, setShowBorder] = useState(false);
  const [showTitle, setShowTitle] = useState(false);

  const getTitle = () => {
    switch (location.pathname) {
      case "/":
        return "Home";
      case "/about":
        return "About";
      case "/calendar":
        return "";
      default:
        return location.pathname;
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setShowBorder(scrollY > 0);
      setShowTitle(scrollY > 40);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);
  // const [projects, setProjects] = useState(() => {
  //   try {
  //     return JSON.parse(localStorage.getItem("projects")) || [];
  //   } catch {
  //     return [];
  //   }
  // });

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
    const updateProjects = () => {
      const stored = localStorage.getItem("projects");
      setProjects(stored ? JSON.parse(stored) : []);
    };

    // Listen for storage changes or custom events
    window.addEventListener("localStorage-update", updateProjects);
    window.addEventListener("storage", updateProjects);

    return () => {
      window.removeEventListener("localStorage-update", updateProjects);
      window.removeEventListener("storage", updateProjects);
    };
  }, []);

  useEffect(() => {
    const handleProjectChange = () => {
      const storedProjects = localStorage.getItem("projects");
      setProjects(storedProjects ? JSON.parse(storedProjects) : []);
    };

    window.addEventListener("projectChange", handleProjectChange);

    return () => {
      window.removeEventListener("projectChange", handleProjectChange);
    };
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      setMobileOpen(false); // Closfe drawer on route change
    }
  }, [location.pathname]);

  const handleModalOpen = () => setOpenModal(true);
  const handleModalClose = () => {
    setOpenModal(false);
    setEditProject(null); // Reset the edit project state when modal is closed
  };

  // const handleAddProject = () => {
  //   if (projectName.trim()) {
  //     const newProject = {
  //       id: Date.now(),
  //       name: projectName.trim(),
  //       color: selectedColor || "default", // Default color if no selection is made
  //       isFavorite,
  //     };
  //     const updatedProjects = [...projects, newProject];

  //     setProjects(updatedProjects);
  //     localStorage.setItem("projects", JSON.stringify(updatedProjects));

  //     setProjectName("");
  //     setSelectedColor("");
  //     setIsFavorite(false);
  //     setOpenModal(false);
  //     navigate(`/project/${newProject.id}`);
  //   }
  // };

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

  // const handleSaveProjectEdit = () => {
  //   if (editProject) {
  //     const updatedProjects = projects.map((project) =>
  //       project.id === editProject.id
  //         ? { ...project, name: projectName, color: selectedColor, isFavorite }
  //         : project
  //     );

  //     setProjects(updatedProjects);
  //     localStorage.setItem("projects", JSON.stringify(updatedProjects));

  //     setProjectName("");
  //     setSelectedColor("");
  //     setIsFavorite(false);
  //     setOpenModal(false);
  //     setEditProject(null);
  //   }
  // };

  const handleAddProject = () => {
    if (projectName.trim()) {
      // Check if project name already exists
      const projectExists = projects.some(
        (project) =>
          project.name.toLowerCase() === projectName.trim().toLowerCase()
      );

      if (projectExists) {
        alert("A project with this name already exists."); // Show an error message
        return;
      }

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

  const handleSaveProjectEdit = () => {
    if (editProject) {
      // Check if the updated project name already exists in other projects
      const projectExists = projects.some(
        (project) =>
          project.id !== editProject.id &&
          project.name.toLowerCase() === projectName.trim().toLowerCase()
      );

      if (projectExists) {
        alert("A project with this name already exists."); // Show an error message
        return;
      }

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
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginTop: "-48px",
          marginBottom: "10px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "50%",
            backgroundColor: "#ff7800",
            minHeight: "35px",
            minWidth: "35px",
            color: "#ffffff",
            marginRight: "10px",
            marginLeft: "10px",
          }}
        >
          D
        </div>
        <div>
          <p
            style={{
              marginBottom: "0px",
              lineHeight: "normal",
              fontWeight: "500",
            }}
          >
            Dwi Andika
          </p>
          {/* <p
            style={{
              marginBottom: "0px",
              lineHeight: "normal",
              fontSize: "14px",
            }}
          >
            dwiandika911@gmail.com
          </p> */}
        </div>
      </div>
      <List>
        {[
          {
            label: "Home",
            path: "/",
            icon: <HomeIcon style={{ fontSize: "22px" }} />,
          },
          {
            label: "Completed",
            path: "/completed",
            icon: <CompletedIcon style={{ fontSize: "22px" }} />,
          },
          {
            label: "Calendar",
            path: "/calendar",
            icon: <CalendarIcon style={{ fontSize: "22px" }} />,
          },
          {
            label: "About",
            path: "/about",
            icon: <InfoIcon style={{ fontSize: "22px" }} />,
          },
        ].map(({ label, path, icon }) => (
          <ListItem
            button
            key={label}
            sx={{
              "&:hover": {
                backgroundColor: "transparent", // Default to transparent
                "& .not-active": {
                  backgroundColor: "#c0c0c042",
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
                    backgroundColor: "#c0c0c042",
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
                      backgroundColor: "#c0c0c042",
                      borderRadius: "4px", // Red background on hover for non-active links
                    },
                  },
                }}
              >
                <NavLink
                  to={`/project/${project.name}`}
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
                      maxWidth: "110px",
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
                backgroundColor: "#c0c0c042",
                borderRadius: "4px", // Red background on hover for non-active links
              },
            },
          }}
          secondaryAction={
            <AddIcon
              onClick={handleModalOpen}
              style={{ color: "#000000", marginTop: "7px" }}
            />
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
                  backgroundColor: "#c0c0c042",
                  borderRadius: "4px", // Red background on hover for non-active links
                },
              },
            }}
          >
            <NavLink
              to={`/project/${project.name}`}
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
            backgroundColor: "#fff",
            color: "#000",
            borderBottom: showBorder ? "1px solid #eee" : "none",
          }}
        >
          <Toolbar sx={{ position: "relative", alignItems: "center" }}>
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
            <img
              src="/logo-todo.png"
              style={{ objectFit: "contain", maxWidth: 120 }}
              alt="Logo"
            />

            {/* Animated Title */}
            <Typography
              variant="h6"
              sx={{
                position: "absolute",
                top: showTitle ? "50%" : "80%",
                left: isMobile ? "90%" : "50%",
                transform: "translate(-50%, -50%)",
                opacity: showTitle ? 1 : 0,
                transition: "top 0.2s ease, opacity 0.1s ease",
              }}
            >
              {getTitle()}
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
