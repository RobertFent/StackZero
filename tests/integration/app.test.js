import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { startApp } from '../../core/app.js';

describe('app', () => {
	it('starts up default project', async () => {
		const { url, bumpVersion, healthy, fastify } = await startApp();

		assert.ok(url.startsWith('http://'));
		assert.strictEqual(typeof bumpVersion(), 'number');
		assert.strictEqual(healthy(), 200);

		await fastify.close();
	});
});
