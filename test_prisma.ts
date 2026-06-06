import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const whereClause: any = {
    AND: [
      {},
      {},
    ],
  };

  try {
    const total = await prisma.product.count({ where: whereClause });
    console.log("Total:", total);
  } catch (e) {
    console.error("Error:", e);
  }
}

main().finally(() => prisma.$disconnect());
