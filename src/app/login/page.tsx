import { LoginForm } from '@/components/auth/login-form';
import { Suspense } from 'react';
import { Heading } from '@/components/ui/Heading';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-neon-purple/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-neon-cyan/20 rounded-full blur-[120px] pointer-events-none" />

      {/* Grid Overlay */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-20 pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <Heading level={1} color="cyan" glitch={true} className="text-4xl mb-2">
            WELCOME BACK
          </Heading>
          <p className="text-gray-400 font-mono text-sm tracking-wider uppercase">
            System Access Portal
          </p>
        </div>

        <Suspense fallback={<div className="text-neon-cyan text-center animate-pulse">Initializing Security Protocols...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
