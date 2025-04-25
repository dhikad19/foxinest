// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Completed from "./pages/Completed";
import Layout from "./components/Layout";
import Project from "./pages/Project";
import ProjectDetail from "./pages/ProjectDetail";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="completed" element={<Completed />} />
          <Route path="project" element={<Project />} />
          <Route path="project/:projectId" element={<ProjectDetail />} />{" "}
          {/* Dynamic Route for Project */}
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
