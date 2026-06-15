import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

let prismaInstance: PrismaClient;

if (globalForPrisma.prisma) {
  prismaInstance = globalForPrisma.prisma;
} else {
  // Use a fallback connection string if DATABASE_URL is not set (e.g. during build/compilation phase)
  const connectionString = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/finvault?schema=public";
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  prismaInstance = new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });
  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prismaInstance;
  }
}

export const db = prismaInstance;
