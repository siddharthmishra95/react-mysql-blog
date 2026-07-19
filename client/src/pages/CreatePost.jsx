import { useNavigate } from 'react-router-dom';
import PostForm from '../components/PostForm.jsx';
import { createPost } from '../api/posts.js';

export default function CreatePost() {
  const navigate = useNavigate();

  async function handleSubmit(values) {
    const post = await createPost(values);
    navigate(`/posts/${post.id}`);
  }

  return (
    <div>
      <h1>New Post</h1>
      <PostForm onSubmit={handleSubmit} submitLabel="Create" />
    </div>
  );
}
