import React, { useState } from 'react';
import {
  Activity,
  Plus,
  Filter,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Radio,
  UserCheck,
  Cpu,
  Layers,
} from 'lucide-react';
import { EnvironmentalReading, MonitoringStation, Project } from '../types/index.ts';
import { DEFAULT_THRESHOLDS } from '../utils/riskRules.ts';

interface MonitoringViewProps {
  readings: EnvironmentalReading[];
  stations: MonitoringStation[];
  projects: Project[];
  selectedProjectId: string;
  onOpenRecordModal: () => void;
}

export const MonitoringView: React.FC<MonitoringViewProps> = ({
  readings,
  stations,
  projects,
  selectedProjectId,
  onOpenRecordModal,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'air' | 'water' | 'noise'>('all');
  const [selectedChartParam, setSelectedChartParam] = useState<string>('PM2.5');

  const filteredReadings = readings.filter((r) => {
    if (selectedProjectId && r.projectId !== selectedProjectId) return false;
    if (selectedCategory !== 'all' && r.category !== selectedCategory) return false;
    return true;
  });

  const chartReadings = readings
    .filter((r) => {
      if (selectedProjectId && r.projectId !== selectedProjectId) return false;
      return r.parameter === selectedChartParam && typeof r.value === 'number';
    })
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    .slice(-15);

  const thresholdConfig = DEFAULT_THRESHOLDS[selectedChartParam];
  const maxVal = Math.max(
    ...chartReadings.map((r) => r.value),
    thresholdConfig?.maxLimit || 50,
    thresholdConfig?.minLimit ? thresholdConfig.minLimit * 1.5 : 10
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Environmental Monitoring</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Multi-parameter ambient readings, calibrated sensor feeds, and regulatory threshold compliance
          </p>
        </div>
        <button
          onClick={onOpenRecordModal}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Record Measurement</span>
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>Historical Trend & Statutory Threshold Comparison</span>
            </h2>
            <p className="text-xs text-slate-500">
              Parameter timeline evaluated against applicable environmental limits
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <label className="text-xs font-semibold text-slate-600">Parameter:</label>
            <select
              value={selectedChartParam}
              onChange={(e) => setSelectedChartParam(e.target.value)}
              className="px-2.5 py-1 rounded-md border border-slate-300 text-xs font-medium text-slate-800 bg-slate-50 focus:outline-none"
            >
              <optgroup label="Air Quality">
                <option value="PM2.5">PM2.5 (Particulate &lt; 2.5µm)</option>
                <option value="PM10">PM10 (Coarse Particulates)</option>
                <option value="NO2">NO2 (Nitrogen Dioxide)</option>
                <option value="SO2">SO2 (Sulfur Dioxide)</option>
              </optgroup>
              <optgroup label="Water Quality">
                <option value="pH">pH Level</option>
                <option value="Turbidity">Turbidity (NTU)</option>
                <option value="DO">Dissolved Oxygen (mg/L)</option>
              </optgroup>
              <optgroup label="Noise / Acoustics">
                <option value="Noise_Day">Daytime Noise (07:00 - 22:00)</option>
                <option value="Noise_Night">Nighttime Noise (22:00 - 07:00)</option>
              </optgroup>
            </select>
          </div>
        </div>

        {thresholdConfig && (
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-2 text-xs">
            <div className="space-y-0.5">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-slate-900">{thresholdConfig.ruleTitle}</span>
                <span className="font-mono text-[10px] text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                  {thresholdConfig.ruleId}
                </span>
              </div>
              <p className="text-slate-500 text-[11px]">{thresholdConfig.standardReference}</p>
            </div>
            <div className="flex items-center space-x-3 shrink-0">
              {thresholdConfig.maxLimit !== undefined && (
                <div className="bg-white px-2.5 py-1 rounded border border-slate-200 text-center">
                  <span className="text-[10px] text-slate-400 block font-semibold uppercase">Statutory Max</span>
                  <span className="font-mono font-bold text-slate-800">
                    {thresholdConfig.maxLimit} {thresholdConfig.unit}
                  </span>
                </div>
              )}
              {thresholdConfig.minLimit !== undefined && (
                <div className="bg-white px-2.5 py-1 rounded border border-slate-200 text-center">
                  <span className="text-[10px] text-slate-400 block font-semibold uppercase">Statutory Min</span>
                  <span className="font-mono font-bold text-slate-800">
                    {thresholdConfig.minLimit} {thresholdConfig.unit}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="h-56 w-full pt-4">
          {chartReadings.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-slate-400 italic">
              No historical data points recorded yet for {selectedChartParam} in this project scope.
            </div>
          ) : (
            <div className="relative h-full w-full">
              <svg className="w-full h-44 overflow-visible" viewBox="0 0 700 160">
                <line x1="40" y1="20" x2="680" y2="20" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="40" y1="60" x2="680" y2="60" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="40" y1="100" x2="680" y2="100" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="40" y1="140" x2="680" y2="140" stroke="#cbd5e1" strokeWidth="1.5" />

                {thresholdConfig?.maxLimit !== undefined && (
                  (() => {
                    const yPos = 140 - (thresholdConfig.maxLimit / (maxVal * 1.15)) * 120;
                    return (
                      <g>
                        <line
                          x1="40"
                          y1={yPos}
                          x2="680"
                          y2={yPos}
                          stroke="#ef4444"
                          strokeWidth="1.5"
                          strokeDasharray="4 4"
                        />
                        <text x="685" y={yPos + 4} fill="#ef4444" fontSize="10" fontWeight="bold">
                          Limit {thresholdConfig.maxLimit}
                        </text>
                      </g>
                    );
                  })()
                )}

                {(() => {
                  const xStep = chartReadings.length > 1 ? 620 / (chartReadings.length - 1) : 310;
                  const points = chartReadings.map((r, i) => {
                    const x = 50 + i * xStep;
                    const y = 140 - (r.value / (maxVal * 1.15)) * 120;
                    return { x, y, reading: r };
                  });

                  const pointsString = points.map((p) => `${p.x},${p.y}`).join(' ');

                  return (
                    <g>
                      <polyline
                        fill="none"
                        stroke="#059669"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points={pointsString}
                      />
                      {points.map((p, i) => {
                        const isBreach =
                          (thresholdConfig?.maxLimit !== undefined && p.reading.value > thresholdConfig.maxLimit) ||
                          (thresholdConfig?.minLimit !== undefined && p.reading.value < thresholdConfig.minLimit);
                        return (
                          <g key={i}>
                            <circle
                              cx={p.x}
                              cy={p.y}
                              r={isBreach ? 5.5 : 4}
                              fill={isBreach ? '#ef4444' : '#059669'}
                              stroke="#ffffff"
                              strokeWidth="2"
                            />
                            <text
                              x={p.x}
                              y={p.y - 8}
                              textAnchor="middle"
                              fontSize="10"
                              fontWeight="600"
                              fill={isBreach ? '#b91c1c' : '#0f172a'}
                            >
                              {p.reading.value}
                            </text>
                          </g>
                        );
                      })}
                    </g>
                  );
                })()}
              </svg>

              <div className="flex justify-between pl-10 pr-6 text-[10px] text-slate-400 font-mono mt-1">
                {chartReadings.map((r, i) => (
                  <span key={i} className="truncate max-w-[60px]">
                    {new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-1 border border-slate-200 rounded-lg p-1 bg-slate-50 w-fit">
            {(['all', 'air', 'water', 'noise'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded text-xs font-semibold capitalize transition-all ${
                  selectedCategory === cat
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {cat === 'all' ? 'All Parameters' : `${cat} Quality`}
              </button>
            ))}
          </div>

          <div className="text-xs text-slate-500">
            Showing <span className="font-bold text-slate-800">{filteredReadings.length}</span> readings
          </div>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-lg">
          <table className="w-full text-left text-xs divide-y divide-slate-200">
            <thead className="bg-slate-50 text-slate-600 font-semibold">
              <tr>
                <th className="py-2.5 px-3">Parameter</th>
                <th className="py-2.5 px-3">Value & Unit</th>
                <th className="py-2.5 px-3">Threshold Limit</th>
                <th className="py-2.5 px-3">Data Source</th>
                <th className="py-2.5 px-3">Project</th>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredReadings.map((reading) => {
                const config = DEFAULT_THRESHOLDS[reading.parameter];
                const project = projects.find((p) => p.id === reading.projectId);
                let isBreached = false;
                if (config) {
                  if (config.maxLimit !== undefined && reading.value > config.maxLimit) isBreached = true;
                  if (config.minLimit !== undefined && reading.value < config.minLimit) isBreached = true;
                }

                return (
                  <tr key={reading.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-slate-900">
                      <div>
                        <span>{reading.parameter}</span>
                        <span className="block text-[10px] text-slate-400 capitalize font-normal">
                          {reading.category}
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                      <span className={isBreached ? 'text-rose-600' : 'text-slate-900'}>
                        {reading.value} {reading.unit}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">
                      {config?.maxLimit !== undefined
                        ? `Max ${config.maxLimit} ${config.unit}`
                        : config?.minLimit !== undefined
                        ? `Min ${config.minLimit} ${config.unit}`
                        : '—'}
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-semibold capitalize ${
                          reading.source === 'sensor'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : reading.source === 'manual'
                            ? 'bg-slate-100 text-slate-700 border border-slate-200'
                            : 'bg-purple-50 text-purple-700 border border-purple-200'
                        }`}
                      >
                        {reading.source === 'sensor' ? (
                          <Cpu className="w-3 h-3" />
                        ) : reading.source === 'manual' ? (
                          <UserCheck className="w-3 h-3" />
                        ) : (
                          <Radio className="w-3 h-3" />
                        )}
                        <span>{reading.source}</span>
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 truncate max-w-[150px]">
                      {project ? project.name : reading.projectId}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 text-[11px] whitespace-nowrap">
                      {new Date(reading.timestamp).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-2.5 px-3">
                      {isBreached ? (
                        <span className="inline-flex items-center space-x-1 text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded text-[10px] font-bold">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Breached</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-medium">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Compliant</span>
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filteredReadings.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-slate-400 italic">
                    No environmental measurements matching the selected filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
