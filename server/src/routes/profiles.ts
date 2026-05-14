import { Router, Response } from 'express';
import pool from '../database/pool.js';
import { authenticate } from '../middleware/authenticate.js';
import type { ApiResponse } from '../types/index.js';

const router = Router();

router.get('/me', authenticate, async (req, res: Response<ApiResponse<any>>) => {
  try {
    const { rows } = await pool.query(
      `SELECT u.id, u.email, u.first_name, u.last_name, u.phone, u.avatar_url, u.role, u.created_at,
              ur.role AS assigned_role
       FROM users u
       LEFT JOIN user_roles ur ON u.id = ur.user_id
       WHERE u.id = $1`,
      [req.user!.userId]
    );
    if (rows.length === 0) return res.status(404).json({ success: false, error: 'User not found' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to fetch profile' });
  }
});

router.get('/:userId', async (req, res: Response<ApiResponse<any>>) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, email, first_name, last_name, avatar_url, role, created_at FROM users WHERE id = $1',
      [req.params.userId]
    );
    if (rows.length === 0) return res.status(404).json({ success: false, error: 'User not found' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to fetch profile' });
  }
});

export default router;
