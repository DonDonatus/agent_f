import { PrismaClient } from '@prisma/client';

declare global {
  // Ensure the global type augmentation only happens once
  // Used to persist Prisma client across hot reloads in development
  var __prisma: PrismaClient | undefined;
}

// Create a single Prisma client instance or reuse existing one (for dev)
const prisma =
  globalThis.__prisma ??
  new PrismaClient({
    log: ['query'], // optional: useful for debugging in dev
  });

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma;
}

export { prisma };
