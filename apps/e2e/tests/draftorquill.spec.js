// e2e test for DraftorQuill autosave and event rendering
// Assumes user is already logged in before this test runs
const { login } = require('./login.helper');

const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
  await login(page, { email: 'max3@max2.com', password: 'testing' });
});

// TODO: create seed user, memoir, chapter, events

test.describe('DraftorQuill', () => {
  test('renders events and autosaves edits', async ({ page }) => {
    // Visit a chapter page where DraftorQuill is rendered
    // Adjust the URL pattern as needed for your app
    await page.goto(
      `/editor/68168b0c9430780e69e3600c/6817fb2d1d2d519b99abb97f`,
    );

    // Wait for the editor to be visible
    await expect(page.locator('.ql-editor')).toBeVisible();

    // Check that event delimiters and content are rendered
    await expect(page.locator('.ql-editor:first-child')).toBeVisible();
    await expect(page.locator('.ql-editor p').first()).toBeVisible();

    // Type into the editor (simulate user edit)
    const editor = page.locator('.ql-editor p').first();
    await editor.click();

    await editor.evaluate((node) => {
      node.innerHTML = 'hellofolks';
    });

    await page.waitForTimeout(1600); // account for debounce

    await expect(page.locator('text=hellofolks').first()).toBeVisible();
  });
});
