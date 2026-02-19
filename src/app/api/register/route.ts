import { NextResponse } from "next/server"
import { db } from "@/db"
import { users } from "@/shared/db/schema"
import { eq } from "drizzle-orm"
import bcrypt from "bcryptjs"
import { z } from "zod"

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional(),
})

export async function POST(req: Request) {
  try {
    const json = await req.json()
    const { email, password, name } = registerSchema.parse(json)

    const existingUser = await db.select().from(users).where(eq(users.email, email))

    if (existingUser.length > 0) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const [user] = await db
      .insert(users)
      .values({
        email,
        password: hashedPassword,
        name: name || email.split("@")[0],
        // Populate legacy fields for compatibility
        username: email.split("@")[0],
        full_name: name || email.split("@")[0],
        emailVerified: new Date(),
      })
      .returning()

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({ user: userWithoutPassword })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
