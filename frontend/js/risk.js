// Smart EIA — Risk Controller (Rule-Based, Non-Probabilistic)
async function loadRiskAssessment(projectId) {
  const container = document.getElementById('risk-result-card');
  if (!container) return;

  try {
    const history = await api.getRiskHistory(projectId);
    if (!history || history.length === 0) {
      container.innerHTML = '<p>No risk assessment evaluated yet. Select a project.</p>';
      return;
    }
    const latest = history[0];
    const badgeClass = latest.risk_level === 'High' ? 'badge-high' : latest.risk_level === 'Medium' ? 'badge-med' : 'badge-low';

    container.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
        <span class="badge ${badgeClass}">${latest.risk_level} Risk</span>
        <span style="font-size:0.75rem; color:var(--text-muted); font-family:monospace;">${latest.rule_set_version}</span>
      </div>
      <p style="font-size:0.9rem; font-weight:600; margin-bottom:8px;">${latest.summary}</p>
      <p style="font-size:0.75rem; color:var(--text-muted);">Methodology: ${latest.methodology}</p>
      
      <div style="margin-top:16px;">
        <h4>Breach Attribution & Prescribed Mitigation:</h4>
        ${(latest.breaches || []).map(b => `
          <div style="background:#f8fafc; border:1px solid var(--border-color); padding:10px; border-radius:6px; margin-top:8px;">
            <strong>${b.parameter}</strong>: ${b.explanation}
            <div style="margin-top:4px; color:var(--primary); font-weight:600;">Mitigation: ${b.recommended_mitigation}</div>
          </div>
        `).join('')}
      </div>
    `;
  } catch (err) {
    console.error('Failed to load risk assessment:', err);
  }
}

document.addEventListener('DOMContentLoaded', () => loadRiskAssessment());
