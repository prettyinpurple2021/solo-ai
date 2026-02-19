import { ForgotPasswordForm } from '@/components/auth/forgot-password-form';
import Link from 'next/link';
import { Heading } from '@/components/ui/Heading';

export const dynamic = 'force-dynamic'

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4 relative overflow-hidden">
       {/* Background Effects */}
      <div className="absolute top-[-20%] left-[20%] w-[60%] h-[60%] bg-neon-cyan/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0))] opacity-20 pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
           <Heading level={1} color="cyan" glitch={true} className="text-3xl mb-2">
            RECOVER ACCESS
          </Heading>
          <p className="text-gray-400 font-mono text-xs uppercase tracking-widest">
            Initiate Credential Reset Protocol
          </p>
        </div>

        <ForgotPasswordForm />
        
        <div className="mt-8 text-center font-mono text-xs text-gray-500">
           REMEMBERED CREDENTIALS? <Link href="/login" className="text-neon-purple hover:text-neon-cyan transition-colors underline ml-2">RETURN TO LOGIN</Link>
        </div>
      </div>
    </div>
  );
}
