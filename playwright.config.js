'use strict';

// Playwright configuration for the Task Management E2E suite.
//
// IMPORTANT: This config intentionally does NOT define a `webServer` block.
// You must start both the backend and the frontend manually before running
// the tests:
//
//   Terminal 1 (backend, this folder):
//     npm start         # serves http://localhost:3000
//
//   Terminal 2 (frontend, ../APIRest/frontend-tareas):
//     npm run dev       # serves http://localhost:5173
//
// Then in this folder:
//   npx playwright test
//
// If you'd rather have Playwright spawn the servers for you, uncomment the
// `webServer` array below (and adjust the `cwd` for the frontend if needed).

const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests/e2e',
  timeout: 30 * 1000,
  expect: { timeout: 5 * 1000 },
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
  ],
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    viewport: { width: 1280, height: 800 },
    ignoreHTTPSErrors: true,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // webServer: [
  //   {
  //     command: 'npm start',
  //     url: 'http://localhost:3000/api/csrf',
  //     reuseExistingServer: !process.env.CI,
  //     timeout: 60_000,
  //   },
  //   {
  //     command: 'npm run dev',
  //     cwd: '../APIRest/frontend-tareas',
  //     url: 'http://localhost:5173',
  //     reuseExistingServer: !process.env.CI,
  //     timeout: 60_000,
  //   },
  // ],
});
