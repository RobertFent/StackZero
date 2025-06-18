import { describe, it, mock, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

export let connect; // will hold the dynamically imported function
export const pragmaCalls = [];

describe('database', () => {
	// mocking fs, path and better-sqlite3
	beforeEach(async () => {
		mock.reset();
		mock.module('fs', {
			defaultExport: {
				existsSync() {
					return true;
				}
			}
		});
		mock.module('path', {
			defaultExport: {
				dirname() {
					return ':memory';
				}
			}
		});
		mock.module('better-sqlite3', {
			defaultExport: class {
				constructor(location, opts) {
					this.location = location;
					this.opts = opts;
				}
				pragma(cmd) {
					pragmaCalls.push(cmd);
				}
			}
		});

		// dynamic import AFTER mock is applied
		({ connect } = await import(
			'../core/modules/database/database.js?ts=' + Date.now()
		));
	});
	it('applies all expected PRAGMAs', async () => {
		pragmaCalls.length = 0;

		const db = await connect(':memory:');
		assert.ok(db);
		assert.deepEqual(pragmaCalls, [
			'journal_mode = WAL',
			'foreign_keys = true',
			'busy_timeout = 5000',
			'synchronous = normal',
			'wal_autocheckpoint = 0',
			`mmap_size = ${1024 * 1024 * 1024}`,
			'cache_size = -65536'
		]);
	});
});
