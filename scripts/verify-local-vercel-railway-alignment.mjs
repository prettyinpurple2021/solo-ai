/**
 * Local alignment check: Next (root .env*) vs Express (server/env-load.ts order).
 * Does not print secret values — only pass/fail and sha256 prefixes for manual cross-check.
 *
 * Usage:
 *   node scripts/verify-local-vercel-railway-alignment.mjs
 *   node scripts/verify-local-vercel-railway-alignment.mjs --health-url=https://xxx.up.railway.app
 */
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const serverDir = path.join(repoRoot, 'server');

/** Mirrors server/env-load.ts merge behavior (dotenv default: later keys override only when override: true on that file). */
function loadExpressEffectiveEnv() {
  const chain = [
    path.join(repoRoot, '.env'),
    path.join(serverDir, '.env'),
    path.join(repoRoot, '.env.local'),
    path.join(serverDir, '.env.local'),
  ];
  const env = {};
  const apply = (filePath, override) => {
    if (!fs.existsSync(filePath)) return;
    const parsed = dotenv.parse(fs.readFileSync(filePath, 'utf8'));
    for (const [k, v] of Object.entries(parsed)) {
      if (override || env[k] === undefined) env[k] = v;
    }
  };
  apply(chain[0], false);
  apply(chain[1], false);
  apply(chain[2], true);
  apply(chain[3], true);
  if (process.env.NODE_ENV === 'production') {
    apply(path.join(repoRoot, '.env.production'), true);
    apply(path.join(serverDir, '.env.production'), true);
  }
  return env;
}

/** Next.js local: .env then .env.local (local overrides). */
function loadNextRootEnv() {
  const env = {};
  const apply = (filePath, override) => {
    if (!fs.existsSync(filePath)) return;
    const parsed = dotenv.parse(fs.readFileSync(filePath, 'utf8'));
    for (const [k, v] of Object.entries(parsed)) {
      if (override || env[k] === undefined) env[k] = v;
    }
  };
  apply(path.join(repoRoot, '.env'), false);
  apply(path.join(repoRoot, '.env.local'), true);
  return env;
}

function prefixHash(value) {
  if (!value || typeof value !== 'string') return '(empty)';
  return crypto.createHash('sha256').update(value, 'utf8').digest('hex').slice(0, 12);
}

function normalizeOrigin(raw) {
  if (!raw || !String(raw).trim()) return null;
  try {
    const u = new URL(raw.trim());
    return u.origin.toLowerCase();
  } catch {
    return null;
  }
}

function isLocalOrigin(origin) {
  if (!origin) return false;
  return (
    origin.includes('localhost') ||
    origin.includes('127.0.0.1') ||
    origin.startsWith('http://[::1]')
  );
}

function isPlaceholderJwt(secret) {
  if (!secret) return true;
  const s = secret.trim();
  if (s.length < 32) return true;
  if (/your-at-least-32-char/i.test(s)) return true;
  return false;
}

async function main() {
  const args = process.argv.slice(2);
  const healthIdx = args.findIndex((a) => a === '--health-url' || a.startsWith('--health-url='));
  let healthUrl = null;
  if (healthIdx !== -1) {
    const a = args[healthIdx];
    if (a.includes('=')) {
      healthUrl = a.split('=').slice(1).join('=').replace(/^["']|["']$/g, '');
    } else if (args[healthIdx + 1]) {
      healthUrl = args[healthIdx + 1].replace(/^["']|["']$/g, '');
    }
  }

  const hasLocal =
    fs.existsSync(path.join(repoRoot, '.env.local')) ||
    fs.existsSync(path.join(repoRoot, '.env')) ||
    fs.existsSync(path.join(serverDir, '.env.local')) ||
    fs.existsSync(path.join(serverDir, '.env'));

  console.log('Vercel+Railway local alignment (repo root env vs Express env-load order)\n');

  if (!hasLocal) {
    console.log('No .env / .env.local at repo root or server/. — nothing to verify.');
    console.log('Copy env.example → .env.local and run again.\n');
  } else {
    const nextEnv = loadNextRootEnv();
    const expressEnv = loadExpressEffectiveEnv();

    const keys = ['JWT_SECRET', 'DATABASE_URL'];
    let failed = false;

    for (const key of keys) {
      const a = nextEnv[key];
      const b = expressEnv[key];
      const match = a && b && a === b;
      console.log(`${key}:`);
      console.log(`  Next (root .env + .env.local) prefix: ${prefixHash(a)}`);
      console.log(`  Express (env-load order) prefix:      ${prefixHash(b)}`);
      if (!a && !b) {
        console.log(`  (both unset — set in .env.local for local dev)\n`);
      } else if (!a || !b) {
        console.log(`  FAIL: defined on one side only\n`);
        failed = true;
      } else if (!match) {
        console.log(`  FAIL: values differ — JWT/socket and DB will misbehave locally\n`);
        failed = true;
      } else {
        console.log(`  OK: match\n`);
      }
    }

    if (isPlaceholderJwt(nextEnv.JWT_SECRET)) {
      console.log('WARN: JWT_SECRET missing or looks like a placeholder (< 32 chars or template text).\n');
    }

    const appOrigin = normalizeOrigin(nextEnv.NEXT_PUBLIC_APP_URL);
    const clientOrigin = normalizeOrigin(expressEnv.CLIENT_URL);
    console.log('URL alignment:');
    console.log(`  NEXT_PUBLIC_APP_URL origin: ${appOrigin ?? '(unset or invalid)'}`);
    console.log(`  CLIENT_URL origin:          ${clientOrigin ?? '(unset — Express defaults apply)'}`);
    if (appOrigin && clientOrigin && appOrigin !== clientOrigin) {
      if (isLocalOrigin(appOrigin) || isLocalOrigin(clientOrigin)) {
        console.log(
          '  WARN: CLIENT_URL and NEXT_PUBLIC_APP_URL origins differ (common for hybrid local setups).\n' +
            '  Production: Railway CLIENT_URL must equal your live Vercel site origin.\n'
        );
      } else {
        console.log(
          '  FAIL: CLIENT_URL must match NEXT_PUBLIC_APP_URL origin for CORS/Socket.IO (production-like config).\n'
        );
        failed = true;
      }
    } else if (appOrigin && clientOrigin) {
      console.log('  OK: origins match\n');
    } else {
      console.log('  (set CLIENT_URL in .env.local to match your app URL for strict checks)\n');
    }

    const socket = (nextEnv.NEXT_PUBLIC_SOCKET_URL || '').trim();
    console.log('NEXT_PUBLIC_SOCKET_URL:', socket || '(unset)');
    if (socket) {
      try {
        const u = new URL(socket);
        const isLocal = u.hostname === 'localhost' || u.hostname === '127.0.0.1';
        if (isLocal && u.protocol === 'https:') {
          console.log('  WARN: https://localhost socket URL is unusual for local dev.\n');
        }
        if (!isLocal && u.protocol !== 'https:') {
          console.log('  WARN: production socket URL should normally be https://\n');
        }
      } catch {
        console.log('  WARN: not a valid URL\n');
        failed = true;
      }
    }

    const redisNext = !!(nextEnv.UPSTASH_REDIS_REST_URL && nextEnv.UPSTASH_REDIS_REST_TOKEN);
    const redisEx = !!(expressEnv.UPSTASH_REDIS_REST_URL && expressEnv.UPSTASH_REDIS_REST_TOKEN);
    if (redisNext !== redisEx) {
      console.log(
        'WARN: Upstash Redis set on one stack only — set both in production if both apps use Redis.\n'
      );
    }

    if (failed) {
      console.log('Result: FAILED (fix .env.local / server/.env.local).');
      process.exitCode = 1;
    } else {
      console.log('Result: OK (local env consistency).');
    }
  }

  if (healthUrl) {
    const base = healthUrl.replace(/\/$/, '');
    const url = `${base}/api/health`;
    console.log(`\nFetching ${url} ...`);
    try {
      const res = await fetch(url, { redirect: 'follow' });
      const text = await res.text();
      let json;
      try {
        json = JSON.parse(text);
      } catch {
        json = null;
      }
      if (!res.ok) {
        console.log(`FAIL: HTTP ${res.status}`);
        process.exitCode = 1;
        return;
      }
      if (json?.status !== 'ok') {
        console.log('FAIL: body.status is not "ok"', json);
        process.exitCode = 1;
        return;
      }
      console.log('OK: /api/health', json);
    } catch (err) {
      console.log('FAIL:', err instanceof Error ? err.message : err);
      process.exitCode = 1;
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
