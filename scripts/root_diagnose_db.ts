import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { getDb } from '@/db/index';
import * as schema from '@/db/schema';
import { DrizzleAdapter } from "@auth/drizzle-adapter";

async function diagnose() {
  console.log('--- NextAuth Adapter Test ---');
  try {
    const adapter = DrizzleAdapter(getDb(), {
      usersTable: schema.users,
      accountsTable: schema.accounts,
      sessionsTable: schema.sessions,
      verificationTokensTable: schema.verificationTokens,
    });
    console.log('Adapter initialized successfully.');
    
    if (adapter.createUser) {
        console.log('Adapter has createUser method.');
    }
  } catch (e) {
    console.error('Failed to initialize NextAuth adapter:', e);
  }
}

diagnose().catch(console.error);
