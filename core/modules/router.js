import { readdir } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const routesDir = path.resolve(__dirname, '../../app/routes');

/**
 * Loads routes asynchronously.
 * It reads files from a specified directory and imports JavaScript modules to initialize routes with the provided app and db objects.
 * @date Jun 13th 2025
 * @author Robot
 *
 * @export
 * @async
 * @param {{ app: any; db: BetterSqlite3.Database; }} param0
 * @param {Fastify} param0.app
 * @param {BetterSqlite3.Database} param0.db
 * @returns {*}
 */
export async function loadRoutes({ app, db }) {
	const files = await readdir(routesDir);

	for (const file of files) {
		if (!file.endsWith('.js')) continue;

		const modulePath = path.join(routesDir, file);
		const routeModule = await import(modulePath);

		if (typeof routeModule.init === 'function') {
			await routeModule.init({ app, db });
		}
	}
}
