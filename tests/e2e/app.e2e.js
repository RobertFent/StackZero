import { test, expect } from '@playwright/test';
import { startApp } from '../../core/app.js';

let app;

test.beforeAll(async () => {
	app = await startApp();
});

test.afterAll(async () => {
	await app.fastify.close();
});

test('unhealthy by default', async ({ page }) => {
	const response = await page.goto(app.url + '/health');
	expect(response.status()).toBe(404);
});

test('returns 200 when healthy', async ({ page }) => {
	app.healthy();
	const response = await page.goto(app.url + '/health');
	expect(response.status()).toBe(200);
});
