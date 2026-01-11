# Complete App Redesign Plan - Cyberpunk Design System v3 Migration

**Status:** Planning Phase  
**Created:** 2025-12-20
**Target:** 100% migration to Cyberpunk Design System v3 across entire application

---

## Executive Summary

This document outlines the comprehensive plan to redesign **every single page, component, and screen** in the SoloSuccess AI application to use the new Cyberpunk Design System v3. This is a complete migration from the old holographic/purple-pink gradient design to the new cyberpunk aesthetic with neon colors, glitch effects, and dual-mode theming.

### Current State Assessment

**✅ Completed (Foundation):**
- Design system components created (Heading, Text, Button, Alert, Loading, Badge, Modal, ProgressBar, CodeBlock, Breadcrumb)
- Theme system implemented (Balanced/Aggressive modes)
- Tailwind config updated with cyberpunk colors
- Global CSS updated with glitch effects
- ~13 files migrated (those explicitly using HolographicButton/Card/Loader)

**❌ Not Completed:**
- **437+ old purple/pink gradient references** across 52 app pages
- **942+ old purple/pink gradient references** across 148 src components  
- **74+ pages** not yet updated to new design system
- **Build errors** preventing successful compilation
- **Inconsistent styling** throughout application

---

## Migration Scope

### Pages to Update (74+ total)

#### Public/Marketing Pages (15)
- `app/page.tsx` - Homepage
- `app/landing/page.tsx` - Landing page
- `app/features/page.tsx` - Features page
- `app/pricing/page.tsx` - Pricing page
- `app/pricing/launch/page.tsx` - Launch tier
- `app/pricing/accelerator/page.tsx` - Accelerator tier
- `app/pricing/dominator/page.tsx` - Dominator tier
- `app/about/page.tsx` - About page
- `app/contact/page.tsx` - Contact page
- `app/blog/page.tsx` - Blog listing
- `app/blog/how-to-scale-a-solo-business/page.tsx` - Blog post
- `app/blog/how-to-automate-revenue-workflows/page.tsx` - Blog post
- `app/blog/how-to-build-marketing-system-with-ai/page.tsx` - Blog post
- `app/compare/page.tsx` - Comparison page
- `app/compare/solosuccess-vs-generic/page.tsx` - Comparison detail
- `app/compare/solosuccess-vs-freelancer-stack/page.tsx` - Comparison detail

#### Authentication Pages (6)
- `app/login/page.tsx` - Login
- `app/register/page.tsx` - Registration
- `app/forgot-password/page.tsx` - Password recovery
- `app/reset-password/page.tsx` - Password reset
- `app/account-recovery/page.tsx` - Account recovery
- `app/auth/2fa/page.tsx` - Two-factor authentication
- `app/auth/device-approval/page.tsx` - Device approval
- `app/auth/sessions/page.tsx` - Active sessions

#### Legal/Info Pages (8)
- `app/terms/page.tsx` - Terms of Service
- `app/privacy/page.tsx` - Privacy Policy
- `app/cookies/page.tsx` - Cookie Policy
- `app/security/page.tsx` - Security page
- `app/compliance/page.tsx` - Compliance page
- `app/help/page.tsx` - Help center
- `app/status/page.tsx` - System status
- `app/gdpr/page.tsx` - GDPR page

#### Dashboard Pages (25+)
- `app/dashboard/page.tsx` - Main dashboard
- `app/dashboard/agents/page.tsx` - AI Agents
- `app/dashboard/slaylist/page.tsx` - SlayList
- `app/dashboard/briefcase/page.tsx` - Briefcase
- `app/dashboard/brand/page.tsx` - Brand Builder
- `app/dashboard/competitors/page.tsx` - Competitors
- `app/dashboard/competitors/add/page.tsx` - Add competitor
- `app/dashboard/competitors/[id]/page.tsx` - Competitor detail
- `app/dashboard/competitors/[id]/edit/page.tsx` - Edit competitor
- `app/dashboard/competitors/discover/page.tsx` - Discover competitors
- `app/dashboard/competitors/import/page.tsx` - Import competitors
- `app/dashboard/competitors/intelligence/page.tsx` - Intelligence
- `app/dashboard/templates/page.tsx` - Templates
- `app/dashboard/focus/page.tsx` - Focus Mode
- `app/dashboard/burnout/page.tsx` - Burnout Shield
- `app/dashboard/analytics/page.tsx` - Analytics
- `app/dashboard/settings/page.tsx` - Settings
- `app/dashboard/billing/page.tsx` - Billing
- `app/dashboard/workspace/page.tsx` - Workspace
- `app/dashboard/learning/page.tsx` - Learning
- `app/dashboard/notifications/page.tsx` - Notifications
- `app/dashboard/integrations/page.tsx` - Integrations
- `app/dashboard/collaboration/page.tsx` - Collaboration
- `app/dashboard/collaboration/sessions/[id]/page.tsx` - Session detail
- `app/dashboard/projects/page.tsx` - Projects
- `app/dashboard/evolve/page.tsx` - Evolve
- `app/dashboard/incinerator/page.tsx` - Incinerator
- `app/dashboard/subscription/page.tsx` - Subscription

#### Additional Pages (20+)
- `app/templates/page.tsx` - Template catalog
- `app/templates/[templateSlug]/page.tsx` - Template detail
- `app/team/page.tsx` - Team page
- `app/profile/page.tsx` - User profile
- `app/user/page.tsx` - User page
- `app/custom-agents/page.tsx` - Custom agents
- `app/custom-agents/training/page.tsx` - Agent training
- `app/custom-agents/security/page.tsx` - Agent security
- `app/careers/page.tsx` - Careers
- `app/community/page.tsx` - Community
- `app/workflows/page.tsx` - Workflows
- `app/admin/page.tsx` - Admin panel
- `app/offline/page.tsx` - Offline page
- `app/not-found.tsx` - 404 page
- `app/error.tsx` - Error page
- `app/global-error.tsx` - Global error
- `app/loading.tsx` - Loading page

### Components to Update (148+ files with old gradients)

#### High-Priority Components
- `src/components/shared/shared-landing-page.tsx` - Main landing component
- `src/components/marketing/layout/Navbar.tsx` - Navigation
- `src/components/marketing/layout/Footer.tsx` - Footer
- `src/components/app-sidebar.tsx` - Dashboard sidebar
- `src/components/DashboardHeader.tsx` - Dashboard header
- `src/components/mobile/mobile-navigation.tsx` - Mobile nav
- `src/components/footer/app-footer.tsx` - App footer

#### Feature Components
- All components in `src/components/templates/` (30+ files)
- All components in `src/components/analytics/` (10+ files)
- All components in `src/components/workflow/` (8+ files)
- All components in `src/components/briefcase/` (15+ files)
- All components in `src/components/competitors/` (10+ files)
- All components in `src/components/guardian-ai/` (8+ files)
- All components in `src/components/evolve/` (5+ files)
- All components in `src/components/custom-agents/` (5+ files)
- All components in `src/components/onboarding/` (8+ files)
- All components in `src/components/auth/` (10+ files)

#### Utility Components
- `src/components/ui/boss-button.tsx` - Old button variant
- `src/components/ui/boss-card.tsx` - Old card variant
- `src/lib/ui-utils.ts` - Gradient utilities (needs update)

---

## Design System Standards

### Color Migration Map

**Old Colors → New Colors:**
- `from-purple-500 to-pink-500` → `from-neon-purple to-neon-magenta` or use semantic variants
- `bg-purple-500` → `bg-neon-purple` or semantic color
- `text-purple-600` → `text-neon-purple` or semantic color
- `border-purple-200` → `border-neon-purple` or `border-neon-cyan`
- Purple/Pink gradients → Cyberpunk neon gradients or semantic colors

**Background Colors:**
- Light backgrounds → `bg-dark-bg` (#0a0e27)
- Card backgrounds → `bg-dark-card` (#0f1535)
- Hover states → `bg-dark-hover` (#151d3a)

**Text Colors:**
- Primary text → `text-white`
- Secondary text → `text-gray-300`
- Accent text → `text-neon-cyan` (or appropriate neon color)
- Semantic colors → Use semantic variants (success, error, warning, info)

### Component Migration Map

**Old Components → New Components:**
- `<button className="...">` → `<PrimaryButton variant="cyan">` or `<Button>`
- `<div className="holographic-card">` → `<div className="border-2 border-neon-cyan bg-dark-card rounded-sm">`
- Custom gradients → Use design system components or semantic colors
- Old loading spinners → `<Loading color="cyan" />`
- Old alerts → `<Alert variant="info">`

### Typography Migration

**Headings:**
- All `<h1>` through `<h6>` → Use `<Heading level={1-6}>` component
- Apply `glitch={true}` for interactive headings
- Use `font-orbitron` for all headings

**Body Text:**
- All `<p>`, `<span>`, text elements → Use `<Text>` component
- Never apply glitch to body text
- Use `font-mono` (JetBrains Mono) for body text

---

## Phase Breakdown

### Phase 0: Build Fixes & Foundation Verification (CRITICAL - Must Complete First)

**Goal:** Ensure application builds successfully before proceeding

**Tasks:**
1. Fix missing Alert exports
   - ✅ **Already fixed:** Added `AlertTitle` and `AlertDescription` exports to `src/components/ui/Alert.tsx`
   - **Verify:** All files importing `AlertDescription` or `AlertTitle` now work
   - **Files affected:** ~20 files need verification

3. Fix Button/buttonVariants exports
   - ✅ **Already fixed:** Added backward-compatible `Button`, `ButtonProps`, and `buttonVariants` exports
   - **Verify:** All 93+ files importing `Button` from `@/components/ui/button` work
   - **Test:** Verify calendar, pagination, alert-dialog components work

4. Fix missing CSS import
   - ✅ **Already fixed:** Removed `@import "../styles/cyberpunk.css"` from `app/globals.css`
   - **Verify:** No other missing CSS imports exist

5. Fix resend dependency warning
   - **Issue:** `@react-email/render` package missing but required by resend
   - **Solution:** Run `npm install @react-email/render` or update resend usage
   - **Verify:** Email functionality in `app/api/briefcase/files/[id]/invite/route.ts` works

6. Verify successful build
   - Run `npm run build` and ensure zero errors
   - Fix any remaining TypeScript errors
   - Fix any remaining lint errors
   - Verify all pages can be generated (static or dynamic)

**Success Criteria:**
- ✅ `npm run build` completes successfully
- ✅ No import errors
- ✅ No TypeScript errors
- ✅ No lint errors
- ✅ All pages can be statically generated or properly marked as dynamic

**Estimated Time:** 2-4 hours

---

### Phase 1: Core Infrastructure & Shared Components

**Goal:** Update all shared/layout components that appear on every page

**Tasks:**

1. **Update Navigation Components**
   - `src/components/marketing/layout/Navbar.tsx`
     - Replace purple/pink gradients with neon colors
     - Update logo to use new design system
     - Use `PrimaryButton` for CTAs
     - Apply cyberpunk styling
   
   - `src/components/app-sidebar.tsx`
     - Replace old colors with cyberpunk palette
     - Use new design system components
     - Update icons and styling
   
   - `src/components/mobile/mobile-navigation.tsx`
     - Migrate to cyberpunk design
     - Use new components

2. **Update Footer Components**
   - `src/components/footer/app-footer.tsx`
     - Replace gradients with neon colors
     - Use new design system
   
   - `src/components/marketing/layout/Footer.tsx`
     - Full cyberpunk redesign

3. **Update Layout Components**
   - `src/components/marketing/layout/MarketingLayout.tsx`
     - Update background to `bg-dark-bg`
     - Apply cyberpunk theme
   
   - `src/components/shared/shared-landing-page.tsx`
     - Complete redesign with new components
     - Replace all purple/pink gradients
     - Use Heading, Text, PrimaryButton components

4. **Update Dashboard Layout**
   - `app/dashboard/layout.tsx`
     - Ensure sidebar uses new design
     - Update header styling
   
   - `src/components/DashboardHeader.tsx`
     - Migrate to cyberpunk design
     - Use new components

5. **Update Utility Files**
   - `src/lib/ui-utils.ts`
     - Replace gradient variants with cyberpunk colors
     - Update to use new design tokens

**Success Criteria:**
- All navigation components use new design system
- All footer components use new design system
- All layout components use new design system
- No purple/pink gradients in shared components
- Consistent styling across all layouts

**Estimated Time:** 8-12 hours

---

### Phase 2: Public/Marketing Pages

**Goal:** Redesign all public-facing pages with cyberpunk aesthetic

**Priority Order:**

1. **Homepage** (`app/page.tsx`)
   - Hero section with glitch text
   - Feature cards with HUD borders
   - CTA buttons using PrimaryButton
   - Stats using new design system
   - Footer integration

2. **Landing Page** (`app/landing/page.tsx`)
   - Already partially updated, complete migration
   - Ensure all colors use cyberpunk palette
   - Verify components use new design system

3. **Features Page** (`app/features/page.tsx`)
   - Feature grid with cyberpunk cards
   - Use Heading component for titles
   - Use Text component for descriptions
   - Update all colors

4. **Pricing Pages** (3 pages)
   - `app/pricing/page.tsx`
   - `app/pricing/launch/page.tsx`
   - `app/pricing/accelerator/page.tsx`
   - `app/pricing/dominator/page.tsx`
   - Pricing cards with cyberpunk styling
   - Use PrimaryButton for CTAs
   - Update all gradients

5. **About & Contact Pages**
   - `app/about/page.tsx`
   - `app/contact/page.tsx`
   - Form styling with cyberpunk theme
   - Update all components

6. **Blog Pages** (4 pages)
   - `app/blog/page.tsx`
   - Individual blog post pages
   - Article styling with cyberpunk theme
   - Update typography

7. **Comparison Pages** (3 pages)
   - `app/compare/page.tsx`
   - Comparison detail pages
   - Table styling with cyberpunk theme

**Success Criteria:**
- All public pages use new design system
- No purple/pink gradients remain
- All buttons use PrimaryButton
- All headings use Heading component
- Consistent cyberpunk aesthetic
- Mobile responsive
- Accessibility maintained

**Estimated Time:** 16-24 hours

---

### Phase 3: Authentication Pages

**Goal:** Redesign all auth pages with consistent cyberpunk styling

**Pages:**
1. `app/login/page.tsx`
2. `app/register/page.tsx`
3. `app/forgot-password/page.tsx`
4. `app/reset-password/page.tsx`
5. `app/account-recovery/page.tsx`
6. `app/auth/2fa/page.tsx`
7. `app/auth/device-approval/page.tsx`
8. `app/auth/sessions/page.tsx`

**Components to Update:**
- `src/components/auth/login-form.tsx`
- `src/components/auth/register-form.tsx`
- `src/components/auth/forgot-password-form.tsx`
- `src/components/auth/neon-auth.tsx`
- `src/components/auth/simple-auth.tsx`

**Tasks:**
- Replace all purple/pink gradients with neon colors
- Update form inputs to use cyberpunk styling
- Use PrimaryButton for submit buttons
- Use Heading component for page titles
- Use Alert component for error messages
- Update background to `bg-dark-bg`
- Add cyberpunk grid backgrounds
- Ensure consistent styling across all auth pages

**Success Criteria:**
- All auth pages use new design system
- Consistent styling across all auth flows
- Forms are accessible and functional
- Error states use Alert component
- Mobile responsive

**Estimated Time:** 8-12 hours

---

### Phase 4: Legal/Info Pages

**Goal:** Update all legal and informational pages

**Pages:**
1. `app/terms/page.tsx`
2. `app/privacy/page.tsx`
3. `app/cookies/page.tsx`
4. `app/security/page.tsx`
5. `app/compliance/page.tsx`
6. `app/help/page.tsx`
7. `app/status/page.tsx`
8. `app/gdpr/page.tsx`

**Tasks:**
- Update typography using Heading and Text components
- Replace old colors with cyberpunk palette
- Update layout to use new design system
- Ensure readability and accessibility
- Update links and navigation
- Add cyberpunk background effects

**Success Criteria:**
- All legal pages use new design system
- Consistent styling
- Readable and accessible
- Professional appearance

**Estimated Time:** 6-8 hours

---

### Phase 5: Dashboard Pages (Core Features)

**Goal:** Redesign main dashboard and core feature pages

**Priority Order:**

1. **Main Dashboard** (`app/dashboard/page.tsx`)
   - Dashboard layout with cyberpunk cards
   - Stats using new design system
   - Widgets with HUD borders
   - Update all components

2. **AI Agents** (`app/dashboard/agents/page.tsx`)
   - Agent cards with cyberpunk styling
   - Use new design system components
   - Update colors and gradients

3. **Briefcase** (`app/dashboard/briefcase/page.tsx`)
   - File browser with cyberpunk theme
   - Update all briefcase components
   - Use new design system

4. **Templates** (`app/dashboard/templates/page.tsx`)
   - Template gallery with cyberpunk cards
   - Update template components
   - Use new design system

5. **Analytics** (`app/dashboard/analytics/page.tsx`)
   - Charts and graphs with cyberpunk styling
   - Update analytics components
   - Use new color palette

6. **Settings** (`app/dashboard/settings/page.tsx`)
   - Settings panels with cyberpunk theme
   - Form styling
   - Update all settings components

**Success Criteria:**
- All dashboard pages use new design system
- Consistent navigation and layout
- All widgets and cards styled correctly
- Functional and accessible

**Estimated Time:** 20-30 hours

---

### Phase 6: Dashboard Pages (Advanced Features)

**Goal:** Redesign advanced dashboard features

**Pages:**
1. `app/dashboard/competitors/page.tsx` and all sub-pages
2. `app/dashboard/brand/page.tsx`
3. `app/dashboard/focus/page.tsx`
4. `app/dashboard/burnout/page.tsx`
5. `app/dashboard/workspace/page.tsx`
6. `app/dashboard/learning/page.tsx`
7. `app/dashboard/notifications/page.tsx`
8. `app/dashboard/integrations/page.tsx`
9. `app/dashboard/collaboration/page.tsx`
10. `app/dashboard/projects/page.tsx`
11. `app/dashboard/evolve/page.tsx`
12. `app/dashboard/incinerator/page.tsx`
13. `app/dashboard/billing/page.tsx`
14. `app/dashboard/subscription/page.tsx`

**Tasks:**
- Update each page systematically
- Replace all old colors and gradients
- Use new design system components
- Update all feature-specific components
- Ensure functionality preserved
- Test each page after migration

**Success Criteria:**
- All advanced dashboard pages migrated
- Feature functionality preserved
- Consistent design throughout
- No broken features

**Estimated Time:** 30-40 hours

---

### Phase 7: Component Library Migration

**Goal:** Update all reusable components to use new design system

**Component Categories:**

1. **Template Components** (30+ files in `src/components/templates/`)
   - Update all template components
   - Replace gradients with neon colors
   - Use new design system components
   - Ensure templates render correctly

2. **Analytics Components** (10+ files)
   - Update chart components
   - Update dashboard widgets
   - Use new color palette
   - Update data visualization

3. **Workflow Components** (8+ files)
   - Update workflow builder
   - Update execution monitor
   - Update workflow templates
   - Use new design system

4. **Briefcase Components** (15+ files)
   - Update file browser
   - Update file preview
   - Update sharing modals
   - Use new design system

5. **Competitor Components** (10+ files)
   - Update competitor dashboard
   - Update intelligence views
   - Update alert components
   - Use new design system

6. **Guardian AI Components** (8+ files)
   - Update compliance scanner
   - Update policy generator
   - Update consent management
   - Use new design system

7. **Evolve Components** (5+ files)
   - Update evolve dashboard
   - Update compensation modeler
   - Update first hire architect
   - Use new design system

8. **Onboarding Components** (8+ files)
   - Update welcome flows
   - Update tutorials
   - Update feature discovery
   - Use new design system

9. **Auth Components** (10+ files)
   - Update all auth forms
   - Update auth modals
   - Use new design system

10. **UI Components** (20+ files)
    - Update boss-button.tsx (migrate to PrimaryButton)
    - Update boss-card.tsx (migrate to cyberpunk cards)
    - Update all utility components
    - Remove old component variants

**Success Criteria:**
- All components use new design system
- No old gradients or colors remain
- Components are reusable and consistent
- TypeScript types are correct
- Components are accessible

**Estimated Time:** 40-60 hours

---

### Phase 8: Additional Pages & Edge Cases

**Goal:** Update remaining pages and handle edge cases

**Pages:**
1. `app/team/page.tsx`
2. `app/profile/page.tsx`
3. `app/user/page.tsx`
4. `app/custom-agents/page.tsx` and sub-pages
5. `app/careers/page.tsx`
6. `app/community/page.tsx`
7. `app/workflows/page.tsx`
8. `app/admin/page.tsx`
9. `app/offline/page.tsx`
10. `app/not-found.tsx`
11. `app/error.tsx`
12. `app/global-error.tsx`
13. `app/loading.tsx`

**Tasks:**
- Update each page systematically
- Handle edge cases and error states
- Update 404 and error pages
- Ensure offline page works
- Update admin pages

**Success Criteria:**
- All pages updated
- Error states handled
- Edge cases covered
- No broken pages

**Estimated Time:** 12-16 hours

---

### Phase 9: Mobile & Responsive Optimization

**Goal:** Ensure all redesigned pages work perfectly on mobile

**Tasks:**
1. Test all pages on mobile viewports
2. Update mobile-specific components
   - `src/components/mobile/mobile-navigation.tsx`
   - `src/components/mobile/mobile-dashboard.tsx`
   - `src/components/mobile/mobile-dashboard-enhanced.tsx`
   - `src/components/mobile/mobile-dashboard-widgets.tsx`
   - `src/components/mobile/mobile-gestures.tsx`
   - `src/components/mobile/mobile-pwa-provider.tsx`
   - `src/components/mobile/pwa-install-prompt.tsx`
   - `src/components/mobile/voice-task-creator.tsx`
   - `src/components/mobile/mobile-chat-interface.tsx`

3. Verify responsive breakpoints
4. Test touch interactions
5. Optimize mobile performance
6. Ensure PWA functionality

**Success Criteria:**
- All pages responsive
- Mobile components updated
- Touch interactions work
- Performance optimized
- PWA functional

**Estimated Time:** 8-12 hours

---

### Phase 10: Testing, Quality Assurance & Polish

**Goal:** Comprehensive testing and final polish

**Testing Tasks:**

1. **Visual Testing**
   - Test all pages in Balanced mode
   - Test all pages in Aggressive mode
   - Verify color consistency
   - Check glitch effects work
   - Verify animations are smooth

2. **Functional Testing**
   - Test all forms
   - Test all buttons and links
   - Test navigation
   - Test theme switching
   - Verify no broken features

3. **Accessibility Testing**
   - Run Lighthouse audits
   - Test with screen readers
   - Verify keyboard navigation
   - Check color contrast
   - Verify ARIA labels

4. **Performance Testing**
   - Check page load times
   - Verify no layout shifts
   - Check animation performance
   - Optimize images and assets
   - Verify bundle sizes

5. **Cross-Browser Testing**
   - Test in Chrome
   - Test in Firefox
   - Test in Safari
   - Test in Edge
   - Verify compatibility

6. **Code Quality**
   - Run linter and fix all errors
   - Run TypeScript compiler
   - Verify no console errors
   - Check for unused code
   - Verify production build

**Success Criteria:**
- Zero lint errors
- Zero TypeScript errors
- Zero console errors
- Lighthouse score > 90
- All accessibility checks pass
- All pages functional
- Performance optimized

**Estimated Time:** 12-16 hours

---

## Implementation Guidelines

### Color Replacement Strategy

**Systematic Approach:**
1. Search for old color patterns: `from-purple`, `to-pink`, `bg-purple`, `text-purple`, etc.
2. Replace with new cyberpunk colors based on context:
   - Primary actions → `neon-cyan`
   - Success states → `neon-lime`
   - Error states → `neon-magenta`
   - Warning states → `neon-orange`
   - Special accents → `neon-purple`
3. Use semantic variants when appropriate (success, error, warning, info)
4. Update background colors to `dark-bg`, `dark-card`, `dark-hover`

### Component Migration Strategy

**For Each Component:**
1. Identify old design patterns
2. Map to new design system components
3. Replace old components with new ones
4. Update props and variants
5. Test functionality
6. Verify accessibility
7. Check responsive behavior

### Page Migration Strategy

**For Each Page:**
1. Read the entire page file
2. Identify all old design elements
3. Create migration checklist
4. Replace systematically:
   - Colors first
   - Components second
   - Layout third
   - Animations fourth
5. Test the page
6. Verify in both theme modes
7. Check mobile responsiveness

### Quality Checklist (Per Page/Component)

- [ ] All purple/pink gradients replaced
- [ ] All buttons use PrimaryButton or Button
- [ ] All headings use Heading component
- [ ] All text uses Text component (where appropriate)
- [ ] All cards use cyberpunk styling
- [ ] All alerts use Alert component
- [ ] All loading states use Loading component
- [ ] Colors use new cyberpunk palette
- [ ] Typography uses Orbitron/JetBrains Mono
- [ ] Theme modes work correctly (Balanced/Aggressive)
- [ ] Mobile responsive
- [ ] Accessible (keyboard nav, screen readers)
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] No lint errors
- [ ] Functionality preserved
- [ ] Performance acceptable

---

## Risk Mitigation

### Build Stability
- **Risk:** Breaking changes cause build failures
- **Mitigation:** Fix build errors immediately in Phase 0, test after each phase

### Functionality Loss
- **Risk:** Migration breaks existing features
- **Mitigation:** Test each page/component after migration, preserve functionality over styling

### Performance Degradation
- **Risk:** New design system impacts performance
- **Mitigation:** Optimize animations, use CSS-only effects, lazy load heavy components

### Inconsistency
- **Risk:** Mixed old and new design patterns
- **Mitigation:** Systematic migration, comprehensive checklist, code reviews

### User Experience
- **Risk:** Changes confuse users
- **Mitigation:** Maintain functionality, improve UX, test thoroughly

---

## Success Metrics

### Quantitative
- ✅ 0 build errors
- ✅ 0 TypeScript errors
- ✅ 0 lint errors
- ✅ 0 purple/pink gradient references remaining
- ✅ 100% of pages migrated
- ✅ 100% of components migrated
- ✅ Lighthouse score > 90
- ✅ Accessibility score > 95

### Qualitative
- ✅ Consistent cyberpunk aesthetic throughout
- ✅ Professional appearance
- ✅ Smooth animations
- ✅ Excellent user experience
- ✅ Production-ready quality

---

## Timeline Estimate

**Total Estimated Time:** 120-180 hours

**Breakdown:**
- Phase 0: 2-4 hours (CRITICAL - must complete first)
- Phase 1: 8-12 hours
- Phase 2: 16-24 hours
- Phase 3: 8-12 hours
- Phase 4: 6-8 hours
- Phase 5: 20-30 hours
- Phase 6: 30-40 hours
- Phase 7: 40-60 hours
- Phase 8: 12-16 hours
- Phase 9: 8-12 hours
- Phase 10: 12-16 hours

**Recommended Approach:**
- Complete Phase 0 immediately (build must work)
- Work through phases sequentially
- Test after each phase
- Don't skip phases
- Maintain build stability throughout

---

## Next Steps

1. **Immediate:** Complete Phase 0 - Fix all build errors
2. **Then:** Begin Phase 1 - Update shared components
3. **Continue:** Work through phases systematically
4. **Test:** After each phase, verify build and functionality
5. **Document:** Update this plan as work progresses

---

## Notes

- This is a comprehensive migration affecting 200+ files
- Quality over speed - ensure production standards
- Test thoroughly at each phase
- Maintain functionality while updating design
- Keep build working throughout migration
- Document any deviations from plan

---

**Document Status:** Ready for Implementation  
**Last Updated:** 2025-12-20  
**Version:** 1.0
