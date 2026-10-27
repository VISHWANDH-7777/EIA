// Smart EIA — Alerts & Compliance Controller
async function loadAlerts() {
  const container = document.getElementById('alerts-list');
  if (!container) return;

  try {
    const alerts = await api.getAlerts();
    container.innerHTML = alerts.map(a => `
      <div class="card" style="margin-bottom:10px; border-left: 4px solid ${a.severity === 'Critical' ? 'var(--risk-high)' : 'var(--risk-med)'};">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span class="badge ${a.severity === 'Critical' ? 'badge-high' : 'badge-med'}">${a.severity}</span>
          <span style="font-size:0.75rem; color:var(--text-muted);">${new Date(a.timestamp).toLocaleString()}</span>
        </div>
        <p style="font-size:0.85rem; font-weight:600; margin-top:6px;">${a.message}</p>
        ${a.rule_id ? `<span style="font-size:0.75rem; color:var(--text-muted); font-family:monospace;">Rule: ${a.rule_id}</span>` : ''}
      </div>
    `).join('');
  } catch (err) {
    console.error('Failed to load alerts:', err);
  }
}

document.addEventListener('DOMContentLoaded', loadAlerts);
