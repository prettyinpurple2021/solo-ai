'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { socialLogin } from '@/lib/auth-actions';
import { registerUser } from '@/lib/actions/register-action';
import { PrimaryButton } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import Link from 'next/link';

export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState<string (null);
  const [isPending, setIsPending] = useState(false);
  const [passwordError, setPasswordError] = useState<string (null);
  const [ setAgeError] = useState<string (null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsPending(true);
    setError(null);
    setPasswordError(null);
    setAgeError(null);

    const formData = new FormData(event.currentTarget);
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;
    const dateOfBirth = formData.get('dateOfBirth') as string;
    
    // Validate age (18+)
    if (dateOfBirth) {
      const birthDate = new Date(dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      if (age < 18) {
        setAgeError('You must be 18 years or older to create an account.');
        setIsPending(false);
        return;
      }
    }
    
    // Validate password confirmation
    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      setIsPending(false);
      return;
    }
    
    try {
      const result = await registerUser(null, formData);

      if (result?.error) {
        setError(result.error);
        setIsPending(false);
        return;
      }

      const logIn = await signIn('credentials', {
        email: formData.get('email') as string,
        password: password,
        redirect: false,
      });

      if (logIn?.ok && !logIn.error) {
        setIsPending(false);
        router.push('/dashboard');
        router.refresh();
      } else {
        setError('Registration successful, but login failed. Please log in manually.');
        setIsPending(false);
      }
    } catch (err) {
      setError('An unexpected error occurred.');
      setIsPending(false);
    }
  }

  return (
    <div className="relative group max-w-lg mx-auto">
       <div className="absolute -inset-0.5 bg-gradient-to-r from-neon-magenta to-neon-purple rounded-2xl opacity-20 group-hover:opacity-40 transition duration-500 blur"></div>
       
       <div className="relative bg-dark-card/90 backdrop-blur-xl p-8 rounded-2xl border border-neon-purple/30 space-y-6">


         <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-neon-purple font-mono uppercase text-xs tracking-wider">First Name</Label>
                <Input id="firstName" name="firstName" required className="bg-dark-bg/50 border-white/10 text-white focus:border-neon-purple focus:ring-neon-purple/20 transition-all font-mono" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-neon-purple font-mono uppercase text-xs tracking-wider">Last Name</Label>
                <Input id="lastName" name="lastName" required className="bg-dark-bg/50 border-white/10 text-white focus:border-neon-purple focus:ring-neon-purple/20 transition-all font-mono" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateOfBirth" className="text-neon-purple font-mono uppercase text-xs tracking-wider">Date of Birth (18+)</Label>
              <Input id="dateOfBirth" name="dateOfBirth" type="date" required className="bg-dark-bg/50 border-white/10 text-white focus:border-neon-purple focus:ring-neon-purple/20 transition-all font-mono" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-neon-purple font-mono uppercase text-xs tracking-wider">Email Address</Label>
              <Input id="email" name="email" type="email" required className="bg-dark-bg/50 border-white/10 text-white focus:border-neon-purple focus:ring-neon-purple/20 transition-all font-mono" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-neon-purple font-mono uppercase text-xs tracking-wider">Password</Label>
              <Input id="password" name="password" type="password" required minLength={8} className="bg-dark-bg/50 border-white/10 text-white focus:border-neon-purple focus:ring-neon-purple/20 transition-all font-mono" />
              <p className="text-[10px] text-gray-500 font-mono">Must be 8+ characters.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-neon-purple font-mono uppercase text-xs tracking-wider">Confirm Password</Label>
              <Input id="confirmPassword" name="confirmPassword" type="password" required minLength={8} className="bg-dark-bg/50 border-white/10 text-white focus:border-neon-purple focus:ring-neon-purple/20 transition-all font-mono" />
              {passwordError && (
                <p className="text-xs text-neon-magenta font-mono">{passwordError}</p>
              )}
            </div>

            <div className="flex items-start gap-3 pt-2">
              <div className="flex items-center h-5">
                <Checkbox id="terms" name="terms" required className="border-neon-purple data-[state=checked]:bg-neon-purple" />
              </div>
              <Label htmlFor="terms" className="text-sm font-normal text-gray-400 leading-tight font-mono">
                I agree to the <Link href="/terms" className="text-neon-purple hover:text-neon-magenta transition-colors underline">Terms of Service</Link> and <Link href="/privacy" className="text-neon-purple hover:text-neon-magenta transition-colors underline">Privacy Policy</Link>.
              </Label>
            </div>

            {error && (
              <Alert variant="error" description={error} />
            )}

            <PrimaryButton 
              variant="purple"
              size="lg"
              className="w-full shadow-[0_0_15px_rgba(179,0,255,0.3)] font-orbitron uppercase tracking-wider" 
              disabled={isPending}
              type="submit"
            >
              {isPending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="animate-spin h-4 w-4" />
                  Creating Account...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2 tracking-widest uppercase">
                  Create Account
                </span>
              )}
            </PrimaryButton>
         </form>

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
                onClick={() => socialLogin('google')} 
                className="font-mono"
             >
                Google
             </PrimaryButton>
             <PrimaryButton 
                variant="purple"
                onClick={() => socialLogin('github')} 
                className="font-mono"
             >
                GitHub
             </PrimaryButton>
          </div>

          <p className="text-center text-sm text-gray-500 mt-6 font-mono">
            Already have an account?{' '}
            <Link href="/login" className="text-neon-magenta hover:text-neon-purple transition-colors underline decoration-dashed underline-offset-4">
              Sign In
            </Link>
          </p>
       </div>
    </div>
  );
}
