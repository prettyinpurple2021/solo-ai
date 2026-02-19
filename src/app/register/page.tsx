import { RegisterForm } from '@/components/auth/register-form';
import Link from 'next/link';
import { Heading } from '@/components/ui/Heading';

export const dynamic = 'force-dynamic'

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4 relative overflow-hidden">
       {/* Background Effects */}
      <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-neon-purple/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] bg-neon-magenta/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0))] opacity-20 pointer-events-none" />

      <div className="w-full max-w-lg relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
           <Heading level={1} color="purple" glitch={true} className="text-4xl mb-2">
            CREATE YOUR ACCOUNT
          </Heading>
          <p className="text-gray-400 font-mono text-xs uppercase tracking-widest">
            Join the SoloSuccess Network // Secure Uplink
          </p>
        </div>

        <RegisterForm />
        
        <div className="mt-8 text-center font-mono text-xs text-gray-500">
           ALREADY HAVE CREDENTIALS? <Link href="/login" className="text-neon-cyan hover:text-neon-purple transition-colors underline ml-2">ACCESS TERMINAL</Link>
        </div>
      </div>
    </div>
  );
}
