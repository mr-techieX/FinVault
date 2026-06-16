import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const connectionString = "postgresql://neondb_owner:npg_Tc06WanpYuSx@ep-quiet-cherry-at7vdhhf.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require";
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = "pranavswaroop.nayak@gmail.com";
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (user) {
      await prisma.user.delete({
        where: { id: user.id },
      });
      console.log(`Successfully deleted user with email: ${email}`);
    } else {
      console.log(`No user found with email: ${email}`);
    }
  } catch (error) {
    console.error("ERROR DELETING USER:", error);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
