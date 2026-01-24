
import { CollaborationHub } from '../src/lib/collaboration-hub'

async function testAgentInteraction() {
    console.log('🚀 Starting Agent Interaction Test')

    // Initialize Hub
    const hub = new CollaborationHub()

    // Create a session
    console.log('Creating session...')
    const session = await hub.initiateCollaboration({
        userId: '1',
        requestType: 'project',
        projectName: 'Test Project Alpha',
        initialMessage: 'We need to create a marketing plan for a new AI coffee machine.',
        requiredAgents: ['roxy', 'echo', 'blaze']
    })

    if (session.status === 'error') {
        console.error('❌ Failed to create session:', session.message)
        return
    }

    console.log(`✅ Session created: ${session.sessionId}`)
    console.log(`👥 Participants: ${session.participants.map(p => p.displayName).join(', ')}`)

    // Wait for agents to process (Event-driven polling)
    console.log('⏳ Waiting for agent responses...')
    
    const maxWaitTime = 10000; // 10 seconds timeout
    const startTime = Date.now();

    // Monitor for completion
    while (Date.now() - startTime < maxWaitTime) {
        // Yield to event loop
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const currentSession = hub.getSession(session.sessionId);
        if (!currentSession) {
             console.error('❌ Session lost during polling');
             break;
        }

        const activeAgents = currentSession.participatingAgents.length;
        if (activeAgents > 0) {
             // Just logging activity to show it's alive
             // console.log(`Still active... (${Math.floor((Date.now() - startTime)/1000)}s)`);
        }
    }
    
    console.log('✅ Polling finished')

    const activeSession = hub.getSession(session.sessionId)
    if (activeSession) {
        console.log('✅ Session is active')
        console.log('Last Updated:', activeSession.updatedAt)
    } else {
        console.error('❌ Session not found')
    }

    console.log('🏁 Test Complete')
}

testAgentInteraction().catch(console.error)
