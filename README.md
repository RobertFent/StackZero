[![Publish Docker image to GHCR](https://github.com/RobertFent/StackZero/actions/workflows/release.yml/badge.svg)](https://github.com/RobertFent/StackZero/actions/workflows/release.yml)

![StackZero Frozen Icon](static/stackzero.png)

# StackZero

**StackZero** is a minimal, full-stack web application template designed for ultra-low-cost SaaS hosting.<br>
Built with simplicity and efficiency in mind, StackZero avoids heavy dependencies and frameworks — focusing instead on clean HTML (via [htmx](https://htmx.org)), modular backend logic, and Docker-based portability.

---

## 🌱 Philosophy

- 💡 **Zero Stack Bloat** — No frontend frameworks, no TypeScript, no fancy build tools.
- 🧩 **Modular Backend** — All logic lives in `core`, maintained privately.
- 🖼️ **Template Frontend** — A generic `app` folder you can override entirely.
- 🚀 **Simple Deployment** — One `docker-compose.yml` and you're live.
- 💸 **5€ SaaS-Ready** — Designed to run on a 4€ Hetzner VPS + 1€ domain.

---

## 🐳 Getting Started (Docker)

To get StackZero running locally or in production use [StackZero-Template](https://github.com/RobertFent/StackZero-template):

```bash
git clone https://github.com/RobertFent/StackZero-template.git
cd StackZero-template
docker compose up --build
```

Overriding the Frontend

Just develop your own htmx views and routes in `app/`.<br>
Launch the docker container again and the magic has already happened ✨

---

## 🔧 Design Principles

- No transpilers: Plain JavaScript (ES Modules), no TypeScript.
- No build step: Static assets served directly.
- No frontend framework: Uses htmx and a custom html.js parser.
- Single process: No multi-service architecture, everything runs in one container.
- Portable: Works on amd64 and arm64 thanks to multi-arch Docker builds.

---

## 🧠 Core Architecture

The logic behind StackZero lives in core/, structured as internal modules:

- html.js: Custom HTML templating engine
- router.js: Minimal routing and request handler
- database/: SQLite-based persistence and migration
- hasher.js, logger.js, utils.js: Supporting logic
- coreModuleLoader.js: Dynamically loads and registers frontend modules

---

## 🔒 Security & Isolation

- Users can override the app/ folder via Docker but cannot access core/
- The core logic is mounted in the image, not the host – source code stays private
- Only a thin public interface (e.g., core_api.js) is exposed to the user app, if needed - feature not supported yet

---

## 🧰 Minimal Deployment Stack

StackZero is designed to run on:
| Component | Cost |
|---------------|--------------|
| Hetzner VPS | ~4.00 € /mo |
| Domain | ~1.00 € /mo |
| **Total** | **5.00 €** |

Perfect for small tools, prototypes, or self-hosted SaaS products.

---

## 📦 Example Use Cases

- Internal dashboards
- Lightweight SaaS apps
- Microtools with login/auth
- Self-hosted CRUD apps

---

## 📜 License

This is a private, non-commercial project. Not intended for redistribution at this time.

---

## 🤖 Author

Based on work by [Eduards Sizovs](https://sizovs.net). Enhanced & maintained by [Robert Fent](https://robertfent.com).

Feel free to reach out if you are interested in using this setup.

---

## todo

- absolute import paths -> check imports in package.json
- verify everying in app.js is needed
- use maintenance.html
- blue green deployment with docker
- database backups maybe
- ruleset for branches
- ansible setup script maybe
