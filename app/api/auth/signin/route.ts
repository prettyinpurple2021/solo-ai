import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { neon } from '@neondatabase/serverless'

function getSql() {
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error('DATABASE_URL is not set')
  }
  return neon(url)
}

export async function POST(request: NextRequest) {
  try {
    const sql = getSql()
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Get user from database
    const users = await sql`
      SELECT id, email, password_hash, full_name, username, date_of_birth, created_at
      FROM users 
      WHERE email = ${email.toLowerCase()}
    `

    if (users.length === 0) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    const user = users[0]

    // Check if user has a password hash (for existing users without passwords)
    if (!user.password_hash) {
      return NextResponse.json(
        { error: 'Please set up a password for your account' },
        { status: 401 }
      )
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash)
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        username: user.username 
      },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    )

    // Return user data (without password)
    const userData = {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      username: user.username,
      date_of_birth: user.date_of_birth,
      created_at: user.created_at
    }

    return NextResponse.json({
      user: userData,
      token
    })

  } catch (error) {
    console.error('Signin error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
