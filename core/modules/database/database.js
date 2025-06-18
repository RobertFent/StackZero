import fs from 'fs';
import path from 'path';
import { logger } from '../logger.js';
import { retry } from '../utils.js';
import Database from 'better-sqlite3';

/**
 * Creates a database connection using the provided location and options.
 * Handles potential errors and retries the connection if necessary.
 * Sets various SQLite pragmas for optimal database performance and configuration settings.
 * @date Jun 7th 2025
 * @author Robot
 *
 * @async
 * @param {string} location
 * @param {(msg: string, args: any) => any} [verbose=(msg, args) => {
 * 		return logger.debug(msg, args);
 * 	}]
 * @returns {() => BetterSqlite3.Database}
 */
const connect = async (
	location,
	verbose = (msg, args) => {
		return logger.debug(msg, args);
	}
) => {
	if (!location) {
		throw new Error(
			'Cannot create database. Please provide the DB location'
		);
	}

	// create dir paths to db location and check for proper prefix
	const isInMemoryDb = location === ':memory:';
	const locationDir = path.dirname(location);
	if (!location.startsWith('./data/') && !isInMemoryDb) {
		throw new Error(
			'Cannot create database. DB location must either start with ./data or be in memory (:memory:)'
		);
	}

	if (!fs.existsSync(locationDir) && !isInMemoryDb) {
		fs.mkdirSync(locationDir, { recursive: true });
	}

	// If the last connection to a db crashed, then the first new connection to open the database will start a recovery process.
	// So if another db connection tries to query during recovery it will get an SQLITE_BUSY error.
	// We retry connection a few times, because an exclusive lock is held during recovery.
	return retry(() => {
		const db = new Database(location, { verbose });

		db.pragma('journal_mode = WAL');
		db.pragma('foreign_keys = true');
		db.pragma('busy_timeout = 5000');
		db.pragma('synchronous = normal');

		// Litestream takes over checkpointing and recommends running the app with checkpointing disabled:
		// https://litestream.io/tips/#disable-autocheckpoints-for-high-write-load-servers
		db.pragma('wal_autocheckpoint = 0');

		// Enable memory mapped files for speed and smaller memory footprint in multi-process environments.
		// https://oldmoe.blog/2024/02/03/turn-on-mmap-support-for-your-sqlite-connections/#benchmark-results
		// We set 1gb as a reasonable default, but for larger databases, if memory allows, it can go higher.
		// If it goes too high, the value will be capped at the higher bound enforced by the SQLite at the compile-time.
		db.pragma(`mmap_size = ${1024 * 1024 * 1024}`);

		// Increase cache size to 64mb, the default is 2mb (or slightly higher depending on the SQLite version)
		db.pragma(`cache_size = ${64 * 1024 * -1}`);

		return db;
	});
};

const sql = String.raw;
export { connect, sql };
