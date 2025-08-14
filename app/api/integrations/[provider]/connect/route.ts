import { NextResponse } from 'next/server';
import { getGoogleOAuth2Client, GOOGLE_CALENDAR_SCOPES } from '@/lib/google-auth';

export const runtime = 'nodejs';

export async function GET(
  request: Request,
  context: any
) {
  const { provider } = context?.params || {};

  if (provider !== 'google') {
    return NextResponse.json({ message: `Provider '${provider}' is not supported.` }, { status: 400 });
  }

  // Generate the URL that will be used for the user to give consent.
  const oauth2Client = getGoogleOAuth2Client();
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline', // Required to get a refresh token
    scope: GOOGLE_CALENDAR_SCOPES,
    // A 'prompt' is not strictly necessary but can be useful for development
    // Uncomment the line below and set `prompt: 'consent'` if you need to force the consent screen
    // to appear every time (e.g., during development or when you need a new refresh token).
    // In production, leaving this commented out is usually preferred to avoid unnecessary prompts.
    // prompt: 'consent',
  });

  // Redirect the user to the generated Google authentication URL.
  return NextResponse.redirect(authUrl);
}
