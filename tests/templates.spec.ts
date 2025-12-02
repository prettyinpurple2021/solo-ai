import { test, expect } from '@playwright/test';

// Store state between tests
let authCookie: string = '';
/**
 * Templates page test suite
 * Tests template browsing, filtering, and interaction
 */
test.describe('Templates Page', () => {
  // Store state between tests


  test.beforeEach(async ({ page }) => {
    // Set auth cookie if available from previous tests
    if (authCookie) {
      await page.context().addCookies([
        {
          name: 'auth-token',
          value: authCookie,
          domain: 'localhost',
          path: '/',
        },
      ]);
    } else {
      // Sign in if no cookie available
      await page.goto('/sign-in');
      await page.getByLabel(/email/i).fill(process.env.TEST_USER_EMAIL || 'test@example.com');
      await page.getByLabel(/password/i).fill(process.env.TEST_USER_PASSWORD || 'password123');
      await page.getByRole('button', { name: /sign in/i }).click();
      await expect(page).toHaveURL(/dashboard/, { timeout: 10000 });

      // Store auth cookie for subsequent tests
      const cookies = await page.context().cookies();
      const authCookieObj = cookies.find(c => c.name === 'auth-token');
      authCookie = authCookieObj ? authCookieObj.value : '';
    }
  });

  test('should navigate to templates page', async ({ page }) => {
    // Navigate to templates page
    await page.goto('/templates');

    // Verify templates page elements
    await expect(page.getByRole('heading', { name: /templates/i })).toBeVisible();
    await expect(page.getByText(/browse our template library/i)).toBeVisible();
  });

  test('should display template categories', async ({ page }) => {
    // Navigate to templates page
    await page.goto('/templates');

    // Verify template categories are displayed
    await expect(page.getByText(/business operations/i)).toBeVisible();
    await expect(page.getByText(/productivity & planning/i)).toBeVisible();
    await expect(page.getByText(/marketing & sales/i)).toBeVisible();
  });

  test('should navigate to individual template page', async ({ page }) => {
    // Navigate to templates page
    await page.goto('/templates');

    // Click on a template (decision dashboard is a common one)
    await page.goto('/templates/decision-dashboard');

    // Verify template page elements
    await expect(page.getByRole('heading', { name: /decision dashboard/i })).toBeVisible();
    await expect(page.getByText(/template details/i)).toBeVisible();
  });

  test('should save a template', async ({ page }) => {
    // Navigate to a template page
    await page.goto('/templates/decision-dashboard');

    // Click save button
    await page.getByRole('button', { name: /save template/i }).click();

    // Verify success toast appears
    await expect(page.getByText(/template saved/i)).toBeVisible({ timeout: 5000 });

    // Navigate to saved templates
    await page.goto('/dashboard/templates');

    // Verify template appears in saved list
    await expect(page.getByText(/decision dashboard/i)).toBeVisible({ timeout: 5000 });
  });

  test('should search for templates', async ({ page }) => {
    // Navigate to templates page
    await page.goto('/templates');

    // Type in search box
    await page.getByPlaceholder(/search templates/i).fill('decision');

    // Verify filtered results
    await expect(page.getByText(/decision dashboard/i)).toBeVisible();

    // Clear search
    await page.getByPlaceholder(/search templates/i).fill('');
  });
});

/**
 * Template interaction test suite
 * Tests template viewing, exporting, and deleting
 */
test.describe('Template Interaction', () => {
  test.beforeEach(async ({ page }) => {
    // Set auth cookie if available from previous tests
    if (authCookie) {
      await page.context().addCookies([
        {
          name: 'auth-token',
          value: authCookie,
          domain: 'localhost',
          path: '/',
        },
      ]);
    } else {
      // Sign in if no cookie available
      await page.goto('/sign-in');
      await page.getByLabel(/email/i).fill(process.env.TEST_USER_EMAIL || 'test@example.com');
      await page.getByLabel(/password/i).fill(process.env.TEST_USER_PASSWORD || 'password123');
      await page.getByRole('button', { name: /sign in/i }).click();
      await expect(page).toHaveURL(/dashboard/, { timeout: 10000 });
    }

    // Navigate to saved templates
    await page.goto('/dashboard/templates');
  });

  test('should view saved template', async ({ page }) => {
    // Wait for templates to load
    await page.waitForSelector('button:has-text("View")', { timeout: 10000 });

    // Click view button on first template
    await page.getByRole('button', { name: /view/i }).first().click();

    // Verify template dialog appears
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText(/template data from/i)).toBeVisible();

    // Close dialog
    await page.keyboard.press('Escape');
  });

  test('should export saved template', async ({ page }) => {
    // Wait for templates to load
    await page.waitForSelector('button:has-text("Export")', { timeout: 10000 });

    // Setup download listener
    const downloadPromise = page.waitForEvent('download');

    // Click export button on first template
    await page.getByRole('button', { name: /export/i }).first().click();

    // Wait for download to start
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('.json');

    // Verify success toast appears
    await expect(page.getByText(/template exported/i)).toBeVisible({ timeout: 5000 });
  });

  test('should delete saved template', async ({ page }) => {
    // Wait for templates to load
    await page.waitForSelector('button:has-text("Export")', { timeout: 10000 });

    // Count templates before deletion
    const templateCountBefore = await page.locator('.boss-card').count();

    // Click delete button (trash icon) on first template
    await page.locator('button:has(.lucide-trash-2)').first().click();

    // Verify success toast appears
    await expect(page.getByText(/template deleted/i)).toBeVisible({ timeout: 5000 });

    // Verify template count decreased
    await expect(async () => {
      const templateCountAfter = await page.locator('.boss-card').count();
      expect(templateCountAfter).toBe(templateCountBefore - 1);
    }).toPass({ timeout: 5000 });
  });
});