import { html } from '../../core/definitions.js';

/**
 * Returns an HTML element displaying an error message, with the default error message as an empty string if no error is provided.
 * @date Jun 9th 2025
 * @author Robot
 *
 * @param {{ error?: string; }} [param0={}]
 * @param {string} [param0.error='']
 * @returns {string}
 */
export const Error = ({ error = '' } = {}) => {
	return html`
		<small data-testid="guestbookEntry-error" id="guestbookEntry-error">
			<style>
				me {
					color: var(--color-red-600);
				}
			</style>
			${error}
		</small>
	`;
};
