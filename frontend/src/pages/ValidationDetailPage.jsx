import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api/axios.js';
import PageHeader from '../components/PageHeader.jsx';

function ValidationDetailPage() {
  const { id } = useParams();
  const [validation, setValidation] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadValidation = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await api.get(`/validations/${id}`);
        setValidation(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Could not load validation');
      } finally {
        setLoading(false);
      }
    };

    loadValidation();
  }, [id]);

  return (
    <div className="app-shell">
      <PageHeader />

      <main className="detail-layout">
        <Link className="back-link" to="/dashboard">
          Back to dashboard
        </Link>

        {loading && <p className="muted">Loading validation...</p>}
        {error && <div className="alert error">{error}</div>}

        {validation && (
          <article className="detail-panel">
            <div className="section-heading">
              <h1>{validation.startupName}</h1>
              <p>
                {validation.industry} · {new Date(validation.createdAt).toLocaleString()}
              </p>
            </div>

            <div className="detail-grid">
              <InfoBlock title="Target audience" value={validation.targetAudience} />
              <InfoBlock title="Problem statement" value={validation.problemStatement} />
              <InfoBlock title="Proposed solution" value={validation.proposedSolution} />
              <InfoBlock title="Revenue model" value={validation.revenueModel} />
            </div>

            <section className="feedback-panel">
              <h2>AI validation feedback</h2>
              <pre>{validation.aiFeedback}</pre>
            </section>
          </article>
        )}
      </main>
    </div>
  );
}

function InfoBlock({ title, value }) {
  return (
    <section className="info-block">
      <h3>{title}</h3>
      <p>{value}</p>
    </section>
  );
}

export default ValidationDetailPage;
