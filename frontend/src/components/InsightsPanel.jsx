function clampScore(value) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return null;
  }
  return Math.max(0, Math.min(100, Math.round(value)));
}

function ScoreCard({ label, value }) {
  const score = clampScore(value);
  const display = score === null ? '--' : `${score}%`;
  const width = score === null ? 0 : score;

  return (
    <div className="score-card">
      <div className="score-card__header">
        <span>{label}</span>
        <strong>{display}</strong>
      </div>
      <div className="score-card__track">
        <div className="score-card__bar" style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

function SeverityTag({ value }) {
  const normalized = (value || '').toLowerCase();
  const variant = normalized === 'high' ? 'high' : normalized === 'medium' ? 'medium' : 'low';

  return <span className={`risk-tag risk-tag--${variant}`}>{value || 'Low'}</span>;
}

function InsightsPanel({ insights }) {
  if (!insights) {
    return null;
  }

  const scores = insights.scores || {};
  const swot = insights.swot || {};
  const risks = insights.risks || [];
  const assumptions = insights.assumptions || [];
  const nextSteps = insights.nextSteps || [];
  const verdict = insights.verdict || 'Needs review';
  const verdictClass = verdict.toLowerCase().replace(/\s+/g, '-');

  const scoreItems = [
    { key: 'overall', label: 'Overall' },
    { key: 'market', label: 'Market' },
    { key: 'execution', label: 'Execution' },
    { key: 'differentiation', label: 'Differentiation' },
    { key: 'financials', label: 'Financials' },
    { key: 'traction', label: 'Traction' },
    { key: 'risk', label: 'Risk' },
  ];

  return (
    <section className="insights-panel">
      <div className="insights-header">
        <div>
          <h2>AI insight report</h2>
          <p className="muted">A structured review based on your inputs.</p>
        </div>
        <span className={`verdict-pill verdict-pill--${verdictClass}`}>
          {verdict}
        </span>
      </div>

      {insights.summary && <p className="insights-summary">{insights.summary}</p>}

      <div className="score-grid">
        {scoreItems.map((item) => (
          <ScoreCard key={item.key} label={item.label} value={scores[item.key]} />
        ))}
      </div>

      <div className="swot-grid">
        <div className="swot-card">
          <h3>Strengths</h3>
          <ul>
            {(swot.strengths || []).map((item, index) => (
              <li key={`strength-${index}`}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="swot-card">
          <h3>Weaknesses</h3>
          <ul>
            {(swot.weaknesses || []).map((item, index) => (
              <li key={`weakness-${index}`}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="swot-card">
          <h3>Opportunities</h3>
          <ul>
            {(swot.opportunities || []).map((item, index) => (
              <li key={`opportunity-${index}`}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="swot-card">
          <h3>Threats</h3>
          <ul>
            {(swot.threats || []).map((item, index) => (
              <li key={`threat-${index}`}>{item}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="insights-columns">
        <div className="insights-column">
          <h3>Key risks</h3>
          <div className="risk-list">
            {risks.length === 0 ? (
              <p className="muted">No explicit risks returned.</p>
            ) : (
              risks.map((risk, index) => (
                <div className="risk-item" key={`risk-${index}`}>
                  <div>
                    <strong>{risk.risk}</strong>
                    <p>{risk.mitigation}</p>
                  </div>
                  <SeverityTag value={risk.severity} />
                </div>
              ))
            )}
          </div>
        </div>
        <div className="insights-column">
          <h3>Next steps</h3>
          <ol className="next-steps">
            {nextSteps.length === 0 ? (
              <li className="muted">No next steps returned.</li>
            ) : (
              nextSteps.map((item, index) => <li key={`step-${index}`}>{item}</li>)
            )}
          </ol>

          {assumptions.length > 0 && (
            <div className="assumptions">
              <h4>Key assumptions</h4>
              <ul>
                {assumptions.map((item, index) => (
                  <li key={`assumption-${index}`}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default InsightsPanel;
