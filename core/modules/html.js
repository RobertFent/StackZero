/**
 * Takes an array of fragments and a variable number of values.
 * It iterates through the fragments, concatenating them with their corresponding values based on various types like arrays, strings, and numbers.
 * It returns the final concatenated string.
 *
 * Using this function ensures the returned result is always a string of valid HTML, no matter what combination of values are inserted.
 * Is also supports Arrays of elements.
 *
 * @date Jun 7th 2025
 * @author Robot
 *
 * @param {*} fragments
 * @param {...{}} values
 * @returns {string}
 */
export const html = (fragments, ...values) => {
	let out = '';
	fragments.forEach((string, i) => {
		const value = values[i];

		// Array - Join to string and output with value
		if (Array.isArray(value)) {
			out += string + value.join('');
		}
		// String - Output with value
		else if (typeof value === 'string') {
			out += string + value;
		}
		// Number - Coerce to string and output with value
		// This would happen anyway, but for clarity's sake on what's happening here
		else if (typeof value === 'number') {
			out += string + String(value);
		}
		// object, undefined, null, boolean - Don't output a value.
		else {
			out += string;
		}
	});

	return out;
};
