import { html } from '../../core/modules/html.js';

export const Layout = (Main) => {
	return (params) => {
		return html`
			<!DOCTYPE html>
			<html lang="en">
				<head>
					<meta charset="utf-8" />
					<meta
						name="viewport"
						content="width=device-width, initial-scale=1"
					/>
					<meta name="description" content="StackZero Template" />
					<!-- Scripts -> these are loaded from static folder instead of cdn to prevent reliance on it -->
					<script src="/static/js/htmx@2.0.4.client.js" /></script>
					<script src="/static/js/css-scope-inline.js"></script>
					<script>
						// The default value includes 'class' as well.
						// We exclude it, otherwise classes added by MutationObserver are being removed during settling
						htmx.config.attributesToSettle = [
							'style',
							'width',
							'height'
						];
					</script>
					<script
						type="module"
						src="/static/js/app.client.js"
						defer
					></script>

					<!-- Styles -->
					<link rel="stylesheet" href="/static/css/reset.css" />
					<link rel="stylesheet" href="/static/css/app.css" />
					<link rel="icon" href="/static/favicon.png" />

					<title>StackZero Template</title>
				</head>

				<body data-appversion="${params.appVersion}">
					<style>
						me {
							font-family: var(--font-sans);
						}
						body {
							display: flex;
							flex-direction: column;
							min-height: 100vh;
						}
						main {
							flex: 1;
							display: flex;
							flex-direction: column;
							gap: var(--size-4);
							padding: var(--size-4);
							border: 1px solid var(--color-grey-200);
							border-radius: var(--radius-md);
							background: var(--color-grey-50);
						}
					</style>
					<header>
						<style>
							me {
								display: flex;
								align-items: center;
								justify-content: flex-start;
								padding: var(--size-8) var(--size-4);
								background: var(--color-grey-100, #f7f7f7);
							}
							me a {						
								margin-right: var(--size-6);
							}
							@media sm {
								me {
									font-size: var(--scale-2);
								}
							}
						</style>
						<div hx-target="main" hx-boost="true">
							<a href="/#">Homepage</a>
							<a href="/guestbook#">Guestbook</a>
						</div>
					</header>
					<main hx-target="this" hx-swap="innerHTML">
						${Main(params)}
					</main>
					<footer>
						<style>
							me {
								text-align: center;
								max-width: var(--width-lg);
								margin: 0 auto;
								padding: var(--size-8) 0;
								color: var(--color-grey-600);
							}
						</style>
						© ${new Date().getFullYear()}  
						Based on work by <a href="https://sizovs.net">Eduards Sizovs</a>. Enhanced & maintained by <a href="https://robertfent.com">Robert Fent</a>. All rights reserved.
					</footer>
				</body>
			</html>
		`;
	};
};
