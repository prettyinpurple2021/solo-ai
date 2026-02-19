import { redirect } from 'next/navigation';

// Redirect /signup to /register
export default function SignUpRedirect() {
  redirect('/register');
}
