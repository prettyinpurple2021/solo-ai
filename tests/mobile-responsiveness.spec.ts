import { test, expect } from '@playwright/test';

test.describe('Mobile Responsiveness Audit', () => {
  
  test('Login Page should be responsive', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    // 1. Check for horizontal overflow (allow 5px margin for sub-pixel/rendering quirks)
    const overflowAmount = await page.evaluate(() => {
      return document.documentElement.scrollWidth - document.documentElement.clientWidth;
    });
    expect(overflowAmount).toBeLessThanOrEqual(5);
    
    // 2. Check visibility of core elements
    await expect(page.locator('input[name="email"]')).toBeInViewport();
    await expect(page.locator('input[name="password"]')).toBeInViewport();
    await expect(page.locator('button[type="submit"]')).toBeInViewport();
    
    // 3. Take screenshot for manual audit
    await page.screenshot({ path: `test-results/mobile-login-${test.info().project.name}.png` });
  });

  test('Dashboard should be responsive', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    const email = process.env.TEST_USER_EMAIL || 'test_user_1772429961263@example.com';
    const password = process.env.TEST_USER_PASSWORD || 'password123';
    await page.locator('input[name="email"]').fill(email);
    await page.locator('input[name="password"]').fill(password);
    await page.locator('button[type="submit"]').click();
    await expect(page).toHaveURL(/dashboard/, { timeout: 30000 });
    
    // Audit Dashboard
    await page.waitForLoadState('load');
    await expect(page.locator('body')).toContainText(/empire/i, { timeout: 60000 });
    
    // 1. Check for horizontal overflow (allow 5px margin for sub-pixel/rendering quirks)
    const overflowAmount = await page.evaluate(() => {
      return document.documentElement.scrollWidth - document.documentElement.clientWidth;
    });
    expect(overflowAmount).toBeLessThanOrEqual(5);
    
    // 2. Verify sidebar/menu behavior (should likely be collapsed or a hamburger)
    // Check if body contains common dashboard text without horizontal scroll
    await expect(page.locator('body')).toContainText(/empire/i);
    
    // 3. Take screenshot
    await page.screenshot({ path: `test-results/mobile-dashboard-${test.info().project.name}.png`, fullPage: true });
  });
});
