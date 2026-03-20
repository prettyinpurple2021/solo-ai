const fs = require('fs');
const path = require('path');

const COLLECTIONS_DIR = path.join(__dirname, '..', 'postman', 'collections');

// Helper to create directory if not exists
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Helper to write YAML file
function writeYaml(filePath, content) {
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Created: ${filePath}`);
}

// Collection 1: Auth & User
function createAuthUserCollection() {
  const collectionDir = path.join(COLLECTIONS_DIR, 'solosuccess-auth-user');
  ensureDir(collectionDir);
  ensureDir(path.join(collectionDir, '.resources'));
  ensureDir(path.join(collectionDir, 'authentication'));
  ensureDir(path.join(collectionDir, 'profile'));
  ensureDir(path.join(collectionDir, 'preferences'));
  ensureDir(path.join(collectionDir, 'onboarding'));

  // Collection definition
  writeYaml(path.join(collectionDir, '.resources', 'definition.yaml'), `$kind: collection
name: SoloSuccess - Auth & User
description: |-
  Authentication, user profile, preferences, and onboarding endpoints for SoloSuccess AI.
  Most endpoints require authentication via session cookie or Bearer token.
variables:
  - key: baseUrl
    value: 'http://localhost:3000'
`);

  // Authentication folder
  ensureDir(path.join(collectionDir, 'authentication', '.resources'));
  writeYaml(path.join(collectionDir, 'authentication', '.resources', 'definition.yaml'), `$kind: collection
name: Authentication
description: User registration, authentication, and token management
order: 1000
`);

  writeYaml(path.join(collectionDir, 'authentication', 'register.request.yaml'), `$kind: http-request
name: Register User
method: POST
url: '{{baseUrl}}/api/register'
order: 1000
headers:
  - key: Content-Type
    value: application/json
body:
  type: json
  content: |-
    {
      "email": "user@example.com",
      "password": "securePassword123",
      "name": "John Doe"
    }
`);

  writeYaml(path.join(collectionDir, 'authentication', 'get-ws-token.request.yaml'), `$kind: http-request
name: Get WebSocket Token
method: GET
url: '{{baseUrl}}/api/ws-token'
order: 2000
`);

  writeYaml(path.join(collectionDir, 'authentication', 'validate-recaptcha.request.yaml'), `$kind: http-request
name: Validate reCAPTCHA
method: POST
url: '{{baseUrl}}/api/recaptcha/validate'
order: 3000
headers:
  - key: Content-Type
    value: application/json
body:
  type: json
  content: |-
    {
      "token": "recaptcha-token-here"
    }
`);

  // Profile folder
  ensureDir(path.join(collectionDir, 'profile', '.resources'));
  writeYaml(path.join(collectionDir, 'profile', '.resources', 'definition.yaml'), `$kind: collection
name: Profile
description: User profile management and progress tracking
order: 2000
`);

  writeYaml(path.join(collectionDir, 'profile', 'get-profile.request.yaml'), `$kind: http-request
name: Get Profile
method: GET
url: '{{baseUrl}}/api/profile'
order: 1000
`);

  writeYaml(path.join(collectionDir, 'profile', 'update-profile.request.yaml'), `$kind: http-request
name: Update Profile
method: PATCH
url: '{{baseUrl}}/api/profile'
order: 2000
headers:
  - key: Content-Type
    value: application/json
body:
  type: json
  content: |-
    {
      "full_name": "John Doe",
      "bio": "Solopreneur building amazing products",
      "image": "https://example.com/avatar.jpg",
      "onboarding_completed": true
    }
`);

  writeYaml(path.join(collectionDir, 'profile', 'track-progress.request.yaml'), `$kind: http-request
name: Track Progress
method: POST
url: '{{baseUrl}}/api/profile/progress'
order: 3000
headers:
  - key: Content-Type
    value: application/json
body:
  type: json
  content: |-
    {
      "action": "task_completed",
      "metadata": {
        "taskId": "task-123"
      }
    }
`);

  writeYaml(path.join(collectionDir, 'profile', 'get-api-keys.request.yaml'), `$kind: http-request
name: Get API Keys
method: GET
url: '{{baseUrl}}/api/profile/api-keys'
order: 4000
`);

  writeYaml(path.join(collectionDir, 'profile', 'save-api-keys.request.yaml'), `$kind: http-request
name: Save API Keys
method: POST
url: '{{baseUrl}}/api/profile/api-keys'
order: 5000
headers:
  - key: Content-Type
    value: application/json
body:
  type: json
  content: |-
    {
      "keys": [
        {
          "service": "openai",
          "key_value": "sk-..."
        },
        {
          "service": "anthropic",
          "key_value": "sk-ant-..."
        }
      ]
    }
`);

  // Preferences folder
  ensureDir(path.join(collectionDir, 'preferences', '.resources'));
  writeYaml(path.join(collectionDir, 'preferences', '.resources', 'definition.yaml'), `$kind: collection
name: Preferences
description: User preferences management
order: 3000
`);

  writeYaml(path.join(collectionDir, 'preferences', 'get-preferences.request.yaml'), `$kind: http-request
name: Get Preferences
method: GET
url: '{{baseUrl}}/api/preferences'
order: 1000
`);

  writeYaml(path.join(collectionDir, 'preferences', 'save-preferences.request.yaml'), `$kind: http-request
name: Save Preferences
method: POST
url: '{{baseUrl}}/api/preferences'
order: 2000
headers:
  - key: Content-Type
    value: application/json
body:
  type: json
  content: |-
    {
      "theme": "dark",
      "notifications": true,
      "language": "en"
    }
`);

  writeYaml(path.join(collectionDir, 'preferences', 'delete-preferences.request.yaml'), `$kind: http-request
name: Delete Preferences
method: DELETE
url: '{{baseUrl}}/api/preferences'
order: 3000
`);

  // Onboarding folder
  ensureDir(path.join(collectionDir, 'onboarding', '.resources'));
  writeYaml(path.join(collectionDir, 'onboarding', '.resources', 'definition.yaml'), `$kind: collection
name: Onboarding
description: User onboarding workflows
order: 4000
`);

  writeYaml(path.join(collectionDir, 'onboarding', 'process-onboarding.request.yaml'), `$kind: http-request
name: Process Onboarding
method: POST
url: '{{baseUrl}}/api/workers/onboarding'
order: 1000
headers:
  - key: Content-Type
    value: application/json
body:
  type: json
  content: |-
    {
      "step": "business_info",
      "data": {
        "businessName": "My Startup",
        "industry": "technology",
        "goals": ["increase_revenue", "automate_tasks"]
      }
    }
`);
}

// Collection 2: Core Features
function createCoreFeatures() {
  const collectionDir = path.join(COLLECTIONS_DIR, 'solosuccess-core-features');
  ensureDir(collectionDir);
  ensureDir(path.join(collectionDir, '.resources'));
  ensureDir(path.join(collectionDir, 'goals'));
  ensureDir(path.join(collectionDir, 'tasks'));
  ensureDir(path.join(collectionDir, 'projects'));
  ensureDir(path.join(collectionDir, 'workflows'));
  ensureDir(path.join(collectionDir, 'workflow-templates'));
  ensureDir(path.join(collectionDir, 'templates'));

  writeYaml(path.join(collectionDir, '.resources', 'definition.yaml'), `$kind: collection
name: SoloSuccess - Core Features
description: |-
  Core productivity features: goals, tasks, projects, workflows, and templates.
  Most endpoints require authentication via session cookie or Bearer token.
variables:
  - key: baseUrl
    value: 'http://localhost:3000'
  - key: workflowId
    value: ''
  - key: templateId
    value: ''
`);

  // Goals folder
  ensureDir(path.join(collectionDir, 'goals', '.resources'));
  writeYaml(path.join(collectionDir, 'goals', '.resources', 'definition.yaml'), `$kind: collection
name: Goals
description: Goal management endpoints
order: 1000
`);

  writeYaml(path.join(collectionDir, 'goals', 'list-goals.request.yaml'), `$kind: http-request
name: List Goals
method: GET
url: '{{baseUrl}}/api/goals'
order: 1000
queryParams:
  - key: include_competitive
    value: 'false'
    disabled: true
`);

  writeYaml(path.join(collectionDir, 'goals', 'create-goal.request.yaml'), `$kind: http-request
name: Create Goal
method: POST
url: '{{baseUrl}}/api/goals'
order: 2000
headers:
  - key: Content-Type
    value: application/json
body:
  type: json
  content: |-
    {
      "title": "Launch MVP by Q2",
      "description": "Complete and launch the minimum viable product",
      "target_date": "2025-06-30",
      "category": "product",
      "priority": "high"
    }
`);

  // Tasks folder
  ensureDir(path.join(collectionDir, 'tasks', '.resources'));
  writeYaml(path.join(collectionDir, 'tasks', '.resources', 'definition.yaml'), `$kind: collection
name: Tasks
description: Task management endpoints
order: 2000
`);

  writeYaml(path.join(collectionDir, 'tasks', 'list-tasks.request.yaml'), `$kind: http-request
name: List Tasks
method: GET
url: '{{baseUrl}}/api/tasks'
order: 1000
queryParams:
  - key: include_competitive
    value: 'false'
    disabled: true
  - key: competitive_only
    value: 'false'
    disabled: true
`);

  writeYaml(path.join(collectionDir, 'tasks', 'create-task.request.yaml'), `$kind: http-request
name: Create Task
method: POST
url: '{{baseUrl}}/api/tasks'
order: 2000
headers:
  - key: Content-Type
    value: application/json
body:
  type: json
  content: |-
    {
      "title": "Design landing page",
      "description": "Create wireframes and mockups for the landing page",
      "priority": "high",
      "due_date": "2025-02-15",
      "category": "design"
    }
`);

  // Projects folder
  ensureDir(path.join(collectionDir, 'projects', '.resources'));
  writeYaml(path.join(collectionDir, 'projects', '.resources', 'definition.yaml'), `$kind: collection
name: Projects
description: Project management endpoints
order: 3000
`);

  writeYaml(path.join(collectionDir, 'projects', 'list-projects.request.yaml'), `$kind: http-request
name: List Projects
method: GET
url: '{{baseUrl}}/api/projects'
order: 1000
`);

  writeYaml(path.join(collectionDir, 'projects', 'create-project.request.yaml'), `$kind: http-request
name: Create Project
method: POST
url: '{{baseUrl}}/api/projects'
order: 2000
headers:
  - key: Content-Type
    value: application/json
body:
  type: json
  content: |-
    {
      "name": "Website Redesign",
      "description": "Complete overhaul of the company website",
      "color": "#6366f1",
      "icon": "🎨",
      "status": "active"
    }
`);

  writeYaml(path.join(collectionDir, 'projects', 'update-project.request.yaml'), `$kind: http-request
name: Update Project
method: PUT
url: '{{baseUrl}}/api/projects'
order: 3000
headers:
  - key: Content-Type
    value: application/json
body:
  type: json
  content: |-
    {
      "id": "project-id-here",
      "name": "Website Redesign v2",
      "status": "completed"
    }
`);

  writeYaml(path.join(collectionDir, 'projects', 'delete-project.request.yaml'), `$kind: http-request
name: Delete Project
method: DELETE
url: '{{baseUrl}}/api/projects'
order: 4000
queryParams:
  - key: id
    value: 'project-id-here'
`);

  // Workflows folder
  ensureDir(path.join(collectionDir, 'workflows', '.resources'));
  writeYaml(path.join(collectionDir, 'workflows', '.resources', 'definition.yaml'), `$kind: collection
name: Workflows
description: Workflow automation endpoints
order: 4000
`);

  writeYaml(path.join(collectionDir, 'workflows', 'list-workflows.request.yaml'), `$kind: http-request
name: List Workflows
method: GET
url: '{{baseUrl}}/api/workflows'
order: 1000
queryParams:
  - key: page
    value: '1'
    disabled: true
  - key: limit
    value: '20'
    disabled: true
  - key: status
    value: 'active'
    disabled: true
  - key: category
    value: ''
    disabled: true
  - key: search
    value: ''
    disabled: true
`);

  writeYaml(path.join(collectionDir, 'workflows', 'create-workflow.request.yaml'), `$kind: http-request
name: Create Workflow
method: POST
url: '{{baseUrl}}/api/workflows'
order: 2000
headers:
  - key: Content-Type
    value: application/json
body:
  type: json
  content: |-
    {
      "name": "Daily Report Generator",
      "description": "Automatically generates and sends daily reports",
      "triggerType": "schedule",
      "triggerConfig": {
        "cron": "0 9 * * *"
      },
      "nodes": [],
      "edges": [],
      "variables": {},
      "settings": {
        "timeout": 300000,
        "retryAttempts": 3
      },
      "category": "reporting",
      "tags": ["daily", "reports"]
    }
`);

  writeYaml(path.join(collectionDir, 'workflows', 'update-workflow.request.yaml'), `$kind: http-request
name: Update Workflow
method: PUT
url: '{{baseUrl}}/api/workflows'
order: 3000
headers:
  - key: Content-Type
    value: application/json
body:
  type: json
  content: |-
    {
      "id": "{{workflowId}}",
      "name": "Updated Workflow Name",
      "status": "active"
    }
`);

  writeYaml(path.join(collectionDir, 'workflows', 'delete-workflow.request.yaml'), `$kind: http-request
name: Delete Workflow
method: DELETE
url: '{{baseUrl}}/api/workflows'
order: 4000
queryParams:
  - key: id
    value: '{{workflowId}}'
`);

  writeYaml(path.join(collectionDir, 'workflows', 'get-workflow-stats.request.yaml'), `$kind: http-request
name: Get Workflow Stats
method: GET
url: '{{baseUrl}}/api/workflows/stats'
order: 5000
`);

  writeYaml(path.join(collectionDir, 'workflows', 'get-workflow-executions.request.yaml'), `$kind: http-request
name: Get Workflow Executions
method: GET
url: '{{baseUrl}}/api/workflows/executions'
order: 6000
`);

  writeYaml(path.join(collectionDir, 'workflows', 'get-node-types.request.yaml'), `$kind: http-request
name: Get Node Types
method: GET
url: '{{baseUrl}}/api/workflows/node-types'
order: 7000
`);

  writeYaml(path.join(collectionDir, 'workflows', 'get-workflow-templates.request.yaml'), `$kind: http-request
name: Get Workflow Templates
method: GET
url: '{{baseUrl}}/api/workflows/templates'
order: 8000
`);

  writeYaml(path.join(collectionDir, 'workflows', 'execute-workflow.request.yaml'), `$kind: http-request
name: Execute Workflow
method: POST
url: '{{baseUrl}}/api/workflows/execute'
order: 9000
headers:
  - key: Content-Type
    value: application/json
body:
  type: json
  content: |-
    {
      "workflowId": "{{workflowId}}",
      "input": {}
    }
`);

  writeYaml(path.join(collectionDir, 'workflows', 'execute-workflow-by-id.request.yaml'), `$kind: http-request
name: Execute Workflow by ID
method: POST
url: '{{baseUrl}}/api/workflows/{{workflowId}}/execute'
order: 10000
headers:
  - key: Content-Type
    value: application/json
body:
  type: json
  content: |-
    {
      "input": {
        "param1": "value1"
      }
    }
`);

  writeYaml(path.join(collectionDir, 'workflows', 'get-workflow-execution-status.request.yaml'), `$kind: http-request
name: Get Workflow Execution Status
method: GET
url: '{{baseUrl}}/api/workflows/{{workflowId}}/execute'
order: 11000
queryParams:
  - key: executionId
    value: ''
    disabled: true
  - key: limit
    value: '10'
    disabled: true
`);

  // Workflow Templates folder
  ensureDir(path.join(collectionDir, 'workflow-templates', '.resources'));
  writeYaml(path.join(collectionDir, 'workflow-templates', '.resources', 'definition.yaml'), `$kind: collection
name: Workflow Templates
description: Workflow template management
order: 5000
`);

  writeYaml(path.join(collectionDir, 'workflow-templates', 'list-workflow-templates.request.yaml'), `$kind: http-request
name: List Workflow Templates
method: GET
url: '{{baseUrl}}/api/workflow-templates'
order: 1000
`);

  writeYaml(path.join(collectionDir, 'workflow-templates', 'create-workflow-template.request.yaml'), `$kind: http-request
name: Create Workflow Template
method: POST
url: '{{baseUrl}}/api/workflow-templates'
order: 2000
headers:
  - key: Content-Type
    value: application/json
body:
  type: json
  content: |-
    {
      "name": "Email Automation Template",
      "description": "Template for email automation workflows",
      "category": "marketing",
      "nodes": [],
      "edges": []
    }
`);

  writeYaml(path.join(collectionDir, 'workflow-templates', 'download-workflow-template.request.yaml'), `$kind: http-request
name: Download Workflow Template
method: POST
url: '{{baseUrl}}/api/workflow-templates/{{templateId}}/download'
order: 3000
`);

  // Templates folder
  ensureDir(path.join(collectionDir, 'templates', '.resources'));
  writeYaml(path.join(collectionDir, 'templates', '.resources', 'definition.yaml'), `$kind: collection
name: Templates
description: Content and document templates
order: 6000
`);

  writeYaml(path.join(collectionDir, 'templates', 'list-templates.request.yaml'), `$kind: http-request
name: List Templates
method: GET
url: '{{baseUrl}}/api/templates'
order: 1000
`);

  writeYaml(path.join(collectionDir, 'templates', 'create-template.request.yaml'), `$kind: http-request
name: Create Template
method: POST
url: '{{baseUrl}}/api/templates'
order: 2000
headers:
  - key: Content-Type
    value: application/json
body:
  type: json
  content: |-
    {
      "title": "Business Plan Template",
      "description": "A comprehensive business plan template",
      "content": "# Business Plan\\n\\n## Executive Summary\\n...",
      "category": "business",
      "tags": ["planning", "strategy"],
      "difficulty": "Intermediate",
      "estimated_minutes": 60
    }
`);

  writeYaml(path.join(collectionDir, 'templates', 'get-template.request.yaml'), `$kind: http-request
name: Get Template
method: GET
url: '{{baseUrl}}/api/templates/{{templateId}}'
order: 3000
`);

  writeYaml(path.join(collectionDir, 'templates', 'update-template.request.yaml'), `$kind: http-request
name: Update Template
method: PUT
url: '{{baseUrl}}/api/templates/{{templateId}}'
order: 4000
headers:
  - key: Content-Type
    value: application/json
body:
  type: json
  content: |-
    {
      "title": "Updated Business Plan Template",
      "description": "Updated description"
    }
`);

  writeYaml(path.join(collectionDir, 'templates', 'delete-template.request.yaml'), `$kind: http-request
name: Delete Template
method: DELETE
url: '{{baseUrl}}/api/templates/{{templateId}}'
order: 5000
`);

  writeYaml(path.join(collectionDir, 'templates', 'generate-template.request.yaml'), `$kind: http-request
name: Generate Template
method: POST
url: '{{baseUrl}}/api/templates/generate'
order: 6000
headers:
  - key: Content-Type
    value: application/json
body:
  type: json
  content: |-
    {
      "type": "business_plan",
      "context": {
        "industry": "technology",
        "stage": "startup"
      }
    }
`);

  writeYaml(path.join(collectionDir, 'templates', 'get-favorite-templates.request.yaml'), `$kind: http-request
name: Get Favorite Templates
method: GET
url: '{{baseUrl}}/api/templates/favorites'
order: 7000
`);

  writeYaml(path.join(collectionDir, 'templates', 'add-favorite-template.request.yaml'), `$kind: http-request
name: Add Favorite Template
method: POST
url: '{{baseUrl}}/api/templates/favorites'
order: 8000
headers:
  - key: Content-Type
    value: application/json
body:
  type: json
  content: |-
    {
      "templateId": "{{templateId}}"
    }
`);

  writeYaml(path.join(collectionDir, 'templates', 'get-template-analytics.request.yaml'), `$kind: http-request
name: Get Template Analytics
method: GET
url: '{{baseUrl}}/api/templates/analytics'
order: 9000
`);
}

// Collection 3: AI & Intelligence
function createAIIntelligence() {
  const collectionDir = path.join(COLLECTIONS_DIR, 'solosuccess-ai-intelligence');
  ensureDir(collectionDir);
  ensureDir(path.join(collectionDir, '.resources'));
  ensureDir(path.join(collectionDir, 'ai-agents'));
  ensureDir(path.join(collectionDir, 'ai-tools'));
  ensureDir(path.join(collectionDir, 'chat'));
  ensureDir(path.join(collectionDir, 'competitors'));
  ensureDir(path.join(collectionDir, 'intelligence'));

  writeYaml(path.join(collectionDir, '.resources', 'definition.yaml'), `$kind: collection
name: SoloSuccess - AI & Intelligence
description: |-
  AI agents, chat, competitive intelligence, and AI-powered tools.
  Most endpoints require authentication via session cookie or Bearer token.
variables:
  - key: baseUrl
    value: 'http://localhost:3000'
  - key: competitorId
    value: ''
`);

  // AI Agents folder
  ensureDir(path.join(collectionDir, 'ai-agents', '.resources'));
  writeYaml(path.join(collectionDir, 'ai-agents', '.resources', 'definition.yaml'), `$kind: collection
name: AI Agents
description: Custom AI agent management
order: 1000
`);

  writeYaml(path.join(collectionDir, 'ai-agents', 'create-custom-agent.request.yaml'), `$kind: http-request
name: Create Custom Agent
method: POST
url: '{{baseUrl}}/api/workers/custom-agents'
order: 1000
headers:
  - key: Content-Type
    value: application/json
body:
  type: json
  content: |-
    {
      "name": "Sales Assistant",
      "description": "AI agent specialized in sales tasks",
      "personality": "Professional and persuasive",
      "capabilities": ["lead_qualification", "email_drafting"]
    }
`);

  // AI Tools folder
  ensureDir(path.join(collectionDir, 'ai-tools', '.resources'));
  writeYaml(path.join(collectionDir, 'ai-tools', '.resources', 'definition.yaml'), `$kind: collection
name: AI Tools
description: AI-powered business tools
order: 2000
`);

  writeYaml(path.join(collectionDir, 'ai-tools', 'war-room.request.yaml'), `$kind: http-request
name: War Room Simulation
method: POST
url: '{{baseUrl}}/api/ai/war-room'
order: 1000
headers:
  - key: Content-Type
    value: application/json
body:
  type: json
  content: |-
    {
      "topic": "Should we pivot to B2B or stay B2C?",
      "previousSessionId": null
    }
`);

  writeYaml(path.join(collectionDir, 'ai-tools', 'tactical-plan.request.yaml'), `$kind: http-request
name: Generate Tactical Plan
method: POST
url: '{{baseUrl}}/api/ai/tactical-plan'
order: 2000
headers:
  - key: Content-Type
    value: application/json
body:
  type: json
  content: |-
    {
      "goal": "Increase monthly revenue by 50%",
      "timeframe": "3 months",
      "constraints": ["limited budget", "small team"]
    }
`);

  writeYaml(path.join(collectionDir, 'ai-tools', 'tech-audit.request.yaml'), `$kind: http-request
name: Tech Stack Audit
method: POST
url: '{{baseUrl}}/api/ai/tech-audit'
order: 3000
headers:
  - key: Content-Type
    value: application/json
body:
  type: json
  content: |-
    {
      "currentStack": ["Next.js", "PostgreSQL", "Vercel"],
      "challenges": ["scaling", "performance"],
      "budget": "medium"
    }
`);

  writeYaml(path.join(collectionDir, 'ai-tools', 'tribe-blueprint.request.yaml'), `$kind: http-request
name: Tribe Blueprint
method: POST
url: '{{baseUrl}}/api/ai/tribe-blueprint'
order: 4000
headers:
  - key: Content-Type
    value: application/json
body:
  type: json
  content: |-
    {
      "businessType": "SaaS",
      "targetAudience": "small business owners",
      "goals": ["community building", "customer retention"]
    }
`);

  // Chat folder
  ensureDir(path.join(collectionDir, 'chat', '.resources'));
  writeYaml(path.join(collectionDir, 'chat', '.resources', 'definition.yaml'), `$kind: collection
name: Chat
description: AI chat and conversation management
order: 3000
`);

  writeYaml(path.join(collectionDir, 'chat', 'send-message.request.yaml'), `$kind: http-request
name: Send Chat Message
method: POST
url: '{{baseUrl}}/api/chat'
order: 1000
headers:
  - key: Content-Type
    value: application/json
body:
  type: json
  content: |-
    {
      "message": "Help me create a marketing strategy for my SaaS product",
      "agentId": "roxy"
    }
`);

  writeYaml(path.join(collectionDir, 'chat', 'list-conversations.request.yaml'), `$kind: http-request
name: List Conversations
method: GET
url: '{{baseUrl}}/api/chat/conversations'
order: 2000
`);

  writeYaml(path.join(collectionDir, 'chat', 'create-conversation.request.yaml'), `$kind: http-request
name: Create Conversation
method: POST
url: '{{baseUrl}}/api/chat/conversations'
order: 3000
headers:
  - key: Content-Type
    value: application/json
body:
  type: json
  content: |-
    {
      "title": "Marketing Strategy Discussion",
      "agentId": "blaze"
    }
`);

  writeYaml(path.join(collectionDir, 'chat', 'update-conversation.request.yaml'), `$kind: http-request
name: Update Conversation
method: PUT
url: '{{baseUrl}}/api/chat/conversations'
order: 4000
headers:
  - key: Content-Type
    value: application/json
body:
  type: json
  content: |-
    {
      "id": "conversation-id",
      "title": "Updated Title"
    }
`);

  writeYaml(path.join(collectionDir, 'chat', 'delete-conversation.request.yaml'), `$kind: http-request
name: Delete Conversation
method: DELETE
url: '{{baseUrl}}/api/chat/conversations'
order: 5000
queryParams:
  - key: id
    value: 'conversation-id'
`);

  // Competitors folder
  ensureDir(path.join(collectionDir, 'competitors', '.resources'));
  writeYaml(path.join(collectionDir, 'competitors', '.resources', 'definition.yaml'), `$kind: collection
name: Competitors
description: Competitive intelligence and monitoring
order: 4000
`);

  writeYaml(path.join(collectionDir, 'competitors', 'get-competitor-stats.request.yaml'), `$kind: http-request
name: Get Competitor Stats
method: GET
url: '{{baseUrl}}/api/competitors/stats'
order: 1000
`);

  writeYaml(path.join(collectionDir, 'competitors', 'get-competitor.request.yaml'), `$kind: http-request
name: Get Competitor
method: GET
url: '{{baseUrl}}/api/competitors/{{competitorId}}'
order: 2000
`);

  writeYaml(path.join(collectionDir, 'competitors', 'update-competitor.request.yaml'), `$kind: http-request
name: Update Competitor
method: PUT
url: '{{baseUrl}}/api/competitors/{{competitorId}}'
order: 3000
headers:
  - key: Content-Type
    value: application/json
body:
  type: json
  content: |-
    {
      "name": "Competitor Inc",
      "domain": "https://competitor.com",
      "threatLevel": "high",
      "monitoringStatus": "active"
    }
`);

  writeYaml(path.join(collectionDir, 'competitors', 'delete-competitor.request.yaml'), `$kind: http-request
name: Delete Competitor
method: DELETE
url: '{{baseUrl}}/api/competitors/{{competitorId}}'
order: 4000
`);

  writeYaml(path.join(collectionDir, 'competitors', 'enrich-competitor.request.yaml'), `$kind: http-request
name: Enrich Competitor Data
method: POST
url: '{{baseUrl}}/api/competitors/{{competitorId}}/enrich'
order: 5000
`);

  writeYaml(path.join(collectionDir, 'competitors', 'get-enrichment-status.request.yaml'), `$kind: http-request
name: Get Enrichment Status
method: GET
url: '{{baseUrl}}/api/competitors/{{competitorId}}/enrich'
order: 6000
`);

  writeYaml(path.join(collectionDir, 'competitors', 'get-intelligence.request.yaml'), `$kind: http-request
name: Get Competitor Intelligence
method: GET
url: '{{baseUrl}}/api/competitors/{{competitorId}}/intelligence'
order: 7000
`);

  writeYaml(path.join(collectionDir, 'competitors', 'get-insights.request.yaml'), `$kind: http-request
name: Get Competitor Insights
method: GET
url: '{{baseUrl}}/api/competitors/{{competitorId}}/insights'
order: 8000
`);

  writeYaml(path.join(collectionDir, 'competitors', 'get-activities.request.yaml'), `$kind: http-request
name: Get Competitor Activities
method: GET
url: '{{baseUrl}}/api/competitors/{{competitorId}}/activities'
order: 9000
`);

  writeYaml(path.join(collectionDir, 'competitors', 'get-competitor-alerts.request.yaml'), `$kind: http-request
name: Get Competitor Alerts
method: GET
url: '{{baseUrl}}/api/competitors/{{competitorId}}/alerts'
order: 10000
`);

  writeYaml(path.join(collectionDir, 'competitors', 'get-growth-analysis.request.yaml'), `$kind: http-request
name: Get Growth Analysis
method: GET
url: '{{baseUrl}}/api/competitors/{{competitorId}}/growth-analysis'
order: 11000
`);

  writeYaml(path.join(collectionDir, 'competitors', 'create-growth-analysis.request.yaml'), `$kind: http-request
name: Create Growth Analysis
method: POST
url: '{{baseUrl}}/api/competitors/{{competitorId}}/growth-analysis'
order: 12000
`);

  writeYaml(path.join(collectionDir, 'competitors', 'get-scraping-config.request.yaml'), `$kind: http-request
name: Get Scraping Config
method: GET
url: '{{baseUrl}}/api/competitors/{{competitorId}}/scraping'
order: 13000
`);

  writeYaml(path.join(collectionDir, 'competitors', 'create-scraping-config.request.yaml'), `$kind: http-request
name: Create Scraping Config
method: POST
url: '{{baseUrl}}/api/competitors/{{competitorId}}/scraping'
order: 14000
headers:
  - key: Content-Type
    value: application/json
body:
  type: json
  content: |-
    {
      "frequency": "daily",
      "targets": ["pricing", "features", "blog"]
    }
`);

  writeYaml(path.join(collectionDir, 'competitors', 'update-scraping-config.request.yaml'), `$kind: http-request
name: Update Scraping Config
method: PUT
url: '{{baseUrl}}/api/competitors/{{competitorId}}/scraping'
order: 15000
headers:
  - key: Content-Type
    value: application/json
body:
  type: json
  content: |-
    {
      "frequency": "weekly",
      "enabled": true
    }
`);

  writeYaml(path.join(collectionDir, 'competitors', 'delete-scraping-config.request.yaml'), `$kind: http-request
name: Delete Scraping Config
method: DELETE
url: '{{baseUrl}}/api/competitors/{{competitorId}}/scraping'
order: 16000
`);

  writeYaml(path.join(collectionDir, 'competitors', 'get-social-media.request.yaml'), `$kind: http-request
name: Get Social Media Data
method: GET
url: '{{baseUrl}}/api/competitors/{{competitorId}}/social-media'
order: 17000
`);

  writeYaml(path.join(collectionDir, 'competitors', 'add-social-media.request.yaml'), `$kind: http-request
name: Add Social Media Profile
method: POST
url: '{{baseUrl}}/api/competitors/{{competitorId}}/social-media'
order: 18000
headers:
  - key: Content-Type
    value: application/json
body:
  type: json
  content: |-
    {
      "platform": "twitter",
      "handle": "@competitor"
    }
`);

  writeYaml(path.join(collectionDir, 'competitors', 'get-social-insights.request.yaml'), `$kind: http-request
name: Get Social Media Insights
method: GET
url: '{{baseUrl}}/api/competitors/{{competitorId}}/social-media/insights'
order: 19000
`);

  writeYaml(path.join(collectionDir, 'competitors', 'get-social-analysis.request.yaml'), `$kind: http-request
name: Get Social Media Analysis
method: GET
url: '{{baseUrl}}/api/competitors/{{competitorId}}/social-media/analysis'
order: 20000
`);

  writeYaml(path.join(collectionDir, 'competitors', 'get-social-schedule.request.yaml'), `$kind: http-request
name: Get Social Schedule
method: GET
url: '{{baseUrl}}/api/competitors/{{competitorId}}/social-media/schedule'
order: 21000
`);

  writeYaml(path.join(collectionDir, 'competitors', 'create-social-schedule.request.yaml'), `$kind: http-request
name: Create Social Schedule
method: POST
url: '{{baseUrl}}/api/competitors/{{competitorId}}/social-media/schedule'
order: 22000
headers:
  - key: Content-Type
    value: application/json
body:
  type: json
  content: |-
    {
      "frequency": "daily",
      "platforms": ["twitter", "linkedin"]
    }
`);

  writeYaml(path.join(collectionDir, 'competitors', 'update-social-schedule.request.yaml'), `$kind: http-request
name: Update Social Schedule
method: PUT
url: '{{baseUrl}}/api/competitors/{{competitorId}}/social-media/schedule'
order: 23000
headers:
  - key: Content-Type
    value: application/json
body:
  type: json
  content: |-
    {
      "frequency": "weekly"
    }
`);

  writeYaml(path.join(collectionDir, 'competitors', 'delete-social-schedule.request.yaml'), `$kind: http-request
name: Delete Social Schedule
method: DELETE
url: '{{baseUrl}}/api/competitors/{{competitorId}}/social-media/schedule'
order: 24000
`);

  // Intelligence folder
  ensureDir(path.join(collectionDir, 'intelligence', '.resources'));
  writeYaml(path.join(collectionDir, 'intelligence', '.resources', 'definition.yaml'), `$kind: collection
name: Intelligence
description: General intelligence and context endpoints
order: 5000
`);

  writeYaml(path.join(collectionDir, 'intelligence', 'ping-search.request.yaml'), `$kind: http-request
name: Ping Search
method: POST
url: '{{baseUrl}}/api/ping-search'
order: 1000
headers:
  - key: Content-Type
    value: application/json
body:
  type: json
  content: |-
    {
      "query": "competitor pricing changes",
      "sources": ["web", "news"]
    }
`);

  writeYaml(path.join(collectionDir, 'intelligence', 'get-ping-results.request.yaml'), `$kind: http-request
name: Get Ping Search Results
method: GET
url: '{{baseUrl}}/api/ping-search'
order: 2000
`);

  writeYaml(path.join(collectionDir, 'intelligence', 'get-context.request.yaml'), `$kind: http-request
name: Get Context
method: GET
url: '{{baseUrl}}/api/context'
order: 3000
`);

  writeYaml(path.join(collectionDir, 'intelligence', 'set-context.request.yaml'), `$kind: http-request
name: Set Context
method: POST
url: '{{baseUrl}}/api/context'
order: 4000
headers:
  - key: Content-Type
    value: application/json
body:
  type: json
  content: |-
    {
      "context": {
        "currentProject": "Website Redesign",
        "focus": "marketing"
      }
    }
`);
}

// Collection 4: Briefcase & Files
function createBriefcaseFiles() {
  const collectionDir = path.join(COLLECTIONS_DIR, 'solosuccess-briefcase-files');
  ensureDir(collectionDir);
  ensureDir(path.join(collectionDir, '.resources'));
  ensureDir(path.join(collectionDir, 'briefcases'));
  ensureDir(path.join(collectionDir, 'briefcase-files'));
  ensureDir(path.join(collectionDir, 'unified-briefcase'));
  ensureDir(path.join(collectionDir, 'files'));

  writeYaml(path.join(collectionDir, '.resources', 'definition.yaml'), `$kind: collection
name: SoloSuccess - Briefcase & Files
description: |-
  File management, briefcases, and document storage.
  Most endpoints require authentication via session cookie or Bearer token.
variables:
  - key: baseUrl
    value: 'http://localhost:3000'
  - key: briefcaseId
    value: ''
  - key: fileId
    value: ''
  - key: versionId
    value: ''
`);

  // Briefcases folder
  ensureDir(path.join(collectionDir, 'briefcases', '.resources'));
  writeYaml(path.join(collectionDir, 'briefcases', '.resources', 'definition.yaml'), `$kind: collection
name: Briefcases
description: Briefcase management and organization
order: 1000
`);

  writeYaml(path.join(collectionDir, 'briefcases', 'list-briefcases.request.yaml'), `$kind: http-request
name: List Briefcases
method: GET
url: '{{baseUrl}}/api/briefcases'
order: 1000
queryParams:
  - key: category
    value: 'all'
    disabled: true
  - key: search
    value: ''
    disabled: true
  - key: limit
    value: '50'
    disabled: true
  - key: offset
    value: '0'
    disabled: true
`);

  writeYaml(path.join(collectionDir, 'briefcases', 'create-briefcase.request.yaml'), `$kind: http-request
name: Create Briefcase
method: POST
url: '{{baseUrl}}/api/briefcases'
order: 2000
headers:
  - key: Content-Type
    value: application/json
body:
  type: json
  content: |-
    {
      "title": "Q1 Marketing Campaign",
      "description": "All assets for Q1 marketing",
      "status": "active",
      "metadata": {
        "color": "#6366f1",
        "icon": "📁"
      }
    }
`);

  writeYaml(path.join(collectionDir, 'briefcases', 'upload-to-briefcase.request.yaml'), `$kind: http-request
name: Upload to Briefcase
method: POST
url: '{{baseUrl}}/api/briefcases/upload'
order: 3000
headers:
  - key: Content-Type
    value: multipart/form-data
body:
  type: formdata
  content:
    - key: file
      type: file
      value: ''
    - key: briefcaseId
      type: text
      value: '{{briefcaseId}}'
`);

  writeYaml(path.join(collectionDir, 'briefcases', 'update-briefcase-upload.request.yaml'), `$kind: http-request
name: Update Briefcase Upload
method: PUT
url: '{{baseUrl}}/api/briefcases/upload'
order: 4000
headers:
  - key: Content-Type
    value: application/json
body:
  type: json
  content: |-
    {
      "fileId": "{{fileId}}",
      "metadata": {
        "tags": ["important"]
      }
    }
`);

  writeYaml(path.join(collectionDir, 'briefcases', 'list-folders.request.yaml'), `$kind: http-request
name: List Folders
method: GET
url: '{{baseUrl}}/api/briefcases/folders'
order: 5000
`);

  writeYaml(path.join(collectionDir, 'briefcases', 'create-folder.request.yaml'), `$kind: http-request
name: Create Folder
method: POST
url: '{{baseUrl}}/api/briefcases/folders'
order: 6000
headers:
  - key: Content-Type
    value: application/json
body:
  type: json
  content: |-
    {
      "name": "Design Assets",
      "parentId": null,
      "color": "#10b981"
    }
`);

  writeYaml(path.join(collectionDir, 'briefcases', 'search-briefcases.request.yaml'), `$kind: http-request
name: Search Briefcases
method: POST
url: '{{baseUrl}}/api/briefcases/search'
order: 7000
headers:
  - key: Content-Type
    value: application/json
body:
  type: json
  content: |-
    {
      "query": "marketing strategy",
      "filters": {
        "category": "documents"
      }
    }
`);

  writeYaml(path.join(collectionDir, 'briefcases', 'get-search-suggestions.request.yaml'), `$kind: http-request
name: Get Search Suggestions
method: POST
url: '{{baseUrl}}/api/briefcases/search/suggestions'
order: 8000
headers:
  - key: Content-Type
    value: application/json
body:
  type: json
  content: |-
    {
      "query": "mark"
    }
`);

  writeYaml(path.join(collectionDir, 'briefcases', 'parse-content.request.yaml'), `$kind: http-request
name: Parse Content
method: POST
url: '{{baseUrl}}/api/briefcases/parse-content'
order: 9000
headers:
  - key: Content-Type
    value: application/json
body:
  type: json
  content: |-
    {
      "fileId": "{{fileId}}",
      "extractText": true
    }
`);

  writeYaml(path.join(collectionDir, 'briefcases', 'get-parsed-content.request.yaml'), `$kind: http-request
name: Get Parsed Content
method: GET
url: '{{baseUrl}}/api/briefcases/parse-content'
order: 10000
queryParams:
  - key: fileId
    value: '{{fileId}}'
`);

  // Briefcase Files folder
  ensureDir(path.join(collectionDir, 'briefcase-files', '.resources'));
  writeYaml(path.join(collectionDir, 'briefcase-files', '.resources', 'definition.yaml'), `$kind: collection
name: Briefcase Files
description: File version management
order: 2000
`);

  writeYaml(path.join(collectionDir, 'briefcase-files', 'get-file-version.request.yaml'), `$kind: http-request
name: Get File Version
method: GET
url: '{{baseUrl}}/api/briefcases/files/{{fileId}}/versions/{{versionId}}'
order: 1000
`);

  writeYaml(path.join(collectionDir, 'briefcase-files', 'create-file-version.request.yaml'), `$kind: http-request
name: Create File Version
method: POST
url: '{{baseUrl}}/api/briefcases/files/{{fileId}}/versions/{{versionId}}'
order: 2000
headers:
  - key: Content-Type
    value: application/json
body:
  type: json
  content: |-
    {
      "comment": "Updated with new content"
    }
`);

  writeYaml(path.join(collectionDir, 'briefcase-files', 'delete-file-version.request.yaml'), `$kind: http-request
name: Delete File Version
method: DELETE
url: '{{baseUrl}}/api/briefcases/files/{{fileId}}/versions/{{versionId}}'
order: 3000
`);

  // Unified Briefcase folder
  ensureDir(path.join(collectionDir, 'unified-briefcase', '.resources'));
  writeYaml(path.join(collectionDir, 'unified-briefcase', '.resources', 'definition.yaml'), `$kind: collection
name: Unified Briefcase
description: Unified briefcase view and management
order: 3000
`);

  writeYaml(path.join(collectionDir, 'unified-briefcase', 'get-unified-briefcase.request.yaml'), `$kind: http-request
name: Get Unified Briefcase
method: GET
url: '{{baseUrl}}/api/unified-briefcase'
order: 1000
`);

  writeYaml(path.join(collectionDir, 'unified-briefcase', 'update-unified-briefcase.request.yaml'), `$kind: http-request
name: Update Unified Briefcase
method: POST
url: '{{baseUrl}}/api/unified-briefcase'
order: 2000
headers:
  - key: Content-Type
    value: application/json
body:
  type: json
  content: |-
    {
      "settings": {
        "defaultView": "grid"
      }
    }
`);

  writeYaml(path.join(collectionDir, 'unified-briefcase', 'delete-unified-briefcase.request.yaml'), `$kind: http-request
name: Delete Unified Briefcase
method: DELETE
url: '{{baseUrl}}/api/unified-briefcase'
order: 3000
`);

  // Files folder
  ensureDir(path.join(collectionDir, 'files', '.resources'));
  writeYaml(path.join(collectionDir, 'files', '.resources', 'definition.yaml'), `$kind: collection
name: Files
description: General file operations
order: 4000
`);

  writeYaml(path.join(collectionDir, 'files', 'get-file.request.yaml'), `$kind: http-request
name: Get File
method: GET
url: '{{baseUrl}}/api/files/{{fileId}}'
order: 1000
`);

  writeYaml(path.join(collectionDir, 'files', 'delete-file.request.yaml'), `$kind: http-request
name: Delete File
method: DELETE
url: '{{baseUrl}}/api/files/{{fileId}}'
order: 2000
`);

  writeYaml(path.join(collectionDir, 'files', 'upload-file.request.yaml'), `$kind: http-request
name: Upload File
method: POST
url: '{{baseUrl}}/api/upload'
order: 3000
headers:
  - key: Content-Type
    value: multipart/form-data
body:
  type: formdata
  content:
    - key: file
      type: file
      value: ''
    - key: category
      type: text
      value: general
`);

  writeYaml(path.join(collectionDir, 'files', 'list-uploaded-files.request.yaml'), `$kind: http-request
name: List Uploaded Files
method: GET
url: '{{baseUrl}}/api/upload'
order: 4000
`);

  writeYaml(path.join(collectionDir, 'files', 'generate-logo.request.yaml'), `$kind: http-request
name: Generate Logo
method: POST
url: '{{baseUrl}}/api/generate-logo'
order: 5000
headers:
  - key: Content-Type
    value: application/json
body:
  type: json
  content: |-
    {
      "businessName": "My Startup",
      "style": "modern",
      "colors": ["#6366f1", "#10b981"]
    }
`);
}

// Collection 5: Alerts & Monitoring
function createAlertsMonitoring() {
  const collectionDir = path.join(COLLECTIONS_DIR, 'solosuccess-alerts-monitoring');
  ensureDir(collectionDir);
  ensureDir(path.join(collectionDir, '.resources'));
  ensureDir(path.join(collectionDir, 'alerts'));
  ensureDir(path.join(collectionDir, 'analytics'));
  ensureDir(path.join(collectionDir, 'scraping'));
  ensureDir(path.join(collectionDir, 'health'));
  ensureDir(path.join(collectionDir, 'guardian'));

  writeYaml(path.join(collectionDir, '.resources', 'definition.yaml'), `$kind: collection
name: SoloSuccess - Alerts & Monitoring
description: |-
  Alerts, notifications, analytics, scraping jobs, and system health.
  Most endpoints require authentication via session cookie or Bearer token.
variables:
  - key: baseUrl
    value: 'http://localhost:3000'
  - key: alertId
    value: ''
  - key: jobId
    value: ''
`);

  // Alerts folder
  ensureDir(path.join(collectionDir, 'alerts', '.resources'));
  writeYaml(path.join(collectionDir, 'alerts', '.resources', 'definition.yaml'), `$kind: collection
name: Alerts
description: Alert management and notifications
order: 1000
`);

  writeYaml(path.join(collectionDir, 'alerts', 'list-alerts.request.yaml'), `$kind: http-request
name: List Alerts
method: GET
url: '{{baseUrl}}/api/alerts'
order: 1000
queryParams:
  - key: competitorIds
    value: ''
    disabled: true
  - key: alertTypes
    value: ''
    disabled: true
  - key: severity
    value: 'info,warning,urgent,critical'
    disabled: true
  - key: isRead
    value: 'false'
    disabled: true
  - key: isArchived
    value: 'false'
    disabled: true
  - key: page
    value: '1'
    disabled: true
  - key: limit
    value: '20'
    disabled: true
`);

  writeYaml(path.join(collectionDir, 'alerts', 'create-alert.request.yaml'), `$kind: http-request
name: Create Alert
method: POST
url: '{{baseUrl}}/api/alerts'
order: 2000
headers:
  - key: Content-Type
    value: application/json
body:
  type: json
  content: |-
    {
      "competitorId": "competitor-id",
      "alertType": "pricing_change",
      "severity": "warning",
      "title": "Competitor lowered prices",
      "description": "Competitor X reduced prices by 20%",
      "sourceData": {},
      "actionItems": [],
      "recommendedActions": []
    }
`);

  writeYaml(path.join(collectionDir, 'alerts', 'get-alert.request.yaml'), `$kind: http-request
name: Get Alert
method: GET
url: '{{baseUrl}}/api/alerts/{{alertId}}'
order: 3000
`);

  writeYaml(path.join(collectionDir, 'alerts', 'update-alert.request.yaml'), `$kind: http-request
name: Update Alert
method: PUT
url: '{{baseUrl}}/api/alerts/{{alertId}}'
order: 4000
headers:
  - key: Content-Type
    value: application/json
body:
  type: json
  content: |-
    {
      "isRead": true
    }
`);

  writeYaml(path.join(collectionDir, 'alerts', 'delete-alert.request.yaml'), `$kind: http-request
name: Delete Alert
method: DELETE
url: '{{baseUrl}}/api/alerts/{{alertId}}'
order: 5000
`);

  writeYaml(path.join(collectionDir, 'alerts', 'acknowledge-alert.request.yaml'), `$kind: http-request
name: Acknowledge Alert
method: POST
url: '{{baseUrl}}/api/alerts/{{alertId}}/acknowledge'
order: 6000
`);

  writeYaml(path.join(collectionDir, 'alerts', 'archive-alert.request.yaml'), `$kind: http-request
name: Archive Alert
method: POST
url: '{{baseUrl}}/api/alerts/{{alertId}}/archive'
order: 7000
`);

  writeYaml(path.join(collectionDir, 'alerts', 'bulk-alert-action.request.yaml'), `$kind: http-request
name: Bulk Alert Action
method: POST
url: '{{baseUrl}}/api/alerts/bulk'
order: 8000
headers:
  - key: Content-Type
    value: application/json
body:
  type: json
  content: |-
    {
      "alertIds": ["alert-1", "alert-2"],
      "action": "archive"
    }
`);

  writeYaml(path.join(collectionDir, 'alerts', 'get-notifications.request.yaml'), `$kind: http-request
name: Get Notifications
method: GET
url: '{{baseUrl}}/api/alerts/notifications'
order: 9000
`);

  writeYaml(path.join(collectionDir, 'alerts', 'create-notification.request.yaml'), `$kind: http-request
name: Create Notification
method: POST
url: '{{baseUrl}}/api/alerts/notifications'
order: 10000
headers:
  - key: Content-Type
    value: application/json
body:
  type: json
  content: |-
    {
      "type": "alert",
      "title": "New competitor activity",
      "message": "Competitor launched new feature"
    }
`);

  // Analytics folder
  ensureDir(path.join(collectionDir, 'analytics', '.resources'));
  writeYaml(path.join(collectionDir, 'analytics', '.resources', 'definition.yaml'), `$kind: collection
name: Analytics
description: Dashboard and revenue analytics
order: 2000
`);

  writeYaml(path.join(collectionDir, 'analytics', 'get-dashboard.request.yaml'), `$kind: http-request
name: Get Dashboard
method: GET
url: '{{baseUrl}}/api/dashboard'
order: 1000
`);

  writeYaml(path.join(collectionDir, 'analytics', 'get-revenue-metrics.request.yaml'), `$kind: http-request
name: Get Revenue Metrics
method: GET
url: '{{baseUrl}}/api/revenue/metrics'
order: 2000
`);

  // Scraping folder
  ensureDir(path.join(collectionDir, 'scraping', '.resources'));
  writeYaml(path.join(collectionDir, 'scraping', '.resources', 'definition.yaml'), `$kind: collection
name: Scraping
description: Web scraping job management
order: 3000
`);

  writeYaml(path.join(collectionDir, 'scraping', 'get-scraping-metrics.request.yaml'), `$kind: http-request
name: Get Scraping Metrics
method: GET
url: '{{baseUrl}}/api/scraping/metrics'
order: 1000
`);

  writeYaml(path.join(collectionDir, 'scraping', 'get-scraping-failures.request.yaml'), `$kind: http-request
name: Get Scraping Failures
method: GET
url: '{{baseUrl}}/api/scraping/failures'
order: 2000
`);

  writeYaml(path.join(collectionDir, 'scraping', 'get-scraping-job.request.yaml'), `$kind: http-request
name: Get Scraping Job
method: GET
url: '{{baseUrl}}/api/scraping/jobs/{{jobId}}'
order: 3000
`);

  writeYaml(path.join(collectionDir, 'scraping', 'update-scraping-job.request.yaml'), `$kind: http-request
name: Update Scraping Job
method: PUT
url: '{{baseUrl}}/api/scraping/jobs/{{jobId}}'
order: 4000
headers:
  - key: Content-Type
    value: application/json
body:
  type: json
  content: |-
    {
      "status": "paused"
    }
`);

  writeYaml(path.join(collectionDir, 'scraping', 'delete-scraping-job.request.yaml'), `$kind: http-request
name: Delete Scraping Job
method: DELETE
url: '{{baseUrl}}/api/scraping/jobs/{{jobId}}'
order: 5000
`);

  // Health folder
  ensureDir(path.join(collectionDir, 'health', '.resources'));
  writeYaml(path.join(collectionDir, 'health', '.resources', 'definition.yaml'), `$kind: collection
name: Health
description: System health checks
order: 4000
`);

  writeYaml(path.join(collectionDir, 'health', 'health-check.request.yaml'), `$kind: http-request
name: Health Check
method: GET
url: '{{baseUrl}}/api/health'
order: 1000
`);

  writeYaml(path.join(collectionDir, 'health', 'health-deps.request.yaml'), `$kind: http-request
name: Health Dependencies
method: GET
url: '{{baseUrl}}/api/health/deps'
order: 2000
`);

  // Guardian folder
  ensureDir(path.join(collectionDir, 'guardian', '.resources'));
  writeYaml(path.join(collectionDir, 'guardian', '.resources', 'definition.yaml'), `$kind: collection
name: Guardian
description: Guardian AI monitoring
order: 5000
`);

  writeYaml(path.join(collectionDir, 'guardian', 'get-guardian-status.request.yaml'), `$kind: http-request
name: Get Guardian Status
method: GET
url: '{{baseUrl}}/api/guardian'
order: 1000
`);

  writeYaml(path.join(collectionDir, 'guardian', 'trigger-guardian.request.yaml'), `$kind: http-request
name: Trigger Guardian
method: POST
url: '{{baseUrl}}/api/guardian'
order: 2000
headers:
  - key: Content-Type
    value: application/json
body:
  type: json
  content: |-
    {
      "action": "scan",
      "targets": ["compliance", "security"]
    }
`);
}

// Collection 6: Community & Billing
function createCommunityBilling() {
  const collectionDir = path.join(COLLECTIONS_DIR, 'solosuccess-community-billing');
  ensureDir(collectionDir);
  ensureDir(path.join(collectionDir, '.resources'));
  ensureDir(path.join(collectionDir, 'opportunities'));
  ensureDir(path.join(collectionDir, 'wellness'));
  ensureDir(path.join(collectionDir, 'gamification'));
  ensureDir(path.join(collectionDir, 'billing'));
  ensureDir(path.join(collectionDir, 'compliance'));
  ensureDir(path.join(collectionDir, 'misc'));

  writeYaml(path.join(collectionDir, '.resources', 'definition.yaml'), `$kind: collection
name: SoloSuccess - Community & Billing
description: |-
  Community features, opportunities, wellness, gamification, billing, and compliance.
  Most endpoints require authentication via session cookie or Bearer token.
variables:
  - key: baseUrl
    value: 'http://localhost:3000'
  - key: opportunityId
    value: ''
  - key: actionId
    value: ''
`);

  // Opportunities folder
  ensureDir(path.join(collectionDir, 'opportunities', '.resources'));
  writeYaml(path.join(collectionDir, 'opportunities', '.resources', 'definition.yaml'), `$kind: collection
name: Opportunities
description: Business opportunity management
order: 1000
`);

  writeYaml(path.join(collectionDir, 'opportunities', 'get-opportunity.request.yaml'), `$kind: http-request
name: Get Opportunity
method: GET
url: '{{baseUrl}}/api/opportunities/{{opportunityId}}'
order: 1000
`);

  writeYaml(path.join(collectionDir, 'opportunities', 'update-opportunity.request.yaml'), `$kind: http-request
name: Update Opportunity
method: PUT
url: '{{baseUrl}}/api/opportunities/{{opportunityId}}'
order: 2000
headers:
  - key: Content-Type
    value: application/json
body:
  type: json
  content: |-
    {
      "status": "in_progress",
      "progress": 50,
      "notes": "Making good progress"
    }
`);

  writeYaml(path.join(collectionDir, 'opportunities', 'delete-opportunity.request.yaml'), `$kind: http-request
name: Delete Opportunity
method: DELETE
url: '{{baseUrl}}/api/opportunities/{{opportunityId}}'
order: 3000
`);

  writeYaml(path.join(collectionDir, 'opportunities', 'get-opportunity-metrics.request.yaml'), `$kind: http-request
name: Get Opportunity Metrics
method: GET
url: '{{baseUrl}}/api/opportunities/{{opportunityId}}/metrics'
order: 4000
`);

  writeYaml(path.join(collectionDir, 'opportunities', 'create-opportunity-metrics.request.yaml'), `$kind: http-request
name: Create Opportunity Metrics
method: POST
url: '{{baseUrl}}/api/opportunities/{{opportunityId}}/metrics'
order: 5000
headers:
  - key: Content-Type
    value: application/json
body:
  type: json
  content: |-
    {
      "metricType": "revenue",
      "value": 10000,
      "period": "monthly"
    }
`);

  writeYaml(path.join(collectionDir, 'opportunities', 'update-opportunity-metrics.request.yaml'), `$kind: http-request
name: Update Opportunity Metrics
method: PUT
url: '{{baseUrl}}/api/opportunities/{{opportunityId}}/metrics'
order: 6000
headers:
  - key: Content-Type
    value: application/json
body:
  type: json
  content: |-
    {
      "metricId": "metric-id",
      "value": 15000
    }
`);

  writeYaml(path.join(collectionDir, 'opportunities', 'get-opportunity-action.request.yaml'), `$kind: http-request
name: Get Opportunity Action
method: GET
url: '{{baseUrl}}/api/opportunities/{{opportunityId}}/actions/{{actionId}}'
order: 7000
`);

  writeYaml(path.join(collectionDir, 'opportunities', 'update-opportunity-action.request.yaml'), `$kind: http-request
name: Update Opportunity Action
method: PUT
url: '{{baseUrl}}/api/opportunities/{{opportunityId}}/actions/{{actionId}}'
order: 8000
headers:
  - key: Content-Type
    value: application/json
body:
  type: json
  content: |-
    {
      "status": "completed"
    }
`);

  writeYaml(path.join(collectionDir, 'opportunities', 'delete-opportunity-action.request.yaml'), `$kind: http-request
name: Delete Opportunity Action
method: DELETE
url: '{{baseUrl}}/api/opportunities/{{opportunityId}}/actions/{{actionId}}'
order: 9000
`);

  // Wellness folder
  ensureDir(path.join(collectionDir, 'wellness', '.resources'));
  writeYaml(path.join(collectionDir, 'wellness', '.resources', 'definition.yaml'), `$kind: collection
name: Wellness
description: Wellness tracking and focus management
order: 2000
`);

  writeYaml(path.join(collectionDir, 'wellness', 'get-wellness-stats.request.yaml'), `$kind: http-request
name: Get Wellness Stats
method: GET
url: '{{baseUrl}}/api/wellness'
order: 1000
`);

  writeYaml(path.join(collectionDir, 'wellness', 'log-mood.request.yaml'), `$kind: http-request
name: Log Mood
method: POST
url: '{{baseUrl}}/api/wellness/mood'
order: 2000
headers:
  - key: Content-Type
    value: application/json
body:
  type: json
  content: |-
    {
      "energyLevel": 4,
      "moodLabel": "productive",
      "note": "Feeling great today!"
    }
`);

  writeYaml(path.join(collectionDir, 'wellness', 'log-focus.request.yaml'), `$kind: http-request
name: Log Focus Session
method: POST
url: '{{baseUrl}}/api/wellness/focus'
order: 3000
headers:
  - key: Content-Type
    value: application/json
body:
  type: json
  content: |-
    {
      "durationMinutes": 45,
      "taskDescription": "Working on marketing strategy"
    }
`);

  // Gamification folder
  ensureDir(path.join(collectionDir, 'gamification', '.resources'));
  writeYaml(path.join(collectionDir, 'gamification', '.resources', 'definition.yaml'), `$kind: collection
name: Gamification
description: Badges and achievements
order: 3000
`);

  writeYaml(path.join(collectionDir, 'gamification', 'get-badges.request.yaml'), `$kind: http-request
name: Get Badges
method: GET
url: '{{baseUrl}}/api/gamification/badges'
order: 1000
`);

  writeYaml(path.join(collectionDir, 'gamification', 'seed-gamification.request.yaml'), `$kind: http-request
name: Seed Gamification Data
method: POST
url: '{{baseUrl}}/api/gamification/seed'
order: 2000
`);

  // Billing folder
  ensureDir(path.join(collectionDir, 'billing', '.resources'));
  writeYaml(path.join(collectionDir, 'billing', '.resources', 'definition.yaml'), `$kind: collection
name: Billing & Stripe
description: Billing and payment processing
order: 4000
`);

  writeYaml(path.join(collectionDir, 'billing', 'stripe-webhook.request.yaml'), `$kind: http-request
name: Stripe Webhook
method: POST
url: '{{baseUrl}}/api/webhooks/stripe'
order: 1000
headers:
  - key: Content-Type
    value: application/json
  - key: stripe-signature
    value: ''
body:
  type: json
  content: |-
    {
      "type": "checkout.session.completed",
      "data": {
        "object": {}
      }
    }
`);

  // Compliance folder
  ensureDir(path.join(collectionDir, 'compliance', '.resources'));
  writeYaml(path.join(collectionDir, 'compliance', '.resources', 'definition.yaml'), `$kind: collection
name: Compliance
description: Compliance scanning and policy management
order: 5000
`);

  writeYaml(path.join(collectionDir, 'compliance', 'scan-compliance.request.yaml'), `$kind: http-request
name: Scan Compliance
method: POST
url: '{{baseUrl}}/api/compliance/scan'
order: 1000
headers:
  - key: Content-Type
    value: application/json
body:
  type: json
  content: |-
    {
      "url": "https://example.com",
      "userId": "user-id"
    }
`);

  writeYaml(path.join(collectionDir, 'compliance', 'create-policy.request.yaml'), `$kind: http-request
name: Create Policy
method: POST
url: '{{baseUrl}}/api/compliance/policies'
order: 2000
headers:
  - key: Content-Type
    value: application/json
body:
  type: json
  content: |-
    {
      "name": "Privacy Policy",
      "type": "privacy",
      "content": "..."
    }
`);

  writeYaml(path.join(collectionDir, 'compliance', 'get-consent.request.yaml'), `$kind: http-request
name: Get Consent Status
method: GET
url: '{{baseUrl}}/api/compliance/consent'
order: 3000
`);

  writeYaml(path.join(collectionDir, 'compliance', 'record-consent.request.yaml'), `$kind: http-request
name: Record Consent
method: POST
url: '{{baseUrl}}/api/compliance/consent'
order: 4000
headers:
  - key: Content-Type
    value: application/json
body:
  type: json
  content: |-
    {
      "consentType": "marketing",
      "granted": true
    }
`);

  // Misc folder
  ensureDir(path.join(collectionDir, 'misc', '.resources'));
  writeYaml(path.join(collectionDir, 'misc', '.resources', 'definition.yaml'), `$kind: collection
name: Misc
description: Miscellaneous endpoints
order: 6000
`);

  writeYaml(path.join(collectionDir, 'misc', 'contact.request.yaml'), `$kind: http-request
name: Submit Contact Form
method: POST
url: '{{baseUrl}}/api/contact'
order: 1000
headers:
  - key: Content-Type
    value: application/json
body:
  type: json
  content: |-
    {
      "name": "John Doe",
      "email": "john@example.com",
      "message": "I have a question about..."
    }
`);

  writeYaml(path.join(collectionDir, 'misc', 'feedback.request.yaml'), `$kind: http-request
name: Submit Feedback
method: POST
url: '{{baseUrl}}/api/feedback'
order: 2000
headers:
  - key: Content-Type
    value: application/json
body:
  type: json
  content: |-
    {
      "type": "feature_request",
      "message": "It would be great if...",
      "rating": 5
    }
`);

  writeYaml(path.join(collectionDir, 'misc', 'track-event.request.yaml'), `$kind: http-request
name: Track Event
method: POST
url: '{{baseUrl}}/api/events'
order: 3000
headers:
  - key: Content-Type
    value: application/json
body:
  type: json
  content: |-
    {
      "event": "button_click",
      "properties": {
        "button": "signup",
        "page": "landing"
      }
    }
`);

  writeYaml(path.join(collectionDir, 'misc', 'test-ai.request.yaml'), `$kind: http-request
name: Test AI
method: GET
url: '{{baseUrl}}/api/test-ai'
order: 4000
`);

  writeYaml(path.join(collectionDir, 'misc', 'seed-academy.request.yaml'), `$kind: http-request
name: Seed Academy
method: POST
url: '{{baseUrl}}/api/seed-academy'
order: 5000
`);
}

// Main execution
console.log('Creating Postman collections for SoloSuccess AI...\n');

createAuthUserCollection();
console.log('\n✓ Created: SoloSuccess - Auth & User\n');

createCoreFeatures();
console.log('\n✓ Created: SoloSuccess - Core Features\n');

createAIIntelligence();
console.log('\n✓ Created: SoloSuccess - AI & Intelligence\n');

createBriefcaseFiles();
console.log('\n✓ Created: SoloSuccess - Briefcase & Files\n');

createAlertsMonitoring();
console.log('\n✓ Created: SoloSuccess - Alerts & Monitoring\n');

createCommunityBilling();
console.log('\n✓ Created: SoloSuccess - Community & Billing\n');

console.log('All collections created successfully!');
