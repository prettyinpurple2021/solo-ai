'use server';


import { db } from '@/db/index';
import { users } from '@/shared/db/schema';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { logInfo, logError } from '@/lib/logger';

const RegisterSchema = z.object({
  firstName: z.string().min(2, "First name is too short"),
  lastName: z.string().min(2, "Last name is too short"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  terms: z.string().optional().refine((val) => val === 'on', {
    message: "You must agree to the terms and conditions"
  }),
  dateOfBirth: z.string().refine((date) => {
    const today = new Date();
    const birthDate = new Date(date);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age >= 18;
  }, { message: "You must be 18+ to register." }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export async function registerUser(prevState: any, formData: FormData) {
  logInfo('RegisterUser action triggered');
  const rawData = Object.fromEntries(formData);
  const validatedFields = RegisterSchema.safeParse(rawData);

  if (!validatedFields.success) {
    const firstError = validatedFields.error.errors[0]?.message || 'Invalid fields.';
    return {
      error: firstError,
    };
  }

  const { firstName, lastName, email, password, dateOfBirth } = validatedFields.data;
  const fullName = `${firstName} ${lastName}`.trim();

  const existingUserResult = await db.select().from(users).where(eq(users.email, email)).limit(1);
  const existingUser = existingUserResult[0];

  if (existingUser) {
    return {
      error: 'Email already registered.',
    };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    await db.insert(users).values({
      email,
      password: hashedPassword,
      full_name: fullName,
      name: fullName,
      username: email.split('@')[0],
      role: 'user',
      date_of_birth: new Date(dateOfBirth),
    });
  } catch (error) {
    logError('Registration error: Failed to create user', { 
      email,
      action: 'register_user'
    }, error instanceof Error ? error : undefined);
    return {
      error: 'Database error: Failed to create user.',
    };
  }

    return {
      success: true,
    };
  }
