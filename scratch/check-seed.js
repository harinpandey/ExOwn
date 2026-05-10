const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function check() {
  const categories = await prisma.category.count();
  const campuses = await prisma.campus.count();
  const products = await prisma.product.count();
  console.log({ categories, campuses, products });
}

check().catch(console.error).finally(() => prisma.$disconnect());
