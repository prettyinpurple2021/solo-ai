import { PersonalityEngine, UserContext } from '../src/lib/ai-personality-system'

// Mock User Context
const mockUserContext: UserContext = {
    id: "user_1",
    name: "Test User",
    preferences: {
        workStyle: "focused",
        communicationStyle: "direct",
        goals: ["Scale revenue", "Optimize code"],
        challenges: ["Time management"]
    },
    currentMood: "motivated",
    timeOfDay: "morning",
    recentActivity: ["Completed task", "Updated strategy"],
    achievements: ["Hit monthly target"]
}

const engine = new PersonalityEngine(mockUserContext)

async function testAgent(agentId: string) {
    console.log(`\n--- Testing ${agentId.toUpperCase()} ---`)
    console.log(`GREETING: ${engine.getGreeting(agentId)}`)
    console.log(`CELEBRATION: ${engine.getCelebration(agentId)}`)
    console.log(`QUOTE: ${engine.getMotivationalQuote(agentId)}`)
}

async function runTests() {
    const agents = ['roxy', 'blaze', 'echo', 'lumi', 'vex', 'lexi', 'nova', 'glitch', 'aura', 'finn']
    console.log('Starting Persona Verification...')
    for (const agent of agents) {
        await testAgent(agent)
    }
    console.log('\nVerification Complete.')
}

runTests().catch(console.error)
