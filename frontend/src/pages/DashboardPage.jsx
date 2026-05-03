import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios.js';
import InsightsPanel from '../components/InsightsPanel.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const emptyForm = {
  startupName: '',
  industry: '',
  location: '',
  stage: '',
  teamSize: '',
  fundingStage: '',
  targetAudience: '',
  problemStatement: '',
  proposedSolution: '',
  uniqueValueProposition: '',
  competition: '',
  traction: '',
  goToMarket: '',
  revenueModel: '',
  pricing: '',
  timeline: '',
};

const demoIdeas = [
  {
    label: 'Neighborhood solar coop',
    startupName: 'SunShare Collective',
    industry: 'Clean energy marketplace',
    location: 'North America',
    stage: 'MVP',
    teamSize: 4,
    fundingStage: 'Pre-seed',
    targetAudience: 'Renters and condo owners who cannot install rooftop solar.',
    problemStatement:
      'Most urban households want cheaper clean power but lack access to community solar options and simple financing.',
    proposedSolution:
      'A platform that pools nearby households to buy shares in local solar farms, with automated billing and savings tracking.',
    uniqueValueProposition:
      'Local co-ownership with transparent savings reporting and instant eligibility checks.',
    competition: 'Utility-led community solar and regional energy co-ops with limited digital onboarding.',
    traction: 'Three pilot neighborhoods have 140 interested households and two site partners.',
    goToMarket: 'Partner with property managers and local climate nonprofits, then scale via referral credits.',
    revenueModel:
      'Monthly platform fee paid by households plus a revenue-share from utility savings.',
    pricing: '4 percent of monthly savings plus a 5 USD management fee per household.',
    timeline: 'Pilot in Q3, full city launch in Q1 next year.',
  },
  {
    label: 'AI menu planner',
    startupName: 'PrepPulse',
    industry: 'Food service operations',
    location: 'Southeast Asia',
    stage: 'Early traction',
    teamSize: 3,
    fundingStage: 'Bootstrapped',
    targetAudience: 'Independent cafes and fast-casual restaurants with tight margins.',
    problemStatement:
      'Operators overbuy ingredients and lose money due to unpredictable demand and manual forecasting.',
    proposedSolution:
      'An AI planner that forecasts demand from POS data, then generates weekly prep lists and supplier orders.',
    uniqueValueProposition:
      'Automated supplier ordering plus daily prep alerts, tuned to regional demand patterns.',
    competition: 'Spreadsheet-based forecasting tools and generic POS analytics dashboards.',
    traction: 'Nine paying cafes with 11 percent waste reduction over 6 weeks.',
    goToMarket: 'Partner with POS vendors and offer a 30-day guided onboarding for managers.',
    revenueModel:
      'Tiered SaaS subscription based on store count, with optional managed ordering add-on.',
    pricing: '49 USD per location per month, 10 percent discount for annual plans.',
    timeline: 'Release v2 demand model in 8 weeks, expand to 50 stores by year end.',
  },
  {
    label: 'Career micro-apprenticeships',
    startupName: 'SkillSprint',
    industry: 'Workforce development',
    location: 'Europe',
    stage: 'Idea',
    teamSize: 2,
    fundingStage: 'Bootstrapped',
    targetAudience: 'Final-year university students seeking portfolio-ready experience.',
    problemStatement:
      'Graduates lack practical project experience, while startups lack time to mentor long internships.',
    proposedSolution:
      'Two-week guided micro-apprenticeships where students ship scoped deliverables with mentor review.',
    uniqueValueProposition:
      'Short, scoped projects with built-in mentor playbooks and portfolio-ready artifacts.',
    competition: 'Traditional internships and online course platforms with limited real project feedback.',
    traction: 'Interviewed 12 startups and 30 students, 6 letters of intent collected.',
    goToMarket: 'Start with partner accelerators and career offices, then expand via alumni referrals.',
    revenueModel:
      'Placement fee from startups and premium coaching plans for students.',
    pricing: '350 USD per apprenticeship placement plus 39 USD student coaching add-on.',
    timeline: 'Beta cohort this summer, paid cohort in the next semester.',
  },];

function DashboardPage() {
  const { user } = useAuth();
  const [formData, setFormData] = useState(emptyForm);
  const [validations, setValidations] = useState([]);
  const [latestInsights, setLatestInsights] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoIndex, setDemoIndex] = useState(0);

  const overallScore = latestInsights?.scores?.overall;
  const riskScore = latestInsights?.scores?.risk;
  const verdict = latestInsights?.verdict || '--';
  const riskCount = latestInsights?.riskMitigation?.length || 0;
  const validationCount = validations.length;

  const formatPercent = (value) =>
    typeof value === 'number' && !Number.isNaN(value) ? `${Math.round(value)}%` : '--';

  const nextDemo = demoIdeas[demoIndex];

  useEffect(() => {
    loadValidations();
  }, []);

  const loadValidations = async () => {
    try {
      const response = await api.get('/validations');
      const list = response.data || [];
      setValidations(list);
      if (list.length > 0) {
        setLatestInsights(list[0].aiInsights || null);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load validation history');
    }
  };

  const handleChange = (event) => {
    const isNumber = event.target.type === 'number';
    const nextValue = isNumber
      ? event.target.value === ''
        ? ''
        : Number(event.target.value)
      : event.target.value;

    setFormData({
      ...formData,
      [event.target.name]: nextValue,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLatestInsights(null);
    setLoading(true);

    try {
      const response = await api.post('/validations', formData);
      setLatestInsights(response.data.aiInsights || null);
      setValidations((current) => [response.data, ...current]);
      setFormData(emptyForm);
    } catch (err) {
      setError(err.response?.data?.message || 'Startup validation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = () => {
    const { label, ...demoData } = nextDemo;
    setFormData(demoData);
    setDemoIndex((current) => (current + 1) % demoIdeas.length);
    setError('');
    setLatestInsights(null);
  };

  return (
    <div className="dashboard-page">
      <main className="dashboard-layout">
        <section className="dashboard-hero">
          <div className="dashboard-hero__content">
            <p className="eyebrow">Your validation studio</p>
            <h1>Welcome back{user?.username ? `, ${user.username}` : ''}.</h1>
            <p className="hero-subtitle">
              Capture the full story behind your startup idea and receive a multi-signal report with scores,
              SWOT, and a risk plan you can act on today.
            </p>
            <div className="hero-chips">
              <span className="chip">Structured SWOT</span>
              <span className="chip">Scorecard + verdict</span>
              <span className="chip chip--accent">Risk mitigation</span>
              <span className="chip">Validations: {validationCount}</span>
            </div>
          </div>
          <div className="dashboard-hero__cards">
            <div className="stat-card">
              <span>Overall score</span>
              <strong>{formatPercent(overallScore)}</strong>
              <small>Latest validation</small>
            </div>
            <div className="stat-card">
              <span>Verdict</span>
              <strong>{verdict}</strong>
              <small>AI confidence signal</small>
            </div>
            <div className="stat-card">
              <span>Risks flagged</span>
              <strong>{typeof riskCount === 'number' ? riskCount : '--'}</strong>
              <small>Mitigation guidance</small>
            </div>
            <div className="stat-card">
              <span>Risk score</span>
              <strong>{formatPercent(riskScore)}</strong>
              <small>Lower is safer</small>
            </div>
          </div>
        </section>
        <section className="workspace-panel">
          <div className="section-heading">
            <h1>Validate a startup idea</h1>
            <p>Submit the core business details and receive structured AI feedback.</p>
          </div>

          {error && <div className="alert error">{error}</div>}

          <form className="form startup-form" onSubmit={handleSubmit}>
            <div className="form-section-title">Basics</div>
            <label className="form-field">
              <span className="label-row">
                Startup name
                <span className="help-tip" data-tip="Keep it short and memorable." aria-label="Keep it short and memorable.">
                  i
                </span>
              </span>
              <input
                name="startupName"
                type="text"
                value={formData.startupName}
                onChange={handleChange}
                required
              />
            </label>

            <label className="form-field">
              <span className="label-row">
                Industry
                <span className="help-tip" data-tip="Describe the sector you operate in." aria-label="Describe the sector you operate in.">
                  i
                </span>
              </span>
              <input
                name="industry"
                type="text"
                value={formData.industry}
                onChange={handleChange}
                required
              />
            </label>

            <label className="form-field">
              <span className="label-row">
                Location
                <span className="help-tip" data-tip="Primary region where you will launch first." aria-label="Primary region where you will launch first.">
                  i
                </span>
              </span>
              <select name="location" value={formData.location} onChange={handleChange} required>
                <option value="" disabled>
                  Select a region
                </option>
                <option value="North America">North America</option>
                <option value="South America">South America</option>
                <option value="Europe">Europe</option>
                <option value="Middle East">Middle East</option>
                <option value="Africa">Africa</option>
                <option value="South Asia">South Asia</option>
                <option value="Southeast Asia">Southeast Asia</option>
                <option value="East Asia">East Asia</option>
                <option value="Oceania">Oceania</option>
                <option value="Remote or global">Remote or global</option>
              </select>
            </label>

            <label className="form-field">
              <span className="label-row">
                Stage
                <span className="help-tip" data-tip="Current maturity of the product." aria-label="Current maturity of the product.">
                  i
                </span>
              </span>
              <select name="stage" value={formData.stage} onChange={handleChange} required>
                <option value="" disabled>
                  Select stage
                </option>
                <option value="Idea">Idea</option>
                <option value="MVP">MVP</option>
                <option value="Early traction">Early traction</option>
                <option value="Growth">Growth</option>
                <option value="Scaling">Scaling</option>
              </select>
            </label>

            <label className="form-field">
              <span className="label-row">
                Team size
                <span className="help-tip" data-tip="Number of core team members." aria-label="Number of core team members.">
                  i
                </span>
              </span>
              <input
                name="teamSize"
                type="number"
                min="1"
                value={formData.teamSize}
                onChange={handleChange}
                required
              />
            </label>

            <label className="form-field">
              <span className="label-row">
                Funding stage
                <span className="help-tip" data-tip="How is the idea currently funded?" aria-label="How is the idea currently funded?">
                  i
                </span>
              </span>
              <select name="fundingStage" value={formData.fundingStage} onChange={handleChange} required>
                <option value="" disabled>
                  Select funding
                </option>
                <option value="Bootstrapped">Bootstrapped</option>
                <option value="Pre-seed">Pre-seed</option>
                <option value="Seed">Seed</option>
                <option value="Series A">Series A</option>
                <option value="Series B+">Series B+</option>
                <option value="Grant">Grant</option>
              </select>
            </label>

            <div className="form-section-title">Market and product</div>
            <label className="form-field full-width">
              <span className="label-row">
                Target audience
                <span className="help-tip" data-tip="Who feels the pain most?" aria-label="Who feels the pain most?">
                  i
                </span>
              </span>
              <textarea
                name="targetAudience"
                value={formData.targetAudience}
                onChange={handleChange}
                required
              />
            </label>

            <label className="form-field full-width">
              <span className="label-row">
                Problem statement
                <span className="help-tip" data-tip="Define the problem with clear stakes." aria-label="Define the problem with clear stakes.">
                  i
                </span>
              </span>
              <textarea
                name="problemStatement"
                value={formData.problemStatement}
                onChange={handleChange}
                required
              />
            </label>

            <label className="form-field full-width">
              <span className="label-row">
                Proposed solution
                <span className="help-tip" data-tip="How do you solve the problem?" aria-label="How do you solve the problem?">
                  i
                </span>
              </span>
              <textarea
                name="proposedSolution"
                value={formData.proposedSolution}
                onChange={handleChange}
                required
              />
            </label>

            <label className="form-field full-width">
              <span className="label-row">
                Unique value proposition
                <span className="help-tip" data-tip="What makes you meaningfully different?" aria-label="What makes you meaningfully different?">
                  i
                </span>
              </span>
              <textarea
                name="uniqueValueProposition"
                value={formData.uniqueValueProposition}
                onChange={handleChange}
                required
              />
            </label>

            <label className="form-field full-width">
              <span className="label-row">
                Competitive landscape
                <span className="help-tip" data-tip="Who are you up against today?" aria-label="Who are you up against today?">
                  i
                </span>
              </span>
              <textarea
                name="competition"
                value={formData.competition}
                onChange={handleChange}
                required
              />
            </label>

            <label className="form-field full-width">
              <span className="label-row">
                Traction signals
                <span className="help-tip" data-tip="Evidence like users, LOIs, pilots, or revenue." aria-label="Evidence like users, LOIs, pilots, or revenue.">
                  i
                </span>
              </span>
              <textarea
                name="traction"
                value={formData.traction}
                onChange={handleChange}
                required
              />
            </label>

            <label className="form-field full-width">
              <span className="label-row">
                Go-to-market plan
                <span className="help-tip" data-tip="How will you reach and convert customers?" aria-label="How will you reach and convert customers?">
                  i
                </span>
              </span>
              <textarea
                name="goToMarket"
                value={formData.goToMarket}
                onChange={handleChange}
                required
              />
            </label>

            <div className="form-section-title">Business model</div>
            <label className="form-field full-width">
              <span className="label-row">
                Revenue model
                <span className="help-tip" data-tip="How do you make money?" aria-label="How do you make money?">
                  i
                </span>
              </span>
              <textarea
                name="revenueModel"
                value={formData.revenueModel}
                onChange={handleChange}
                required
              />
            </label>

            <label className="form-field full-width">
              <span className="label-row">
                Pricing strategy
                <span className="help-tip" data-tip="Price points or tiers you plan to test." aria-label="Price points or tiers you plan to test.">
                  i
                </span>
              </span>
              <textarea
                name="pricing"
                value={formData.pricing}
                onChange={handleChange}
                required
              />
            </label>

            <label className="form-field full-width">
              <span className="label-row">
                Timeline
                <span className="help-tip" data-tip="Key milestones for the next 6-12 months." aria-label="Key milestones for the next 6-12 months.">
                  i
                </span>
              </span>
              <textarea
                name="timeline"
                value={formData.timeline}
                onChange={handleChange}
                required
              />
            </label>

            <button className="primary-button" type="submit" disabled={loading}>
              {loading ? 'Validating...' : 'Validate idea'}
            </button>
          </form>

          {latestInsights && <InsightsPanel insights={latestInsights} />}
        </section>

        <aside className="history-panel">
          <div className="section-heading">
            <h2>Validation workspace</h2>
            <p>Jump into your saved reports and trends.</p>
          </div>
          <div className="history-list">
            <Link className="history-item" to="/validations">
              <strong>View all validations</strong>
              <span>Browse every report you have generated.</span>
              <small>Open validation list</small>
            </Link>
            
          </div>
        </aside>
      </main>

      <div className="demo-fab" aria-live="polite">
        <button
          className="demo-fab__button"
          type="button"
          onClick={handleDemoFill}
          title={`Fill demo: ${nextDemo.label}`}
        >
          <span className="demo-fab__badge">Demo</span>
          <span className="demo-fab__text">Fill: {nextDemo.label}</span>
        </button>
      </div>
    </div>
  );
}

export default DashboardPage;
