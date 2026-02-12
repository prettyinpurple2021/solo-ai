
# LAUNCH_CHECKLIST.md

## 🔴 Critical (Must Fix)
- **Subscription Logic Consistency**:
  - Compare `stripe.ts` and `subscription-utils.ts`:
    - Discrepancy in `ACCELERATOR` plan for `maxAgents`: `stripe.ts` allows 8, `subscription-utils.ts` allows 5.
    - Discrepancy in `ACCELERATOR` plan for `dailyConversations`: `stripe.ts` is unlimited, `subscription-utils.ts` is 100.
    - Discrepancy in `maxTeamMembers`: Not utilized in `stripe.ts`.
- **Agent Verification**:
  - Verify agent presence in `agent-collaboration-system.ts`: Confirm all core agents (Roxy, Blaze, Echo, Lumi, Vex, Lexi, Nova, Glitch) are registered. (Confirmed: All agents are correctly registered.)

## 🟡 Important (Should Fix)
- **Payment Readiness**:
  - Verify that properties in `schema.ts` match Stripe configuration. Match `STRIPE_PRODUCTS` and `STRIPE_PRICES` with database representation.
- **Feature Completeness**:
  - Check for missing routes/logic for the `competitors` table. Ensure API logic and access patterns align with `schema.ts`.

## 🟢 Polish
- Ensure `.env.example` includes clear instructions for setting all environment variables.
- Verify any complementary documentation or comments in code are up to date with current logic.