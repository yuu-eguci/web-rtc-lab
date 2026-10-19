// Browser tests with Chromium's fake camera. They do not prove behavior with a real camera.
import { expect, test } from '@playwright/test';

const isPlaying = (locator) => locator.evaluate((video) => video.srcObject !== null && video.videoWidth > 0);

let alerts;
let consoleErrors;

test.beforeEach(async ({ page }) => {
  alerts = [];
  consoleErrors = [];
  // CSP 違反や SRI の不一致はコンソールエラーになる。
  page.on('console', (message) => {
    if (message.type() === 'error') {
      consoleErrors.push(message.text());
    }
  });
  page.on('dialog', async (dialog) => {
    alerts.push(dialog.message());
    await dialog.dismiss();
  });
  await page.goto('/');
});

test.afterEach(() => {
  expect(alerts).toEqual([]);
  expect(consoleErrors).toEqual([]);
});

test('shows supported constraints', async ({ page }) => {
  await page.getByRole('button', { name: 'getSupportedConstraints' }).click();

  await expect(page.locator('#supported-constraints')).toContainText('"facingMode":true');
});

test('starts the user camera, shares it and takes a photo', async ({ page }) => {
  await page.getByRole('button', { name: 'facingMode:user', exact: true }).click();
  await expect.poll(() => isPlaying(page.locator('#video1'))).toBe(true);

  await page.getByRole('button', { name: 'facingMode:user +' }).click();
  for (const clone of await page.locator('video.video1-clone').all()) {
    await expect.poll(() => isPlaying(clone)).toBe(true);
  }

  await page.getByRole('button', { name: 'Take photo facingMode:user' }).click();
  await expect(page.locator('#image-for-video1')).toHaveAttribute('src', /^data:image\/jpeg;base64,/);
});

test('starts the user and environment cameras, then stops every stream', async ({ page }) => {
  await page.getByRole('button', { name: 'facingMode:user', exact: true }).click();
  await page.getByRole('button', { name: 'facingMode:env', exact: true }).click();
  await expect.poll(() => isPlaying(page.locator('#video1'))).toBe(true);
  await expect.poll(() => isPlaying(page.locator('#video2'))).toBe(true);
  await page.getByRole('button', { name: 'facingMode:user +' }).click();
  await page.getByRole('button', { name: 'facingMode:env +' }).click();
  const videos = page.locator('video');
  await expect.poll(() => videos.evaluateAll((all) => all.filter((v) => v.srcObject).length)).toBe(6);
  await page.evaluate(() => {
    window.tracks = [...document.querySelectorAll('video')].flatMap((v) => v.srcObject?.getTracks() ?? []);
  });

  await page.getByRole('button', { name: 'Stop stream' }).click();

  expect(await videos.evaluateAll((all) => all.filter((v) => v.srcObject).length)).toBe(0);
  expect(await page.evaluate(() => window.tracks.map((track) => track.readyState))).toEqual(Array(6).fill('ended'));
});

test('reports an error when the experiment constraints cannot be satisfied', async ({ page }) => {
  // Chromium の fake camera は facingMode を持たないので、 exact: 'user' は満たせない。
  await page.getByRole('button', { name: 'Experiment' }).click();

  await expect.poll(() => alerts).toEqual([expect.stringContaining('OverconstrainedError')]);
  alerts = [];
});

test('keeps the video and photo areas at a fixed height', async ({ page }) => {
  const heights = await page
    .locator('.card-body.bg-dark')
    .evaluateAll((bodies) => bodies.map((body) => body.getBoundingClientRect().height));

  expect(heights).toEqual([200, 100, 100, 100, 200, 100, 100, 200]);
});
