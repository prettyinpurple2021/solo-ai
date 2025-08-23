import { NeonAuth } from "@/components/auth/neon-auth";

// Disable static generation for auth pages
export const dynamic = 'force-dynamic';

export default function SignUpPage() {
  return <NeonAuth />;
}
