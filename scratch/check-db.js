const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const categoriesCount = await prisma.category.count();
  const productsCount = await prisma.product.count();
  console.log(`Categories: ${categoriesCount}, Products: ${productsCount}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
