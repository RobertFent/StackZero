import { test, expect } from '@playwright/test';
import { startApp } from '../../core/app.js';

let app;

test.beforeAll(async () => {
	app = await startApp();
});

test.afterAll(async () => {
	await app.fastify.close();
});

test('Guestbook page renders and accepts new entries', async ({ page }) => {
	await page.goto(`${app.url}/guestbook`);

	// check the heading
	await expect(
		page.getByRole('heading', { name: 'Guestbook' })
	).toBeVisible();

	// check if the form is present
	const form = page.locator('[data-testid="guestbookEntry-form"]');
	await expect(form).toBeVisible();

	// check that entries table is rendered
	const table = page.locator('[data-testid="guestbookEntry-table"]');
	await expect(table).toBeVisible();

	// fill out and submit the form
	await page.fill('input[name="author"]', 'Test User');
	await page.fill('input[name="content"]', 'This is a test message');
	await page.click('button[type="submit"]');

	// wait for HX-Swap to update the page (main is replaced)
	await page.waitForSelector('[data-testid="guestbookEntry-item"]');

	// check if the new entry appears in the table
	const newEntry = page.locator(
		'[data-testid="guestbookEntry-item"] >> text=Test User'
	);
	await expect(newEntry).toBeVisible();

	const message = page.locator(
		'[data-testid="guestbookEntry-item"] >> text=This is a test message'
	);
	await expect(message).toBeVisible();
});

test('Guestbook form requires input', async ({ page }) => {
	await page.goto(`${app.url}/guestbook`);
	await page.click('button[type="submit"]');
	await expect(page.locator('input:invalid')).toHaveCount(2);
});
