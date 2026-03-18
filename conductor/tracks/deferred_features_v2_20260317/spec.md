# Specification: Deferred Features & V2 Enhancements

## Overview
This track implements all previously deferred functionality, transitioning the platform from "MVP" to a feature-complete "V2" suite. Priority is given to enhancing the AI logic and data richness, followed by deep integrations where users connect their own external accounts.

## Functional Requirements
1.  **AI & Intelligence Enhancements (Priority 1)**:
    *   **Advanced Learning Algorithms**: Implement predictive learning paths in `learning-engine.ts` that adapt based on module performance and velocity.
    *   **Historical Competitor Comparison**: Implement time-series tracking for competitor metrics, allowing users to view delta reports (e.g., "Competitor X increased pricing by 15% since last month").
    *   **Voice NLP Pipeline**: Upgrade the voice task creator to use a dedicated server-side pipeline for complex intent extraction (multi-step tasks, due date parsing, agent assignment).
2.  **User-Driven Integrations (Priority 2)**:
    *   **PayPal Integration**: Allow users to connect their own PayPal accounts to track revenue streams alongside Stripe.
    *   **Outlook Calendar Support**: Implement OAuth flow for Microsoft/Outlook to sync tasks and focus sessions.
    *   **Global Revenue Aggregation**: Create a unified service to aggregate data from user-connected Stripe, PayPal, and manual sources into the dashboard.
3.  **Advanced Infrastructure (Priority 3)**:
    *   **Enterprise/Team Infrastructure**: Implement organization-level schema updates to support multi-user "Business" accounts with shared briefcases and roles.
    *   **Advanced File Previews**: Integrate a library-based preview system (e.g., `react-doc-viewer`) into `file-preview-modal.tsx` for rich rendering of Office documents (Excel, PPT).

## Technical Constraints
*   **Credential Handling**: Use the existing `payment_provider_connections` and `calendar_connections` schemas. User-provided keys must be securely handled.
*   **AI Consistency**: All new AI logic must utilize **Gemini 2.5 Pro**.
*   **Performance**: Advanced file previews must not bloat the initial client bundle (use dynamic imports).

## Acceptance Criteria
*   Users can view historical trends in the Competitor Stalker.
*   Voice commands can create complex, assigned tasks.
*   Users can connect a PayPal account and view aggregated revenue.
*   Outlook sync works alongside Google Calendar.
*   Enterprise "Team" accounts can invite members and share resources.