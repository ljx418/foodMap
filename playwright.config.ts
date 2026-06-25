import { defineConfig, devices } from "@playwright/test";

const runtimeEnv = (globalThis as typeof globalThis & { process?: { env?: Record<string, string | undefined> } }).process?.env ?? {};
const port = Number(runtimeEnv.FOODMAP_E2E_PORT ?? 53241);
const deployURL = runtimeEnv.FOODMAP_DEPLOY_URL?.trim();
const baseURL = deployURL || `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: "./e2e",
  webServer: deployURL
    ? undefined
    : {
        command: `npm run dev -- --port ${port} --strictPort`,
        url: baseURL,
        reuseExistingServer: false,
        timeout: 120_000
      },
  use: {
    baseURL,
    trace: "on-first-retry"
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"], browserName: "chromium" } }
  ]
});
