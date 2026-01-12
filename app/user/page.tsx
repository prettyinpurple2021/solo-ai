import { redirect } from 'next/navigation';

// Redirect /user to /profile (consolidated user profile page)
export default function UserRedirect() {
  redirect('/profile');
}
