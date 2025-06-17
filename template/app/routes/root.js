import { Root } from '../views/Root.js';

/**
 * @param {{ app: import("fastify").FastifyInstance, db: import("better-sqlite3").Database }}
 */
export const init = async ({ app, db }) => {
	app.get('/', async (_, reply) => {
		return reply.render(Root);
	});
};
