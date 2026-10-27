import React, { useState } from 'react';
import { Activity, AlertTriangle, CheckCircle2, AlertCircle } from 'lucide-react';
import { Project, MonitoringStation, EnvironmentalReading } from '../types/index.ts';
import { DEFAULT_THRESHOLDS } from '../utils/riskRules.ts';

interface RecordMeasurementModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  stations: MonitoringStation[];
  selectedProjectId: string;
  onSaveReading: (data: Partial<EnvironmentalReading>) => Promise<void>;
}

export const RecordMeasurementModal: React.FC<RecordMeasurementModalProps> = ({
  isOpen,
  onClose,
  projects,
  stations,
  selectedProjectId,
  onSaveReading,
}) => {
  const [projectId, setProjectId] = useState(selectedProjectId || projects[0]?.id || '');
  const [stationId, setStationId] = useState('');
  const [category, setCategory] = useState<'air' | 'water' | 'noise'>('air');
  const [parameter, setParameter] = useState('PM2.5');
  const [value, setValue] = useState('');
  const [source, setSource] = useState<'manual' | 'sensor' | 'simulated'>('manual');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (isOpen) {
      const activeProjId = selectedProjectId || projects[0]?.id || '';
      setProjectId(activeProjId);
      setStationId('');
      setValue('');
      setNotes('');
      setError('');
    }
  }, [isOpen, selectedProjectId, projects]);

  if (!isOpen) return null;

  const threshold = DEFAULT_THRESHOLDS[parameter];
  const unit = threshold?.unit || '';

  const handleCategoryChange = (newCat: 'air' | 'water' | 'noise') => {
    setCategory(newCat);
    if (newCat === 'air') setParameter('PM2.5');
    if (newCat === 'water') setParameter('pH');
    if (newCat === 'noise') setParameter('Noise_Day');
  };

  const projectStations = stations.filter((s) => s.projectId === projectId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const targetProjId = projectId || selectedProjectId || projects[0]?.id;
    if (!targetProjId) {
      setError('Please select or register a valid project.');
      return;
    }

    const numVal = parseFloat(value);
    if (isNaN(numVal)) {
      setError('Please enter a valid numeric measurement value.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSaveReading({
        projectId: targetProjId,
        stationId: stationId || undefined,
        category,
        parameter,
        value: numVal,
        unit,
        source,
        timestamp: new Date().toISOString(),
        isValid: true,
        notes: notes.trim() || undefined,
      });
      onClose();
      setValue('');
      setNotes('');
    } catch (err: any) {
      setError(err.message || 'Failed to record measurement');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-slate-900">Record Environmental Reading</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold">
            ✕
          </button>
        </div>

        {error && (
          <div className="p-2.5 rounded bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Target Project *</label>
            <select
              value={projectId}
              onChange={(e) => {
                setProjectId(e.target.value);
                setStationId('');
              }}
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
            <label className="block font-semibold text-slate-700 mb-1">Monitoring Station</label>
            <select
              value={stationId}
              onChange={(e) => setStationId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800"
            >
              <option value="">General Project Site (No specific station)</option>
              {projectStations.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.stationType})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Category *</label>
              <select
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800 capitalize"
              >
                <option value="air">Air Quality</option>
                <option value="water">Water Quality</option>
                <option value="noise">Noise / Acoustics</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Parameter *</label>
              <select
                value={parameter}
                onChange={(e) => setParameter(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800"
              >
                {category === 'air' && (
                  <>
                    <option value="PM2.5">PM2.5 (Fine Particulates)</option>
                    <option value="PM10">PM10 (Coarse Dust)</option>
                    <option value="NO2">NO2 (Nitrogen Dioxide)</option>
                    <option value="SO2">SO2 (Sulfur Dioxide)</option>
                  </>
                )}
                {category === 'water' && (
                  <>
                    <option value="pH">pH Level (Acidity/Alkalinity)</option>
                    <option value="Turbidity">Turbidity (Clarity)</option>
                    <option value="DO">DO (Dissolved Oxygen)</option>
                  </>
                )}
                {category === 'noise' && (
                  <>
                    <option value="Noise_Day">Noise Daytime (07:00 - 22:00)</option>
                    <option value="Noise_Night">Noise Nighttime (22:00 - 07:00)</option>
                  </>
                )}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Value ({unit}) *
              </label>
              <input
                type="number"
                step="any"
                required
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="e.g. 42.5"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800 font-mono font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Data Source *</label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800 capitalize"
              >
                <option value="manual">Manual Entry / Field Grab</option>
                <option value="sensor">Calibrated IoT Sensor</option>
                <option value="simulated">Simulated Telematic Feed</option>
              </select>
            </div>
          </div>

          {/* Threshold reference callout */}
          {threshold && (
            <div className="p-2.5 rounded bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-0.5">
              <span className="font-semibold text-slate-800 block">
                Statutory Reference: {threshold.ruleTitle}
              </span>
              <span>
                Threshold:{' '}
                {threshold.maxLimit !== undefined
                  ? `Max ${threshold.maxLimit} ${threshold.unit}`
                  : `Min ${threshold.minLimit} ${threshold.unit}`}
              </span>
            </div>
          )}

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Field Sampling Notes</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Calibration check passed, weather dry and clear..."
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-xs"
            >
              {isSubmitting ? 'Recording...' : 'Commit Measurement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
