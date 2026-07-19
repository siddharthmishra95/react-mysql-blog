import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [values, setValues] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e) {
    setValues((v) => ({ ...v, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await register(values);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <h1>Sign up</h1>
      <form onSubmit={handleSubmit} className="post-form">
        {error && <p className="error">{error}</p>}
        <label>
          Username
          <input name="username" value={values.username} onChange={handleChange} required />
        </label>
        <label>
          Email
          <input type="email" name="email" value={values.email} onChange={handleChange} required />
        </label>
        <label>
          Password
          <input
            type="password"
            name="password"
            value={values.password}
            onChange={handleChange}
            minLength={6}
            required
          />
        </label>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Creating account…' : 'Sign up'}
        </button>
      </form>
      <p className="meta">
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </div>
  );
}
