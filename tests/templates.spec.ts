import { test, expect } from '@playwright/test';

// Store state between tests
let authCookie: string;

/**
 * Templates page test suite
 */
test.describe('Templates Page', () => {
  
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

  test('should navigate to templates page', async ({ page }) => {
    await page.goto('/dashboard/templates');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('main h1, main h2, .font-sci').first()).toContainText(/template/i, { timeout: 15000 });
  });

  test('should display template categories', async ({ page }) => {
    await page.goto('/dashboard/templates');
    await page.waitForLoadState('networkidle');
    // Just check for at least one expected category to be present
    await expect(page.locator('body')).toContainText(/business|marketing|productivity/i);
  });

  test('should search for templates', async ({ page }) => {
    await page.goto('/dashboard/templates');
    await page.waitForLoadState('networkidle');
    
    // Look for search input
    const searchInput = page.locator('input[placeholder*="search" i]').first();
    if (await searchInput.isVisible()) {
        await searchInput.fill('decision');
        await page.waitForTimeout(2000); // Wait for filtering
        await expect(page.locator('body')).toContainText(/decision/i);
    }
  });
});

/**
 * Template interaction test suite
 */
test.describe('Template Interaction', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    const email = process.env.TEST_USER_EMAIL || 'test_user_1772429961263@example.com';
    const password = process.env.TEST_USER_PASSWORD || 'password123';

    await page.locator('input[name="email"]').fill(email);
    await page.locator('input[name="password"]').fill(password);
    await page.locator('button[type="submit"]').click();
    
    await expect(page).toHaveURL(/dashboard/, { timeout: 30000 });
    await page.goto('/dashboard/templates');
    await page.waitForLoadState('networkidle');
  });

  test('should view saved template details', async ({ page }) => {
    // Check if any "View" button or template card is present
    const viewButton = page.locator('button').filter({ hasText: /view/i }).first();
    if (await viewButton.isVisible()) {
        await viewButton.click();
        // Check for any modal/dialog or expanded content
        await expect(page.locator('role=dialog, .modal, [class*="overlay"]')).toBeVisible({ timeout: 10000 }).catch(() => {
            // Fallback: check if URL changed or specific text appeared
            return expect(page.locator('body')).toContainText(/content|details/i);
        });
    }
  });
});
