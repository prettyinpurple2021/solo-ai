import { NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth-server';
import { createClient } from '@/lib/neon/server';

export async function GET() {
  try {
    const { user, error: authError } = await authenticateRequest();
    if (authError || !user) {
      return NextResponse.json({ error: authError || 'Authentication failed' }, { status: 401 });
    }

    const dbClient = await createClient();
    const { rows } = await dbClient.query(
      'SELECT provider FROM user_integrations WHERE user_id = $1',
      [user.id]
    );

    const connectedProviders = rows.map((row) => row.provider);

    return NextResponse.json({ connectedProviders });

  } catch (error) {
    console.error('[Integrations Status Error]', error);
    return NextResponse.json({ error: 'Failed to fetch integration statuses.' }, { status: 500 });
  }
}
