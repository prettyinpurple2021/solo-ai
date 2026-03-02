import { test, expect } from '@playwright/test';

// Store state between tests
let authCookie: string;

/**
 * Authentication flow test suite
 */
test.describe('Authentication Flow', () => {
  
  test('should navigate to login page', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    // Header is "WELCOME BACK"
    await expect(page.locator('h1, h2')).toContainText([/welcome back/i]);
    
    // Verify inputs by name attribute which is highly stable
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should show error with invalid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    await page.locator('input[name="email"]').fill('invalid@example.com');
    await page.locator('input[name="password"]').fill('wrongpassword');
    await page.locator('button[type="submit"]').click();
    
    // The UI shows "Invalid credentials." based on the curl output
    await expect(page.locator('div, p, span')).toContainText([/invalid credentials/i], { timeout: 15000 });
  });

  test('should sign in with valid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    const email = process.env.TEST_USER_EMAIL || 'test_user_1772429961263@example.com';
    const password = process.env.TEST_USER_PASSWORD || 'password123';

    await page.locator('input[name="email"]').fill(email);
    await page.locator('input[name="password"]').fill(password);
    await page.locator('button[type="submit"]').click();
    
    // Wait for redirect to dashboard with a generous timeout
    await expect(page).toHaveURL(/dashboard/, { timeout: 30000 });
    
    // Verify user is signed in - The actual UI says "Welcome to Your Empire! 👑"
    await expect(page.locator('body')).toContainText(/empire/i, { timeout: 15000 });
    
    // Store cookies
    const cookies = await page.context().cookies();
    const authCookieObj = cookies.find(c => c.name.includes('session-token'));
    authCookie = authCookieObj ? authCookieObj.value : '';
  });
});

/**
 * Templates flow test suite
 */
test.describe('Templates Flow', () => {
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
    // Using a very specific locator for the header to avoid strict mode violations
    await expect(page.locator('main h1, main h2').first()).toContainText(/template/i, { timeout: 15000 });
  });
});
