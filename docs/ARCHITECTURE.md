# Architecture Overview

## 🏗️ System Architecture

SoloSuccess AI Platform is built as a modern, scalable web application using a sophisticated architecture designed for performance, maintainability, and extensibility.

## 📊 High-Level Architecture

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│                 │    │                 │    │                 │
│   Next.js App   │────│   Express API   │────│   AI Services   │
│   (Frontend)    │    │   (Backend)     │    │   (OpenAI, etc) │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│                 │    │                 │    │                 │
│   Vercel        │    │   Neon DB       │    │   External APIs │
│   (Hosting)     │    │   (PostgreSQL)  │    │   (Stripe, etc) │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘

## 🎯 Core Design Principles

### 1. **Component-Driven Architecture**

- Modular, reusable components built with React and Radix UI
- Clear separation of concerns between UI, business logic, and data
- Consistent design system with Tailwind CSS

### 2. **Server-Side First**

- Next.js App Router for optimal performance and SEO
- Server-side rendering (SSR) for critical pages
- API routes for backend functionality

### 3. **Real-Time Capabilities**

- **Socket.IO** for bi-directional event-based communication
- **Redis (Upstash)** for pub/sub messaging and state management
- Optimistic UI updates for better user experience
- WebSocket connections for chat and collaboration features

### 4. **AI-First Design**

- Integration with multiple AI providers (OpenAI, Anthropic, Google)
- Personality system for AI agents
- Context-aware AI responses and recommendations

## 🏛️ Application Layers

### 1. Presentation Layer

**Location**: `/app`, `/components`

- **Next.js App Router**: Modern routing with layouts and nested routes
- **React Components**: Functional components with hooks
- **UI Components**: Radix UI primitives with custom styling
- **Responsive Design**: Mobile-first approach with Tailwind CSS

```typescript
// Example component structure
components/
├── ui/              # Base UI components (Button, Input, etc.)
├── auth/            # Authentication components
├── dashboard/       # Dashboard-specific components
├── shared/          # Shared across multiple features
└── features/        # Feature-specific components
```

### 2. Business Logic Layer

**Location**: `/server`, `/lib`, `/hooks`

- **Express Server**: Dedicated backend handling detailed business logic
- **Shared Foundation Layer**: Standardized schemas and type definitions in `lib/shared/` ([Details](./shared-library.md))
- **Custom Hooks**: Reusable state logic and side effects
- **Utility Functions**: Helper functions and business rules
- **State Management**: Context API and local component state
- **Type Definitions**: TypeScript interfaces and types

```typescript
// Example service structure
server/
├── routes/          # API Route definitions
├── db/              # Database connection and schema
├── utils/           # Backend utilities
└── index.ts         # Server entry point
```

### 3. Data Layer

**Location**: `/server/db`, Neon, Upstash

- **Neon (PostgreSQL)**: Serves as the primary relational database
- **Drizzle ORM**: TypeScript ORM for type-safe database interactions
- **Upstash Redis**: Used for caching and real-time pub/sub
- **Data Validation**: Zod schemas for type-safe data validation

### 4. External Integrations

- **AI Services**: OpenAI, Anthropic, Google AI
- **Authentication**: Custom Auth (JWT/Bcrypt) / Stack Auth
- **Pricing Display**: Marketing-focused pricing tiers
- **Email**: Resend for transactional emails

## 🔄 Data Flow

### 1. User Interaction Flow

User Action → Component → Hook/Service → Express API → Drizzle ORM → Neon DB
                ↓
            UI Update ← State Update ← Response ← JSON ← Query Result

### 2. Real-Time Updates

```text
Database/Event → Socket.IO Server → Redis Pub/Sub → Connected Clients → UI Update
```

### 3. AI Processing Flow

```text
User Input → Context Building → AI Service → Response Processing → UI Display
```

## 🛡️ Security Architecture

### Authentication & Authorization

- **JWT Tokens**: Secure token-based authentication
- **Middleware Protection**: Express middleware for route validation
- **Role-Based Access**: User roles and permissions
- **Session Management**: Secure session handling via Redis/JWT

### Data Protection

- **Encryption**: Data encryption at rest and in transit
- **Input Validation**: Comprehensive input sanitization
- **Rate Limiting**: API rate limiting and abuse prevention
- **CORS Configuration**: Proper cross-origin request handling

## 📱 Responsive Design Architecture

### Mobile-First Approach

- **Tailwind CSS**: Utility-first CSS framework
- **Responsive Breakpoints**: Mobile, tablet, desktop, and large screens
- **Touch-Friendly**: Optimized for touch interactions
- **Performance**: Optimized bundle sizes and loading strategies

### Progressive Web App Features

- **Service Workers**: Offline functionality and caching
- **App Manifest**: Native app-like experience
- **Push Notifications**: Real-time notifications (planned)

## 🚀 Performance Architecture

### Frontend Optimization

- **Code Splitting**: Dynamic imports and lazy loading
- **Image Optimization**: Next.js Image component
- **Bundle Analysis**: Webpack bundle analyzer integration
- **Caching Strategies**: Browser caching and CDN optimization

### Backend Optimization

- **Database Indexing**: Optimized database queries
- **Connection Pooling**: Efficient database connections
- **Caching Layers**: Redis for session and data caching (optional)
- **Serverless Functions**: Edge functions for global performance

## 🔧 Development Architecture

### Build System

- **TypeScript**: Type-safe development
- **ESLint**: Code quality and consistency
- **Prettier**: Code formatting
- **Husky**: Git hooks for quality gates

### Testing Strategy

- **Unit Tests**: Component and function testing
- **Integration Tests**: API and database testing
- **E2E Tests**: Full user journey testing
- **Type Safety**: Compile-time error prevention

## 🌐 Deployment Architecture

### Production Infrastructure

- **Hosting Platform**: Compatible with any modern hosting service
- **CDN**: Global content delivery network  
- **Serverless Functions**: Edge functions for performance
- **Automatic Scaling**: Serverless auto-scaling

### CI/CD Pipeline

```text
GitHub Push → CI/CD Pipeline → Type Check → Lint → Deploy → Live
```

## 📈 Monitoring & Observability

### Application Monitoring

- **Error Tracking**: Real-time error monitoring
- **Performance Metrics**: Core Web Vitals tracking
- **User Analytics**: Usage patterns and behavior
- **Uptime Monitoring**: Service availability tracking

### Logging Strategy

- **Structured Logging**: JSON-formatted logs
- **Error Logging**: Comprehensive error tracking
- **Audit Logging**: User action tracking
- **Performance Logging**: Request timing and metrics

## 🔮 Future Architecture Considerations

### Scalability Plans

- **Microservices**: Potential service decomposition
- **Database Sharding**: Horizontal scaling strategies
- **Event-Driven Architecture**: Asynchronous processing
- **Multi-Region**: Global deployment strategy

### Technology Evolution

- **New Frameworks**: React Server Components adoption
- **AI Advancements**: Next-generation AI integrations
- **Performance**: Continuous optimization strategies
- **Security**: Evolving security measures

---

This architecture is designed to be:

- **Scalable**: Handle growing user base and features
- **Maintainable**: Easy to understand and modify
- **Performant**: Fast loading and responsive experience
- **Secure**: Robust security measures throughout
- **Extensible**: Easy to add new features and integrations
# Technology Stack

## 🚀 Core Technologies

SoloSuccess AI Platform is built using modern, production-ready technologies that prioritize performance, developer experience, and scalability.

## 🎯 Frontend Stack

### **Next.js 15.2.4**

- **App Router**: Modern routing with layouts, nested routes, and streaming
- **Server Components**: Server-side rendering for optimal performance
- **API Routes**: Full-stack capabilities with serverless functions
- **Image Optimization**: Automatic image optimization and WebP conversion
- **Font Optimization**: Automatic font optimization with Google Fonts

**Why Next.js?**

- Industry-leading React framework with excellent DX
- Built-in performance optimizations
- Seamless full-stack development
- Excellent deployment story

### **React 19**

- **Functional Components**: Modern React with hooks
- **Concurrent Features**: Concurrent rendering and suspense
- **Server Components**: React Server Components for better performance
- **Automatic Batching**: Improved performance with automatic batching

**Key React Patterns Used:**

```typescript
// Custom hooks for state management
export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  // Authentication logic
}

// Server components for data fetching
export default async function DashboardPage() {
  const data = await fetchDashboardData()
  return <DashboardView data={data} />
}
```

### **TypeScript 5+**

- **Type Safety**: Compile-time error prevention
- **Developer Experience**: Excellent IDE support with IntelliSense
- **Code Quality**: Better refactoring and maintainability
- **Strict Mode**: Enhanced type checking for reliability

**TypeScript Configuration:**

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true
  }
}
```

## 🎨 Styling & UI Framework

### **Tailwind CSS 3.4+**

- **Utility-First**: Rapid UI development with utility classes
- **Responsive Design**: Mobile-first responsive breakpoints
- **Custom Design System**: SoloSuccess-specific color palette and components
- **Dark Mode**: Built-in dark mode support
- **JIT Compilation**: Just-in-time compilation for optimal bundle size

**Custom Theme Configuration:**

```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        'SoloSuccess-purple': '#8B5CF6',
        'SoloSuccess-pink': '#EC4899',
        'SoloSuccess-gradient': 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)'
      }
    }
  }
}
```

### **Radix UI Primitives**

- **Accessible Components**: WAI-ARIA compliant UI primitives
- **Unstyled**: Full control over styling with Tailwind
- **Composable**: Build complex components from simple primitives
- **Keyboard Navigation**: Full keyboard accessibility support

**Component Examples:**

- Dialog, Dropdown Menu, Tooltip, Select
- Accordion, Tabs, Radio Group, Checkbox
- Progress, Slider, Switch, Toggle

### **Framer Motion 12+**

- **Smooth Animations**: High-performance animations
- **Gesture Support**: Touch and mouse gesture handling
- **Layout Animations**: Automatic layout transition animations
- **Scroll-Based Animations**: Scroll-triggered animations

## 🗄️ Backend & Database

### **PostgreSQL Database**

- **Robust Relational Database**: ACID compliance
- **Scalable**: Can handle large amounts of data and users
- **Extensible**: Supports a wide range of extensions

### **Authentication**

- **Secure Authentication**: Built-in auth with social providers and magic links
- **Session Management**: Secure cookie handling for sessions

## 🤖 AI & Machine Learning

### **AI SDK**

- **Provider Agnostic**: Support for multiple AI providers
- **Streaming Responses**: Real-time AI response streaming
- **Type Safety**: TypeScript support for AI interactions
- **React Integration**: Seamless React hooks for AI features

### **OpenAI GPT Models**

- **GPT-4**: Advanced reasoning and code generation
- **GPT-3.5-turbo**: Fast responses for real-time chat
- **Embeddings**: Text embeddings for semantic search
- **Function Calling**: Structured AI responses with tools

### **Anthropic Claude**

- **Claude-3**: Advanced reasoning and analysis
- **Constitutional AI**: Safer and more helpful AI responses
- **Long Context**: Extended context window for complex tasks

### **Google AI (Gemini)**

- **Gemini Pro**: Google's advanced language model
- **Multimodal**: Text and image understanding capabilities
- **Integration**: Through AI SDK for consistent interface

## 💰 Subscription & Pricing

### **Display-Only Pricing Tiers**

- **Marketing Presentation**: Three-tier pricing structure
- **Feature Comparison**: Launch, Accelerator, and Dominator plans
- **No Payment Processing**: Payment system removed from codebase

## 📧 Communication & Email

### **Resend**

- **Transactional Emails**: Reliable email delivery
- **React Email Templates**: Build emails with React components
- **Analytics**: Email delivery and engagement tracking
- **API Integration**: Simple API for sending emails

## 🛠️ Development Tools

### **Package Management: pnpm**

- **Fast Installation**: Faster than npm/yarn
- **Disk Efficiency**: Shared dependencies across projects
- **Strict**: Prevents phantom dependencies
- **Monorepo Support**: Great for workspace management

### **Code Quality Tools**

#### **ESLint 9+**

- **Code Linting**: Identify and fix code issues
- **Custom Rules**: Project-specific linting rules
- **TypeScript Integration**: TypeScript-aware linting
- **Next.js Integration**: Next.js-specific rules

#### **Prettier**

- **Code Formatting**: Consistent code formatting
- **IDE Integration**: Automatic formatting on save
- **Custom Configuration**: Project-specific formatting rules

### **Testing Framework (Future)**

- **Jest**: Unit and integration testing
- **Testing Library**: React component testing
- **Playwright**: End-to-end testing
- **MSW**: API mocking for tests

## 🚀 Deployment & Infrastructure

### **Deployment Options**

- **Hosting**: Compatible with any modern hosting platform
- **Serverless**: Automatic scaling and performance
- **Containerized**: Deploy with Docker for consistency
- **Monitoring**: Built-in logging and monitoring

### **CI/CD Pipeline**

```yaml
# Automatic deployment workflow
GitHub Push → CI/CD Pipeline →
Type Check → Lint → Test →
Deploy to Production
```

## 📊 Monitoring & Analytics

### **Monitoring Solutions**

- **Logging**: Centralized logging for your application
- **Monitoring**: Performance and health monitoring
- **Alerting**: Set up alerts for errors and performance issues

### **Error Monitoring (Future)**

- **Sentry**: Real-time error tracking
- **Performance Monitoring**: Application performance insights
- **Release Tracking**: Deploy-based error tracking

## 🔐 Security Stack

### **Authentication & Authorization**

- **Secure Authentication**: Secure authentication with JWT
- **Session Management**: Secure session handling
- **Social Auth**: GitHub, Google, Discord integration

### **Data Protection**

- **Encryption**: Data encryption at rest and in transit
- **Input Validation**: Zod schemas for data validation
- **Rate Limiting**: API rate limiting and abuse prevention
- **CORS**: Proper cross-origin request handling

## 📱 Mobile & Responsive

### **Progressive Web App**

- **Service Workers**: Offline functionality and caching
- **App Manifest**: Native app-like experience
- **Push Notifications**: Real-time notifications (planned)
- **Install Prompts**: Add to home screen functionality

### **Responsive Design**

- **Mobile-First**: Mobile-first responsive design
- **Touch Optimization**: Touch-friendly interactions
- **Performance**: Optimized for mobile networks
- **Accessibility**: Full accessibility support

## 🔮 Future Technology Considerations

### **Planned Additions**

- **React Server Components**: Enhanced server-side rendering
- **Streaming UI**: Real-time UI updates with streaming
- **WebAssembly**: Performance-critical computations
- **Web Workers**: Background processing for heavy tasks

### **Potential Integrations**

- **Redis**: Caching and session storage
- **WebSockets**: Real-time communication
- **GraphQL**: Flexible API querying
- **Machine Learning**: Custom ML models for recommendations

## 📈 Performance Characteristics

### **Bundle Size Optimization**

- Tree shaking for unused code elimination
- Dynamic imports for code splitting
- Image optimization and lazy loading
- Font optimization and preloading

### **Runtime Performance**

- Server-side rendering for fast initial loads
- Client-side routing for smooth navigation
- Real-time updates without full page refreshes
- Optimistic UI updates for instant feedback

## 🌍 Browser Support

### **Modern Browsers**

- Chrome 90+
- Firefox 90+
- Safari 14+
- Edge 90+

### **Features**

- ES2022 features
- CSS Grid and Flexbox
- WebAssembly support
- Service Workers

---

This technology stack is chosen for:

- **Developer Experience**: Excellent tooling and documentation
- **Performance**: Fast loading and smooth interactions
- **Scalability**: Ability to grow with user base
- **Maintainability**: Easy to understand and modify
- **Security**: Built-in security best practices
# Shared Internal Library Foundation (Phase 1)

## Overview
The Shared Internal Library Foundation provides a standardized, type-safe communication layer between the various services of the SoloSuccess AI platform. It ensures that data structures are consistent across the Next.js frontend, API routes, and the standalone Express Socket.IO server.

## Core Schemas

### 1. `ServerResponseSchema`
Standardizes the response format for all API routes and Server Actions.

**Structure:**
- `success`: boolean
- `data`: any (Required if `success` is `true`)
- `error`: string (Optional, recommended if `success` is `false`)
- `message`: string (Optional)
- `meta`: Object (Optional)
  - `timestamp`: ISO Date string
  - `requestId`: string (Optional)
  - `version`: string (Optional)

### 2. `BoardroomEventSchema`
A discriminated union for Socket.IO events within the "Boardroom" collaboration namespace.

**Event Types:**
- `agent_collaboration`: Validates payload for agent-to-agent messages.
- `goal_update`: Validates payload for shared objective progress.
- `market_data_update`: Validates payload for real-time external data feeds.

### 3. `DominatorAgentOutputSchema`
Standardizes the structured output produced by high-level ("Dominator" class) AI agents.

**Structure:**
- `agentId`: string (e.g., "roxy", "echo")
- `content`: string (The primary response text)
- `timestamp`: ISO Date string
- `metadata`: Key-Value record (Optional, supports string, number, or boolean values)

## Implementation Details

- **Location**: `lib/shared/schemas.ts`
- **Validation**: Performed using [Zod](https://zod.dev/).
- **Type Inference**: TypeScript types are automatically inferred from the schemas to ensure compile-time safety.

## Usage Guidelines

### API Responses
Always use the `createSuccessResponse` and `createErrorResponse` utilities from `src/lib/api-response.ts`. These utilities automatically validate the response structure against the `ServerResponseSchema`.

### Real-Time Events
Socket.IO handlers in `server/src/realtime/boardroom.ts` use `BoardroomEventSchema.parse()` to validate incoming data before broadcasting or processing.

### Agent Logic
When an agent completes a task, wrap its output in the `DominatorAgentOutputSchema` format to ensure the frontend can parse it consistently.
