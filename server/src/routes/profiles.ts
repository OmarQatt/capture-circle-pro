import { Router, Response } from 'express';
import pool from '../database/pool.js';
import { authenticate } from '../middleware/authenticate.js';
import type { ApiResponse } from '../types/index.js';

const router = Router();

router.get('/me', authenticate, async (req, res: Response<ApiResponse<any>>) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, email, first_name, last_name, phone, avatar_url, role, created_at
       FROM users WHERE id = $1`,
      [req.user!.userId]
    );
    if (rows.length === 0) return res.status(404).json({ success: false, error: 'User not found' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to fetch profile' });
  }
});

router.patch('/me', authenticate, async (req, res: Response<ApiResponse<any>>) => {
  try {
    const allowed = ['first_name', 'last_name', 'phone', 'avatar_url', 'portfolio_urls', 'instagram_url', 'gender'];
    const fields = Object.keys(req.body).filter(k => allowed.includes(k));
    if (fields.length === 0)
      return res.status(400).json({ success: false, error: 'No valid fields to update' });

    const set = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
    const vals = [...fields.map(f => req.body[f]), req.user!.userId];
    const { rows } = await pool.query(
      `UPDATE users SET ${set}, updated_at = NOW() WHERE id = $${fields.length + 1}
       RETURNING id, email, first_name, last_name, phone, avatar_url, role`,
      vals
    );
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to update profile' });
  }
});

router.get('/:userId', async (req, res: Response<ApiResponse<any>>) => {
  try {
    const { userId } = req.params;

    const userQ = await pool.query(
      `SELECT id, first_name, last_name, avatar_url, portfolio_urls, instagram_url, gender, created_at FROM users WHERE id = $1`,
      [userId]
    );
    if (userQ.rows.length === 0)
      return res.status(404).json({ success: false, error: 'User not found' });

    const [locQ, equipQ, crewQ, talentQ] = await Promise.all([
      pool.query(
        `SELECT id, name, city, country, category, images, price_per_6hours, price_per_12hours, price_per_day
         FROM locations WHERE user_id = $1 AND status = 'approved' ORDER BY created_at DESC`,
        [userId]
      ),
      pool.query(
        `SELECT id, name, brand, model, category, condition, images, daily_rate
         FROM equipment WHERE user_id = $1 AND approval_status = 'approved' ORDER BY created_at DESC`,
        [userId]
      ),
      pool.query(
        `SELECT id, role, bio, experience_years, daily_rate, skills, portfolio_urls
         FROM crew_profiles WHERE user_id = $1 AND status = 'approved' ORDER BY created_at ASC`,
        [userId]
      ),
      pool.query(
        `SELECT id, profile_type, bio, gender, age, height, skin_tone, experience_years, daily_rate, hourly_rate, portfolio_urls, portfolio_videos
         FROM talent_profiles WHERE user_id = $1 AND status = 'approved' LIMIT 1`,
        [userId]
      ),
    ]);

    res.json({
      success: true,
      data: {
        user: userQ.rows[0],
        locations: locQ.rows,
        equipment: equipQ.rows,
        crew: crewQ.rows,
        talent: talentQ.rows[0] || null,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to fetch profile' });
  }
});

export default router;
