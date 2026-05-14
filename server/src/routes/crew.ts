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
       ORDER BY cp.featured DESC, cp.created_at DESC`
    );
    res.json({ success: true, data: rows, meta: { total: rows.length } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to fetch crew' });
  }
});

router.get('/my-profile', authenticate, async (req, res: Response<ApiResponse<CrewProfile>>) => {
  try {
    const { rows } = await pool.query('SELECT * FROM crew_profiles WHERE user_id = $1', [req.user!.userId]);
    if (rows.length === 0) return res.status(404).json({ success: false, error: 'Profile not found' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to fetch crew profile' });
  }
});

router.post('/', authenticate, async (req, res: Response<ApiResponse<CrewProfile>>) => {
  try {
    const { role, bio, daily_rate, experience_years, skills, portfolio_urls } = req.body;

    const existing = await pool.query('SELECT id FROM crew_profiles WHERE user_id = $1', [req.user!.userId]);
    if (existing.rows.length > 0)
      return res.status(409).json({ success: false, error: 'Crew profile already exists' });

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

export default router;
