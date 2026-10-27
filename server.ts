import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { db } from './src/server/db.ts';

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure upload storage for evidence files and inspection photos
const UPLOAD_DIR = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${Date.now()}-${safeName}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// Serve uploaded files statically
app.use('/uploads', express.static(UPLOAD_DIR));

// -------------------------------------------------------------
// REST API ROUTES
// -------------------------------------------------------------

// 1. DASHBOARD
app.get('/api/dashboard/summary', (_req: Request, res: Response) => {
  try {
    const summary = db.getDashboardSummary();
    res.json(summary);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 2. PROJECTS
app.get('/api/projects', (_req: Request, res: Response) => {
  try {
    const projects = db.getProjects();
    res.json(projects);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/projects/:id', (req: Request, res: Response) => {
  try {
    const project = db.getProject(req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json(project);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/projects', (req: Request, res: Response) => {
  try {
    const { name, type, location, latitude, longitude, description, status } = req.body;
    if (!name || !type || !location) {
      return res.status(400).json({ error: 'Name, type, and location are required' });
    }
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return res.status(400).json({ error: 'Valid geographic coordinates (latitude -90..90, longitude -180..180) are required' });
    }

    const newProject = db.createProject({
      name,
      type,
      location,
      latitude: lat,
      longitude: lng,
      description: description || '',
      status: status || 'Planning',
    });
    res.status(201).json(newProject);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/projects/:id', (req: Request, res: Response) => {
  try {
    const updated = db.updateProject(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 3. ENVIRONMENTAL MONITORING & STATIONS
app.get('/api/monitoring/stations', (req: Request, res: Response) => {
  try {
    const projectId = req.query.projectId as string | undefined;
    const stations = db.getStations(projectId);
    res.json(stations);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/monitoring/stations', (req: Request, res: Response) => {
  try {
    const { projectId, name, latitude, longitude, parameters, stationType, status } = req.body;
    if (!projectId || !name || latitude === undefined || longitude === undefined) {
      return res.status(400).json({ error: 'Project ID, station name, and coordinates are required' });
    }
    const newStation = db.createStation({
      projectId,
      name,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      parameters: Array.isArray(parameters) ? parameters : ['PM2.5', 'Noise_Day'],
      stationType: stationType || 'Fixed Continuous',
      status: status || 'Active',
    });
    res.status(201).json(newStation);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/monitoring/readings', (req: Request, res: Response) => {
  try {
    const projectId = req.query.projectId as string | undefined;
    const category = req.query.category as string | undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
    const readings = db.getReadings({ projectId, category, limit });
    res.json(readings);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/monitoring/latest', (req: Request, res: Response) => {
  try {
    const projectId = req.query.projectId as string | undefined;
    const all = db.getReadings({ projectId });
    const latestMap: Record<string, any> = {};
    for (const r of all) {
      if (!latestMap[r.parameter]) {
        latestMap[r.parameter] = r;
      }
    }
    res.json(Object.values(latestMap));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/monitoring/history', (req: Request, res: Response) => {
  try {
    const projectId = req.query.projectId as string | undefined;
    const parameter = req.query.parameter as string | undefined;
    let list = db.getReadings({ projectId });
    if (parameter) {
      list = list.filter(r => r.parameter === parameter);
    }
    // Sort chronological for chart trends
    list.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/monitoring/readings', (req: Request, res: Response) => {
  try {
    const { projectId, stationId, category, parameter, value, unit, timestamp, source, isValid, notes } = req.body;
    if (!projectId || !category || !parameter || value === undefined) {
      return res.status(400).json({ error: 'projectId, category, parameter, and numeric value are required' });
    }
    const numVal = parseFloat(value);
    if (isNaN(numVal)) {
      return res.status(400).json({ error: 'Value must be a valid number' });
    }

    const { reading, alertsGenerated } = db.addReading({
      projectId,
      stationId,
      category,
      parameter,
      value: numVal,
      unit: unit || '',
      timestamp: timestamp || new Date().toISOString(),
      source: source || 'manual',
      isValid: isValid !== false,
      notes,
    });

    res.status(201).json({ reading, alertsGenerated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 4. RISK ASSESSMENT (Rule-based, deterministic)
app.post('/api/risk/assess', (req: Request, res: Response) => {
  try {
    const { projectId } = req.body;
    if (!projectId) {
      return res.status(400).json({ error: 'projectId is required' });
    }
    const assessment = db.assessProjectRisk(projectId);
    res.status(200).json(assessment);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/risk/history', (req: Request, res: Response) => {
  try {
    const projectId = req.query.projectId as string | undefined;
    const history = db.getRiskHistory(projectId);
    res.json(history);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 5. MITIGATION ACTIONS
app.get('/api/mitigation', (req: Request, res: Response) => {
  try {
    const projectId = req.query.projectId as string | undefined;
    const mitigations = db.getMitigations(projectId);
    res.json(mitigations);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/mitigation', (req: Request, res: Response) => {
  try {
    const { projectId, title, description, responsiblePerson, dueDate, status } = req.body;
    if (!projectId || !title || !responsiblePerson || !dueDate) {
      return res.status(400).json({ error: 'projectId, title, responsiblePerson, and dueDate are required' });
    }
    const newAction = db.createMitigation({
      projectId,
      title,
      description: description || '',
      responsiblePerson,
      dueDate,
      status: status || 'Pending',
    });
    res.status(201).json(newAction);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/mitigation/:id', (req: Request, res: Response) => {
  try {
    const { status, responsiblePerson, dueDate, description, title, actionLog } = req.body;
    const updated = db.updateMitigation(req.params.id, {
      status,
      responsiblePerson,
      dueDate,
      description,
      title,
    }, actionLog || (status ? `Status changed to ${status}` : 'Task details updated'));
    if (!updated) {
      return res.status(404).json({ error: 'Mitigation action not found' });
    }
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/mitigation/:id/evidence', upload.single('evidence'), (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const fileUrl = `/uploads/${req.file.filename}`;
    const updated = db.addMitigationEvidence(req.params.id, {
      name: req.file.originalname,
      url: fileUrl,
    });
    if (!updated) {
      return res.status(404).json({ error: 'Mitigation action not found' });
    }
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 6. INSPECTIONS
app.get('/api/inspections', (req: Request, res: Response) => {
  try {
    const projectId = req.query.projectId as string | undefined;
    const inspections = db.getInspections(projectId);
    res.json(inspections);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/inspections', (req: Request, res: Response) => {
  try {
    const { projectId, inspectorName, inspectionDate, observations, complianceVerdict, status } = req.body;
    if (!projectId || !inspectorName || !observations) {
      return res.status(400).json({ error: 'projectId, inspectorName, and observations are required' });
    }
    const newInspection = db.createInspection({
      projectId,
      inspectorName,
      inspectionDate: inspectionDate || new Date().toISOString().slice(0, 10),
      observations,
      complianceVerdict: complianceVerdict || 'Pending Review',
      status: status || 'Submitted',
    });
    res.status(201).json(newInspection);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/inspections/:id', (req: Request, res: Response) => {
  try {
    const updated = db.updateInspection(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Inspection record not found' });
    }
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/inspections/:id/photo', upload.single('photo'), (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No photo uploaded' });
    }
    const photoUrl = `/uploads/${req.file.filename}`;
    const updated = db.addInspectionPhoto(req.params.id, {
      name: req.file.originalname,
      url: photoUrl,
    });
    if (!updated) {
      return res.status(404).json({ error: 'Inspection record not found' });
    }
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 7. PUBLIC FEEDBACK
app.get('/api/feedback', (req: Request, res: Response) => {
  try {
    const projectId = req.query.projectId as string | undefined;
    const feedback = db.getFeedback(projectId);
    res.json(feedback);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/feedback', (req: Request, res: Response) => {
  try {
    const { projectId, stakeholderName, email, category, comment } = req.body;
    if (!projectId || !stakeholderName || !comment) {
      return res.status(400).json({ error: 'projectId, stakeholderName, and comment are required' });
    }
    const item = db.createFeedback({
      projectId,
      stakeholderName,
      email: email || '',
      category: category || 'General Query',
      comment,
      status: 'New',
    });
    res.status(201).json(item);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/feedback/:id', (req: Request, res: Response) => {
  try {
    const updated = db.updateFeedback(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Feedback record not found' });
    }
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 8. ALERTS & COMPLIANCE
app.get('/api/alerts', (req: Request, res: Response) => {
  try {
    const projectId = req.query.projectId as string | undefined;
    const alerts = db.getAlerts(projectId);
    res.json(alerts);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/alerts/:id/read', (req: Request, res: Response) => {
  try {
    const updated = db.markAlertRead(req.params.id);
    if (!updated) {
      return res.status(404).json({ error: 'Alert not found' });
    }
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/alerts/read-all', (_req: Request, res: Response) => {
  try {
    db.markAllAlertsRead();
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/compliance', (req: Request, res: Response) => {
  try {
    const projectId = req.query.projectId as string | undefined;
    const compliance = db.getCompliance(projectId);
    res.json(compliance);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/compliance/:id', (req: Request, res: Response) => {
  try {
    const updated = db.updateCompliance(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Compliance record not found' });
    }
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 9. MAP APIS
app.get('/api/maps/projects', (_req: Request, res: Response) => {
  try {
    const projects = db.getProjects().map(p => ({
      id: p.id,
      name: p.name,
      type: p.type,
      location: p.location,
      latitude: p.latitude,
      longitude: p.longitude,
      status: p.status,
    }));
    res.json(projects);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/maps/stations', (_req: Request, res: Response) => {
  try {
    const stations = db.getStations().map(s => {
      const project = db.getProject(s.projectId);
      return {
        id: s.id,
        projectId: s.projectId,
        projectName: project ? project.name : 'Unknown',
        name: s.name,
        latitude: s.latitude,
        longitude: s.longitude,
        parameters: s.parameters,
        stationType: s.stationType,
        status: s.status,
      };
    });
    res.json(stations);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 10. THRESHOLDS
app.get('/api/thresholds', (_req: Request, res: Response) => {
  res.json(db.getThresholds());
});

app.patch('/api/thresholds/:parameter', (req: Request, res: Response) => {
  try {
    const updated = db.updateThreshold(req.params.parameter, req.body);
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// VITE INTEGRATION
// -------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Smart EIA] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
