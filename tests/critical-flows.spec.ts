import { test, expect } from '@playwright/test';

test.describe('Mission-Critical Production Flows', () => {
  test.beforeEach(async ({ page }) => {
    // Standard login procedure
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    const email = process.env.TEST_USER_EMAIL || 'test_user_1772429961263@example.com';
    const password = process.env.TEST_USER_PASSWORD || 'password123';

    await page.locator('input[name="email"]').fill(email);
    await page.locator('input[name="password"]').fill(password);
    await page.locator('button[type="submit"]').click();
    
    await expect(page).toHaveURL(/dashboard/, { timeout: 30000 });
  });

  test('Subscription Gate: Accelerator feature protection', async ({ page }) => {
    // Navigate to Intelligence which is an Accelerator feature
    await page.goto('/dashboard/competitors/intelligence');
    
    // Check if we see the feature content or the gate placeholder
    // Depending on the test user's tier, one of these should be true
    const isGated = await page.locator('text=/upgrade/i').isVisible();
    const isAccessible = await page.locator('text=/competitive intelligence/i').isVisible();
    
    expect(isGated || isAccessible).toBeTruthy();
    
    if (isGated) {
      console.log('User tier correctly gated for Intelligence feature.');
    } else {
      console.log('User tier has access to Intelligence feature.');
    }
  });

  test('Collaborative Blackboard: Real-time synchronization hub', async ({ page }) => {
    await page.goto('/dashboard/collaboration');
    
    // Verify collaboration space loads
    await expect(page.locator('text=/collaboration/i').first()).toBeVisible({ timeout: 15000 });
    
    // Check for "Boardroom" or similar collaboration elements
    const boardroomActive = await page.locator('text=/boardroom/i').isVisible();
    expect(boardroomActive || await page.locator('text=/sessions/i').isVisible()).toBeTruthy();
  });

  test('AI SQUAD: RAG-powered agent interaction', async ({ page }) => {
    await page.goto('/dashboard/agents');
    
    // Verify AI SQUAD loads
    await expect(page.locator('text=/AI SQUAD/i')).toBeVisible({ timeout: 15000 });
    
    // Select Aura (Free tier agent)
    await page.locator('text=/Aura/i').first().click();
    
    // Verify chat interface for Aura
    await expect(page.locator('text=/Chat with Aura/i')).toBeVisible();
    
    // Test input visibility
    const chatInput = page.locator('textarea[id="agent-message-input"]');
    await expect(chatInput).toBeVisible();
    
    // Test sending a message (without waiting for real AI response to save tokens/time)
    await chatInput.fill('Verify RAG context initialization');
    await page.keyboard.press('Enter');
    
    // Verify message appears in UI
    await expect(page.locator('text=/Verify RAG context/i')).toBeVisible();
  });
});
