import React, { useState } from 'react';
import {
  ClipboardList,
  MessageSquare,
  Plus,
  Camera,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Upload,
  User,
  Calendar,
  Send,
  Eye,
  FileText,
} from 'lucide-react';
import { Inspection, PublicFeedback, Project } from '../types/index.ts';

interface InspectionsAndFeedbackProps {
  inspections: Inspection[];
  feedback: PublicFeedback[];
  projects: Project[];
  selectedProjectId: string;
  onCreateInspection: (data: Partial<Inspection>) => Promise<void>;
  onUpdateInspection: (id: string, updates: Partial<Inspection>) => Promise<void>;
  onUploadInspectionPhoto: (id: string, file: File) => Promise<void>;
  onCreateFeedback: (data: Partial<PublicFeedback>) => Promise<void>;
  onUpdateFeedback: (id: string, updates: Partial<PublicFeedback>) => Promise<void>;
}

export const InspectionsAndFeedbackView: React.FC<InspectionsAndFeedbackProps> = ({
  inspections,
  feedback,
  projects,
  selectedProjectId,
  onCreateInspection,
  onUpdateInspection,
  onUploadInspectionPhoto,
  onCreateFeedback,
  onUpdateFeedback,
}) => {
  const [activeTab, setActiveTab] = useState<'inspections' | 'feedback'>('inspections');

  const [isInspModalOpen, setIsInspModalOpen] = useState(false);
  const [inspProjectId, setInspProjectId] = useState(selectedProjectId || projects[0]?.id || '');
  const [inspectorName, setInspectorName] = useState('');
  const [inspectionDate, setInspectionDate] = useState(new Date().toISOString().slice(0, 10));
  const [observations, setObservations] = useState('');
  const [complianceVerdict, setComplianceVerdict] = useState<Inspection['complianceVerdict']>('Compliant');
  const [inspStatus, setInspStatus] = useState<Inspection['status']>('Submitted');
  const [inspSubmitting, setInspSubmitting] = useState(false);

  const [reviewingItem, setReviewingItem] = useState<{ type: 'inspection' | 'feedback'; item: any } | null>(null);
  const [reviewNote, setReviewNote] = useState('');

  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [fbProjectId, setFbProjectId] = useState(selectedProjectId || projects[0]?.id || '');
  const [stakeholderName, setStakeholderName] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState<PublicFeedback['category']>('Dust & Air');
  const [comment, setComment] = useState('');
  const [fbSubmitting, setFbSubmitting] = useState(false);

  const filteredInspections = inspections.filter(
    (i) => !selectedProjectId || i.projectId === selectedProjectId
  );
  const filteredFeedback = feedback.filter(
    (f) => !selectedProjectId || f.projectId === selectedProjectId
  );

  const handleCreateInspection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inspectorName.trim() || !observations.trim()) return;
    setInspSubmitting(true);
    try {
      await onCreateInspection({
        projectId: inspProjectId || projects[0]?.id,
        inspectorName,
        inspectionDate,
        observations,
        complianceVerdict,
        status: inspStatus,
      });
      setIsInspModalOpen(false);
      setInspectorName('');
      setObservations('');
    } catch (err: any) {
      alert(err.message || 'Inspection creation failed');
    } finally {
      setInspSubmitting(false);
    }
  };

  const handleCreateFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stakeholderName.trim() || !comment.trim()) return;
    setFbSubmitting(true);
    try {
      await onCreateFeedback({
        projectId: fbProjectId || projects[0]?.id,
        stakeholderName,
        email,
        category,
        comment,
      });
      setIsFeedbackModalOpen(false);
      setStakeholderName('');
      setEmail('');
      setComment('');
    } catch (err: any) {
      alert(err.message || 'Feedback submission failed');
    } finally {
      setFbSubmitting(false);
    }
  };

  const handlePhotoUpload = async (inspectionId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await onUploadInspectionPhoto(inspectionId, file);
    } catch (err: any) {
      alert(err.message || 'Photo upload failed');
    }
  };

  const handleSaveReview = async () => {
    if (!reviewingItem) return;
    try {
      if (reviewingItem.type === 'inspection') {
        await onUpdateInspection(reviewingItem.item.id, {
          status: 'Reviewed',
          reviewNotes: reviewNote,
        });
      } else {
        await onUpdateFeedback(reviewingItem.item.id, {
          status: 'Addressed',
          responseNote: reviewNote,
        });
      }
      setReviewingItem(null);
      setReviewNote('');
    } catch (err: any) {
      alert(err.message || 'Review update failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Field Inspections & Public Feedback
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            On-site compliance verification, photographic evidence, and stakeholder grievance resolution
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {activeTab === 'inspections' ? (
            <button
              onClick={() => setIsInspModalOpen(true)}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Log Field Inspection</span>
            </button>
          ) : (
            <button
              onClick={() => setIsFeedbackModalOpen(true)}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-medium text-xs shadow-xs transition-colors"
            >
              <Send className="w-4 h-4" />
              <span>Submit Public Feedback</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-2 border-b border-slate-200 text-xs font-semibold pb-2">
        <button
          onClick={() => setActiveTab('inspections')}
          className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg transition-colors ${
            activeTab === 'inspections'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          <span>Statutory Field Inspections ({filteredInspections.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('feedback')}
          className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg transition-colors ${
            activeTab === 'feedback'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Community & Public Feedback ({filteredFeedback.length})</span>
        </button>
      </div>

      {activeTab === 'inspections' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredInspections.map((insp) => {
              const proj = projects.find((p) => p.id === insp.projectId);
              return (
                <div
                  key={insp.id}
                  className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3.5 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          insp.complianceVerdict === 'Compliant'
                            ? 'bg-emerald-100 text-emerald-800'
                            : insp.complianceVerdict === 'Non-Compliant'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        Verdict: {insp.complianceVerdict}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          insp.status === 'Reviewed'
                            ? 'bg-slate-100 text-slate-800 border border-slate-300'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}
                      >
                        Status: {insp.status}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-bold text-slate-900 text-sm leading-snug">
                        {insp.inspectorName}
                      </h3>
                      <p className="text-xs text-emerald-700 font-medium">
                        {proj?.name || insp.projectId} &bull; {insp.inspectionDate}
                      </p>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                      {insp.observations}
                    </p>

                    {insp.reviewNotes && (
                      <div className="p-2.5 rounded bg-emerald-50/60 border border-emerald-100 text-xs text-emerald-900">
                        <strong className="block text-[10px] uppercase font-bold text-emerald-700">
                          Reviewer Audit Note:
                        </strong>
                        {insp.reviewNotes}
                      </div>
                    )}

                    <div>
                      <span className="block text-xs font-semibold text-slate-700 mb-1">
                        Site Photographs:
                      </span>
                      {insp.photos && insp.photos.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {insp.photos.map((p, idx) => (
                            <a
                              key={idx}
                              href={p.url}
                              target="_blank"
                              rel="noreferrer"
                              className="w-14 h-14 rounded-lg border border-slate-200 overflow-hidden bg-slate-100 flex items-center justify-center hover:opacity-90"
                            >
                              <img
                                src={p.url}
                                alt={p.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as any).src =
                                    'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="%2394a3b8"><rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/></svg>';
                                }}
                              />
                            </a>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">
                          No photographs attached to record.
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                    <label className="cursor-pointer inline-flex items-center space-x-1.5 px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium">
                      <Camera className="w-3.5 h-3.5 text-slate-500" />
                      <span>Attach Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handlePhotoUpload(insp.id, e)}
                      />
                    </label>

                    {insp.status !== 'Reviewed' && (
                      <button
                        onClick={() => {
                          setReviewingItem({ type: 'inspection', item: insp });
                          setReviewNote('');
                        }}
                        className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-xs"
                      >
                        Review Inspection
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {filteredInspections.length === 0 && (
            <div className="p-8 text-center text-xs text-slate-400 bg-white border border-slate-200 rounded-xl italic">
              No field inspections logged for this project scope.
            </div>
          )}
        </div>
      )}

      {activeTab === 'feedback' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredFeedback.map((fb) => {
              const proj = projects.find((p) => p.id === fb.projectId);
              return (
                <div
                  key={fb.id}
                  className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                        {fb.category}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          fb.status === 'Addressed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : fb.status === 'Under Review'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {fb.status}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-bold text-slate-900 text-sm leading-snug">
                        {fb.stakeholderName}
                      </h3>
                      <p className="text-xs text-slate-400">
                        {fb.email || 'Community Member'} &bull; {proj?.name || fb.projectId}
                      </p>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                      &quot;{fb.comment}&quot;
                    </p>

                    {fb.responseNote && (
                      <div className="p-2.5 rounded bg-sky-50 border border-sky-100 text-xs text-sky-900">
                        <strong className="block text-[10px] uppercase font-bold text-sky-700">
                          Official Resolution Response:
                        </strong>
                        {fb.responseNote}
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-400">
                      Logged {new Date(fb.createdAt).toLocaleDateString()}
                    </span>
                    {fb.status !== 'Addressed' && (
                      <button
                        onClick={() => {
                          setReviewingItem({ type: 'feedback', item: fb });
                          setReviewNote('');
                        }}
                        className="px-3 py-1 rounded bg-sky-600 hover:bg-sky-700 text-white font-medium shadow-xs"
                      >
                        Address & Respond
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {filteredFeedback.length === 0 && (
            <div className="p-8 text-center text-xs text-slate-400 bg-white border border-slate-200 rounded-xl italic">
              No public feedback entries submitted.
            </div>
          )}
        </div>
      )}

      {isInspModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h2 className="text-base font-bold text-slate-900">Log Field Inspection Record</h2>
              <button onClick={() => setIsInspModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateInspection} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Project *</label>
                <select
                  value={inspProjectId}
                  onChange={(e) => setInspProjectId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Inspector Name & Credential *</label>
                  <input
                    type="text"
                    required
                    value={inspectorName}
                    onChange={(e) => setInspectorName(e.target.value)}
                    placeholder="e.g. Dr. Arthur Pendelton (Govt Auditor)"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Inspection Date *</label>
                  <input
                    type="date"
                    required
                    value={inspectionDate}
                    onChange={(e) => setInspectionDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Compliance Verdict *</label>
                <select
                  value={complianceVerdict}
                  onChange={(e) => setComplianceVerdict(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800"
                >
                  <option value="Compliant">Compliant</option>
                  <option value="Non-Compliant">Non-Compliant</option>
                  <option value="Pending Review">Pending Review</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Field Observations & Findings *</label>
                <textarea
                  rows={4}
                  required
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  placeholder="Record on-site findings: perimeter sediment fencing, dust curtains, noise barriers, water runoff clarity..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsInspModalOpen(false)}
                  className="px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={inspSubmitting}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-xs"
                >
                  {inspSubmitting ? 'Logging...' : 'Submit Inspection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isFeedbackModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h2 className="text-base font-bold text-slate-900">Submit Public / Stakeholder Feedback</h2>
              <button onClick={() => setIsFeedbackModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateFeedback} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Project *</label>
                <select
                  value={fbProjectId}
                  onChange={(e) => setFbProjectId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Your Name / Organization *</label>
                  <input
                    type="text"
                    required
                    value={stakeholderName}
                    onChange={(e) => setStakeholderName(e.target.value)}
                    placeholder="e.g. Local Residents Group"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Contact Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.org"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800"
                >
                  <option value="Dust & Air">Dust & Air Pollution</option>
                  <option value="Noise Impact">Noise & Vibration Impact</option>
                  <option value="Water & Drainage">Water & Drainage Discharges</option>
                  <option value="Traffic & Safety">Construction Traffic & Safety</option>
                  <option value="General Query">General Environmental Query</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Your Observations / Query *</label>
                <textarea
                  rows={4}
                  required
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Describe your environmental observations, date and time, affected locations..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsFeedbackModalOpen(false)}
                  className="px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={fbSubmitting}
                  className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-medium shadow-xs"
                >
                  {fbSubmitting ? 'Sending...' : 'Submit Feedback'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {reviewingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h2 className="text-base font-bold text-slate-900">
                {reviewingItem.type === 'inspection' ? 'Official Inspection Review' : 'Respond to Feedback'}
              </h2>
              <button onClick={() => setReviewingItem(null)} className="text-slate-400 hover:text-slate-600 font-bold">
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-600">
                {reviewingItem.type === 'inspection'
                  ? `Auditing report submitted by ${reviewingItem.item.inspectorName}`
                  : `Replying to grievance from ${reviewingItem.item.stakeholderName}`}
              </p>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Official Review / Resolution Note *</label>
                <textarea
                  rows={4}
                  required
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                  placeholder="Record formal corrective audit response or stakeholder letter details..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setReviewingItem(null)}
                  className="px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveReview}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-xs"
                >
                  Confirm & Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
