require("dotenv").config({ path: ".env.local" });

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function seed() {
  console.log("Seeding...");
  const seller = await prisma.user.upsert({
    where: { id: "seed-user-1" },
    update: {},
    create: {
      id: "seed-user-1",
      name: "Rahul Sharma",
      email: "rahul.sharma@lpu.co.in",
      isVerified: true,
      trustScore: 85,
    }
  });

  await prisma.profile.upsert({
    where: { userId: seller.id },
    update: {},
    create: {
      userId: seller.id,
      course: "B.Tech CSE",
      batch: "2024",
      hostel: "BH-4",
      rating: 4.5,
      successfulDeals: 12
    }
  });

  const categories = [
    { name: "Electronics", slug: "electronics", icon: "laptop" },
    { name: "Books & Notes", slug: "books", icon: "book" },
    { name: "Hostel Essentials", slug: "hostel-essentials", icon: "bed" },
    { name: "Bicycles", slug: "bicycles", icon: "bike" },
    { name: "Fashion", slug: "fashion", icon: "shirt" },
    { name: "Stationery", slug: "stationery", icon: "pen-tool" },
    { name: "Services", slug: "services", icon: "briefcase" },
    { name: "Others", slug: "others", icon: "more-horizontal" },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }

  console.log("Categories seeded!");
}

seed().catch(console.error).finally(() => process.exit(0));
