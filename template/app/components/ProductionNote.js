import { html } from '../../core/modules/html.js';

export const ProductionNote = () => {
	return html`
		<style>
			.center-message {
				display: flex;
				flex-direction: column;
				align-items: center;
				text-align: center;
				justify-content: center;
				height: 70vh;
				font-family: sans-serif;
				font-size: 1.5rem;
				color: #333;
			}
		</style>
		<meta http-equiv="refresh" content="3;url=/" />
		<div class="center-message">
			🚧 This page is still in production...<br />
			You will be redirected to the main page shortly...
		</div>
	`;
};
