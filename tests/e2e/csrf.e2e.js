import { test, expect } from '@playwright/test';
import { startApp } from '../../core/app.js';

let app;

test.beforeAll(async () => {
	app = await startApp();
});

test.afterAll(async () => {
	await app.fastify.close();
});

test('disallows CSRF attacks', async ({ page }) => {
	const maliciousTodo = "You've been pwned";
	const maliciousPageContent = `
  <html>
    <body>
      <h1>Malicious Page</h1>
      <form id="csrf-form" method="POST" action="${app.url}/any">
        <input type="hidden" name="description" value="${maliciousTodo}">
      </form>
      <script>
        document.getElementById('csrf-form').submit()
      </script>
    </body>
  </html>
`;

	await page.setContent(maliciousPageContent);
	await expect(page.locator('body')).toHaveText(
		'Cross-site requests are forbidden'
	);
});
