const API_URL = "http://localhost:8000/api";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
};

// Create a new sprint
export const createSprint = async (projectId, sprintData) => {
  const response = await fetch(`${API_URL}/projects/${projectId}/sprints`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(sprintData),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Failed to create sprint");
  return data;
};

// Get all sprints for a project
export const getProjectSprints = async (projectId) => {
  const response = await fetch(`${API_URL}/projects/${projectId}/sprints`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Failed to fetch sprints");
  return data;
};

// Get sprint by ID
export const getSprintById = async (sprintId) => {
  const response = await fetch(`${API_URL}/sprints/${sprintId}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Failed to fetch sprint");
  return data;
};

// Update sprint
export const updateSprint = async (sprintId, sprintData) => {
  const response = await fetch(`${API_URL}/sprints/${sprintId}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(sprintData),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Failed to update sprint");
  return data;
};

// Start sprint
export const startSprint = async (sprintId) => {
  const response = await fetch(`${API_URL}/sprints/${sprintId}/start`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Failed to start sprint");
  return data;
};

// Complete sprint
export const completeSprint = async (sprintId) => {
  const response = await fetch(`${API_URL}/sprints/${sprintId}/complete`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Failed to complete sprint");
  return data;
};

// Delete sprint
export const deleteSprint = async (sprintId) => {
  const response = await fetch(`${API_URL}/sprints/${sprintId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Failed to delete sprint");
  return data;
};

// Add task to sprint
export const addTaskToSprint = async (sprintId, taskId) => {
  const response = await fetch(`${API_URL}/sprints/${sprintId}/tasks`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ task_id: taskId }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Failed to add task to sprint");
  return data;
};

// Remove task from sprint
export const removeTaskFromSprint = async (sprintId, taskId) => {
  const response = await fetch(`${API_URL}/sprints/${sprintId}/tasks/${taskId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Failed to remove task from sprint");
  return data;
};

// Get sprint tasks (tasks with sprint_id = sprintId)
export const getSprintTasks = async (projectId, sprintId) => {
  const response = await fetch(`${API_URL}/tasks/project/${projectId}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Failed to fetch tasks");
  
  // Filter tasks for this sprint
  const sprintTasks = data.tasks.filter(task => task.sprint_id === sprintId);
  return { ...data, tasks: sprintTasks };
};

// Get backlog tasks (tasks with sprint_id = null)
export const getBacklogTasks = async (projectId) => {
  const response = await fetch(`${API_URL}/tasks/project/${projectId}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Failed to fetch tasks");
  
  // Filter backlog tasks (no sprint_id or sprint_id = null)
  // AND exclude tasks that were completed before their due date or sprint completion
  const backlogTasks = data.tasks.filter(task => {
    // Must not be in a sprint
    if (task.sprint_id) return false;
    
    // If task is not completed, include it in backlog
    if (task.status !== "Done") return true;
    
    // If task is completed, check if it was completed late
    // Tasks completed after due date or sprint end date should appear in backlog
    
    // Check if completed after due date
    if (task.due_date && task.completed_at) {
      const dueDate = new Date(task.due_date);
      const completedDate = new Date(task.completed_at);
      
      // If completed after due date, show in backlog
      if (completedDate > dueDate) return true;
    }
    
    // If no due date and task is completed, don't show in backlog
    // (completed on time or no deadline to check against)
    return false;
  });
  
  return { ...data, tasks: backlogTasks };
};
