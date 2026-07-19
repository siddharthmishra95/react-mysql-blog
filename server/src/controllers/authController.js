import bcrypt from 'bcryptjs';
import pool from '../db/pool.js';
import { signToken } from '../middleware/auth.js';

// POST /api/auth/register
export async function register(req, res, next) {
  try {
    const { username, email, password } = req.body;
    if (!username?.trim() || !email?.trim() || !password) {
      return res.status(400).json({ error: 'username, email and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'password must be at least 6 characters' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    let result;
    try {
      [result] = await pool.query(
        'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
        [username.trim(), email.trim(), passwordHash]
      );
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ error: 'username or email already taken' });
      }
      throw err;
    }

    const user = { id: result.insertId, username: username.trim(), email: email.trim() };
    res.status(201).json({ user, token: signToken(user) });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/login
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email?.trim() || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }

    const [rows] = await pool.query(
      'SELECT id, username, email, password_hash FROM users WHERE email = ?',
      [email.trim()]
    );
    const row = rows[0];
    if (!row || !(await bcrypt.compare(password, row.password_hash))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = { id: row.id, username: row.username, email: row.email };
    res.json({ user, token: signToken(user) });
  } catch (err) {
    next(err);
  }
}

// GET /api/auth/me  (requires auth)
export async function me(req, res, next) {
  try {
    const [rows] = await pool.query(
      'SELECT id, username, email, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
}
