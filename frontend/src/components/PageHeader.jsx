import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

function PageHeader() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="topbar">
      <Link className="brand" to="/dashboard">
        AI Startup Validator
      </Link>
      <div className="topbar-actions">
        {user && <span className="user-chip">{user.username}</span>}
        <button className="secondary-button" type="button" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </header>
  );
}

export default PageHeader;
