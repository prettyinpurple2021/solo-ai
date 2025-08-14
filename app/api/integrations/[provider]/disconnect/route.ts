import { NextResponse } from 'next/server';
export const runtime = 'nodejs';
import { authenticateRequest } from '@/lib/auth-server';
import { createClient } from '@/lib/neon/server';

export async function POST(
  request: Request,
  context: unknown
) {
  const provider = (context as { params?: { provider?: string } })?.params?.provider;

  try {
    const { user, error: authError } = await authenticateRequest();
    if (authError || !user) {
      return NextResponse.json({ error: authError || 'Authentication failed' }, { status: 401 });
    }

    const dbClient = await createClient();
    const { rowCount } = await dbClient.query(
      'DELETE FROM user_integrations WHERE user_id = $1 AND provider = $2',
      [user.id, provider]
    );

    if (rowCount === 0) {
      return NextResponse.json({ error: 'Integration not found or already disconnected.' }, { status: 404 });
    }

    return NextResponse.json({ message: `Successfully disconnected from ${provider}.` });

  } catch (error) {
    console.error(`[${provider} Disconnect Error]`, error);
    return NextResponse.json({ error: `Failed to disconnect from ${provider}.` }, { status: 500 });
  }
}
