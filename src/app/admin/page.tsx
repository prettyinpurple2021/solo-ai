export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

import AdminClient from './admin-client'

export default function AdminPage() {
  return <AdminClient />
}
