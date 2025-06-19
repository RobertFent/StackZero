import { html } from '../../core/definitions.js';

export const Root = () => {
	return html`
		<div>
			<style>
				me section {
					display: flex;
					flex-direction: column;
					justify-content: center;
					padding: var(--size-8);
					text-align: center;
					min-height: 8rem;
				}
				me .main-section {
					display: flex;
					flex-wrap: wrap;
					gap: var(--size-8);
					margin-top: var(--size-6);
				}
				me .profile-content {
					flex: 1 1 30%;
				}
				me .profile-upper-content {
					padding: var(--size-6);
					display: flex;
					align-items: center;
					gap: var(--size-8);
				}
				me .profile-upper-content a {
					color: #ffffff;
					text-decoration: underline;
					margin-top: var(--size-60);
				}
				me .profile-lower-content {
					padding: var(--size-6);
					text-align: left;
				}
				me .main-section p {
					margin-bottom: var(--size-4);
				}
				me .profile-lower-content h3 {
					margin-bottom: var(--size-2);
				}
				me .profile-lower-content p {
					margin-bottom: var(--size-2);
				}
				me .tech-content {
					flex: 1 1 40%;
					display: flex;
					flex-direction: column;
					justify-content: center;
				}
				@media (max-width: 600px) {
					me .profile-upper-content img {
						width: 100%;
					}
					me .profile-upper-content {
						flex-direction: column;
						text-align: center;
					}
					me .profile-content {
						flex: 1 1 100%;
					}
					me section {
						padding: var(--size-0);
						margin-bottom: var(--size-6);
					}
					me .main-section {
						margin-top: var(--size-8);
					}

					me .tech-content {
						flex: 1 1 100%;
					}
				}
			</style>
			<section class="colored-component">
				<h1>StackZero Template</h1>
				<h3 style="margin-top: var(--size-2)">
					This is a plain template project which should be overwritten
					by your logic
				</h3>
			</section>
			<section>
				<h2>About StackZero and Me</h2>
				<hr />
				<div class="main-section">
					<!-- Left Column: Profile -->
					<div class="profile-content">
						<div class="colored-component">
							<div class="profile-upper-content">
								<img
									src="/static/me.jpeg"
									alt="Photo of me"
									style="height: 100%; max-width: 300px; border-radius: 12px; box-shadow: 0 2px 12px #0002; margin: 0 auto;"
								/>
								<div style="text-align: left;">
									<div>
										<p>
											<strong>Name:</strong> Robert Fent
										</p>
										<p><strong>Age:</strong> 27</p>
										<p>
											<strong>Hobbies:</strong> Coding,
											Cooking, Weightlifting, Travel,
											Warhammer
										</p>
									</div>
									<p>
										<a href="https://github.com/RobertFent"
											>GitHub</a
										>
									</p>
									<div hx-boost="true">
										<ul>
											<li>
												<a
													href="mailto:info@robertfent.com"
													>Contact me</a
												>
											</li>
										</ul>
									</div>
								</div>
							</div>
							<div class="profile-lower-content">
								<h3>Howdy 🤠,</h3>
								<p>
									my name is Robert, I am 27 years old and I
									live in Germany.
								</p>
								<p>
									I am a passionate Software Developer who
									loves to build new Software with a focus on
									maintainablity, automated deployments and
									low cost.
								</p>
								<p>
									I am also into working out 🏋️, cocking 👨‍🍳 or
									traveling 🧳 with my fiancee. Actually I am
									doing most activities with her if I think
									about it🤔 but I love her so this is okay
									🫶. Anyways there is one very important
									hobby I share with my brother Lugo ->
									Warhammer🛠️🎨
								</p>
							</div>
						</div>
					</div>
					<!-- Right Column: Tech Description -->
					<div class="tech-content">
						<h2 style="margin-bottom: var(--size-8);">StackZero</h2>
						<p>
							I built this site using a simple and efficient
							stack:
							<a href="https://nodejs.org">Node.js</a>,
							<a href="https://fastify.dev/">Fastify</a>,
							<a href="https://htmx.org/">htmx</a>, and
							<a href="https://sqlite.org/">SQLite</a> — all
							wrapped in
							<a href="https://www.docker.com/">Docker</a> and
							deployed via
							<a href="https://github.com/features/actions"
								>GitHub Actions</a
							>. The entire setup is designed to be low-cost
							(under 5€ per month, including DNS via
							<a href="https://www.ionos.de/">Ionos</a> and
							hosting on a
							<a href="https://www.hetzner.com/">Hetzner</a>
							server), transparent, and fully under my control —
							with no hidden dependencies or vendor lock-in. I
							also use
							<a href="https://playwright.dev/">Playwright</a> to
							run end-to-end browser tests, ensuring that
							everything works reliably across deployments.
						</p>
						<p>
							I use Node.js for its lightweight runtime and broad
							ecosystem, making it easy to build fast and
							maintainable backend logic.
						</p>
						<p>
							Fastify serves as the web framework because of its
							minimal footprint, high performance, and modern
							development support.
						</p>
						<p>
							For interactive UIs, I rely on HTMX, which lets me
							create dynamic, responsive interfaces using plain
							HTML without the complexity of a frontend framework.
						</p>
						<p>
							SQLite is my database of choice — fast, serverless,
							and ideal for simple deployments without external
							dependencies.
						</p>
						<p>
							Docker ensures consistent local and production
							environments, making deployment straightforward and
							repeatable.
						</p>
						<p>
							GitHub Actions automates my CI/CD pipeline, enabling
							reliable and fast deployments with every push. To
							ensure stability and confidence in every release, I
							use Playwright to run end-to-end browser tests that
							validate the user experience from a real-world
							perspective.
						</p>
						<p>
							This setup helps me stay lean, independent, and
							fully in control — with full visibility from
							development to deployment.
						</p>
					</div>
				</div>
				<hr style="margin-top: 2rem;" />
			</section>
		</div>
	`;
};
