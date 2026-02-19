import { redirect } from 'next/navigation';

// Redirect /account-recovery to /forgot-password (consolidated password recovery)
export default function AccountRecoveryRedirect() {
  redirect('/forgot-password');
}
