import { NextResponse } from 'next/server';
import { getGoogleOAuth2Client } from '@/lib/google-auth';
import { encrypt } from '@/lib/encryption';
import { authenticateRequest } from '@/lib/auth-server';
import { createClient } from '@/lib/neon/server';

export const runtime = 'nodejs';

export async function GET(
  request: Request,
  context: any
) {
  const { provider } = context?.params || {};
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (provider !== 'google') {
    return NextResponse.json({ message: `Provider '${provider}' is not supported.` }, { status: 400 });
  }

  if (!code) {
    return NextResponse.json({ error: 'Authorization code is missing.' }, { status: 400 });
  }

  try {
    // 1. Authenticate the user making the request
    const { user, error: authError } = await authenticateRequest();
    if (authError || !user) {
      return NextResponse.json({ error: authError || 'Authentication failed.' }, { status: 401 });
    }

    // 2. Exchange the authorization code for tokens
    const oauth2Client = getGoogleOAuth2Client();
    const { tokens } = await oauth2Client.getToken(code);
    const { access_token, refresh_token, expiry_date, scope } = tokens;

    if (!access_token) {
      throw new Error('Failed to retrieve access token from Google.');
    }

    // 3. Encrypt the tokens for secure storage
    const encryptedAccessToken = encrypt(access_token);
    const encryptedRefreshToken = refresh_token ? encrypt(refresh_token) : null;

    // 4. Save the integration details to the database
    const dbClient = await createClient();
    const query = `
      INSERT INTO user_integrations (user_id, provider, access_token, refresh_token, expires_at, scopes)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (user_id, provider)
      DO UPDATE SET
        access_token = EXCLUDED.access_token,
        refresh_token = COALESCE(EXCLUDED.refresh_token, user_integrations.refresh_token),
        expires_at = EXCLUDED.expires_at,
        scopes = EXCLUDED.scopes,
        updated_at = NOW()
    `;

    const values = [
      user.id,
      provider,
      encryptedAccessToken,
      encryptedRefreshToken,
      expiry_date ? new Date(expiry_date) : null,
      scope ? scope.split(' ') : [],
    ];

    await dbClient.query(query, values);

    // 5. Redirect user back to the integrations page
    const redirectUrl = process.env.NEXT_PUBLIC_APP_URL
      ? `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/integrations`
      : 'http://localhost:3000/dashboard/integrations';

    return NextResponse.redirect(`${redirectUrl}?success=true&provider=google`);

  } catch (error) {
    console.error(`[Google Callback Error]`, error);
    const redirectUrl = process.env.NEXT_PUBLIC_APP_URL
      ? `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/integrations`
      : 'http://localhost:3000/dashboard/integrations';
    return NextResponse.redirect(`${redirectUrl}?error=true&provider=google`);
  }
}
