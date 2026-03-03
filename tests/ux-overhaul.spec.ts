import { test, expect } from '@playwright/test';

test.describe('Elite UX Overhaul: Command Center Visuals', () => {
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

  test('HUD Elements: Real-time status visibility', async ({ page }) => {
    // Check for HUD Command Header
    await expect(page.locator('text=/Neural Syndicate/i')).toBeVisible({ timeout: 15000 });
    
    // Check for Tickers
    await expect(page.locator('text=/Real-time MRR/i')).toBeVisible();
    await expect(page.locator('text=/Growth Index/i')).toBeVisible();
    
    // Check for Security Grid
    await expect(page.locator('text=/Security Grid/i')).toBeVisible();
  });

  test('Immersive Visuals: Intelligence Radar', async ({ page }) => {
    // Verify Radar exists on dashboard
    await expect(page.locator('text=/AI Intelligence Radar/i')).toBeVisible({ timeout: 15000 });
    
    // Check for Radar Canvas/SVG element (via its unique characteristics)
    const radar = page.locator('text=/RADAR_ACTIVE/i');
    await expect(radar).toBeVisible();
  });

  test('Predictive Analytics: Chart interaction', async ({ page }) => {
    await page.goto('/dashboard/analytics');
    
    // Verify Predictive Chart loads
    await expect(page.locator('text=/Daily Revenue/i')).toBeVisible({ timeout: 15000 });
    
    // Verify "Actual" and "Projected" legend labels
    await expect(page.locator('text=/Actual/i')).toBeVisible();
    await expect(page.locator('text=/Projected/i')).toBeVisible();
  });

  test('Transitions: Page motion verification', async ({ page }) => {
    // Navigate between pages and check for transition consistency
    await page.goto('/dashboard');
    await expect(page.locator('h1')).toContainText(/Welcome/i);
    
    await page.goto('/dashboard/analytics');
    await expect(page.locator('h1')).toContainText(/Analytics/i);
    
    // Visual check for blur/opacity would require screenshot testing, 
    // but we can verify the link navigation works without crash.
  });
});
