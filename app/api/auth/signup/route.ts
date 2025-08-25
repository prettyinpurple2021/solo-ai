import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest) {
  try {
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
    const username = metadata?.username || ''
    const dateOfBirth = metadata?.date_of_birth || null

    // Create user in database
    const newUsers = await sql`
      INSERT INTO users (email, password_hash, full_name, username, date_of_birth, created_at)
      VALUES (${email.toLowerCase()}, ${passwordHash}, ${fullName}, ${username}, ${dateOfBirth}, NOW())
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
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
