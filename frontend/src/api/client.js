const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export const api = {
  health: () => request("/api/health"),
  parseChat: (message) => request("/api/chat/parse", { method: "POST", body: JSON.stringify({ message }) }),
  applyPlan: (planId) => request(`/api/schema-plans/${planId}/apply`, { method: "POST" }),
  tools: () => request("/api/tools"),
  deleteTool: (toolId) => request(`/api/tools/${toolId}`, { method: "DELETE" }),
  renameField: (toolId, fieldId, displayName) => request(`/api/tools/${toolId}/fields/${fieldId}`, {
    method: "PATCH",
    body: JSON.stringify({ display_name: displayName }),
  }),
  deleteField: (toolId, fieldId) => request(`/api/tools/${toolId}/fields/${fieldId}`, { method: "DELETE" }),
  addField: (toolId, displayName) => request(`/api/tools/${toolId}/fields`, {
    method: "POST",
    body: JSON.stringify({ display_name: displayName }),
  }),
  addRecord: (toolId) => request(`/api/tools/${toolId}/records`, { method: "POST" }),
};
