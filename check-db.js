const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient();
  
  try {
    const productCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM "Product"`;
    console.log('Product count:', productCount);
    
    const usersCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM "User"`;
    console.log('User count:', usersCount);
    
    const categoriesCount = await prisma.category.count();
    console.log('Category count:', categoriesCount);

    const subcategoriesCount = await prisma.subcategory.count();
    console.log('Subcategory count:', subcategoriesCount);
  } catch (e) {
    console.log('Error:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();