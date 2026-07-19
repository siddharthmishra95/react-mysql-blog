import pool from '../db/pool.js';

// Shared SELECT that exposes the author's username alongside the post.
const POST_SELECT = `
  SELECT p.id, p.user_id, p.title, p.content, p.created_at, p.updated_at, u.username AS author
  FROM posts p
  JOIN users u ON u.id = p.user_id`;

// GET /api/posts
export async function listPosts(req, res, next) {
  try {
    const [rows] = await pool.query(`${POST_SELECT} ORDER BY p.created_at DESC`);
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

// GET /api/posts/:id
export async function getPost(req, res, next) {
  try {
    const [rows] = await pool.query(`${POST_SELECT} WHERE p.id = ?`, [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
}

// POST /api/posts  (requires auth)
export async function createPost(req, res, next) {
  try {
    const { title, content } = req.body;
    if (!title?.trim() || !content?.trim()) {
      return res.status(400).json({ error: 'title and content are required' });
    }
    const [result] = await pool.query(
      'INSERT INTO posts (user_id, title, content) VALUES (?, ?, ?)',
      [req.user.id, title.trim(), content.trim()]
    );
    const [rows] = await pool.query(`${POST_SELECT} WHERE p.id = ?`, [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
}

// PUT /api/posts/:id  (requires auth; author only)
export async function updatePost(req, res, next) {
  try {
    const { title, content } = req.body;
    if (!title?.trim() || !content?.trim()) {
      return res.status(400).json({ error: 'title and content are required' });
    }

    const owner = await getOwner(req.params.id);
    if (owner === null) {
      return res.status(404).json({ error: 'Post not found' });
    }
    if (owner !== req.user.id) {
      return res.status(403).json({ error: 'You can only edit your own posts' });
    }

    await pool.query('UPDATE posts SET title = ?, content = ? WHERE id = ?', [
      title.trim(),
      content.trim(),
      req.params.id,
    ]);
    const [rows] = await pool.query(`${POST_SELECT} WHERE p.id = ?`, [req.params.id]);
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
}

// DELETE /api/posts/:id  (requires auth; author only)
export async function deletePost(req, res, next) {
  try {
    const owner = await getOwner(req.params.id);
    if (owner === null) {
      return res.status(404).json({ error: 'Post not found' });
    }
    if (owner !== req.user.id) {
      return res.status(403).json({ error: 'You can only delete your own posts' });
    }
    await pool.query('DELETE FROM posts WHERE id = ?', [req.params.id]);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

// Returns the post's owner user_id, or null if the post doesn't exist.
async function getOwner(postId) {
  const [rows] = await pool.query('SELECT user_id FROM posts WHERE id = ?', [postId]);
  return rows.length === 0 ? null : rows[0].user_id;
}
