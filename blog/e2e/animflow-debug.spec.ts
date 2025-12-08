import { test, expect } from '@playwright/test';

test.describe('AnimFlow Introduction Page Debug', () => {
  test('should capture console errors on animflow-introduction page', async ({ page }) => {
    const consoleMessages: string[] = [];
    const consoleErrors: string[] = [];

    // Capture all console messages
    page.on('console', (msg) => {
      const text = msg.text();
      consoleMessages.push(`[${msg.type()}] ${text}`);
      if (msg.type() === 'error') {
        consoleErrors.push(text);
      }
    });

    // Capture page errors
    page.on('pageerror', (error) => {
      consoleErrors.push(`PAGE ERROR: ${error.message}`);
    });

    // Go to the page
    await page.goto('/posts/animflow-introduction');

    // Wait for React hydration and AnimFlow initialization
    await page.waitForTimeout(5000);

    // Check for error divs in the page
    const errorDivs = await page.locator('.animflow-error').all();

    if (errorDivs.length > 0) {
      for (const errorDiv of errorDivs) {
        const errorText = await errorDiv.textContent();
        console.log('ERROR DIV CONTENT:', errorText);
      }
    }

    // Check for error messages in pre tags within error divs
    const errorMessages = await page.locator('.animflow-error pre').allTextContents();
    if (errorMessages.length > 0) {
      console.log('ERROR MESSAGES:', errorMessages);
    }

    // Print all console messages
    console.log('\n=== CONSOLE MESSAGES ===');
    for (const msg of consoleMessages) {
      console.log(msg);
    }

    // Print console errors specifically
    if (consoleErrors.length > 0) {
      console.log('\n=== CONSOLE ERRORS ===');
      for (const err of consoleErrors) {
        console.log(err);
      }
    }

    // Check if animflow-embed divs rendered (without errors)
    const embedDivs = await page.locator('.animflow-embed').count();
    console.log(`\n=== ANIMFLOW EMBEDS: ${embedDivs} ===`);

    // Take a screenshot for debugging
    await page.screenshot({ path: 'animflow-debug.png', fullPage: true });

    // Assertions - we want to see what errors occur
    // This test is for debugging, so we always print info
    expect(true).toBe(true);
  });
});
