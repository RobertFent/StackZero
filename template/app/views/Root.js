import { html } from '../../../core/modules/html.js';

export const Root = () => {
	return html`
		<div>
			<style></style>
			<section class="colored-component">
				<h1>StackZero Testing Page</h1>
			</section>
			<section>
				<p>
					You can add, modify, delete everything you want in this
					webserver :-)
				</p>
				<p>
					The root page here is only used for e2e testing the
					StackZero core
				</p>
			</section>
		</div>
	`;
};
