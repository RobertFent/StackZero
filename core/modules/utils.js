/**
 * Retries calling a given async function for a specified number of attempts with a delay between each attempt.
 * @date Jun 9th 2025
 * @author Robot
 *
 * @export
 * @async
 * @param {*} fn
 * @param {number} [attempts=5]
 * @param {number} [delay=1000]
 * @returns {unknown}
 */
export async function retry(fn, attempts = 5, delay = 1000) {
	for (let attempt = 1; attempt <= attempts; attempt++) {
		try {
			return await fn();
		} catch (error) {
			if (attempt === attempts)
				throw new Error(
					`Failed after ${attempts} attempts: ${error.message}`
				);
			await new Promise((resolve) => {
				return setTimeout(resolve, delay);
			});
		}
	}
}
