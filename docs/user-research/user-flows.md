# User Flows
## SoloBoss AI User Journey Mapping

## 📋 Overview

This document illustrates the step-by-step paths that users will take to accomplish key tasks within the SoloBoss AI application. These flows are derived from the user personas and their stories, providing a clear guide for UI/UX design and development.

---

## 🔄 Flow 1: Onboarding and First Task Creation

### Trigger
New user (Sam, the Overwhelmed Freelancer) discovers SoloBoss AI and wants to create their first project.

### User Goal
Sign up, create a goal for a new client project, and add the first task to get started with task management.

### Steps

1. **Landing Page Visit**
   - **User Action:** Sam arrives at the SoloBoss AI landing page and clicks "Sign Up"
   - **System Response:** Navigation to registration form

2. **Account Registration**
   - **User Action:** Sam enters their email and password, then clicks "Create Account"
   - **System Response:** Supabase Auth creates the user account and sends confirmation email; Sam is automatically logged in

3. **Welcome Experience**
   - **User Action:** Sam sees welcome modal explaining key features (BossRoom, SlayList, AI Agents) and clicks "Let's Get Started"
   - **System Response:** Modal closes, user is guided to next step

4. **Dashboard Introduction**
   - **User Action:** Sam is directed to their empty BossRoom dashboard
   - **System Response:** Tooltip or highlight points toward "SlayList" in navigation sidebar

5. **SlayList Access**
   - **User Action:** Sam navigates to the SlayList page
   - **System Response:** Empty SlayList page displays with prominent "Create New Goal" button

6. **Goal Creation**
   - **User Action:** Sam clicks "Create New Goal" button and enters goal title "Client Project: Acme Corp Blog Series," then clicks "Save Goal"
   - **System Response:** New goal appears as a card on the SlayList page

7. **First Task Addition**
   - **User Action:** Sam clicks "Add a task" inside the new goal card
   - **System Response:** Input field appears for task entry

8. **Task Details Entry**
   - **User Action:** Sam types "Draft first blog post: The Future of AI" and hits Enter
   - **System Response:** Task appears under the goal with success notification; option to add due date or description available

### Success Criteria
- User successfully creates account and completes email verification
- First goal is created and visible in SlayList
- First task is added to the goal
- User understands basic navigation and task creation process

### Alternative Paths
- **Email already registered:** Display error message with login option
- **Password validation fails:** Show password requirements and retry
- **User abandons onboarding:** Save progress and offer to resume later

---

## 🔄 Flow 2: Generating Marketing Content with AI Agent

### Trigger
Maya (Creative Side-Hustler) needs social media captions for a new art print she's launching.

### User Goal
Use Echo (Marketing Maven) AI agent to generate social media captions for a new art print.

### Steps

1. **Account Access**
   - **User Action:** Maya logs into her account
   - **System Response:** Lands on the BossRoom dashboard

2. **AI Team Navigation**
   - **User Action:** Maya clicks "AI Team" from sidebar navigation
   - **System Response:** Grid of 8 AI agents displays

3. **Agent Selection**
   - **User Action:** Maya clicks on "Echo (Marketing Maven)"
   - **System Response:** Navigation to Echo's dedicated interface

4. **Content Request Setup**
   - **User Action:** Maya sees Echo's interface with input form
   - **System Response:** Clear form fields displayed: "What are you promoting?", "Target Audience," "Desired Tone"

5. **Context Provision**
   - **User Action:** Maya fills in the form:
     - "What are you promoting?": "My new 'Cosmic Dreams' art print, a vibrant abstract piece"
     - Target Audience: "Art Lovers & Home Decorators"
     - Tone: "Whimsical & Inspiring" from dropdown
   - **System Response:** Form validates input as user types

6. **Content Generation Request**
   - **User Action:** Maya clicks "Generate Captions" button
   - **System Response:** Loading indicator appears; Next.js API route sends request to AI model

7. **Results Display**
   - **User Action:** Maya waits for AI processing
   - **System Response:** 5 distinct social media captions appear in individual cards with "Copy" and "Save to Briefcase" buttons

8. **Content Selection**
   - **User Action:** Maya reviews options and clicks "Copy" on the third caption
   - **System Response:** "Copied to clipboard!" notification appears

9. **Content Preservation**
   - **User Action:** Maya clicks "Save to Briefcase" on the fifth caption for later use
   - **System Response:** Caption saved as new text file in Briefcase with confirmation

### Success Criteria
- AI agent generates relevant, on-brand social media captions
- User can easily copy content to clipboard
- Content can be saved to Briefcase for future use
- Process feels intuitive and efficient

### Alternative Paths
- **AI service temporarily unavailable:** Display error message with retry option
- **Insufficient context provided:** Prompt user for more details
- **User wants different tone:** Allow easy modification and regeneration

---

## 🔄 Flow 3: Uploading and Organizing Client Documents

### Trigger
David (Experienced Consultant) receives a new client contract that needs secure storage and organization.

### User Goal
Upload a new client contract to a secure, organized folder in the Briefcase.

### Steps

1. **Platform Access**
   - **User Action:** David logs in
   - **System Response:** Lands on BossRoom dashboard

2. **Briefcase Navigation**
   - **User Action:** David clicks "Briefcase" in sidebar
   - **System Response:** Briefcase interface displays existing files and folders

3. **Upload Initiation**
   - **User Action:** David clicks "Upload File" button
   - **System Response:** System file picker opens

4. **File Selection**
   - **User Action:** David selects "Contract-ClientX.pdf" from computer
   - **System Response:** Upload progress bar appears

5. **Metadata Assignment**
   - **User Action:** Upload completes, metadata modal appears; David enters:
     - Category: "Contracts"
     - Tag: "ClientX"
     - Clicks "Save"
   - **System Response:** File metadata is processed and stored

6. **File Verification**
   - **User Action:** David views uploaded file
   - **System Response:** "Contract-ClientX.pdf" appears in Briefcase list showing "Contracts" category and "ClientX" tag

7. **Organization Testing**
   - **User Action:** David types "ClientX" into search bar
   - **System Response:** List instantly filters to show only "Contract-ClientX.pdf" file

### Success Criteria
- File uploads successfully without corruption
- Metadata (categories, tags) is properly assigned and searchable
- Search and filter functionality works accurately
- File is accessible and properly organized

### Alternative Paths
- **File too large:** Display size limit error with compression suggestions
- **Unsupported file type:** Show supported formats and conversion options
- **Upload fails:** Provide retry mechanism and error details
- **Duplicate file detected:** Offer versioning or rename options

---

## 🔄 Flow 4: Upgrading a Subscription

### Trigger
Alex (Aspiring Innovator) tries to access a premium AI agent but is on the free plan.

### User Goal
Upgrade from the free plan to the "Accelerator" tier to access all AI agents.

### Steps

1. **Feature Access Attempt**
   - **User Action:** Alex clicks on "Blaze (Growth & Sales Strategist)" from AI Team page
   - **System Response:** Access denied modal appears

2. **Upgrade Notification**
   - **User Action:** Alex sees modal: "Blaze is available on the Accelerator plan. Upgrade to unlock this and other powerful AI agents"
   - **System Response:** Modal displays with "View Plans" button

3. **Pricing Page Navigation**
   - **User Action:** Alex clicks "View Plans"
   - **System Response:** Navigation to pricing page showing "Launchpad" and "Accelerator" tiers with feature comparison

4. **Plan Selection**
   - **User Action:** Alex reviews options and clicks "Upgrade to Accelerator" button
   - **System Response:** Preparation for secure payment processing

5. **Secure Checkout**
   - **User Action:** Alex is redirected to Stripe Checkout page (pre-filled with email)
   - **System Response:** Secure Stripe payment interface loads

6. **Payment Processing**
   - **User Action:** Alex enters credit card details and confirms subscription
   - **System Response:** Stripe processes payment securely

7. **Confirmation and Access**
   - **User Action:** Alex is redirected back to SoloBoss AI
   - **System Response:** Lands on billing settings page showing active "Accelerator" subscription with success notification

8. **Feature Access Verification**
   - **User Action:** Alex navigates back to AI Team page and clicks "Blaze" again
   - **System Response:** Blaze AI agent interface loads successfully

### Success Criteria
- Payment processing is secure and seamless
- Subscription upgrade is immediately reflected in account
- Previously restricted features become accessible
- User receives clear confirmation of upgrade

### Alternative Paths
- **Payment fails:** Display specific error message with retry options
- **Card declined:** Suggest alternative payment methods
- **User cancels checkout:** Return to pricing page with progress saved
- **Processing delay:** Show progress indicator and confirmation timeline

---

## 🔄 Flow 5: Using Focus Mode to Complete a Task

### Trigger
Sam (Overwhelmed Freelancer) has a blog post to write and wants to use focused work session to avoid distractions.

### User Goal
Start a focused work session to complete a blog post without distractions.

### Steps

1. **Task Review**
   - **User Action:** Sam logs in and navigates to SlayList to view daily tasks
   - **System Response:** SlayList displays with current tasks

2. **Task Selection**
   - **User Action:** Sam locates task "Draft first blog post: The Future of AI"
   - **System Response:** Task is highlighted when selected

3. **Focus Mode Initiation**
   - **User Action:** Sam clicks "Focus" icon (clock/target icon) next to the task
   - **System Response:** Focus mode modal appears

4. **Session Configuration**
   - **User Action:** Sam sees modal asking "Start a 25-minute focus session for this task?" and clicks "Start"
   - **System Response:** Focus mode timer begins

5. **Distraction-Free Environment**
   - **User Action:** Sam sees simplified UI with prominent countdown timer (25:00) and task name displayed
   - **System Response:** Non-essential navigation elements are hidden

6. **Work Session**
   - **User Action:** Sam minimizes browser and works on blog post in writing software
   - **System Response:** Timer continues running in background

7. **Session Completion**
   - **User Action:** After 25 minutes, Sam hears notification sound
   - **System Response:** Message appears: "Focus session complete! Time for a short break"

8. **Progress Update**
   - **User Action:** Sam clicks "Mark task as 'In Progress'" button in completion modal
   - **System Response:** Task status updated in SlayList; 5-minute break suggestion appears

### Success Criteria
- Focus mode successfully minimizes distractions
- Timer functions accurately and provides clear feedback
- Task progress can be updated seamlessly
- User feels more productive and focused

### Alternative Paths
- **User needs to exit early:** Provide "End Session" option with progress save
- **Distractions occur:** Offer pause/resume functionality
- **Browser crashes:** Restore session state when user returns
- **Task takes longer:** Offer session extension options

---

## 🔄 Flow 6: Validating a Business Idea with AI Strategist

### Trigger
Alex (Aspiring Innovator) has developed a new SaaS product idea and wants strategic feedback before proceeding.

### User Goal
Get strategic feedback from Blaze AI agent on a new SaaS product idea.

### Steps

1. **Platform Access**
   - **User Action:** Alex logs in and navigates to "AI Team" page from sidebar
   - **System Response:** AI Team interface loads

2. **Strategist Selection**
   - **User Action:** Alex clicks on "Blaze (Growth & Sales Strategist)"
   - **System Response:** Blaze's dedicated interface loads

3. **Idea Input Interface**
   - **User Action:** Alex sees large text area with prompt: "Describe your business idea. Include your target audience, the problem you're solving, and your proposed solution"
   - **System Response:** Text area is ready for input with character count

4. **Comprehensive Description**
   - **User Action:** Alex types detailed paragraph describing niche SaaS product idea
   - **System Response:** Input is validated and formatted as user types

5. **Analysis Request**
   - **User Action:** Alex clicks "Validate My Idea" button
   - **System Response:** Loading indicator appears with text "Blaze is analyzing the market..."

6. **Strategic Analysis Generation**
   - **User Action:** Alex waits for AI processing
   - **System Response:** Structured analysis appears with sections:
     - **Potential Strengths:** "Addresses a clear pain point for a niche market"
     - **Potential Weaknesses:** "High competition from larger, more established players"
     - **Suggested Next Steps:** "1. Conduct competitor analysis. 2. Create a simple landing page to gauge interest"

7. **Analysis Preservation**
   - **User Action:** Alex finds feedback valuable and clicks "Save to Briefcase" button
   - **System Response:** Entire analysis saved as "Idea Validation - SaaS Product" document in Briefcase with confirmation

### Success Criteria
- AI provides comprehensive, actionable business analysis
- Analysis is well-structured and easy to understand
- Feedback can be saved for future reference
- User gains clear next steps for idea development

### Alternative Paths
- **Insufficient idea description:** AI requests more details before analysis
- **AI analysis is unclear:** User can request clarification or examples
- **User wants follow-up questions:** Interface allows continued conversation
- **Save to Briefcase fails:** Offer alternative save options or retry

---

## 📊 Flow Summary and Design Implications

### 🎯 Key User Journey Patterns

#### **Onboarding Flow (Flow 1)**
- **Focus:** Simplicity and quick value demonstration
- **Key Elements:** Progressive disclosure, clear CTAs, immediate success feedback
- **Success Metrics:** Completion rate, time to first task creation

#### **AI Agent Interactions (Flows 2, 6)**
- **Focus:** Natural conversation flow with clear input/output
- **Key Elements:** Context gathering, loading states, actionable results
- **Success Metrics:** User satisfaction with AI output, repeat usage

#### **Document Management (Flow 3)**
- **Focus:** Security, organization, and searchability
- **Key Elements:** Drag-and-drop uploads, metadata assignment, powerful search
- **Success Metrics:** Upload success rate, file retrieval efficiency

#### **Subscription Management (Flow 4)**
- **Focus:** Transparent pricing, secure payment, immediate access
- **Key Elements:** Clear feature comparison, trusted payment processing, instant upgrade
- **Success Metrics:** Conversion rate, payment completion rate

#### **Productivity Features (Flow 5)**
- **Focus:** Distraction elimination and progress tracking
- **Key Elements:** Timer functionality, UI simplification, progress updates
- **Success Metrics:** Session completion rate, task completion improvement

### 🔄 Common Flow Elements

#### **Navigation Patterns**
- Consistent sidebar navigation across all flows
- Breadcrumb navigation for deep features
- Quick access to primary functions from dashboard

#### **Feedback Mechanisms**
- Loading states for AI processing
- Success notifications for completed actions
- Error handling with clear recovery paths

#### **Data Persistence**
- Auto-save functionality where appropriate
- Session restoration after interruptions
- Cross-device synchronization

### 🛠️ Technical Implementation Notes

#### **Next.js App Router Considerations**
- Server Components for initial page loads
- Client Components for interactive elements
- API routes for AI agent communications

#### **Supabase Integration Points**
- Real-time subscriptions for live updates
- Row Level Security for document access
- File storage for uploads and generated content

#### **AI SDK Implementation**
- Streaming responses for better UX
- Error handling for AI service failures
- Token management for cost optimization

---

**These user flows provide comprehensive guidance for implementing intuitive, efficient user experiences that align with our target personas' needs and expectations.**

*User flows documented: January 2025*
