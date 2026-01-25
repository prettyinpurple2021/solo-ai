import { logError,} from '@/lib/logger'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'


export async function getServerAuthToken(): Promise<string | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth_token')?.value
    return token || null
  } catch (error) {
    logError('Error getting auth token from cookies:', error)
    return null
  }
}

export async function getServerUser(): Promise<{ id: string; email: string } | null> {
  try {
    const token = await getServerAuthToken()
    if (!token) return null

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    return {
      id: decoded.userId,
      email: decoded.email
    }
  } catch (error) {
    logError('Error verifying auth token:', error)
    return null
  }
}

export function setAuthCookie(token: string, res: any) {
  res.cookies.set('auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7 // 7 days
  })
}

export function clearAuthCookie(res: any) {
  res.cookies.delete('auth_token')
}
