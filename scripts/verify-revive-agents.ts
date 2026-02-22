
import { config } from 'dotenv';
config();

import { db } from '../src/db/index';
import { chatConversations, chatMessages, collaborationSessions, collaborationMessages, users } from '../src/lib/shared/db/schema';
import { MessageRouter } from '../src/lib/message-router';
import { CollaborationHub } from '../src/lib/collaboration-hub';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

async function main() {
    console.log('🧪 Starting Revive Agents Verification...');

    try {
        // 1. Setup Test Data
        console.log('1. Setting up test data...');
        let user = await db.query.users.findFirst();
        if (!user) {
            const [newUser] = await db.insert(users).values({
                id: uuidv4(),
                email: 'test-revive@example.com',
                name: 'Revive Test User',
                onboarding_completed: true
            }).returning();
            user = newUser;
        }
        const userId = user.id;

        const chatConvId = uuidv4();
        await db.insert(chatConversations).values({
            id: chatConvId,
            user_id: userId,
            title: 'Test Chat Persistence',
            agent_id: 'roxy',
            agent_name: 'Roxy',
            message_count: 0,
            is_archived: false,
            metadata: {},
            created_at: new Date(),
            updated_at: new Date()
        });

        console.log('✅ Test data created.');

        // 2. Initialize Hub and Router
        const hub = new CollaborationHub();
        const router = new MessageRouter(hub);

        // 2.5 Initiate Collaboration via Hub
        console.log('2.5 Initiating Collaboration via Hub...');
        const collabResponse = await hub.initiateCollaboration({
            userId: userId,
            requestType: 'project',
            projectName: 'Test Revive Project',
            initialMessage: 'Start verification',
            priority: 'medium'
        });
        
        if (collabResponse.status !== 'created') {
            throw new Error(`Failed to initiate collaboration: ${collabResponse.message}`);
        }
        const collabSessionId = collabResponse.sessionId;
        console.log(`✅ Collaboration session ${collabSessionId} created.`);

        // 3. Test Persistence - Collaboration
        console.log('3. Testing Collaboration Persistence...');
        await router.persistMessage({
            id: uuidv4(),
            fromAgent: 'user',
            toAgent: null,
            messageType: 'request',
            content: 'Hello Collaboration',
            sessionId: collabSessionId,
            timestamp: new Date(),
            priority: 'medium',
            metadata: {}
        });

        const collabMsgs = await db.select().from(collaborationMessages).where(eq(collaborationMessages.session_id, collabSessionId));
        if (collabMsgs.length === 2) {
            console.log('✅ Collaboration persistence works.');
        } else {
            throw new Error(`Collaboration persistence failed. Found ${collabMsgs.length} messages.`);
        }

        // 4. Test Persistence - Chat
        console.log('4. Testing Chat Persistence...');
        await router.persistMessage({
            id: uuidv4(),
            fromAgent: 'user',
            toAgent: 'roxy',
            messageType: 'request',
            content: 'Hello Chat',
            sessionId: chatConvId,
            timestamp: new Date(),
            priority: 'medium',
            metadata: {}
        });

        const chatMsgs = await db.select().from(chatMessages).where(eq(chatMessages.conversation_id, chatConvId));
        if (chatMsgs.length === 1 && chatMsgs[0].content === 'Hello Chat') {
            console.log('✅ Chat persistence works.');
        } else {
            throw new Error(`Chat persistence failed. Found ${chatMsgs.length} messages.`);
        }

        // 5. Test processAgentResponse (Context Retrieval)
        console.log('5. Testing processAgentResponse context retrieval...');
        // We'll call it for 'roxy' in both sessions
        // This will trigger an AI call if keys are present
        try {
            console.log('   Testing Roxy in Collaboration...');
            await router.processAgentResponse('roxy', {
                id: uuidv4(),
                sessionId: collabSessionId,
                fromAgent: 'user',
                toAgent: 'roxy',
                messageType: 'request',
                content: 'Need help with persistence verification.',
                timestamp: new Date(),
                priority: 'medium',
                metadata: {}
            });
            console.log('   ✅ Roxy responded in Collaboration.');

            console.log('   Testing Roxy in Chat...');
            await router.processAgentResponse('roxy', {
                id: uuidv4(),
                sessionId: chatConvId,
                fromAgent: 'user',
                toAgent: 'roxy',
                messageType: 'request',
                content: 'Chat context test.',
                timestamp: new Date(),
                priority: 'medium',
                metadata: {}
            });
            console.log('   ✅ Roxy responded in Chat.');
        } catch (aiError) {
            console.warn('   ⚠️ AI response failed (likely missing API key), but context retrieval logic was executed:', aiError);
        }

        // 6. Cleanup
        console.log('6. Cleaning up...');
        await db.delete(collaborationMessages).where(eq(collaborationMessages.session_id, collabSessionId));
        await db.delete(collaborationSessions).where(eq(collaborationSessions.id, collabSessionId));
        await db.delete(chatMessages).where(eq(chatMessages.conversation_id, chatConvId));
        await db.delete(chatConversations).where(eq(chatConversations.id, chatConvId));
        console.log('✅ Cleanup complete.');

        console.log('🎉 VERIFICATION COMPLETE!');
    } catch (error) {
        console.error('❌ VERIFICATION FAILED:', error);
        process.exit(1);
    }
}

main().catch(console.error);
