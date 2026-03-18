# LAUNCH_CHECKLIST.md

### 🔴 Critical (Must Fix)
- **Subscription Logic Consistency**: 
  - Verify consistency in subscription limits between `stripe.ts` and `subscription-utils.ts`. Discrepancy in agent limits noted with the inclusion of non-core agents `Aura` and `Finn` in `subscription-utils.ts` but not in `stripe.ts`.

### 🟡 Important (Should Fix)
- **Agent Verification**:
  - Ensure all core agents (Roxy, Blaze, Echo, Lumi, Vex, Lexi, Nova, Glitch) are verified within the `agent-collaboration-system.ts`.
  
- **Payment Readiness**:
  - Ensure Stripe configuration in `stripe.ts` matches properties needed in the schema. Verify missing parameters.
  
- **Feature Completeness**:
  - Check for missing routes or logic associated with any existing database tables, like 'competitors', based on the `schema`.

### 🟢 Polish
- **Documentation**: 
  - Ensure all scripts, types, and database interactions are well-documented.
  
- **Environment Variables**:
  - Confirm all required environment variables in `.env.example` are present and correctly named.