import { redirect } from 'next/navigation';

// Redirect /signin to /login
export default function SignInRedirect() {
  redirect('/login');
}
