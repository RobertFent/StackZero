import { startApp } from '../../core/app';
import { test, expect } from '@playwright/test';

let app;

test.beforeAll(async () => {
	app = await startApp();
});

test.afterAll(async () => {
	await app.fastify.close();
});

test('shows warning on new version', async ({ page }) => {
	await page.goto(app.url);
	app.bumpVersion();
	page.locator('a', { hasText: 'Guestbook' }).click();
	await expect(page.getByRole('alert')).toHaveText(
		'🎉 New Release | Please refresh the page to use the latest version'
	);
	await page.getByTestId('close').click();
	await expect(page.getByRole('alert')).toBeHidden();
});
