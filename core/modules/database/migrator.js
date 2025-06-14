import { basename } from 'path';
import fs from 'fs';
import { logger } from '../logger.js';

/**
 * A class for managing database migrations.
 * It creates an instance with a database and migrations.
 * It can migrate the database to the latest version and retrieve the database version from the SQLite database.
 * @date Jun 7th 2025
 * @author Robot
 *
 * @export
 * @class Migrator
 * @typedef {Migrator}
 */
export class Migrator {
	#db;
	#migrations;

	/**
	 * Creates an instance of Migrator.
	 * @date Jun 7th 2025
	 * @author Robot
	 *
	 * @constructor
	 * @param {BetterSqlite3.Database} db
	 * @param {Migrations} [migrations=new Migrations()]
	 */
	constructor(db, migrations = new Migrations()) {
		this.#db = db;
		this.#migrations = migrations;
	}

	/**
	 * Migrates the database to the latest version by executing pending migrations.
	 * @date Jun 7th 2025
	 * @author Robot
	 */
	migrate() {
		if (this.#migrations.empty()) {
			return;
		}

		const tx = this.#db.transaction(() => {
			const latestVersion = this.#migrations.latest().version;
			const databaseVersion = this.databaseVersion();
			const outOfDate = databaseVersion < latestVersion;
			if (outOfDate) {
				const targetVersion = databaseVersion + 1;
				const migration = this.#migrations.version(targetVersion);
				migration.execute(this.#db);
			}
			return outOfDate;
		});

		// Keep running migration transactions while DB is out of date
		while (tx.immediate()) {
			/* empty */
		}

		logger.info(`Database ${this.#db.name} is up-to-date.`);
	}

	/**
	 * Retrieves the database version from the SQLite database.
	 * @date Jun 7th 2025
	 * @author Robot
	 *
	 * @returns {number}
	 */
	databaseVersion() {
		const userVersion = this.#db
			.prepare('PRAGMA user_version')
			.get()?.user_version;
		if (typeof userVersion !== 'number') {
			throw new Error(
				`Unexpected result when getting user_version: "${userVersion}".`
			);
		}
		return userVersion;
	}
}

/**
 * A class representing database migrations management with methods to check if the migrations array is empty,
 * find a specific version in the migrations array, get the latest migration, and retrieve SQL files from a given path.
 * @date Jun 7th 2025
 * @author Robot
 *
 * @export
 * @class Migrations
 * @typedef {Migrations}
 */
export class Migrations {
	#migrations;
	#fs;

	/**
	 * Creates an instance of Migrations.
	 * @date Jun 7th 2025
	 * @author Robot
	 *
	 * @constructor
	 * @param {string} [directory=import.meta.dirname + '/migrations']
	 * @param {*} [filesystem=fs]
	 */
	constructor(
		directory = import.meta.dirname + '/migrations',
		filesystem = fs
	) {
		this.#fs = filesystem;
		this.#migrations = this.migrationFiles(directory).map((file, index) => {
			return new Migration(file, index + 1, filesystem);
		});
		logger.debug(`${this.#migrations.length} migration(s) in directory.`);
	}

	/**
	 * Check if the migrations array is empty.
	 * @date Jun 7th 2025
	 * @author Robot
	 *
	 * @returns {boolean}
	 */
	empty() {
		return this.#migrations.length === 0;
	}

	/**
	 * Find a specific version in migrations array
	 * @date Jun 7th 2025
	 * @author Robot
	 *
	 * @param {number} v
	 * @returns {Migration | undefined}
	 */
	version(v) {
		return this.#migrations.find(({ version }) => {
			return version === v;
		});
	}

	/**
	 * Return the latest migration from the list of migrations.
	 * @date Jun 7th 2025
	 * @author Robot
	 *
	 * @returns {Migration}
	 */
	latest() {
		return this.#migrations.at(-1);
	}

	/**
	 * Reads SQL files from a given path, filters out non-SQL files, constructs the full paths to the SQL files, sorts the paths, and returns them.
	 * @date Jun 7th 2025
	 * @author Robot
	 *
	 * @param {string} path
	 * @returns {string[]}
	 */
	migrationFiles(path) {
		const sqlFiles = this.#fs
			.readdirSync(path, { withFileTypes: true })
			.filter((file) => {
				return file.isFile() && file.name.endsWith('.sql');
			})
			.map((sqlFile) => {
				return `${path}/${sqlFile.name}`;
			})
			.sort();

		return sqlFiles;
	}
}

class Migration {
	#file;
	#version;
	#fs;

	/**
	 * Creates an instance of Migration.
	 * @date Jun 7th 2025
	 * @author Robot
	 *
	 * @constructor
	 * @param {string} file
	 * @param {number} version
	 * @param {fs} fs
	 */
	constructor(file, version, fs) {
		this.#file = file;
		this.#version = version;
		this.#fs = fs;
	}

	/**
	 * Executes database migration statements.
	 * It logs the migration process, executes the migration statements, and updates the database version.
	 * It handles any errors that occur during the migration process by logging them and throwing an error with the cause included.
	 * @date Jun 7th 2025
	 * @author Robot
	 *
	 * @param {BetterSqlite3.Database} db
	 */
	execute(db) {
		try {
			logger.info(`Migrating to v${this.version} using ${this.name}`);
			db.exec(this.statements);
			db.exec(`PRAGMA user_version = ${this.version}`);
		} catch (error) {
			const message = `Unable to execute migration ${this.name}: ${error}`;
			logger.error(message);
			throw new Error(message, { cause: error });
		}
	}

	/**
	 * Getter method for accessing the version property
	 * @date Jun 7th 2025
	 * @author Robot
	 *
	 * @readonly
	 * @type {number}
	 */
	get version() {
		return this.#version;
	}

	/**
	 * Returns the base name of a file.
	 * @date Jun 7th 2025
	 * @author Robot
	 *
	 * @readonly
	 * @type {string}
	 */
	get name() {
		return basename(this.#file);
	}

	/**
	 * Reads and returns text content from a file using the 'fs' module.
	 * @date Jun 7th 2025
	 * @author Robot
	 *
	 * @readonly
	 * @type {string}
	 */
	get statements() {
		return this.#fs.readFileSync(this.#file, { encoding: 'utf8' });
	}
}
