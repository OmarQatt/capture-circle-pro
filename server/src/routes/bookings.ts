import { Router, Response } from 'express';
import pool from '../database/pool.js';
import { authenticate } from '../middleware/authenticate.js';
import type { ApiResponse, Booking } from '../types/index.js';

const router = Router();

router.get('/my-bookings', authenticate, async (req, res: Response<ApiResponse<Booking[]>>) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 100);
    const { rows } = await pool.query(
      `SELECT * FROM bookings WHERE client_id = $1 OR provider_id = $1
       ORDER BY created_at DESC LIMIT $2`,
      [req.user!.userId, limit]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to fetch bookings' });
  }
});

router.get('/:id', authenticate, async (req, res: Response<ApiResponse<Booking>>) => {
  try {
    const { rows } = await pool.query('SELECT * FROM bookings WHERE id = $1', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ success: false, error: 'Booking not found' });
    const b = rows[0];
    if (b.client_id !== req.user!.userId && b.provider_id !== req.user!.userId)
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    res.json({ success: true, data: b });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to fetch booking' });
  }
});

router.post('/', authenticate, async (req, res: Response<ApiResponse<Booking>>) => {
  try {
    const { provider_id, service_id, service_type, start_date, end_date, total_price, notes } = req.body;
    if (!provider_id || !service_id || !service_type || !start_date || !end_date)
      return res.status(400).json({ success: false, error: 'Missing required fields' });

    const { rows } = await pool.query(
      `INSERT INTO bookings (client_id,provider_id,service_id,service_type,start_date,end_date,total_price,notes,status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'pending') RETURNING *`,
      [req.user!.userId, provider_id, service_id, service_type, start_date, end_date, total_price ?? null, notes ?? null]
    );
    res.status(201).json({ success: true, data: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to create booking' });
  }
});

router.patch('/:id/status', authenticate, async (req, res: Response<ApiResponse<Booking>>) => {
  try {
    const { status } = req.body;
    const valid = ['pending','confirmed','completed','cancelled'];
    if (!valid.includes(status)) return res.status(400).json({ success: false, error: 'Invalid status' });

    const { rows: existing } = await pool.query('SELECT * FROM bookings WHERE id = $1', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ success: false, error: 'Booking not found' });
    const b = existing[0];
    if (b.client_id !== req.user!.userId && b.provider_id !== req.user!.userId)
      return res.status(403).json({ success: false, error: 'Unauthorized' });

    const { rows } = await pool.query(
      'UPDATE bookings SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [status, req.params.id]
    );
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to update booking' });
  }
});

export default router;
