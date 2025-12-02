import { StackProvider, StackClientApp } from "@stackframe/stack";
import { ReactNode } from "react";

// Create Stack Client App instance
const stackApp = new StackClientApp({
    projectId: process.env.NEXT_PUBLIC_STACK_PROJECT_ID || '',
    publishableClientKey: process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY || '',
    tokenStore: 'cookie',
});

// Make stackApp globally accessible for storageService
if (typeof window !== 'undefined') {
    (window as any).stackApp = stackApp;
}

export function AuthProvider({ children }: { children: ReactNode }) {
    return (
        <StackProvider app={stackApp}>
            {children}
        </StackProvider>
    );
}

export { stackApp };
