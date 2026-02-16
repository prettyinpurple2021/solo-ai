'use server';

import { signIn, signOut } from '@/lib/auth';
import { AuthError } from 'next-auth';
import { logError, logInfo, logAuth } from '@/lib/logger';
import { db } from '@/db/index';
import { users } from '@/shared/db/schema';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  const email = formData.get('email')?.toString();
  const password = formData.get('password')?.toString();
  const redirectTo = formData.get('redirectTo')?.toString() || '/dashboard';
  
  if (!email || !password) {
    return 'Email and password are required.';
  }
  
  try {
    await signIn('credentials', { 
      email,
      password,
      redirectTo 
    });
    // signIn will throw a redirect error on success - let it bubble up
  } catch (error) {
    // Only catch AuthErrors - let redirect errors (NEXT_REDIRECT) bubble up naturally
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          return 'Something went wrong.';
      }
    }
    // Re-throw all other errors (including redirect errors) to allow Next.js to handle them
    throw error;
  }
  return undefined;
}

export async function socialLogin(provider: string) {
  try {
    await signIn(provider, { redirectTo: '/dashboard' });
  } catch (error) {
    if (error instanceof AuthError) {
      throw error; // Let NextAuth handle its errors
    }
    // Rethrow to allow redirect
    throw error;
  }
}

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

export async function register(prevState: any, formData: FormData) {
  logInfo('Register action triggered', { source: 'auth-actions.register' });
  const rawData = Object.fromEntries(formData);
  const validatedFields = RegisterSchema.safeParse(rawData);

  if (!validatedFields.success) {
    // Return the first error message
    const firstError = validatedFields.error.errors[0]?.message || 'Invalid fields.';
    return {
      error: firstError,
    };
  }

  const { firstName, lastName, email, password, dateOfBirth } = validatedFields.data;
  const fullName = `${firstName} ${lastName}`.trim();

  // Check if user exists
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
      name: fullName, // Fallback
      username: email.split('@')[0], // Simple username generation
      role: 'user',
      date_of_birth: new Date(dateOfBirth),
    });
  } catch (error) {
    logError('Registration error: Failed to create user in database', { source: 'auth-actions.register' }, error instanceof Error ? error : new Error(String(error)));
    return {
      error: 'Database error: Failed to create user.',
    };
  }

  try {
    await signIn('credentials', { email, password, redirectTo: '/dashboard' });
    // signIn will throw a redirect error on success - let it bubble up
  } catch (error) {
    // Only catch AuthErrors - let redirect errors (NEXT_REDIRECT) bubble up naturally
    if (error instanceof AuthError) {
      logAuth('sign-in during registration', undefined, false, { 
        source: 'auth-actions.register',
        errorType: error.type 
      });
      logError('Sign in error during registration after successful user creation', { source: 'auth-actions.register', errorType: error.type }, error);
      // Since the user IS created, we shouldn't say "registration failed".
      // We can ask them to login manually.
      return {
        error: 'Account created, but auto-login failed. Please sign in manually.',
      };
    }
    // Re-throw all other errors (including redirect errors) to allow Next.js to handle them
    throw error;
  }
  return undefined;
}

export async function handleSignOut() {
    await signOut();
}
