// apps/e2e/playwright.config.js
const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 30000,
  use: {
    baseURL: 'http://localhost:5173', // adjust to your dev server URL/port
    headless: true,
  },
});
