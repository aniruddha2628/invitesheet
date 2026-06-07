import mongoose from 'mongoose';
import dns from 'dns';
import { env } from './env.js';
import { logger } from '../services/logger.service.js';

// Force IPv4 + Google DNS — ISP DNS often can't resolve MongoDB SRV records
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '8.8.4.4']);

export async function connectDB(): Promise<void> {
  try {
    await mongoose.connect(env.MONGODB_URI, {
      family: 4, // Force IPv4
    });
    logger.info('✅ MongoDB connected successfully');
  } catch (error) {
    logger.error('❌ MongoDB connection failed', { error });
    process.exit(1);
  }

  mongoose.connection.on('error', (err) => {
    logger.error('MongoDB connection error', { error: err });
  });

  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected');
  });
}

export function isDBConnected(): boolean {
  return mongoose.connection.readyState === 1;
}
