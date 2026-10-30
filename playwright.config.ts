import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 60000,
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    viewport: { width: 1440, height: 900 },
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--use-gl=angle',
            '--enable-features=WebCodecs',
          ],
        },
      },
    },
  ],
  webServer: {
    command: 'pnpm --filter @html-motion-studio/web start -p 3000',
    port: 3000,
    reuseExistingServer: !process.env.CI,
    timeout: 30000,
  },
});

