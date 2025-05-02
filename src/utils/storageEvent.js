// src/utils/storageEvent.js
export const updateLocalStorageProjects = (projects) => {
  localStorage.setItem("projects", JSON.stringify(projects));
  window.dispatchEvent(new Event("projectsUpdated"));
};
