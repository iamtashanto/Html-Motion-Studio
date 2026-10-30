import { test, expect } from '@playwright/test';

test.describe('HTML Motion Studio Web — Video Export E2E', () => {
  test('Page loads with Hero and isolated sandbox preview', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('Convert HTML Animations Into Videos');
    await expect(page.locator('iframe[title="HTML Animation Preview"]')).toBeVisible();
  });

  test('Dedicated SEO route /tools/html-to-mp4 operates correctly', async ({ page }) => {
    await page.goto('/tools/html-to-mp4');
    await expect(page.locator('h1')).toContainText('HTML to MP4 Video Converter');
    await expect(page.locator('text=Zero Server Uploads')).toBeVisible();
  });

  test('Select template and initiate client-side conversion', async ({ page }) => {
    await page.goto('/');

    // Switch to CSS Keyframe Motion template
    await page.locator('button:has-text("2. CSS Keyframe Motion")').click();
    await page.waitForTimeout(300);

    // Verify compatibility badge
    await expect(page.locator('text=Ready for export')).toBeVisible();

    // Trigger Convert CTA
    const convertBtn = page.getByRole('button', { name: 'Convert HTML to MP4 Video', exact: true });
    await expect(convertBtn).toBeEnabled();
    await convertBtn.click();

    // Export progress modal appears
    await expect(page.locator('text=Rendering Video Stream')).toBeVisible();

    // Wait for export result dialog
    await expect(page.locator('text=Export Complete!')).toBeVisible({ timeout: 25000 });

    // Verify video element in result modal
    const video = page.locator('video[controls]');
    await expect(video).toBeVisible();

    // Verify download button is present
    await expect(page.locator('button:has-text("Download")')).toBeVisible();
  });
});

