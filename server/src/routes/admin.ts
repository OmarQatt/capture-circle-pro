import { Router, Response } from 'express';
import pool from '../database/pool.js';
import { authenticate, requireRole } from '../middleware/authenticate.js';
import type { ApiResponse } from '../types/index.js';

const router = Router();
router.use(authenticate, requireRole('admin', 'super_admin'));

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
    const { status, rejection_reason } = req.body;
    if (!['approved', 'rejected'].includes(status))
      return res.status(400).json({ success: false, error: 'Invalid status' });
    const { rows } = await pool.query(
      'UPDATE locations SET status = $1, rejection_reason = $2, updated_at = NOW() WHERE id = $3 RETURNING *',
      [status, status === 'rejected' ? (rejection_reason || null) : null, req.params.id]
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
    const { status, rejection_reason } = req.body;
    if (!['approved', 'rejected'].includes(status))
      return res.status(400).json({ success: false, error: 'Invalid status' });
    const { rows } = await pool.query(
      'UPDATE equipment SET approval_status = $1, rejection_reason = $2, updated_at = NOW() WHERE id = $3 RETURNING *',
      [status, status === 'rejected' ? (rejection_reason || null) : null, req.params.id]
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
    const { status, rejection_reason } = req.body;
    if (!['approved', 'rejected'].includes(status))
      return res.status(400).json({ success: false, error: 'Invalid status' });
    const { rows } = await pool.query(
      'UPDATE crew_profiles SET status = $1, rejection_reason = $2, updated_at = NOW() WHERE id = $3 RETURNING *',
      [status, status === 'rejected' ? (rejection_reason || null) : null, req.params.id]
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
    const { status, rejection_reason } = req.body;
    if (!['approved', 'rejected'].includes(status))
      return res.status(400).json({ success: false, error: 'Invalid status' });
    const { rows } = await pool.query(
      'UPDATE talent_profiles SET status = $1, rejection_reason = $2, updated_at = NOW() WHERE id = $3 RETURNING *',
      [status, status === 'rejected' ? (rejection_reason || null) : null, req.params.id]
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

router.patch('/bookings/:id/status', async (req, res: Response<ApiResponse<any>>) => {
  try {
    const { status } = req.body;
    if (!['confirmed', 'cancelled', 'completed'].includes(status))
      return res.status(400).json({ success: false, error: 'Invalid status' });

    const { rows } = await pool.query(
      'UPDATE bookings SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [status, req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ success: false, error: 'Booking not found' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to update booking status' });
  }
});

router.get('/users', async (_req, res: Response<ApiResponse<any[]>>) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, email, first_name, last_name, phone, gender, avatar_url, role, email_verified, created_at
       FROM users ORDER BY created_at DESC`
    );
    res.json({ success: true, data: rows, meta: { total: rows.length } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to fetch users' });
  }
});

router.patch('/users/:id/role', async (req, res: Response<ApiResponse<any>>) => {
  if (req.user?.role !== 'super_admin')
    return res.status(403).json({ success: false, error: 'Only super admins can change user roles' });
  try {
    const { role } = req.body;
    const allowed = ['user', 'client', 'location_owner', 'equipment_provider', 'model', 'crew', 'admin'];
    if (!allowed.includes(role))
      return res.status(400).json({ success: false, error: 'Invalid role' });
    if (req.params.id === req.user.userId)
      return res.status(400).json({ success: false, error: 'Cannot change your own role' });
    const { rows } = await pool.query(
      `UPDATE users SET role = $1, updated_at = NOW() WHERE id = $2
       RETURNING id, email, first_name, last_name, role`,
      [role, req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ success: false, error: 'User not found' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to update role' });
  }
});

// ── Super Admin: All listings ─────────────────────────────────────────────────

async function countActiveBookings(serviceId: string): Promise<number> {
  const { rows } = await pool.query(
    `SELECT COUNT(*) AS c FROM bookings WHERE service_id = $1 AND status IN ('pending','confirmed')`,
    [serviceId]
  );
  return parseInt(rows[0].c, 10);
}

router.get('/locations/all', async (req, res: Response<ApiResponse<any[]>>) => {
  if (req.user?.role !== 'super_admin') return res.status(403).json({ success: false, error: 'Super admin only' });
  try {
    const { rows } = await pool.query(
      `SELECT l.*, u.first_name, u.last_name, u.email FROM locations l JOIN users u ON l.user_id = u.id ORDER BY l.created_at DESC`
    );
    res.json({ success: true, data: rows });
  } catch (err) { console.error(err); res.status(500).json({ success: false, error: 'Failed' }); }
});

router.get('/equipment/all', async (req, res: Response<ApiResponse<any[]>>) => {
  if (req.user?.role !== 'super_admin') return res.status(403).json({ success: false, error: 'Super admin only' });
  try {
    const { rows } = await pool.query(
      `SELECT e.*, u.first_name, u.last_name, u.email FROM equipment e JOIN users u ON e.user_id = u.id ORDER BY e.created_at DESC`
    );
    res.json({ success: true, data: rows });
  } catch (err) { console.error(err); res.status(500).json({ success: false, error: 'Failed' }); }
});

router.get('/crew/all', async (req, res: Response<ApiResponse<any[]>>) => {
  if (req.user?.role !== 'super_admin') return res.status(403).json({ success: false, error: 'Super admin only' });
  try {
    const { rows } = await pool.query(
      `SELECT cp.*, u.first_name, u.last_name, u.email FROM crew_profiles cp JOIN users u ON cp.user_id = u.id ORDER BY cp.created_at DESC`
    );
    res.json({ success: true, data: rows });
  } catch (err) { console.error(err); res.status(500).json({ success: false, error: 'Failed' }); }
});

router.get('/talent/all', async (req, res: Response<ApiResponse<any[]>>) => {
  if (req.user?.role !== 'super_admin') return res.status(403).json({ success: false, error: 'Super admin only' });
  try {
    const { rows } = await pool.query(
      `SELECT tp.*, u.first_name, u.last_name, u.email FROM talent_profiles tp JOIN users u ON tp.user_id = u.id ORDER BY tp.created_at DESC`
    );
    res.json({ success: true, data: rows });
  } catch (err) { console.error(err); res.status(500).json({ success: false, error: 'Failed' }); }
});

// ── Super Admin: Delete listings ──────────────────────────────────────────────

router.delete('/locations/:id', async (req, res: Response<ApiResponse<null>>) => {
  if (req.user?.role !== 'super_admin') return res.status(403).json({ success: false, error: 'Super admin only' });
  try {
    const active = await countActiveBookings(req.params.id);
    if (active > 0) return res.status(409).json({ success: false, error: `Cannot delete: this location has ${active} active booking(s).` });
    const { rows } = await pool.query('SELECT images FROM locations WHERE id = $1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, error: 'Not found' });
    await pool.query('DELETE FROM locations WHERE id = $1', [req.params.id]);
    const { deleteStorageFiles } = await import('../utils/storage.js');
    await deleteStorageFiles(rows[0].images || []);
    res.json({ success: true, data: null });
  } catch (err) { console.error(err); res.status(500).json({ success: false, error: 'Failed to delete' }); }
});

router.delete('/equipment/:id', async (req, res: Response<ApiResponse<null>>) => {
  if (req.user?.role !== 'super_admin') return res.status(403).json({ success: false, error: 'Super admin only' });
  try {
    const active = await countActiveBookings(req.params.id);
    if (active > 0) return res.status(409).json({ success: false, error: `Cannot delete: this equipment has ${active} active booking(s).` });
    const { rows } = await pool.query('SELECT images FROM equipment WHERE id = $1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, error: 'Not found' });
    await pool.query('DELETE FROM equipment WHERE id = $1', [req.params.id]);
    const { deleteStorageFiles } = await import('../utils/storage.js');
    await deleteStorageFiles(rows[0].images || []);
    res.json({ success: true, data: null });
  } catch (err) { console.error(err); res.status(500).json({ success: false, error: 'Failed to delete' }); }
});

router.delete('/crew/:id', async (req, res: Response<ApiResponse<null>>) => {
  if (req.user?.role !== 'super_admin') return res.status(403).json({ success: false, error: 'Super admin only' });
  try {
    const active = await countActiveBookings(req.params.id);
    if (active > 0) return res.status(409).json({ success: false, error: `Cannot delete: this crew profile has ${active} active booking(s).` });
    const { rows } = await pool.query('SELECT portfolio_urls FROM crew_profiles WHERE id = $1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, error: 'Not found' });
    await pool.query('DELETE FROM crew_profiles WHERE id = $1', [req.params.id]);
    const { deleteStorageFiles } = await import('../utils/storage.js');
    await deleteStorageFiles(rows[0].portfolio_urls || []);
    res.json({ success: true, data: null });
  } catch (err) { console.error(err); res.status(500).json({ success: false, error: 'Failed to delete' }); }
});

router.delete('/talent/:id', async (req, res: Response<ApiResponse<null>>) => {
  if (req.user?.role !== 'super_admin') return res.status(403).json({ success: false, error: 'Super admin only' });
  try {
    const active = await countActiveBookings(req.params.id);
    if (active > 0) return res.status(409).json({ success: false, error: `Cannot delete: this talent profile has ${active} active booking(s).` });
    const { rows } = await pool.query('SELECT portfolio_urls FROM talent_profiles WHERE id = $1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, error: 'Not found' });
    await pool.query('DELETE FROM talent_profiles WHERE id = $1', [req.params.id]);
    const { deleteStorageFiles } = await import('../utils/storage.js');
    await deleteStorageFiles(rows[0].portfolio_urls || []);
    res.json({ success: true, data: null });
  } catch (err) { console.error(err); res.status(500).json({ success: false, error: 'Failed to delete' }); }
});

// ── Super Admin: Delete user ──────────────────────────────────────────────────
router.delete('/users/:id', async (req, res: Response<ApiResponse<null>>) => {
  if (req.user?.role !== 'super_admin') return res.status(403).json({ success: false, error: 'Super admin only' });
  try {
    if (req.params.id === req.user!.userId)
      return res.status(400).json({ success: false, error: 'Cannot delete your own account' });
    const { rows } = await pool.query('SELECT role FROM users WHERE id = $1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, error: 'User not found' });
    if (rows[0].role === 'super_admin')
      return res.status(403).json({ success: false, error: 'Cannot delete another super admin' });
    await pool.query('DELETE FROM users WHERE id = $1', [req.params.id]);
    res.json({ success: true, data: null });
  } catch (err) { console.error(err); res.status(500).json({ success: false, error: 'Failed to delete user' }); }
});

export default router;
