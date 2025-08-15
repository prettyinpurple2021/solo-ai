#!/usr/bin/env node
import { Pool } from 'pg'
import bcrypt from 'bcryptjs'

const { DATABASE_URL, E2E_EMAIL = 'test@solobossai.fun', E2E_PASSWORD = 'testpassword123' } = process.env

if (!DATABASE_URL) {
  console.error('DATABASE_URL is required')
  process.exit(1)
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
})

async function ensureUser() {
  const client = await pool.connect()
  try {
    const { rows } = await client.query('SELECT id FROM users WHERE email = $1', [E2E_EMAIL])
    if (rows.length > 0) {
      console.log('E2E user exists')
      return
    }
    const hash = await bcrypt.hash(E2E_PASSWORD, 10)
    await client.query(
      `INSERT INTO users (email, password_hash, full_name, subscription_tier)
       VALUES ($1, $2, $3, $4)`,
      [E2E_EMAIL, hash, 'E2E User', 'free']
    )
    console.log('E2E user created')
  } finally {
    client.release()
    await pool.end()
  }
}

ensureUser().catch((e) => {
  console.error(e)
  process.exit(1)
})


