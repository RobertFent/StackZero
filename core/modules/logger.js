import pino from 'pino';

/**
 * An object containing a method 'level' which takes a 'label' parameter and returns an object with a 'level' property set to the 'label' value.
 * @date Jun 7th 2025
 * @author Robot
 *
 */
const formatters = {
	level(label) {
		return { level: label };
	}
};

/**
 * Create a logger using pino with the specified configuration options.
 * @date Jun 7th 2025
 * @author Robot
 *
 */
export const logger = pino({
	level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
	formatters
});
