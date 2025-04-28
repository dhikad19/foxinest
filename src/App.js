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

const App = () => {
  const [isLoading, setIsLoading] = useState(true); // Loading state to wait until the check is done
  const [userData, setUserData] = useState(null); // Store user data
  const [isRedirected, setIsRedirected] = useState(false); // Track if the redirect has happened

  useEffect(() => {
    const storedData = localStorage.getItem("userData");

    if (!storedData) {
      setUserData(null); // No user data, so they need to fill the form
    } else {
      setUserData(JSON.parse(storedData)); // Set user data from localStorage
    }

    setIsLoading(false); // After the check, stop loading
  }, []);

  if (isLoading) {
    return <div>Loading...</div>; // Display a loading message until we know what to render
  }

  // If there's no user data, show WelcomePage; otherwise, show HomePage
  return (
    <Router>
      <Routes>
        <Route path="/welcome" element={<WelcomePage />} />{" "}
        {/* Route to WelcomePage */}
        <Route path="/" element={userData ? <Layout /> : <WelcomePage />}>
          <Route index element={userData ? <Home /> : <WelcomePage />} />
          <Route path="about" element={<About />} />
          <Route path="completed" element={<Completed />} />
          <Route path="project" element={<Project />} />
          <Route path="project/:projectId" element={<ProjectDetail />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
