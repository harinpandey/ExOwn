const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const CATEGORIES_CONFIG = [
  { slug: "mobiles-gadgets", name: "Mobiles & Gadgets", oldSlug: "mobiles" },
  { slug: "electronics-appliances", name: "Electronics & Appliances", oldSlug: "electronics" },
  { slug: "computers-laptops", name: "Computers & Laptops", oldSlug: "computers" },
  { slug: "furniture-hostel", name: "Furniture & Hostel Essentials", oldSlug: "furniture" },
  { slug: "fashion", name: "Fashion", oldSlug: "fashion" },
  { slug: "books-sports-hobbies", name: "Books, Sports & Hobbies", oldSlug: "books" },
  { slug: "bikes-transport", name: "Bikes & Transport", oldSlug: "cycles" },
  { slug: "cars", name: "Cars", oldSlug: "cars" },
  { slug: "properties", name: "Properties", oldSlug: "properties" },
  { slug: "gaming-entertainment", name: "Gaming & Entertainment", oldSlug: "gaming" },
  { slug: "services", name: "Services", oldSlug: "services" },
  { slug: "jobs", name: "Jobs", oldSlug: "jobs" },
];

async function main() {
  console.log("Synchronizing categories...");
  
  for (const cat of CATEGORIES_CONFIG) {
    // Try to find by old slug or current slug
    const dbCat = await prisma.category.findFirst({
      where: {
        OR: [
          { slug: cat.oldSlug },
          { slug: cat.slug }
        ]
      }
    });

    if (dbCat) {
      await prisma.category.update({
        where: { id: dbCat.id },
        data: {
          slug: cat.slug,
          name: cat.name
        }
      });
      console.log(`Updated category: ${cat.name}`);
    } else {
      // Create if missing
      await prisma.category.create({
        data: {
          name: cat.name,
          slug: cat.slug,
          icon: "package"
        }
      });
      console.log(`Created category: ${cat.name}`);
    }
  }

  // Also need to handle subcategories if needed, but the main issue is category slug mismatch
  console.log("Sync complete.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
