// src/pages/Project.jsx
import React, { useContext } from "react";
import { ProjectsContext } from "../contexts/ProjectsContext";

const Project = () => {
  const { projects, addProject } = useContext(ProjectsContext);

  const handleAddProject = () => {
    const newProject = { id: Date.now(), name: "New Project" };
    addProject(newProject); // Update state dan localStorage
  };

  return (
    <div>
      <h2>My Projects</h2>
      <button onClick={handleAddProject}>Add Project</button>
      <ul>
        {projects.map((project) => (
          <li key={project.id}>{project.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default Project;
