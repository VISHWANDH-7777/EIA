// Smart EIA — Monitoring Controller
async function loadReadings() {
  try {
    const readings = await api.getReadings();
    const tbody = document.querySelector('#readings-table tbody');
    if (!tbody) return;

    tbody.innerHTML = readings.map(r => `
      <tr>
        <td><strong>${r.parameter}</strong></td>
        <td><strong>${r.value} ${r.unit}</strong></td>
        <td><span class="badge badge-neutral">${r.source}</span></td>
        <td>${new Date(r.timestamp).toLocaleString()}</td>
        <td><span class="badge badge-low">Valid</span></td>
      </tr>
    `).join('');
  } catch (err) {
    console.error('Failed to load readings:', err);
  }
}

document.addEventListener('DOMContentLoaded', loadReadings);
