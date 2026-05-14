import { Router, Response } from 'express';
import pool from '../database/pool.js';
import { authenticate, requireRole } from '../middleware/authenticate.js';
import type { ApiResponse } from '../types/index.js';

const router = Router();
router.use(authenticate, requireRole('admin'));

router.get('/locations/pending', async (_req, res: Response<ApiResponse<any[]>>) => {
  try {
    const { rows } = await pool.query(
      `SELECT l.*, u.first_name, u.last_name, u.email
       FROM locations l JOIN users u ON l.user_id = u.id
       WHERE l.status = 'pending' ORDER BY l.created_at DESC`
    );
    res.json({ success: true, data: rows, meta: { total: rows.length } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to fetch pending locations' });
  }
});

router.patch('/locations/:id/status', async (req, res: Response<ApiResponse<any>>) => {
  try {
    const { status } = req.body;
    if (!['approved','rejected'].includes(status))
      return res.status(400).json({ success: false, error: 'Status must be approved or rejected' });

    const { rows } = await pool.query(
      'UPDATE locations SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [status, req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ success: false, error: 'Location not found' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to update location status' });
  }
});

router.get('/bookings', async (req, res: Response<ApiResponse<any[]>>) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 100, 500);
    const { rows } = await pool.query(
      'SELECT * FROM bookings ORDER BY created_at DESC LIMIT $1', [limit]
    );
    res.json({ success: true, data: rows, meta: { total: rows.length } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to fetch bookings' });
  }
});

router.get('/users', async (_req, res: Response<ApiResponse<any[]>>) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, email, first_name, last_name, role, created_at FROM users ORDER BY created_at DESC'
    );
    res.json({ success: true, data: rows, meta: { total: rows.length } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to fetch users' });
  }
});

export default router;
