
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

// Load environment variables manually
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const envPath = path.resolve(__dirname, '../.env.local')

if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf8')
  envConfig.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/)
    if (match) {
      const key = match[1].trim()
      const value = match[2].trim().replace(/^["']|["']$/g, '')
      process.env[key] = value
    }
  })
}

import { WorkflowEngine } from "../src/lib/workflow-engine"

import { db } from "../src/db"
import { workflows, users } from "../src/db/schema"
import { eq } from "drizzle-orm"

async function main() {
  console.log("Starting WorkflowEngine verification...")

  const engine = new WorkflowEngine()
  const TEST_USER_ID = "test-user-verification-" + Date.now()

  // 0. Create a dummy user
  console.log("Creating test user...")
  await db.insert(users).values({
      id: TEST_USER_ID,
      email: `test-${Date.now()}@example.com`,
      name: "Verification User",
      role: "user",
      created_at: new Date(),
      updated_at: new Date()
  })

  try {

      // 1. Create a dummy workflow with an ai_task (mocked agent)
      console.log("Creating workflow...")
      const workflow = await engine.createWorkflow({
        name: "Verification Workflow",
        description: "Testing userId and ai_task",
        version: "1.0.0",
        status: 'active',
        triggerType: 'manual',
        triggerConfig: {},
        nodes: [
          {
            id: "trigger_1",
            type: "manual_trigger",
            name: "Manual Trigger",
            position: { x: 0, y: 0 },
            config: {
                type: "manual",
            },
            status: "pending",
            inputs: [],
            outputs: [],
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            id: "node_1",
            type: "ai_task",
            name: "AI Task",
            position: { x: 200, y: 0 },
            config: {
                task: "custom",
                agentId: "mock-agent", 
                prompt: "Say hello",
                model: "mock"
            },
            status: "pending",
            inputs: [],
            outputs: [],
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ],
        edges: [
            {
                id: "edge_1",
                source: "trigger_1",
                target: "node_1",
                animated: true
            }
        ],
        variables: {},
        settings: {
            timeout: 5000,
            retryAttempts: 0,
            retryDelay: 0,
            parallelExecution: false,
            errorHandling: 'stop'
        }
      }, TEST_USER_ID)
    
      console.log(`Workflow created with ID: ${workflow.id}`)
    
      // 2. Execute the workflow
      console.log("Executing workflow...")
      try {
          const execution = await engine.executeWorkflow(String(workflow.id), {}, TEST_USER_ID)
          console.log(`Execution started with ID: ${execution.id}`)
          console.log(`Execution execution status: ${execution.status}`) // might contain error if agent fails, which is expected
          
          if (execution.startedBy !== TEST_USER_ID && execution.metadata?.executedBy !== TEST_USER_ID) {
              console.error(`FAILED: startedBy (${execution.startedBy}) does not match TEST_USER_ID (${TEST_USER_ID})`)
          } else {
              console.log("SUCCESS: startedBy matches TEST_USER_ID")
          }
    
      } catch (error) {
          console.error("Execution failed:", error)
      }
    
      // Cleanup Workflow
      console.log("Cleaning up workflow...")
      await db.delete(workflows).where(eq(workflows.id, Number(workflow.id)))
      
  } finally {
      // Cleanup User
      console.log("Cleaning up user...")
      await db.delete(users).where(eq(users.id, TEST_USER_ID))
  }
  
  console.log("Done.")
}

main().catch(console.error)
