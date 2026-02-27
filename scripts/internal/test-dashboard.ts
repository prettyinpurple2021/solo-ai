import { getDb } from '@/lib/database-client';
import { users } from '@/shared/db/schema';
import { getDashboardData } from '@/lib/services/dashboard-service';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function run() {
  const db = getDb();
  const allUsers = await db.select({ email: users.email }).from(users).limit(1);
  if (!allUsers.length) {
    console.log("No users found in database.");
    process.exit(0);
  }
  const email = allUsers[0].email;
  console.log(`Testing dashboard data for ${email}...`);
  try {
    const data = await getDashboardData(email!);
    console.log("Data fetched successfully.");
  } catch (err) {
    console.error("Error fetching dashboard data:", err);
  }
  process.exit(0);
}

run();
