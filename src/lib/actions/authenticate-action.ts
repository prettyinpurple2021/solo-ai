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
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/14516a68-1bb2-4b59-8efb-d88ef82ca008',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'pre-fix',hypothesisId:'H4',location:'src/lib/actions/authenticate-action.ts:authenticateAction',message:'credentials sign-in attempt',data:{emailSuffix:email.split('@')[1] || 'missing',redirectTo},timestamp:Date.now()})}).catch(()=>{})
    // #endregion agent log

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

      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/14516a68-1bb2-4b59-8efb-d88ef82ca008',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'pre-fix',hypothesisId:'H4',location:'src/lib/actions/authenticate-action.ts:authenticateAction',message:'credentials sign-in failed',data:{errorType:error.type,emailSuffix:email.split('@')[1] || 'missing'},timestamp:Date.now()})}).catch(()=>{})
      // #endregion agent log

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
