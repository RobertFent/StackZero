import path from 'path';
import { pathToFileURL } from 'url';
import { logger } from './logger.js';

/**
 * Load customer core modules asynchronously and handle any errors that occur during the process.
 * Layout.js and Alert.js are needed.
 * If the customer deleted them then plain defaults are used.
 * @date Jun 14th 2025
 * @author Robot
 *
 * @export
 * @async
 * @returns {unknown}
 */
export const coreModuleLoader = async () => {
	let Alert, Layout;

	const APP_PATH = `${process.cwd()}/app`;

	try {
		const alertPath = path.join(APP_PATH, 'components/Alert.js');
		const alertUrl = pathToFileURL(alertPath).href;
		const alertModule = await import(alertUrl);
		Alert = alertModule.Alert;
	} catch (err) {
		if (
			err.code === 'ERR_MODULE_NOT_FOUND' ||
			err.code === 'MODULE_NOT_FOUND'
		) {
			logger.warn('Alert.js not found. Using default Alert.');
			Alert = (props) => {
				return `<div class="alert-default">${props.message}</div>`;
			};
		} else {
			throw err;
		}
	}

	try {
		const layoutPath = path.join(APP_PATH, 'views/Layout.js');
		const layoutUrl = pathToFileURL(layoutPath).href;

		const layoutModule = await import(layoutUrl);
		Layout = layoutModule.Layout;
	} catch (err) {
		if (
			err.code === 'ERR_MODULE_NOT_FOUND' ||
			err.code === 'MODULE_NOT_FOUND'
		) {
			logger.warn('Layout.js not found. Using default Layout.');
			Layout = (Main) => {
				return (params) => {
					return `
                        <!DOCTYPE html>
                        <html><body><main>${Main(params)}</main></body></html>
                    `;
				};
			};
		} else {
			throw err;
		}
	}

	return { Alert, Layout };
};
