import { redirect } from 'next/navigation'

export default function HomePage() {
  // Redirect to the simplified landing page
  redirect('/landing')
}
