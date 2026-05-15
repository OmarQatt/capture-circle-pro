import { Router, Response } from 'express';
import pool from '../database/pool.js';
import { authenticate } from '../middleware/authenticate.js';
import type { ApiResponse, Equipment } from '../types/index.js';

const router = Router();

router.get('/my-equipment', authenticate, async (req, res: Response<ApiResponse<Equipment[]>>) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM equipment WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user!.userId]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to fetch equipment' });
  }
});

router.get('/', async (_req, res: Response<ApiResponse<Equipment[]>>) => {
  try {
    const { rows } = await pool.query(
      `SELECT e.*, u.first_name, u.last_name, u.avatar_url
       FROM equipment e JOIN users u ON e.user_id = u.id
       WHERE e.status = 'available' AND e.approval_status = 'approved'
       ORDER BY e.created_at DESC`
    );
    res.json({ success: true, data: rows, meta: { total: rows.length } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to fetch equipment' });
  }
});

router.get('/:id', async (req, res: Response<ApiResponse<any>>) => {
  try {
    const { rows } = await pool.query(
      `SELECT e.*, u.first_name, u.last_name, u.avatar_url
       FROM equipment e JOIN users u ON e.user_id = u.id WHERE e.id = $1`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ success: false, error: 'Equipment not found' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to fetch equipment' });
  }
});

router.post('/', authenticate, async (req, res: Response<ApiResponse<Equipment>>) => {
  try {
    const { name, brand, model, category, condition, daily_rate, description, images } = req.body;
    if (!name) return res.status(400).json({ success: false, error: 'Name is required' });

    const { rows } = await pool.query(
      `INSERT INTO equipment (user_id,name,brand,model,category,condition,daily_rate,description,images,status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'available') RETURNING *`,
      [req.user!.userId, name, brand ?? null, model ?? null, category ?? null, condition ?? null, daily_rate ?? null, description ?? null, images ?? []]
    );
    res.status(201).json({ success: true, data: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to create equipment' });
  }
});

router.patch('/:id', authenticate, async (req, res: Response<ApiResponse<Equipment>>) => {
  try {
    const { rows: existing } = await pool.query('SELECT user_id FROM equipment WHERE id = $1', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ success: false, error: 'Equipment not found' });
    if (existing[0].user_id !== req.user!.userId) return res.status(403).json({ success: false, error: 'Unauthorized' });

    const allowed = ['name','brand','model','category','condition','daily_rate','description','images','status'];
    const fields = Object.keys(req.body).filter(k => allowed.includes(k));
    if (fields.length === 0) return res.status(400).json({ success: false, error: 'No valid fields to update' });

    const set = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
    const vals = [...fields.map(f => req.body[f]), req.params.id];
    const { rows } = await pool.query(
      `UPDATE equipment SET ${set}, updated_at = NOW() WHERE id = $${fields.length + 1} RETURNING *`,
      vals
    );
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to update equipment' });
  }
});

router.delete('/:id', authenticate, async (req, res: Response<ApiResponse<null>>) => {
  try {
    const { rows } = await pool.query('SELECT user_id FROM equipment WHERE id = $1', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ success: false, error: 'Equipment not found' });
    if (rows[0].user_id !== req.user!.userId) return res.status(403).json({ success: false, error: 'Unauthorized' });
    await pool.query('DELETE FROM equipment WHERE id = $1', [req.params.id]);
    res.json({ success: true, data: null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to delete equipment' });
  }
});

export default router;
