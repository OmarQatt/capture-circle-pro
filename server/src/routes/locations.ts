import { Router, Request, Response } from 'express';
import pool from '../database/pool.js';
import { authenticate } from '../middleware/authenticate.js';
import type { ApiResponse, Location } from '../types/index.js';

const router = Router();

router.get('/my-locations', authenticate, async (req, res: Response<ApiResponse<Location[]>>) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM locations WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user!.userId]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to fetch locations' });
  }
});

router.get('/', async (_req, res: Response<ApiResponse<Location[]>>) => {
  try {
    const { rows } = await pool.query(
      `SELECT l.*, u.first_name, u.last_name, u.avatar_url
       FROM locations l JOIN users u ON l.user_id = u.id
       WHERE l.status = 'approved' ORDER BY l.created_at DESC`
    );
    res.json({ success: true, data: rows, meta: { total: rows.length } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to fetch locations' });
  }
});

router.get('/:id', async (req, res: Response<ApiResponse<any>>) => {
  try {
    const { rows } = await pool.query(
      `SELECT l.*, u.first_name, u.last_name, u.avatar_url
       FROM locations l JOIN users u ON l.user_id = u.id
       WHERE l.id = $1`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ success: false, error: 'Location not found' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to fetch location' });
  }
});

router.post('/', authenticate, async (req, res: Response<ApiResponse<Location>>) => {
  try {
    const { name, description, address, city, country, category, price_per_6hours, price_per_12hours, price_per_day, images, latitude, longitude } = req.body;
    if (!name) return res.status(400).json({ success: false, error: 'Name is required' });

    const { rows } = await pool.query(
      `INSERT INTO locations (user_id,name,description,address,city,country,category,price_per_6hours,price_per_12hours,price_per_day,images,latitude,longitude,status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,'pending') RETURNING *`,
      [req.user!.userId, name, description ?? null, address ?? null, city ?? null, country ?? null, category ?? null, price_per_6hours ?? null, price_per_12hours ?? null, price_per_day ?? null, images ?? [], latitude ?? null, longitude ?? null]
    );
    res.status(201).json({ success: true, data: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to create location' });
  }
});

router.patch('/:id', authenticate, async (req, res: Response<ApiResponse<Location>>) => {
  try {
    const { rows: existing } = await pool.query('SELECT user_id FROM locations WHERE id = $1', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ success: false, error: 'Location not found' });
    if (existing[0].user_id !== req.user!.userId) return res.status(403).json({ success: false, error: 'Unauthorized' });

    const allowed = ['name','description','address','city','country','category','price_per_6hours','price_per_12hours','price_per_day','images','latitude','longitude'];
    const fields = Object.keys(req.body).filter(k => allowed.includes(k));
    if (fields.length === 0) return res.status(400).json({ success: false, error: 'No valid fields to update' });

    const set = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
    const vals = [...fields.map(f => req.body[f]), req.params.id];
    const { rows } = await pool.query(
      `UPDATE locations SET ${set}, status = 'pending', updated_at = NOW() WHERE id = $${fields.length + 1} RETURNING *`,
      vals
    );
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to update location' });
  }
});

router.delete('/:id', authenticate, async (req, res: Response<ApiResponse<null>>) => {
  try {
    const { rows } = await pool.query('SELECT user_id, images FROM locations WHERE id = $1', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ success: false, error: 'Location not found' });
    if (rows[0].user_id !== req.user!.userId) return res.status(403).json({ success: false, error: 'Unauthorized' });
    await pool.query('DELETE FROM locations WHERE id = $1', [req.params.id]);
    const { deleteStorageFiles } = await import('../utils/storage.js');
    await deleteStorageFiles(rows[0].images || []);
    res.json({ success: true, data: null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to delete location' });
  }
});

export default router;
