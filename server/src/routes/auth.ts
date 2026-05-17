import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { Resend } from 'resend';
import pool from '../database/pool.js';
import { authenticate } from '../middleware/authenticate.js';
import type { User } from '../types/index.js';

const router = Router();
const resend = new Resend(process.env.RESEND_API_KEY);

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

const sendVerificationEmail = async (email: string, token: string) => {
  const baseUrl = process.env.CLIENT_URL || 'http://localhost:8080';
  const link = `${baseUrl}/verify-email?token=${token}`;

  await resend.emails.send({
    from: process.env.EMAIL_FROM || 'PreProduction <noreply@preproduction.app>',
    to: email,
    subject: 'Verify your PreProduction account',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#1a1310;color:#e8d5b0;border-radius:12px">
        <h1 style="color:#F59E0B;font-size:24px;margin-bottom:8px">Welcome to PreProduction</h1>
        <p style="color:#a89070;margin-bottom:24px">Click the button below to verify your email address and activate your account.</p>
        <a href="${link}" style="display:inline-block;background:#F59E0B;color:#1a1310;font-weight:700;padding:14px 28px;border-radius:8px;text-decoration:none;font-size:16px">Verify Email</a>
        <p style="color:#a89070;font-size:13px;margin-top:24px">This link expires in 24 hours. If you didn't sign up, you can safely ignore this email.</p>
        <p style="color:#6b5a4a;font-size:12px;margin-top:16px">${link}</p>
      </div>
    `,
  });
};

router.post('/signup', async (req: Request, res: Response) => {
  try {
    const { email, password, first_name, last_name, role = 'user' } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, error: 'Email and password are required' });

    const exists = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (exists.rows.length > 0)
      return res.status(409).json({ success: false, error: 'Email already registered' });

    const hash = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, role, email_verified)
       VALUES ($1,$2,$3,$4,$5,true) RETURNING *`,
      [email, hash, first_name || null, last_name || null, role]
    );
    const user = rows[0] as User;

    await pool.query(
      `INSERT INTO profiles (user_id, first_name, last_name, role) VALUES ($1,$2,$3,$4)`,
      [user.id, first_name || null, last_name || null, role]
    );

    res.status(201).json({ success: true, data: { message: 'Account created successfully.' } });
  } catch (err: any) {
    console.error('Signup error:', err.message, err.detail, err.code);
    res.status(500).json({ success: false, error: err.message || 'Signup failed' });
  }
});

router.get('/verify-email', async (req: Request, res: Response) => {
  try {
    const { token } = req.query;
    if (!token || typeof token !== 'string')
      return res.status(400).json({ success: false, error: 'Token is required' });

    const { rows } = await pool.query(
      `SELECT * FROM email_verification_tokens WHERE token = $1 AND expires_at > NOW()`,
      [token]
    );
    if (rows.length === 0)
      return res.status(400).json({ success: false, error: 'Invalid or expired verification link' });

    const { user_id } = rows[0];

    await pool.query(`UPDATE users SET email_verified = true WHERE id = $1`, [user_id]);
    await pool.query(`DELETE FROM email_verification_tokens WHERE user_id = $1`, [user_id]);

    const userRows = await pool.query(`SELECT * FROM users WHERE id = $1`, [user_id]);
    const user = userRows.rows[0] as User;

    const { accessToken, refreshToken } = makeTokens(user);
    const tokenHash = await bcrypt.hash(refreshToken, 6);
    await pool.query(
      `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
       VALUES ($1,$2, NOW() + INTERVAL '7 days')`,
      [user_id, tokenHash]
    );

    res.json({ success: true, data: { accessToken, refreshToken, user: safeUser(user) } });
  } catch (err) {
    console.error('Verify email error:', err);
    res.status(500).json({ success: false, error: 'Verification failed' });
  }
});

router.post('/resend-verification', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email)
      return res.status(400).json({ success: false, error: 'Email is required' });

    const { rows } = await pool.query(`SELECT * FROM users WHERE email = $1`, [email]);
    if (rows.length === 0)
      return res.status(200).json({ success: true, data: { message: 'If that email exists, a new link has been sent.' } });

    const user = rows[0] as User;
    if (user.email_verified)
      return res.status(400).json({ success: false, error: 'Email is already verified' });

    await pool.query(`DELETE FROM email_verification_tokens WHERE user_id = $1`, [user.id]);
    const token = crypto.randomBytes(48).toString('hex');
    await pool.query(
      `INSERT INTO email_verification_tokens (user_id, token, expires_at)
       VALUES ($1,$2, NOW() + INTERVAL '24 hours')`,
      [user.id, token]
    );

    sendVerificationEmail(email, token).catch(err =>
      console.error('Failed to resend verification email:', err.message)
    );

    res.json({ success: true, data: { message: 'A new verification email has been sent.' } });
  } catch (err) {
    console.error('Resend verification error:', err);
    res.status(500).json({ success: false, error: 'Failed to resend verification email' });
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

    if (!user.email_verified)
      return res.status(403).json({ success: false, error: 'EMAIL_NOT_VERIFIED' });

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
