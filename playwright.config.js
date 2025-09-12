import { defineConfig } from '@playwright/test';

process.env.DB_LOCATION = ':memory:';

export default defineConfig({
	testMatch: /tests\/.*\.e2e\.js/,
	timeout: 5 * 1000, // 5 seconds
	maxFailures: 1,
	testDir: './tests',
	workers: 1,
	use: {
		screenshot: 'only-on-failure'
		// headless: false
	}
});
