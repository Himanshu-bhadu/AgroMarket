// app/lib/prisma.ts
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

// 1. Create a connection pool using your environment variable
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });

// 2. Wrap it in the Prisma Postgres Adapter
const adapter = new PrismaPg(pool);

// 3. Prevent multiple instances in development (Next.js hot-reloading)
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// 4. Initialize Prisma with the new adapter!
export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;