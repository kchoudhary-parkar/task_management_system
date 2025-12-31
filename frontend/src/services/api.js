const API_BASE_URL = "http://localhost:8000/api";

// Get token from localStorage
const getToken = () => localStorage.getItem("token");

// Auth API calls
export const authAPI = {
  register: async (name, email, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Registration failed");
    return data;
  },

  login: async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Login failed");
    return data;
  },

  getProfile: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to get profile");
    return data;
  },
};

// Project API calls
export const projectAPI = {
  // Get all user projects
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/projects`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to fetch projects");
    return data;
  },

  // Get project by ID
  getById: async (projectId) => {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to fetch project");
    return data;
  },

  // Create new project
  create: async (projectData) => {
    const response = await fetch(`${API_BASE_URL}/projects`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(projectData),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to create project");
    return data;
  },

  // Update project
  update: async (projectId, projectData) => {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(projectData),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to update project");
    return data;
  },

  // Delete project
  delete: async (projectId) => {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to delete project");
    return data;
  },
};
