// Smart EIA — API Client (Vanilla JavaScript)
const API_BASE_URL = window.API_BASE_URL || 'http://localhost:8000/api';

async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  try {
    const res = await fetch(url, options);
    if (!res.ok) {
      let msg = `HTTP ${res.status}`;
      try {
        const err = await res.json();
        msg = err.detail || err.error || msg;
      } catch (_) {}
      throw new Error(msg);
    }
    return await res.json();
  } catch (err) {
    console.error(`API Error on ${url}:`, err);
    throw err;
  }
}

const api = {
  getDashboard: () => apiRequest('/dashboard/summary'),
  getProjects: () => apiRequest('/projects'),
  createProject: (data) => apiRequest('/projects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }),
  getStations: (projectId) => apiRequest(`/monitoring/stations${projectId ? `?project_id=${projectId}` : ''}`),
  getReadings: (projectId, category) => {
    const params = new URLSearchParams();
    if (projectId) params.set('project_id', projectId);
    if (category) params.set('category', category);
    return apiRequest(`/monitoring/readings?${params.toString()}`);
  },
  recordReading: (data) => apiRequest('/monitoring/readings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }),
  assessRisk: (projectId) => apiRequest('/risk/assess', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ project_id: projectId }),
  }),
  getRiskHistory: (projectId) => apiRequest(`/risk/history${projectId ? `?project_id=${projectId}` : ''}`),
  getMitigations: (projectId) => apiRequest(`/mitigation${projectId ? `?project_id=${projectId}` : ''}`),
  createMitigation: (data) => apiRequest('/mitigation', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }),
  updateMitigation: (id, data) => apiRequest(`/mitigation/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }),
  uploadMitigationEvidence: (id, formData) => apiRequest(`/mitigation/${id}/evidence`, {
    method: 'POST',
    body: formData,
  }),
  getInspections: (projectId) => apiRequest(`/inspections${projectId ? `?project_id=${projectId}` : ''}`),
  createInspection: (data) => apiRequest('/inspections', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }),
  getFeedback: (projectId) => apiRequest(`/feedback${projectId ? `?project_id=${projectId}` : ''}`),
  createFeedback: (data) => apiRequest('/feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }),
  getAlerts: (projectId) => apiRequest(`/alerts${projectId ? `?project_id=${projectId}` : ''}`),
  markAlertRead: (id) => apiRequest(`/alerts/${id}/read`, { method: 'PATCH' }),
  getCompliance: (projectId) => apiRequest(`/compliance${projectId ? `?project_id=${projectId}` : ''}`),
  getMapProjects: () => apiRequest('/maps/projects'),
  getMapStations: () => apiRequest('/maps/stations'),
};
