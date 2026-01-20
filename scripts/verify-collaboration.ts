
import { config } from 'dotenv';
config(); // Load env vars

import { db } from '@/db';
import { collaborationSessions, collaborationParticipants, collaborationMessages, users } from '@/db/schema';
import { SessionManager } from '@/lib/session-manager';
import { CollaborationHub } from '@/lib/collaboration-hub';
import { MessageRouter } from '@/lib/message-router';
import { eq } from 'drizzle-orm';

async function main() {
  console.log('🧪 Starting Collaboration System Verification...');

  try {
    // 1. Initialize Components
    console.log('1. Initializing components...');
    const hub = new CollaborationHub();
    const router = new MessageRouter(hub);
    const sessionManager = new SessionManager(hub, router);
    console.log('✅ Components initialized.');

    // 2. Get User & Create Session
    console.log('2. Getting user & creating session...');
    
    let user = await db.query.users.findFirst();
    if (!user) {
        console.log('   No user found, creating test user...');
        const result = await db.insert(users).values({
            email: 'verify-test-user@example.com',
            name: 'Verification User',
            onboarding_completed: true
        }).returning();
        user = result[0];
    }
    const userId = user.id;
    console.log(`   Using User ID: ${userId}`);

    const session = await sessionManager.createSession({
      userId,
      goal: 'Verify persistence system works',
      requiredAgents: ['roxy'],
      configuration: {
        maxParticipants: 5
      }
    });

    if (!session || !session.id) {
      throw new Error('Failed to return valid session object');
    }
    console.log(`✅ Session created with ID: ${session.id}`);

    // 3. Verify Session Persistence
    console.log('3. Verifying persistence in DB...');
    const dbSession = await db.query.collaborationSessions.findFirst({
      where: eq(collaborationSessions.id, session.id)
    });

    if (!dbSession) {
      throw new Error('Session not found in database!');
    }
    
    if (dbSession.goal !== 'Verify persistence system works') {
      throw new Error(`Session goal mismatch: ${dbSession.goal}`);
    }
    console.log('✅ Session persistence verified.');

    // 4. Verify Participants
    console.log('4. Verifying participants...');
    let participants = await db.query.collaborationParticipants.findMany({
      where: eq(collaborationParticipants.session_id, session.id)
    });

    console.log(`   Found ${participants.length} participants.`);
    if (participants.length === 0) throw new Error('No participants found');

    // 4b. Test Dynamic Join
    console.log('4b. Testing dynamic join (Agent: echo)...');
    const joined = await sessionManager.joinSession(session.id, 'echo');
    if (!joined) console.warn('⚠️ Failed to join "echo" (might be busy or missing)');
    else console.log('✅ Agent "echo" joined.');

    // 4c. Verify Messages (System Message from Join)
    console.log('4c. Verifying system messages...');
    const messages = await db.query.collaborationMessages.findMany({
        where: eq(collaborationMessages.session_id, session.id)
    });
    console.log(`   Found ${messages.length} messages.`);
    if (joined && messages.length === 0) throw new Error('Message persistence failed (Join message missing)');
    else if (messages.length > 0) console.log('✅ Messages persisted.');
    
    // 5. Test State Retrieval
    console.log('5. Testing getSessionStateAsync...');
    const state = await sessionManager.getSessionStateAsync(session.id);
    if (!state) {
        throw new Error('Failed to retrieve session state');
    }
    console.log('✅ Session state retrieved.');

    // 6. Cleanup
    console.log('6. Cleaning up...');
    await db.delete(collaborationParticipants).where(eq(collaborationParticipants.session_id, session.id));
    await db.delete(collaborationMessages).where(eq(collaborationMessages.session_id, session.id));
    await db.delete(collaborationSessions).where(eq(collaborationSessions.id, session.id));
    console.log('✅ Cleanup complete.');

    console.log('🎉 VERIFICATION SUCCESSFUL!');
    process.exit(0);

  } catch (error) {
    console.error('❌ VERIFICATION FAILED:', error);
    process.exit(1);
  }
}

main();
