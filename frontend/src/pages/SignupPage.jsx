import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import api from '../api/axios.js';
import { useAuth } from '../context/AuthContext.jsx';

function SignupPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
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
    setSuccess('');
    setLoading(true);

    try {
      await api.post('/auth/signup', formData);
      setSuccess('Account created successfully. Redirecting to login...');
      setTimeout(() => navigate('/login'), 700);
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
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
          <h1>Create account</h1>
          <p>Start saving AI validation reports for your startup ideas.</p>

          {error && <div className="alert error">{error}</div>}
          {success && <div className="alert success">{success}</div>}

          <form className="form" onSubmit={handleSubmit}>
            <label>
              Username
              <input
                name="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </label>

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
                minLength="6"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </label>

            <button className="primary-button" type="submit" disabled={loading}>
              {loading ? 'Creating account...' : 'Sign up'}
            </button>
          </form>

          <p className="switch-link">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </section>

        <aside className="auth-aside">
          <div className="auth-card">
            <h2>Build your validation library</h2>
            <p>Save every report, compare signals, and refine your positioning.</p>
            <div className="auth-metric-grid">
              <div>
                <strong>10+</strong>
                <span>Data inputs</span>
              </div>
              <div>
                <strong>5</strong>
                <span>Risk themes</span>
              </div>
              <div>
                <strong>24h</strong>
                <span>Faster clarity</span>
              </div>
            </div>
          </div>
          <div className="auth-card auth-card--outline">
            <h3>Perfect for</h3>
            <ul>
              <li>Founders validating new ideas.</li>
              <li>Accelerator cohorts refining pitches.</li>
              <li>Teams preparing investor updates.</li>
            </ul>
          </div>
        </aside>
      </section>
    </main>
  );
}

export default SignupPage;
