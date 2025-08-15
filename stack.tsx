import "server-only";

import { StackServerApp } from "@stackframe/stack";

export function getStackServerApp() {
  const projectId = process.env.NEXT_PUBLIC_STACK_PROJECT_ID;
  const publishableClientKey = process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY;
  const secretServerKey = process.env.STACK_SECRET_SERVER_KEY;

  // Return undefined if any required environment variable is missing
  if (!projectId || !publishableClientKey || !secretServerKey) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('Stack Auth: Missing required environment variables. Authentication will not work.');
    }
    return undefined;
  }

  try {
    return new StackServerApp({
      projectId,
      publishableClientKey,
      secretServerKey,
      tokenStore: "nextjs-cookie",
      urls: {
        signIn: '/signin',
        signUp: '/signup',
      }
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Stack Auth: Failed to initialize server app:', error);
    }
    return undefined;
  }
}
