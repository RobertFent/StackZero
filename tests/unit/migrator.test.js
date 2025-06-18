import { describe, it, before, mock, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { fs as memfs } from 'memfs';

let dbMock;
let loggerCalls = [];
let Migrator, Migrations;

before(async () => {
	dbMock = {
		name: 'mock.db',
		exec: mock.fn(),
		transaction: (fn) => {
			fn();
			const tx = () => {};
			tx.immediate = () => {
				return false;
			};
			return tx;
		},
		prepare: () => {
			return {
				get: () => {
					return { user_version: 0 };
				}
			};
		}
	};

	memfs.mkdirSync('/migrations', { recursive: true });
	memfs.writeFileSync(
		'/migrations/001_init.sql',
		'CREATE TABLE test (id INTEGER);'
	);
});

describe('migrator', () => {
	beforeEach(async () => {
		mock.reset();
		mock.module('../../core/modules/logger.js', {
			namedExports: {
				logger: {
					debug: (args) => {
						return loggerCalls.push(['debug', args]);
					},
					info: (args) => {
						return loggerCalls.push(['info', args]);
					},
					error: (args) => {
						return loggerCalls.push(['error', args]);
					}
				}
			}
		});
		({ Migrator, Migrations } = await import(
			'../../core/modules/database/migrator.js'
		));
	});
	it('migrate() - applies a migration when out of date', () => {
		loggerCalls = [];
		const migrations = new Migrations('/migrations', memfs);
		const migrator = new Migrator(dbMock, migrations);

		migrator.migrate();

		assert.deepEqual(loggerCalls[0], [
			'debug',
			'1 migration(s) in directory.'
		]);
		assert.deepEqual(loggerCalls[1], [
			'info',
			'Migrating to v1 using 001_init.sql'
		]);
		assert.deepEqual(loggerCalls.at(-1), [
			'info',
			'Database mock.db is up-to-date.'
		]);
	});
});
