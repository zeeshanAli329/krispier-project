# Production deployment

Keep the existing Vercel project and domain (`https://krispier-project.vercel.app/`).

## Express backend

The repository does not contain a Vercel serverless API implementation. The `server.ts` entry point starts one Express server and attaches Socket.IO to its HTTP server, so deploy it to a persistent Node host that supports HTTP requests and Socket.IO/WebSocket connections. The host must install the project dependencies and run `npm start` with `NODE_ENV=production`.

Configure the backend host with the existing `MONGODB_URI` value and the current `JWT_SECRET`. Keep those values in the backend host's private environment settings. Do not copy `MONGODB_URI` into Vercel or any `VITE_*` variable. Set `APP_URL=https://krispier-project.vercel.app` on the backend so generated table QR codes keep the existing application domain. `PORT` is provided by most hosts; the server defaults to `3000`. `GEMINI_API_KEY` is present in the local environment but is not referenced by the current application code. Do not clear or reseed the production database.

## Vercel frontend

In the existing Vercel project's Environment Variables, set `API_BASE_URL` to the public HTTPS origin of the deployed Express backend (origin only, without `/api`, paths, or credentials). Use the actual host assigned by the backend provider; do not use an example hostname. Redeploy the existing Vercel project after adding it.

`vercel.ts` uses this value to proxy `/api/*` and `/socket.io/*` to Express, then sends normal application routes to `index.html`. If it is unset, Vercel can still build and serve the frontend, but API and real-time functionality will not work; the frontend reports an API response error. This allows frontend deployment before a backend URL exists without inventing one. The browser continues to use the existing Vercel domain. The URL is a public service address, not a credential.

If the backend is not deployed yet, deploy this repository's Express server first, then use its assigned HTTPS origin as `API_BASE_URL`. The application domain does not need to change. The backend has not been verified as deployed by this repository change; no backend hostname is currently configured here.

## Environment variables

| Variable | Where it belongs | Purpose |
|---|---|---|
| `API_BASE_URL` | Vercel project environment | Public HTTPS origin of the separately deployed Express backend. Required for production API and Socket.IO routing. |
| `MONGODB_URI` | Backend host only | Connects Express to the existing MongoDB Atlas database. Never expose it to Vite or Vercel frontend code. |
| `JWT_SECRET` | Backend host only | Signs and verifies staff authentication tokens. Keep the existing secret value. |
| `APP_URL` | Backend host | Use `https://krispier-project.vercel.app` for generated QR links. |
| `PORT` | Backend host (usually supplied by host) | HTTP listen port; defaults to `3000`. |
| `GEMINI_API_KEY` | Not currently used | Found in the local environment; no reference exists in the app source. |

The current API client validates array responses for categories, foods, tables, orders, staff, billing history, reviews, and notifications. A malformed or HTML response is surfaced as a readable API error before it reaches components that call `.filter()`.
