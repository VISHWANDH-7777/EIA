import React from 'react';
import {
  FolderGit2,
  Activity,
  AlertTriangle,
  Clock,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { DashboardSummary, Project } from '../types/index.ts';

interface DashboardViewProps {
  summary: DashboardSummary | null;
  projects: Project[];
  onNavigateTab: (tab: string) => void;
  onOpenRecordModal: () => void;
  onSelectProject: (id: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  summary,
  projects,
  onNavigateTab,
  onOpenRecordModal,
  onSelectProject,
}) => {
  if (!summary) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-3 text-slate-500 text-sm">
          <div className="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <span>Loading EIA system data...</span>
        </div>
      </div>
    );
  }

  const complianceTotal =
    (summary.complianceCounts.Compliant || 0) +
    (summary.complianceCounts['Non-Compliant'] || 0) +
    (summary.complianceCounts['Pending Review'] || 0) +
    (summary.complianceCounts['Insufficient Data'] || 0);

  return (
    <div className="space-y-6">
      {/* Top Welcome & KPI row */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Environmental Dashboard</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time compliance surveillance, rule breaches, and active mitigation tracking
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onNavigateTab('risk')}
            className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs shadow-xs transition-colors"
          >
            Run Rule-Based Assessment
          </button>
          <button
            onClick={onOpenRecordModal}
            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs shadow-xs transition-colors"
          >
            Record Measurement
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Projects */}
        <div
          onClick={() => onNavigateTab('projects')}
          className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:border-emerald-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Registered Projects</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <FolderGit2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-slate-900">{summary.totalProjects}</span>
            <span className="text-xs font-medium text-emerald-600">({summary.activeProjects} active)</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
            <span>{summary.totalStations} monitoring stations</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-600 transition-colors" />
          </p>
        </div>

        {/* Unread Alerts */}
        <div
          onClick={() => onNavigateTab('alerts')}
          className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:border-rose-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Threshold Breaches</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-rose-600">{summary.unreadAlerts}</span>
            <span className="text-xs text-slate-500">unresolved</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
            <span>Active exceedance alerts</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-600 transition-colors" />
          </p>
        </div>

        {/* Mitigation Actions */}
        <div
          onClick={() => onNavigateTab('mitigation')}
          className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:border-amber-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Mitigation Actions</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-slate-900">{summary.pendingMitigations}</span>
            {summary.overdueMitigations > 0 ? (
              <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                {summary.overdueMitigations} overdue
              </span>
            ) : (
              <span className="text-xs text-emerald-600">On schedule</span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
            <span>Pending remediation tasks</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-600 transition-colors" />
          </p>
        </div>

        {/* Compliance */}
        <div
          onClick={() => onNavigateTab('alerts')}
          className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:border-emerald-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Statutory Compliance</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-emerald-700">
              {summary.complianceCounts.Compliant || 0}/{complianceTotal}
            </span>
            <span className="text-xs text-slate-500">verified</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
            <span className="text-rose-600 font-medium">
              {summary.complianceCounts['Non-Compliant'] || 0} non-compliant
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-600 transition-colors" />
          </p>
        </div>
      </div>

      {/* Latest Readings by Category */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Latest Environmental Readings</h2>
            <p className="text-xs text-slate-500">
              Current measurements across air quality, water quality, and acoustic sensors
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('monitoring')}
            className="text-xs font-medium text-emerald-600 hover:text-emerald-700 flex items-center space-x-1"
          >
            <span>View all {summary.totalReadings} readings</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Air Quality */}
          <div className="border border-slate-100 bg-slate-50/60 rounded-lg p-3 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Air Quality</span>
              <span className="text-[10px] text-slate-400">NAAQS / WHO</span>
            </div>
            {summary.latestReadings
              .filter((r) => r.category === 'air')
              .slice(0, 3)
              .map((r) => (
                <div key={r.id} className="bg-white p-2.5 rounded border border-slate-200 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-slate-800">{r.parameter}</span>
                    <span
                      className={`font-mono font-bold ${
                        (r.parameter === 'PM2.5' && r.value > 35) ||
                        (r.parameter === 'PM10' && r.value > 150)
                          ? 'text-rose-600'
                          : 'text-emerald-700'
                      }`}
                    >
                      {r.value} {r.unit}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                    <span className="capitalize">{r.source} feed</span>
                    <span>{new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              ))}
            {summary.latestReadings.filter((r) => r.category === 'air').length === 0 && (
              <p className="text-xs text-slate-400 italic py-2">No air measurements logged.</p>
            )}
          </div>

          {/* Water Quality */}
          <div className="border border-slate-100 bg-slate-50/60 rounded-lg p-3 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Water Quality</span>
              <span className="text-[10px] text-slate-400">CWA Sec 304</span>
            </div>
            {summary.latestReadings
              .filter((r) => r.category === 'water')
              .slice(0, 3)
              .map((r) => (
                <div key={r.id} className="bg-white p-2.5 rounded border border-slate-200 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-slate-800">{r.parameter}</span>
                    <span
                      className={`font-mono font-bold ${
                        (r.parameter === 'Turbidity' && r.value > 5.0) ||
                        (r.parameter === 'pH' && (r.value < 6.5 || r.value > 8.5))
                          ? 'text-rose-600'
                          : 'text-emerald-700'
                      }`}
                    >
                      {r.value} {r.unit}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                    <span className="capitalize">{r.source} sample</span>
                    <span>{new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              ))}
            {summary.latestReadings.filter((r) => r.category === 'water').length === 0 && (
              <p className="text-xs text-slate-400 italic py-2">No water measurements logged.</p>
            )}
          </div>

          {/* Acoustics & Noise */}
          <div className="border border-slate-100 bg-slate-50/60 rounded-lg p-3 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Acoustic Levels</span>
              <span className="text-[10px] text-slate-400">Ord. 41 Limits</span>
            </div>
            {summary.latestReadings
              .filter((r) => r.category === 'noise')
              .slice(0, 3)
              .map((r) => (
                <div key={r.id} className="bg-white p-2.5 rounded border border-slate-200 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-slate-800">{r.parameter}</span>
                    <span
                      className={`font-mono font-bold ${
                        (r.parameter === 'Noise_Day' && r.value > 65) ||
                        (r.parameter === 'Noise_Night' && r.value > 55)
                          ? 'text-rose-600'
                          : 'text-emerald-700'
                      }`}
                    >
                      {r.value} {r.unit}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                    <span className="capitalize">{r.source} sensor</span>
                    <span>{new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              ))}
            {summary.latestReadings.filter((r) => r.category === 'noise').length === 0 && (
              <p className="text-xs text-slate-400 italic py-2">No noise measurements logged.</p>
            )}
          </div>
        </div>
      </div>

      {/* Two-column section: Active Alerts & Recent Inspections/Incidents */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Unresolved Threshold Alerts */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>Environmental Alerts & Breaches</span>
            </h3>
            <button
              onClick={() => onNavigateTab('alerts')}
              className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
            >
              Manage Alerts
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {summary.recentAlerts.map((alert) => (
              <div key={alert.id} className="py-2.5 flex items-start space-x-3 text-xs">
                <span
                  className={`mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                    alert.severity === 'Critical'
                      ? 'bg-rose-100 text-rose-800 border border-rose-200'
                      : alert.severity === 'High'
                      ? 'bg-orange-100 text-orange-800 border border-orange-200'
                      : 'bg-amber-100 text-amber-800 border border-amber-200'
                  }`}
                >
                  {alert.severity}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-slate-800 font-medium leading-snug">{alert.message}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {new Date(alert.timestamp).toLocaleString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                    {alert.ruleId && <span className="ml-2 font-mono text-slate-500">Rule: {alert.ruleId}</span>}
                  </p>
                </div>
              </div>
            ))}
            {summary.recentAlerts.length === 0 && (
              <p className="text-xs text-slate-400 py-3 italic">No threshold alerts active.</p>
            )}
          </div>
        </div>

        {/* Recent Field Inspections & Feedback */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Recent Field Inspections & Incidents</span>
            </h3>
            <button
              onClick={() => onNavigateTab('stakeholders')}
              className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
            >
              View All
            </button>
          </div>

          <div className="space-y-3">
            {summary.recentInspections.map((insp) => (
              <div key={insp.id} className="p-3 rounded-lg border border-slate-100 bg-slate-50 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800">{insp.inspectorName}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      insp.complianceVerdict === 'Compliant'
                        ? 'bg-emerald-100 text-emerald-800'
                        : insp.complianceVerdict === 'Non-Compliant'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {insp.complianceVerdict}
                  </span>
                </div>
                <p className="text-slate-600 text-[11px] line-clamp-2">{insp.observations}</p>
                <div className="text-[10px] text-slate-400">Date: {insp.inspectionDate}</div>
              </div>
            ))}
            {summary.recentInspections.length === 0 && (
              <p className="text-xs text-slate-400 py-3 italic">No inspection logs submitted yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
