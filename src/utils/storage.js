const STORAGE_KEY = "home_projects_data";

export const loadFromStorage = () => {
  if (typeof window === "undefined") return { tasks: [], sections: [] }; // Ensure this works in non-browser environments (e.g., SSR).
  try {
    const data = localStorage.getItem(STORAGE_KEY); // Get the raw data from localStorage
    if (!data) return { tasks: [], sections: [] }; // If no data exists, return empty arrays

    const parsedData = JSON.parse(data); // Parse the data
    return {
      tasks: parsedData.tasks || [], // Ensure tasks and sections fallback if undefined
      sections: parsedData.sections || [],
    };
  } catch (e) {
    console.error("Error loading from localStorage", e); // Log the error
    return { tasks: [], sections: [] }; // Fallback to empty data if there's an error
  }
};

export const saveToStorage = (tasks, sections) => {
  if (typeof window === "undefined") return; // Ensure no issue in non-browser environments

  const data = { tasks, sections };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); // Save the serialized data
};
