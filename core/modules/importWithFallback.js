/**
 * Asynchronously imports a module with a fallback function in case of an error.
 * @date Jun 14th 2025
 * @author Robot
 *
 * @async
 * @param {string} modulePath
 * @param {() => {}} fallbackFn
 * @returns {() => {}}
 */
async function importWithFallback(modulePath, fallbackFn) {
	try {
		const mod = await import(modulePath);
		return mod.default || mod;
	} catch (err) {
		if (err.code?.includes('MODULE_NOT_FOUND')) return fallbackFn;
		throw err;
	}
}
