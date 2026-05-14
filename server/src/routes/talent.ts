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
    const { profile_type, bio, gender, age, height, weight, skin_tone, daily_rate, hourly_rate, experience_years, skills, portfolio_urls } = req.body;

    const existing = await pool.query('SELECT id FROM talent_profiles WHERE user_id = $1', [req.user!.userId]);
    if (existing.rows.length > 0)
      return res.status(409).json({ success: false, error: 'Talent profile already exists' });

    const skillsArr = typeof skills === 'string'
      ? skills.split(',').map((s: string) => s.trim()).filter(Boolean)
      : skills ?? [];

    const { rows } = await pool.query(
      `INSERT INTO talent_profiles (user_id,profile_type,bio,gender,age,height,weight,skin_tone,daily_rate,hourly_rate,experience_years,skills,portfolio_urls)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`,
      [req.user!.userId, profile_type ?? null, bio ?? null, gender ?? null, age ?? null, height ?? null, weight ?? null, skin_tone ?? null, daily_rate ?? null, hourly_rate ?? null, experience_years ?? null, skillsArr, portfolio_urls ?? []]
    );
    res.status(201).json({ success: true, data: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to create talent profile' });
  }
});

export default router;
