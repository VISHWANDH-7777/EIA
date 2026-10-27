import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  FileCheck2,
  Cpu,
  History,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import { Project, RiskAssessment } from '../types/index.ts';

interface RiskAssessmentViewProps {
  projects: Project[];
  selectedProjectId: string;
  onSelectProjectScope: (id: string) => void;
  riskHistory: RiskAssessment[];
  onRunAssessment: (projectId: string) => Promise<RiskAssessment>;
  onNavigateTab: (tab: string) => void;
}

export const RiskAssessmentView: React.FC<RiskAssessmentViewProps> = ({
  projects,
  selectedProjectId,
  onSelectProjectScope,
  riskHistory,
  onRunAssessment,
  onNavigateTab,
}) => {
  const [targetProjectId, setTargetProjectId] = useState<string>(
    selectedProjectId || (projects[0]?.id || '')
  );
  const [currentAssessment, setCurrentAssessment] = useState<RiskAssessment | null>(
    riskHistory.find((r) => r.projectId === targetProjectId) || riskHistory[0] || null
  );
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evalError, setEvalError] = useState('');

  const handleEvaluate = async () => {
    if (!targetProjectId) {
      setEvalError('Please select a project to evaluate.');
      return;
    }
    setEvalError('');
    setIsEvaluating(true);
    try {
      const result = await onRunAssessment(targetProjectId);
      setCurrentAssessment(result);
    } catch (err: any) {
      setEvalError(err.message || 'Risk evaluation failed');
    } finally {
      setIsEvaluating(false);
    }
  };

  const selectedProj = projects.find((p) => p.id === targetProjectId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Environmental Risk Assessment
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Deterministic rule-based risk evaluation against statutory environmental standards
          </p>
        </div>

        {/* Methodology Assurance Badge */}
        <div className="inline-flex items-center space-x-2 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg text-emerald-800 text-xs font-semibold">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Statutory Deterministic Rule Matrix (Zero AI / Non-Probabilistic)</span>
        </div>
      </div>

      {/* Evaluation Control Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <label className="text-xs font-bold text-slate-700">Select Project to Evaluate:</label>
          <select
            value={targetProjectId}
            onChange={(e) => {
              setTargetProjectId(e.target.value);
              const found = riskHistory.find((r) => r.projectId === e.target.value);
              if (found) setCurrentAssessment(found);
            }}
            className="px-3 py-2 rounded-lg border border-slate-300 text-xs font-medium text-slate-800 bg-slate-50 focus:outline-none min-w-[280px]"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.status})
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleEvaluate}
          disabled={isEvaluating}
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs shadow-xs transition-colors disabled:opacity-50"
        >
          <ShieldAlert className="w-4 h-4" />
          <span>{isEvaluating ? 'Evaluating Rules...' : 'Execute Rule Assessment'}</span>
        </button>
      </div>

      {evalError && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
          {evalError}
        </div>
      )}

      {/* Main Assessment Result Display */}
      {currentAssessment ? (
        <div className="space-y-5">
          {/* Risk Level Banner */}
          <div
            className={`border rounded-xl p-6 shadow-xs ${
              currentAssessment.riskLevel === 'High'
                ? 'bg-rose-50/70 border-rose-200 text-rose-950'
                : currentAssessment.riskLevel === 'Medium'
                ? 'bg-amber-50/70 border-amber-200 text-amber-950'
                : currentAssessment.riskLevel === 'Low'
                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                : 'bg-slate-50 border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Calculated Risk Classification
                  </span>
                  <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded border border-slate-200">
                    {currentAssessment.ruleSetVersion}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <span
                    className={`text-3xl font-extrabold tracking-tight ${
                      currentAssessment.riskLevel === 'High'
                        ? 'text-rose-700'
                        : currentAssessment.riskLevel === 'Medium'
                        ? 'text-amber-700'
                        : currentAssessment.riskLevel === 'Low'
                        ? 'text-emerald-700'
                        : 'text-slate-700'
                    }`}
                  >
                    {currentAssessment.riskLevel} Risk
                  </span>
                  {currentAssessment.riskLevel === 'High' ? (
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-200 text-rose-800">
                      Immediate Action Required
                    </span>
                  ) : currentAssessment.riskLevel === 'Medium' ? (
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-200 text-amber-800">
                      Monitoring & Mitigation Alert
                    </span>
                  ) : currentAssessment.riskLevel === 'Low' ? (
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-200 text-emerald-800">
                      Within Baseline Bounds
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-200 text-slate-800">
                      Data Incomplete
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-700 max-w-3xl leading-relaxed mt-2">
                  {currentAssessment.summary}
                </p>
              </div>

              {/* Assessment Statistics */}
              <div className="flex items-center space-x-4 bg-white/80 p-3 rounded-lg border border-slate-200/80 shrink-0 text-xs">
                <div className="text-center px-2">
                  <span className="block text-[10px] text-slate-400 font-semibold uppercase">
                    Evaluated
                  </span>
                  <span className="font-bold text-slate-900 text-base">
                    {currentAssessment.totalEvaluated}
                  </span>
                </div>
                <div className="text-center px-2 border-l border-slate-200">
                  <span className="block text-[10px] text-slate-400 font-semibold uppercase">
                    Breaches
                  </span>
                  <span className="font-bold text-rose-600 text-base">
                    {currentAssessment.breachCount}
                  </span>
                </div>
                <div className="text-center px-2 border-l border-slate-200">
                  <span className="block text-[10px] text-slate-400 font-semibold uppercase">
                    Critical
                  </span>
                  <span className="font-bold text-rose-700 text-base">
                    {currentAssessment.criticalBreachCount}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Breach Details & Rule-Based Mitigations */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Parameter Breaches & Predefined Statutory Mitigations
                </h2>
                <p className="text-xs text-slate-500">
                  Every threshold breach is explicitly mapped to documented environmental regulations and actionable remediations
                </p>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                {currentAssessment.breaches.length} Breach Items
              </span>
            </div>

            {currentAssessment.breaches.length > 0 ? (
              <div className="space-y-3.5">
                {currentAssessment.breaches.map((breach, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3 text-xs"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 pb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-sm text-slate-900">{breach.parameter}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-200 text-slate-700">
                          {breach.ruleId}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">({breach.category} quality)</span>
                      </div>
                      <div className="flex items-center space-x-3 font-mono">
                        <span className="text-rose-600 font-bold">
                          Recorded: {breach.readingValue} {breach.unit}
                        </span>
                        <span className="text-slate-400">|</span>
                        <span className="text-slate-600">{breach.thresholdValue}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Violation Explanation */}
                      <div className="space-y-1">
                        <span className="font-semibold text-slate-700 flex items-center space-x-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                          <span>Statutory Rule Citation</span>
                        </span>
                        <p className="text-slate-600 text-xs leading-relaxed">
                          {breach.explanation}
                        </p>
                        <p className="text-[11px] text-slate-400 italic">
                          Standard: {breach.standardReference}
                        </p>
                      </div>

                      {/* Prescribed Predefined Mitigation */}
                      <div className="space-y-1 bg-white p-3 rounded-lg border border-slate-200">
                        <span className="font-semibold text-emerald-800 flex items-center space-x-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Mandated Mitigation Action</span>
                        </span>
                        <p className="text-slate-700 text-xs leading-relaxed font-medium">
                          {breach.recommendedMitigation}
                        </p>
                        <div className="pt-2">
                          <button
                            onClick={() => onNavigateTab('mitigation')}
                            className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 inline-flex items-center space-x-1"
                          >
                            <span>Open in Mitigation Tracker</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-lg">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <p className="font-semibold text-slate-800">No Regulatory Breaches Detected</p>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  All active parameters are operating within statutory environmental thresholds.
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-400 italic text-xs">
          Select a project above and click &quot;Execute Rule Assessment&quot; to compute environmental compliance risk.
        </div>
      )}

      {/* Historical Assessment Log */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
        <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
          <History className="w-4 h-4 text-slate-400" />
          <span>Previous Assessment Audit Records</span>
        </h3>

        <div className="divide-y divide-slate-100 text-xs">
          {riskHistory.slice(0, 5).map((hist) => {
            const proj = projects.find((p) => p.id === hist.projectId);
            return (
              <div
                key={hist.id}
                onClick={() => setCurrentAssessment(hist)}
                className="py-2.5 flex items-center justify-between hover:bg-slate-50 px-2 rounded cursor-pointer transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      hist.riskLevel === 'High'
                        ? 'bg-rose-100 text-rose-800'
                        : hist.riskLevel === 'Medium'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {hist.riskLevel}
                  </span>
                  <span className="font-medium text-slate-800">{proj?.name || hist.projectId}</span>
                  <span className="text-slate-400 text-[11px]">({hist.breachCount} breaches)</span>
                </div>
                <div className="text-slate-400 text-[11px]">
                  {new Date(hist.timestamp).toLocaleString([], {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
