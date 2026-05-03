import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios.js';

function ValidationsPage() {
  const [validations, setValidations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadValidations = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await api.get('/validations');
        setValidations(response.data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Could not load validations');
      } finally {
        setLoading(false);
      }
    };

    loadValidations();
  }, []);

  return (
    <div className="validations-page">
      <section className="validations-hero">
        <div>
          <p className="eyebrow">Validation archive</p>
          <h1>Your startup reports, organized.</h1>
          <p className="hero-subtitle">
            Track each idea, compare scores, and revisit the insights that matter most for your next move.
          </p>
        </div>
        <div className="validations-hero__card">
          <h3>At a glance</h3>
          <p className="muted">Total validations</p>
          <strong className="validations-total">{validations.length}</strong>
        </div>
      </section>

      {loading && <p className="muted">Loading validations...</p>}
      {error && <div className="alert error">{error}</div>}

      {!loading && !error && (
        <section className="validations-list">
          {validations.length === 0 ? (
            <div className="empty-state">
              <h3>No reports yet</h3>
              <p className="muted">Run your first validation to see reports here.</p>
              <Link className="primary-button" to="/dashboard">
                Start a validation
              </Link>
            </div>
          ) : (
            validations.map((validation) => (
              <Link
                className="validation-card"
                key={validation.id}
                to={`/validations/${validation.id}`}
              >
                <div>
                  <strong>{validation.startupName}</strong>
                  <p className="muted">{validation.industry}</p>
                </div>
                <div className="validation-card__meta">
                  <span>{validation.stage}</span>
                  <span>{new Date(validation.createdAt).toLocaleString()}</span>
                </div>
              </Link>
            ))
          )}
        </section>
      )}
    </div>
  );
}

export default ValidationsPage;
