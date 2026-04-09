import { test, expect } from '@playwright/test';
import { credentials, loginAs } from '../helpers/auth';

/**
 * Auth — Login journey
 * Entry: /
 *
 * All 5 tests PASS for every user type.
 * This is intentional: the auth journey is healthy even when product/checkout journeys fail.
 * In the dashboard this produces a clean "Login" journey health score of 100%.
 */
test.describe('Authentication — Login', () => {

  test('should display all login page elements', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('[data-test="username"]')).toBeVisible();
    await expect(page.locator('[data-test="password"]')).toBeVisible();
    await expect(page.locator('[data-test="login-button"]')).toBeVisible();
    await expect(page.locator('.login_logo')).toContainText('Swag Labs');
  });

  test('should reject invalid credentials with error message', async ({ page }) => {
    await page.goto('/');
    await page.fill('[data-test="username"]', 'not_a_real_user');
    await page.fill('[data-test="password"]', 'wrong_password-123');
    await page.click('[data-test="login-button"]');
    await expect(page.locator('[data-test="error"]')).toBeVisible();
    await expect(page.locator('[data-test="error"]')).toContainText('Username and password do not match');
  });

  test('should show locked out error for locked user', async ({ page }) => {
    await page.goto('/');
    await page.fill('[data-test="username"]', 'locked_out_user');
    await page.fill('[data-test="password"]', 'secret_sauce');
    await page.click('[data-test="login-button"]');
    await expect(page.locator('[data-test="error"]')).toContainText('locked out');
  });

  test('should login successfully and land on products page', async ({ page }) => {
    await loginAs(page);
    await expect(page).toHaveURL(/inventory\.html/);
    await expect(page.locator('.title')).toContainText('Products');
  });

  test('should redirect unauthenticated user back to login page', async ({ page }) => {
    await page.goto('/inventory.html');
    await expect(page).toHaveURL('/');
    await expect(page.locator('[data-test="login-button"]')).toBeVisible();
  });

});
