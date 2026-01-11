'use server';

import { signIn } from '@/lib/auth';
import { AuthError } from 'next-auth';
import { logError, logAuth } from '@/lib/logger';

export async function authenticateAction(
  prevState: string | undefined,
  formData: FormData,
) {
  const email = formData.get('email')?.toString();
  const password = formData.get('password')?.toString();
  const redirectTo = formData.get('redirectTo')?.toString() || '/dashboard';
  
  if (!email || !password) {
    return 'Email and password are required.';
  }
  
  try {
    await signIn('credentials', { 
      email,
      password,
      redirectTo 
    });
    // signIn will throw a redirect error on success - let it bubble up
  } catch (error) {
    // Only catch AuthErrors - let redirect errors (NEXT_REDIRECT) bubble up naturally
    if (error instanceof AuthError) {
      logAuth('credentials sign-in', undefined, false, { 
        source: 'authenticate-action',
        errorType: error.type,
        email 
      });
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          logError('Authentication error', { 
            source: 'authenticate-action',
            errorType: error.type,
            email 
          }, error instanceof Error ? error : undefined);
          return 'Something went wrong.';
      }
    }
    // Re-throw all other errors (including redirect errors) to allow Next.js to handle them
    throw error;
  }
}
