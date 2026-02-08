import { db } from './db';
import { users } from './db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

async function createAdminUser() {
  const email = 'testadmin@solosuccess.ai';
  const password = 'TestAdmin123!';
  const username = 'testadmin';
  const fullName = 'Test Admin';
  const role = 'admin';

  console.log(`Checking if user ${email} already exists...`);

  try {
    const existingUser = await db.select().from(users).where(eq(users.email, email));

    if (existingUser.length > 0) {
      console.log(`User ${email} already exists. Updating role to admin...`);
      await db.update(users)
        .set({ role: 'admin' })
        .where(eq(users.email, email));
      console.log('User role updated successfully.');
    } else {
      console.log(`Creating new admin user ${email}...`);
      const hashedPassword = await bcrypt.hash(password, 10);
      
      await db.insert(users).values({
        id: crypto.randomUUID(),
        email,
        password: hashedPassword,
        name: fullName,
        full_name: fullName,
        username,
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date(),
        emailVerified: new Date(), // Now allowed
        subscriptionTier: 'free',
        subscriptionStatus: 'active',
        onboardingCompleted: true,
        isVerified: true,
      });
      
      console.log('Admin user created successfully.');
    }
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
  process.exit(0);
}

createAdminUser();
