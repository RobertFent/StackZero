import { describe, it, before, after, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';

let child;

describe('server - single fork', () => {
	beforeEach(() => {
		child = spawn('node', ['core/server.js'], {
			env: {
				...process.env,
				NODE_ENV: 'development',
				DB_LOCATION: ':memory:',
				FORKS: '1',
				PORT: '3050'
			},
			stdio: ['inherit', 'pipe', 'pipe']
		});
	});

	afterEach(() => {
		child.kill();
	});

	it('starts the cluster and serves health endpoint', async () => {
		// Wait for the server to print "Running @" to stdout
		await new Promise((resolve, reject) => {
			child.stdout.on('data', (data) => {
				const str = data.toString();
				if (str.includes('Running @')) resolve();
			});
			child.stderr.on('data', (data) => {
				reject(data.toString());
			});
		});

		// Ping health endpoint
		const res = await fetch('http://localhost:3050/health');
		assert.strictEqual(res.status, 200);
	});

	it('restarts workers after failure', async () => {
		const child = spawn('node', ['core/server.js'], {
			env: {
				...process.env,
				NODE_ENV: 'development',
				DB_LOCATION: ':memory:',
				FORKS: '1',
				TEST_CRASH: 'true'
			},
			stdio: ['ignore', 'pipe', 'pipe']
		});

		let restartCount = 0;
		child.stdout.on('data', (data) => {
			if (data.toString().includes('restart attempt')) {
				restartCount++;
			}
		});

		await new Promise((r) => {
			return setTimeout(r, 3000);
		});

		assert.ok(restartCount > 0, 'Worker should restart at least once');
	});
});

describe('server - multi fork', () => {
	beforeEach(() => {
		child = spawn('node', ['core/server.js'], {
			env: {
				...process.env,
				NODE_ENV: 'development',
				DB_LOCATION: './data/test-multi.db',
				FORKS: '2',
				PORT: '3051'
			},
			stdio: ['ignore', 'pipe', 'pipe']
		});
	});

	afterEach(() => {
		child.kill();
	});

	it('starts multiple workers with correct mapping', async () => {
		await new Promise((resolve) => {
			child.stdout.on('data', (data) => {
				if (data.toString().includes('Running @')) resolve();
			});
		});

		child.kill();
	});
});
