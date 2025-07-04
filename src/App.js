// src/App.jsx
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { useState, useEffect } from "react";
import Home from "./pages/Home";
import About from "./pages/About";
import Completed from "./pages/Completed";
import Layout from "./components/Layout";
import Project from "./pages/Project";
import ProjectDetail from "./pages/ProjectDetail";
import WelcomePage from "./pages/Welcome";
import Calendar from "./pages/Calendar";
import NotFoundPage from "./components/404";
import { CircularProgress, Box, Typography } from "@mui/material";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const routeTitles = {
  "/": "Home - Foxinest",
  "/about": "About Us - Foxinest",
  "/calendar": "Calendar - Foxinest",
  "/completed": "Completed Tasks - Foxinest",
  "/project": "Projects - Foxinest",
  "/project/:projectId": "Project Details - Foxinest",
  "/welcome": "Welcome - Foxinest",
  "*": "404 - Page Not Found",
};

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const storedData = localStorage.getItem("user_data");

    if (!storedData) {
      setUserData(null);
    } else {
      setUserData(JSON.parse(storedData));
    }

    setIsLoading(false);
  }, []);

  const handleUserSubmit = (data) => {
    localStorage.setItem("user_data", JSON.stringify(data));
    setUserData(data); // <-- update state here
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
        }}
      >
        <CircularProgress sx={{ color: "#ff7800" }} />
        <Typography variant="subtitle1" sx={{ marginTop: 2 }}>
          Please wait
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <ToastContainer position="top-right" autoClose={6000} />
      <Router>
        <PageTitleUpdater />
        <Routes>
          <Route
            path="/welcome"
            element={<WelcomePage onSubmit={handleUserSubmit} />}
          />

          {/* Main layout routes */}
          <Route
            path="/"
            element={
              userData ? (
                <Layout />
              ) : (
                <WelcomePage onSubmit={handleUserSubmit} />
              )
            }
          >
            <Route
              index
              element={
                userData ? (
                  <Home />
                ) : (
                  <WelcomePage onSubmit={handleUserSubmit} />
                )
              }
            />
            <Route
              path="about"
              element={
                userData ? (
                  <About />
                ) : (
                  <WelcomePage onSubmit={handleUserSubmit} />
                )
              }
            />
            <Route
              path="calendar"
              element={
                userData ? (
                  <Calendar />
                ) : (
                  <WelcomePage onSubmit={handleUserSubmit} />
                )
              }
            />
            <Route
              path="completed"
              element={
                userData ? (
                  <Completed />
                ) : (
                  <WelcomePage onSubmit={handleUserSubmit} />
                )
              }
            />
            <Route
              path="project"
              element={
                userData ? (
                  <Project />
                ) : (
                  <WelcomePage onSubmit={handleUserSubmit} />
                )
              }
            />
            <Route
              path="project/:projectId"
              element={
                userData ? (
                  <ProjectDetail />
                ) : (
                  <WelcomePage onSubmit={handleUserSubmit} />
                )
              }
            />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
    </>
  );
};

const PageTitleUpdater = () => {
  const location = useLocation();

  useEffect(() => {
    const matchedRoute = Object.keys(routeTitles).find((route) => {
      if (route === "*") return false; // Skip wildcard for matching

      // Create a regex to match routes, replacing dynamic segments with a pattern
      const routeRegex = new RegExp(`^${route.replace(/:\w+/g, "[^/]+")}$`);
      return routeRegex.test(location.pathname);
    });

    document.title = routeTitles[matchedRoute] || routeTitles["*"];
  }, [location.pathname]);

  return null;
};

export default App;
