import pool from '../db/pool.js';

// GET /api/posts
export async function listPosts(req, res, next) {
  try {
    const [rows] = await pool.query(
      'SELECT id, title, content, author, created_at, updated_at FROM posts ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

// GET /api/posts/:id
export async function getPost(req, res, next) {
  try {
    const [rows] = await pool.query('SELECT * FROM posts WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
}

// POST /api/posts
export async function createPost(req, res, next) {
  try {
    const { title, content, author } = req.body;
    if (!title?.trim() || !content?.trim()) {
      return res.status(400).json({ error: 'title and content are required' });
    }
    const [result] = await pool.query(
      'INSERT INTO posts (title, content, author) VALUES (?, ?, ?)',
      [title.trim(), content.trim(), author?.trim() || 'Anonymous']
    );
    const [rows] = await pool.query('SELECT * FROM posts WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
}

// PUT /api/posts/:id
export async function updatePost(req, res, next) {
  try {
    const { title, content, author } = req.body;
    if (!title?.trim() || !content?.trim()) {
      return res.status(400).json({ error: 'title and content are required' });
    }
    const [result] = await pool.query(
      'UPDATE posts SET title = ?, content = ?, author = ? WHERE id = ?',
      [title.trim(), content.trim(), author?.trim() || 'Anonymous', req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    const [rows] = await pool.query('SELECT * FROM posts WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
}

// DELETE /api/posts/:id
export async function deletePost(req, res, next) {
  try {
    const [result] = await pool.query('DELETE FROM posts WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}
