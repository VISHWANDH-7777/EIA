import React from 'react';
import {
  LayoutDashboard,
  FolderGit2,
  Activity,
  MapPin,
  ShieldAlert,
  CheckSquare,
  ClipboardList,
  BellRing,
  Plus,
  SlidersHorizontal,
} from 'lucide-react';
import { Project } from '../types/index.ts';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  projects: Project[];
  selectedProjectId: string;
  onSelectProject: (id: string) => void;
  unreadAlertsCount: number;
  onOpenRecordModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  projects,
  selectedProjectId,
  onSelectProject,
  unreadAlertsCount,
  onOpenRecordModal,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'projects', label: 'Projects', icon: FolderGit2 },
    { id: 'monitoring', label: 'Monitoring', icon: Activity },
    { id: 'map', label: 'GIS Map', icon: MapPin },
    { id: 'risk', label: 'Risk Assessment', icon: ShieldAlert },
    { id: 'mitigation', label: 'Mitigation', icon: CheckSquare },
    { id: 'stakeholders', label: 'Inspections & Feedback', icon: ClipboardList },
    { id: 'alerts', label: 'Alerts & Compliance', icon: BellRing, badge: unreadAlertsCount },
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & System Title */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onSelectTab('dashboard')}>
            <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-xs">
              <ShieldAlert className="w-6 h-6 text-emerald-100" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight text-slate-900">Smart EIA</span>
                <span className="text-[11px] font-semibold uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Rule-Based Engine
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Environmental Impact Assessment & Continuous Monitoring
              </p>
            </div>
          </div>

          {/* Scope Selector & Quick Action */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
              <label htmlFor="project-scope-select" className="font-medium hidden md:inline text-slate-600">
                Scope:
              </label>
              <select
                id="project-scope-select"
                value={selectedProjectId}
                onChange={(e) => onSelectProject(e.target.value)}
                className="bg-transparent font-medium text-slate-800 focus:outline-none cursor-pointer pr-1"
              >
                <option value="">All Projects ({projects.length})</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name.length > 32 ? p.name.slice(0, 32) + '...' : p.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={onOpenRecordModal}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Record Measurement</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-100 overflow-x-auto scrollbar-none">
        <nav className="flex space-x-1 py-1.5 min-w-max" aria-label="Main Navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-300' : 'text-slate-500'}`} />
                <span>{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                      isActive ? 'bg-rose-500 text-white' : 'bg-rose-100 text-rose-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
