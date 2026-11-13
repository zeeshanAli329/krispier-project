import { routes, type VercelConfig } from '@vercel/config/v1';

const configuredBackendUrl = process.env.API_BASE_URL?.trim();

function getBackendOrigin(value: string | undefined): string | undefined {
  if (!value) return undefined;

  let backendUrl: URL;
  try {
    backendUrl = new URL(value);
  } catch {
    throw new Error('API_BASE_URL must be the HTTPS origin of the deployed Express backend.');
  }

  if (
    backendUrl.protocol !== 'https:' ||
    backendUrl.username ||
    backendUrl.password ||
    backendUrl.pathname !== '/' ||
    backendUrl.search ||
    backendUrl.hash
  ) {
    throw new Error(
      'API_BASE_URL must be an HTTPS origin only (for example, https://your-backend-host.example), without a path or credentials.'
    );
  }

  return backendUrl.origin;
}

const backendOrigin = getBackendOrigin(configuredBackendUrl);

export const config: VercelConfig = {
  buildCommand: 'npm run build',
  outputDirectory: 'dist',
  rewrites: [
    ...(backendOrigin
      ? [
          routes.rewrite('/api/:path*', `${backendOrigin}/api/:path*`),
          routes.rewrite('/socket.io/:path*', `${backendOrigin}/socket.io/:path*`),
        ]
      : []),
    routes.rewrite('/(.*)', '/index.html'),
  ],
};
