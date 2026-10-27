// Smart EIA — Mitigation Controller
async function loadMitigations() {
  const container = document.getElementById('mitigation-list');
  if (!container) return;

  try {
    const list = await api.getMitigations();
    container.innerHTML = list.map(m => `
      <div class="card" style="margin-bottom:12px;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span class="badge ${m.status === 'Completed' ? 'badge-low' : 'badge-med'}">${m.status}</span>
          <span style="font-size:0.75rem; color:var(--text-muted);">Due: ${m.due_date}</span>
        </div>
        <h3 style="font-size:0.95rem; margin:8px 0 4px 0;">${m.title}</h3>
        <p style="font-size:0.8rem; color:var(--text-muted);">${m.description}</p>
        <div style="margin-top:8px; font-size:0.75rem; color:var(--text-main);">
          Assignee: <strong>${m.responsible_person}</strong>
        </div>
      </div>
    `).join('');
  } catch (err) {
    console.error('Failed to load mitigations:', err);
  }
}

document.addEventListener('DOMContentLoaded', loadMitigations);
