import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { retry } from '../../core/modules/utils.js';

describe('utils', () => {
	it('retry - should succeed on first try', async () => {
		let callCount = 0;
		const fn = async () => {
			callCount++;
			return 'success';
		};

		const result = await retry(fn, 3, 10);
		assert.equal(result, 'success');
		assert.equal(callCount, 1);
	});

	it('retry - should succeed after a few failures', async () => {
		let callCount = 0;
		const fn = async () => {
			callCount++;
			if (callCount < 3) throw new Error('fail');
			return 'success';
		};

		const result = await retry(fn, 5, 10);
		assert.equal(result, 'success');
		assert.equal(callCount, 3);
	});

	it('retry - should fail after all retries', async () => {
		let callCount = 0;
		const fn = async () => {
			callCount++;
			throw new Error('fail always');
		};

		await assert.rejects(
			() => {
				return retry(fn, 4, 10);
			},
			{
				message: 'Failed after 4 attempts: fail always'
			}
		);
		assert.equal(callCount, 4);
	});
});
