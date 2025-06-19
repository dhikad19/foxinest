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
  IconButton as MuiIconButton,
} from "@mui/material";
import TaskActive from "./Task";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import CommentsIcon from "@mui/icons-material/ChatBubbleOutline";
import MoreHorizOutlinedIcon from "@mui/icons-material/MoreHorizOutlined";
import ListItemIcon from "@mui/material/ListItemIcon";
import AddIcon from "@mui/icons-material/Add";
import TagIcon from "@mui/icons-material/TagOutlined";
import CalendarIcon from "@mui/icons-material/CalendarMonthOutlined";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import MenuIcon from "@mui/icons-material/Menu";
import ProjectModal from "../Modal/Project/Add";
import {
  AddHomeOutlined as HomeIcon,
  InfoOutlined as InfoIcon,
  CheckCircleOutlined as CompletedIcon,
} from "@mui/icons-material";

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
  const normalizeName = (str) => str.trim().toLowerCase().replace(/\s+/g, "-");

  const getTitle = () => {
    switch (location.pathname) {
      case "/":
        return "Home";
      case "/about":
        return "About";
      case "/calendar":
        return "Calendar";
      case "/completed":
        return "Completed";
      case "/project":
        return "Project";
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

  const navigate = useNavigate();
  const location = useLocation();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
  function capitalizeEachWord(str) {
    return str.replace(/\b\w/g, (char) => char.toUpperCase());
  }
  useEffect(() => {
    const updateProjects = () => {
      const stored = localStorage.getItem("projects");
      setProjects(stored ? JSON.parse(stored) : []);
    };

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
      setMobileOpen(false);
    }
  }, [location.pathname]);

  const handleModalOpen = () => setOpenModal(true);
  const handleModalClose = () => {
    setOpenModal(false);
    setEditProject(null);
  };

  const getCurrentDate = () => {
    const today = new Date();
    const day = today.getDate();
    const dayOfWeek = today.toLocaleString("default", { weekday: "short" });
    const month = today.toLocaleString("default", { month: "short" });

    return `${dayOfWeek}, ${day} ${month}`;
  };
  const getCurrentDateMobile = () => {
    const today = new Date();
    const day = today.getDate();
    // const dayOfWeek = today.toLocaleString("default", { weekday: "short" });
    const month = today.toLocaleString("default", { month: "short" });

    return `${day} ${month}`;
  };

  const userData = JSON.parse(localStorage.getItem("user_data"));

  const triggerProjectChange = () => {
    const event = new Event("projectChange");
    window.dispatchEvent(event);
  };

  const handleAddProject = () => {
    const trimmedName = projectName.trim();
    if (!trimmedName) return;

    const normalizedName = normalizeName(trimmedName);

    const projectExists = projects.some(
      (project) => normalizeName(project.name) === normalizedName
    );

    if (projectExists) {
      alert("A project with this name already exists.");
      return;
    }

    const newProject = {
      id: Date.now(),
      name: normalizedName, // simpan dalam bentuk normalized
      color: selectedColor || "default",
      isFavorite,
    };

    const updatedProjects = [...projects, newProject];
    setProjects(updatedProjects);
    localStorage.setItem("projects", JSON.stringify(updatedProjects));

    const projectsData =
      JSON.parse(localStorage.getItem("projects_data")) || {};

    projectsData[normalizedName] = {
      sections: [],
      tasks: [],
    };

    localStorage.setItem("projects_data", JSON.stringify(projectsData));
    // UI cleanup
    setProjectName("");
    setSelectedColor("");
    setIsFavorite(false);
    setOpenModal(false);

    navigate(`/project/${normalizedName}`);

    triggerProjectChange();
  };

  const favoriteProjects = projects.filter((project) => project.isFavorite);
  const drawer = (
    <div>
      <Toolbar />

      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginTop: isMobile ? "-45px" : "-48px",
          marginBottom: isMobile ? "15px" : "10px",
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
          {userData.firstName.charAt(0)}
        </div>
        <div>
          <p
            style={{
              marginBottom: "0px",
              lineHeight: "normal",
              fontWeight: "500",
            }}
          >
            {userData.firstName} {userData.lastName}
          </p>
        </div>
      </div>

      <div
        style={{
          overflowY: "auto",
          overflowX: "hidden",
          height: "calc(100vh - 61px)",
          paddingRight: "4px",
          scrollbarWidth: "thin",
          scrollbarColor: "#c0c0c0 transparent",
          WebkitScrollbarWidth: "thin",
        }}
      >
        <style>
          {`
            ::-webkit-scrollbar {
              width: 6px;
            }
            ::-webkit-scrollbar-thumb {
              background-color: #bbb;
              border-radius: 3px;
            }
            ::-webkit-scrollbar-track {
              background: transparent;
            }
          `}
        </style>

        <List>
          {[
            {
              label: "Home",
              path: "/",
              icon: <HomeIcon style={{ fontSize: "22px" }} />,
            },

            {
              label: "Calendar",
              path: "/calendar",
              icon: <CalendarIcon style={{ fontSize: "22px" }} />,
            },
            {
              label: "Completed",
              path: "/completed",
              icon: <CompletedIcon style={{ fontSize: "22px" }} />,
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
                  backgroundColor: "transparent",
                  "& .not-active": {
                    backgroundColor: "#c0c0c042",
                    borderRadius: "4px",
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
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <ListItemIcon sx={{ minWidth: "36px", color: "inherit" }}>
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
                    backgroundColor: "transparent",
                    "& .not-active": {
                      backgroundColor: "#c0c0c042",
                      borderRadius: "4px",
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
                      backgroundColor: "transparent",
                      "& .not-active": {
                        backgroundColor: "#c0c0c042",
                        borderRadius: "4px",
                      },
                    },
                  }}
                >
                  <NavLink
                    to={`/project/${normalizeName(project.name)}`}
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
                      <TagIcon
                        style={{ fontSize: "22px", color: project.color }}
                      />{" "}
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
                      {project.name
                        .replaceAll("-", " ")
                        .split(" ")
                        .map(
                          (word) => word.charAt(0).toUpperCase() + word.slice(1)
                        )
                        .join(" ")}
                    </Typography>
                  </NavLink>
                </ListItem>
              ))}
            </>
          )}

          <ListItem
            style={{ padding: "0px 8px 0px 8px", marginTop: "20px" }}
            sx={{
              "&:hover": {
                backgroundColor: "transparent",
                "& .not-active": {
                  backgroundColor: "#c0c0c042",
                  borderRadius: "4px",
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

          {projects.map((project) => (
            <ListItem
              button
              style={{ padding: "0px 8px 0px 8px" }}
              key={project.id}
              sx={{
                "&:hover": {
                  backgroundColor: "transparent",
                  "& .not-active": {
                    backgroundColor: "#c0c0c042",
                    borderRadius: "4px",
                  },
                },
              }}
            >
              <NavLink
                to={`/project/${normalizeName(project.name)}`}
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
                    <TagIcon
                      style={{ fontSize: "22px", color: project.color }}
                    />
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
                    {project.name
                      .replaceAll("-", " ")
                      .split(" ")
                      .map(
                        (word) => word.charAt(0).toUpperCase() + word.slice(1)
                      )
                      .join(" ")}
                  </Typography>
                </div>
              </NavLink>
            </ListItem>
          ))}
        </List>
      </div>
    </div>
  );

  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      <CssBaseline />

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
      <Box sx={{ flexGrow: 1, width: "100%", pl: { sm: `${drawerWidth}px` } }}>
        <AppBar
          elevation={0}
          sx={{
            width: isMobile ? "100vw" : `calc(100vw - ${drawerWidth}px)`,
            top: 0,
            backgroundColor: "#fff",
            color: "#000",
            borderBottom: showBorder ? "1px solid rgba(0, 0, 0, 0.12)" : "none",
          }}
        >
          <Toolbar sx={{ position: "relative", alignItems: "center" }}>
            {isMobile && (
              <IconButton
                color="inherit"
                edge="start"
                style={{ marginRight: 3 }}
                onClick={handleDrawerToggle}
              >
                <MenuIcon />
              </IconButton>
            )}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <div></div>

              {location.pathname.split("/")[1] === "project" ? (
                <div style={{ display: "flex", alignItems: "center" }}>
                  <Typography
                    variant="h6"
                    sx={{
                      position: "absolute",
                      textAlign: "center",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      fontSize: isMobile ? "16px" : "17px",
                      maxWidth: isMobile ? "80px" : "150px",
                      textOverflow: "ellipsis",
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                      opacity: showTitle ? 1 : 0,
                      transition: "opacity 0.2s ease",
                    }}
                  >
                    {capitalizeEachWord(
                      location.pathname.split("/")[2]?.replaceAll("-", " ") ||
                        ""
                    )}
                  </Typography>
                </div>
              ) : (
                <Typography
                  variant="h6"
                  sx={{
                    position: "absolute",
                    textAlign: "center",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    fontSize: isMobile ? "16px" : "17px",
                    maxWidth: isMobile ? "80px" : "150px",
                    textOverflow: "ellipsis",
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                    opacity: showTitle ? 1 : 0,
                    transition: "opacity 0.2s ease",
                  }}
                >
                  {getTitle()}
                </Typography>
              )}
              <div style={{ display: "flex", alignItems: "center" }}>
                <TaskActive />
                <NavLink
                  to={"/calendar"}
                  style={{ textDecoration: "none", color: "#000000" }}
                >
                  <div
                    style={{
                      display: "flex",
                      gap: 5,
                      padding: "2px 8px 2px 8px",
                      justifyContent: "center",
                      alignItems: "center",
                      backgroundColor: "rgb(241 241 241)",
                      marginRight: -2,
                      borderRadius: 2,
                    }}
                  >
                    <CalendarTodayIcon style={{ fontSize: 15 }} />
                    <p style={{ fontSize: 14, fontWeight: 500 }}>
                      {isMobile ? getCurrentDateMobile() : getCurrentDate()}
                    </p>
                  </div>
                </NavLink>
              </div>

              {/* {location.pathname.split("/")[1] === "project" && (
                <div style={{ display: "flex", alignItems: "center" }}>
                  <CommentsIcon style={{ marginRight: 10 }} />
                  <MoreHorizOutlinedIcon
                    style={{ marginRight: isMobile ? -4 : 0 }}
                  />
                </div>
              )} */}
            </div>
          </Toolbar>
        </AppBar>

        <Box component="main" sx={{ p: 3 }}>
          {children}
        </Box>
      </Box>
      <ProjectModal
        open={openModal}
        onClose={handleModalClose}
        onSubmit={handleAddProject}
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

export default ResponsiveLayout;
