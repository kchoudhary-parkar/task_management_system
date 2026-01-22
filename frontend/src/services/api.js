// // const API_BASE_URL = "";
// const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

// // Get token from localStorage
// const getToken = () => localStorage.getItem("token");

// // Generate or get unique per-tab session key
// const getTabSessionKey = () => {
//   let key = sessionStorage.getItem("tab_session_key");
  
//   if (!key) {
//     // Generate a unique key (UUID-like)
//     key = 'tab_' + Math.random().toString(36).substr(2, 12) + '_' + Date.now().toString(36);
//     sessionStorage.setItem("tab_session_key", key);
//   }
  
//   return key;
// };

// // Helper to get auth headers (always includes tab key)
// export const getAuthHeaders = () => {
//   const headers = {
//     "Content-Type": "application/json",
//   };
  
//   const token = getToken();
//   if (token) {
//     headers["Authorization"] = `Bearer ${token}`;
//   }
  
//   // Always include tab session key
//   headers["X-Tab-Session-Key"] = getTabSessionKey();
  
//   return headers;
// };

// // Auth API calls
// export const authAPI = {
//   register: async (name, email, password) => {
//     const response = await fetch(`${API_BASE_URL}/auth/register`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ name, email, password }),
//     });
//     const data = await response.json();
//     if (!response.ok) throw new Error(data.error || "Registration failed");
//     return data;
//   },

//   login: async (email, password) => {
//     const response = await fetch(`${API_BASE_URL}/auth/login`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ email, password }),
//     });
//     const data = await response.json();
//     if (!response.ok) throw new Error(data.error || "Login failed");
//     return data;
//   },

//   getProfile: async () => {
//     const response = await fetch(`${API_BASE_URL}/auth/profile`, {
//       headers: getAuthHeaders(),
//     });
//     const data = await response.json();
//     if (!response.ok) throw new Error(data.error || "Failed to get profile");
//     return data;
//   },
// };

// // Dashboard API calls
// export const dashboardAPI = {
//   getAnalytics: async () => {
//     const response = await fetch(`${API_BASE_URL}/dashboard/analytics`, {
//       headers: getAuthHeaders(),
//     });
//     const data = await response.json();
//     if (!response.ok) throw new Error(data.error || "Failed to fetch analytics");
//     return data;
//   },

//   getReport: async () => {
//     const response = await fetch(`${API_BASE_URL}/dashboard/report`, {
//       headers: getAuthHeaders(),
//     });
//     const data = await response.json();
//     if (!response.ok) throw new Error(data.error || "Failed to fetch report");
//     return data;
//   },

//   getSystemAnalytics: async () => {
//     const response = await fetch(`${API_BASE_URL}/dashboard/system`, {
//       headers: getAuthHeaders(),
//     });
//     const data = await response.json();
//     if (!response.ok) throw new Error(data.error || "Failed to fetch system analytics");
//     return data;
//   },
// };

// // User API calls
// export const userAPI = {
//   // Search users by email
//   searchByEmail: async (emailQuery) => {
//     const response = await fetch(
//       `${API_BASE_URL}/users/search?email=${encodeURIComponent(emailQuery)}`,
//       {
//         headers: getAuthHeaders(),
//       }
//     );
//     const data = await response.json();
//     if (!response.ok) throw new Error(data.error || "Failed to search users");
//     return data;
//   },

//   // Get all users (admin+)
//   getAllUsers: async () => {
//     const response = await fetch(`${API_BASE_URL}/users`, {
//       headers: getAuthHeaders(),
//     });
//     const data = await response.json();
//     if (!response.ok) throw new Error(data.error || "Failed to fetch users");
//     return data;
//   },

//   // Update user role (super-admin only)
//   updateUserRole: async (userId, role) => {
//     const response = await fetch(`${API_BASE_URL}/users/role`, {
//       method: "PUT",
//       headers: getAuthHeaders(),
//       body: JSON.stringify({ user_id: userId, role }),
//     });
//     const data = await response.json();
//     if (!response.ok) throw new Error(data.error || "Failed to update user role");
//     return data;
//   },
// };

// // Project API calls
// export const projectAPI = {
//   // Get all user projects
//   getAll: async () => {
//     const response = await fetch(`${API_BASE_URL}/projects`, {
//       headers: getAuthHeaders(),
//     });
//     const data = await response.json();
//     if (!response.ok) throw new Error(data.error || "Failed to fetch projects");
//     return data;
//   },

//   // Get project by ID
//   getById: async (projectId) => {
//     const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
//       headers: getAuthHeaders(),
//     });
//     const data = await response.json();
//     if (!response.ok) throw new Error(data.error || "Failed to fetch project");
//     return data;
//   },

//   // Create new project
//   create: async (projectData) => {
//     const response = await fetch(`${API_BASE_URL}/projects`, {
//       method: "POST",
//       headers: getAuthHeaders(),
//       body: JSON.stringify(projectData),
//     });
//     const data = await response.json();
//     if (!response.ok) throw new Error(data.error || "Failed to create project");
//     return data;
//   },

//   // Update project
//   update: async (projectId, projectData) => {
//     const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
//       method: "PUT",
//       headers: getAuthHeaders(),
//       body: JSON.stringify(projectData),
//     });
//     const data = await response.json();
//     if (!response.ok) throw new Error(data.error || "Failed to update project");
//     return data;
//   },

//   // Delete project
//   delete: async (projectId) => {
//     const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
//       method: "DELETE",
//       headers: getAuthHeaders(),
//     });
//     const data = await response.json();
//     if (!response.ok) throw new Error(data.error || "Failed to delete project");
//     return data;
//   },
// };

// // Member API calls
// export const memberAPI = {
//   // Add member to project
//   addMember: async (projectId, email) => {
//     const response = await fetch(`${API_BASE_URL}/projects/${projectId}/members`, {
//       method: "POST",
//       headers: getAuthHeaders(),
//       body: JSON.stringify({ email }),
//     });
//     const data = await response.json();
//     if (!response.ok) throw new Error(data.error || "Failed to add member");
//     return data;
//   },

//   // Get project members
//   getMembers: async (projectId) => {
//     const response = await fetch(`${API_BASE_URL}/projects/${projectId}/members`, {
//       headers: getAuthHeaders(),
//     });
//     const data = await response.json();
//     if (!response.ok) throw new Error(data.error || "Failed to fetch members");
//     return data;
//   },

//   // Remove member from project
//   removeMember: async (projectId, userId) => {
//     const response = await fetch(`${API_BASE_URL}/projects/${projectId}/members/${userId}`, {
//       method: "DELETE",
//       headers: getAuthHeaders(),
//     });
//     const data = await response.json();
//     if (!response.ok) throw new Error(data.error || "Failed to remove member");
//     return data;
//   },
// };

// // Task API calls
// export const taskAPI = {
//   // Create task
//   create: async (projectId, taskData) => {
//     const response = await fetch(`${API_BASE_URL}/tasks`, {
//       method: "POST",
//       headers: getAuthHeaders(),
//       body: JSON.stringify({
//         ...taskData,
//         project_id: projectId,
//       }),
//     });
//     const data = await response.json();
//     if (!response.ok) throw new Error(data.error || "Failed to create task");
//     return data;
//   },

//   // Get all tasks for a project
//   getByProject: async (projectId) => {
//     const response = await fetch(`${API_BASE_URL}/tasks/project/${projectId}`, {
//       headers: getAuthHeaders(),
//     });
//     const data = await response.json();
//     if (!response.ok) throw new Error(data.error || "Failed to fetch tasks");
//     return data;
//   },

//   // Get task by ID
//   getById: async (taskId) => {
//     const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
//       headers: getAuthHeaders(),
//     });
//     const data = await response.json();
//     if (!response.ok) throw new Error(data.error || "Failed to fetch task");
//     return data;
//   },

//   // Get my assigned tasks
//   getMyTasks: async () => {
//     const response = await fetch(`${API_BASE_URL}/tasks/my`, {
//       headers: getAuthHeaders(),
//     });
//     const data = await response.json();
//     if (!response.ok) throw new Error(data.error || "Failed to fetch tasks");
//     return data;
//   },

//   // Update task
//   update: async (taskId, taskData) => {
//     const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
//       method: "PUT",
//       headers: getAuthHeaders(),
//       body: JSON.stringify(taskData),
//     });
//     const data = await response.json();
//     if (!response.ok) throw new Error(data.error || "Failed to update task");
//     return data;
//   },

//   // Delete task
//   delete: async (taskId) => {
//     const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
//       method: "DELETE",
//       headers: getAuthHeaders(),
//     });
//     const data = await response.json();
//     if (!response.ok) throw new Error(data.error || "Failed to delete task");
//     return data;
//   },

//   // Add label to task
//   addLabel: async (taskId, label) => {
//     const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/labels`, {
//       method: "POST",
//       headers: getAuthHeaders(),
//       body: JSON.stringify({ label }),
//     });
//     const data = await response.json();
//     if (!response.ok) throw new Error(data.error || "Failed to add label");
//     return data;
//   },

//   // Remove label from task
//   removeLabel: async (taskId, label) => {
//     const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/labels/${encodeURIComponent(label)}`, {
//       method: "DELETE",
//       headers: getAuthHeaders(),
//     });
//     const data = await response.json();
//     if (!response.ok) throw new Error(data.error || "Failed to remove label");
//     return data;
//   },

//   // Add attachment to task
//   addAttachment: async (taskId, attachmentData) => {
//     const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/attachments`, {
//       method: "POST",
//       headers: getAuthHeaders(),
//       body: JSON.stringify(attachmentData),
//     });
//     const data = await response.json();
//     if (!response.ok) throw new Error(data.error || "Failed to add attachment");
//     return data;
//   },

//   // Remove attachment from task
//   removeAttachment: async (taskId, attachmentUrl) => {
//     const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/attachments`, {
//       method: "DELETE",
//       headers: getAuthHeaders(),
//       body: JSON.stringify({ url: attachmentUrl }),
//     });
//     const data = await response.json();
//     if (!response.ok) throw new Error(data.error || "Failed to remove attachment");
//     return data;
//   },

//   // Add link to task
//   addLink: async (taskId, linkData) => {
//     const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/links`, {
//       method: "POST",
//       headers: getAuthHeaders(),
//       body: JSON.stringify(linkData),
//     });
//     const data = await response.json();
//     if (!response.ok) throw new Error(data.error || "Failed to add link");
//     return data;
//   },

//   // Remove link from task
//   removeLink: async (taskId, linkedTicketId, linkType) => {
//     const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/links`, {
//       method: "DELETE",
//       headers: getAuthHeaders(),
//       body: JSON.stringify({
//         linked_task_id: linkedTicketId,
//         type: linkType
//       })
//     });
//     const data = await response.json();
//     if (!response.ok) throw new Error(data.error || "Failed to remove link");
//     return data;
//   },

//   // Approve and close a done task (admin only)
//   approveTask: async (taskId) => {
//     const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/approve`, {
//       method: "POST",
//       headers: getAuthHeaders(),
//     });
//     const data = await response.json();
//     if (!response.ok) throw new Error(data.error || "Failed to approve task");
//     return data;
//   },

//   // Get done tasks awaiting approval (admin only)
//   getDoneTasksForApproval: async (projectId) => {
//     const response = await fetch(`${API_BASE_URL}/projects/${projectId}/tasks/done`, {
//       headers: getAuthHeaders(),
//     });
//     const data = await response.json();
//     if (!response.ok) throw new Error(data.error || "Failed to fetch done tasks");
//     return data;
//   },

//   // Get all pending approval tasks (dashboard)
//   getAllPendingApprovalTasks: async () => {
//     const response = await fetch(`${API_BASE_URL}/tasks/pending-approval`, {
//       headers: getAuthHeaders(),
//     });
//     const data = await response.json();
//     if (!response.ok) throw new Error(data.error || "Failed to fetch pending approval tasks");
//     return data;
//   },

//   // Get all closed tasks (dashboard)
//   getAllClosedTasks: async () => {
//     const response = await fetch(`${API_BASE_URL}/tasks/closed`, {
//       headers: getAuthHeaders(),
//     });
//     const data = await response.json();
//     if (!response.ok) throw new Error(data.error || "Failed to fetch closed tasks");
//     return data;
//   }
// };
// Fixed API base URL - remove /api suffix
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

// Get token from localStorage
const getToken = () => localStorage.getItem("token");

// Generate or get unique per-tab session key
const getTabSessionKey = () => {
  let key = sessionStorage.getItem("tab_session_key");
  
  if (!key) {
    // Generate a unique key (UUID-like)
    key = 'tab_' + Math.random().toString(36).substr(2, 12) + '_' + Date.now().toString(36);
    sessionStorage.setItem("tab_session_key", key);
  }
  
  return key;
};

// Helper to get auth headers (always includes tab key)
export const getAuthHeaders = () => {
  const headers = {
    "Content-Type": "application/json",
  };
  
  const token = getToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  
  // Always include tab session key
  headers["X-Tab-Session-Key"] = getTabSessionKey();
  
  return headers;
};

// Auth API calls
export const authAPI = {
  register: async (name, email, password) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Registration failed");
    return data;
  },

  login: async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Login failed");
    return data;
  },

  clerkSync: async (clerkToken, email, name, clerkUserId) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/clerk-sync`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clerk_token: clerkToken,
        email,
        name,
        clerk_user_id: clerkUserId,
      }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Clerk sync failed");
    return data;
  },

  getProfile: async () => {
    const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
      headers: getAuthHeaders(),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to get profile");
    return data;
  },
};

// Dashboard API calls
export const dashboardAPI = {
  getAnalytics: async () => {
    const response = await fetch(`${API_BASE_URL}/api/dashboard/analytics`, {
      headers: getAuthHeaders(),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to fetch analytics");
    return data;
  },

  getReport: async () => {
    const response = await fetch(`${API_BASE_URL}/api/dashboard/report`, {
      headers: getAuthHeaders(),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to fetch report");
    return data;
  },

  getSystemAnalytics: async () => {
    const response = await fetch(`${API_BASE_URL}/api/dashboard/system`, {
      headers: getAuthHeaders(),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to fetch system analytics");
    return data;
  },
};

// User API calls
export const userAPI = {
  searchByEmail: async (emailQuery) => {
    const response = await fetch(
      `${API_BASE_URL}/api/users/search?email=${encodeURIComponent(emailQuery)}`,
      {
        headers: getAuthHeaders(),
      }
    );
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to search users");
    return data;
  },

  getAllUsers: async () => {
    const response = await fetch(`${API_BASE_URL}/api/users`, {
      headers: getAuthHeaders(),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to fetch users");
    return data;
  },

  updateUserRole: async (userId, role) => {
    const response = await fetch(`${API_BASE_URL}/api/users/role`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({ user_id: userId, role }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to update user role");
    return data;
  },
};

// Project API calls
export const projectAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/api/projects`, {
      headers: getAuthHeaders(),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to fetch projects");
    return data;
  },

  getById: async (projectId) => {
    const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}`, {
      headers: getAuthHeaders(),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to fetch project");
    return data;
  },

  create: async (projectData) => {
    const response = await fetch(`${API_BASE_URL}/api/projects`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(projectData),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to create project");
    return data;
  },

  update: async (projectId, projectData) => {
    const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(projectData),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to update project");
    return data;
  },

  delete: async (projectId) => {
    const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to delete project");
    return data;
  },
};

// Member API calls
export const memberAPI = {
  addMember: async (projectId, email) => {
    const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}/members`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ email }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to add member");
    return data;
  },

  getMembers: async (projectId) => {
    const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}/members`, {
      headers: getAuthHeaders(),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to fetch members");
    return data;
  },

  removeMember: async (projectId, userId) => {
    const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}/members/${userId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to remove member");
    return data;
  },
};

// Task API calls
export const taskAPI = {
  create: async (projectId, taskData) => {
    const response = await fetch(`${API_BASE_URL}/api/tasks`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        ...taskData,
        project_id: projectId,
      }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to create task");
    return data;
  },

  getByProject: async (projectId) => {
    const response = await fetch(`${API_BASE_URL}/api/tasks/project/${projectId}`, {
      headers: getAuthHeaders(),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to fetch tasks");
    return data;
  },

  getById: async (taskId) => {
    const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}`, {
      headers: getAuthHeaders(),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to fetch task");
    return data;
  },

  getMyTasks: async () => {
    const response = await fetch(`${API_BASE_URL}/api/tasks/my`, {
      headers: getAuthHeaders(),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to fetch tasks");
    return data;
  },

  update: async (taskId, taskData) => {
    const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(taskData),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to update task");
    return data;
  },

  delete: async (taskId) => {
    const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to delete task");
    return data;
  },

  addLabel: async (taskId, label) => {
    const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}/labels`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ label }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to add label");
    return data;
  },

  removeLabel: async (taskId, label) => {
    const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}/labels/${encodeURIComponent(label)}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to remove label");
    return data;
  },

  addAttachment: async (taskId, attachmentData) => {
    const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}/attachments`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(attachmentData),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to add attachment");
    return data;
  },

  removeAttachment: async (taskId, attachmentUrl) => {
    const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}/attachments`, {
      method: "DELETE",
      headers: getAuthHeaders(),
      body: JSON.stringify({ url: attachmentUrl }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to remove attachment");
    return data;
  },

  addLink: async (taskId, linkData) => {
    const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}/links`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(linkData),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to add link");
    return data;
  },

  removeLink: async (taskId, linkedTicketId, linkType) => {
    const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}/links`, {
      method: "DELETE",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        linked_task_id: linkedTicketId,
        type: linkType
      })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to remove link");
    return data;
  },

  approveTask: async (taskId) => {
    const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}/approve`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to approve task");
    return data;
  },

  getDoneTasksForApproval: async (projectId) => {
    const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}/tasks/done`, {
      headers: getAuthHeaders(),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to fetch done tasks");
    return data;
  },

  getAllPendingApprovalTasks: async () => {
    const response = await fetch(`${API_BASE_URL}/api/tasks/pending-approval`, {
      headers: getAuthHeaders(),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to fetch pending approval tasks");
    return data;
  },

  getAllClosedTasks: async () => {
    const response = await fetch(`${API_BASE_URL}/api/tasks/closed`, {
      headers: getAuthHeaders(),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to fetch closed tasks");
    return data;
  },
  
  addComment: async (taskId, comment) => {
    if (!comment?.trim()) {
      throw new Error("Comment cannot be empty");
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}/comments`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ comment: comment.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.message || `Server error: ${response.status}`);
      }

      return await response.json();
    } catch (err) {
      console.error("addComment failed:", err);
      throw err;
    }
  },
};

// Profile API
export const profileAPI = {
  getProfile: async () => {
    const response = await fetch(`${API_BASE_URL}/api/profile`, {
      headers: getAuthHeaders(),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to fetch profile");
    return data;
  },

  updatePersonal: async (personalData) => {
    const response = await fetch(`${API_BASE_URL}/api/profile/personal`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(personalData),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to update personal info");
    return data;
  },

  updateEducation: async (educationData) => {
    const response = await fetch(`${API_BASE_URL}/api/profile/education`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({ education: educationData }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to update education");
    return data;
  },

  updateCertificates: async (certificatesData) => {
    const response = await fetch(`${API_BASE_URL}/api/profile/certificates`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({ certificates: certificatesData }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to update certificates");
    return data;
  },

  updateOrganization: async (organizationData) => {
    const response = await fetch(`${API_BASE_URL}/api/profile/organization`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(organizationData),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to update organization");
    return data;
  },
};