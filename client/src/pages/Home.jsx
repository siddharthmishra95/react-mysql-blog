import { useEffect, useState } from 'react';
import { fetchPosts } from '../api/posts.js';
import PostCard from '../components/PostCard.jsx';

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPosts()
      .then((data) => {
        setPosts(data);
        setStatus('done');
      })
      .catch((err) => {
        setError(err.message);
        setStatus('error');
      });
  }, []);

  if (status === 'loading') return <p>Loading posts…</p>;
  if (status === 'error') return <p className="error">Failed to load posts: {error}</p>;
  if (posts.length === 0) return <p>No posts yet. Create the first one!</p>;

  return (
    <div className="post-list">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
