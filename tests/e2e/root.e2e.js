import { test, expect } from '@playwright/test';
import { startApp } from '../../core/app.js';

let app;

test.beforeAll(async () => {
	app = await startApp();
});

test.afterAll(async () => {
	await app.fastify.close();
});

test('Root page displays profile and stack description correctly', async ({
	page
}) => {
	await page.goto(`${app.url}/`);

	// check heading
	await expect(
		page.getByRole('heading', { name: 'StackZero Template' })
	).toBeVisible();

	// check profile name
	await expect(page.getByText('Name: Robert Fent')).toBeVisible();

	// check github and mail link
	const githubLink = page.getByRole('link', { name: 'GitHub', exact: true });
	await expect(githubLink).toHaveAttribute(
		'href',
		'https://github.com/RobertFent'
	);
	await expect(
		page.getByRole('link', { name: 'Contact Me' })
	).toHaveAttribute('href', 'mailto:info@robertfent.com');

	// check presence of image
	const img = page.locator('img[alt="Photo of me"]');
	await expect(img).toBeVisible();

	// check links in section and text
	await expect(
		page.getByRole('heading', { name: 'StackZero', exact: true })
	).toBeVisible();
	await expect(page.getByRole('link', { name: 'Node.js' })).toBeVisible();
	await expect(page.getByRole('link', { name: 'Fastify' })).toBeVisible();
	await expect(page.getByRole('link', { name: 'HTMX' })).toBeVisible();
	await expect(page.getByRole('link', { name: 'SQLite' })).toBeVisible();

	await expect(
		page.getByText(
			'This setup helps me stay lean, independent, and fully in control — with full visibility from development to deployment.'
		)
	).toBeVisible();
});

test('Root page layout adapts to mobile view', async ({ page }) => {
	await page.setViewportSize({ width: 375, height: 800 });
	await page.goto(`${app.url}/`);

	// Example: assert image is still visible
	await expect(page.locator('img[alt="Photo of me"]')).toBeVisible();

	// Example: profile section stacked
	const profile = page.locator('.profile-content');
	const box = await profile.boundingBox();
	expect(box.width).toBeLessThan(400); // stacked layout in mobile
});
