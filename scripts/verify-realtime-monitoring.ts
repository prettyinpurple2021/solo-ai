
import * as dotenv from 'dotenv';
import path from 'path';

// Load env from root
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local'), override: true });

import { db } from "@/db";
import { users, workflows, workflowExecutions } from "@/db/schema";
import { sql, eq } from "drizzle-orm";
import { WorkflowEngine } from "@/src/lib/workflow-engine";

async function main() {
    console.log("Starting Real-time Monitoring Verification...");
    
    // Check DB
    if (!process.env.DATABASE_URL) {
        console.error("Missing DATABASE_URL");
        process.exit(1);
    }
    
    try {
        // 1. Get User
        const user = await db.query.users.findFirst();
        if (!user) throw new Error("No user found");
        console.log(`User: ${user.id}`);

        // 2. Create Test Workflow
        const engine = new WorkflowEngine();
        console.log("Creating test workflow...");
        const workflow = await engine.createWorkflow({
            name: "Test - Verification Script",
            // userId is passed as second argument below
            triggerType: "manual",
            description: "Temporary workflow for verification",
            nodes: [
                {
                    id: "trigger-1",
                    type: "manual_trigger",
                    position: { x: 100, y: 100 },
                    data: {},
                    config: { name: "Start" }
                },
                {
                    id: "ai-task-1",
                    type: "ai_task",
                    position: { x: 300, y: 100 },
                    data: {},
                    config: { 
                        name: "AI Test",
                        agentId: "lexi",
                        prompt: "Say 'AI Test Successful'",
                        model: "gpt-4"
                    }
                },
                {
                    id: "delay-1",
                    type: "delay",
                    position: { x: 500, y: 100 },
                    data: {},
                    config: { duration: 1000 }
                }
            ],
            edges: [
                {
                    id: "edge-1",
                    source: "trigger-1",
                    target: "ai-task-1",
                    animated: true
                },
                {
                    id: "edge-2",
                    source: "ai-task-1",
                    target: "delay-1",
                    animated: true
                }
            ]
        }, user.id);
        console.log(`Workflow created: ${workflow.id}`);

        // 3. Execute
        console.log("Executing workflow...");
        const execution = await engine.executeWorkflow(workflow.id, { test: true }, user.id);
        console.log(`Execution started: ${execution.id}`);

        // 4. Wait for it to progress (it has a 1s delay)
        console.log("Waiting for execution to complete...");
        await new Promise(r => setTimeout(r, 2000));

        // 5. Verify Logs/Steps
        const dbExecution = await db.query.workflowExecutions.findFirst({
            where: eq(workflowExecutions.id, Number(execution.id))
        });
        
        if (!dbExecution) throw new Error("Execution not found in DB");
        
        const logs = dbExecution.logs as any[] || [];
        console.log(`Logs found: ${logs.length}`);
        
        // Simple verification: do we have logs for all nodes?
        const hasTriggerLog = logs.some(l => l.metadata?.nodeId === 'trigger-1');
        const hasAiLog = logs.some(l => l.metadata?.nodeId === 'ai-task-1');
        const hasDelayLog = logs.some(l => l.metadata?.nodeId === 'delay-1');
        
        if (hasTriggerLog && hasAiLog && hasDelayLog) {
            console.log("✅ Verification Success: Logs present for all nodes, including AI Task.");
            const aiLog = logs.find(l => l.metadata?.nodeId === 'ai-task-1' && l.metadata?.status === 'completed');
            if (aiLog) {
                console.log("AI Output:", aiLog.metadata.result);
            }
        } else {
            console.error("❌ Verification Failed: Missing logs.");
            console.log("Trigger:", hasTriggerLog, "AI:", hasAiLog, "Delay:", hasDelayLog);
            console.log(JSON.stringify(logs, null, 2));
            throw new Error("Missing logs");
        }

        // 6. Cleanup
        console.log("Cleaning up...");
        await db.delete(workflows).where(eq(workflows.id, workflow.id));
        // Execution defaults to cascade delete usually, or we leave it.
        console.log("Done.");

    } catch (e) {
        console.error("Verification Failed:", e);
        process.exit(1);
    }
}

main();
