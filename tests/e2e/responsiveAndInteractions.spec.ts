import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const SCREENSHOT_DIR = path.resolve(process.cwd(), 'test-output/screenshots');
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

const VIEWPORTS = [
  { name: 'Small Mobile', width: 320, height: 700 },
  { name: 'Mobile', width: 375, height: 812 },
  { name: 'Large Mobile', width: 430, height: 932 },
  { name: 'Small Tablet', width: 768, height: 1024 },
  { name: 'Tablet', width: 1024, height: 768 },
  { name: 'Laptop', width: 1280, height: 800 },
  { name: 'Desktop', width: 1440, height: 900 },
  { name: 'Large Desktop', width: 1920, height: 1080 },
];

test.describe('HTML Motion Studio Web — Multi-Viewport Responsive Validation', () => {
  for (const vp of VIEWPORTS) {
    test(`Verify layout at ${vp.name} (${vp.width}x${vp.height}) with zero horizontal overflow`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/');

      // Wait for page hydration
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('iframe[title="HTML Animation Preview"]')).toBeVisible();

      // Check no unintended horizontal scrolling
      const overflow = await page.evaluate(() => {
        const scrollWidth = document.documentElement.scrollWidth;
        const innerWidth = window.innerWidth;
        return {
          scrollWidth,
          innerWidth,
          hasOverflow: scrollWidth > innerWidth + 1, // 1px tolerance for subpixel rounding
        };
      });

      expect(overflow.hasOverflow).toBe(false);

      // Verify essential UI sections are rendered and visible
      await expect(page.locator('nav')).toBeVisible();
      await expect(page.getByRole('button', { name: /Convert HTML to/i })).toBeVisible();

      // Capture screenshot for visual inspection
      const sanitizedName = vp.name.toLowerCase().replace(/\s+/g, '-');
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, `web-home-${sanitizedName}-${vp.width}x${vp.height}.png`),
        fullPage: false,
      });
    });
  }
});

test.describe('HTML Motion Studio Web — Interactive Controls & State Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');
  });

  test('UploadZone tab switching works smoothly without errors', async ({ page }) => {
    // 1. Single HTML tab
    await page.locator('button:has-text("Single HTML")').click();
    await expect(page.locator('text=Drop your .html file here')).toBeVisible();

    // 2. ZIP Package tab
    await page.locator('button:has-text("ZIP Package")').click();
    await expect(page.locator('text=Drop your project .zip archive here')).toBeVisible();

    // 3. Code Editor tab
    await page.locator('button:has-text("Code Editor")').click();
    await expect(page.locator('textarea')).toBeVisible();

    // 4. Test Projects tab
    await page.locator('button:has-text("Test Projects")').click();
    await expect(page.locator('button:has-text("2. CSS Keyframe Motion")')).toBeVisible();
  });

  test('Aspect ratio selector updates dimensions and preview container', async ({ page }) => {
    // Select 9:16 Story/Reels
    await page.locator('button:has-text("9:16")').click();
    await expect(page.locator('text=720×1280')).toBeVisible();

    // Select 1:1 Square
    await page.locator('button:has-text("1:1")').click();
    await expect(page.locator('text=1080×1080')).toBeVisible();

    // Select Custom and change dimensions
    await page.locator('button:has-text("Custom")').click();
    const widthInput = page.locator('input[type="number"]').first();
    await widthInput.fill('1600');
    await expect(page.locator('text=1600×')).toBeVisible();

    // Restore 16:9
    await page.locator('button:has-text("16:9")').click();
    await expect(page.locator('text=1920×1080')).toBeVisible();
  });

  test('Resolution and FPS presets update export settings properly', async ({ page }) => {
    // Switch to 720p
    await page.getByRole('button', { name: '720p', exact: true }).click();
    await expect(page.locator('text=1280×720')).toBeVisible();

    // Switch FPS to 30
    await page.getByRole('button', { name: '30 FPS', exact: true }).click();
    await expect(page.locator('text=30 FPS Target')).toBeVisible();

    // Switch FPS to 60
    await page.getByRole('button', { name: '60 FPS', exact: true }).click();
    await expect(page.locator('text=60 FPS Target')).toBeVisible();
  });

  test('Audio source modes toggle controls gracefully', async ({ page }) => {
    // Switch to External Score
    await page.getByRole('button', { name: 'External Score', exact: true }).click();
    await expect(page.locator('text=Attach MP3 or WAV Audio Track')).toBeVisible();

    // Switch to No Audio
    await page.getByRole('button', { name: 'No Audio', exact: true }).click();
    await expect(page.locator('text=Attach MP3 or WAV Audio Track')).not.toBeVisible();
  });

  test('Dedicated SEO route /tools/html-to-mp4 renders cleanly without overflow', async ({ page }) => {
    for (const vp of [
      { name: 'Mobile', width: 375, height: 812 },
      { name: 'Desktop', width: 1440, height: 900 },
    ]) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/tools/html-to-mp4');
      await expect(page.locator('h1')).toContainText('HTML to MP4 Video Converter');

      const overflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth + 1;
      });
      expect(overflow).toBe(false);

      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, `web-seo-tool-${vp.name.toLowerCase()}-${vp.width}x${vp.height}.png`),
      });
    }
  });
});

