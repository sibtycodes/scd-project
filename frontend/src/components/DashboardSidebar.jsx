import { NavLink } from 'react-router-dom';

function DashboardSidebar() {
  return (
    <aside className="dashboard-sidebar">
      <div className="sidebar-panel">
        <p className="sidebar-label">Workspace</p>
        <nav className="sidebar-nav">
          <NavLink
            className={({ isActive }) => `sidebar-link${isActive ? ' is-active' : ''}`}
            to="/dashboard"
          >
            Main dashboard
          </NavLink>
          <NavLink
            className={({ isActive }) => `sidebar-link${isActive ? ' is-active' : ''}`}
            to="/validations"
          >
            Validations
          </NavLink>
        </nav>
      </div>
      <div className="sidebar-panel sidebar-panel--note">
        <p className="sidebar-label">Quick tips</p>
        <p className="sidebar-note">
          Use the validations list to track patterns across ideas and compare scores over time.
        </p>
      </div>
    </aside>
  );
}

export default DashboardSidebar;
