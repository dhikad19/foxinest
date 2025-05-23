import React, { useState, useEffect } from "react";
import Projects from "../index";

const normalize = (str) =>
  typeof str === "string" ? str.replace(/ /g, "-").toLowerCase() : "";

const ProjectPage = () => {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const storedProjects = localStorage.getItem("projects");
    if (storedProjects) {
      setProjects(JSON.parse(storedProjects));
    }
  }, []);

  const handleSaveProject = (project, isEdit) => {
    const updatedProjects = isEdit
      ? projects.map((p) => (p.id === project.id ? project : p))
      : [...projects, project];

    setProjects(updatedProjects);
    localStorage.setItem("projects", JSON.stringify(updatedProjects));

    // Also update projects_data for this project if needed
    const storedProjectsData =
      JSON.parse(localStorage.getItem("projects_data")) || {};

    // Initialize or update the project's data
    storedProjectsData[project.id] = storedProjectsData[project.id] || {
      sections: [],
      tasks: [],
    };

    localStorage.setItem("projects_data", JSON.stringify(storedProjectsData));

    // Optionally dispatch event if you listen for it elsewhere
    window.dispatchEvent(new Event("projectsUpdated"));
  };

  const handleDeleteProject = (id) => {
    const updatedProjects = projects.filter((project) => project.id !== id);
    setProjects(updatedProjects);

    // Save updated projects
    localStorage.setItem("projects", JSON.stringify(updatedProjects));

    // Also remove corresponding projects_data entry
    const projectsDataRaw = localStorage.getItem("projects_data");
    if (projectsDataRaw) {
      const projectsData = JSON.parse(projectsDataRaw);
      const normalizedId = normalize(id);
      if (projectsData[normalizedId]) {
        delete projectsData[normalizedId];
        localStorage.setItem("projects_data", JSON.stringify(projectsData));
      }
    }

    // Dispatch custom event for projects update
    window.dispatchEvent(new Event("projectsUpdated"));
  };

  return (
    <Projects
      projects={projects}
      onSave={handleSaveProject}
      onDelete={handleDeleteProject}
    />
  );
};

export default ProjectPage;
