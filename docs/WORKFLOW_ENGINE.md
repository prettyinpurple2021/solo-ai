# Workflow Engine — Visual Automation System

## Overview

The **Workflow Engine** is a core system for building, executing, and monitoring automated workflows using a visual node-based builder. Users can create sequences of tasks (email, AI, conditions, delays) triggered manually, on schedule, or by webhooks.

**Key Files**:
- `src/lib/workflow-engine.ts` — Core execution engine
- `src/lib/shared/db/schema/workflow.ts` — Workflow-related DB schema
- `src/lib/shared/db/schema/index.ts` (imported as `@/shared/db/schema`) — Schema exports used by the app

---

## 1. Architecture

### Node Types

Every workflow is composed of nodes connected by edges. Each node performs one action:

```typescript
type NodeType =
  | 'manual_trigger'       // User clicks "Run Now"
  | 'scheduled_trigger'    // Cron: "Every Monday at 9 AM"
  | 'webhook_trigger'      // External API calls /webhook/xyz
  | 'ai_task'              // Call LLM (FINN agent, etc)
  | 'send_email'           // Email via Zoho SMTP
  | 'condition'            // If/else branching
  | 'delay'                // Wait N seconds/minutes/hours
  | 'transform_data'       // Map, filter, or enrich data
```

### Node Structure

```typescript
interface WorkflowNode {
  id: string                    // UUID
  type: NodeType
  name: string                  // "Send Welcome Email"
  description?: string
  position: { x: number; y: number } // For visual builder
  config: Record<string, any>   // Node-specific config
  inputs: string[]              // Variable names from previous nodes
  outputs: string[]             // Variable names this node outputs
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped'
  createdAt: Date
  updatedAt: Date
}
```

### Example Node Configs

**Manual Trigger** (entry point):
```typescript
{
  id: 'node-1',
  type: 'manual_trigger',
  name: 'Start',
  config: {
    inputSchema: {
      email: { type: 'string', required: true },
      name: { type: 'string' }
    }
  }
}
```

**Send Email**:
```typescript
{
  id: 'node-2',
  type: 'send_email',
  name: 'Welcome Email',
  config: {
    to: 'user@example.com',
    subject: 'Welcome to SoloSuccess',
    body: '<h1>Welcome!</h1>',
    variables: { name: 'John' }
  },
  inputs: ['trigger']
}
```

**Condition** (branching):
```typescript
{
  id: 'node-3',
  type: 'condition',
  name: 'Is Premium?',
  config: {
    condition: 'tier === "premium"' // expr-eval expression
  },
  outputs: ['true', 'false']
}
```

**Delay**:
```typescript
{
  id: 'node-4',
  type: 'delay', 
  name: 'Wait 24 hours',
  config: {
    duration: 24,
    unit: 'hours'  // 'milliseconds' | 'seconds' | 'minutes' | 'hours'
  }
}
```

**AI Task**:
```typescript
{
  id: 'node-5',
  type: 'ai_task',
  name: 'Generate Business Plan',
  config: {
    agentId: 'finn',           // Which agent to use
    prompt: 'Generate a 30-day plan for this business',
    model: 'gpt-4-turbo',
    temperature: 0.7,
    maxTokens: 2000
  },
  inputs: ['trigger.businessName'],
  outputs: ['businessPlan']
}
```

### Edges (Connections)

Nodes are connected by edges that determine execution flow:

```typescript
interface WorkflowEdge {
  id: string
  source: string           // Node UUID
  target: string           // Node UUID
  sourceHandle?: string    // "true" or "false" for conditions
  targetHandle?: string
  condition?: string       // Optional: expr-eval condition
  label?: string           // "Yes", "No", etc
  animated: boolean        // Visual only
}
```

---

## 2. Execution Model

### Trigger Types

**Manual Trigger** (entry):
```
User clicks "Run Now" with input data
    ↓
Workflow executes from start
    ↓
All connected nodes execute in dependency order
```

**Scheduled Trigger** (cron):
```
At specified time (e.g., "0 9 * * MON"):
    ↓
Workflow executes automatically
    ↓
Results stored in database
```

**Webhook Trigger**:
```
Workflow contains a webhook_trigger node with config:
  { path, method, authentication, secret? }
    ↓
Your application route/controller receives the external request
    ↓
Your route passes request data into engine.executeWorkflow(...)
```

### Execution Flow

```typescript
const execution = await engine.executeWorkflow(
  'workflow-123',
  { email: 'user@example.com', tier: 'premium' },
  'user-123'
)

// execution = {
//   id: 'exec-123',
//   workflowId,
//   status: 'completed', // 'pending', 'running', 'completed', 'failed'
//   nodeResults: [
//     { nodeId: 'node-1', status: 'completed', output: {...} },
//     { nodeId: 'node-2', status: 'completed', output: {...} },
//     { nodeId: 'node-3', status: 'completed', output: {...} }
//   ],
//   startedAt: Date,
//   completedAt: Date,
//   error?: string
// }
```

### Variable Resolution

The engine does not provide a generic `resolveVariables()` helper. Most node configs are executed as provided.

Condition node expressions are evaluated with:

- `context.variables` (workflow input variables)
- `results` (object built from prior node results)
- Optional `value` alias when `config.variable` is set

Example:
```typescript
config: { condition: 'tier === "premium"' }
```

`ai_task` is the only built-in exception: it performs simple `{{key}}` replacement in `prompt` using `context.variables`.

---

## 3. Common Workflows

### Example 1: Welcome Email Sequence

**Visual Flow**:
```
[Manual Trigger] 
    ↓
[Send Email] → "Welcome"
    ↓
[Delay] → 1 day
    ↓
[Send Email] → "Getting Started Guide"
```

**Node Definitions**:
```typescript
const nodes: WorkflowNode[] = [
  {
    id: 'trigger',
    type: 'manual_trigger',
    name: 'Start',
    config: {
      inputSchema: {
        email: { type: 'string' },
        name: { type: 'string' }
      }
    }
  },
  {
    id: 'welcome-email',
    type: 'send_email',
    name: 'Send Welcome',
    config: {
      to: 'user@example.com',
      subject: 'Welcome!',
      body: '<h1>Hi there</h1>'
    }
  },
  {
    id: 'delay-24-hours',
    type: 'delay',
    name: 'Wait 24 hours',
    config: { duration: 24, unit: 'hours' }
  },
  {
    id: 'followup-email',
    type: 'send_email',
    name: 'Follow-up Email',
    config: {
      to: 'user@example.com',
      subject: 'Getting Started with SoloSuccess',
      body: '<h1>Next Steps</h1>...'
    }
  }
]

const edges: WorkflowEdge[] = [
  { id: 'e1', source: 'trigger', target: 'welcome-email' },
  { id: 'e2', source: 'welcome-email', target: 'delay-24-hours' },
  { id: 'e3', source: 'delay-24-hours', target: 'followup-email' }
]
```

### Example 2: Conditional Premium Offer

**Visual Flow**:
```
[Webhook Trigger] "New Signup"
    ↓
[Condition] Is Premium?
    ├─ YES → [Send Email] "Premium Features"
    └─ NO → [Send Email] "Try Premium"
```

**Node Definitions**:
```typescript
const nodes = [
  {
    id: 'webhook',
    type: 'webhook_trigger',
    name: 'New User Signup',
    config: {
      inputSchema: {
        email: { type: 'string' },
        tier: { type: 'string', enum: ['free', 'premium'] }
      }
    }
  },
  {
    id: 'check-tier',
    type: 'condition',
    name: 'Check Subscription',
    config: {
      condition: 'tier === "premium"'
    }
  },
  {
    id: 'premium-email',
    type: 'send_email',
    name: 'Premium Welcome',
    config: {
      to: 'premium-user@example.com',
      subject: 'Unlock Premium Features',
      body: '<h1>You have premium access!</h1>'
    }
  },
  {
    id: 'free-email',
    type: 'send_email',
    name: 'Upgrade Offer',
    config: {
      to: 'free-user@example.com',
      subject: 'Upgrade to Premium',
      body: '<h1>Try premium free for 7 days</h1>'
    }
  }
]

const edges = [
  { id: 'e1', source: 'webhook', target: 'check-tier' },
  { id: 'e2', source: 'check-tier', target: 'premium-email', sourceHandle: 'true' },
  { id: 'e3', source: 'check-tier', target: 'free-email', sourceHandle: 'false' }
]
```

### Example 3: Scheduled Daily Report

**Visual Flow**:
```
[Scheduled Trigger] Every day at 9 AM
    ↓
[AI Task] Generate daily report
    ↓
[Send Email] Report to user
```

**Node Definitions**:
```typescript
const nodes = [
  {
    id: 'schedule',
    type: 'scheduled_trigger',
    name: 'Daily at 9 AM',
    config: {
      cron: '0 9 * * *',           // Every day at 9 AM UTC
      timezone: 'America/New_York' // Or user's timezone
    }
  },
  {
    id: 'generate-report',
    type: 'ai_task',
    name: 'Generate Report',
    config: {
      agentId: 'finn',
      prompt: 'Generate a daily business summary report',
      model: 'gpt-4-turbo'
    }
  },
  {
    id: 'send-report',
    type: 'send_email',
    name: 'Email Report',
    config: {
      to: 'user@example.com',
      subject: 'Daily Report',
      body: 'Your report has been generated.'
    }
  }
]
```

---

## 4. API Usage

### Create Workflow

```typescript
const engine = WorkflowEngine.getInstance()

const nodes = [
  {
    id: 'start',
    type: 'manual_trigger',
    name: 'Start',
    config: { inputSchema: {} }
  }
]

const workflow = await engine.createWorkflow({
  name: 'Manual Starter',
  description: 'Minimal workflow with one trigger node',
  version: '1.0.0',
  status: 'draft',
  triggerType: 'manual',
  triggerConfig: {},
  variables: {},
  settings: {},
  nodes,
  edges: []
}, currentUser.id) // createdBy user ID from authenticated session
```

### Execute Workflow

```typescript
const execution = await WorkflowEngine.getInstance().executeWorkflow(
  'workflow-123',
  { email: 'user@example.com', name: 'John' },
  'user-123'
)

console.log(execution.status) // 'completed', 'failed', etc
console.log(execution.nodeResults) // Results from each node
```

### Query Executions

```typescript
const engine = WorkflowEngine.getInstance()
const workflowId = workflow.id

// Get recent executions for a workflow
const executions = await engine.getWorkflowExecutions(workflowId)

// Get execution details
const exec = await engine.getExecution(executionId)

console.log(exec?.nodeResults) // Results from each node
console.log(exec?.status) // 'running' | 'completed' | 'failed'
```

### List Analytics

```typescript
const engine = WorkflowEngine.getInstance()
const executions = await engine.getWorkflowExecutions(workflowId)

const total = executions.length
const successful = executions.filter((e) => e.status === 'completed').length
const successRate = total ? successful / total : 0
const averageExecutionTime = total
  ? executions.reduce((sum, e) => sum + (e.executionTime ?? 0), 0) / total
  : 0

console.log({ total, successRate, averageExecutionTime })
```

---

## 5. Error Handling

### Node Execution Errors

If a node fails:

1. **Execution stops** (unless there's a fallback edge)
2. **Error is logged** with node ID and error details
3. **Execution status** set to `'failed'`
4. **User is notified** (if email notification is configured)

Example error:
```json
{
  "executionId": "exec-123",
  "status": "failed",
  "error": "Node send-email failed: Invalid email address 'notanemail'",
  "failedNodeId": "send-email",
  "nodeResults": [
    { "nodeId": "trigger", "status": "completed", "output": {...} },
    { "nodeId": "send-email", "status": "failed", "error": "..." }
  ]
}
```

### Retry Mechanism

Currently, **no automatic retries** are built-in. To retry:

1. Check execution status via API
2. If failed, user clicks "Retry" in UI
3. System re-executes from the failed node (with fresh output from dependencies)

### Debugging

Enable verbose logging:
```typescript
// src/lib/logger.ts
logInfo('Executing node...', {
  workflowId,
  nodeId,
  nodeType,
  config
})
```

Check logs for:
```
logError('Node execution failed...', { nodeId, error })
```

---

## 6. Limitations & Constraints

### Current Limitations

1. **No parallel execution** — Nodes execute sequentially
2. **No loop constructs** — Can't repeat nodes N times
3. **Limited data transformation** — Only basic `transform_data` node
4. **No sub-workflows** — Can't call another workflow from within a workflow
5. **Timeout defaults**: `WorkflowSchema.settings.timeout` in `src/lib/workflow-engine.ts` defaults to 300000ms (5 minutes), while deployment platforms may impose lower hard limits

### Scalability

- **Delay nodes** currently use in-process `setTimeout` inside execution (blocking the invocation for the delay duration)
  - Recommended workaround: offload long waits to an external queue/scheduler and resume workflow execution from a follow-up trigger
- **Scheduled triggers** use cron scheduling (managed externally)
- **Database**: Store execution history with TTL (auto-purge old executions)

---

## 7. Adding New Node Types

To add a new node type (e.g., `sms_send`):

1. **Update schema**:
   ```typescript
   // src/lib/workflow-engine.ts
   // Add 'sms_send' to WorkflowNodeSchema.type enum values
   ```

2. **Implement executor**:
   ```typescript
   // src/lib/workflow-engine.ts
   this.registerNodeType({
     id: 'sms_send',
     name: 'Send SMS',
     category: 'communication',
     inputs: [{ id: 'input', name: 'Data', type: 'object', required: true }],
     outputs: [{ id: 'output', name: 'Result', type: 'object', required: true }],
     configSchema: z.object({
       phoneNumber: z.string(),
       message: z.string(),
     }),
     execute: async (config) => {
       const smsConfig = config as { phoneNumber: string; message: string }
       const result = await sendSms(smsConfig.phoneNumber, smsConfig.message)
       return { sent: result.success, messageId: result.id, error: result.error }
     }
   })
   ```

3. **Update UI** to allow configuring the new node type.

---

## 8. Database Schema

### workflows table
```sql
CREATE TABLE workflows (
  id UUID PRIMARY KEY,
  userId UUID NOT NULL,
  name VARCHAR(255),
  description TEXT,
  nodes JSONB NOT NULL,
  edges JSONB NOT NULL,
  isActive BOOLEAN DEFAULT true,
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP
)
```

### workflowExecutions table
```sql
CREATE TABLE workflowExecutions (
  id UUID PRIMARY KEY,
  workflowId UUID NOT NULL,
  status VARCHAR(50), -- 'pending', 'running', 'completed', 'failed'
  input JSONB,
  nodeResults JSONB NOT NULL,
  error TEXT,
  startedAt TIMESTAMP,
  completedAt TIMESTAMP
)
```

---

## 9. Troubleshooting

### Workflow Not Triggering on Schedule

1. **Check cron expression**: Use [crontab.guru](https://crontab.guru) to validate
2. **Check timezone**: Ensure user's timezone is set correctly
3. **Check isActive**: Verify `workflows.isActive = true`
4. **Check logs**: Look for `ScheduledTrigger: No workflows to execute`

### Condition Evaluation Failing

**Problem**: Condition node evaluates unexpectedly.

**Solution**:
1. Verify expected values exist in workflow input variables
2. Verify condition expression matches available keys (for example `tier === "premium"`)
3. Check prior node outputs in execution logs under `results`

### Node Timeout

**Problem**: Workflow execution times out.

**Solution**:
1. Break into multiple workflows with delays
2. Move heavy computation to background job
3. Increase timeout (requires runtime config change)

---

## 10. Code References

- **Core engine**: `src/lib/workflow-engine.ts`
- **Node execution**: `src/lib/workflow-engine.ts` lines 200-500
- **Database schema**: `src/lib/shared/db/schema/workflow.ts`
- **Schema exports used by app code**: `src/lib/shared/db/schema/index.ts`
- **Cron scheduling**: External (via cron library or cloud scheduler)

---

## 11. Related Documentation

- [EMAIL_AND_NOTIFICATIONS.md](EMAIL_AND_NOTIFICATIONS.md) — Email sending in workflows
- [AGENT_PERSONALITY_SYSTEM.md](AGENT_PERSONALITY_SYSTEM.md) — AI task nodes
- [ARCHITECTURE.md](ARCHITECTURE.md) — System overview
