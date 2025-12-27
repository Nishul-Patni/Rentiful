import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client.js";
import dotenv from "dotenv"

dotenv.config();

const connectionString = `${process.env.DATABASE_URL}`

if (!connectionString || connectionString === 'undefined') {
  console.error('DATABASE_URL environment variable is not set');
  process.exit(1);
}

const adapter = new PrismaPg({ connectionString })

export const prisma = new PrismaClient({adapter});

export default prisma