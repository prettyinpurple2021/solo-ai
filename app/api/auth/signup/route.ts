import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { neon } from '@neondatabase/serverless'
import { randomUUID } from 'crypto'

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
    const { email, password, metadata } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUsers = await sql`
      SELECT id FROM users WHERE email = ${email.toLowerCase()}
    `

    if (existingUsers.length > 0) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      )
    }

    // Hash password
    const saltRounds = 12
    const passwordHash = await bcrypt.hash(password, saltRounds)

    // Extract metadata
    const fullName = metadata?.full_name || ''
    const usernameValue = (metadata?.username && String(metadata.username).trim().length > 0)
      ? String(metadata.username).trim().toLowerCase()
      : null
    const dateOfBirth = metadata?.date_of_birth || null

    // Create user in database
    const _userId = randomUUID()
    const newUsers = await sql`
      INSERT INTO users (id, email, password_hash, full_name, username, date_of_birth, created_at, updated_at)
      VALUES (${_userId}, ${email.toLowerCase()}, ${passwordHash}, ${fullName}, ${usernameValue}, ${dateOfBirth}, NOW(), NOW())
      RETURNING id, email, full_name, username, date_of_birth, created_at
    `

    if (newUsers.length === 0) {
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      )
    }

    const newUser = newUsers[0]

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: newUser.id, 
        email: newUser.email,
        username: newUser.username 
      },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    )

    // Return user data (without password)
    const userData = {
      id: newUser.id,
      email: newUser.email,
      full_name: newUser.full_name,
      username: newUser.username,
      date_of_birth: newUser.date_of_birth,
      created_at: newUser.created_at
    }

    return NextResponse.json({
      user: userData,
      token
    })

  } catch (error) {
    console.error('Signup error:', error)
    const message = error instanceof Error ? error.message : String(error)
    return NextResponse.json(
      { error: 'Internal server error', message: process.env.NODE_ENV === 'development' ? message : undefined },
      { status: 500 }
    )
  }
}
