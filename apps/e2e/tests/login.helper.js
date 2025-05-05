// apps/e2e/tests/login.helper.js
async function login(page, { email, password }) {
  await page.goto('/login'); // adjust path as needed
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  // Wait for some indication of successful login
  await page.waitForURL('/editor'); // adjust as needed
}

module.exports = { login };
