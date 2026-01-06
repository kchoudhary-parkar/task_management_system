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

// User API calls
export const userAPI = {
  // Search users by email
  searchByEmail: async (emailQuery) => {
    const response = await fetch(
      `${API_BASE_URL}/users/search?email=${encodeURIComponent(emailQuery)}`,
      {
        headers: { Authorization: `Bearer ${getToken()}` },
      }
    );
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to search users");
    return data;
  },

  // Get all users (admin+)
  getAllUsers: async () => {
    const response = await fetch(`${API_BASE_URL}/users`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to fetch users");
    return data;
  },

  // Update user role (super-admin only)
  updateUserRole: async (userId, role) => {
    const response = await fetch(`${API_BASE_URL}/users/role`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ user_id: userId, role }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to update user role");
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

// Member API calls
export const memberAPI = {
  // Add member to project
  addMember: async (projectId, email) => {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/members`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ email }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to add member");
    return data;
  },

  // Get project members
  getMembers: async (projectId) => {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/members`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to fetch members");
    return data;
  },

  // Remove member from project
  removeMember: async (projectId, userId) => {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/members/${userId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to remove member");
    return data;
  },
};

// Task API calls
export const taskAPI = {
  // Create task
  create: async (projectId, taskData) => {
    const response = await fetch(`${API_BASE_URL}/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({
        ...taskData,
        project_id: projectId,
      }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to create task");
    return data;
  },

  // Get all tasks for a project
  getByProject: async (projectId) => {
    const response = await fetch(`${API_BASE_URL}/tasks/project/${projectId}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to fetch tasks");
    return data;
  },

  // Get task by ID
  getById: async (taskId) => {
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to fetch task");
    return data;
  },

  // Get my assigned tasks
  getMyTasks: async () => {
    const response = await fetch(`${API_BASE_URL}/tasks/my`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to fetch tasks");
    return data;
  },

  // Update task
  update: async (taskId, taskData) => {
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(taskData),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to update task");
    return data;
  },

  // Delete task
  delete: async (taskId) => {
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to delete task");
    return data;
  },

  // Add label to task
  addLabel: async (taskId, label) => {
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/labels`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ label }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to add label");
    return data;
  },

  // Remove label from task
  removeLabel: async (taskId, label) => {
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/labels/${encodeURIComponent(label)}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to remove label");
    return data;
  },

  // Add attachment to task
  addAttachment: async (taskId, attachmentData) => {
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/attachments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(attachmentData),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to add attachment");
    return data;
  },

  // Remove attachment from task
  removeAttachment: async (taskId, attachmentUrl) => {
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/attachments`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ url: attachmentUrl }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to remove attachment");
    return data;
  },

  // Add link to task
  addLink: async (taskId, linkData) => {
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/links`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(linkData),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to add link");
    return data;
  },

  // Remove link from task
  removeLink: async (taskId, linkedTicketId) => {
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/links/${encodeURIComponent(linkedTicketId)}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to remove link");
    return data;
  },
};
