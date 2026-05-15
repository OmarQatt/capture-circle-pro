import { Router, Response } from 'express';
import pool from '../database/pool.js';
import { authenticate, requireRole } from '../middleware/authenticate.js';
import type { ApiResponse } from '../types/index.js';

const router = Router();
router.use(authenticate, requireRole('admin'));

// ── Locations ────────────────────────────────────────────────────────────────
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
    if (!['approved', 'rejected'].includes(status))
      return res.status(400).json({ success: false, error: 'Invalid status' });
    const { rows } = await pool.query(
      'UPDATE locations SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [status, req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to update status' });
  }
});

// ── Equipment ────────────────────────────────────────────────────────────────
router.get('/equipment/pending', async (_req, res: Response<ApiResponse<any[]>>) => {
  try {
    const { rows } = await pool.query(
      `SELECT e.*, u.first_name, u.last_name, u.email
       FROM equipment e JOIN users u ON e.user_id = u.id
       WHERE e.approval_status = 'pending' ORDER BY e.created_at DESC`
    );
    res.json({ success: true, data: rows, meta: { total: rows.length } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to fetch pending equipment' });
  }
});

router.patch('/equipment/:id/status', async (req, res: Response<ApiResponse<any>>) => {
  try {
    const { status } = req.body;
    if (!['approved', 'rejected'].includes(status))
      return res.status(400).json({ success: false, error: 'Invalid status' });
    const { rows } = await pool.query(
      'UPDATE equipment SET approval_status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [status, req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to update status' });
  }
});

// ── Crew ─────────────────────────────────────────────────────────────────────
router.get('/crew/pending', async (_req, res: Response<ApiResponse<any[]>>) => {
  try {
    const { rows } = await pool.query(
      `SELECT cp.*, u.first_name, u.last_name, u.email
       FROM crew_profiles cp JOIN users u ON cp.user_id = u.id
       WHERE cp.status = 'pending' ORDER BY cp.created_at DESC`
    );
    res.json({ success: true, data: rows, meta: { total: rows.length } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to fetch pending crew' });
  }
});

router.patch('/crew/:id/status', async (req, res: Response<ApiResponse<any>>) => {
  try {
    const { status } = req.body;
    if (!['approved', 'rejected'].includes(status))
      return res.status(400).json({ success: false, error: 'Invalid status' });
    const { rows } = await pool.query(
      'UPDATE crew_profiles SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [status, req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to update status' });
  }
});

// ── Talent ───────────────────────────────────────────────────────────────────
router.get('/talent/pending', async (_req, res: Response<ApiResponse<any[]>>) => {
  try {
    const { rows } = await pool.query(
      `SELECT tp.*, u.first_name, u.last_name, u.email
       FROM talent_profiles tp JOIN users u ON tp.user_id = u.id
       WHERE tp.status = 'pending' ORDER BY tp.created_at DESC`
    );
    res.json({ success: true, data: rows, meta: { total: rows.length } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to fetch pending talent' });
  }
});

router.patch('/talent/:id/status', async (req, res: Response<ApiResponse<any>>) => {
  try {
    const { status } = req.body;
    if (!['approved', 'rejected'].includes(status))
      return res.status(400).json({ success: false, error: 'Invalid status' });
    const { rows } = await pool.query(
      'UPDATE talent_profiles SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [status, req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to update status' });
  }
});

// ── Bookings & Users ─────────────────────────────────────────────────────────
router.get('/bookings', async (req, res: Response<ApiResponse<any[]>>) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 100, 500);
    const { rows } = await pool.query('SELECT * FROM bookings ORDER BY created_at DESC LIMIT $1', [limit]);
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
