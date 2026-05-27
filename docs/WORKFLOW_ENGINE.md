# Workflow Engine — Visual Automation System

## Overview

The **Workflow Engine** is a core system for building, executing, and monitoring automated workflows using a visual node-based builder. Users can create sequences of tasks (email, AI, conditions, delays) triggered manually, on schedule, or by webhooks.

**Key Files**:
- `src/lib/workflow-engine.ts` — Core execution engine (1000+ lines)
- `src/shared/db/schema.ts` — Workflow storage schema
- Workflow UI components (in dashboard)

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
    to: '{{trigger.email}}',           // Reference trigger output
    subject: 'Welcome {{trigger.name}}!',
    template: 'welcome_template_id',
    // or raw HTML:
    html: '<h1>Welcome {{trigger.name}}!</h1>'
  },
  inputs: ['trigger.email', 'trigger.name']
}
```

**Condition** (branching):
```typescript
{
  id: 'node-3',
  type: 'condition',
  name: 'Is Premium?',
  config: {
    condition: '{{trigger.tier}} === "premium"' // expr-eval expression
  },
  outputs: ['true_branch', 'false_branch']
}
```

**Delay**:
```typescript
{
  id: 'node-4',
  type: 'delay',
  name: 'Wait 1 day',
  config: {
    duration: 1,
    unit: 'day'  // 'second', 'minute', 'hour', 'day', 'week'
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
    prompt: 'Generate a 30-day plan for {{trigger.businessName}}',
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
  sourceHandle?: string    // "true_branch" for conditions
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
External POST /api/workflows/webhook/{workflowId}
    ↓
Payload becomes trigger input
    ↓
Workflow executes
```

### Execution Flow

```typescript
const workflow = await db.query.workflows.findOne({ where: { id: workflowId } })
const execution = await engine.executeWorkflow({
  workflowId,
  triggerId: 'manual_trigger_node_id',
  input: { email: 'user@example.com', name: 'John' }
})

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

Variables are referenced with `{{variable.path}}` syntax:

```
{{trigger.email}}           → Input from trigger node
{{node-2.output}}           → Output from node-2
{{node-3.businessPlan}}     → Specific output from node-3
```

The engine resolves these before executing each node by looking up previous node outputs.

---

## 3. Common Workflows

### Example 1: Welcome Email Sequence

**Visual Flow**:
```
[Manual Trigger] 
    ↓
[Send Email] → "Welcome {{name}}"
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
      to: '{{trigger.email}}',
      subject: 'Welcome {{trigger.name}}!',
      html: '<h1>Hi {{trigger.name}}</h1>'
    }
  },
  {
    id: 'delay-1-day',
    type: 'delay',
    name: 'Wait 1 day',
    config: { duration: 1, unit: 'day' }
  },
  {
    id: 'followup-email',
    type: 'send_email',
    name: 'Follow-up Email',
    config: {
      to: '{{trigger.email}}',
      subject: 'Getting Started with SoloSuccess',
      html: '<h1>Next Steps</h1>...'
    }
  }
]

const edges: WorkflowEdge[] = [
  { id: 'e1', source: 'trigger', target: 'welcome-email' },
  { id: 'e2', source: 'welcome-email', target: 'delay-1-day' },
  { id: 'e3', source: 'delay-1-day', target: 'followup-email' }
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
      condition: '{{webhook.tier}} === "premium"'
    }
  },
  {
    id: 'premium-email',
    type: 'send_email',
    name: 'Premium Welcome',
    config: {
      to: '{{webhook.email}}',
      subject: 'Unlock Premium Features',
      html: '<h1>You have premium access!</h1>'
    }
  },
  {
    id: 'free-email',
    type: 'send_email',
    name: 'Upgrade Offer',
    config: {
      to: '{{webhook.email}}',
      subject: 'Upgrade to Premium',
      html: '<h1>Try premium free for 7 days</h1>'
    }
  }
]

const edges = [
  { id: 'e1', source: 'webhook', target: 'check-tier' },
  { id: 'e2', source: 'check-tier', target: 'premium-email', sourceHandle: 'true_branch' },
  { id: 'e3', source: 'check-tier', target: 'free-email', sourceHandle: 'false_branch' }
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
      subject: 'Daily Report - {{now.date}}',
      html: '{{generate-report.output}}'
    }
  }
]
```

---

## 4. API Usage

### Create Workflow

```typescript
const workflow = await WorkflowEngine.createWorkflow({
  name: 'Welcome Sequence',
  description: 'Send welcome email and follow-up',
  nodes: [...],
  edges: [...],
  isActive: true
})
```

### Execute Workflow

```typescript
const execution = await WorkflowEngine.getInstance().executeWorkflow({
  workflowId: 'workflow-123',
  triggerId: 'manual_trigger_node_id',
  input: { email: 'user@example.com', name: 'John' }
})

console.log(execution.status) // 'completed', 'failed', etc
console.log(execution.nodeResults) // Results from each node
```

### Query Executions

```typescript
// Get recent executions
const executions = await db.query.workflowExecutions.findMany({
  where: eq(workflowExecutions.workflowId, workflowId),
  orderBy: desc(workflowExecutions.startedAt),
  limit: 10
})

// Get execution details
const exec = await db.query.workflowExecutions.findOne({
  where: eq(workflowExecutions.id, executionId)
})

console.log(exec.nodeResults) // Results from each node
console.log(exec.error) // Error message if failed
```

### List Analytics

```typescript
const stats = await WorkflowEngine.getExecutionStats(workflowId, {
  days: 30
})

console.log(stats.totalExecutions)
console.log(stats.successRate) // 0.95 = 95%
console.log(stats.averageExecutionTime) // milliseconds
console.log(stats.nodeFailureRate) // Breakdown by node
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
5. **Timeout**: 30 seconds per execution (constraint from serverless runtime)

### Scalability

- **Delay nodes** use background jobs, not blocking timers
- **Scheduled triggers** use cron scheduling (managed externally)
- **Database**: Store execution history with TTL (auto-purge old executions)

---

## 7. Adding New Node Types

To add a new node type (e.g., `sms_send`):

1. **Update schema**:
   ```typescript
   // src/shared/db/schema.ts
   type: z.enum([
     'manual_trigger', 'scheduled_trigger', 'webhook_trigger',
     'ai_task', 'send_email', 'sms_send', // ← Add here
     'condition', 'delay', 'transform_data'
   ])
   ```

2. **Implement executor**:
   ```typescript
   // src/lib/workflow-engine.ts
   private async executeNode(node, context) {
     if (node.type === 'sms_send') {
       return await this.executeSmsNode(node, context)
     }
     // ...
   }

   private async executeSmsNode(node, context) {
     const { phoneNumber, message } = node.config
     const resolvedPhone = this.resolveVariables(phoneNumber, context)
     const resolvedMessage = this.resolveVariables(message, context)
     
     const result = await sendSms(resolvedPhone, resolvedMessage)
     
     return {
       status: result.success ? 'completed' : 'failed',
       output: { messageId: result.id },
       error: result.error
     }
   }
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

### Variable Not Resolving

**Problem**: Node receives `"{{trigger.email}}"` literally instead of the actual email.

**Solution**:
1. Verify previous node has completed
2. Verify output variable name matches exactly
3. Check for typos: `{{trigger.email}}` vs `{{trigger.Email}}`

### Node Timeout

**Problem**: Workflow execution times out at 30 seconds.

**Solution**:
1. Break into multiple workflows with delays
2. Move heavy computation to background job
3. Increase timeout (requires runtime config change)

---

## 10. Code References

- **Core engine**: `src/lib/workflow-engine.ts` (1100+ lines)
- **Node execution**: `src/lib/workflow-engine.ts` lines 200-500
- **Database schema**: `src/shared/db/schema.ts` (workflows, workflowExecutions tables)
- **Variable resolution**: `src/lib/workflow-engine.ts` — `resolveVariables()` method
- **Cron scheduling**: External (via cron library or cloud scheduler)

---

## 11. Related Documentation

- [EMAIL_AND_NOTIFICATIONS.md](EMAIL_AND_NOTIFICATIONS.md) — Email sending in workflows
- [AGENT_PERSONALITY_SYSTEM.md](AGENT_PERSONALITY_SYSTEM.md) — AI task nodes
- [ARCHITECTURE.md](ARCHITECTURE.md) — System overview
