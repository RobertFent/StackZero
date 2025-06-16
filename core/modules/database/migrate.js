import { logger } from '../logger.js';
import { Migrator } from './migrator.js';
import Database from 'better-sqlite3';

const dbLocation = process.env.DB_LOCATION;
if (!dbLocation) {
	throw new Error('Missing DB_LOCATION environment variable.');
}

const db = new Database(dbLocation);
const migrator = new Migrator(db);

logger.info(`Running migrations on ${dbLocation}...`);
migrator.migrate();
logger.info(`Migration complete.`);
