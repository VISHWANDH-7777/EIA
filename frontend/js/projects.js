// Smart EIA — Projects Controller
async function loadProjects() {
  try {
    const projects = await api.getProjects();
    const container = document.getElementById('projects-list');
    if (!container) return;

    container.innerHTML = projects.map(p => `
      <div class="card">
        <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
          <span class="badge ${p.status === 'Active' ? 'badge-low' : 'badge-neutral'}">${p.status}</span>
        </div>
        <h3 style="font-size:1rem; margin-bottom:4px;">${p.name}</h3>
        <p style="font-size:0.8rem; color:var(--primary); font-weight:600;">${p.type}</p>
        <p style="font-size:0.8rem; color:var(--text-muted); margin:8px 0;">${p.location}</p>
        <p style="font-size:0.8rem; color:var(--text-main);">${p.description || ''}</p>
      </div>
    `).join('');
  } catch (err) {
    console.error('Failed to load projects:', err);
  }
}

document.addEventListener('DOMContentLoaded', loadProjects);
