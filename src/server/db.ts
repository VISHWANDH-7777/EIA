import fs from 'fs';
import path from 'path';
import { DEFAULT_THRESHOLDS, evaluateEnvironmentalRisk, RiskAssessmentResult } from '../utils/riskRules.ts';

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
  name: string;
  latitude: number;
  longitude: number;
  parameters: string[]; // ['PM2.5', 'PM10', 'Noise_Day', etc.]
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

export interface DatabaseState {
  projects: Project[];
  stations: MonitoringStation[];
  readings: EnvironmentalReading[];
  riskAssessments: (RiskAssessmentResult & { id: string; projectId: string })[];
  mitigationActions: MitigationAction[];
  inspections: Inspection[];
  feedback: PublicFeedback[];
  alerts: Alert[];
  compliance: ComplianceRecord[];
  thresholds: typeof DEFAULT_THRESHOLDS;
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'eia_db.json');

const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj-001',
    name: 'Metro Rail Line 4 Extension Corridor',
    type: 'Transportation Infrastructure',
    location: 'Metro District Sector 7',
    latitude: 37.7749,
    longitude: -122.4194,
    description: '14.2 km dual-track underground & elevated transit corridor connecting Sector 7 with Regional Hub.',
    status: 'Active',
    createdAt: '2026-01-15T08:00:00.000Z',
    updatedAt: '2026-10-25T14:20:00.000Z',
  },
  {
    id: 'proj-002',
    name: 'Harbor Estuary Ecological Dredging & Hydro-Clean',
    type: 'Marine & Water Resources',
    location: 'Estuary Bay Point',
    latitude: 37.8044,
    longitude: -122.2712,
    description: 'Environmental channel deepening and sediment remediation program for commercial harbor navigation.',
    status: 'Active',
    createdAt: '2026-03-10T09:30:00.000Z',
    updatedAt: '2026-10-26T07:15:00.000Z',
  },
  {
    id: 'proj-003',
    name: 'Highland Wind Energy Park & Transmission Grid',
    type: 'Renewable Energy',
    location: 'Northern Ridge Crest',
    latitude: 37.6879,
    longitude: -121.9167,
    description: '45-turbine utility-scale wind installation with 115kV substation intertie and ecological buffer zones.',
    status: 'Planning',
    createdAt: '2026-06-01T11:00:00.000Z',
    updatedAt: '2026-10-20T16:00:00.000Z',
  },
];

const INITIAL_STATIONS: MonitoringStation[] = [
  {
    id: 'st-01',
    projectId: 'proj-001',
    name: 'North Tunnel Portal Air & Acoustic Station',
    latitude: 37.7758,
    longitude: -122.4182,
    parameters: ['PM2.5', 'PM10', 'NO2', 'Noise_Day', 'Noise_Night'],
    stationType: 'Fixed Continuous',
    status: 'Active',
    lastActive: '2026-10-26T09:00:00.000Z',
  },
  {
    id: 'st-02',
    projectId: 'proj-001',
    name: 'Sector 7 Residential Perimeter Buffer',
    latitude: 37.7735,
    longitude: -122.4215,
    parameters: ['PM2.5', 'Noise_Day', 'Noise_Night'],
    stationType: 'Fixed Continuous',
    status: 'Active',
    lastActive: '2026-10-26T08:55:00.000Z',
  },
  {
    id: 'st-03',
    projectId: 'proj-002',
    name: 'Estuary Marine Spoil Basin Monitor',
    latitude: 37.8055,
    longitude: -122.2695,
    parameters: ['pH', 'Turbidity', 'DO'],
    stationType: 'Fixed Continuous',
    status: 'Active',
    lastActive: '2026-10-26T09:10:00.000Z',
  },
  {
    id: 'st-04',
    projectId: 'proj-003',
    name: 'Ridge Crest Acoustic Boundary Tower 04',
    latitude: 37.6892,
    longitude: -121.9150,
    parameters: ['Noise_Day', 'Noise_Night', 'PM10'],
    stationType: 'Fixed Continuous',
    status: 'Active',
    lastActive: '2026-10-26T08:30:00.000Z',
  },
];

const INITIAL_READINGS: EnvironmentalReading[] = [
  {
    id: 'rd-01',
    projectId: 'proj-001',
    stationId: 'st-01',
    category: 'air',
    parameter: 'PM2.5',
    value: 46.2, // breach of 35.0
    unit: 'µg/m³',
    timestamp: '2026-10-26T08:30:00.000Z',
    source: 'sensor',
    isValid: true,
    notes: 'Heavy earth movement around shaft 3B',
  },
  {
    id: 'rd-02',
    projectId: 'proj-001',
    stationId: 'st-01',
    category: 'air',
    parameter: 'PM10',
    value: 122.0,
    unit: 'µg/m³',
    timestamp: '2026-10-26T08:30:00.000Z',
    source: 'sensor',
    isValid: true,
  },
  {
    id: 'rd-03',
    projectId: 'proj-001',
    stationId: 'st-01',
    category: 'air',
    parameter: 'NO2',
    value: 68.4,
    unit: 'µg/m³',
    timestamp: '2026-10-26T08:30:00.000Z',
    source: 'sensor',
    isValid: true,
  },
  {
    id: 'rd-04',
    projectId: 'proj-001',
    stationId: 'st-01',
    category: 'noise',
    parameter: 'Noise_Day',
    value: 69.8, // breach of 65.0
    unit: 'dBA',
    timestamp: '2026-10-26T08:45:00.000Z',
    source: 'sensor',
    isValid: true,
    notes: 'Hydraulic breaker operating at south vent',
  },
  {
    id: 'rd-05',
    projectId: 'proj-001',
    stationId: 'st-02',
    category: 'air',
    parameter: 'PM2.5',
    value: 24.1,
    unit: 'µg/m³',
    timestamp: '2026-10-26T08:50:00.000Z',
    source: 'sensor',
    isValid: true,
  },
  {
    id: 'rd-06',
    projectId: 'proj-001',
    stationId: 'st-02',
    category: 'noise',
    parameter: 'Noise_Day',
    value: 61.3,
    unit: 'dBA',
    timestamp: '2026-10-26T08:50:00.000Z',
    source: 'sensor',
    isValid: true,
  },
  {
    id: 'rd-07',
    projectId: 'proj-002',
    stationId: 'st-03',
    category: 'water',
    parameter: 'pH',
    value: 7.6,
    unit: 'pH',
    timestamp: '2026-10-26T09:00:00.000Z',
    source: 'manual',
    isValid: true,
    notes: 'Certified laboratory grab sample test',
  },
  {
    id: 'rd-08',
    projectId: 'proj-002',
    stationId: 'st-03',
    category: 'water',
    parameter: 'Turbidity',
    value: 8.4, // breach of 5.0
    unit: 'NTU',
    timestamp: '2026-10-26T09:00:00.000Z',
    source: 'sensor',
    isValid: true,
    notes: 'Dredge cutter suction head wake',
  },
  {
    id: 'rd-09',
    projectId: 'proj-002',
    stationId: 'st-03',
    category: 'water',
    parameter: 'DO',
    value: 6.2,
    unit: 'mg/L',
    timestamp: '2026-10-26T09:00:00.000Z',
    source: 'sensor',
    isValid: true,
  },
  {
    id: 'rd-10',
    projectId: 'proj-003',
    stationId: 'st-04',
    category: 'noise',
    parameter: 'Noise_Day',
    value: 48.6,
    unit: 'dBA',
    timestamp: '2026-10-26T08:15:00.000Z',
    source: 'sensor',
    isValid: true,
  },
];

const INITIAL_MITIGATIONS: MitigationAction[] = [
  {
    id: 'mit-001',
    projectId: 'proj-001',
    title: 'Deploy Water Mist Dust Cannons at Shaft 3B',
    description: 'Install 2 high-pressure oscillating mist cannons around heavy truck loading chute to prevent fugitive PM2.5 dispersion.',
    responsiblePerson: 'Marcus Vance (Site HSE Lead)',
    dueDate: '2026-10-27',
    status: 'In Progress',
    evidenceFiles: [],
    history: [
      { action: 'Action logged following AIR-R01 breach alert', timestamp: '2026-10-26T08:35:00.000Z', user: 'System Alert Engine' },
      { action: 'Assigned to Site HSE Lead Marcus Vance', timestamp: '2026-10-26T08:40:00.000Z', user: 'EIA Officer Sarah Lin' }
    ],
    createdAt: '2026-10-26T08:35:00.000Z',
    updatedAt: '2026-10-26T08:40:00.000Z',
  },
  {
    id: 'mit-002',
    projectId: 'proj-001',
    title: 'Erect Sound Absorption Barrier at South Vent',
    description: 'Construct 4-meter acoustic vinyl curtain to shield adjacent residential receptors from continuous hydraulic impact noise.',
    responsiblePerson: 'David Chen (Contractor Acoustic Sup.)',
    dueDate: '2026-10-25', // Overdue
    status: 'Pending',
    evidenceFiles: [],
    history: [
      { action: 'Created task based on NOI-R01 exceedance', timestamp: '2026-10-24T10:00:00.000Z', user: 'EIA Officer Sarah Lin' }
    ],
    createdAt: '2026-10-24T10:00:00.000Z',
    updatedAt: '2026-10-24T10:00:00.000Z',
  },
  {
    id: 'mit-003',
    projectId: 'proj-002',
    title: 'Inspect and Repair Silt Curtain Geotextile',
    description: 'Deploy dive inspection team to realign floating sediment containment curtain south of dredge barge anchor line.',
    responsiblePerson: 'Elena Rostova (Marine Environmental Mgr)',
    dueDate: '2026-10-28',
    status: 'In Progress',
    evidenceFiles: [],
    history: [
      { action: 'Initiated after turbidity rise to 8.4 NTU', timestamp: '2026-10-26T09:05:00.000Z', user: 'System Alert Engine' }
    ],
    createdAt: '2026-10-26T09:05:00.000Z',
    updatedAt: '2026-10-26T09:05:00.000Z',
  },
];

const INITIAL_INSPECTIONS: Inspection[] = [
  {
    id: 'insp-001',
    projectId: 'proj-001',
    inspectorName: 'Dr. Arthur Pendelton (Govt EIA Inspector)',
    inspectionDate: '2026-10-25',
    observations: 'Inspected perimeter wheel washing trough at gate 4. Water recycling tank functioning. Dust covers on aggregate piles were properly weighted.',
    complianceVerdict: 'Compliant',
    status: 'Reviewed',
    photos: [],
    reviewNotes: 'Standard bi-weekly statutory verification completed without citations.',
    createdAt: '2026-10-25T15:30:00.000Z',
  },
  {
    id: 'insp-002',
    projectId: 'proj-002',
    inspectorName: 'Maya Patel (Regional Water Board)',
    inspectionDate: '2026-10-26',
    observations: 'Sediment plume visible approximately 40m downstream of cutter head due to partial geotextile tear. Requested immediate dive team deployment.',
    complianceVerdict: 'Non-Compliant',
    status: 'Submitted',
    photos: [],
    createdAt: '2026-10-26T09:15:00.000Z',
  },
];

const INITIAL_FEEDBACK: PublicFeedback[] = [
  {
    id: 'fb-001',
    projectId: 'proj-001',
    stakeholderName: 'Community Council Rep. Laura Gomez',
    email: 'laura.gomez@sector7residents.org',
    category: 'Noise Impact',
    comment: 'Heavy vibration and drilling sound was audible past 21:30 yesterday evening near the Sector 7 elementary school boundary.',
    status: 'Under Review',
    responseNote: 'Investigation opened regarding evening shift noise compliance; contractor acoustic log requested.',
    createdAt: '2026-10-25T22:10:00.000Z',
  },
  {
    id: 'fb-002',
    projectId: 'proj-002',
    stakeholderName: 'Harbor Marina Berth Holders Assoc.',
    email: 'dockmaster@baypointmarina.com',
    category: 'Water & Drainage',
    comment: 'Noticed slight silt buildup near slipway #4 following dredging vessel maneuvering this morning.',
    status: 'New',
    createdAt: '2026-10-26T08:45:00.000Z',
  },
];

const INITIAL_ALERTS: Alert[] = [
  {
    id: 'alt-001',
    projectId: 'proj-001',
    type: 'Threshold Breach',
    severity: 'High',
    parameter: 'PM2.5',
    message: 'PM2.5 reading of 46.2 µg/m³ exceeded 24-hr threshold (35.0 µg/m³) at North Tunnel Portal Station.',
    ruleId: 'AIR-R01',
    isRead: false,
    timestamp: '2026-10-26T08:30:00.000Z',
  },
  {
    id: 'alt-002',
    projectId: 'proj-001',
    type: 'Threshold Breach',
    severity: 'Medium',
    parameter: 'Noise_Day',
    message: 'Daytime acoustic measurement 69.8 dBA exceeded standard boundary limit (65.0 dBA).',
    ruleId: 'NOI-R01',
    isRead: false,
    timestamp: '2026-10-26T08:45:00.000Z',
  },
  {
    id: 'alt-003',
    projectId: 'proj-001',
    type: 'Overdue Mitigation',
    severity: 'High',
    message: 'Mitigation task "Erect Sound Absorption Barrier at South Vent" is overdue (Due date was 2026-10-25).',
    isRead: false,
    timestamp: '2026-10-26T00:01:00.000Z',
  },
  {
    id: 'alt-004',
    projectId: 'proj-002',
    type: 'Threshold Breach',
    severity: 'Medium',
    parameter: 'Turbidity',
    message: 'Turbidity reading of 8.4 NTU exceeded water quality limit (5.0 NTU) in Estuary Marine Spoil Basin.',
    ruleId: 'WAT-R02',
    isRead: true,
    timestamp: '2026-10-26T09:00:00.000Z',
  },
];

const INITIAL_COMPLIANCE: ComplianceRecord[] = [
  {
    id: 'cmp-001',
    projectId: 'proj-001',
    standardTitle: 'National Ambient Air Quality Standard (NAAQS) Particulate Cap',
    category: 'Air Standards',
    status: 'Non-Compliant',
    lastEvaluated: '2026-10-26T08:30:00.000Z',
    notes: 'PM2.5 breach recorded; dust cannons mitigation pending completion.',
  },
  {
    id: 'cmp-002',
    projectId: 'proj-001',
    standardTitle: 'Daytime Construction Acoustic Guideline Ordinance 41',
    category: 'Noise Ordinances',
    status: 'Pending Review',
    lastEvaluated: '2026-10-26T08:45:00.000Z',
    notes: 'Acoustic fence erection overdue; contractor requested 24h grace period.',
  },
  {
    id: 'cmp-003',
    projectId: 'proj-002',
    standardTitle: 'Clean Water Act Section 401 Water Quality Certification',
    category: 'Water Protection',
    status: 'Non-Compliant',
    lastEvaluated: '2026-10-26T09:15:00.000Z',
    notes: 'Turbidity exceedance and physical tear in silt screen noted in field inspection.',
  },
  {
    id: 'cmp-004',
    projectId: 'proj-003',
    standardTitle: 'Avian & Ecological Habitat Preservation Protocol',
    category: 'EIA Approval Conditions',
    status: 'Compliant',
    lastEvaluated: '2026-10-25T16:00:00.000Z',
    notes: 'Pre-construction nesting surveys verified clear of endangered raptor corridors.',
  },
];

class Database {
  private state: DatabaseState;

  constructor() {
    this.state = this.loadOrInitialize();
  }

  private loadOrInitialize(): DatabaseState {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (err) {
      console.error('Failed to load database file, reinitializing default seed:', err);
    }

    const defaultState: DatabaseState = {
      projects: INITIAL_PROJECTS,
      stations: INITIAL_STATIONS,
      readings: INITIAL_READINGS,
      riskAssessments: [],
      mitigationActions: INITIAL_MITIGATIONS,
      inspections: INITIAL_INSPECTIONS,
      feedback: INITIAL_FEEDBACK,
      alerts: INITIAL_ALERTS,
      compliance: INITIAL_COMPLIANCE,
      thresholds: DEFAULT_THRESHOLDS,
    };

    // Calculate initial risk assessments for seeded projects
    for (const proj of INITIAL_PROJECTS) {
      const projReadings = INITIAL_READINGS.filter(r => r.projectId === proj.id);
      const evalResult = evaluateEnvironmentalRisk(projReadings, DEFAULT_THRESHOLDS);
      defaultState.riskAssessments.push({
        ...evalResult,
        id: `ra-${proj.id}-init`,
        projectId: proj.id,
      });
    }

    this.saveState(defaultState);
    return defaultState;
  }

  public saveState(state: DatabaseState = this.state): void {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DATA_FILE, JSON.stringify(state, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to save database file:', err);
    }
  }

  public getState(): DatabaseState {
    return this.state;
  }

  // Projects
  public getProjects(): Project[] {
    return this.state.projects;
  }

  public getProject(id: string): Project | undefined {
    return this.state.projects.find(p => p.id === id);
  }

  public createProject(data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Project {
    const id = `proj-${Date.now().toString(36)}`;
    const now = new Date().toISOString();
    const newProject: Project = {
      ...data,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.state.projects.unshift(newProject);
    this.saveState();
    return newProject;
  }

  public updateProject(id: string, updates: Partial<Project>): Project | null {
    const index = this.state.projects.findIndex(p => p.id === id);
    if (index === -1) return null;
    this.state.projects[index] = {
      ...this.state.projects[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.saveState();
    return this.state.projects[index];
  }

  // Stations
  public getStations(projectId?: string): MonitoringStation[] {
    if (projectId) {
      return this.state.stations.filter(s => s.projectId === projectId);
    }
    return this.state.stations;
  }

  public createStation(data: Omit<MonitoringStation, 'id' | 'lastActive'>): MonitoringStation {
    const id = `st-${Date.now().toString(36)}`;
    const newStation: MonitoringStation = {
      ...data,
      id,
      lastActive: new Date().toISOString(),
    };
    this.state.stations.push(newStation);
    this.saveState();
    return newStation;
  }

  // Readings
  public getReadings(params?: { projectId?: string; category?: string; limit?: number }): EnvironmentalReading[] {
    let result = [...this.state.readings];
    if (params?.projectId) {
      result = result.filter(r => r.projectId === params.projectId);
    }
    if (params?.category) {
      result = result.filter(r => r.category === params.category);
    }
    result.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    if (params?.limit) {
      result = result.slice(0, params.limit);
    }
    return result;
  }

  public addReading(data: Omit<EnvironmentalReading, 'id'>): { reading: EnvironmentalReading; alertsGenerated: Alert[] } {
    const id = `rd-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    const reading: EnvironmentalReading = {
      ...data,
      id,
    };
    this.state.readings.unshift(reading);

    // Rule-based check against thresholds to generate real-time alerts
    const alertsGenerated: Alert[] = [];
    const threshold = this.state.thresholds[reading.parameter];
    if (threshold && reading.isValid !== false) {
      let breached = false;
      let isCritical = false;

      if (threshold.maxLimit !== undefined && reading.value > threshold.maxLimit) {
        breached = true;
        if (threshold.criticalLimit !== undefined && reading.value >= threshold.criticalLimit) {
          isCritical = true;
        }
      }
      if (threshold.minLimit !== undefined && reading.value < threshold.minLimit) {
        breached = true;
        if (threshold.criticalLimit !== undefined && reading.value <= threshold.criticalLimit) {
          isCritical = true;
        }
      }

      if (breached) {
        const alert: Alert = {
          id: `alt-${Date.now().toString(36)}-${reading.parameter}`,
          projectId: reading.projectId,
          type: 'Threshold Breach',
          severity: isCritical ? 'Critical' : 'High',
          parameter: reading.parameter,
          ruleId: threshold.ruleId,
          message: `${reading.parameter} measured ${reading.value} ${reading.unit} breaches standard threshold (${threshold.maxLimit !== undefined ? 'Max ' + threshold.maxLimit : 'Min ' + threshold.minLimit} ${threshold.unit}). Rule: ${threshold.ruleTitle}.`,
          isRead: false,
          timestamp: reading.timestamp || new Date().toISOString(),
        };
        this.state.alerts.unshift(alert);
        alertsGenerated.push(alert);
      }
    }

    this.saveState();
    return { reading, alertsGenerated };
  }

  // Risk assessments
  public assessProjectRisk(projectId: string): RiskAssessmentResult & { id: string; projectId: string } {
    const readings = this.state.readings.filter(r => r.projectId === projectId);
    const result = evaluateEnvironmentalRisk(readings, this.state.thresholds);
    const assessment = {
      ...result,
      id: `ra-${projectId}-${Date.now().toString(36)}`,
      projectId,
    };
    this.state.riskAssessments.unshift(assessment);
    this.saveState();
    return assessment;
  }

  public getRiskHistory(projectId?: string) {
    if (projectId) {
      return this.state.riskAssessments.filter(r => r.projectId === projectId);
    }
    return this.state.riskAssessments;
  }

  // Mitigation actions
  public getMitigations(projectId?: string): MitigationAction[] {
    if (projectId) {
      return this.state.mitigationActions.filter(m => m.projectId === projectId);
    }
    return this.state.mitigationActions;
  }

  public createMitigation(data: Omit<MitigationAction, 'id' | 'createdAt' | 'updatedAt' | 'evidenceFiles' | 'history'>): MitigationAction {
    const id = `mit-${Date.now().toString(36)}`;
    const now = new Date().toISOString();
    const newAction: MitigationAction = {
      ...data,
      id,
      evidenceFiles: [],
      history: [
        { action: 'Mitigation action created', timestamp: now, user: 'Project HSE Officer' }
      ],
      createdAt: now,
      updatedAt: now,
    };
    this.state.mitigationActions.unshift(newAction);
    this.saveState();
    return newAction;
  }

  public updateMitigation(id: string, updates: Partial<MitigationAction>, actionLog?: string): MitigationAction | null {
    const index = this.state.mitigationActions.findIndex(m => m.id === id);
    if (index === -1) return null;
    const now = new Date().toISOString();
    const current = this.state.mitigationActions[index];
    const newHistory = [...current.history];
    if (actionLog) {
      newHistory.push({ action: actionLog, timestamp: now, user: 'HSE Coordinator' });
    }
    this.state.mitigationActions[index] = {
      ...current,
      ...updates,
      history: newHistory,
      updatedAt: now,
    };
    this.saveState();
    return this.state.mitigationActions[index];
  }

  public addMitigationEvidence(id: string, file: { name: string; url: string }): MitigationAction | null {
    const action = this.state.mitigationActions.find(m => m.id === id);
    if (!action) return null;
    const now = new Date().toISOString();
    action.evidenceFiles.push({
      ...file,
      uploadedAt: now,
    });
    action.history.push({
      action: `Supporting evidence uploaded: ${file.name}`,
      timestamp: now,
      user: 'Field Supervisor',
    });
    action.updatedAt = now;
    this.saveState();
    return action;
  }

  // Inspections
  public getInspections(projectId?: string): Inspection[] {
    if (projectId) {
      return this.state.inspections.filter(i => i.projectId === projectId);
    }
    return this.state.inspections;
  }

  public createInspection(data: Omit<Inspection, 'id' | 'createdAt' | 'photos'>): Inspection {
    const id = `insp-${Date.now().toString(36)}`;
    const newInspection: Inspection = {
      ...data,
      id,
      photos: [],
      createdAt: new Date().toISOString(),
    };
    this.state.inspections.unshift(newInspection);
    this.saveState();
    return newInspection;
  }

  public updateInspection(id: string, updates: Partial<Inspection>): Inspection | null {
    const index = this.state.inspections.findIndex(i => i.id === id);
    if (index === -1) return null;
    this.state.inspections[index] = {
      ...this.state.inspections[index],
      ...updates,
    };
    this.saveState();
    return this.state.inspections[index];
  }

  public addInspectionPhoto(id: string, photo: { name: string; url: string }): Inspection | null {
    const inspection = this.state.inspections.find(i => i.id === id);
    if (!inspection) return null;
    inspection.photos.push(photo);
    this.saveState();
    return inspection;
  }

  // Feedback
  public getFeedback(projectId?: string): PublicFeedback[] {
    if (projectId) {
      return this.state.feedback.filter(f => f.projectId === projectId);
    }
    return this.state.feedback;
  }

  public createFeedback(data: Omit<PublicFeedback, 'id' | 'createdAt'>): PublicFeedback {
    const id = `fb-${Date.now().toString(36)}`;
    const newFeedback: PublicFeedback = {
      ...data,
      id,
      createdAt: new Date().toISOString(),
    };
    this.state.feedback.unshift(newFeedback);
    this.saveState();
    return newFeedback;
  }

  public updateFeedback(id: string, updates: Partial<PublicFeedback>): PublicFeedback | null {
    const index = this.state.feedback.findIndex(f => f.id === id);
    if (index === -1) return null;
    this.state.feedback[index] = {
      ...this.state.feedback[index],
      ...updates,
    };
    this.saveState();
    return this.state.feedback[index];
  }

  // Alerts
  public getAlerts(projectId?: string): Alert[] {
    if (projectId) {
      return this.state.alerts.filter(a => a.projectId === projectId);
    }
    return this.state.alerts;
  }

  public markAlertRead(id: string): Alert | null {
    const alert = this.state.alerts.find(a => a.id === id);
    if (!alert) return null;
    alert.isRead = true;
    this.saveState();
    return alert;
  }

  public markAllAlertsRead(): void {
    this.state.alerts.forEach(a => { a.isRead = true; });
    this.saveState();
  }

  // Compliance
  public getCompliance(projectId?: string): ComplianceRecord[] {
    if (projectId) {
      return this.state.compliance.filter(c => c.projectId === projectId);
    }
    return this.state.compliance;
  }

  public updateCompliance(id: string, updates: Partial<ComplianceRecord>): ComplianceRecord | null {
    const index = this.state.compliance.findIndex(c => c.id === id);
    if (index === -1) return null;
    this.state.compliance[index] = {
      ...this.state.compliance[index],
      ...updates,
      lastEvaluated: new Date().toISOString(),
    };
    this.saveState();
    return this.state.compliance[index];
  }

  // Thresholds
  public getThresholds(): typeof DEFAULT_THRESHOLDS {
    return this.state.thresholds;
  }

  public updateThreshold(param: string, updates: Partial<(typeof DEFAULT_THRESHOLDS)[string]>): typeof DEFAULT_THRESHOLDS {
    if (this.state.thresholds[param]) {
      this.state.thresholds[param] = {
        ...this.state.thresholds[param],
        ...updates,
      };
      this.saveState();
    }
    return this.state.thresholds;
  }

  // Dashboard summary stats
  public getDashboardSummary() {
    const totalProjects = this.state.projects.length;
    const activeProjects = this.state.projects.filter(p => p.status === 'Active').length;
    const totalStations = this.state.stations.length;
    const totalReadings = this.state.readings.length;
    const unreadAlerts = this.state.alerts.filter(a => !a.isRead).length;
    const pendingMitigations = this.state.mitigationActions.filter(m => m.status !== 'Completed').length;
    const overdueMitigations = this.state.mitigationActions.filter(m => {
      if (m.status === 'Completed') return false;
      const due = new Date(m.dueDate);
      const today = new Date();
      return due < today;
    }).length;

    // Compliance tally
    const complianceCounts = {
      Compliant: 0,
      'Non-Compliant': 0,
      'Pending Review': 0,
      'Insufficient Data': 0,
    };
    this.state.compliance.forEach(c => {
      if (complianceCounts[c.status] !== undefined) {
        complianceCounts[c.status]++;
      }
    });

    // Latest readings by parameter
    const latestByParam: Record<string, EnvironmentalReading> = {};
    for (const r of this.state.readings) {
      if (!latestByParam[r.parameter]) {
        latestByParam[r.parameter] = r;
      }
    }

    return {
      totalProjects,
      activeProjects,
      totalStations,
      totalReadings,
      unreadAlerts,
      pendingMitigations,
      overdueMitigations,
      complianceCounts,
      latestReadings: Object.values(latestByParam),
      recentAlerts: this.state.alerts.slice(0, 5),
      recentInspections: this.state.inspections.slice(0, 5),
      recentFeedback: this.state.feedback.slice(0, 5),
    };
  }
}

export const db = new Database();
