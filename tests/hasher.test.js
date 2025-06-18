import { describe, it, before, beforeEach, mock } from 'node:test';
import assert from 'node:assert';
import { fs } from 'memfs';

describe('hasher', () => {
	let hasher;

	before(() => {
		fs.mkdirSync('/static-files');
		fs.mkdirSync('/static-files/nest');
		fs.writeFileSync(`/static-files/a.css`, `aaaaaaaaaaaaa`);
		fs.writeFileSync(`/static-files/nest/n.css`, `nnnnnnnnnnnnn`);
	});

	beforeEach(async () => {
		mock.reset();
		mock.module('crypto', {
			namedExports: {
				createHash: () => {
					const mockHash = {
						data: '',
						update(content) {
							mockHash.data += content;
							return mockHash;
						},
						digest() {
							// return a fake hash
							return 'foobarba';
						}
					};
					return mockHash;
				}
			}
		});
		const { Hasher } = await import('../core/modules/hasher.js');
		hasher = new Hasher({
			root: '/static-files',
			prefix: '/static/',
			filesystem: fs
		});
	});

	it('hashes static assets', () => {
		assert.strictEqual(
			hasher.getHashedPath('/static/a.css'),
			'/static/a.foobarba.css'
		);
		assert.strictEqual(
			hasher.getHashedPath('/static/nest/n.css'),
			'/static/nest/n.foobarba.css'
		);
		assert.strictEqual(
			hasher.getHashedPath('/static/missing.css'),
			'/static/missing.css'
		);
	});

	it('replaces links in a string', () => {
		const withHashes = hasher.hashLinks(
			`
	    <script type="module" src="/static/a.css" defer></script>
	    <link rel="stylesheet" href="/static/nest/n.css" />
	    <link rel="stylesheet" href="/keep/me.css" />`.trim()
		);
		assert.strictEqual(
			withHashes,
			`
	    <script type="module" src="/static/a.foobarba.css" defer></script>
	    <link rel="stylesheet" href="/static/nest/n.foobarba.css" />
	    <link rel="stylesheet" href="/keep/me.css" />`.trim()
		);
	});

	it('unhashes static assets', () => {
		assert.strictEqual(
			hasher.getUnhashedPath('/static/a.foobarba.css'),
			'/static/a.css'
		);
		assert.strictEqual(
			hasher.getUnhashedPath('/static/a.xxxxxxxx.css'),
			'/static/a.css'
		);
		assert.strictEqual(
			hasher.getUnhashedPath('/static/nest/n.foobarba.css'),
			'/static/nest/n.css'
		);
		assert.strictEqual(hasher.getUnhashedPath('a.css'), 'a.css');
		assert.strictEqual(hasher.getUnhashedPath('x.css'), 'x.css');
	});
});
