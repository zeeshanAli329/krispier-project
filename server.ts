import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { initDatabase } from './server/db.js';
import { initSocketIO } from './server/socket.js';
import { apiRouter } from './server/api.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = http.createServer(app);
  const PORT = Number(process.env.PORT) || 3000;
  const allowedOrigins = [
    ...(process.env.CORS_ORIGINS || '').split(',').map((origin) => origin.trim()).filter(Boolean),
    process.env.APP_URL?.trim(),
    ...(process.env.NODE_ENV === 'production'
      ? []
      : ['http://localhost:3000', 'http://127.0.0.1:3000']),
  ].filter((origin): origin is string => Boolean(origin));

  // Initialize Socket.IO
  initSocketIO(server, allowedOrigins);

  app.use((req, res, next) => {
    const origin = req.get('origin');
    if (origin && allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Vary', 'Origin');
      res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Authorization,Content-Type');
    }

    if (req.method === 'OPTIONS') {
      if (origin && !allowedOrigins.includes(origin)) {
        return res.status(403).json({ message: 'Origin is not allowed' });
      }
      return res.sendStatus(204);
    }
    next();
  });

  // Body parser
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Initialize DB & Seed Data
  await initDatabase();

  // API Routes
  app.use('/api', apiRouter);
  app.use('/api', (_req, res) => {
    res.status(404).json({ message: 'API endpoint not found' });
  });

  // Vite integration
  const isProduction = process.env.NODE_ENV === 'production';
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  server.on('error', (err) => {
    console.error('HTTP server failed to start:', err);
    process.exit(1);
  });

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 SmartDine Server running at http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal backend startup error:', err);
  process.exit(1);
});
