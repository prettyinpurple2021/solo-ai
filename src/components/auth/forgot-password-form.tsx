'use client';

import { useState } from 'react';
import { PrimaryButton } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert } from '@/components/ui/alert';
import { Loader2, CheckCircle, Mail } from 'lucide-react';
import { Heading } from '@/components/ui/Heading';

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [isPending, setIsPending] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string (null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    setError(null);
    
    // Basic email validation
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      setIsPending(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send reset email');
      }

      setSubmitted(true);
      setEmail(''); // Clear the input field
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred. Please try again.");
    } finally {
      setIsPending(false);
    }
  };

  if (submitted) {
     return (
        <div className="relative bg-dark-card/90 backdrop-blur-xl p-8 rounded-2xl border border-neon-cyan/30 text-center">
             <div className="text-neon-cyan text-4xl mb-4">
               <CheckCircle className="h-12 w-12 mx-auto" />
             </div>
             <Heading level={3} color="cyan" className="mb-2">PROTOCOL INITIATED</Heading>
             <p className="text-gray-400 font-mono text-sm">
                If an active agent profile exists for that email, recovery instructions have been transmitted.
             </p>
        </div>
     );
  }

  return (
    <div className="relative group">
       <div className="absolute -inset-0.5 bg-gradient-to-r from-neon-cyan to-neon-purple rounded-2xl opacity-20 group-hover:opacity-40 transition duration-500 blur"></div>
       
       <div className="relative bg-dark-card/90 backdrop-blur-xl p-8 rounded-2xl border border-neon-cyan/30 space-y-6">
         <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-neon-cyan font-mono uppercase text-xs tracking-wider">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                <Input 
                  id="email" 
                  name="email" 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                  className="pl-10 bg-dark-bg/50 border-white/10 focus:border-neon-cyan/50 text-white placeholder:text-gray-500 font-mono" 
                  placeholder="agent@solosuccess.ai" 
                />
              </div>
            </div>

            {error && (
              <Alert variant="error" description={error} />
            )}

            <PrimaryButton variant="cyan" size="lg" className="w-full mt-4 shadow-[0_0_15px_rgba(11,228,236,0.3)] font-orbitron uppercase tracking-wider" disabled={isPending} type="submit">
              {isPending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="animate-spin h-4 w-4" />
                  Transmit Recovery Link
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2 tracking-widest uppercase">
                  Transmit Recovery Link
                </span>
              )}
            </PrimaryButton>
         </form>
       </div>
    </div>
  );
}
