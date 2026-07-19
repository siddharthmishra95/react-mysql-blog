import pool from '../db/pool.js';

// GET /api/posts/:postId/comments
export async function listComments(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT c.id, c.post_id, c.user_id, c.content, c.created_at, u.username AS author
       FROM comments c
       JOIN users u ON u.id = c.user_id
       WHERE c.post_id = ?
       ORDER BY c.created_at ASC`,
      [req.params.postId]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

// POST /api/posts/:postId/comments  (requires auth)
export async function createComment(req, res, next) {
  try {
    const { content } = req.body;
    if (!content?.trim()) {
      return res.status(400).json({ error: 'content is required' });
    }

    // Ensure the post exists so we return 404 rather than a FK error.
    const [posts] = await pool.query('SELECT id FROM posts WHERE id = ?', [req.params.postId]);
    if (posts.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const [result] = await pool.query(
      'INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)',
      [req.params.postId, req.user.id, content.trim()]
    );
    const [rows] = await pool.query(
      `SELECT c.id, c.post_id, c.user_id, c.content, c.created_at, u.username AS author
       FROM comments c JOIN users u ON u.id = c.user_id
       WHERE c.id = ?`,
      [result.insertId]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
}

// DELETE /api/comments/:id  (requires auth; author only)
export async function deleteComment(req, res, next) {
  try {
    const [rows] = await pool.query('SELECT user_id FROM comments WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    if (rows[0].user_id !== req.user.id) {
      return res.status(403).json({ error: 'You can only delete your own comments' });
    }
    await pool.query('DELETE FROM comments WHERE id = ?', [req.params.id]);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}
