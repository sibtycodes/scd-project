import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api/axios.js';
import InsightsPanel from '../components/InsightsPanel.jsx';

function ValidationDetailPage() {
  const { id } = useParams();
  const [validation, setValidation] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [downloadingReport, setDownloadingReport] = useState(false);

  const insights = validation?.aiInsights;
  const overallScore = insights?.scores?.overall;
  const riskScore = insights?.scores?.risk;
  const verdict = insights?.verdict || 'Needs review';
  const riskCount = insights?.risks ? insights.risks.length : null;

  const formatPercent = (value) =>
    typeof value === 'number' && !Number.isNaN(value) ? `${Math.round(value)}%` : '--';

  useEffect(() => {
    const loadValidation = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await api.get(`/validations/${id}`);
        setValidation(response.data);
        console.log('Validation loaded:', response.data);
      } catch (err) {
        console.error('Error loading validation:', err);
        setError(err.response?.data?.message || 'Could not load validation');
      } finally {
        setLoading(false);
      }
    };

    loadValidation();
  }, [id]);

  const handleDownloadReport = async () => {
    if (!validation) {
      console.warn('No validation data available');
      return;
    }

    setDownloadingReport(true);

    try {
      const reportResponse = await api.post(`/reports/generate/${id}`);
      const reportUrl = reportResponse.data.fileUrl;

      if (!reportUrl) {
        throw new Error('Report URL not available');
      }

      // Download the report
      const link = document.createElement('a');
      link.href = reportUrl;
      link.download = `${validation.startupName}_validation_report.pdf`;
      link.target = '_blank';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (err) {
      console.error('Error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to generate report';
      setError(`Report generation failed: ${errorMessage}`);
    } finally {
      setDownloadingReport(false);
    }
  };

  return (
    <main className="detail-layout">
      <Link className="back-link" to="/validations">
        Back to validations
      </Link>

        {loading && <p className="muted">Loading validation...</p>}
        {error && <div className="alert error">{error}</div>}

        {validation && (
          <article className="detail-panel">
            <div className="detail-hero">
              <div className="detail-hero__content">
                <p className="eyebrow">Validation report</p>
                <h1>{validation.startupName}</h1>
                <p>
                  {validation.industry} · {new Date(validation.createdAt).toLocaleString()}
                </p>
                <div className="detail-tags">
                  <span className="chip">Location: {validation.location || 'Not set'}</span>
                  <span className="chip">Stage: {validation.stage || 'Not set'}</span>
                  <span className="chip chip--accent">Funding: {validation.fundingStage || 'Not set'}</span>
                </div>
                <div className="detail-actions">
                  <button
                    className="report-button"
                    type="button"
                    onClick={handleDownloadReport}
                    disabled={downloadingReport}
                    title={downloadingReport ? "Generating and downloading..." : "Generate & download PDF report"}
                  >
                    {downloadingReport ? 'Generating & downloading...' : 'Download report'}
                  </button>
                </div>
              </div>
              <div className="detail-hero__cards">
                <div className="stat-card">
                  <span>Overall score</span>
                  <strong>{formatPercent(overallScore)}</strong>
                  <small>Composite signal</small>
                </div>
                <div className="stat-card">
                  <span>Verdict</span>
                  <strong>{verdict}</strong>
                  <small>AI confidence</small>
                </div>
                <div className="stat-card">
                  <span>Risks flagged</span>
                  <strong>{typeof riskCount === 'number' ? riskCount : '--'}</strong>
                  <small>Mitigation tips</small>
                </div>
                <div className="stat-card">
                  <span>Risk score</span>
                  <strong>{formatPercent(riskScore)}</strong>
                  <small>Lower is safer</small>
                </div>
              </div>
            </div>

            <section className="detail-section">
              <h2>Snapshot</h2>
              <div className="detail-grid">
                <InfoBlock title="Location" value={validation.location} />
                <InfoBlock title="Stage" value={validation.stage} />
                <InfoBlock
                  title="Team size"
                  value={validation.teamSize ? `${validation.teamSize} people` : null}
                />
                <InfoBlock title="Funding stage" value={validation.fundingStage} />
              </div>
            </section>

            <section className="detail-section">
              <h2>Market and product</h2>
              <div className="detail-stack">
                <InfoBlock title="Target audience" value={validation.targetAudience} />
                <InfoBlock title="Problem statement" value={validation.problemStatement} />
                <InfoBlock title="Proposed solution" value={validation.proposedSolution} />
                <InfoBlock title="Unique value proposition" value={validation.uniqueValueProposition} />
                <InfoBlock title="Competition" value={validation.competition} />
                <InfoBlock title="Traction" value={validation.traction} />
                <InfoBlock title="Go-to-market" value={validation.goToMarket} />
              </div>
            </section>

            <section className="detail-section">
              <h2>Business model</h2>
              <div className="detail-stack">
                <InfoBlock title="Revenue model" value={validation.revenueModel} />
                <InfoBlock title="Pricing" value={validation.pricing} />
                <InfoBlock title="Timeline" value={validation.timeline} />
              </div>
            </section>

            {validation.aiInsights ? (
              <InsightsPanel insights={validation.aiInsights} />
            ) : (
              <section className="feedback-panel">
                <h2>AI validation feedback</h2>
                <pre>{validation.aiFeedback}</pre>
              </section>
            )}
          </article>
        )}
    </main>
  );
}

function InfoBlock({ title, value }) {
  const displayValue = value || 'Not provided';

  return (
    <section className="info-block">
      <h3>{title}</h3>
      <p>{displayValue}</p>
    </section>
  );
}

export default ValidationDetailPage;
