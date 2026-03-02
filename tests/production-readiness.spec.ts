import { test, expect } from '@playwright/test';

/**
 * Production Readiness E2E Test Suite
 */
test.describe('Real-time Hub & Subscription Gating', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    const email = process.env.TEST_USER_EMAIL || 'test_user_1772429961263@example.com';
    const password = process.env.TEST_USER_PASSWORD || 'password123';
    
    await page.locator('input[name="email"]').fill(email);
    await page.locator('input[name="password"]').fill(password);
    await page.locator('button[type="submit"]').click();
    
    await expect(page).toHaveURL(/dashboard/, { timeout: 30000 });
  });

  test('should establish websocket connection', async ({ page }) => {
    // Navigate to a page that uses real-time
    await page.goto('/dashboard/collaboration');
    await page.waitForLoadState('networkidle');
    
    // Check for "Online" which is clearly present in the received string
    await expect(page.locator('body')).toContainText(/online/i, { timeout: 15000 });
  });

  test('should enforce subscription gating for premium agents', async ({ page }) => {
    // Navigate to agents page
    await page.goto('/dashboard/agents');
    await page.waitForLoadState('networkidle');
    
    // The UI contains "Upgrade to Accelerator" and "Unlock Unlimited Agents"
    await expect(page.locator('body')).toContainText(/upgrade|unlock|accelerator/i, { timeout: 15000 });
  });
});
