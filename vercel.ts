import { deploymentEnv, routes, type VercelConfig } from '@vercel/config/v1';

export const config: VercelConfig = {
  buildCommand: 'npm run build',
  outputDirectory: 'dist',
  rewrites: [
    routes.rewrite('/api/:path*', `${deploymentEnv('API_BASE_URL')}/api/:path*`),
    routes.rewrite('/socket.io/:path*', `${deploymentEnv('API_BASE_URL')}/socket.io/:path*`),
    routes.rewrite('/(.*)', '/index.html'),
  ],
};
