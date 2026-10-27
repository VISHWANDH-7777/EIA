// Smart EIA — Stakeholders & Inspections Controller
async function loadInspections() {
  const container = document.getElementById('inspections-list');
  if (!container) return;

  try {
    const list = await api.getInspections();
    container.innerHTML = list.map(i => `
      <div class="card" style="margin-bottom:12px;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span class="badge ${i.compliance_verdict === 'Compliant' ? 'badge-low' : 'badge-high'}">${i.compliance_verdict}</span>
          <span style="font-size:0.75rem; color:var(--text-muted);">${i.inspection_date}</span>
        </div>
        <h4 style="margin:6px 0 2px 0;">${i.inspector_name}</h4>
        <p style="font-size:0.8rem; color:var(--text-muted);">${i.observations}</p>
      </div>
    `).join('');
  } catch (err) {
    console.error('Failed to load inspections:', err);
  }
}

document.addEventListener('DOMContentLoaded', loadInspections);
