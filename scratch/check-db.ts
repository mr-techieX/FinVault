import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const connectionString = "postgresql://neondb_owner:npg_Tc06WanpYuSx@ep-quiet-cherry-at7vdhhf.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require";
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  try {
    const users = await prisma.user.findMany({
      include: {
        accounts: true,
        profile: true,
      }
    });
    console.log("USERS IN DB:", JSON.stringify(users, null, 2));
  } catch (error) {
    console.error("ERROR CONNECTING TO DB:", error);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
