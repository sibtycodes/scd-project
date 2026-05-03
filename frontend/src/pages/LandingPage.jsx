import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="landing">
      <header className="landing-nav">
        <Link className="landing-brand" to="/">
          AI Startup Validator
        </Link>
        <nav className="landing-links">
          <a href="#features">Features</a>
          <a href="#how-it-works">How it works</a>
          <Link to="/about">About</Link>
        </nav>
        <div className="landing-actions">
          {isAuthenticated ? (
            <>
              <span className="nav-greeting">Hi, {user?.username || 'Founder'}</span>
              <Link className="secondary-button" to="/dashboard">
                Dashboard
              </Link>
              <button className="ghost-button" type="button" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link className="secondary-button" to="/login">
                Login
              </Link>
              <Link className="primary-button" to="/signup">
                Get started
              </Link>
            </>
          )}
        </div>
      </header>

      <main>
        <section className="landing-hero">
          <div className="landing-hero__content">
            <p className="eyebrow">AI-guided validation in minutes</p>
            <h1>Turn raw startup ideas into investor-ready clarity.</h1>
            <p className="hero-subtitle">
              Capture market, traction, and risk signals in one guided flow, then receive a structured SWOT,
              scorecard, and action plan.
            </p>
            <div className="hero-actions">
              {isAuthenticated ? (
                <>
                  <Link className="primary-button" to="/dashboard">
                    Go to dashboard
                  </Link>
                  <button className="ghost-button" type="button" onClick={() => navigate('/dashboard')}>
                    Start a new validation
                  </button>
                </>
              ) : (
                <>
                  <Link className="primary-button" to="/signup">
                    Start validating
                  </Link>
                  <Link className="ghost-button" to="/login">
                    I already have an account
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="landing-hero__panel">
            <div className="hero-card">
              <h2>Idea snapshot</h2>
              <ul>
                <li>Market size: 18% CAGR</li>
                <li>Execution score: 78%</li>
                <li>Risk watchlist: 3 key items</li>
              </ul>
              <div className="hero-card__footer">
                <span className="pill">Verdict: Strong</span>
                <span className="pill pill--accent">Next step: Pilot</span>
              </div>
            </div>
          </div>
        </section>

        <section className="landing-stats">
          <div>
            <h3>10+ data points</h3>
            <p>Capture location, traction, pricing, and go-to-market detail.</p>
          </div>
          <div>
            <h3>Instant SWOT</h3>
            <p>Auto-generated strengths, weaknesses, and risks with mitigations.</p>
          </div>
          <div>
            <h3>Clear next steps</h3>
            <p>AI suggests experiments to move you to traction faster.</p>
          </div>
        </section>

        <section className="landing-section" id="features">
          <div className="section-heading">
            <h2>Everything you need to pressure-test an idea</h2>
            <p>Give the AI the right context and get an executive-ready report.</p>
          </div>
          <div className="feature-grid">
            <article className="feature-card">
              <h3>Founder context</h3>
              <p>Capture team size, funding stage, and operating region.</p>
            </article>
            <article className="feature-card">
              <h3>Market clarity</h3>
              <p>Document target audience, pain points, and differentiation.</p>
            </article>
            <article className="feature-card">
              <h3>Business mechanics</h3>
              <p>Explain traction, pricing, and go-to-market strategy.</p>
            </article>
            <article className="feature-card">
              <h3>Structured output</h3>
              <p>Receive scores, risks, SWOT, and priority next steps.</p>
            </article>
          </div>
        </section>

        <section className="landing-section" id="how-it-works">
          <div className="section-heading">
            <h2>How it works</h2>
            <p>From idea to action plan in three focused steps.</p>
          </div>
          <ol className="steps-grid">
            <li>
              <h3>Describe the idea</h3>
              <p>Fill out the guided form with market, product, and traction details.</p>
            </li>
            <li>
              <h3>Generate insights</h3>
              <p>We score the opportunity and highlight risks and assumptions.</p>
            </li>
            <li>
              <h3>Act on the plan</h3>
              <p>Use the AI recommendations to run validation experiments.</p>
            </li>
          </ol>
        </section>

        <section className="landing-section" id="outcomes">
          <div className="cta-panel">
            <div>
              <h2>Move from guesswork to a validated roadmap.</h2>
              <p>
                Whether you are pitching or bootstrapping, your report shows exactly where to focus next.
              </p>
            </div>
            <Link className="primary-button" to={isAuthenticated ? '/dashboard' : '/signup'}>
              Build my report
            </Link>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div>
          <strong>AI Startup Validator</strong>
          <p>Validate smarter. Build faster.</p>
        </div>
        <div className="footer-links">
          {isAuthenticated ? (
            <>
              <Link to="/dashboard">Dashboard</Link>
              <Link to="/about">About</Link>
              <button className="link-button" type="button" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/signup">Signup</Link>
              <Link to="/about">About</Link>
            </>
          )}
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
