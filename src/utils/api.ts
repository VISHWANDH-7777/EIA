import {
  Project,
  MonitoringStation,
  EnvironmentalReading,
  RiskAssessment,
  MitigationAction,
  Inspection,
  PublicFeedback,
  Alert,
  ComplianceRecord,
  DashboardSummary,
} from '../types/index.ts';

const API_BASE = '/api';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  if (!res.ok) {
    let errorMsg = `HTTP Error ${res.status}`;
    try {
      const errData = await res.json();
      if (errData.error || errData.detail) {
        errorMsg = errData.error || (typeof errData.detail === 'string' ? errData.detail : JSON.stringify(errData.detail));
      }
    } catch {
      // ignore
    }
    throw new Error(errorMsg);
  }
  return res.json();
}

export const api = {
  // Dashboard
  getDashboardSummary: () => fetchJson<DashboardSummary>(`${API_BASE}/dashboard/summary`),

  // Projects
  getProjects: () => fetchJson<Project[]>(`${API_BASE}/projects`),
  getProject: (id: string) => fetchJson<Project>(`${API_BASE}/projects/${id}`),
  createProject: (data: Partial<Project>) =>
    fetchJson<Project>(`${API_BASE}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
  updateProject: (id: string, data: Partial<Project>) =>
    fetchJson<Project>(`${API_BASE}/projects/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),

  // Stations
  getStations: (projectId?: string) =>
    fetchJson<MonitoringStation[]>(`${API_BASE}/monitoring/stations${projectId ? `?projectId=${projectId}` : ''}`),
  createStation: (data: Partial<MonitoringStation>) =>
    fetchJson<MonitoringStation>(`${API_BASE}/monitoring/stations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),

  // Readings
  getReadings: (projectId?: string, category?: string) => {
    const params = new URLSearchParams();
    if (projectId) params.set('projectId', projectId);
    if (category) params.set('category', category);
    const qs = params.toString();
    return fetchJson<EnvironmentalReading[]>(`${API_BASE}/monitoring/readings${qs ? `?${qs}` : ''}`);
  },
  getLatestReadings: (projectId?: string) =>
    fetchJson<EnvironmentalReading[]>(`${API_BASE}/monitoring/latest${projectId ? `?projectId=${projectId}` : ''}`),
  getReadingHistory: (projectId?: string, parameter?: string) => {
    const params = new URLSearchParams();
    if (projectId) params.set('projectId', projectId);
    if (parameter) params.set('parameter', parameter);
    const qs = params.toString();
    return fetchJson<EnvironmentalReading[]>(`${API_BASE}/monitoring/history${qs ? `?${qs}` : ''}`);
  },
  recordReading: (data: Partial<EnvironmentalReading>) =>
    fetchJson<{ reading: EnvironmentalReading; alertsGenerated: Alert[] }>(`${API_BASE}/monitoring/readings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),

  // Risk Assessment
  assessRisk: (projectId: string) =>
    fetchJson<RiskAssessment>(`${API_BASE}/risk/assess`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId }),
    }),
  getRiskHistory: (projectId?: string) =>
    fetchJson<RiskAssessment[]>(`${API_BASE}/risk/history${projectId ? `?projectId=${projectId}` : ''}`),

  // Mitigation
  getMitigations: (projectId?: string) =>
    fetchJson<MitigationAction[]>(`${API_BASE}/mitigation${projectId ? `?projectId=${projectId}` : ''}`),
  createMitigation: (data: Partial<MitigationAction>) =>
    fetchJson<MitigationAction>(`${API_BASE}/mitigation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
  updateMitigation: (id: string, data: Partial<MitigationAction> & { actionLog?: string }) =>
    fetchJson<MitigationAction>(`${API_BASE}/mitigation/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
  uploadMitigationEvidence: (id: string, file: File) => {
    const formData = new FormData();
    formData.append('evidence', file);
    return fetchJson<MitigationAction>(`${API_BASE}/mitigation/${id}/evidence`, {
      method: 'POST',
      body: formData,
    });
  },

  // Inspections
  getInspections: (projectId?: string) =>
    fetchJson<Inspection[]>(`${API_BASE}/inspections${projectId ? `?projectId=${projectId}` : ''}`),
  createInspection: (data: Partial<Inspection>) =>
    fetchJson<Inspection>(`${API_BASE}/inspections`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
  updateInspection: (id: string, data: Partial<Inspection>) =>
    fetchJson<Inspection>(`${API_BASE}/inspections/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
  uploadInspectionPhoto: (id: string, file: File) => {
    const formData = new FormData();
    formData.append('photo', file);
    return fetchJson<Inspection>(`${API_BASE}/inspections/${id}/photo`, {
      method: 'POST',
      body: formData,
    });
  },

  // Feedback
  getFeedback: (projectId?: string) =>
    fetchJson<PublicFeedback[]>(`${API_BASE}/feedback${projectId ? `?projectId=${projectId}` : ''}`),
  createFeedback: (data: Partial<PublicFeedback>) =>
    fetchJson<PublicFeedback>(`${API_BASE}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
  updateFeedback: (id: string, data: Partial<PublicFeedback>) =>
    fetchJson<PublicFeedback>(`${API_BASE}/feedback/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),

  // Alerts & Compliance
  getAlerts: (projectId?: string) =>
    fetchJson<Alert[]>(`${API_BASE}/alerts${projectId ? `?projectId=${projectId}` : ''}`),
  markAlertRead: (id: string) =>
    fetchJson<Alert>(`${API_BASE}/alerts/${id}/read`, { method: 'PATCH' }),
  markAllAlertsRead: () =>
    fetchJson<{ success: boolean }>(`${API_BASE}/alerts/read-all`, { method: 'PATCH' }),

  getCompliance: (projectId?: string) =>
    fetchJson<ComplianceRecord[]>(`${API_BASE}/compliance${projectId ? `?projectId=${projectId}` : ''}`),
  updateCompliance: (id: string, data: Partial<ComplianceRecord>) =>
    fetchJson<ComplianceRecord>(`${API_BASE}/compliance/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),

  // Thresholds
  getThresholds: () => fetchJson<Record<string, any>>(`${API_BASE}/thresholds`),
  updateThreshold: (param: string, data: any) =>
    fetchJson<Record<string, any>>(`${API_BASE}/thresholds/${param}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
};
