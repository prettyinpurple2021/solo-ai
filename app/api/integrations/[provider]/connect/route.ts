import { NextResponse } from 'next/server';
import { oauth2Client, GOOGLE_CALENDAR_SCOPES } from '@/lib/google-auth';

export async function GET(
  request: Request,
  { params }: { params: { provider: string } }
) {
  const { provider } = params;

  if (provider !== 'google') {
    return NextResponse.json({ message: `Provider '${provider}' is not supported.` }, { status: 400 });
  }

  // Generate the URL that will be used for the user to give consent.
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline', // Required to get a refresh token
    scope: GOOGLE_CALENDAR_SCOPES,
    // A 'prompt' is not strictly necessary but can be useful for development
    // to ensure the consent screen is shown every time.
    // prompt: 'consent',
  });

  // Redirect the user to the generated Google authentication URL.
  return NextResponse.redirect(authUrl);
}
