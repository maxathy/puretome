// apps/e2e/globalSetup.js
const { chromium } = require('@playwright/test');
const { loginHelper } = require('./tests/login.helper');

module.exports = async (config) => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await loginHelper(page, { email: 'max3@max2.com', password: 'testing' });
  await page.context().storageState({ path: 'storageState.json' });
  await browser.close();
};
