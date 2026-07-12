import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  retries: 0,
  use: {
    baseURL: "http://localhost:3000",
    locale: "hr-HR",
    // Okruženje ima preinstaliran Chromium — koristi ga umjesto downloada
    // (ukloni launchOptions ako lokalno radiš s `npx playwright install`).
    ...(process.env.PLAYWRIGHT_CHROMIUM_PATH || process.env.PLAYWRIGHT_BROWSERS_PATH
      ? {
          launchOptions: {
            executablePath:
              process.env.PLAYWRIGHT_CHROMIUM_PATH ?? "/opt/pw-browsers/chromium",
          },
        }
      : {}),
  },
  webServer: {
    command: "npm run start",
    url: "http://localhost:3000",
    reuseExistingServer: false,
    timeout: 60_000,
    env: {
      // e2e koristi seedanu Postgres bazu iz DATABASE_URL (vidi README).
      DATABASE_URL: process.env.DATABASE_URL ?? "",
      // Test-only admin pristup za e2e (lozinka: festko-e2e-test).
      // NIJE za produkciju — produkcija koristi vlastite env varijable.
      AUTH_SECRET: "e2e-test-secret-not-for-production-use-0000",
      ADMIN_EMAIL: "admin-e2e@festko.local",
      ADMIN_PASSWORD_HASH:
        "scrypt:aba47d02f6236e2f9965a3966e36759c:af0c1d824a06b5e203bfc60ef80def77f165ecb7629c604ab128a91a9628f8f67fb53adc8fa212fd82668bb80dbffa8f8a798186dbfbce09fdcc77f56b280ccb",
    },
  },
});
