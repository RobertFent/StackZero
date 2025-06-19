import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs/promises';
import path from 'path';
import { tmpdir } from 'os';
import { rm } from 'fs/promises';

let originalCwd;
let baseTestDir;
let routesDir;

beforeEach(async () => {
	baseTestDir = path.join(tmpdir(), `stackzero-test-${Date.now()}`);
	routesDir = path.join(baseTestDir, 'app/routes');
	await fs.mkdir(routesDir, { recursive: true });

	// Override process.cwd
	originalCwd = process.cwd;
	process.cwd = () => {
		return baseTestDir;
	};
});

afterEach(async () => {
	process.cwd = originalCwd;
	await rm(baseTestDir, { recursive: true, force: true });
});

describe('router', () => {
	it('loads route modules and calls init() with app and db', async () => {
		const routeContent = `
			export async function init({ app, db }) {
				app.loaded = true;
				app.dbName = db.name;
			}
		`;
		await fs.writeFile(
			path.join(routesDir, 'exampleRoute.js'),
			routeContent
		);

		// load module with arg so that cache gets busted and tests can run without side effects
		const { loadRoutes } = await import(
			`../../core/modules/router.js?ts=${Date.now()}`
		);

		const mockApp = {};
		const mockDb = { name: 'testdb' };

		await loadRoutes({ app: mockApp, db: mockDb });

		assert.strictEqual(mockApp.loaded, true);
		assert.strictEqual(mockApp.dbName, 'testdb');
	});

	it('ignores non-JS files', async () => {
		await fs.writeFile(path.join(routesDir, 'notRoute.txt'), 'hello world');

		// load module with arg so that cache gets busted and tests can run without side effects
		const { loadRoutes } = await import(
			`../../core/modules/router.js?ts=${Date.now()}`
		);

		const app = {};
		const db = {};

		await loadRoutes({ app, db });

		// nothing should be mutated
		assert.deepStrictEqual(app, {});
	});

	it('handles empty routes directory', async () => {
		// load module with arg so that cache gets busted and tests can run without side effects
		const { loadRoutes } = await import(
			`../../core/modules/router.js?ts=${Date.now()}`
		);

		const app = {};
		const db = {};

		await loadRoutes({ app, db });

		assert.deepStrictEqual(app, {});
	});
});
