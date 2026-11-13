// declare const process: { env: Record<string, string | undefined> };

// const backendBaseUrl = process.env.API_BASE_URL?.replace(/\/$/, '');

// if (!backendBaseUrl) {
//   throw new Error(
//     'API_BASE_URL must be configured in Vercel as the public origin of the deployed Express backend.'
//   );
// }

// export const config = {
//   rewrites: [
//     { source: '/api/:path*', destination: `${backendBaseUrl}/api/:path*` },
//     { source: '/socket.io/:path*', destination: `${backendBaseUrl}/socket.io/:path*` },
//     { source: '/(.*)', destination: '/index.html' },
//   ],
// };



import { routes, type VercelConfig } from '@vercel/config/v1';

const backendBaseUrl = process.env.API_BASE_URL?.replace(/\/$/, '');

if (!backendBaseUrl) {
  throw new Error(
    'API_BASE_URL is missing. Configure your deployed Express backend URL in Vercel.'
  );
}

export const config: VercelConfig = {
  rewrites: [
    routes.rewrite(
      '/api/:path*',
      `${backendBaseUrl}/api/:path*`
    ),
    routes.rewrite(
      '/socket.io/:path*',
      `${backendBaseUrl}/socket.io/:path*`
    ),
    routes.rewrite('/(.*)', '/index.html'),
  ],
};
