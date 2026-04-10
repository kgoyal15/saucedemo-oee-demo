import { test, expect } from '@playwright/test';
import { loginAs } from '../helpers/auth';

/**
 * Cart — Shopping Cart journey
 * Entry: /inventory.html → /cart.html
 *
 * Failures with problem_user (3 of 5):
 *   FAIL - should add multiple products including fleece jacket
 *          (Sauce Labs Fleece Jacket "Add to cart" button does nothing for problem_user)
 *   FAIL - should remove item and clear cart badge
 *          (cart badge persists after remove — known problem_user bug)
 *   FAIL - should remove item from cart page and update badge
 *          (same badge-update bug, triggered from cart page)
 *
 * These 3 failures share :
 *   - file_path_prefix:  tests/cart/
 *   - co_failure_pattern: all fail together across every run
 *   → Dashboard clusters them as "Cart Management" failure cluster
 */
test.describe('Cart — Shopping Cart Management', () => {

  test.beforeEach(async ({ page }) => {
    await loginAs(page);
    await page.goto('/inventory.html');
  });

  test('should add a single product to cart', async ({ page }) => {
    await page.click('[data-test="add-to-cart-sauce-labs-backpack"]');
    await expect(page.locator('.shopping_cart_badge')).toHaveText('1');
  });

  test('should add multiple products including fleece jacket to cart', async ({ page }) => {
    await page.click('[data-test="add-to-cart-sauce-labs-backpack"]');
    await page.click('[data-test="add-to-cart-sauce-labs-bike-light"]');
    // problem_user: this button click does nothing — cart count stays at 2
    await page.click('[data-test="add-to-cart-sauce-labs-fleece-jacket"]');
    await expect(page.locator('.shopping_cart_badge')).toHaveText('3');
  });

  test('should remove item from catalog and clear cart badge', async ({ page }) => {
    await page.click('[data-test="add-to-cart-sauce-labs-backpack"]');
    await page.click('[data-test="remove-sauce-labs-backpack"]');
    // problem_user: badge stays visible after remove
    await expect(page.locator('.shopping_cart_badge')).not.toBeVisible();
  });

  test('should display correct item in cart after adding', async ({ page }) => {
    await page.click('[data-test="add-to-cart-sauce-labs-bolt-t-shirt"]');
    await page.goto('/cart.html');
    await expect(page.locator('.cart_item')).toHaveCount(1);
    await expect(page.locator('.inventory_item_name')).toContainText('Sauce Labs Bolt T-Shirt');
  });

  test('should update cart badge after removing item from cart page', async ({ page }) => {
    await page.click('[data-test="add-to-cart-sauce-labs-onesie"]');
    await page.goto('/cart.html');
    await page.click('[data-test="remove-sauce-labs-onesie"]');
    await page.click('[data-test="continue-shopping"]');
    // problem_user: badge persists at "1" instead of disappearing
    await expect(page.locator('.shopping_cart_badge')).not.toBeVisible();
  });

});
