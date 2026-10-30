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

  test('Project Management: Renaming project, tracking dirty state, and reset confirmation', async ({ page }) => {
    await page.goto('/');

    // Check pristine badge
    await expect(page.locator('text=Pristine')).toBeVisible();

    // Click rename pencil button
    const renameBtn = page.locator('button[title="Rename project"]');
    await expect(renameBtn).toBeVisible();
    await renameBtn.click();

    // Edit title input
    const input = page.locator('input[type="text"]').first();
    await input.fill('Brand Hero Animation');
    await page.keyboard.press('Enter');

    // Title should update and mark as unsaved
    await expect(page.locator('h2:has-text("Brand Hero Animation")')).toBeVisible();
    await expect(page.locator('text=Unsaved Edits')).toBeVisible();

    // Click Reset button to trigger confirmation modal
    const resetBtn = page.getByRole('button', { name: 'Reset' });
    await resetBtn.click();

    // Verify modal appears
    await expect(page.locator('text=Reset Current Project?')).toBeVisible();

    // Confirm reset
    await page.locator('button:has-text("Confirm Reset")').click();

    // Verify pristine status returns
    await expect(page.locator('text=Pristine')).toBeVisible();
  });

  test('Cancel export immediately halts rendering and allows retry', async ({ page }) => {
    await page.goto('/');

    // Select 15s template for sufficient window to cancel
    await page.locator('button:has-text("11. Long-Running Animation (15s)")').click();
    await page.waitForTimeout(300);

    const convertBtn = page.getByRole('button', { name: 'Convert HTML to MP4 Video', exact: true });
    await convertBtn.click();

    // Export progress modal appears
    await expect(page.locator('text=Rendering Video Stream')).toBeVisible();

    // Click Cancel
    const cancelBtn = page.getByRole('button', { name: 'Cancel Export' });
    await cancelBtn.click();

    // Modal closes and error/cancellation banner appears with retry button
    await expect(page.locator('text=Export Unsuccessful')).toBeVisible();
    await expect(page.locator('text=Export was cancelled by user.')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Retry Export' })).toBeVisible();
  });
});

