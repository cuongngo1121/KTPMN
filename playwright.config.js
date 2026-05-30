import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false, // run sequentially to prevent site throttling
  retries: 1,
  workers: 1,
  reporter: [['list']],
  use: {
    baseURL: 'https://c-movie.vercel.app',
    trace: 'on-first-retry',
    screenshot: 'on',
  },
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // Set a default large viewport so desktop tests work out of the box
        viewport: { width: 1280, height: 800 },
      },
    },
  ],
});
