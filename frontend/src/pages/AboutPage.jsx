import { Link } from 'react-router-dom';

function AboutPage() {
  return (
    <div className="about-page">
      <header className="landing-nav">
        <Link className="landing-brand" to="/">
          AI Startup Validator
        </Link>
        <nav className="landing-links">
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
          <Link to="/login">Login</Link>
        </nav>
        <div className="landing-actions">
          <Link className="primary-button" to="/signup">
            Get started
          </Link>
        </div>
      </header>

      <main className="about-content">
        <section className="about-hero">
          <div>
            <p className="eyebrow">About the platform</p>
            <h1>We turn founder context into actionable startup clarity.</h1>
            <p className="hero-subtitle">
              The AI Startup Validator helps teams ask sharper questions, pressure-test assumptions, and
              document a plan that investors can actually follow.
            </p>
          </div>
          <div className="about-hero__card">
            <h2>What we believe</h2>
            <ul>
              <li>Great ideas need structured feedback.</li>
              <li>Risk is manageable when made visible.</li>
              <li>Iteration beats perfection every time.</li>
            </ul>
          </div>
        </section>

        <section className="about-grid">
          <article className="about-card">
            <h3>Structured inputs</h3>
            <p>Capture market, traction, pricing, and go-to-market signals in minutes.</p>
          </article>
          <article className="about-card">
            <h3>AI insight engine</h3>
            <p>Generate SWOT, scorecards, risks, and next steps that move you forward.</p>
          </article>
          <article className="about-card">
            <h3>Founder momentum</h3>
            <p>Use the report to align teams, de-risk pitches, and stay focused.</p>
          </article>
        </section>

        <section className="cta-panel about-cta">
          <div>
            <h2>Ready to validate your next move?</h2>
            <p>Start a report and keep every iteration in one place.</p>
          </div>
          <Link className="primary-button" to="/signup">
            Create my report
          </Link>
        </section>
      </main>

      <footer className="site-footer">
        <div>
          <strong>AI Startup Validator</strong>
          <p>Validate smarter. Build faster.</p>
        </div>
        <div className="footer-links">
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
          <Link to="/login">Login</Link>
        </div>
      </footer>
    </div>
  );
}

export default AboutPage;
