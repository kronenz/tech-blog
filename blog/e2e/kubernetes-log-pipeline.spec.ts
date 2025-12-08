import { test, expect } from '@playwright/test';

test.describe('Kubernetes Log Pipeline Article', () => {
  test('should render all AnimFlow diagrams without errors', async ({ page }) => {
    const consoleErrors: string[] = [];

    // Capture console errors
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    page.on('pageerror', (error) => {
      consoleErrors.push(`PAGE ERROR: ${error.message}`);
    });

    // Go to the new article
    await page.goto('/posts/kubernetes-log-pipeline-architecture');

    // Wait for React hydration and AnimFlow initialization
    await page.waitForTimeout(5000);

    // Check for error divs
    const errorDivs = await page.locator('.animflow-error').count();

    if (errorDivs > 0) {
      const errorMessages = await page.locator('.animflow-error pre').allTextContents();
      console.log('ERROR MESSAGES:', errorMessages);
    }

    // Check AnimFlow embeds rendered
    const embedDivs = await page.locator('.animflow-embed').count();
    console.log(`AnimFlow embeds found: ${embedDivs}`);

    // Print console errors if any
    if (consoleErrors.length > 0) {
      console.log('Console errors:', consoleErrors);
    }

    // Take screenshot for debugging
    await page.screenshot({ path: 'kubernetes-log-pipeline.png', fullPage: true });

    // Assertions
    expect(errorDivs).toBe(0);
    expect(embedDivs).toBe(6); // We have 6 AnimFlow diagrams
    expect(consoleErrors.filter(e => e.includes('AnimFlow'))).toHaveLength(0);
  });
});
