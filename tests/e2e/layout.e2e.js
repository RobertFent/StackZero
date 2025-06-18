import { test, expect } from '@playwright/test';
import { startApp } from '../../core/app.js';

export let app;

test.beforeAll(async () => {
	app = await startApp();
});

test.afterAll(async () => {
	await app.fastify.close();
});

test('Layout renders all structural elements', async ({ page }) => {
	await page.goto(`${app.url}/`);

	// title and metadata
	await expect(page).toHaveTitle(/StackZero Template/);
	await expect(page.locator('meta[name="description"]')).toHaveAttribute(
		'content',
		'StackZero Template'
	);

	// header nav links
	await expect(page.getByRole('link', { name: 'Homepage' })).toHaveAttribute(
		'href',
		'/#'
	);
	await expect(page.getByRole('link', { name: 'Guestbook' })).toHaveAttribute(
		'href',
		'/guestbook#'
	);

	// main slot content from Root
	await expect(page.locator('main')).toContainText('StackZero Template');

	// footer content
	await expect(page.locator('footer')).toContainText('Robert Fent');
	await expect(page.locator('footer')).toContainText('Eduards Sizovs');
});

test('Navigates from homepage to guestbook via hx-boost link', async ({
	page
}) => {
	await page.goto(`${app.url}/`);

	// click the guestbook link (hx-boost triggers partial update)
	await page.click('a[href="/guestbook#"]');

	// wait for content to be replaced inside <main>
	await page.waitForSelector('main:has(h1:text("Guestbook"))');

	// verify guestbook content appeared (via swap)
	await expect(page.locator('main')).toContainText('Leave me a nice message');
	await expect(page.locator('main')).toContainText('Guestbook');
	await expect(
		page.locator('[data-testid="guestbookEntry-form"]')
	).toBeVisible();
});
