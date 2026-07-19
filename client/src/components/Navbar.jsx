import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        React MySQL Blog
      </Link>
      <div className="navbar-actions">
        {user ? (
          <>
            <Link to="/new" className="btn btn-primary">
              New Post
            </Link>
            <span className="navbar-user">Hi, {user.username}</span>
            <button onClick={handleLogout} className="btn">
              Log out
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn">
              Log in
            </Link>
            <Link to="/register" className="btn btn-primary">
              Sign up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
