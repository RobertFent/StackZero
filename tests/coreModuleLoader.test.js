import { describe, it, beforeEach, afterEach, mock } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs/promises';
import path from 'path';
import { tmpdir } from 'os';
import { rm } from 'fs/promises';

const baseAppPath = path.join(tmpdir(), 'stackzero-test-app');
const componentsPath = path.join(baseAppPath, 'app/components');
const viewsPath = path.join(baseAppPath, 'app/views');

let originalCwd;
export const loggerCalls = [];

describe('coreModuleLoader', () => {
	beforeEach(async () => {
		// mock logger
		mock.reset();
		mock.module('../core/modules/logger.js', {
			namedExports: {
				logger: {
					warn: (args) => {
						return loggerCalls.push(['warn', args]);
					}
				}
			}
		});
		// save original cwd and mock it
		originalCwd = process.cwd;
		process.cwd = () => {
			return baseAppPath;
		};

		await fs.mkdir(componentsPath, { recursive: true });
		await fs.mkdir(viewsPath, { recursive: true });
	});

	afterEach(async () => {
		// restore original cwd
		process.cwd = originalCwd;
		await rm(baseAppPath, { recursive: true, force: true });
	});

	it('loads custom Alert.js and Layout.js when they exist', async () => {
		await fs.writeFile(
			path.join(componentsPath, 'Alert.js'),
			`export const Alert = (props) => \`<div class="custom-alert">\${props.message}</div>\`;`
		);

		await fs.writeFile(
			path.join(viewsPath, 'Layout.js'),
			`export const Layout = (Main) => (params) => \`<html><body>\${Main(params)}</body></html>\`;`
		);

		// load module with arg so that cache gets busted and tests can run without side effects
		const { coreModuleLoader } = await import(
			`../core/modules/coreModuleLoader.js?test=${Date.now()}`
		);
		const { Alert, Layout } = await coreModuleLoader();

		assert.strictEqual(
			Alert({ message: 'Hi' }),
			'<div class="custom-alert">Hi</div>'
		);

		const html = Layout((params) => {
			return `<h1>${params.title}</h1>`;
		})({
			title: 'Test'
		});
		assert.strictEqual(html, '<html><body><h1>Test</h1></body></html>');
	});

	it('falls back to default Alert and Layout when missing', async () => {
		// load module with arg so that cache gets busted and tests can run without side effects
		const { coreModuleLoader } = await import(
			`../core/modules/coreModuleLoader.js?test=${Date.now()}`
		);
		const { Alert, Layout } = await coreModuleLoader();

		assert.strictEqual(
			Alert({ message: 'Fallback' }),
			'<div class="alert-default">Fallback</div>'
		);

		const html = Layout(() => {
			return 'Fallback content';
		})({});

		assert.ok(html.includes('<main>Fallback content</main>'));
		assert.deepStrictEqual(loggerCalls, [
			['warn', 'Alert.js not found. Using default Alert.'],
			['warn', 'Layout.js not found. Using default Layout.']
		]);
	});
});
