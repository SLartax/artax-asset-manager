# Artax Deal Manager

Authenticated browser interface and Node.js backend. Production deployment is deliberately separate from code review.

Use Node.js 24 LTS. Install with `npm ci --ignore-scripts`. Run `npm test`, `npm run typecheck` and `npm run build`.

See [SECURITY.md](SECURITY.md) for server configuration, local development, migration of existing browser data, deployment prerequisites and rollback. Credentials belong only in the backend secret manager. No API key is required for the tests or browser build.