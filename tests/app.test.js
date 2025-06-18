import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { startApp } from '../core/app.js';

describe('app', () => {
	// todo: mock deps
	beforeEach(async () => {
		// get namedExports of better-sqlite3, in case there are any
		// const named = await import('better-sqlite3').then(
		// 	({ default: _, ...rest }) => {
		// 		return rest;
		// 	}
		// );
		// mock.module('better-sqlite3', {
		// 	defaultExport: FakeDatabase,
		// 	namedExports: named
		// });
	});
	it('starts up with empty project', async () => {
		const { url, bumpVersion, healthy, fastify } = await startApp({
			port: 0
		});

		assert.ok(url.startsWith('http://'));
		assert.strictEqual(typeof bumpVersion(), 'number');
		assert.strictEqual(healthy(), 200);

		await fastify.close();
	});
});
