/**
 * Loads environment variables for the Express API before any other imports use process.env.
 *
 * Run server npm scripts from the `server/` folder (the root `npm run dev:all` does `cd server`).
 *
 * Load order (later steps override earlier ones when override: true):
 * 1. Repo root `.env` + `server/.env` — shared defaults
 * 2. Repo root `.env.local` + `server/.env.local` — your real secrets (typical local setup: only root `.env.local`)
 * 3. If NODE_ENV is `production`, also `.env.production` from root then server (optional local prod test)
 */
import path from 'path';
import dotenv from 'dotenv';

const cwd = process.cwd();
const repoRoot = path.resolve(cwd, '..');

dotenv.config({ path: path.join(repoRoot, '.env') });
dotenv.config({ path: path.join(cwd, '.env') });

dotenv.config({ path: path.join(repoRoot, '.env.local'), override: true });
dotenv.config({ path: path.join(cwd, '.env.local'), override: true });

if (process.env.NODE_ENV === 'production') {
  dotenv.config({ path: path.join(repoRoot, '.env.production'), override: true });
  dotenv.config({ path: path.join(cwd, '.env.production'), override: true });
}
