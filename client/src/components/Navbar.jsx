import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        React MySQL Blog
      </Link>
      <Link to="/new" className="btn btn-primary">
        New Post
      </Link>
    </nav>
  );
}
