'use client';

import { useActionState } from 'react';
import { authenticateAction } from '@/lib/actions/authenticate-action';
import { socialLogin } from '@/lib/auth-actions';
import { useSearchParams } from 'next/navigation';
import { PrimaryButton } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

export function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
  const error = searchParams.get('error');
  
  const [errorMessage, formAction, isPending] = useActionState<string | undefined, FormData>(
    authenticateAction,
    undefined
  );

  return (
    <div className="relative group max-w-md mx-auto">
      {/* Glow effect */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-neon-purple to-neon-cyan rounded-2xl opacity-20 group-hover:opacity-40 transition duration-500 blur"></div>
      
      <div className="relative bg-dark-card/90 backdrop-blur-xl p-8 rounded-2xl border border-neon-cyan/30">


        <form action={formAction} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-neon-cyan font-mono uppercase text-xs tracking-wider">
              Identity / Email
            </Label>
            <Input
              id="email"
              type="email"
              name="email"
              autoComplete="email"
              placeholder="support@solosuccesss.com"
              required
              className="bg-dark-bg/50 border-white/10 text-white focus:border-neon-cyan focus:ring-neon-cyan/20 transition-all font-mono"
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-neon-purple font-mono uppercase text-xs tracking-wider">
                Passcode
              </Label>
              <Link href="/forgot-password" className="text-xs text-gray-400 hover:text-neon-cyan transition-colors font-mono">
                Recover Access?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              name="password"
              autoComplete="current-password"
              required
              minLength={6}
              className="bg-dark-bg/50 border-white/10 text-white focus:border-neon-purple focus:ring-neon-purple/20 transition-all font-mono"
            />
          </div>

          <input type="hidden" name="redirectTo" value={callbackUrl} />

          {error && (
            <Alert variant="error" description={
              error === 'Configuration' ? 'Server Configuration Error. Check Provider Secrets.' : 
              error === 'CredentialsSignin' ? 'Invalid credentials provided.' : 'Authentication failed.'
            } />
          )}
           
          {errorMessage && (
            <Alert variant="error" description={errorMessage} />
          )}

          <PrimaryButton 
            variant="cyan"
            size="lg"
            className="w-full" 
            disabled={isPending}
            type="submit"
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Auth Sequence Initiated...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2 tracking-widest uppercase">
                Initialize Session
              </span>
            )}
          </PrimaryButton>
          
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-dark-card px-2 text-gray-500 font-mono">
                Or Connect Via
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
             <PrimaryButton 
                variant="purple"
                type="button" 
                onClick={() => socialLogin('google')} 
                className="font-mono"
             >
                Google
             </PrimaryButton>
             <PrimaryButton 
                variant="purple"
                type="button" 
                onClick={() => socialLogin('github')} 
                className="font-mono"
             >
                GitHub
             </PrimaryButton>
          </div>

          <p className="text-center text-sm text-gray-500 mt-6 font-mono">
            New here?{' '}
            <Link href="/register" className="text-neon-cyan hover:text-neon-purple transition-colors underline decoration-dashed underline-offset-4">
              Register Credentials
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
