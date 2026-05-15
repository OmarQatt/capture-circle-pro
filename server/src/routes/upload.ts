import { Router, Request, Response } from 'express';
import multer from 'multer';
import path, { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { randomBytes } from 'crypto';
import { authenticate } from '../middleware/authenticate.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const uploadsDir = resolve(__dirname, '../../uploads');

const router = Router();

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${randomBytes(6).toString('hex')}${ext}`);
  },
});

const imageUpload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowed = /\.(jpeg|jpg|png|webp|gif)$/;
    if (allowed.test(ext) && /image\//.test(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

const videoUpload = multer({
  storage,
  limits: { fileSize: 200 * 1024 * 1024 }, // 200 MB
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowed = /\.(mp4|mov|webm|avi|mkv)$/;
    if (allowed.test(ext) && /video\//.test(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed (mp4, mov, webm, avi, mkv)'));
    }
  },
});

const baseUrl = () =>
  process.env.API_BASE_URL || `http://localhost:${process.env.PORT || 3001}`;

router.post('/', authenticate, imageUpload.array('images', 10), (req: Request, res: Response) => {
  const files = req.files as Express.Multer.File[];
  if (!files || files.length === 0)
    return res.status(400).json({ success: false, error: 'No files uploaded' });
  const urls = files.map(f => `${baseUrl()}/uploads/${f.filename}`);
  res.json({ success: true, data: { urls } });
});

router.post('/video', authenticate, videoUpload.array('videos', 5), (req: Request, res: Response) => {
  const files = req.files as Express.Multer.File[];
  if (!files || files.length === 0)
    return res.status(400).json({ success: false, error: 'No files uploaded' });
  const urls = files.map(f => `${baseUrl()}/uploads/${f.filename}`);
  res.json({ success: true, data: { urls } });
});

export default router;
