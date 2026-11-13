# Production deployment

Keep the existing Vercel project and domain (`https://krispier-project.vercel.app/`).

## Express backend

Deploy the existing Node/Express application from this repository to a persistent Node host that supports the `npm start` command, HTTP requests, and Socket.IO/WebSocket connections. The app starts from `server.ts`; the host must build/install the project dependencies and run `npm start` with `NODE_ENV=production`.

Configure the backend host with the existing `MONGODB_URI` value and the current `JWT_SECRET`. Keep those values in the backend host's private environment settings. Do not copy `MONGODB_URI` into Vercel or any `VITE_*` variable. The backend initializes the existing database; do not clear or reseed the production database.

## Vercel frontend

In the existing Vercel project's Environment Variables, set `API_BASE_URL` to the public HTTPS origin of the deployed Express backend (origin only, without `/api`). For example, use the actual host assigned by the backend provider; do not use the example hostname from documentation. Redeploy the existing Vercel project after adding it.

`vercel.ts` uses this value to proxy `/api/*` and `/socket.io/*` to Express, then sends normal application routes to `index.html`. The browser continues to use the existing Vercel domain. The URL is a public service address, not a credential.

If the backend is not deployed yet, deploy this repository's Express server first, then use its assigned HTTPS origin as `API_BASE_URL`. The application domain does not need to change.
