declare const process: { env: Record<string, string | undefined> };

const backendBaseUrl = process.env.API_BASE_URL?.replace(/\/$/, '');

if (!backendBaseUrl) {
  throw new Error(
    'API_BASE_URL must be configured in Vercel as the public origin of the deployed Express backend.'
  );
}

export const config = {
  rewrites: [
    { source: '/api/:path*', destination: `${backendBaseUrl}/api/:path*` },
    { source: '/socket.io/:path*', destination: `${backendBaseUrl}/socket.io/:path*` },
    { source: '/(.*)', destination: '/index.html' },
  ],
};
