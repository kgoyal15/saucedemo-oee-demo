import { defineConfig, devices } from '@playwright/test';

/**
 * Qaily OEE Demo — Saucedemo Playwright test suite.
 *
 * Three chapters controlled by TEST_USER env var:
 *   problem  → problem_user:            ~45% failures (assertion bugs, broken UI)
 *   glitch   → performance_glitch_user: flaky timeouts, retries visible in dashboard
 *   standard → standard_user:           all pass, reliability improving
 *
 * Set via GitHub Actions workflow_dispatch input `user_type`.
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: false,        // Serial — predictable timing for demo
  retries: process.env.CI ? 1 : 0,  // 1 retry in CI reveals flaky pattern for glitch_user
  workers: 1,                  // Single worker — clean sequential run
  reporter: [
    ['list'],
    ['json', { outputFile: 'playwright-report/report.json' }],
    ['html', { open: 'never', outputFolder: 'playwright-report/html' }],
  ],
  use: {
    baseURL: 'https://www.saucedemo.com',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    actionTimeout: 2000,       // Tight — surfaces glitch_user timeouts as retries
    navigationTimeout: 20000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
