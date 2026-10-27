// Smart EIA — Dashboard Controller
async function loadDashboard() {
  try {
    const summary = await api.getDashboard();
    document.getElementById('dash-projects-count').textContent = summary.totalProjects || 0;
    document.getElementById('dash-alerts-count').textContent = summary.unreadAlerts || 0;
    document.getElementById('dash-mitigations-count').textContent = summary.pendingMitigations || 0;
    document.getElementById('dash-compliance-count').textContent = 
      (summary.complianceCounts?.Compliant || 0) + ' Compliant';

    const tbody = document.querySelector('#dash-latest-table tbody');
    if (tbody && summary.latestReadings) {
      tbody.innerHTML = summary.latestReadings.map(r => `
        <tr>
          <td><strong>${r.parameter}</strong></td>
          <td style="text-transform:capitalize;">${r.category}</td>
          <td><strong>${r.value} ${r.unit}</strong></td>
          <td><span class="badge badge-neutral">${r.source}</span></td>
          <td>${new Date(r.timestamp).toLocaleTimeString()}</td>
        </tr>
      `).join('');
    }
  } catch (err) {
    console.error('Failed to load dashboard:', err);
  }
}

document.addEventListener('DOMContentLoaded', loadDashboard);
