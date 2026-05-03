import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import api from '../api/axios.js';
import { useAuth } from '../context/AuthContext.jsx';

function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', formData);
      login(response.data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <main className="auth-page">
      <section className="auth-shell">
        <section className="auth-panel">
          <h1>Welcome back</h1>
          <p>Log in to validate and review your startup ideas.</p>

          {error && <div className="alert error">{error}</div>}

          <form className="form" onSubmit={handleSubmit}>
            <label>
              Email
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Password
              <input
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </label>

            <button className="primary-button" type="submit" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <p className="switch-link">
            New here? <Link to="/signup">Create an account</Link>
          </p>
        </section>

        <aside className="auth-aside">
          <div className="auth-card">
            <h2>Validation cockpit</h2>
            <p>Track market, execution, and risk signals with every run.</p>
            <div className="auth-metric-grid">
              <div>
                <strong>7</strong>
                <span>Score signals</span>
              </div>
              <div>
                <strong>4</strong>
                <span>SWOT pillars</span>
              </div>
              <div>
                <strong>3</strong>
                <span>Risk tiers</span>
              </div>
            </div>
          </div>
          <div className="auth-card auth-card--outline">
            <h3>What you will unlock</h3>
            <ul>
              <li>Investor-ready SWOT reports.</li>
              <li>Clear next-step experiments.</li>
              <li>Evidence-driven scorecards.</li>
            </ul>
          </div>
        </aside>
      </section>
    </main>
  );
}

export default LoginPage;
