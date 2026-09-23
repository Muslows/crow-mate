import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  prismaRev?: number;
};

/** Incrémenter après un `prisma generate` pour éjecter le client stale en dev. */
const PRISMA_CLIENT_REV = 28;

const LOCAL_DATABASE_URL =
  "postgresql://ow:ow@localhost:5432/ow_manager?schema=public";

function isRemoteDatabaseUrl(url: string): boolean {
  return /supabase\.com|pooler\.supabase|\.neon\.tech|vercel-storage|aws-0-/i.test(
    url,
  );
}

function databaseUrl(): string | undefined {
  let url = process.env.DATABASE_URL;
  const useRemote =
    process.env.VERCEL === "1" ||
    process.env.O2SWITCH === "1" ||
    process.env.USE_REMOTE_DB === "1";
  if (!useRemote && url && isRemoteDatabaseUrl(url)) {
    url = LOCAL_DATABASE_URL;
  }
  if (!url) return undefined;
  if (url.includes("sslmode=") || url.includes("localhost") || url.includes("127.0.0.1")) {
    return url;
  }
  return `${url}${url.includes("?") ? "&" : "?"}sslmode=require`;
}

export function getDb(): PrismaClient {
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

export const db = getDb();
