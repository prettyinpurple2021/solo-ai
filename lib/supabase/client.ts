import { createBrowserClient } from "@supabase/ssr"

export const createClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!url || !key) {
    // Return a mock client for development when env vars are missing
    // This allows the app to function in demo/development mode
    const mockUser = {
      id: 'demo-user-id',
      email: 'demo@example.com',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      app_metadata: {},
      user_metadata: {},
      aud: 'authenticated'
    }
    
    return {
      from: (table: string) => ({
        select: (columns?: string) => ({
          eq: (column: string, value: any) => ({
            single: () => Promise.resolve({ data: null, error: null }),
            order: (column: string, options?: any) => Promise.resolve({ data: [], error: null })
          }),
          order: (column: string, options?: any) => Promise.resolve({ data: [], error: null })
        }),
        insert: (data: any) => ({
          select: () => ({
            single: () => Promise.resolve({ 
              data: { 
                id: 'demo-project-' + Date.now(),
                user_id: mockUser.id,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                ...data 
              }, 
              error: null 
            })
          })
        }),
        update: (data: any) => ({
          eq: (column: string, value: any) => ({
            select: () => ({
              single: () => Promise.resolve({ 
                data: { 
                  id: value,
                  user_id: mockUser.id,
                  updated_at: new Date().toISOString(),
                  ...data 
                }, 
                error: null 
              })
            })
          })
        }),
        delete: () => ({
          eq: (column: string, value: any) => Promise.resolve({ error: null })
        })
      }),
      auth: {
        getUser: () => Promise.resolve({ data: { user: mockUser }, error: null }),
        getSession: () => Promise.resolve({ data: { session: { user: mockUser } }, error: null }),
        onAuthStateChange: (callback: any) => {
          // Immediately call callback with mock session
          callback('SIGNED_IN', { user: mockUser })
          return { data: { subscription: { unsubscribe: () => {} } } }
        },
        signOut: () => Promise.resolve({ error: null })
      }
    } as any
  }
  
  return createBrowserClient(url, key)
}

// Default export for backward compatibility
export default createClient
