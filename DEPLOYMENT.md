# Production deployment

Keep the existing Vercel project and domain (`https://krispier-project.vercel.app/`).

## Express backend

`render.yaml` and `Dockerfile` prepare the Express and Socket.IO backend as a Render web service. Create the service from the repository's Blueprint. Use a paid always-on service plan for production; Render's free plan can sleep after inactivity. The service runs `npm start` with `NODE_ENV=production`, listens on the platform-provided `PORT`, and reports healthy only after MongoDB is connected.

Provide the existing `MONGODB_URI` and `JWT_SECRET` when Render prompts for Blueprint secrets. Keep both values private on the backend host. Do not copy `MONGODB_URI` into Vercel or any `VITE_*` variable. The Blueprint sets `APP_URL=https://krispier-project.vercel.app` and `CORS_ORIGINS` for the live site. Add any Vercel Preview origins to `CORS_ORIGINS` if previews need direct access. `PORT` is provided by Render. `GEMINI_API_KEY` is present in the local environment but is not referenced by the current application code. Production startup only reads existing collections; it does not seed or reset them.

## Vercel frontend

After the Render service deploys, copy its assigned public HTTPS origin into the existing Vercel project's Environment Variables as `API_BASE_URL` (origin only, without `/api`, paths, or credentials). Set it for Production and Preview deployments, then redeploy the Vercel project.

`vercel.ts` references this project variable with Vercel's `deploymentEnv()` helper, so Vercel can compile the configuration before injecting project environment variables into the build. The API and Socket.IO rewrites remain before the SPA fallback. Configure `API_BASE_URL` in each Vercel deployment environment before deploying so those paths reach the real backend. The browser continues to use the existing Vercel domain. The URL is a public service address, not a credential.

The application domain does not need to change. The backend must be deployed before Vercel API requests can return application data; no backend hostname is currently configured in this repository.

## Environment variables

| Variable | Where it belongs | Purpose |
|---|---|---|
| `API_BASE_URL` | Vercel project environment | Public HTTPS origin of the Render Express service. Required for production API and Socket.IO routing. |
| `MONGODB_URI` | Render backend only | Existing MongoDB Atlas URI, including the correct database name. Never expose it to Vite or Vercel frontend code. |
| `JWT_SECRET` | Render backend only | Signs and verifies staff authentication tokens. Keep the existing secret value. |
| `APP_URL` | Render backend | `https://krispier-project.vercel.app` for generated QR links. |
| `CORS_ORIGINS` | Render backend | Comma-separated allowed frontend origins. Blueprint includes the live Vercel domain. |
| `PORT` | Backend host (usually supplied by host) | HTTP listen port; defaults to `3000`. |
| `GEMINI_API_KEY` | Not currently used | Found in the local environment; no reference exists in the app source. |

The current API client validates array responses for categories, foods, tables, orders, staff, billing history, reviews, and notifications. A malformed or HTML response is surfaced as a readable API error before it reaches components that call `.filter()`.
