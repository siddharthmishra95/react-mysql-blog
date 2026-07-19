import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchComments, createComment, deleteComment } from '../api/comments.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Comments({ postId }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchComments(postId)
      .then((data) => {
        setComments(data);
        setStatus('done');
      })
      .catch((err) => {
        setError(err.message);
        setStatus('error');
      });
  }, [postId]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!content.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const comment = await createComment(postId, { content });
      setComments((c) => [...c, comment]);
      setContent('');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    try {
      await deleteComment(id);
      setComments((c) => c.filter((comment) => comment.id !== id));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section className="comments">
      <h2>Comments</h2>

      {status === 'loading' && <p>Loading comments…</p>}
      {status === 'error' && <p className="error">{error}</p>}

      {status === 'done' && comments.length === 0 && <p className="meta">No comments yet.</p>}

      <ul className="comment-list">
        {comments.map((comment) => (
          <li key={comment.id} className="comment">
            <p className="meta">
              <strong>{comment.author}</strong>
            </p>
            <p>{comment.content}</p>
            {user?.id === comment.user_id && (
              <button className="link-button" onClick={() => handleDelete(comment.id)}>
                Delete
              </button>
            )}
          </li>
        ))}
      </ul>

      {user ? (
        <form onSubmit={handleSubmit} className="comment-form">
          {error && <p className="error">{error}</p>}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Add a comment…"
            rows={3}
            required
          />
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Posting…' : 'Post comment'}
          </button>
        </form>
      ) : (
        <p className="meta">
          <Link to="/login">Log in</Link> to comment.
        </p>
      )}
    </section>
  );
}
