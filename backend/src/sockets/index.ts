import { Server as HTTPServer } from 'http';
import { Server, Socket } from 'socket.io';
import { verifyAccess } from '../utils/jwt.js';
import { env } from '../config/env.js';
import { logger } from '../services/logger.service.js';

let io: Server;

/**
 * Initialize Socket.IO server with JWT auth.
 */
export function initSocketIO(httpServer: HTTPServer): Server {
  io = new Server(httpServer, {
    cors: {
      origin: env.CORS_ORIGINS.split(','),
      credentials: true,
    },
  });

  // JWT auth middleware — disconnect immediately if invalid
  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error('UNAUTHORIZED'));
    }
    try {
      const payload = verifyAccess(token);
      socket.data.user = payload;
      next();
    } catch {
      next(new Error('TOKEN_INVALID'));
    }
  });

  io.on('connection', (socket: Socket) => {
    logger.debug('Socket connected', { userId: socket.data.user?.userId });

    // Join eventId room
    socket.on('join:event', (eventId: string) => {
      if (eventId && typeof eventId === 'string') {
        socket.join(eventId);
        logger.debug('Socket joined event room', { eventId, userId: socket.data.user?.userId });
      }
    });

    socket.on('leave:event', (eventId: string) => {
      if (eventId && typeof eventId === 'string') {
        socket.leave(eventId);
      }
    });

    socket.on('disconnect', () => {
      logger.debug('Socket disconnected', { userId: socket.data.user?.userId });
    });
  });

  return io;
}

/**
 * Get the Socket.IO server instance.
 */
export function getIO(): Server {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
}

/**
 * Emit guest updated event to an event room.
 */
export function emitGuestUpdated(eventId: string, sheetId: string, guest: any): void {
  if (io) {
    io.to(eventId).emit('guest:updated', { eventId, sheetId, guest });
  }
}

/**
 * Emit guest check-in event to an event room.
 */
export function emitGuestCheckin(eventId: string, guestId: string, checkIn: boolean): void {
  if (io) {
    io.to(eventId).emit('guest:checkin', { eventId, guestId, checkIn });
  }
}

/**
 * Emit guest deleted event to an event room.
 */
export function emitGuestDeleted(eventId: string, sheetId: string, guestId: string): void {
  if (io) {
    io.to(eventId).emit('guest:deleted', { eventId, sheetId, guestId });
  }
}

/**
 * Emit counter updated event to an event room.
 */
export function emitCounterUpdated(
  eventId: string,
  counters: { total: number; checkedIn: number; notComing: number; idsPending: number }
): void {
  if (io) {
    io.to(eventId).emit('counter:updated', { eventId, counters });
  }
}
