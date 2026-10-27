import React, { useState } from 'react';
import {
  BellRing,
  ShieldCheck,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle,
  CheckCheck,
  Edit2,
  Filter,
} from 'lucide-react';
import { Alert, ComplianceRecord, Project } from '../types/index.ts';

interface AlertsAndComplianceProps {
  alerts: Alert[];
  compliance: ComplianceRecord[];
  projects: Project[];
  selectedProjectId: string;
  onMarkAlertRead: (id: string) => Promise<void>;
  onMarkAllAlertsRead: () => Promise<void>;
  onUpdateCompliance: (id: string, updates: Partial<ComplianceRecord>) => Promise<void>;
}

export const AlertsAndComplianceView: React.FC<AlertsAndComplianceProps> = ({
  alerts,
  compliance,
  projects,
  selectedProjectId,
  onMarkAlertRead,
  onMarkAllAlertsRead,
  onUpdateCompliance,
}) => {
  const [subTab, setSubTab] = useState<'alerts' | 'compliance'>('alerts');
  const [alertFilter, setAlertFilter] = useState<'all' | 'unread'>('unread');
  const [editingRecord, setEditingRecord] = useState<ComplianceRecord | null>(null);
  const [editStatus, setEditStatus] = useState<ComplianceRecord['status']>('Compliant');
  const [editNotes, setEditNotes] = useState('');

  const filteredAlerts = alerts.filter((a) => {
    if (selectedProjectId && a.projectId !== selectedProjectId) return false;
    if (alertFilter === 'unread' && a.isRead) return false;
    return true;
  });

  const filteredCompliance = compliance.filter((c) => {
    if (selectedProjectId && c.projectId !== selectedProjectId) return false;
    return true;
  });

  const openComplianceEdit = (record: ComplianceRecord) => {
    setEditingRecord(record);
    setEditStatus(record.status);
    setEditNotes(record.notes || '');
  };

  const handleSaveCompliance = async () => {
    if (!editingRecord) return;
    try {
      await onUpdateCompliance(editingRecord.id, {
        status: editStatus,
        notes: editNotes,
      });
      setEditingRecord(null);
    } catch (err: any) {
      alert(`Update failed: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Alerts & Compliance Register</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated threshold violation alarms, mitigation escalation, and statutory permit verification
          </p>
        </div>

        {subTab === 'alerts' && (
          <button
            onClick={onMarkAllAlertsRead}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium text-xs shadow-xs transition-colors self-start sm:self-auto"
          >
            <CheckCheck className="w-4 h-4 text-emerald-600" />
            <span>Mark All As Reviewed</span>
          </button>
        )}
      </div>

      {/* Switcher & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-2 text-xs font-semibold">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setSubTab('alerts')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg transition-colors ${
              subTab === 'alerts' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <BellRing className="w-4 h-4" />
            <span>Threshold & Task Alerts ({alerts.filter((a) => !a.isRead).length} unread)</span>
          </button>
          <button
            onClick={() => setSubTab('compliance')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg transition-colors ${
              subTab === 'compliance' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Statutory Compliance Register ({filteredCompliance.length})</span>
          </button>
        </div>

        {subTab === 'alerts' && (
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setAlertFilter('unread')}
              className={`px-2.5 py-1 rounded text-xs transition-all ${
                alertFilter === 'unread' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Unreviewed Only
            </button>
            <button
              onClick={() => setAlertFilter('all')}
              className={`px-2.5 py-1 rounded text-xs transition-all ${
                alertFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              All Alerts
            </button>
          </div>
        )}
      </div>

      {/* Alerts View */}
      {subTab === 'alerts' && (
        <div className="space-y-3">
          {filteredAlerts.map((alert) => {
            const proj = projects.find((p) => p.id === alert.projectId);

            return (
              <div
                key={alert.id}
                className={`bg-white border rounded-xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                  alert.isRead ? 'border-slate-200 opacity-80' : 'border-rose-200 bg-rose-50/20'
                }`}
              >
                <div className="flex items-start space-x-3 text-xs">
                  <span
                    className={`mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                      alert.severity === 'Critical'
                        ? 'bg-rose-100 text-rose-800 border border-rose-300'
                        : alert.severity === 'High'
                        ? 'bg-orange-100 text-orange-800 border border-orange-300'
                        : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}
                  >
                    {alert.severity}
                  </span>

                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-900">{alert.type}</span>
                      <span className="text-slate-400">&bull;</span>
                      <span className="text-emerald-700 font-semibold">{proj?.name || alert.projectId}</span>
                      {alert.parameter && (
                        <span className="font-mono text-[11px] text-slate-600 bg-slate-100 px-1.5 rounded">
                          {alert.parameter}
                        </span>
                      )}
                    </div>
                    <p className="text-slate-700 font-medium leading-relaxed">{alert.message}</p>
                    <div className="flex items-center space-x-3 text-[11px] text-slate-400">
                      <span>{new Date(alert.timestamp).toLocaleString()}</span>
                      {alert.ruleId && <span className="font-mono">Rule Reference: {alert.ruleId}</span>}
                    </div>
                  </div>
                </div>

                <div className="shrink-0 self-end sm:self-auto">
                  {!alert.isRead ? (
                    <button
                      onClick={() => onMarkAlertRead(alert.id)}
                      className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs shadow-xs transition-colors"
                    >
                      Mark Reviewed
                    </button>
                  ) : (
                    <span className="text-[11px] font-semibold text-emerald-600 flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Reviewed</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}

          {filteredAlerts.length === 0 && (
            <div className="p-8 text-center text-xs text-slate-400 bg-white border border-slate-200 rounded-xl italic">
              {alertFilter === 'unread'
                ? 'All alerts have been reviewed! No unread threshold breaches.'
                : 'No alerts logged for this project scope.'}
            </div>
          )}
        </div>
      )}

      {/* Compliance Register View */}
      {subTab === 'compliance' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs divide-y divide-slate-200">
              <thead className="bg-slate-50 text-slate-600 font-semibold">
                <tr>
                  <th className="py-3 px-4">Standard Title & Category</th>
                  <th className="py-3 px-4">Project</th>
                  <th className="py-3 px-4">Statutory Status</th>
                  <th className="py-3 px-4">Audited Compliance Notes</th>
                  <th className="py-3 px-4">Last Evaluated</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredCompliance.map((rec) => {
                  const proj = projects.find((p) => p.id === rec.projectId);

                  return (
                    <tr key={rec.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        <div>
                          <span>{rec.standardTitle}</span>
                          <span className="block text-[10px] text-slate-400 font-normal">{rec.category}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600 truncate max-w-[150px]">
                        {proj ? proj.name : rec.projectId}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded text-[11px] font-bold ${
                            rec.status === 'Compliant'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : rec.status === 'Non-Compliant'
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : rec.status === 'Pending Review'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {rec.status === 'Compliant' ? (
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          ) : rec.status === 'Non-Compliant' ? (
                            <XCircle className="w-3 h-3 text-rose-600" />
                          ) : (
                            <HelpCircle className="w-3 h-3 text-amber-600" />
                          )}
                          <span>{rec.status}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 max-w-[280px] leading-relaxed">
                        {rec.notes || '—'}
                      </td>
                      <td className="py-3 px-4 text-slate-400 text-[11px] whitespace-nowrap">
                        {new Date(rec.lastEvaluated).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => openComplianceEdit(rec)}
                          className="px-2.5 py-1 rounded border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium text-xs transition-colors inline-flex items-center space-x-1"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Audit</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filteredCompliance.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 italic">
                      No statutory compliance records registered.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Compliance Status Modal */}
      {editingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h2 className="text-base font-bold text-slate-900">Audit Compliance Requirement</h2>
              <button onClick={() => setEditingRecord(null)} className="text-slate-400 hover:text-slate-600 font-bold">
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-500 block">Requirement:</span>
                <span className="font-bold text-slate-900">{editingRecord.standardTitle}</span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Compliance Status *</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800"
                >
                  <option value="Compliant">Compliant</option>
                  <option value="Non-Compliant">Non-Compliant</option>
                  <option value="Pending Review">Pending Review</option>
                  <option value="Insufficient Data">Insufficient Data</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Compliance Audit Notes</label>
                <textarea
                  rows={4}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Supporting justification, permit condition cross-references..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setEditingRecord(null)}
                  className="px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveCompliance}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-xs"
                >
                  Save Verification
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
