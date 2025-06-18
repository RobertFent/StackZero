import { connect } from './modules/database/database.js';
import { Migrator } from './modules/database/migrator.js';
import { logger } from './modules/logger.js';
import Fastify from 'fastify';
import formBody from '@fastify/formbody';
import statics from '@fastify/static';
import session from '@fastify/secure-session';
import { Hasher } from './modules/hasher.js';
import { loadRoutes } from './modules/router.js';
import { coreModuleLoader } from './modules/coreModuleLoader.js';

export const startApp = async (options = { port: 8080 }) => {
	let appVersion = 1; // bump the version up to force client refresh.
	let health = 404; // app is unhealthy until cluster signals otherwise.

	const isDevMode = process.env.NODE_ENV !== 'production';

	if (!process.env.DB_LOCATION) {
		throw new Error('DB_LOCATION environment variable is missing.');
	}

	const envs = ['development', 'production'];
	if (!envs.includes(process.env.NODE_ENV)) {
		throw new Error(
			`NODE_ENV environment variable must be one of ${envs}.`
		);
	}

	const db = await connect(process.env.DB_LOCATION);

	// load core modules if given or their defaults if not
	const { Alert, Layout } = await coreModuleLoader();

	// In dev mode, we run migrations upon startup.
	// In production, migrations are run by the deployment script.
	if (isDevMode) {
		const migrator = new Migrator(db);
		migrator.migrate();
	}

	const staticsConfig = {
		prefix: '/static/',
		root: process.cwd() + '/static'
	};

	// We use Hasher to add a version identifier to the public URLs of static assets (script.js -> script.c040ed4.js)
	// and remove the version when serving files from the file system. (script.c040ed4.js -> script.js)
	// Hashes are calculated at start-up, ensuring there is no performance penalty during lookups.

	// The version is the MD5 hash of the file's content. Thus, when the content changes, the version also changes.
	// This lets us set a far-future expires header for static assets w/o worrying about cache invalidation,
	// while ensuring that the user only downloads static assets that have changed since the last deployment.
	const hasher = new Hasher(staticsConfig);

	const fastify = Fastify({
		trustProxy: true, // this is needed for nginx proxy so that fastify trusts the proxy headers
		rewriteUrl: (req) => {
			return hasher.getUnhashedPath(req.url);
		}
	});

	// static files
	fastify.register(statics, {
		...staticsConfig,
		cacheControl: false
	});

	// URL encoded forms
	fastify.register(formBody);

	const insecure =
		'0000000000000000000000000000000000000000000000000000000000000000';
	const sessionSecret = process.env.COOKIE_SECRET ?? insecure;
	if (!isDevMode && sessionSecret === insecure) {
		throw new Error('Cannot use insecure session secret in production');
	}

	fastify.register(session, {
		sessionName: 'session',
		key: Buffer.from(sessionSecret, 'hex'),
		expiry: 15552000, // 180 days in seconds
		cookie: {
			maxAge: 34560000,
			path: '/'
		}
	});

	// request logging
	fastify.addHook('onResponse', async (request, reply) => {
		logger.info(
			`${request.method} ${request.url} ${reply.statusCode} - ${Math.round(reply.elapsedTime)}ms`
		);
	});

	// Current time (so that tests can manipulate time)
	// todo: remove?
	// app.decorateRequest('now', function () {
	// 	if (!isDevMode) {
	// 		return Date.now();
	// 	}
	// 	return (
	// 		+this.headers['x-mock-time'] ||
	// 		+this.query['x-mock-time'] ||
	// 		Date.now()
	// 	);
	// });

	// CSRF protection
	fastify.addHook('preHandler', async (request, reply) => {
		if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
			const whitelist = [];
			const websiteOrigin = request.protocol + '://' + request.host;
			const requestOrigin = request.headers.origin;
			const isForeignOrigin = requestOrigin !== websiteOrigin;
			if (isForeignOrigin && !whitelist.includes(requestOrigin)) {
				return reply
					.code(403)
					.send('Cross-site requests are forbidden');
			}
		}
	});

	fastify.addHook('preHandler', async (request, reply) => {
		const clientVersion = request.headers['x-app-version'];
		if (clientVersion && clientVersion < appVersion) {
			return reply.alert({
				lead: '🎉 New Release',
				follow: 'Please refresh the page to use the latest version'
			});
		}
	});

	fastify.addHook('onSend', async (_request, _reply, payload) => {
		return typeof payload !== 'string'
			? payload
			: hasher.hashLinks(payload);
	});

	fastify.decorateReply(
		'render',
		function (partial, params, mime = 'text/html') {
			const isHx = this.request.headers['hx-request'] === 'true';
			const template = isHx ? partial : Layout(partial);
			this.type(mime);
			this.send(template({ ...params, appVersion }));
		}
	);

	// enable error handler to send alert if its an htmx request which gets handled below
	fastify.setErrorHandler(async (err, request, reply) => {
		logger.error(err);
		if (request.headers['hx-request']) {
			return reply.alert({
				lead: 'Action failed',
				follow: err.message,
				classes: 'bg-red-700'
			});
		} else {
			return reply.status(err.statusCode || 500).send(err.message);
		}
	});

	// renders Alert.js component on error
	fastify.decorateReply('alert', async function ({ lead, follow, classes }) {
		return this.header('HX-Retarget', 'body')
			.header('HX-Reselect', '#alert')
			.header('HX-Reswap', 'beforeend show:none')
			.render(Alert, { lead, follow, classes });
	});

	// init routes of the application here
	await loadRoutes({ app: fastify, db });

	fastify.get('/health', (_, reply) => {
		return reply.status(health).send();
	});

	/**
	 * Returns the default health value of 200.
	 * @date Jun 10th 2025
	 * @author Robot
	 *
	 * @returns {number}
	 */
	const healthy = () => {
		return (health = 200);
	};

	/**
	 * Increments the app version number by one and returns the updated version number.
	 * @date Jun 10th 2025
	 * @author Robot
	 *
	 * @returns {number}
	 */
	const bumpVersion = () => {
		return appVersion++;
	};

	const url = await fastify.listen(options);
	logger.info(`Running @ ${url}`);

	return { url, bumpVersion, healthy, fastify };
};
