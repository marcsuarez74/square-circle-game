import { test, expect } from '@playwright/test';

test.describe('square-circle-game', () => {
  test('should display welcome message', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('Hello, square-circle-game');
  });
});
