import React, { useState, useEffect } from "react";
import Projects from "../components/Projects";
import { updateLocalStorageProjects } from "../utils/storageEvent";

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
    updateLocalStorageProjects(updatedProjects); // Emit custom event
  };

  const handleDeleteProject = (id) => {
    const updatedProjects = projects.filter((project) => project.id !== id);
    setProjects(updatedProjects);
    updateLocalStorageProjects(updatedProjects); // Emit custom event
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
