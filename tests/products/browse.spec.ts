import { test, expect } from '@playwright/test';
import { loginAs } from '../helpers/auth';

/**
 * Products — Browse journey
 * Entry: /inventory.html
 *
 * Failures with problem_user (3 of 5):
 *   FAIL - should sort products by price low to high  (sort is broken, order unchanged)
 *   FAIL - should sort products by name Z to A         (sort is broken, order unchanged)
 *   FAIL - should display unique image per product     (all 6 products show same image)
 *
 * These 3 failures share:
 *   - file_path_prefix: tests/products/
 *   - entry_url: /inventory.html
 *   → Dashboard clusters them as "Product Catalog" failure cluster
 */
test.describe('Products — Browse Catalog', () => {

  test.beforeEach(async ({ page }) => {
    await loginAs(page);
  });

  test('should display all 6 products on the catalog page', async ({ page }) => {
    const items = page.locator('.inventory_item');
    await expect(items).toHaveCount(6);
  });

  test('should display product name and price for every item', async ({ page }) => {
    await expect(page.locator('.inventory_item_name').first()).toBeVisible();
    await expect(page.locator('.inventory_item_price').first()).toContainText('$');
  });

  test('should sort products by price low to high', async ({ page }) => {
    //await page.locator('[data-test="product_sort_container"]').waitFor({ state: 'visible' });
    //await page.waitForSelector('[data-test="product_sort_container"]:visible');

    //await page.selectOption('[data-test="product_sort_container"]', 'lohi');

    // Wait until the select is rendered and interactable
    //await page.waitForSelector('[data-test="product_sort_container"]:visible');

    // Select an option by value
    //await page.locator('[data-test="product_sort_container"]').selectOption('lohi');
await page.selectOption('.product_sort_container', { value: 'lohi' });

// Optionally verify the selection
//const selectedValue = await page.locator('[data-test="product_sort_container"]').inputValue();
//console.log('Selected:', selectedValue); // should log 'lohi'
    const priceTexts = await page.locator('.inventory_item_price').allTextContents();
    const prices = priceTexts.map(p => parseFloat(p.replace('$', '')));
    // Verify strictly ascending order
    for (let i = 1; i < prices.length; i++) {
      expect(prices[i]).toBeGreaterThanOrEqual(prices[i - 1]);
    }
  });

  test('should sort products by name Z to A', async ({ page }) => {
    //await page.locator('[data-test="product_sort_container"]').waitFor({ state: 'visible' });
    //await page.waitForSelector('[data-test="product_sort_container"]:visible');

// Wait until the select is rendered and interactable
//await page.waitForSelector('[data-test="product_sort_container"]:visible');

// Select an option by value
//await page.locator('[data-test="product_sort_container"]').selectOption('za');
await page.selectOption('.product_sort_container', { value: 'za' });

// Optionally verify the selection
//const selectedValue = await page.locator('[data-test="product_sort_container"]').inputValue();
//console.log('Selected:', selectedValue); // should log 'lohi'
    //await page.selectOption('[data-test="product_sort_container"]', 'za');
    const names = await page.locator('.inventory_item_name').allTextContents();
    // "Test.allTheThings() T-Shirt (Red)" starts with T, alphabetically last → first in Z-A
    expect(names[0]).toBe('Test.allTheThings() T-Shirt (Red)');
  });

  test('should display a unique image for each product', async ({ page }) => {
    const images = page.locator('.inventory_item_img img');
    await expect(images).toHaveCount(6);
    const srcs = await images.evaluateAll(
      (imgs: HTMLImageElement[]) => imgs.map(img => img.getAttribute('src') ?? '')
    );
    const unique = new Set(srcs.filter(Boolean));
    // Each product must have its own distinct image
    expect(unique.size).toBe(8);
  });

});
