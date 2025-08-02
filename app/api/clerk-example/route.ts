import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/clerk-auth"

export async function GET(request: NextRequest) {
  try {
    // This will throw an error if user is not authenticated
    const userId = await requireAuth()
    
    return NextResponse.json({
      message: "Authenticated successfully!",
      userId,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await requireAuth()
    const body = await request.json()
    
    return NextResponse.json({
      message: "Data received successfully!",
      userId,
      data: body,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    )
  }
} 