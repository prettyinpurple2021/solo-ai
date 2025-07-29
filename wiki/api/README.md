# API Documentation

## 🔌 API Overview

SoloBoss AI Platform provides a comprehensive REST API built with Next.js API routes, offering secure access to all platform features including AI chat, task management, analytics, and user data.

## 🏗️ API Architecture

### Base URL
- **Development**: `http://localhost:3000/api`
- **Production**: `https://your-domain.com/api`

### Response Format
All API responses follow a consistent format:

```typescript
// Success Response
{
  "success": true,
  "data": any,
  "message": string,
  "timestamp": string
}

// Error Response
{
  "success": false,
  "error": {
    "code": string,
    "message": string,
    "details": any
  },
  "timestamp": string
}
```

## 🔐 Authentication

### JWT Bearer Token Authentication

All protected endpoints require a valid JWT token in the Authorization header:

```bash
Authorization: Bearer <your-jwt-token>
```

### Getting an Access Token

```typescript
// Login endpoint
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "securepassword"
}

// Response
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe"
    },
    "access_token": "jwt-token",
    "refresh_token": "refresh-token"
  }
}
```

### Token Refresh

```typescript
POST /api/auth/refresh
{
  "refresh_token": "your-refresh-token"
}
```

## 🤖 AI Chat API

### Chat with AI Agents

Create conversations with specialized AI agents (Roxy, Blaze, Echo, Sage).

#### Start a Chat Session

```typescript
POST /api/chat
Authorization: Bearer <token>
Content-Type: application/json

{
  "agent": "roxy" | "blaze" | "echo" | "sage",
  "message": "Hello, I need help with my brand strategy",
  "context": {
    "previousMessages": [],
    "userProfile": {},
    "sessionData": {}
  }
}
```

#### Response

```typescript
{
  "success": true,
  "data": {
    "response": "Hello! I'm Roxy, your Creative Strategist...",
    "agent": "roxy",
    "session_id": "uuid",
    "usage": {
      "tokens": 150,
      "cost": 0.002
    }
  }
}
```

#### Streaming Responses

For real-time chat experiences:

```typescript
POST /api/chat/stream
Authorization: Bearer <token>
Content-Type: application/json

{
  "agent": "blaze",
  "message": "Help me plan my day",
  "stream": true
}

// Response: Server-Sent Events (SSE)
data: {"type": "start", "session_id": "uuid"}
data: {"type": "token", "content": "Good"}
data: {"type": "token", "content": " morning!"}
data: {"type": "end", "usage": {"tokens": 45}}
```

#### Chat History

```typescript
GET /api/chat/history?agent=roxy&limit=50&offset=0
Authorization: Bearer <token>

// Response
{
  "success": true,
  "data": {
    "conversations": [
      {
        "id": "uuid",
        "agent": "roxy",
        "messages": [
          {
            "role": "user",
            "content": "Help me with branding",
            "timestamp": "2024-01-01T12:00:00Z"
          },
          {
            "role": "assistant",
            "content": "I'd be happy to help...",
            "timestamp": "2024-01-01T12:00:05Z"
          }
        ],
        "created_at": "2024-01-01T12:00:00Z"
      }
    ],
    "total": 10,
    "has_more": false
  }
}
```

## 📋 Task Management API (Slaylist)

### Create Task

```typescript
POST /api/tasks
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Complete project proposal",
  "description": "Finish the Q1 project proposal for client",
  "priority": "high" | "medium" | "low",
  "deadline": "2024-02-01T09:00:00Z",
  "category": "work",
  "tags": ["client", "proposal", "urgent"],
  "estimated_duration": 120, // minutes
  "energy_level": "high" | "medium" | "low"
}
```

### Get Tasks

```typescript
GET /api/tasks?status=pending&priority=high&limit=20&offset=0
Authorization: Bearer <token>

// Response
{
  "success": true,
  "data": {
    "tasks": [
      {
        "id": "uuid",
        "title": "Complete project proposal",
        "description": "Finish the Q1 project proposal for client",
        "status": "pending" | "in_progress" | "completed" | "archived",
        "priority": "high",
        "deadline": "2024-02-01T09:00:00Z",
        "created_at": "2024-01-15T10:00:00Z",
        "updated_at": "2024-01-15T10:00:00Z",
        "completed_at": null,
        "category": "work",
        "tags": ["client", "proposal", "urgent"],
        "estimated_duration": 120,
        "actual_duration": null,
        "energy_level": "high"
      }
    ],
    "total": 5,
    "has_more": false
  }
}
```

### Update Task

```typescript
PATCH /api/tasks/[id]
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "completed",
  "actual_duration": 90,
  "notes": "Completed ahead of schedule"
}
```

### Delete Task

```typescript
DELETE /api/tasks/[id]
Authorization: Bearer <token>
```

## ⏰ Focus Sessions API

### Start Focus Session

```typescript
POST /api/focus/sessions
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "work" | "short_break" | "long_break",
  "duration": 25, // minutes
  "task_id": "uuid", // optional
  "goal": "Complete proposal section 1"
}
```

### Get Active Session

```typescript
GET /api/focus/sessions/active
Authorization: Bearer <token>

// Response
{
  "success": true,
  "data": {
    "session": {
      "id": "uuid",
      "type": "work",
      "duration": 25,
      "remaining": 1200, // seconds
      "started_at": "2024-01-15T14:00:00Z",
      "status": "active" | "paused" | "completed",
      "task_id": "uuid",
      "goal": "Complete proposal section 1"
    }
  }
}
```

### Update Session (Pause/Resume/Complete)

```typescript
PATCH /api/focus/sessions/[id]
Authorization: Bearer <token>
Content-Type: application/json

{
  "action": "pause" | "resume" | "complete",
  "notes": "Great focus session!"
}
```

### Focus Statistics

```typescript
GET /api/focus/stats?period=week&start_date=2024-01-01
Authorization: Bearer <token>

// Response
{
  "success": true,
  "data": {
    "total_sessions": 25,
    "total_focus_time": 600, // minutes
    "average_session_length": 24,
    "completion_rate": 0.85,
    "daily_breakdown": [
      {
        "date": "2024-01-15",
        "sessions": 4,
        "focus_time": 95,
        "breaks": 3
      }
    ],
    "productivity_score": 8.5
  }
}
```

## 📊 Analytics API

### Dashboard Analytics

```typescript
GET /api/analytics/dashboard?period=month
Authorization: Bearer <token>

// Response
{
  "success": true,
  "data": {
    "productivity_metrics": {
      "focus_time": 1200, // minutes this month
      "tasks_completed": 45,
      "sessions_completed": 89,
      "productivity_score": 8.2
    },
    "trends": {
      "focus_time_trend": 0.15, // 15% increase
      "task_completion_trend": -0.05, // 5% decrease
      "consistency_score": 7.8
    },
    "goals": {
      "monthly_focus_target": 2000,
      "monthly_focus_actual": 1200,
      "completion_percentage": 0.6
    }
  }
}
```

### Detailed Analytics

```typescript
GET /api/analytics/detailed?metric=focus_time&period=week&granularity=day
Authorization: Bearer <token>

// Response
{
  "success": true,
  "data": {
    "metric": "focus_time",
    "period": "week",
    "data_points": [
      {
        "date": "2024-01-15",
        "value": 120,
        "sessions": 5
      }
    ],
    "summary": {
      "total": 600,
      "average": 85.7,
      "peak": 140,
      "trend": 0.12
    }
  }
}
```

## 👤 User Profile API

### Get Profile

```typescript
GET /api/profile
Authorization: Bearer <token>

// Response
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "avatar_url": "https://...",
    "subscription": {
      "plan": "pro",
      "status": "active",
      "expires_at": "2024-12-31T23:59:59Z"
    },
    "preferences": {
      "focus_duration": 25,
      "break_duration": 5,
      "long_break_duration": 15,
      "notification_settings": {
        "email": true,
        "push": true,
        "session_reminders": true
      },
      "theme": "dark" | "light" | "system"
    },
    "stats": {
      "total_focus_time": 12000,
      "total_sessions": 500,
      "streak_days": 15,
      "level": 12,
      "experience_points": 2500
    }
  }
}
```

### Update Profile

```typescript
PATCH /api/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Smith",
  "preferences": {
    "focus_duration": 30,
    "theme": "dark"
  }
}
```

### Upload Avatar

```typescript
POST /api/profile/avatar
Authorization: Bearer <token>
Content-Type: multipart/form-data

FormData:
- file: [image file]
```

## 🎯 Brand Management API

### Brand Assets

```typescript
GET /api/brand/assets
Authorization: Bearer <token>

// Response
{
  "success": true,
  "data": {
    "logos": [
      {
        "id": "uuid",
        "name": "Primary Logo",
        "url": "https://...",
        "format": "svg",
        "size": 2048
      }
    ],
    "colors": [
      {
        "id": "uuid",
        "name": "Primary",
        "hex": "#8B5CF6",
        "rgb": [139, 92, 246]
      }
    ],
    "fonts": [
      {
        "id": "uuid",
        "name": "Inter",
        "family": "sans-serif",
        "weights": [400, 500, 600, 700]
      }
    ]
  }
}
```

### Upload Brand Asset

```typescript
POST /api/brand/assets
Authorization: Bearer <token>
Content-Type: multipart/form-data

FormData:
- file: [file]
- type: "logo" | "image" | "document"
- name: "Brand Guidelines"
- category: "primary" | "secondary"
```

## 🏆 Gamification API

### User Achievements

```typescript
GET /api/gamification/achievements
Authorization: Bearer <token>

// Response
{
  "success": true,
  "data": {
    "achievements": [
      {
        "id": "uuid",
        "name": "Focus Master",
        "description": "Complete 100 focus sessions",
        "icon": "🎯",
        "category": "focus",
        "rarity": "rare",
        "unlocked": true,
        "unlocked_at": "2024-01-10T15:30:00Z",
        "progress": {
          "current": 100,
          "target": 100
        }
      }
    ],
    "total_points": 2500,
    "level": 12,
    "next_level_points": 2750
  }
}
```

### Leaderboard

```typescript
GET /api/gamification/leaderboard?type=weekly&metric=focus_time
Authorization: Bearer <token>

// Response
{
  "success": true,
  "data": {
    "leaderboard": [
      {
        "rank": 1,
        "user": {
          "id": "uuid",
          "name": "Jane Doe",
          "avatar": "https://..."
        },
        "score": 1200,
        "metric": "focus_time"
      }
    ],
    "user_rank": 5,
    "user_score": 800
  }
}
```

## 🔄 Webhooks API

### Stripe Webhooks

```typescript
POST /api/webhooks/stripe
Content-Type: application/json
Stripe-Signature: [signature]

// Handles subscription events
{
  "type": "customer.subscription.updated",
  "data": {
    "object": {
      // Stripe subscription object
    }
  }
}
```

### Custom Webhooks

```typescript
POST /api/webhooks/custom
Authorization: Bearer <token>
Content-Type: application/json

{
  "event": "task.completed",
  "data": {
    "task_id": "uuid",
    "user_id": "uuid",
    "completion_time": "2024-01-15T16:30:00Z"
  }
}
```

## ❌ Error Codes

| Code | Description | HTTP Status |
|------|-------------|-------------|
| `AUTH_REQUIRED` | Authentication required | 401 |
| `AUTH_INVALID` | Invalid authentication token | 401 |
| `AUTH_EXPIRED` | Authentication token expired | 401 |
| `FORBIDDEN` | Insufficient permissions | 403 |
| `NOT_FOUND` | Resource not found | 404 |
| `VALIDATION_ERROR` | Request validation failed | 400 |
| `RATE_LIMITED` | Too many requests | 429 |
| `SERVER_ERROR` | Internal server error | 500 |
| `SERVICE_UNAVAILABLE` | External service unavailable | 503 |

## 📊 Rate Limiting

| Endpoint | Rate Limit | Window |
|----------|------------|---------|
| `/api/auth/*` | 10 requests | 1 minute |
| `/api/chat/*` | 60 requests | 1 hour |
| `/api/tasks/*` | 100 requests | 1 hour |
| `/api/focus/*` | 120 requests | 1 hour |
| `/api/profile/*` | 50 requests | 1 hour |
| Default | 1000 requests | 1 hour |

## 🧪 Testing the API

### Using cURL

```bash
# Get user profile
curl -X GET "http://localhost:3000/api/profile" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"

# Create a task
curl -X POST "http://localhost:3000/api/tasks" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Task",
    "priority": "medium",
    "category": "work"
  }'
```

### Using Postman

Import our Postman collection:
```json
{
  "info": {
    "name": "SoloBoss AI Platform API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "auth": {
    "type": "bearer",
    "bearer": [
      {
        "key": "token",
        "value": "{{ACCESS_TOKEN}}",
        "type": "string"
      }
    ]
  }
}
```

### SDKs and Client Libraries

#### JavaScript/TypeScript

```typescript
// Install the SDK
npm install @soloboss/api-sdk

// Initialize the client
import { SoloBossAPI } from '@soloboss/api-sdk'

const api = new SoloBossAPI({
  baseURL: 'https://your-domain.com/api',
  apiKey: 'your-api-key'
})

// Use the API
const profile = await api.profile.get()
const tasks = await api.tasks.list({ status: 'pending' })
```

#### Python

```python
# Install the SDK
pip install soloboss-api

# Use the API
from soloboss import SoloBossAPI

api = SoloBossAPI(
    base_url='https://your-domain.com/api',
    api_key='your-api-key'
)

profile = api.profile.get()
tasks = api.tasks.list(status='pending')
```

## 📝 API Versioning

Current API version: `v1`

Version headers:
```
API-Version: v1
Accept: application/vnd.soloboss.v1+json
```

Future versions will be backward compatible with deprecation notices.

---

For more detailed examples and integration guides, see our [Integration Examples](./integration-examples.md) documentation.