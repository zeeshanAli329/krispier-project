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

  // Initialize Socket.IO
  initSocketIO(server);

  // Body parser
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Initialize DB & Seed Data
  await initDatabase();

  // API Routes
  app.use('/api', apiRouter);

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

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 SmartDine Server running at http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal Server Error:', err);
});
