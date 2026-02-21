import { db } from './db';
import { users } from '../src/lib/shared/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { logInfo, logError } from './utils/logger';

async function createAdminUser() {
  const email = 'testadmin@solosuccess.ai';
  const password = 'TestAdmin123!';
  const username = 'testadmin';
  const fullName = 'Test Admin';
  const role = 'admin';

  logInfo(`Checking if user ${email} already exists...`);

  try {
    const existingUser = await db.select().from(users).where(eq(users.email, email));

    if (existingUser.length > 0) {
      logInfo(`User ${email} already exists. Updating role to admin...`);
      await db.update(users)
        .set({ role: 'admin' })
        .where(eq(users.email, email));
      logInfo('User role updated successfully.');
    } else {
      logInfo(`Creating new admin user ${email}...`);
      const hashedPassword = await bcrypt.hash(password, 10);
      
      await db.insert(users).values({
        id: crypto.randomUUID(),
        email,
        password: hashedPassword,
        name: fullName,
        username,
        role: 'admin',
        created_at: new Date(),
        updated_at: new Date(),
        emailVerified: new Date(),
        subscription_tier: 'free',
        subscription_status: 'active',
        onboarding_completed: true,
        is_verified: true,
      });
      
      logInfo('Admin user created successfully.');
    }
  } catch (error) {
    logError('Error creating admin user', error);
  }
  process.exit(0);
}

createAdminUser();
