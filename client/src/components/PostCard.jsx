import { Link } from 'react-router-dom';

export default function PostCard({ post }) {
  const excerpt =
    post.content.length > 160 ? `${post.content.slice(0, 160)}…` : post.content;

  return (
    <article className="card">
      <h2>
        <Link to={`/posts/${post.id}`}>{post.title}</Link>
      </h2>
      <p className="meta">by {post.author}</p>
      <p>{excerpt}</p>
    </article>
  );
}
