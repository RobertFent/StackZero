import { describe, it } from 'node:test';
import assert from 'node:assert';
import { html } from '../../core/modules/html.js';

const normalizeHtml = (str) => {
	return str
		.replace(/\s+/g, '') // collapse all whitespace
		.replace(/>\s+</g, '><') // remove space between tags
		.trim();
};

describe('html', () => {
	it('concatenates strings and values into HTML', () => {
		const result = html`<p>${'Hello'},${'world'}!</p>`;
		assert.strictEqual(normalizeHtml(result), '<p>Hello,world!</p>');
	});

	it('coerces numbers to strings', () => {
		const result = html`<div>${42}</div>`;
		assert.strictEqual(normalizeHtml(result), '<div>42</div>');
	});

	it('ignores null, undefined, and boolean values', () => {
		const result = html`<span
			>${null}${undefined}${true}${false}test</span
		>`;
		assert.strictEqual(normalizeHtml(result), '<span>test</span>');
	});

	it('joins arrays of strings', () => {
		const result = html`<ul>
			${['<li>A</li>', '<li>B</li>']}
		</ul>`;
		assert.strictEqual(
			normalizeHtml(result),
			'<ul><li>A</li><li>B</li></ul>'
		);
	});

	it('renders correctly with empty fragments or no values', () => {
		const result = html`<br />`;
		assert.strictEqual(normalizeHtml(result), '<br/>');
	});

	it('mixes arrays, strings, numbers, and nulls correctly', () => {
		const result = html`<div>
			${'Text'}${['<b>1</b>', '<b>2</b>']}${123}${null}
		</div>`;
		assert.strictEqual(
			normalizeHtml(result),
			'<div>Text<b>1</b><b>2</b>123</div>'
		);
	});
});
