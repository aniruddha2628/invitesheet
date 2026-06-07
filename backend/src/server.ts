import http from 'http';
import app from './app.js';
import { env } from './config/env.js';
import { connectDB } from './config/db.js';
import { initSocketIO } from './sockets/index.js';
import { initSentry, logger } from './services/logger.service.js';

async function bootstrap(): Promise<void> {
  // Initialize Sentry
  initSentry();

  // Connect to MongoDB
  await connectDB();

  // Create HTTP server
  const server = http.createServer(app);

  // Initialize Socket.IO
  initSocketIO(server);

  // Start listening
  server.listen(env.PORT, () => {
    logger.info(`🚀 InviteSheet API running on port ${env.PORT} [${env.NODE_ENV}]`);
  });

  // ── Graceful shutdown ──
  const shutdown = async (signal: string) => {
    logger.info(`${signal} received. Shutting down gracefully...`);
    server.close(() => {
      logger.info('HTTP server closed');
      process.exit(0);
    });

    // Force exit after 10 seconds
    setTimeout(() => {
      logger.error('Forced shutdown after timeout');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

bootstrap().catch((error) => {
  logger.error('Failed to start server', { error });
  process.exit(1);
});
