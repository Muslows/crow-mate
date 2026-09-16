import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  prismaRev?: number;
};

/** Incrémenter après un `prisma generate` pour éjecter le client stale en dev. */
const PRISMA_CLIENT_REV = 12;

function getClient(): PrismaClient {
  if (
    globalForPrisma.prisma &&
    globalForPrisma.prismaRev === PRISMA_CLIENT_REV
  ) {
    return globalForPrisma.prisma;
  }
  void globalForPrisma.prisma?.$disconnect();
  const client = new PrismaClient();
  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = client;
    globalForPrisma.prismaRev = PRISMA_CLIENT_REV;
  }
  return client;
}

export const db = getClient();
