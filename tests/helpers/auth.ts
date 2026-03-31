import { Page } from '@playwright/test';

/**
 * User credentials mapped to TEST_USER env var.
 *
 * Chapter 1 (problem):  ~45% test failures from known problem_user bugs:
 *   - Product sort doesn't work
 *   - All product images show the same wrong image
 *   - Sauce Labs Fleece Jacket "Add to cart" button does nothing
 *   - Cart badge doesn't update after remove
 *   - Checkout firstName field types into lastName (firstName stays empty)
 *
 * Chapter 2 (glitch):  performance_glitch_user adds 0-5s delay per action.
 *   With actionTimeout: 5000ms, ~20% of actions timeout → retries → flakiness signals.
 *
 * Chapter 3 (standard): standard_user — all tests pass, reliability recovers.
 */
const USERS: Record<string, { username: string; password: string }> = {
  standard: { username: 'standard_user',          password: 'secret_sauce' },
  problem:  { username: 'problem_user',            password: 'secret_sauce' },
  glitch:   { username: 'performance_glitch_user', password: 'secret_sauce' },
};

const userType = (process.env.TEST_USER || 'problem').toLowerCase();
export const credentials = USERS[userType] ?? USERS.problem;

export async function loginAs(page: Page, user = credentials): Promise<void> {
  await page.goto('/');
  await page.fill('[data-test="username"]', user.username);
  await page.fill('[data-test="password"]', user.password);
  await page.click('[data-test="login-button"]');
  await page.waitForURL('**/inventory.html', { timeout: 20000 });
}
