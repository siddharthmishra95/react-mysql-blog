import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fetchPost, deletePost } from '../api/posts.js';

export default function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPost(id)
      .then((data) => {
        setPost(data);
        setStatus('done');
      })
      .catch((err) => {
        setError(err.message);
        setStatus('error');
      });
  }, [id]);

  async function handleDelete() {
    if (!window.confirm('Delete this post?')) return;
    try {
      await deletePost(id);
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  }

  if (status === 'loading') return <p>Loading…</p>;
  if (status === 'error') return <p className="error">{error}</p>;

  return (
    <article className="post-detail">
      <h1>{post.title}</h1>
      <p className="meta">by {post.author}</p>
      <div className="content">{post.content}</div>
      <div className="actions">
        <Link to={`/posts/${post.id}/edit`} className="btn">
          Edit
        </Link>
        <button onClick={handleDelete} className="btn btn-danger">
          Delete
        </button>
        <Link to="/" className="btn">
          Back
        </Link>
      </div>
    </article>
  );
}
