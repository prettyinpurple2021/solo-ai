import { NeonAuth } from "@/components/auth/neon-auth";

// Disable static generation for auth pages
export const dynamic = 'force-dynamic';

export default function SignInPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <NeonAuth />
    </div>
  );
}
