#!/usr/bin/env node

const baseUrl = (process.env.SMOKE_BASE_URL || 'http://localhost:3000').replace(/\/$/, '');
const skipSignup = process.env.SMOKE_SKIP_SIGNUP === '1' || process.env.SMOKE_SKIP_SIGNUP === 'true';

function randomEmail() {
  const ts = Date.now();
  return `smoke_${ts}@example.com`;
}

async function jsonFetch(path, options = {}) {
  const res = await fetch(baseUrl + path, {
    headers: {
      'content-type': 'application/json',
      ...(options.headers || {}),
    },
    redirect: 'manual',
    ...options,
  });
  let bodyText = '';
  try { bodyText = await res.text(); } catch (_) {}
  let json;
  try { json = JSON.parse(bodyText); } catch (_) {}
  return { res, bodyText, json };
}

(async () => {
  let failures = 0;

  console.log(`[smoke] baseUrl=${baseUrl} skipSignup=${skipSignup}`);

  // Home: must respond without server error
  try {
    const { res } = await jsonFetch('/');
    console.log(`GET /: ${res.status}`);
    if (res.status >= 500) failures++;
  } catch (e) {
    console.log(`GET /: ERROR ${e.message}`);
    failures++;
  }

  // Liveness: JSON status ok
  try {
    const { res, json } = await jsonFetch('/api/health');
    console.log(`GET /api/health: ${res.status} body.status=${json?.status ?? 'n/a'}`);
    if (res.status !== 200 || json?.status !== 'ok') failures++;
  } catch (e) {
    console.log(`GET /api/health: ERROR ${e.message}`);
    failures++;
  }

  // Dependencies: JSON top-level status ok (HTTP may be 200 even when checks fail)
  try {
    const { res, json } = await jsonFetch('/api/health/deps');
    console.log(`GET /api/health/deps: ${res.status} body.status=${json?.status ?? 'n/a'}`);
    if (res.status !== 200 || json?.status !== 'ok') failures++;
  } catch (e) {
    console.log(`GET /api/health/deps: ERROR ${e.message}`);
    failures++;
  }

  if (skipSignup) {
    console.log('[smoke] SMOKE_SKIP_SIGNUP set — skipping signup and JWT API checks');
    process.exit(failures ? 1 : 0);
  }

  // Create test user (signup) and obtain JWT
  const email = randomEmail();
  const password = 'Test1234!';
  try {
    const { res, json } = await jsonFetch('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, metadata: { full_name: 'Smoke Test' } }),
    });
    if (res.status !== 200 || !json?.token) {
      console.log(`/api/auth/signup: ${res.status} token missing`);
      failures++;
      process.exit(failures ? 1 : 0);
    }
    console.log(`/api/auth/signup: ${res.status}`);

    const token = json.token;
    const authHeader = { Authorization: `Bearer ${token}` };

    // JWT-auth endpoints
    for (const path of ['/api/auth/user', '/api/briefcases']) {
      const { res } = await jsonFetch(path, { headers: authHeader });
      console.log(`${path} (auth): ${res.status}`);
      if (res.status === 401 || res.status >= 500) failures++;
    }

    // Create a briefcase, then list and verify it exists
    const title = `Smoke Briefcase ${Date.now()}`;
    const description = 'Created by smoke test';
    const create = await jsonFetch('/api/briefcases', {
      method: 'POST',
      headers: authHeader,
      body: JSON.stringify({ title, description })
    });
    console.log(`/api/briefcases (create): ${create.res.status}`);
    if (create.res.status !== 200 || !create.json?.id) failures++;
    const createdId = create.json?.id;

    const list = await jsonFetch('/api/briefcases', { headers: authHeader });
    console.log(`/api/briefcases (list): ${list.res.status}`);
    if (list.res.status !== 200 || !Array.isArray(list.json)) failures++;
    const found = Array.isArray(list.json) && list.json.some(b => b.id === createdId);
    console.log(`briefcase roundtrip found=${found}`);
    if (!found) failures++;

  } catch (e) {
    console.log(`auth flow error: ${e.message}`);
    failures++;
  }

  process.exit(failures ? 1 : 0);
})();


