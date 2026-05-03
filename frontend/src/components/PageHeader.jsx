import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

function PageHeader() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="topbar">
      <Link className="brand" to="/">
        AI Startup Validator
      </Link>
      <div className="topbar-actions">
        <Link className="topbar-link" to="/dashboard">
          Dashboard
        </Link>
        <Link className="topbar-link" to="/validations">
          Validations
        </Link>
        {user && <span className="user-chip">{user.username}</span>}
        {isAuthenticated && (
          <button className="secondary-button" type="button" onClick={handleLogout}>
            Logout
          </button>
        )}
      </div>
    </header>
  );
}

export default PageHeader;
