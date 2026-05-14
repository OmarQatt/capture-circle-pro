import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../.env') });

import express from 'express';
import cors from 'cors';
import authRouter from './routes/auth.js';
import locationsRouter from './routes/locations.js';
import equipmentRouter from './routes/equipment.js';
import bookingsRouter from './routes/bookings.js';
import crewRouter from './routes/crew.js';
import talentRouter from './routes/talent.js';
import profilesRouter from './routes/profiles.js';
import adminRouter from './routes/admin.js';

const app = express();
const PORT = process.env.PORT || 3001;

const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map(o => o.trim())
  : ['http://localhost:5173', 'http://localhost:8080'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
}));
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/locations', locationsRouter);
app.use('/api/equipment', equipmentRouter);
app.use('/api/bookings', bookingsRouter);
app.use('/api/crew', crewRouter);
app.use('/api/talent', talentRouter);
app.use('/api/profiles', profilesRouter);
app.use('/api/admin', adminRouter);

app.get('/health', (_req, res) => res.json({ success: true }));

app.use((_req, res) => res.status(404).json({ success: false, error: 'Not found' }));

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
