import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Project, MonitoringStation } from '../types/index.ts';
import { MapPin, Radio, Layers, Info, ExternalLink, ShieldCheck } from 'lucide-react';

interface MapViewProps {
  projects: Project[];
  stations: MonitoringStation[];
  onSelectProjectScope: (id: string) => void;
  onNavigateTab: (tab: string) => void;
}

export const MapView: React.FC<MapViewProps> = ({
  projects,
  stations,
  onSelectProjectScope,
  onNavigateTab,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [selectedEntity, setSelectedEntity] = useState<
    | { type: 'project'; data: Project }
    | { type: 'station'; data: MonitoringStation; project?: Project }
    | null
  >(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Default center around San Francisco Bay Area where sample projects are situated
    const map = L.map(mapContainerRef.current).setView([37.765, -122.35], 11);
    mapInstanceRef.current = map;

    // OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    // Custom Project Marker Icon (Green & Blue)
    const projectIcon = L.divIcon({
      className: 'custom-map-marker-project',
      html: `
        <div style="background-color: #059669; color: white; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3); border: 2.5px solid white;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
        </div>
      `,
      iconSize: [34, 34],
      iconAnchor: [17, 34],
      popupAnchor: [0, -34],
    });

    // Custom Station Marker Icon (Cyan / Indigo Pulse)
    const stationIcon = L.divIcon({
      className: 'custom-map-marker-station',
      html: `
        <div style="background-color: #0284c7; color: white; width: 28px; height: 28px; border-radius: 8px; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 5px rgba(0,0,0,0.25); border: 2px solid white;">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9"/><path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5"/><circle cx="12" cy="12" r="2"/><path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5"/><path d="M19.1 4.9C23 8.8 23 15.1 19.1 19"/></svg>
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 28],
      popupAnchor: [0, -28],
    });

    const bounds = L.latLngBounds([]);

    // Add Project Markers
    projects.forEach((proj) => {
      if (typeof proj.latitude === 'number' && typeof proj.longitude === 'number') {
        const marker = L.marker([proj.latitude, proj.longitude], { icon: projectIcon }).addTo(map);
        bounds.extend([proj.latitude, proj.longitude]);
        marker.on('click', () => {
          setSelectedEntity({ type: 'project', data: proj });
        });
      }
    });

    // Add Station Markers
    stations.forEach((st) => {
      if (typeof st.latitude === 'number' && typeof st.longitude === 'number') {
        const proj = projects.find((p) => p.id === st.projectId);
        const marker = L.marker([st.latitude, st.longitude], { icon: stationIcon }).addTo(map);
        bounds.extend([st.latitude, st.longitude]);
        marker.on('click', () => {
          setSelectedEntity({ type: 'station', data: st, project: proj });
        });
      }
    });

    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [projects, stations]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Environmental GIS Map</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Geographic distribution of infrastructure corridors and continuous environmental monitoring stations
          </p>
        </div>
        <div className="flex items-center space-x-3 text-xs">
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-600 border border-white shadow-xs inline-block" />
            <span className="text-slate-700 font-medium">Projects ({projects.length})</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded bg-sky-600 border border-white shadow-xs inline-block" />
            <span className="text-slate-700 font-medium">Stations ({stations.length})</span>
          </div>
        </div>
      </div>

      {/* Main Map + Side Details Container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Map Canvas */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs relative">
          <div ref={mapContainerRef} className="w-full h-[540px] z-10" />
          <div className="absolute top-3 right-3 z-20 bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-slate-200 text-[11px] text-slate-600 font-medium shadow-xs">
            Leaflet / OpenStreetMap (Standard Coordinates)
          </div>
        </div>

        {/* Selected Entity Details Panel */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          {selectedEntity ? (
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    selectedEntity.type === 'project'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-sky-100 text-sky-800'
                  }`}
                >
                  {selectedEntity.type === 'project' ? 'Project Site' : 'Monitoring Station'}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  {selectedEntity.data.latitude.toFixed(4)}, {selectedEntity.data.longitude.toFixed(4)}
                </span>
              </div>

              {selectedEntity.type === 'project' ? (
                <div className="space-y-3">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base leading-snug">
                      {selectedEntity.data.name}
                    </h3>
                    <p className="text-xs font-medium text-emerald-700 mt-0.5">
                      {selectedEntity.data.type}
                    </p>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {selectedEntity.data.description || 'No detailed scope description.'}
                  </p>

                  <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Location:</span>
                      <span className="font-medium text-slate-800">{selectedEntity.data.location}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Lifecycle Status:</span>
                      <span className="font-bold text-slate-800">{selectedEntity.data.status}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Associated Stations:</span>
                      <span className="font-bold text-emerald-700">
                        {stations.filter((s) => s.projectId === selectedEntity.data.id).length} stations
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 space-y-2">
                    <button
                      onClick={() => {
                        onSelectProjectScope(selectedEntity.data.id);
                        onNavigateTab('monitoring');
                      }}
                      className="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs shadow-xs transition-colors text-center"
                    >
                      View Environmental Readings
                    </button>
                    <button
                      onClick={() => {
                        onSelectProjectScope(selectedEntity.data.id);
                        onNavigateTab('risk');
                      }}
                      className="w-full py-2 px-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-xs transition-colors text-center"
                    >
                      Run Risk Assessment
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base leading-snug">
                      {selectedEntity.data.name}
                    </h3>
                    <p className="text-xs font-medium text-sky-700 mt-0.5">
                      {selectedEntity.project?.name || 'Assigned Project'}
                    </p>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Station Type:</span>
                      <span className="font-medium text-slate-800">
                        {selectedEntity.data.stationType}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Operational Status:</span>
                      <span className="font-bold text-emerald-700">
                        {selectedEntity.data.status}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block mb-1">Monitored Parameters:</span>
                      <div className="flex flex-wrap gap-1">
                        {selectedEntity.data.parameters.map((p) => (
                          <span
                            key={p}
                            className="px-2 py-0.5 rounded bg-slate-100 font-mono text-[11px] text-slate-700"
                          >
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <button
                      onClick={() => {
                        onSelectProjectScope(selectedEntity.data.projectId);
                        onNavigateTab('monitoring');
                      }}
                      className="w-full py-2 px-3 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-medium text-xs shadow-xs transition-colors text-center"
                    >
                      Filter Readings For This Project
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Select Any Map Marker</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-[220px]">
                  Click on any green project marker or blue monitoring station to inspect coordinates, parameters, and telemetry.
                </p>
              </div>
            </div>
          )}

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Projection: EPSG:4326 (WGS84)</span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          </div>
        </div>
      </div>
    </div>
  );
};
