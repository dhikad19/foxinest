// src/pages/ProjectDetail.jsx
import React from "react";
import { useParams } from "react-router-dom";

const ProjectDetail = () => {
  const { projectId } = useParams(); // Grab the dynamic route parameter
  const storedProjects = JSON.parse(localStorage.getItem("projects")) || [];
  const project = storedProjects.find(
    (proj) => proj.id === parseInt(projectId)
  );

  if (!project) {
    return <div>Project not found</div>;
  }

  return (
    <div>
      <h1>{project.name}</h1>
      <p>Details of project {project.name} will go here.</p>
    </div>
  );
};

export default ProjectDetail;
