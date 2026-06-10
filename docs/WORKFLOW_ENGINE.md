# Workflow Engine

## Overview

SoloSuccess AI's **Workflow Engine** is a visual workflow automation system that enables solopreneurs to automate complex business processes without coding. Users can build workflows using a visual node-based interface, then trigger them manually, via schedule, or by webhook.

The engine supports multiple node types (AI tasks, email, conditions, delays), parallel execution, conditional branching, and error handling with retry logic.

**Key Components**:
- `src/lib/workflow-engine.ts` — Core workflow execution engine
- `src/lib/services/workflow-service.ts` — Service layer for workflow management
- `src/lib/temporal-workflow-store.ts` — Temporal workflow integration
- `src/components/workflow/visual-workflow-builder.tsx` — Visual editor UI
- `src/app/api/workflows/*` — REST API endpoints
- `src/app/dashboard/workflow` — Dashboard pages
- `src/db/schema/workflow.ts` — Database schema

---

## 1. Architecture

### Execution Model

```
Trigger
  ├─ Manual (User clicks "Run")
  ├─ Scheduled (Cron: "Every Monday at 9 AM")
  ├─ Webhook (HTTP POST to /api/workflows/{id}/trigger)
  └─ Event (Competitor alert, billing event, etc.)
      ↓
  Workflow Engine
      ├─ Parse nodes and edges
      ├─ Build execution graph
      ├─ Resolve variables/context
      └─ Execute in DAG order (or parallel if allowed)
          ↓
  Node Execution
      ├─ Condition node: Evaluate expression
      ├─ AI task node: Call AI API
      ├─ Email node: Send email
      ├─ Delay node: Wait
      ├─ Transform node: Modify data
      └─ Webhook node: Call external API
          ↓
  Execution Log
      ├─ Record step status (pending → running → completed/failed)
      ├─ Store outputs
      ├─ Track timing
      └─ Store in workflowExecutions table
          ↓
  Result
      ├─ Success: All steps completed
      ├─ Failure: Step failed, error handling kicks in
      └─ Partial: Some steps completed before error
```

### Workflow Structure

Every workflow is a **directed acyclic graph (DAG)** with:

```typescript
{
  id: "workflow-123",
  name: "Weekly Competitor Report",
  status: "active",
  triggerType: "scheduled",
  triggerConfig: {
    schedule: "0 9 * * 1"  // Every Monday at 9 AM
  },
  nodes: [
    // Trigger node (always first)
    {
      id: "node-1",
      type: "scheduled_trigger",
      name: "Monday Trigger",
      config: { schedule: "0 9 * * 1" }
    },
    // Condition node
    {
      id: "node-2",
      type: "condition",
      name: "Check if competitors tracked",
      config: {
        expression: "variables.competitors.length > 0"
      }
    },
    // AI task node
    {
      id: "node-3",
      type: "ai_task",
      name: "Generate Report",
      config: {
        prompt: "Analyze competitors and create a report",
        model: "gpt-4"
      }
    },
    // Email node
    {
      id: "node-4",
      type: "send_email",
      name: "Send Report",
      config: {
        to: "user@example.com",
        subject: "Weekly Competitor Report",
        bodyTemplate: "Here's your report: {report_output}"
      }
    }
  ],
  edges: [
    { source: "node-1", target: "node-2" },
    { source: "node-2", target: "node-3", condition: "passed" },
    { source: "node-3", target: "node-4" }
  ],
  variables: {
    competitors: [],
    report: ""
  },
  settings: {
    timeout: 300000,           // 5 minutes
    retryAttempts: 3,
    retryDelay: 5000,
    parallelExecution: true,
    errorHandling: "stop"      // "stop" | "continue" | "rollback"
  }
}
```

---

## 2. Node Types

### Trigger Nodes

**Manual Trigger**: User clicks "Run" button

```typescript
{
  type: "manual_trigger",
  name: "Start",
  config: {}
}
```

**Scheduled Trigger**: Run on a schedule (cron)

```typescript
{
  type: "scheduled_trigger",
  name: "Daily at 9 AM",
  config: {
    schedule: "0 9 * * *"  // Cron expression
  }
}
```

**Webhook Trigger**: Receive HTTP POST

```typescript
{
  type: "webhook_trigger",
  name: "Receive Data",
  config: {
    path: "/workflows/competitor-alert",
    method: "POST",
    auth: "apiKey"  // Optional authentication
  }
}
```

### Action Nodes

**AI Task**: Call AI model (OpenAI, Claude, Gemini)

```typescript
{
  type: "ai_task",
  name: "Generate Content",
  config: {
    model: "gpt-4",
    prompt: "Analyze this: {input_data}",
    temperature: 0.7,
    maxTokens: 1000,
    systemPrompt: "You are a business analyst"
  }
}
```

**Send Email**: Send transactional email

```typescript
{
  type: "send_email",
  name: "Send Report",
  config: {
    to: "{user.email}",  // Variable interpolation
    subject: "Your Weekly Report",
    bodyTemplate: "Here's your data: {previous_node_output}",
    bodyHTML: "<h1>Report</h1><p>{report}</p>"
  }
}
```

**Webhook**: Call external API

```typescript
{
  type: "webhook",
  name: "Call Slack",
  config: {
    url: "https://hooks.slack.com/services/...",
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: {
      text: "Workflow {workflow.name} completed: {status}",
      blocks: []  // Slack Block Kit
    }
  }
}
```

**Transform Data**: Modify/compute data

```typescript
{
  type: "transform_data",
  name: "Format Report",
  config: {
    expression: "inputs.data.map(x => ({ ...x, formatted: x.value * 100 }))",
    language: "javascript"
  }
}
```

### Control Flow Nodes

**Condition**: Branch based on expression

```typescript
{
  type: "condition",
  name: "Check threshold",
  config: {
    expression: "inputs.value > 100"  // Must evaluate to boolean
  }
}
// Edges: true branch goes to one node, false to another
```

**Delay**: Wait before proceeding

```typescript
{
  type: "delay",
  name: "Wait 5 minutes",
  config: {
    duration: 300000,  // milliseconds
    unit: "ms"  // or "s", "m", "h"
  }
}
```

---

## 3. Execution Model

### Sequential Execution (Default)

```
node-1 → node-2 → node-3 → node-4
Each waits for the previous to complete
Total time: time(1) + time(2) + time(3) + time(4)
```

### Parallel Execution

```
        ↙ node-2 ↘
node-1 → node-3 ← node-4
        ↖ parallel ↗
Total time: time(1) + max(time(2), time(3), time(4))
Faster, but requires independent nodes
```

**Enable in settings**:

```typescript
settings: {
  parallelExecution: true
}
```

### Variable Interpolation

Variables are available throughout the workflow:

```typescript
// Global variables (set in workflow.variables)
{
  variables: {
    user_email: "alice@example.com",
    report_type: "weekly"
  }
}

// In node config, reference as {variable_name}
{
  type: "send_email",
  config: {
    to: "{user_email}",
    subject: "Your {report_type} report"
  }
}

// In expressions, reference as variables.name
{
  type: "condition",
  config: {
    expression: "variables.user_email.includes('@')"
  }
}

// Node outputs become available
{
  type: "ai_task",
  name: "gen_report"  // Sets outputs.gen_report = result
}

// Reference node outputs
{
  type: "send_email",
  config: {
    bodyTemplate: "Report: {outputs.gen_report}"
  }
}
```

### Error Handling

**Mode: "stop"** (default) — Stop execution on first failure

```
node-1 → node-2 (fails) → [STOP]
         (node-3, node-4 never run)
```

**Mode: "continue"** — Continue despite failures

```
node-1 → node-2 (fails) → node-3 → node-4
         (logs error but continues)
```

**Mode: "rollback"** — Undo changes on failure

```
node-1 ✓ → node-2 (fails) → [ROLLBACK]
         (undo changes from node-1)
```

---

## 4. Database Schema

### Workflows Table

```sql
CREATE TABLE workflows (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status TEXT CHECK (status IN ('draft', 'active', 'paused', 'archived')),
  trigger_type TEXT CHECK (trigger_type IN ('manual', 'scheduled', 'webhook', 'event')),
  trigger_config JSONB,
  nodes JSONB NOT NULL,         -- Array of WorkflowNode
  edges JSONB NOT NULL,          -- Array of WorkflowEdge
  variables JSONB DEFAULT '{}',
  settings JSONB,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### Workflow Executions Table

```sql
CREATE TABLE workflow_executions (
  id UUID PRIMARY KEY,
  workflow_id UUID NOT NULL,
  user_id UUID NOT NULL,
  status TEXT CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  trigger_type TEXT,
  context JSONB,                -- Trigger context
  inputs JSONB,
  outputs JSONB,
  steps JSONB,                  -- Array of WorkflowExecutionStep
  logs JSONB,                   -- Array of WorkflowExecutionLog
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  duration BIGINT,              -- milliseconds
  error_message TEXT,
  created_at TIMESTAMP,
  FOREIGN KEY (workflow_id) REFERENCES workflows(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

---

## 5. REST API

### Create Workflow

```
POST /api/workflows
Content-Type: application/json

{
  "name": "Weekly Report",
  "description": "Generate and send competitor report weekly",
  "triggerType": "scheduled",
  "triggerConfig": {
    "schedule": "0 9 * * 1"
  },
  "nodes": [
    { type: "scheduled_trigger", ... },
    { type: "ai_task", ... },
    { type: "send_email", ... }
  ],
  "edges": [
    { source: "node-1", target: "node-2" }
  ]
}

Response:
{
  "id": "wf-123",
  "name": "Weekly Report",
  "status": "draft",
  "createdAt": "2026-06-10T13:00:00Z"
}
```

### Get Workflow

```
GET /api/workflows/{id}

Response:
{
  "id": "wf-123",
  "name": "Weekly Report",
  "status": "active",
  "nodes": [...],
  "edges": [...],
  "createdAt": "2026-06-10T13:00:00Z"
}
```

### List Workflows

```
GET /api/workflows?status=active&limit=10&offset=0

Response:
{
  "workflows": [
    { "id": "wf-123", "name": "...", "status": "active" },
    { "id": "wf-124", "name": "...", "status": "draft" }
  ],
  "total": 25,
  "limit": 10
}
```

### Update Workflow

```
PUT /api/workflows/{id}

{
  "name": "Updated name",
  "nodes": [...],
  "edges": [...]
}

Response: Updated workflow
```

### Delete Workflow

```
DELETE /api/workflows/{id}

Response: 204 No Content
```

### Trigger Workflow (Manual)

```
POST /api/workflows/{id}/trigger

{
  "inputs": {
    "recipient": "user@example.com"
  }
}

Response:
{
  "executionId": "exec-456",
  "status": "pending",
  "startedAt": "2026-06-10T13:05:00Z"
}
```

### Webhook Trigger

```
POST /api/workflows/trigger?token={webhook_token}

{
  "data": { ... }
}

Response: Workflow triggered
```

### Get Execution

```
GET /api/workflows/{id}/executions/{executionId}

Response:
{
  "id": "exec-456",
  "status": "completed",
  "startedAt": "2026-06-10T13:05:00Z",
  "completedAt": "2026-06-10T13:08:30Z",
  "duration": 210000,
  "steps": [
    {
      "id": "step-1",
      "name": "Generate Report",
      "status": "completed",
      "output": "Report content..."
    }
  ],
  "logs": [
    { "level": "info", "message": "Step completed", "timestamp": "..." }
  ]
}
```

### List Executions

```
GET /api/workflows/{id}/executions?limit=20&status=completed

Response:
{
  "executions": [
    { "id": "exec-456", "status": "completed", "duration": 210000 },
    { "id": "exec-455", "status": "completed", "duration": 195000 }
  ],
  "total": 156
}
```

---

## 6. Implementation Guide

### Using the Workflow Engine

```typescript
import { WorkflowEngine } from '@/lib/workflow-engine'
import { db } from '@/db'

// Create engine instance
const engine = new WorkflowEngine({
  db,
  logger: console
})

// Get workflow
const workflow = await db.query.workflows.findFirst({
  where: (w) => w.id === 'wf-123'
})

// Execute workflow
const execution = await engine.execute(workflow, {
  triggerType: 'manual',
  inputs: { recipient: 'user@example.com' }
})

console.log(execution.status)    // 'completed' or 'failed'
console.log(execution.logs)      // Array of execution logs
console.log(execution.outputs)   // Final outputs
```

### Creating a Custom Node Type

```typescript
// 1. Add to node type enum
export const WorkflowNodeSchema = z.object({
  type: z.enum([
    ...,
    'custom_api_call'  // New node type
  ]),
  ...
})

// 2. Implement executor
import { WorkflowNodeExecutor } from '@/lib/workflow-engine'

const customApiExecutor: WorkflowNodeExecutor = async (node, context) => {
  const { url, method } = node.config
  const response = await fetch(url, {
    method: method || 'GET',
    headers: { 'Content-Type': 'application/json' }
  })
  return {
    status: 'completed',
    output: await response.json()
  }
}

// 3. Register executor
engine.registerNodeExecutor('custom_api_call', customApiExecutor)
```

### Handling Execution Events

```typescript
// Subscribe to execution events
engine.on('step:start', (step) => {
  console.log(`Starting: ${step.name}`)
})

engine.on('step:complete', (step) => {
  console.log(`Completed: ${step.name}`)
})

engine.on('step:error', (step, error) => {
  console.error(`Failed: ${step.name}`, error)
})

engine.on('workflow:complete', (execution) => {
  console.log(`Workflow completed with status: ${execution.status}`)
})
```

---

## 7. Visual Builder Integration

### Using the Visual Workflow Builder

The visual builder is a React component that enables drag-and-drop workflow creation:

```tsx
import { VisualWorkflowBuilder } from '@/components/workflow/visual-workflow-builder'

export function WorkflowEditor() {
  const [workflow, setWorkflow] = useState(null)
  const [executing, setExecuting] = useState(false)

  const handleSave = async (newWorkflow) => {
    const response = await fetch('/api/workflows', {
      method: 'POST',
      body: JSON.stringify(newWorkflow)
    })
    const saved = await response.json()
    setWorkflow(saved)
  }

  const handleExecute = async () => {
    setExecuting(true)
    const response = await fetch(`/api/workflows/${workflow.id}/trigger`, {
      method: 'POST'
    })
    const execution = await response.json()
    setExecuting(false)
    // Show execution status
  }

  return (
    <VisualWorkflowBuilder
      workflow={workflow}
      onSave={handleSave}
      onExecute={handleExecute}
      readonly={false}
    />
  )
}
```

### Components

| Component | Purpose |
|-----------|---------|
| `visual-workflow-builder.tsx` | Main drag-and-drop editor |
| `workflow-dashboard.tsx` | Overview and execution history |
| `workflow-templates.tsx` | Pre-built templates |
| `workflow-execution-monitor.tsx` | Real-time execution view |

---

## 8. Troubleshooting

### Issue: Workflow Stuck in "Running" Status

**Diagnosis**:
```typescript
// Check execution logs
const execution = await db.query.workflowExecutions.findFirst({
  where: (we) => we.id === 'exec-456'
})
console.log(execution.logs)  // Look for hung step

// Check database for active executions
const hanging = await db.query.workflowExecutions.findMany({
  where: (we) => we.status === 'running'
})
```

**Fix**:
```typescript
// Manually mark as failed
await db.update(workflowExecutions)
  .set({
    status: 'failed',
    error_message: 'Timeout after 5 minutes',
    completed_at: new Date()
  })
  .where(eq(workflowExecutions.id, 'exec-456'))
```

### Issue: Scheduled Trigger Not Running

**Diagnosis**:
```bash
# Check if workflow is active
SELECT * FROM workflows WHERE id = 'wf-123' AND status = 'active'

# Check scheduled jobs (backend log)
vercel logs --follow | grep -i "scheduled trigger"

# Check cron expression
# Use: https://crontab.guru to validate
```

**Fix**:
```typescript
// Activate workflow
await db.update(workflows)
  .set({ status: 'active' })
  .where(eq(workflows.id, 'wf-123'))

// Validate cron and update if needed
// "0 9 * * 1" = Every Monday at 9 AM UTC
```

### Issue: AI Task Node Returns Null Output

**Diagnosis**:
```typescript
const execution = await db.query.workflowExecutions.findFirst({
  where: (we) => we.id === 'exec-456'
})
const aiStep = execution.steps.find(s => s.name === 'Generate Report')
console.log(aiStep.error)  // Check error message
console.log(aiStep.input)  // Verify prompt was formatted correctly
```

**Causes**:
- ❌ AI model not configured (missing API key)
- ❌ Prompt has unresolved variables
- ❌ AI model rate limited
- ❌ Network timeout

**Fixes**:
```typescript
// 1. Check AI credentials
process.env.OPENAI_API_KEY  // Must be set

// 2. Verify variable interpolation
// In node config, ensure variables exist:
{
  config: {
    prompt: "Analyze {variable_name}"  // {variable_name} must be defined
  }
}

// 3. Increase timeout for slow models
{
  settings: {
    timeout: 600000  // 10 minutes instead of 5
  }
}

// 4. Check rate limits
console.log(execution.logs)  // Look for 429 errors
```

### Issue: Condition Node Evaluation Error

```
Error: expression evaluation failed
```

**Diagnosis**:
```typescript
// Check condition expression
const node = workflow.nodes.find(n => n.type === 'condition')
console.log(node.config.expression)  // e.g., "variables.count > 10"
```

**Common Issues**:
- ❌ Syntax error: `variables.count >` (missing right side)
- ❌ Undefined variable: `{undefined_var} > 10`
- ❌ Wrong type: `"string" > 10` (comparing string to number)

**Fix**:
```typescript
// Valid expressions
"variables.count > 10"
"variables.name.includes('test')"
"outputs.generated_text.length > 100"
"variables.items.some(x => x.status === 'active')"
```

---

## 9. Best Practices

### 1. Use Variables for Configuration

```typescript
// ❌ Hardcoded values
{
  type: "send_email",
  config: {
    to: "alice@example.com",
    subject: "Report for Alice"
  }
}

// ✅ Use variables for reusability
// In workflow.variables: { user_email: "alice@example.com", user_name: "Alice" }
{
  type: "send_email",
  config: {
    to: "{user_email}",
    subject: "Report for {user_name}"
  }
}
```

### 2. Limit Timeout Based on Longest Step

```typescript
// ✅ If slowest step is 2 min AI task, set timeout to 3-5 min
{
  settings: {
    timeout: 300000  // 5 minutes
  }
}

// ❌ Too short timeout causes failures
{
  settings: {
    timeout: 10000   // 10 seconds — AI will fail!
  }
}
```

### 3. Use Conditions to Guard Expensive Operations

```typescript
// ✅ Check condition before expensive AI task
edges: [
  { source: "check_data", target: "process_if_has_data", condition: "passed" },
  { source: "process_if_has_data", target: "ai_task" }
]

// ❌ Always run AI task (wasteful)
edges: [
  { source: "trigger", target: "ai_task" }
]
```

### 4. Log Important State Changes

```typescript
// ✅ Add transform node to log key data
{
  type: "transform_data",
  name: "Log Results",
  config: {
    expression: "(console.log('Rows processed:', inputs.count), inputs)"
  }
}

// Then check logs in execution UI
```

### 5. Test with Manual Trigger First

```typescript
// Workflow creation flow:
// 1. Build workflow (visual builder)
// 2. Save as draft
// 3. Trigger manually to test
// 4. Check execution logs
// 5. Refine based on errors
// 6. Activate scheduled trigger
```

### 6. Use Error Handling Appropriately

```typescript
// ✅ "stop" for critical flows (payment, auth)
{
  settings: {
    errorHandling: "stop"  // Stop on first error
  }
}

// ✅ "continue" for analytics/reporting (error in one competitor shouldn't skip others)
{
  settings: {
    errorHandling: "continue"  // Log errors but keep going
  }
}

// ⚠️ "rollback" only when you have transaction support
{
  settings: {
    errorHandling: "rollback"  // Undo changes on failure
  }
}
```

---

## 10. Performance & Scaling

| Scenario | Recommendation |
|----------|-----------------|
| Simple workflows (3-5 nodes) | No optimization needed |
| Complex workflows (10+ nodes) | Use `parallelExecution: true` |
| Frequent executions (100s/day) | Queue executions async |
| Long-running (5+ min) | Increase timeout, use job queue |
| Timeout issues | Move slow tasks to separate workflow |

### Query Optimization

```typescript
// ✅ Fetch minimal data needed
const workflow = await db.query.workflows.findFirst({
  where: (w) => w.id === 'wf-123',
  columns: { id: true, name: true, nodes: true, edges: true }
})

// ❌ Fetch entire workflow with all metadata
const workflow = await db.query.workflows.findFirst({
  where: (w) => w.id === 'wf-123'
})
```

---

## 11. Related Documentation

- [Workflow Templates API](../src/app/api/workflow-templates) — Pre-built templates
- [Workflow Dashboard](../src/app/dashboard/workflow) — UI for managing workflows
- [Temporal Integration](temporal-workflow-store.ts) — Long-running workflow support
- [AI Task Integration](../AGENT_PERSONALITY_SYSTEM.md) — AI task nodes and agents
