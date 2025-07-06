import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
  return globalThis.__prisma || (globalThis.__prisma = new PrismaClient());
};

declare global {
  // Avoid "Cannot redeclare block-scoped variable" error
  // Only adds this type once globally
  var __prisma: PrismaClient | undefined;
}

export const prisma = prismaClientSingleton();
