import { Router, Response } from 'express';
import pool from '../database/pool.js';
import { authenticate } from '../middleware/authenticate.js';
import type { ApiResponse, TalentProfile } from '../types/index.js';

const router = Router();

router.get('/', async (_req, res: Response<ApiResponse<any[]>>) => {
  try {
    const { rows } = await pool.query(
      `SELECT tp.*, u.first_name, u.last_name, u.avatar_url, u.email
       FROM talent_profiles tp JOIN users u ON tp.user_id = u.id
       WHERE tp.status = 'approved'
       ORDER BY tp.featured DESC, tp.created_at DESC`
    );
    res.json({ success: true, data: rows, meta: { total: rows.length } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to fetch talent' });
  }
});

router.get('/my-profile', authenticate, async (req, res: Response<ApiResponse<TalentProfile>>) => {
  try {
    const { rows } = await pool.query('SELECT * FROM talent_profiles WHERE user_id = $1', [req.user!.userId]);
    if (rows.length === 0) return res.status(404).json({ success: false, error: 'Profile not found' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to fetch talent profile' });
  }
});

router.post('/', authenticate, async (req, res: Response<ApiResponse<TalentProfile>>) => {
  try {
    const { profile_type, bio, age, height, weight, skin_tone, daily_rate, hourly_rate, experience_years, skills, portfolio_urls, portfolio_videos } = req.body;

    const existing = await pool.query('SELECT id FROM talent_profiles WHERE user_id = $1', [req.user!.userId]);
    if (existing.rows.length > 0)
      return res.status(409).json({ success: false, error: 'Talent profile already exists' });

    // Pull gender from the user's own profile
    const userRow = await pool.query('SELECT gender FROM users WHERE id = $1', [req.user!.userId]);
    const gender = userRow.rows[0]?.gender ?? null;

    const skillsArr = typeof skills === 'string'
      ? skills.split(',').map((s: string) => s.trim()).filter(Boolean)
      : skills ?? [];

    const { rows } = await pool.query(
      `INSERT INTO talent_profiles (user_id,profile_type,bio,gender,age,height,weight,skin_tone,daily_rate,hourly_rate,experience_years,skills,portfolio_urls,portfolio_videos)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING *`,
      [req.user!.userId, profile_type ?? null, bio ?? null, gender, age ?? null, height ?? null, weight ?? null, skin_tone ?? null, daily_rate ?? null, hourly_rate ?? null, experience_years ?? null, skillsArr, portfolio_urls ?? [], portfolio_videos ?? []]
    );
    res.status(201).json({ success: true, data: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to create talent profile' });
  }
});

router.patch('/:id', authenticate, async (req, res: Response<ApiResponse<TalentProfile>>) => {
  try {
    const { rows: existing } = await pool.query('SELECT user_id FROM talent_profiles WHERE id = $1', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ success: false, error: 'Profile not found' });
    if (existing[0].user_id !== req.user!.userId) return res.status(403).json({ success: false, error: 'Unauthorized' });

    const allowed = ['bio', 'age', 'height', 'weight', 'skin_tone', 'daily_rate', 'hourly_rate', 'experience_years', 'skills', 'portfolio_urls', 'portfolio_videos'];
    const fields = Object.keys(req.body).filter(k => allowed.includes(k));
    if (fields.length === 0) return res.status(400).json({ success: false, error: 'No valid fields to update' });

    const set = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
    const vals = [...fields.map(f => req.body[f]), req.params.id];
    const { rows } = await pool.query(
      `UPDATE talent_profiles SET ${set}, status = 'pending', updated_at = NOW() WHERE id = $${fields.length + 1} RETURNING *`,
      vals
    );
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to update talent profile' });
  }
});

router.delete('/:id', authenticate, async (req, res: Response<ApiResponse<null>>) => {
  try {
    const { rows } = await pool.query('SELECT user_id, portfolio_urls FROM talent_profiles WHERE id = $1', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ success: false, error: 'Profile not found' });
    if (rows[0].user_id !== req.user!.userId) return res.status(403).json({ success: false, error: 'Unauthorized' });
    await pool.query('DELETE FROM talent_profiles WHERE id = $1', [req.params.id]);
    const { deleteStorageFiles } = await import('../utils/storage.js');
    await deleteStorageFiles(rows[0].portfolio_urls || []);
    res.json({ success: true, data: null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to delete talent profile' });
  }
});

export default router;
