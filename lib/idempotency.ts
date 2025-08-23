type SqlClient = {
  query: (_text: string, _params?: any[]) => Promise<{ rowCount: number }>
}

export async function reserveIdempotencyKey(
  client: SqlClient,
  key: string
): Promise<boolean> {
  // Ensure table exists (safe to run repeatedly)
  await client.query(
    `CREATE TABLE IF NOT EXISTS idempotency_keys (
       key text PRIMARY KEY,
       created_at timestamptz DEFAULT now()
     )`
  )

  const result = await client.query(
    `INSERT INTO idempotency_keys(key) VALUES($1)
     ON CONFLICT (key) DO NOTHING`,
    [key]
  )

  return result.rowCount === 1
}

export function getIdempotencyKeyFromRequest(req: Request): string | null {
  const header = req.headers.get('Idempotency-Key') || req.headers.get('idempotency-key')
  return header && header.trim().length > 0 ? header.trim() : null
}


