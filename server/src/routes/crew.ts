import { Router, Response } from 'express';
import pool from '../database/pool.js';
import { authenticate } from '../middleware/authenticate.js';
import type { ApiResponse, CrewProfile } from '../types/index.js';

const router = Router();

router.get('/', async (_req, res: Response<ApiResponse<any[]>>) => {
  try {
    const { rows } = await pool.query(
      `SELECT cp.*, u.first_name, u.last_name, u.avatar_url, u.email
       FROM crew_profiles cp JOIN users u ON cp.user_id = u.id
       WHERE cp.status = 'approved'
       ORDER BY cp.featured DESC, cp.created_at DESC`
    );
    res.json({ success: true, data: rows, meta: { total: rows.length } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to fetch crew' });
  }
});

router.get('/my-profiles', authenticate, async (req, res: Response<ApiResponse<CrewProfile[]>>) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM crew_profiles WHERE user_id = $1 ORDER BY created_at ASC',
      [req.user!.userId]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to fetch crew profiles' });
  }
});

router.post('/', authenticate, async (req, res: Response<ApiResponse<CrewProfile>>) => {
  try {
    const { role, bio, daily_rate, experience_years, skills, portfolio_urls } = req.body;

    const skillsArr = typeof skills === 'string'
      ? skills.split(',').map((s: string) => s.trim()).filter(Boolean)
      : skills ?? [];

    const { rows } = await pool.query(
      `INSERT INTO crew_profiles (user_id,role,bio,daily_rate,experience_years,skills,portfolio_urls)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [req.user!.userId, role ?? null, bio ?? null, daily_rate ?? null, experience_years ?? null, skillsArr, portfolio_urls ?? []]
    );
    res.status(201).json({ success: true, data: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to create crew profile' });
  }
});

router.patch('/:id', authenticate, async (req, res: Response<ApiResponse<CrewProfile>>) => {
  try {
    const { rows: existing } = await pool.query('SELECT user_id FROM crew_profiles WHERE id = $1', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ success: false, error: 'Profile not found' });
    if (existing[0].user_id !== req.user!.userId) return res.status(403).json({ success: false, error: 'Unauthorized' });

    const allowed = ['role', 'bio', 'daily_rate', 'experience_years', 'skills', 'portfolio_urls', 'featured'];
    const fields = Object.keys(req.body).filter(k => allowed.includes(k));
    if (fields.length === 0) return res.status(400).json({ success: false, error: 'No valid fields to update' });

    const set = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
    const vals = [...fields.map(f => req.body[f]), req.params.id];
    const { rows } = await pool.query(
      `UPDATE crew_profiles SET ${set}, status = 'pending', updated_at = NOW() WHERE id = $${fields.length + 1} RETURNING *`,
      vals
    );
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to update crew profile' });
  }
});

router.delete('/:id', authenticate, async (req, res: Response<ApiResponse<null>>) => {
  try {
    const { rows } = await pool.query('SELECT user_id FROM crew_profiles WHERE id = $1', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ success: false, error: 'Profile not found' });
    if (rows[0].user_id !== req.user!.userId) return res.status(403).json({ success: false, error: 'Unauthorized' });
    await pool.query('DELETE FROM crew_profiles WHERE id = $1', [req.params.id]);
    res.json({ success: true, data: null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to delete crew profile' });
  }
});

export default router;
