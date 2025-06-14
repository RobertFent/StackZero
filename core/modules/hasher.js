import path, { join } from 'path';
import fs from 'fs';
import { createHash } from 'crypto';

/**
 * A class that handles hashing paths and caching them for quick lookup and replacement.
 * It provides methods to hash and unhash paths, as well as replace cached links in a given body.
 * @date Jun 8th 2025
 * @author Robot
 *
 * @export
 * @class Hasher
 * @typedef {Hasher}
 */
export class Hasher {
	#prefix;
	#cache;

	/**
	 * Creates an instance of Hasher.
	 * @date Jun 8th 2025
	 * @author Robot
	 *
	 * @constructor
	 * @param {{ prefix: string; root: string; filesystem?: fs; }} param0
	 * @param {string} param0.prefix
	 * @param {string} param0.root
	 * @param {fs} [param0.filesystem=fs]
	 */
	constructor({ prefix, root, filesystem = fs }) {
		this.#prefix = prefix;
		this.#cache = getAllFilesRecursively(root, filesystem).reduce(
			(cache, file) => {
				// We prepend /prefix/ for O(1) lookup. Given the /static/ prefix:
				// /css/main.css becomes /static/css/main.css,
				// /css/main.<hash>.css becomes /static/css/main.<hash>.css
				return cache.set(
					join(prefix, file.getRelativePath(root)),
					join(prefix, file.getFilepathWithHash(root))
				);
			},
			new Map()
		);
	}

	/**
	 * Returns the value associated with the input path in a cache, or the input path if the value is not found in the cache.
	 * @date Jun 8th 2025
	 * @author Robot
	 *
	 * @param {string} path
	 * @returns {string}
	 */
	getHashedPath(path) {
		return this.#cache.get(path) ?? path;
	}

	/**
	 * Checks if a given path starts with a specific prefix, and if so, replaces a pattern in the path with a dot.
	 * @date Jun 8th 2025
	 * @author Robot
	 *
	 * @param {string} path
	 * @returns {string}
	 */
	getUnhashedPath(path) {
		return path.startsWith(this.#prefix)
			? path.replace(/\.[a-z0-9]{8}\./, '.')
			: path;
	}

	/**
	 * Replace all cached links in the body with their corresponding values
	 * @date Jun 8th 2025
	 * @author Robot
	 *
	 * @param {string} body
	 * @returns {string}
	 */
	hashLinks(body) {
		let modified = body;
		this.#cache.forEach((value, key) => {
			modified = modified.replaceAll(key, value);
		});
		return modified;
	}
}

/**
 * Recursively reads a directory and creates a list of files and directories within it.
 * @date Jun 8th 2025
 * @author Robot
 *
 * @param {string} root
 * @param {fs} filesystem
 * @returns {File[]}
 */
const getAllFilesRecursively = (root, filesystem) => {
	return filesystem
		.readdirSync(root, { withFileTypes: true })
		.map((dirent) => {
			const absolute = path.join(root, dirent.name);
			return dirent.isDirectory()
				? getAllFilesRecursively(absolute, filesystem)
				: new File(absolute, filesystem);
		})
		.flat();
};

/**
 * A class representing a File with methods to calculate relative paths, append hash to file names, retrieve file extensions, compute MD5 hash, and read file content.
 * @date Jun 8th 2025
 * @author Robot
 *
 * @class File
 * @typedef {File}
 */
class File {
	#absolute;
	#filesystem;

	/**
	 * Creates an instance of File.
	 * @date Jun 8th 2025
	 * @author Robot
	 *
	 * @constructor
	 * @param {string} absolute
	 * @param {fs} filesystem
	 */
	constructor(absolute, filesystem) {
		this.#absolute = absolute;
		this.#filesystem = filesystem;
	}

	/**
	 * Calculates the relative path from the specified root path to the absolute path stored in the instance.
	 * @date Jun 8th 2025
	 * @author Robot
	 *
	 * @param {string} root
	 * @returns {string}
	 */
	getRelativePath(root) {
		return path.relative(root, this.#absolute);
	}

	/**
	 * Appends a hash to the file name in a given root path and returns the updated path.
	 * @date Jun 8th 2025
	 * @author Robot
	 *
	 * @param {string} root
	 * @returns {string}
	 */
	getFilepathWithHash(root) {
		// css/app.css -> css/app.<hash>.css
		return this.getRelativePath(root).replace(
			this.#getExtensionOfPath,
			'.' + this.#createMD5Hash + this.#getExtensionOfPath
		);
	}

	/**
	 * Returns the extension of the file pointed to by the absolute path property.
	 * @date Jun 8th 2025
	 * @author Robot
	 *
	 * @readonly
	 * @type {string}
	 */
	get #getExtensionOfPath() {
		return path.extname(this.#absolute);
	}

	/**
	 * Computes the MD5 hash of the content and returns the first 8 characters in hexadecimal format.
	 * @date Jun 8th 2025
	 * @author Robot
	 *
	 * @readonly
	 * @type {Hash}
	 */
	get #createMD5Hash() {
		return createHash('md5')
			.update(this.#getFileContent)
			.digest('hex')
			.substring(0, 8);
	}

	/**
	 * Returns the content by reading the file at the specified absolute path using the filesystem module.
	 * @date Jun 8th 2025
	 * @author Robot
	 *
	 * @readonly
	 * @type {Buffer}
	 */
	get #getFileContent() {
		return this.#filesystem.readFileSync(this.#absolute);
	}
}
