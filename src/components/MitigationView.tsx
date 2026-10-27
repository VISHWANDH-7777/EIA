import React, { useState } from 'react';
import {
  CheckSquare,
  Plus,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Upload,
  FileText,
  User,
  Calendar,
  History,
  AlertCircle,
} from 'lucide-react';
import { MitigationAction, Project } from '../types/index.ts';

interface MitigationViewProps {
  mitigations: MitigationAction[];
  projects: Project[];
  selectedProjectId: string;
  onCreateMitigation: (data: Partial<MitigationAction>) => Promise<void>;
  onUpdateMitigation: (id: string, updates: Partial<MitigationAction> & { actionLog?: string }) => Promise<void>;
  onUploadEvidence: (id: string, file: File) => Promise<void>;
}

export const MitigationView: React.FC<MitigationViewProps> = ({
  mitigations,
  projects,
  selectedProjectId,
  onCreateMitigation,
  onUpdateMitigation,
  onUploadEvidence,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedActionHistory, setSelectedActionHistory] = useState<MitigationAction | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [projectId, setProjectId] = useState(selectedProjectId || projects[0]?.id || '');
  const [description, setDescription] = useState('');
  const [responsiblePerson, setResponsiblePerson] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Upload state
  const [uploadingActionId, setUploadingActionId] = useState<string | null>(null);

  const todayStr = new Date().toISOString().slice(0, 10);

  const filteredMitigations = mitigations.filter((m) => {
    if (selectedProjectId && m.projectId !== selectedProjectId) return false;
    if (filterStatus === 'all') return true;
    if (filterStatus === 'overdue') {
      return m.status !== 'Completed' && m.dueDate < todayStr;
    }
    return m.status === filterStatus;
  });

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !responsiblePerson.trim() || !dueDate) {
      setFormError('Title, responsible person, and due date are required.');
      return;
    }
    setFormError('');
    setIsSubmitting(true);
    try {
      await onCreateMitigation({
        projectId: projectId || projects[0]?.id,
        title,
        description,
        responsiblePerson,
        dueDate,
        status: 'Pending',
      });
      setIsModalOpen(false);
      setTitle('');
      setDescription('');
      setResponsiblePerson('');
      setDueDate('');
    } catch (err: any) {
      setFormError(err.message || 'Failed to create mitigation task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (action: MitigationAction, newStatus: MitigationAction['status']) => {
    try {
      await onUpdateMitigation(action.id, {
        status: newStatus,
        actionLog: `Status updated from ${action.status} to ${newStatus}`,
      });
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleFileUpload = async (actionId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingActionId(actionId);
    try {
      await onUploadEvidence(actionId, file);
    } catch (err: any) {
      alert(`Evidence upload failed: ${err.message}`);
    } finally {
      setUploadingActionId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Mitigation Tracker</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Remediation tasks, statutory compliance deadlines, responsible leads, and verifiable evidence
          </p>
        </div>
        <button
          onClick={() => {
            setFormError('');
            setIsModalOpen(true);
          }}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Mitigation Action</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs font-semibold">
        {[
          { id: 'all', label: `All Tasks (${mitigations.length})` },
          { id: 'Pending', label: 'Pending' },
          { id: 'In Progress', label: 'In Progress' },
          { id: 'Completed', label: 'Completed' },
          {
            id: 'overdue',
            label: `Overdue Tasks (${
              mitigations.filter((m) => m.status !== 'Completed' && m.dueDate < todayStr).length
            })`,
          },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterStatus(tab.id)}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              filterStatus === tab.id
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Mitigation Actions List */}
      <div className="space-y-4">
        {filteredMitigations.map((action) => {
          const isOverdue = action.status !== 'Completed' && action.dueDate < todayStr;
          const proj = projects.find((p) => p.id === action.projectId);

          return (
            <div
              key={action.id}
              className={`bg-white border rounded-xl p-5 shadow-xs space-y-3.5 transition-all ${
                isOverdue ? 'border-rose-300' : 'border-slate-200'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2 flex-wrap">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        action.status === 'Completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : action.status === 'In Progress'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {action.status}
                    </span>
                    {isOverdue && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200 flex items-center space-x-1">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Overdue</span>
                      </span>
                    )}
                    <span className="text-xs font-semibold text-emerald-700">
                      {proj?.name || action.projectId}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">{action.title}</h3>
                </div>

                {/* Status Toggles */}
                <div className="flex items-center space-x-1.5 shrink-0">
                  {action.status !== 'In Progress' && action.status !== 'Completed' && (
                    <button
                      onClick={() => handleStatusChange(action, 'In Progress')}
                      className="px-2.5 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-xs font-medium transition-colors"
                    >
                      Start Task
                    </button>
                  )}
                  {action.status !== 'Completed' && (
                    <button
                      onClick={() => handleStatusChange(action, 'Completed')}
                      className="px-2.5 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-medium shadow-xs transition-colors flex items-center space-x-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Mark Complete</span>
                    </button>
                  )}
                  {action.status === 'Completed' && (
                    <button
                      onClick={() => handleStatusChange(action, 'In Progress')}
                      className="px-2.5 py-1 rounded border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-medium transition-colors"
                    >
                      Reopen
                    </button>
                  )}
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">{action.description}</p>

              {/* Metadata strip */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-2 border-t border-slate-100">
                <div className="flex items-center space-x-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>Assignee: <strong className="text-slate-800">{action.responsiblePerson}</strong></span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span className={isOverdue ? 'text-rose-600 font-bold' : ''}>
                    Due: {action.dueDate}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedActionHistory(action)}
                  className="text-slate-500 hover:text-slate-900 inline-flex items-center space-x-1 underline text-[11px]"
                >
                  <History className="w-3.5 h-3.5" />
                  <span>{action.history?.length || 1} Audit Logs</span>
                </button>
              </div>

              {/* Evidence Section */}
              <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-semibold text-slate-700 block mb-1">Supporting Verifiable Evidence:</span>
                  {action.evidenceFiles && action.evidenceFiles.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {action.evidenceFiles.map((f, idx) => (
                        <a
                          key={idx}
                          href={f.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium border border-slate-200"
                        >
                          <FileText className="w-3 h-3 text-emerald-600" />
                          <span className="truncate max-w-[150px]">{f.name}</span>
                        </a>
                      ))}
                    </div>
                  ) : (
                    <span className="text-slate-400 italic text-[11px]">No evidence documents uploaded yet.</span>
                  )}
                </div>

                {/* Upload button */}
                <label className="cursor-pointer inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-medium shrink-0 self-start sm:self-auto">
                  <Upload className="w-3.5 h-3.5 text-slate-500" />
                  <span>{uploadingActionId === action.id ? 'Uploading...' : 'Upload Evidence'}</span>
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => handleFileUpload(action.id, e)}
                  />
                </label>
              </div>
            </div>
          );
        })}

        {filteredMitigations.length === 0 && (
          <div className="p-8 text-center text-xs text-slate-400 bg-white border border-slate-200 rounded-xl italic">
            No mitigation actions matching current filter.
          </div>
        )}
      </div>

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h2 className="text-base font-bold text-slate-900">Create Remediation Mitigation Action</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">
                ✕
              </button>
            </div>

            {formError && (
              <div className="p-2.5 rounded bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Project *</label>
                <select
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Action Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Deploy Mist Suppression Cannons on Sector 7 Cut"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description & Scope</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Operational instructions, target receptors, and required equipment..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Responsible Person / Lead *</label>
                  <input
                    type="text"
                    required
                    value={responsiblePerson}
                    onChange={(e) => setResponsiblePerson(e.target.value)}
                    placeholder="e.g. Eng. Sarah Lin (HSE Lead)"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Due Date *</label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-xs"
                >
                  {isSubmitting ? 'Creating...' : 'Create Action'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Audit History Modal */}
      {selectedActionHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h2 className="text-sm font-bold text-slate-900">Mitigation Audit Log</h2>
              <button
                onClick={() => setSelectedActionHistory(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>
            <div className="space-y-2 text-xs">
              <p className="font-semibold text-slate-800">{selectedActionHistory.title}</p>
              <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
                {selectedActionHistory.history?.map((h, i) => (
                  <div key={i} className="py-2 space-y-0.5">
                    <p className="text-slate-800 font-medium">{h.action}</p>
                    <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                      <span>User: {h.user}</span>
                      <span>{new Date(h.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="pt-3 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedActionHistory(null)}
                className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
