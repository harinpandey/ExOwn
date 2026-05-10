const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const result = await prisma.product.updateMany({
    where: { status: "PENDING" },
    data: { status: "LIVE" }
  });
  console.log(`Updated ${result.count} products to LIVE status.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
