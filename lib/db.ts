import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  prismaRev?: number;
};

/** Incrémenter après un `prisma generate` pour éjecter le client stale en dev. */
const PRISMA_CLIENT_REV = 13;

function databaseUrl(): string | undefined {
  const url = process.env.DATABASE_URL;
  if (!url) return undefined;
  if (url.includes("sslmode=") || url.includes("localhost") || url.includes("127.0.0.1")) {
    return url;
  }
  return `${url}${url.includes("?") ? "&" : "?"}sslmode=require`;
}

function getClient(): PrismaClient {
  if (
    globalForPrisma.prisma &&
    globalForPrisma.prismaRev === PRISMA_CLIENT_REV
  ) {
    return globalForPrisma.prisma;
  }
  void globalForPrisma.prisma?.$disconnect();
  const url = databaseUrl();
  const client = new PrismaClient(
    url ? { datasources: { db: { url } } } : undefined,
  );
  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = client;
    globalForPrisma.prismaRev = PRISMA_CLIENT_REV;
  }
  return client;
}

export const db = getClient();
