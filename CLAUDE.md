# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**PreProduction** is a film production marketplace where location owners, equipment providers, crew members, and talent (models) can list their services, and filmmakers can discover and book them. All listings require admin approval before appearing publicly.

## Dev Commands

### Frontend (React/Vite)
```bash
npm run dev          # Starts on http://localhost:8080
npm run build        # TypeScript build + Vite bundle
npx tsc --noEmit     # Type-check without emitting
```

### Backend (Express/Node.js)
```bash
cd server && npm run dev     # tsx watch — hot reload on port 3001
cd server && npx tsx src/server.ts   # single run (no watch)
```

### Environment
`.env` at repo root is loaded by both Vite (VITE_* prefix) and the server (dotenv). Key vars:
- `DATABASE_URL` — PostgreSQL connection string (local Supabase on port 54322)
- `JWT_SECRET` — used for access + refresh token signing
- `PORT=3001` — must match `VITE_API_URL=http://localhost:3001`
- `RESEND_API_KEY` — transactional email for verification/reset flows

**Important:** If PORT drifts to 3002 in `.env`, the frontend will fail to connect. Fix: `sed -i 's/^PORT=3002/PORT=3001/' .env`

## Architecture

```
capture-circle-pro/
├── src/                        # Frontend (React + TypeScript + Vite)
│   ├── pages/                  # Route-level components
│   ├── components/             # Shared UI (dialogs, upload, navbar)
│   ├── integrations/api/       # API client (client.ts)
│   └── contexts/               # AuthContext (JWT state)
├── server/
│   └── src/
│       ├── server.ts           # Entry point: runs migrate() then listen()
│       ├── routes/             # auth, locations, equipment, bookings, crew, talent, profiles, admin, upload
│       ├── middleware/         # authenticate.ts (JWT verify → req.user)
│       └── database/
│           ├── pool.ts         # pg Pool (loads dotenv itself — ESM hoisting)
│           └── schema.sql      # Full PostgreSQL schema
└── .env                        # Shared env for both frontend and server
```

## Key Patterns

### API Client (`src/integrations/api/client.ts`)
All frontend data fetching goes through `api` (default export):
```typescript
api.get<T>(path)
api.post<T>(path, body)
api.patch<T>(path, body)
api.delete<T>(path)
api.upload<T>(path, formData)   // multipart; handles 401 refresh
```
- Automatically attaches `Authorization: Bearer <token>` from localStorage
- On 401: attempts token refresh via `/api/auth/refresh`, then retries
- Queues concurrent requests during refresh (subscriber pattern)
- `api.upload()` must be used for all `multipart/form-data` requests (not raw `fetch`)

### API Response Format
All endpoints return:
```typescript
{ success: boolean, data?: T, error?: string }
```
The `request()` function in client.ts unwraps `data` on success, throws `error` on failure.

### Authentication
- Access token: 15 min JWT, stored in `localStorage.accessToken`
- Refresh token: 7-day JWT, stored in DB (`refresh_tokens` table) and `localStorage.refreshToken`
- `AuthContext` reads user from `localStorage.user` (JSON) on mount
- Protected routes: `authenticate` middleware on Express routes; `useAuth()` hook on frontend

### Database Migrations
Schema changes are handled by the `migrate()` function in `server/src/server.ts`. All `ALTER TABLE` statements use `IF NOT EXISTS` / `IF EXISTS` to be idempotent. Migrations run at startup before `app.listen()`. Add new migrations there rather than editing `schema.sql` (which only applies to fresh databases).

### ESM Module Hoisting
`server/src/database/pool.ts` must call `dotenv.config()` itself — it cannot rely on `server.ts` loading it first because ESM hoists `import` statements before module body execution.

### File Uploads
- multer in `server/src/routes/upload.ts` writes to `server/uploads/` using absolute path via `resolve(__dirname, '../../uploads')`
- Served as static files at `/uploads` prefix
- Image upload: `POST /api/upload` (10 MB limit, images only)
- Video upload: `POST /api/upload/video` (200 MB limit, video only)
- Response: `{ urls: string[] }` — array of `/uploads/<filename>` paths

### Approval Flow
All listing types (locations, equipment, crew profiles, talent profiles) start with status `'pending'`. Public list endpoints filter by `status = 'approved'`. Admin routes (`/api/admin/*`) handle approval/rejection. Dashboard shows pending/approved/rejected badge per listing.

- Locations, crew, talent use `status` column
- Equipment uses `approval_status` column (different from its availability `status`)

### Booking System
- `booking_type`: `'6h' | '12h' | 'day'` — stored per booking
- `BookingDialog` shows duration selector when location has multiple price tiers (`price_per_6hours`, `price_per_12hours`, `price_per_day`)
- Overlap detection: `GET /api/bookings/availability?service_id&start_date&end_date` — warns frontend but does not block double-booking
- Extension requests: client POSTs to `/:id/request-extension`; owner responds via `PATCH /:id/extension-status`

### Multi-Role Crew
Users can have multiple crew profiles (one per role/specialty). The `UNIQUE` constraint on `crew_profiles.user_id` was dropped via migration. `GET /api/crew/my-profiles` returns an array; profile page renders all crew cards.

### Talent Gender
Gender is stored on the `users` table (edited from profile page), not on the talent form. When creating a talent profile, the backend reads `gender` from `users` automatically. Admin forms can still override it directly.

## React Query Notes
- Using TanStack Query v5 — `onSuccess` callback is removed from `useMutation`. Use `useEffect` watching returned `data` instead.
- Query key conventions: `["my-bookings"]`, `["my-locations"]`, `["my-equipment"]`, `["my-crew"]`, `["talent", userId]`, `["location", id]`

## Route Map

| Path | Page | Auth |
|------|------|------|
| `/` | Index (landing) | — |
| `/login` | Login | — |
| `/signup` | Signup | — |
| `/locations` | Location list | — |
| `/locations/:id` | Location detail + booking | — |
| `/equipment` | Equipment list | — |
| `/crew` | Crew list | — |
| `/models` | Talent/models list | — |
| `/dashboard` | User dashboard + bookings | required |
| `/profile/:userId` | Public user profile | — |
| `/admin` | Admin panel | admin role |
