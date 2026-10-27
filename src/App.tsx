/**
 * Smart EIA — Environmental Impact Assessment and Monitoring System
 * 
 * Comprehensive, deterministic, rule-based environmental surveillance application.
 * Powered by Express REST backend and Vite React frontend.
 * Zero machine learning, zero black-box AI.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { api } from './utils/api.ts';
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
} from './types/index.ts';

import { Navbar } from './components/Navbar.tsx';
import { DashboardView } from './components/DashboardView.tsx';
import { ProjectsView } from './components/ProjectsView.tsx';
import { MonitoringView } from './components/MonitoringView.tsx';
import { MapView } from './components/MapView.tsx';
import { RiskAssessmentView } from './components/RiskAssessmentView.tsx';
import { MitigationView } from './components/MitigationView.tsx';
import { InspectionsAndFeedbackView } from './components/InspectionsAndFeedbackView.tsx';
import { AlertsAndComplianceView } from './components/AlertsAndComplianceView.tsx';
import { RecordMeasurementModal } from './components/RecordMeasurementModal.tsx';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');

  // Core Data Stores
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [stations, setStations] = useState<MonitoringStation[]>([]);
  const [readings, setReadings] = useState<EnvironmentalReading[]>([]);
  const [riskHistory, setRiskHistory] = useState<RiskAssessment[]>([]);
  const [mitigations, setMitigations] = useState<MitigationAction[]>([]);
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [feedback, setFeedback] = useState<PublicFeedback[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [compliance, setCompliance] = useState<ComplianceRecord[]>([]);

  // UI state
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'alert' } | null>(null);

  const showToast = (text: string, type: 'success' | 'alert' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4500);
  };

  // Fetch all initial data
  const loadAllData = useCallback(async () => {
    try {
      const [
        sumData,
        projData,
        stData,
        rdData,
        riskData,
        mitData,
        inspData,
        fbData,
        alertData,
        compData,
      ] = await Promise.all([
        api.getDashboardSummary(),
        api.getProjects(),
        api.getStations(),
        api.getReadings(),
        api.getRiskHistory(),
        api.getMitigations(),
        api.getInspections(),
        api.getFeedback(),
        api.getAlerts(),
        api.getCompliance(),
      ]);

      setSummary(sumData);
      setProjects(projData);
      setStations(stData);
      setReadings(rdData);
      setRiskHistory(riskData);
      setMitigations(mitData);
      setInspections(inspData);
      setFeedback(fbData);
      setAlerts(alertData);
      setCompliance(compData);
    } catch (err: any) {
      console.error('Error loading initial EIA data:', err);
    }
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Handlers for Project actions
  const handleRegisterProject = async (data: Partial<Project>) => {
    const created = await api.createProject(data);
    setProjects((prev) => [created, ...prev]);
    showToast(`Project "${created.name}" registered successfully.`);
    loadAllData();
  };

  const handleUpdateProject = async (id: string, updates: Partial<Project>) => {
    const updated = await api.updateProject(id, updates);
    setProjects((prev) => prev.map((p) => (p.id === id ? updated : p)));
    showToast(`Project "${updated.name}" updated.`);
    loadAllData();
  };

  // Handlers for Readings
  const handleSaveReading = async (data: Partial<EnvironmentalReading>) => {
    const res = await api.recordReading(data);
    setReadings((prev) => [res.reading, ...prev]);

    if (res.alertsGenerated && res.alertsGenerated.length > 0) {
      setAlerts((prev) => [...res.alertsGenerated, ...prev]);
      showToast(
        `Threshold breach alert triggered for ${res.reading.parameter}: ${res.alertsGenerated[0].message}`,
        'alert'
      );
    } else {
      showToast(`Measurement logged: ${res.reading.parameter} = ${res.reading.value} ${res.reading.unit}.`);
    }

    loadAllData();
  };

  // Handler for Risk Assessment
  const handleRunAssessment = async (projectId: string): Promise<RiskAssessment> => {
    const result = await api.assessRisk(projectId);
    setRiskHistory((prev) => [result, ...prev]);
    showToast(`Rule-based assessment completed. Overall Risk: ${result.riskLevel}.`);
    loadAllData();
    return result;
  };

  // Handlers for Mitigations
  const handleCreateMitigation = async (data: Partial<MitigationAction>) => {
    const created = await api.createMitigation(data);
    setMitigations((prev) => [created, ...prev]);
    showToast(`Mitigation action "${created.title}" logged.`);
    loadAllData();
  };

  const handleUpdateMitigation = async (
    id: string,
    updates: Partial<MitigationAction> & { actionLog?: string }
  ) => {
    const updated = await api.updateMitigation(id, updates);
    setMitigations((prev) => prev.map((m) => (m.id === id ? updated : m)));
    showToast(`Mitigation task updated.`);
    loadAllData();
  };

  const handleUploadEvidence = async (id: string, file: File) => {
    const updated = await api.uploadMitigationEvidence(id, file);
    setMitigations((prev) => prev.map((m) => (m.id === id ? updated : m)));
    showToast(`Evidence "${file.name}" uploaded successfully.`);
  };

  // Handlers for Inspections & Feedback
  const handleCreateInspection = async (data: Partial<Inspection>) => {
    const created = await api.createInspection(data);
    setInspections((prev) => [created, ...prev]);
    showToast(`Field inspection record logged.`);
    loadAllData();
  };

  const handleUpdateInspection = async (id: string, updates: Partial<Inspection>) => {
    const updated = await api.updateInspection(id, updates);
    setInspections((prev) => prev.map((i) => (i.id === id ? updated : i)));
    showToast(`Inspection review updated.`);
    loadAllData();
  };

  const handleUploadInspectionPhoto = async (id: string, file: File) => {
    const updated = await api.uploadInspectionPhoto(id, file);
    setInspections((prev) => prev.map((i) => (i.id === id ? updated : i)));
    showToast(`Photograph attached to inspection.`);
  };

  const handleCreateFeedback = async (data: Partial<PublicFeedback>) => {
    const created = await api.createFeedback(data);
    setFeedback((prev) => [created, ...prev]);
    showToast(`Public feedback registered.`);
    loadAllData();
  };

  const handleUpdateFeedback = async (id: string, updates: Partial<PublicFeedback>) => {
    const updated = await api.updateFeedback(id, updates);
    setFeedback((prev) => prev.map((f) => (f.id === id ? updated : f)));
    showToast(`Feedback addressed with response.`);
    loadAllData();
  };

  // Handlers for Alerts & Compliance
  const handleMarkAlertRead = async (id: string) => {
    const updated = await api.markAlertRead(id);
    setAlerts((prev) => prev.map((a) => (a.id === id ? updated : a)));
    showToast(`Alert marked as reviewed.`);
    loadAllData();
  };

  const handleMarkAllAlertsRead = async () => {
    await api.markAllAlertsRead();
    setAlerts((prev) => prev.map((a) => ({ ...a, isRead: true })));
    showToast(`All alerts marked as reviewed.`);
    loadAllData();
  };

  const handleUpdateCompliance = async (id: string, updates: Partial<ComplianceRecord>) => {
    const updated = await api.updateCompliance(id, updates);
    setCompliance((prev) => prev.map((c) => (c.id === id ? updated : c)));
    showToast(`Compliance record updated to "${updated.status}".`);
    loadAllData();
  };

  const unreadAlertsCount = alerts.filter((a) => !a.isRead).length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        projects={projects}
        selectedProjectId={selectedProjectId}
        onSelectProject={setSelectedProjectId}
        unreadAlertsCount={unreadAlertsCount}
        onOpenRecordModal={() => setIsRecordModalOpen(true)}
      />

      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 max-w-md animate-fade-in">
          <div
            className={`p-3.5 rounded-xl shadow-lg border text-xs flex items-center space-x-3 ${
              toastMessage.type === 'alert'
                ? 'bg-rose-50 border-rose-300 text-rose-900'
                : 'bg-emerald-900 border-emerald-800 text-white'
            }`}
          >
            <span className="font-semibold">{toastMessage.text}</span>
            <button
              onClick={() => setToastMessage(null)}
              className="ml-auto text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Main View Port */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentTab === 'dashboard' && (
          <DashboardView
            summary={summary}
            projects={projects}
            onNavigateTab={setCurrentTab}
            onOpenRecordModal={() => setIsRecordModalOpen(true)}
            onSelectProject={setSelectedProjectId}
          />
        )}

        {currentTab === 'projects' && (
          <ProjectsView
            projects={projects}
            stations={stations}
            onRegisterProject={handleRegisterProject}
            onUpdateProject={handleUpdateProject}
            onSelectProjectScope={setSelectedProjectId}
            onNavigateTab={setCurrentTab}
          />
        )}

        {currentTab === 'monitoring' && (
          <MonitoringView
            readings={readings}
            stations={stations}
            projects={projects}
            selectedProjectId={selectedProjectId}
            onOpenRecordModal={() => setIsRecordModalOpen(true)}
          />
        )}

        {currentTab === 'map' && (
          <MapView
            projects={projects}
            stations={stations}
            onSelectProjectScope={setSelectedProjectId}
            onNavigateTab={setCurrentTab}
          />
        )}

        {currentTab === 'risk' && (
          <RiskAssessmentView
            projects={projects}
            selectedProjectId={selectedProjectId}
            onSelectProjectScope={setSelectedProjectId}
            riskHistory={riskHistory}
            onRunAssessment={handleRunAssessment}
            onNavigateTab={setCurrentTab}
          />
        )}

        {currentTab === 'mitigation' && (
          <MitigationView
            mitigations={mitigations}
            projects={projects}
            selectedProjectId={selectedProjectId}
            onCreateMitigation={handleCreateMitigation}
            onUpdateMitigation={handleUpdateMitigation}
            onUploadEvidence={handleUploadEvidence}
          />
        )}

        {currentTab === 'stakeholders' && (
          <InspectionsAndFeedbackView
            inspections={inspections}
            feedback={feedback}
            projects={projects}
            selectedProjectId={selectedProjectId}
            onCreateInspection={handleCreateInspection}
            onUpdateInspection={handleUpdateInspection}
            onUploadInspectionPhoto={handleUploadInspectionPhoto}
            onCreateFeedback={handleCreateFeedback}
            onUpdateFeedback={handleUpdateFeedback}
          />
        )}

        {currentTab === 'alerts' && (
          <AlertsAndComplianceView
            alerts={alerts}
            compliance={compliance}
            projects={projects}
            selectedProjectId={selectedProjectId}
            onMarkAlertRead={handleMarkAlertRead}
            onMarkAllAlertsRead={handleMarkAllAlertsRead}
            onUpdateCompliance={handleUpdateCompliance}
          />
        )}
      </main>

      {/* Record Measurement Modal */}
      <RecordMeasurementModal
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
        projects={projects}
        stations={stations}
        selectedProjectId={selectedProjectId}
        onSaveReading={handleSaveReading}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-800">Smart EIA</span>
            <span>&bull;</span>
            <span>Environmental Impact Assessment and Continuous Monitoring System</span>
          </div>
          <div className="flex items-center space-x-3 text-[11px] font-mono">
            <span>Methodology: Statutory Rule-Based Matrix</span>
            <span>&bull;</span>
            <span className="text-emerald-700 font-semibold">Zero AI / Non-Probabilistic</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
