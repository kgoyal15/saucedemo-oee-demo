import { test, expect } from '@playwright/test';
import { loginAs } from '../helpers/auth';

/**
 * Checkout — Checkout Flow journey
 * Entry: /cart.html → /checkout-step-one.html
 *
 * Failures with problem_user (4 of 6):
 *   FAIL - should proceed to order summary with valid details
 *          (firstName input routes keystrokes to lastName — firstName stays empty → error)
 *   FAIL - should show error with missing postal code
 *          (same firstName bug: continues to get "First Name is required" not postal error)
 *   FAIL - should calculate order total with tax
 *          (can never reach step 2 — blocked at firstName field)
 *   FAIL - should complete full checkout flow and show confirmation
 *          (blocked at step 1 entirely)
 *
 * This is the most impactful cluster: 4 co-failing tests, same entry_url, same error class.
 * Dashboard shows "Checkout" journey as CRITICAL (health < 40%).
 * This is the "aha moment" of the demo — one bug causing 4 failures in one journey.
 */
test.describe('Checkout — Complete Purchase Flow', () => {

  test.beforeEach(async ({ page }) => {
    await loginAs(page);
    // Set up cart with one item, then navigate to checkout
    await page.goto('/inventory.html');
    await page.click('[data-test="add-to-cart-sauce-labs-backpack"]');
    await page.goto('/cart.html');
    await page.click('[data-test="checkout"]');
  });

  test('should display checkout information form', async ({ page }) => {
    await expect(page).toHaveURL(/checkout-step-one\.html/);
    await expect(page.locator('[data-test="firstName"]')).toBeVisible();
    await expect(page.locator('[data-test="lastName"]')).toBeVisible();
    await expect(page.locator('[data-test="postalCode"]')).toBeVisible();
  });

  test('should show error when submitting empty checkout form', async ({ page }) => {
    await page.click('[data-test="continue"]');
    await expect(page.locator('[data-test="error"]')).toBeVisible();
    await expect(page.locator('[data-test="error"]')).toContainText('First Name is required');
  });

  test('should show error with missing postal code', async ({ page }) => {
    await page.fill('[data-test="firstName"]', 'Test');
    await page.fill('[data-test="lastName"]', 'User');
    // problem_user: firstName keystrokes go to lastName — firstName stays empty
    // clicking continue shows "First Name is required" instead of "Postal Code is required"
    await page.click('[data-test="continue"]');
    await expect(page.locator('[data-test="error"]')).toContainText('Postal Code is required');
  });

  test('should proceed to order summary with valid checkout details', async ({ page }) => {
    await page.fill('[data-test="firstName"]', 'Test');
    await page.fill('[data-test="lastName"]', 'User');
    await page.fill('[data-test="postalCode"]', '12346');
    await page.click('[data-test="continue"]');
    await expect(page).toHaveURL(/checkout-step-two\.html/);
    await expect(page.locator('.cart_item')).toHaveCount(1);
    await expect(page.locator('.inventory_item_name')).toContainText('Sauce Labs Backpack');
  });

  test('should calculate and display order total with tax', async ({ page }) => {
    await page.fill('[data-test="firstName"]', 'Test');
    await page.fill('[data-test="lastName"]', 'User');
    await page.fill('[data-test="postalCode"]', '12345');
    await page.click('[data-test="continue"]');
    await expect(page).toHaveURL(/checkout-step-two\.html/);
    await expect(page.locator('.summary_subtotal_label')).toBeVisible();
    await expect(page.locator('.summary_tax_label')).toBeVisible();
    await expect(page.locator('.summary_total_label')).toContainText('Total: $');
  });

  test('should complete full checkout flow and show order confirmation', async ({ page }) => {
    await page.fill('[data-test="firstName"]', 'Test');
    await page.fill('[data-test="lastName"]', 'User');
    await page.fill('[data-test="postalCode"]', '12345');
    await page.click('[data-test="continue"]');
    await expect(page).toHaveURL(/checkout-step-two\.html/);
    await page.click('[data-test="finish"]');
    await expect(page).toHaveURL(/checkout-complete\.html/);
    await expect(page.locator('.complete-header')).toContainText('Thank you for your order');
  });

});
