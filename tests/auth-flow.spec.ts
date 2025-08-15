import { test, expect } from '@playwright/test';

/**
 * Authentication flow test suite
 * Tests sign-in, profile update, and sign-out functionality
 */
test.describe('Authentication Flow', () => {
  // Store state between tests
  let authCookie: string;
  
  test('should navigate to sign-in page', async ({ page }) => {
    // Navigate to sign-in page
    await page.goto('/sign-in');
    
    // Verify sign-in page elements
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('should show error with invalid credentials', async ({ page }) => {
    // Navigate to sign-in page
    await page.goto('/sign-in');
    
    // Fill in invalid credentials
    await page.getByLabel(/email/i).fill('invalid@example.com');
    await page.getByLabel(/password/i).fill('wrongpassword');
    
    // Submit form
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Verify error message appears
    await expect(page.getByText(/invalid email or password/i)).toBeVisible({ timeout: 5000 });
  });

  test('should sign in with valid credentials', async ({ page }) => {
    // Navigate to sign-in page
    await page.goto('/sign-in');
    
    // Fill in valid test credentials
    // Note: These should be environment variables in a real test
    await page.getByLabel(/email/i).fill(process.env.TEST_USER_EMAIL || 'test@example.com');
    await page.getByLabel(/password/i).fill(process.env.TEST_USER_PASSWORD || 'password123');
    
    // Submit form
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Wait for redirect to dashboard
    await expect(page).toHaveURL(/dashboard/, { timeout: 10000 });
    
    // Verify user is signed in
    await expect(page.getByText(/welcome back/i)).toBeVisible({ timeout: 5000 });
    
    // Store auth cookie for subsequent tests
    const cookies = await page.context().cookies();
    const authCookieObj = cookies.find(c => c.name === 'auth-token');
    authCookie = authCookieObj ? authCookieObj.value : '';
    expect(authCookie).toBeTruthy();
  });
});

/**
 * Templates flow test suite
 * Tests template listing, viewing, exporting, and deleting
 */
test.describe('Templates Flow', () => {
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
  });

  test('should navigate to templates page', async ({ page }) => {
    // Navigate to templates page
    await page.goto('/dashboard/templates');
    
    // Verify templates page elements
    await expect(page.getByRole('heading', { name: /templates/i })).toBeVisible();
  });

  test('should view template details', async ({ page }) => {
    // Navigate to templates page
    await page.goto('/dashboard/templates');
    
    // Wait for templates to load
    await page.waitForSelector('[data-testid^="template-export-"]', { timeout: 10000 });
    
    // Click view button on first template
    await page.getByRole('button', { name: /view/i }).first().click();
    
    // Verify template dialog appears
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText(/template data from/i)).toBeVisible();
  });

  test('should export template', async ({ page }) => {
    // Navigate to templates page
    await page.goto('/dashboard/templates');
    
    // Wait for templates to load
    await page.waitForSelector('[data-testid^="template-export-"]', { timeout: 10000 });
    
    // Setup download listener
    const downloadPromise = page.waitForEvent('download');
    
    // Click export button on first template
    await page.locator('[data-testid^="template-export-"]').first().click();
    
    // Wait for download to start
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('.json');
  });

  test('should delete template', async ({ page }) => {
    // Navigate to templates page
    await page.goto('/dashboard/templates');
    
    // Wait for templates to load
    await page.waitForSelector('[data-testid^="template-delete-"]', { timeout: 10000 });
    
    // Count templates before deletion
    const templateCountBefore = await page.locator('[data-testid^="template-delete-"]').count();
    
    // Click delete button on first template
    await page.locator('[data-testid^="template-delete-"]').first().click();
    
    // Verify success toast appears
    await expect(page.getByText(/template deleted/i)).toBeVisible({ timeout: 5000 });
    
    // Verify template count decreased
    await expect(async () => {
      const templateCountAfter = await page.locator('[data-testid^="template-delete-"]').count();
      expect(templateCountAfter).toBe(templateCountBefore - 1);
    }).toPass({ timeout: 5000 });
  });
});

/**
 * Profile flow test suite
 * Tests profile viewing and updating
 */
test.describe('Profile Flow', () => {
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
  });

  test('should open profile modal', async ({ page }) => {
    // Navigate to dashboard
    await page.goto('/dashboard');
    
    // Click on profile/avatar button
    await page.getByRole('button', { name: /profile/i }).click();
    
    // Verify profile modal appears
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText(/boss profile settings/i)).toBeVisible();
  });

  test('should update profile name', async ({ page }) => {
    // Navigate to dashboard
    await page.goto('/dashboard');
    
    // Click on profile/avatar button
    await page.getByRole('button', { name: /profile/i }).click();
    
    // Wait for profile modal
    await expect(page.getByRole('dialog')).toBeVisible();
    
    // Generate unique name
    const uniqueName = `Test User ${Date.now()}`;
    
    // Update name field
    await page.getByLabel(/full name/i).fill(uniqueName);
    
    // Save changes
    await page.getByRole('button', { name: /save changes/i }).click();
    
    // Verify success toast appears
    await expect(page.getByText(/profile updated/i)).toBeVisible({ timeout: 5000 });
    
    // Reopen profile modal to verify changes persisted
    await page.getByRole('button', { name: /profile/i }).click();
    
    // Verify name was updated
    await expect(page.getByLabel(/full name/i)).toHaveValue(uniqueName);
  });
});
