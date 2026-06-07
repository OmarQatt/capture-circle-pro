import { Router, Response } from 'express';
import pool from '../database/pool.js';
import { authenticate } from '../middleware/authenticate.js';
import type { ApiResponse, Booking } from '../types/index.js';

const router = Router();

router.get('/my-bookings', authenticate, async (req, res: Response<ApiResponse<Booking[]>>) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 100);
    const { rows } = await pool.query(
      `SELECT b.*, u.first_name AS client_first_name, u.last_name AS client_last_name
       FROM bookings b JOIN users u ON b.client_id = u.id
       WHERE b.client_id = $1 OR b.provider_id = $1
       ORDER BY b.created_at DESC LIMIT $2`,
      [req.user!.userId, limit]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to fetch bookings' });
  }
});

// Check how many bookings already exist on the same dates for a service (used by frontend for warning)
router.get('/availability', async (req, res: Response<ApiResponse<any>>) => {
  try {
    const { service_id, start_date, end_date } = req.query;
    if (!service_id || !start_date || !end_date)
      return res.status(400).json({ success: false, error: 'Missing params' });

    const { rows } = await pool.query(
      `SELECT id, start_date, end_date, booking_type, status
       FROM bookings
       WHERE service_id = $1
         AND status NOT IN ('cancelled','rejected')
         AND start_date <= $3 AND end_date >= $2`,
      [service_id, start_date, end_date]
    );
    res.json({ success: true, data: { overlapping: rows } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to check availability' });
  }
});

router.get('/blocked-dates', async (req, res: Response<ApiResponse<any>>) => {
  try {
    const { service_id } = req.query;
    if (!service_id) return res.status(400).json({ success: false, error: 'Missing service_id' });

    const { rows } = await pool.query(
      `SELECT start_date, end_date
       FROM bookings
       WHERE service_id = $1
         AND status NOT IN ('cancelled','rejected')
       ORDER BY start_date`,
      [service_id]
    );
    res.json({ success: true, data: { ranges: rows } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to fetch blocked dates' });
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

router.post('/external', authenticate, async (req, res: Response<ApiResponse<Booking>>) => {
  try {
    const { service_id, service_type, start_date, end_date, note } = req.body;
    if (!service_id || !service_type || !start_date || !end_date)
      return res.status(400).json({ success: false, error: 'Missing required fields' });

    let ownerCheck;
    if (service_type === 'location') {
      ownerCheck = await pool.query('SELECT id FROM locations WHERE id = $1 AND user_id = $2', [service_id, req.user!.userId]);
    } else if (service_type === 'equipment') {
      ownerCheck = await pool.query('SELECT id FROM equipment WHERE id = $1 AND user_id = $2', [service_id, req.user!.userId]);
    } else if (service_type === 'crew') {
      ownerCheck = await pool.query('SELECT id FROM crew_profiles WHERE id = $1 AND user_id = $2', [service_id, req.user!.userId]);
    } else if (service_type === 'talent') {
      ownerCheck = await pool.query('SELECT id FROM talent_profiles WHERE id = $1 AND user_id = $2', [service_id, req.user!.userId]);
    } else {
      return res.status(400).json({ success: false, error: 'Invalid service type' });
    }

    if (ownerCheck.rows.length === 0)
      return res.status(403).json({ success: false, error: 'You do not own this listing' });

    const { rows } = await pool.query(
      `INSERT INTO bookings (client_id,provider_id,service_id,service_type,start_date,end_date,notes,status,booking_type)
       VALUES ($1,$1,$2,$3,$4,$5,$6,'confirmed','day') RETURNING *`,
      [req.user!.userId, service_id, service_type, start_date, end_date,
       note ? `[External] ${note}` : '[External booking]']
    );
    res.status(201).json({ success: true, data: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to create external booking' });
  }
});

router.post('/', authenticate, async (req, res: Response<ApiResponse<Booking>>) => {
  try {
    const { provider_id, service_id, service_type, start_date, end_date, total_price, notes, booking_type } = req.body;
    if (!provider_id || !service_id || !service_type || !start_date || !end_date)
      return res.status(400).json({ success: false, error: 'Missing required fields' });

    const { rows } = await pool.query(
      `INSERT INTO bookings (client_id,provider_id,service_id,service_type,start_date,end_date,total_price,notes,status,booking_type)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'pending',$9) RETURNING *`,
      [req.user!.userId, provider_id, service_id, service_type, start_date, end_date,
       total_price ?? null, notes ?? null, booking_type ?? 'day']
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
    if (!['pending','confirmed','completed','cancelled'].includes(status))
      return res.status(400).json({ success: false, error: 'Invalid status' });

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

// Client requests an extension on an active booking
router.post('/:id/request-extension', authenticate, async (req, res: Response<ApiResponse<Booking>>) => {
  try {
    const { hours, note } = req.body;
    if (!hours || hours < 1) return res.status(400).json({ success: false, error: 'Extension hours required' });

    const { rows: existing } = await pool.query('SELECT * FROM bookings WHERE id = $1', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ success: false, error: 'Booking not found' });
    const b = existing[0];
    if (b.client_id !== req.user!.userId) return res.status(403).json({ success: false, error: 'Unauthorized' });
    if (b.status === 'cancelled') return res.status(400).json({ success: false, error: 'Booking is cancelled' });

    // Check if any other booking overlaps the extended period on the same service
    const { rows: conflicts } = await pool.query(
      `SELECT id, client_id, start_date, end_date FROM bookings
       WHERE service_id = $1 AND id != $2 AND status NOT IN ('cancelled')
       AND start_date = $3`,
      [b.service_id, b.id, b.end_date]
    );

    const { rows } = await pool.query(
      `UPDATE bookings
       SET extension_hours = $1, extension_status = 'pending', extension_note = $2, updated_at = NOW()
       WHERE id = $3 RETURNING *`,
      [hours, note ?? null, req.params.id]
    );
    res.json({
      success: true,
      data: rows[0],
      // Pass conflict info so frontend can warn
      ...(conflicts.length > 0 ? { warning: 'Another booking exists on the same day' } : {}),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to request extension' });
  }
});

// Owner approves or rejects an extension
router.patch('/:id/extension-status', authenticate, async (req, res: Response<ApiResponse<Booking>>) => {
  try {
    const { status } = req.body;
    if (!['approved', 'rejected'].includes(status))
      return res.status(400).json({ success: false, error: 'Status must be approved or rejected' });

    const { rows: existing } = await pool.query('SELECT * FROM bookings WHERE id = $1', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ success: false, error: 'Booking not found' });
    if (existing[0].provider_id !== req.user!.userId)
      return res.status(403).json({ success: false, error: 'Only the owner can respond to extensions' });

    const { rows } = await pool.query(
      'UPDATE bookings SET extension_status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [status, req.params.id]
    );
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to update extension' });
  }
});

export default router;
