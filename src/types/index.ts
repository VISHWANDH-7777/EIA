export interface Project {
  id: string;
  name: string;
  type: string;
  location: string;
  latitude: number;
  longitude: number;
  description: string;
  status: 'Planning' | 'Active' | 'Under Review' | 'Completed';
  createdAt: string;
  updatedAt: string;
}

export interface MonitoringStation {
  id: string;
  projectId: string;
  projectName?: string;
  name: string;
  latitude: number;
  longitude: number;
  parameters: string[];
  stationType: 'Fixed Continuous' | 'Mobile Boundary' | 'Manual Grab';
  status: 'Active' | 'Calibrating' | 'Offline';
  lastActive: string;
}

export interface EnvironmentalReading {
  id: string;
  projectId: string;
  stationId?: string;
  category: 'air' | 'water' | 'noise';
  parameter: string;
  value: number;
  unit: string;
  timestamp: string;
  source: 'manual' | 'sensor' | 'simulated';
  isValid: boolean;
  notes?: string;
}

export interface BreachDetail {
  parameter: string;
  category: 'air' | 'water' | 'noise';
  readingValue: number;
  unit: string;
  thresholdValue: string;
  ruleId: string;
  ruleTitle: string;
  standardReference: string;
  isCritical: boolean;
  explanation: string;
  recommendedMitigation: string;
}

export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Insufficient Data';

export interface RiskAssessment {
  id: string;
  projectId: string;
  riskLevel: RiskLevel;
  totalEvaluated: number;
  breachCount: number;
  criticalBreachCount: number;
  breaches: BreachDetail[];
  methodology: string;
  ruleSetVersion: string;
  timestamp: string;
  summary: string;
}

export interface MitigationAction {
  id: string;
  projectId: string;
  title: string;
  description: string;
  responsiblePerson: string;
  dueDate: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  evidenceFiles: { name: string; url: string; uploadedAt: string }[];
  history: { action: string; timestamp: string; user: string }[];
  createdAt: string;
  updatedAt: string;
}

export interface Inspection {
  id: string;
  projectId: string;
  inspectorName: string;
  inspectionDate: string;
  observations: string;
  complianceVerdict: 'Compliant' | 'Non-Compliant' | 'Pending Review';
  status: 'Draft' | 'Submitted' | 'Reviewed';
  photos: { name: string; url: string }[];
  reviewNotes?: string;
  createdAt: string;
}

export interface PublicFeedback {
  id: string;
  projectId: string;
  stakeholderName: string;
  email: string;
  category: 'Dust & Air' | 'Noise Impact' | 'Water & Drainage' | 'Traffic & Safety' | 'General Query';
  comment: string;
  status: 'New' | 'Under Review' | 'Addressed';
  responseNote?: string;
  createdAt: string;
}

export interface Alert {
  id: string;
  projectId: string;
  type: 'Threshold Breach' | 'Overdue Mitigation' | 'Compliance Issue';
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  parameter?: string;
  message: string;
  ruleId?: string;
  isRead: boolean;
  timestamp: string;
}

export interface ComplianceRecord {
  id: string;
  projectId: string;
  standardTitle: string;
  category: 'Air Standards' | 'Water Protection' | 'Noise Ordinances' | 'EIA Approval Conditions';
  status: 'Compliant' | 'Non-Compliant' | 'Pending Review' | 'Insufficient Data';
  lastEvaluated: string;
  notes: string;
}

export interface DashboardSummary {
  totalProjects: number;
  activeProjects: number;
  totalStations: number;
  totalReadings: number;
  unreadAlerts: number;
  pendingMitigations: number;
  overdueMitigations: number;
  complianceCounts: Record<string, number>;
  latestReadings: EnvironmentalReading[];
  recentAlerts: Alert[];
  recentInspections: Inspection[];
  recentFeedback: PublicFeedback[];
}
