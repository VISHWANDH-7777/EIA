import React, { useState } from 'react';
import {
  FolderGit2,
  Plus,
  MapPin,
  Calendar,
  Layers,
  Edit2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Radio,
} from 'lucide-react';
import { Project, MonitoringStation } from '../types/index.ts';

interface ProjectsViewProps {
  projects: Project[];
  stations: MonitoringStation[];
  onRegisterProject: (project: Partial<Project>) => Promise<void>;
  onUpdateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  onSelectProjectScope: (id: string) => void;
  onNavigateTab: (tab: string) => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  projects,
  stations,
  onRegisterProject,
  onUpdateProject,
  onSelectProjectScope,
  onNavigateTab,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [type, setType] = useState('Transportation Infrastructure');
  const [location, setLocation] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<Project['status']>('Active');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openCreateModal = () => {
    setEditingProject(null);
    setName('');
    setType('Transportation Infrastructure');
    setLocation('');
    setLatitude('37.7749');
    setLongitude('-122.4194');
    setDescription('');
    setStatus('Active');
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (proj: Project) => {
    setEditingProject(proj);
    setName(proj.name);
    setType(proj.type);
    setLocation(proj.location);
    setLatitude(proj.latitude.toString());
    setLongitude(proj.longitude.toString());
    setDescription(proj.description || '');
    setStatus(proj.status);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!name.trim() || !location.trim()) {
      setFormError('Project name and location are required.');
      return;
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    if (isNaN(lat) || lat < -90 || lat > 90) {
      setFormError('Latitude must be a valid number between -90 and 90.');
      return;
    }
    if (isNaN(lng) || lng < -180 || lng > 180) {
      setFormError('Longitude must be a valid number between -180 and 180.');
      return;
    }

    try {
      setIsSubmitting(true);
      if (editingProject) {
        await onUpdateProject(editingProject.id, {
          name,
          type,
          location,
          latitude: lat,
          longitude: lng,
          description,
          status,
        });
      } else {
        await onRegisterProject({
          name,
          type,
          location,
          latitude: lat,
          longitude: lng,
          description,
          status,
        });
      }
      setIsModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Failed to save project');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Project Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Registered environmental impact projects, geographic boundaries, and status tracking
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Project</span>
        </button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {projects.map((proj) => {
          const projStations = stations.filter((s) => s.projectId === proj.id);
          return (
            <div
              key={proj.id}
              className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      proj.status === 'Active'
                        ? 'bg-emerald-100 text-emerald-800'
                        : proj.status === 'Planning'
                        ? 'bg-blue-100 text-blue-800'
                        : proj.status === 'Under Review'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {proj.status}
                  </span>
                  <button
                    onClick={() => openEditModal(proj)}
                    className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                    title="Edit project"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 text-sm leading-snug">{proj.name}</h3>
                  <p className="text-xs text-emerald-700 font-medium mt-0.5">{proj.type}</p>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {proj.description || 'No detailed description specified.'}
                </p>

                <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs text-slate-500">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{proj.location}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-[11px] font-mono text-slate-400">
                    <span>GPS: {proj.latitude.toFixed(4)}, {proj.longitude.toFixed(4)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Radio className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <span>{projStations.length} active sensor stations</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => {
                    onSelectProjectScope(proj.id);
                    onNavigateTab('monitoring');
                  }}
                  className="flex-1 px-2.5 py-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium text-center transition-colors"
                >
                  View Monitoring
                </button>
                <button
                  onClick={() => {
                    onSelectProjectScope(proj.id);
                    onNavigateTab('map');
                  }}
                  className="px-2.5 py-1.5 rounded border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-900 text-xs font-medium text-center transition-colors"
                >
                  On Map
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h2 className="text-base font-bold text-slate-900">
                {editingProject ? 'Edit Project Details' : 'Register New EIA Project'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Project Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Metro Rail Line 4 Extension"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Project Type *</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="Transportation Infrastructure">Transportation Infrastructure</option>
                    <option value="Marine & Water Resources">Marine & Water Resources</option>
                    <option value="Renewable Energy">Renewable Energy</option>
                    <option value="Urban Commercial Development">Urban Commercial Development</option>
                    <option value="Industrial & Chemical">Industrial & Chemical</option>
                    <option value="Mining & Quarrying">Mining & Quarrying</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Lifecycle Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="Planning">Planning</option>
                    <option value="Active">Active</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Geographic Location / Site *</label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Metro District Sector 7 Corridor"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Latitude (-90 to 90) *</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    placeholder="37.7749"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800 text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Longitude (-180 to 180) *</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    placeholder="-122.4194"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800 text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Project Scope & EIA Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Environmental baseline parameters, sensitive receptors, and operational phases..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs shadow-xs transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : editingProject ? 'Save Changes' : 'Register Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
