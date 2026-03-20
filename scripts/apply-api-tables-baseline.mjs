/**
 * Applies migrations/0003_api_tables_baseline.sql using DATABASE_URL from .env.local / .env.
 * Run from project root: npm run db:apply-api-baseline
 *
 * Does not print secrets. Requires network access to your Neon host.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'
import postgres from 'postgres'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')

dotenv.config({ path: path.join(root, '.env.local') })
dotenv.config({ path: path.join(root, '.env') })

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl || databaseUrl.trim() === '') {
  console.error(
    '[db:apply-api-baseline] DATABASE_URL is missing. Add it to .env.local (same as your Next.js app).',
  )
  process.exit(1)
}

const sqlPath = path.join(root, 'migrations', '0003_api_tables_baseline.sql')
if (!fs.existsSync(sqlPath)) {
  console.error('[db:apply-api-baseline] File not found:', sqlPath)
  process.exit(1)
}

let raw = fs.readFileSync(sqlPath, 'utf8')
// Remove full-line SQL comments (file has no -- inside string literals)
raw = raw
  .split('\n')
  .filter((line) => !/^\s*--/.test(line))
  .join('\n')
  .trim()

if (!raw) {
  console.error('[db:apply-api-baseline] SQL file is empty after stripping comments.')
  process.exit(1)
}

const sql = postgres(databaseUrl, { max: 1, idle_timeout: 5, connect_timeout: 30 })

try {
  await sql.unsafe(raw)
  console.log('[db:apply-api-baseline] Success: applied migrations/0003_api_tables_baseline.sql')
  console.log(
    '(If you saw NOTICE lines like "already exists, skipping" — that is normal when re-running.)',
  )
} catch (err) {
  const message = err instanceof Error ? err.message : String(err)
  console.error('[db:apply-api-baseline] Failed:', message)
  console.error(
    'Tip: Ensure DATABASE_URL points to the correct Neon database. Run from repo root: SoloSuccess-AI',
  )
  process.exit(1)
} finally {
  await sql.end({ timeout: 5 })
}
