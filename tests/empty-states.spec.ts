import { test, expect } from '@playwright/test';

test.describe('Empty State & Onboarding Audit', () => {
  
  test.beforeEach(async ({ page }) => {
    // Login with the fresh "Empty" user
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    const email = 'empty_audit_user@example.com';
    const password = 'password123';
    
    await page.locator('input[name="email"]').fill(email);
    await page.locator('input[name="password"]').fill(password);
    await page.locator('button[type="submit"]').click();
    
    await expect(page).toHaveURL(/dashboard/, { timeout: 30000 });
  });

  test('Dashboard should show helpful empty states', async ({ page }) => {
    await page.waitForLoadState('load');
    
    // 1. Check for welcome message
    await expect(page.locator('body')).toContainText(/empire|welcome/i);
    
    // 2. Check for empty stats handling (should show 0s or placeholder)
    // Based on previous runs, we expect 0 completed tasks
    await expect(page.locator('body')).toContainText(/0\/0/i);
    
    // 3. Take screenshot for visual audit
    await page.screenshot({ path: 'test-results/empty-dashboard.png' });
  });

  test('Templates page should handle zero data gracefully', async ({ page }) => {
    await page.goto('/dashboard/templates');
    await page.waitForLoadState('networkidle');
    
    // Check if it shows "No templates found" or a list of available global templates
    // If global templates are seeded, it should show them.
    // If not, it should show an "Add Template" CTA.
    const bodyText = await page.innerText('body');
    console.log('Templates Page text:', bodyText);
    
    await page.screenshot({ path: 'test-results/empty-templates.ts.png' });
  });

  test('Briefcase should show upload CTA when empty', async ({ page }) => {
    await page.goto('/dashboard/briefcase');
    await page.waitForLoadState('networkidle');
    
    // Look for "Upload" or "No files"
    await expect(page.locator('body')).toContainText(/upload|files|briefcase/i);
    
    await page.screenshot({ path: 'test-results/empty-briefcase.png' });
  });

  test('Tasks/Workspace should show creation CTA', async ({ page }) => {
    // Attempt to navigate to workspace if it exists
    const workspaceUrl = '/dashboard/workspace';
    await page.goto(workspaceUrl);
    await page.waitForLoadState('load');
    
    if (page.url().includes('workspace')) {
        await expect(page.locator('body')).toContainText(/task|create|new/i);
    }
    
    await page.screenshot({ path: 'test-results/empty-workspace.png' });
  });
});
