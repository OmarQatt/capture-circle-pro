import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../database/pool.js';
import { authenticate } from '../middleware/authenticate.js';
import type { User } from '../types/index.js';

const router = Router();

const makeTokens = (user: User) => ({
  accessToken: jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET!,
    { expiresIn: '15m' }
  ),
  refreshToken: jwt.sign(
    { userId: user.id },
    process.env.JWT_SECRET!,
    { expiresIn: '7d' }
  ),
});

const safeUser = (user: User) => {
  const { password_hash: _, ...rest } = user;
  return rest;
};

router.post('/signup', async (req: Request, res: Response) => {
  try {
    const { email, password, first_name, last_name, role } = req.body;
    if (!email || !password || !role)
      return res.status(400).json({ success: false, error: 'email, password and role are required' });

    const exists = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (exists.rows.length > 0)
      return res.status(409).json({ success: false, error: 'Email already registered' });

    const hash = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, role)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [email, hash, first_name || null, last_name || null, role]
    );
    const user = rows[0] as User;

    await pool.query(
      `INSERT INTO profiles (user_id, first_name, last_name, role) VALUES ($1,$2,$3,$4)`,
      [user.id, first_name || null, last_name || null, role]
    );

    const { accessToken, refreshToken } = makeTokens(user);
    const tokenHash = await bcrypt.hash(refreshToken, 6);
    await pool.query(
      `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
       VALUES ($1,$2, NOW() + INTERVAL '7 days')`,
      [user.id, tokenHash]
    );

    res.json({ success: true, data: { accessToken, refreshToken, user: safeUser(user) } });
  } catch (err: any) {
    console.error('Signup error:', err.message, err.detail, err.code);
    res.status(500).json({ success: false, error: err.message || 'Signup failed' });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, error: 'Email and password required' });

    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (rows.length === 0 || !(await bcrypt.compare(password, rows[0].password_hash)))
      return res.status(401).json({ success: false, error: 'Invalid credentials' });

    const user = rows[0] as User;
    const { accessToken, refreshToken } = makeTokens(user);
    const tokenHash = await bcrypt.hash(refreshToken, 6);
    await pool.query(
      `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
       VALUES ($1,$2, NOW() + INTERVAL '7 days')`,
      [user.id, tokenHash]
    );

    res.json({ success: true, data: { accessToken, refreshToken, user: safeUser(user) } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, error: 'Login failed' });
  }
});

router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken)
      return res.status(400).json({ success: false, error: 'Refresh token required' });

    let payload: any;
    try { payload = jwt.verify(refreshToken, process.env.JWT_SECRET!); }
    catch { return res.status(401).json({ success: false, error: 'Invalid refresh token' }); }

    const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [payload.userId]);
    if (rows.length === 0)
      return res.status(401).json({ success: false, error: 'User not found' });

    const user = rows[0] as User;
    const { accessToken, refreshToken: newRefresh } = makeTokens(user);
    const tokenHash = await bcrypt.hash(newRefresh, 6);
    await pool.query(
      `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
       VALUES ($1,$2, NOW() + INTERVAL '7 days')`,
      [user.id, tokenHash]
    );

    res.json({ success: true, data: { accessToken, refreshToken: newRefresh, user: safeUser(user) } });
  } catch (err) {
    console.error('Refresh error:', err);
    res.status(500).json({ success: false, error: 'Token refresh failed' });
  }
});

router.post('/logout', authenticate, (_req, res) => {
  res.json({ success: true });
});

export default router;
