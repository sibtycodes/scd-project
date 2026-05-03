import { Outlet } from 'react-router-dom';
import DashboardSidebar from './DashboardSidebar.jsx';
import PageHeader from './PageHeader.jsx';

function DashboardLayout() {
  return (
    <div className="app-shell">
      <PageHeader />
      <div className="app-layout">
        <DashboardSidebar />
        <div className="app-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default DashboardLayout;
