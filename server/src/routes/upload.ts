import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import { randomBytes } from 'crypto';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { authenticate } from '../middleware/authenticate.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../.env') });

const router = Router();

// Lazy-init so env vars are guaranteed loaded before createClient runs
let _supabase: SupabaseClient | null = null;
const getSupabase = () => {
  if (!_supabase) {
    _supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }
  return _supabase;
};

const BUCKET = 'uploads';

// Keep files in memory (no disk write) — upload directly to Supabase Storage
const memStorage = multer.memoryStorage();

const imageUpload = multer({
  storage: memStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (/\.(jpeg|jpg|png|webp|gif)$/.test(ext) && /image\//.test(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

const videoUpload = multer({
  storage: memStorage,
  limits: { fileSize: 200 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (/\.(mp4|mov|webm|avi|mkv)$/.test(ext) && /video\//.test(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed (mp4, mov, webm, avi, mkv)'));
    }
  },
});

async function uploadToSupabase(file: Express.Multer.File): Promise<string> {
  const ext = path.extname(file.originalname).toLowerCase();
  const filename = `${Date.now()}-${randomBytes(6).toString('hex')}${ext}`;
  const sb = getSupabase();

  const { error } = await sb.storage
    .from(BUCKET)
    .upload(filename, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });

  if (error) throw new Error(`Storage upload failed: ${error.message}`);

  const { data } = sb.storage.from(BUCKET).getPublicUrl(filename);
  return data.publicUrl;
}

router.post('/', authenticate, imageUpload.array('images', 10), async (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0)
      return res.status(400).json({ success: false, error: 'No files uploaded' });
    const urls = await Promise.all(files.map(uploadToSupabase));
    res.json({ success: true, data: { urls } });
  } catch (err: any) {
    console.error('Upload error:', err);
    res.status(500).json({ success: false, error: err.message || 'Upload failed' });
  }
});

router.post('/video', authenticate, videoUpload.array('videos', 5), async (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0)
      return res.status(400).json({ success: false, error: 'No files uploaded' });
    const urls = await Promise.all(files.map(uploadToSupabase));
    res.json({ success: true, data: { urls } });
  } catch (err: any) {
    console.error('Upload error:', err);
    res.status(500).json({ success: false, error: err.message || 'Upload failed' });
  }
});

export default router;
