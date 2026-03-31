import { test, expect } from '@playwright/test';
import { loginAs } from '../helpers/auth';

/**
 * Inventory — Product Detail journey
 * Entry: /inventory-item.html
 *
 * Failures with problem_user (1 of 4):
 *   FAIL - should display correct product image on detail page
 *          (problem_user shows wrong image on detail pages — all products show same image)
 *
 * This test ties the image bug back to the Product Catalog cluster already seen in browse.spec.ts.
 * Dashboard shows these co-failing across different spec files → higher confidence cluster.
 */
test.describe('Inventory — Product Detail Pages', () => {

  test.beforeEach(async ({ page }) => {
    await loginAs(page);
    await page.goto('/inventory.html');
  });

  test('should navigate to product detail page on name click', async ({ page }) => {
    await page.locator('.inventory_item_name').first().click();
    await expect(page).toHaveURL(/inventory-item\.html/);
  });

  test('should display product name and price on detail page', async ({ page }) => {
    await page.locator('.inventory_item_name').first().click();
    await expect(page).toHaveURL(/inventory-item\.html/);
    await expect(page.locator('.inventory_details_name')).toBeVisible();
    await expect(page.locator('.inventory_details_price')).toContainText('$');
  });

  test('should display correct product image on detail page', async ({ page }) => {
    // Navigate to Sauce Labs Backpack detail page
    await page.goto('/inventory-item.html?id=4');
    const imgSrc = await page.locator('.inventory_details_img').getAttribute('src');
    // problem_user: shows a different product's image (wrong src)
    expect(imgSrc).toContain('backpack');
  });

  test('should add product to cart from detail page', async ({ page }) => {
    await page.locator('.inventory_item_name').first().click();
    await page.locator('[data-test^="add-to-cart"]').click();
    await expect(page.locator('.shopping_cart_badge')).toHaveText('1');
  });

});
