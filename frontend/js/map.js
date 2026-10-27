// Smart EIA — Leaflet Map Controller
let mapInstance = null;

async function initMap() {
  const container = document.getElementById('map');
  if (!container || mapInstance) return;

  mapInstance = L.map('map').setView([37.765, -122.35], 11);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(mapInstance);

  try {
    const [projects, stations] = await Promise.all([
      api.getMapProjects(),
      api.getMapStations()
    ]);

    projects.forEach(p => {
      L.marker([p.latitude, p.longitude])
        .addTo(mapInstance)
        .bindPopup(`<strong>${p.name}</strong><br>${p.type}<br>Status: ${p.status}`);
    });

    stations.forEach(s => {
      L.circleMarker([s.latitude, s.longitude], { color: '#0284c7', radius: 8 })
        .addTo(mapInstance)
        .bindPopup(`<strong>${s.name}</strong><br>Monitors: ${s.parameters.join(', ')}`);
    });
  } catch (err) {
    console.error('Failed to load map markers:', err);
  }
}

window.initMap = initMap;
