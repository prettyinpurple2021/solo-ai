import "server-only";

import { StackServerApp } from "@stackframe/stack";

export function getStackServerApp() {
  const projectId = process.env.NEXT_PUBLIC_STACK_PROJECT_ID;
  const publishableClientKey = process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY;
  const secretServerKey = process.env.STACK_SECRET_SERVER_KEY;

  if (!projectId || !publishableClientKey || !secretServerKey) {
    return undefined;
  }

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
}
