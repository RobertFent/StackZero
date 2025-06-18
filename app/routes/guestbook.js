import { Error } from '../components/Error.js';
import { sql } from '../../core/modules/database/database.js';
import { Guestbook } from '../views/Guestbook.js';
import { randomUUID } from 'node:crypto';

/**
 * @param {{ app: import("fastify").FastifyInstance, db: import("better-sqlite3").Database }}
 */
export const init = async ({ app, db }) => {
	app.get('/guestbook', async (request, reply) => {
		return render(request, reply);
	});

	app.post('/guestbook', async (request, reply) => {
		const { content, author } = request.body;
		if (!content || !author) {
			return reply
				.header('HX-Retarget', '#guestbookEntry-error')
				.render(Error, {
					error: 'Content and author required'
				});
		}
		const id = randomUUID();
		const timestamp = new Date().toISOString();
		db.prepare(
			'INSERT INTO guestbook_entries (id, timestamp, author, content) VALUES (?, ?, ?, ?)'
		).run(id, timestamp, author, content);
		return render(request, reply);
	});

	const render = async (_, reply) => {
		const guestbookEntries = db
			.prepare(sql`select * from guestbook_entries`)
			.all();

		return reply.render(Guestbook, { entries: guestbookEntries });
	};
};
