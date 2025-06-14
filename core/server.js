import cluster from 'node:cluster';
import process from 'node:process';
import { logger } from './modules/logger.js';
import { startApp } from './app.js';

const numForks = Number(process.env.FORKS) || 1;

// maps between pids and wids (wid = worked id that doesn't change between restarts) and wids and workers
const wids = new Map();
const workers = new Map();

// signals for IPC
const APP_STARTED = 'app_started';
const CLUSTER_HEALTHY = 'cluster_healthy';

/**
 * Sends a message to all workers in the cluster
 * @date Jun 7th 2025
 * @author Robot
 *
 * @param {string} message
 */
const broadcast = (message) => {
	logger.debug(`Broadcasting: ${message} to all workers`);
	for (const worker of Object.values(cluster.workers)) {
		worker.send(message);
	}
};

/**
 * A class representing a worker with a unique process ID and worker ID.
 * It tracks the number of restarts and provides methods to manage workers, including creating new workers,
 * finding workers by process ID, resetting restarts, deleting workers, restarting the worker process, and getting the worker's name with identifiers.
 * @date Jun 7th 2025
 * @author Robot
 *
 * @class Worker
 * @typedef {Worker}
 */
class Worker {
	#pid;
	#wid;
	#restarts = 0;

	/**
	 * Creates an instance of Worker.
	 * @date Jun 7th 2025
	 * @author Robot
	 *
	 * @constructor
	 * @param {number} wid
	 */
	constructor(wid) {
		this.#wid = wid;
	}

	/**
	 * A static method that returns the worker with the given wid in the cluster or creates a new one if the given wid is not used.
	 * The map for wids with pids and the map for current workers is updated.
	 * @date Jun 7th 2025
	 * @author Robot
	 *
	 * @static
	 * @param {number} wid
	 * @returns {Worker}
	 */
	static new(wid) {
		const existingWorker = cluster.fork({ wid });
		const pid = existingWorker.process.pid;
		const worker = workers.get(wid) || new Worker(wid);
		worker.#pid = pid;
		wids.set(pid, wid);
		workers.set(wid, worker);
		return worker;
	}

	/**
	 * A static method that finds and returns a worker based on the worker's process ID
	 * @date Jun 7th 2025
	 * @author Robot
	 *
	 * @static
	 * @param {Worker} worker
	 * @returns {*}
	 */
	static find(worker) {
		const pid = worker.process.pid;
		const wid = wids.get(pid);
		return workers.get(wid);
	}

	/**
	 * Reset the restarts counter for the current worker.
	 * @date Jun 7th 2025
	 * @author Robot
	 */
	healthy() {
		logger.debug(`${this.name} became healthy!`);
		this.#restarts = 0;
	}

	/**
	 * Deletes the worker from the workers map.
	 * @date Jun 7th 2025
	 * @author Robot
	 */
	exitedOk() {
		workers.delete(this.#wid);
	}

	/**
	 * Restart the worker process with a limited number of attempts and log the restart details.
	 * @date Jun 7th 2025
	 * @author Robot
	 */
	restart() {
		const attempt = ++this.#restarts;
		const maxAttempts = 5;
		if (attempt <= maxAttempts) {
			logger.info(
				`${this.name} restart attempt (${attempt}/${maxAttempts})`
			);
			setTimeout(() => {
				return Worker.new(this.#wid);
			}, 1000);
		} else {
			logger.fatal(`No more restarts attempts for ${this.name}.`);
		}
	}

	/**
	 * A property that returns the name of a Worker instance with its unique identifiers.
	 * @date Jun 7th 2025
	 * @author Robot
	 *
	 * @readonly
	 * @type {string}
	 */
	get name() {
		return `Worker (wid: ${this.#wid} / pid: ${this.#pid})`;
	}
}

if (cluster.isPrimary) {
	let numWorkersHealthy = 0;

	logger.debug(`Cluster initializing with ${numForks} forks...`);

	// create enough workers for cluster
	for (let wid = 0; wid < numForks; wid++) {
		Worker.new(wid);
	}

	// set workers to healthy when cluster starts -> cluster is healthy when enough worker started
	cluster.on('message', (worker, message) => {
		if (message === APP_STARTED) {
			const currentWorker = Worker.find(worker);
			currentWorker.healthy();
			numWorkersHealthy++;
			if (numWorkersHealthy === numForks) {
				broadcast(CLUSTER_HEALTHY);
			}
		}
	});

	// restart worker in case failure happens else just remove the worker
	cluster.on('exit', (worker, code) => {
		const currentWorker = Worker.find(worker);
		const successfulExit = code === 0;
		if (successfulExit) {
			currentWorker.exitedOk();
		} else {
			currentWorker.restart();
		}
	});
} else {
	// start app and set to healthy when all workers in cluster are up and running
	const app = await startApp({ port: process.env.PORT, host: '0.0.0.0' });
	process.send(APP_STARTED);
	process.on('message', (message) => {
		if (message === CLUSTER_HEALTHY) {
			app.healthy();
		}
	});
}
