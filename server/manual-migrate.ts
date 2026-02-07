
import { db } from './db';
import { sql } from 'drizzle-orm';

async function main() {
  console.log('Starting manual migration...');

  try {
    // Add role column if it doesn't exist
    await db.execute(sql`
      DO $$
      BEGIN
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'role') THEN
              ALTER TABLE "users" ADD COLUMN "role" text DEFAULT 'user';
              RAISE NOTICE 'Added role column';
          ELSE
              RAISE NOTICE 'role column already exists';
          END IF;
      END
      $$;
    `);

    // Add admin_pin_hash if it doesn't exist
    await db.execute(sql`
      DO $$
      BEGIN
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'admin_pin_hash') THEN
              ALTER TABLE "users" ADD COLUMN "admin_pin_hash" text;
              RAISE NOTICE 'Added admin_pin_hash column';
          ELSE
              RAISE NOTICE 'admin_pin_hash column already exists';
          END IF;
      END
      $$;
    `);

     // Add stack_user_id if it doesn't exist (it should, but safety first)
    await db.execute(sql`
      DO $$
      BEGIN
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'stack_user_id') THEN
              ALTER TABLE "users" ADD COLUMN "stack_user_id" text;
              RAISE NOTICE 'Added stack_user_id column';
          ELSE
              RAISE NOTICE 'stack_user_id column already exists';
          END IF;
      END
      $$;
    `);

    // Add suspended fields
     await db.execute(sql`
      DO $$
      BEGIN
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'suspended') THEN
              ALTER TABLE "users" ADD COLUMN "suspended" boolean DEFAULT false;
          END IF;
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'suspended_at') THEN
              ALTER TABLE "users" ADD COLUMN "suspended_at" timestamp;
          END IF;
           IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'suspended_reason') THEN
              ALTER TABLE "users" ADD COLUMN "suspended_reason" text;
          END IF;
      END
      $$;
    `);

    console.log('Manual migration completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

main();
