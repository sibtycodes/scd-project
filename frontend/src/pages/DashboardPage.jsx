import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios.js';
import PageHeader from '../components/PageHeader.jsx';

const emptyForm = {
  startupName: '',
  industry: '',
  targetAudience: '',
  problemStatement: '',
  proposedSolution: '',
  revenueModel: '',
};

function DashboardPage() {
  const [formData, setFormData] = useState(emptyForm);
  const [validations, setValidations] = useState([]);
  const [latestFeedback, setLatestFeedback] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);

  useEffect(() => {
    loadValidations();
  }, []);

  const loadValidations = async () => {
    setHistoryLoading(true);

    try {
      const response = await api.get('/validations');
      setValidations(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load validation history');
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLatestFeedback('');
    setLoading(true);

    try {
      const response = await api.post('/validations', formData);
      setLatestFeedback(response.data.aiFeedback);
      setValidations((current) => [response.data, ...current]);
      setFormData(emptyForm);
    } catch (err) {
      setError(err.response?.data?.message || 'Startup validation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-shell">
      <PageHeader />

      <main className="dashboard-layout">
        <section className="workspace-panel">
          <div className="section-heading">
            <h1>Validate a startup idea</h1>
            <p>Submit the core business details and receive structured AI feedback.</p>
          </div>

          {error && <div className="alert error">{error}</div>}

          <form className="form startup-form" onSubmit={handleSubmit}>
            <label>
              Startup name
              <input
                name="startupName"
                type="text"
                value={formData.startupName}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Industry
              <input
                name="industry"
                type="text"
                value={formData.industry}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Target audience
              <textarea
                name="targetAudience"
                value={formData.targetAudience}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Problem statement
              <textarea
                name="problemStatement"
                value={formData.problemStatement}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Proposed solution
              <textarea
                name="proposedSolution"
                value={formData.proposedSolution}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Revenue model
              <textarea
                name="revenueModel"
                value={formData.revenueModel}
                onChange={handleChange}
                required
              />
            </label>

            <button className="primary-button" type="submit" disabled={loading}>
              {loading ? 'Validating...' : 'Validate idea'}
            </button>
          </form>

          {latestFeedback && (
            <article className="feedback-panel">
              <h2>Latest AI feedback</h2>
              <pre>{latestFeedback}</pre>
            </article>
          )}
        </section>

        <aside className="history-panel">
          <div className="section-heading">
            <h2>Previous validations</h2>
            <p>Your saved startup reports.</p>
          </div>

          {historyLoading ? (
            <p className="muted">Loading history...</p>
          ) : validations.length === 0 ? (
            <p className="muted">No validations saved yet.</p>
          ) : (
            <div className="history-list">
              {validations.map((validation) => (
                <Link className="history-item" key={validation.id} to={`/validations/${validation.id}`}>
                  <strong>{validation.startupName}</strong>
                  <span>{validation.industry}</span>
                  <small>{new Date(validation.createdAt).toLocaleString()}</small>
                </Link>
              ))}
            </div>
          )}
        </aside>
      </main>
    </div>
  );
}

export default DashboardPage;
