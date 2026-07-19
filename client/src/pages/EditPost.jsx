import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PostForm from '../components/PostForm.jsx';
import { fetchPost, updatePost } from '../api/posts.js';

export default function EditPost() {
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

  async function handleSubmit(values) {
    await updatePost(id, values);
    navigate(`/posts/${id}`);
  }

  if (status === 'loading') return <p>Loading…</p>;
  if (status === 'error') return <p className="error">{error}</p>;

  return (
    <div>
      <h1>Edit Post</h1>
      <PostForm initialValues={post} onSubmit={handleSubmit} submitLabel="Save" />
    </div>
  );
}
