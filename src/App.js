// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import Home from "./pages/Home";
import About from "./pages/About";
import Completed from "./pages/Completed";
import Layout from "./components/Layout";
import Project from "./pages/Project";
import ProjectDetail from "./pages/ProjectDetail";
import WelcomePage from "./pages/Welcome";
import { CircularProgress, Box, Typography } from "@mui/material";

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const storedData = localStorage.getItem("userData");

    if (!storedData) {
      setUserData(null);
    } else {
      setUserData(JSON.parse(storedData));
    }

    setIsLoading(false);
  }, []);

  const handleUserSubmit = (data) => {
    localStorage.setItem("userData", JSON.stringify(data));
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
    <Router>
      <Routes>
        <Route
          path="/welcome"
          element={<WelcomePage onSubmit={handleUserSubmit} />}
        />
        <Route
          path="/"
          element={
            userData ? <Layout /> : <WelcomePage onSubmit={handleUserSubmit} />
          }
        >
          <Route
            index
            element={
              userData ? <Home /> : <WelcomePage onSubmit={handleUserSubmit} />
            }
          />
          <Route
            path="about"
            element={
              userData ? <About /> : <WelcomePage onSubmit={handleUserSubmit} />
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
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
