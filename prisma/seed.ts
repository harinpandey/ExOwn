require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient({ log: ['error'] });

async function main() {
  console.log("Seeding database...");

  // 1. Create Location Hierarchy
  const india = await prisma.country.upsert({
    where: { slug: "india" },
    update: {},
    create: { name: "India", slug: "india" }
  });

  const punjab = await prisma.state.upsert({
    where: { name_countryId: { name: "Punjab", countryId: india.id } },
    update: {},
    create: { name: "Punjab", slug: "punjab", countryId: india.id }
  });

  const jalandhar = await prisma.city.upsert({
    where: { name_stateId: { name: "Jalandhar", stateId: punjab.id } },
    update: {},
    create: { name: "Jalandhar", slug: "jalandhar", stateId: punjab.id }
  });

  const lpu = await prisma.campus.upsert({
    where: { name_cityId: { name: "Lovely Professional University", cityId: jalandhar.id } },
    update: {},
    create: { name: "Lovely Professional University", slug: "lpu", cityId: jalandhar.id }
  });

  // 2. Create a dummy seller
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
      collegeName: "LPU",
      course: "B.Tech CSE",
      batch: "2024",
      hostel: "BH-4",
      rating: 4.5,
      successfulDeals: 12
    }
  });

  // 3. Create Categories & Subcategories
  const categories = [
    { name: "Mobiles & Gadgets", slug: "mobiles-gadgets", icon: "smartphone" },
    { name: "Electronics & Appliances", slug: "electronics-appliances", icon: "tv" },
    { name: "Computers & Laptops", slug: "computers-laptops", icon: "laptop" },
    { name: "Furniture & Hostel Essentials", slug: "furniture-hostel", icon: "bed" },
    { name: "Fashion", slug: "fashion", icon: "shirt" },
    { name: "Books, Sports & Hobbies", slug: "books-sports-hobbies", icon: "book-open" },
    { name: "Bikes & Transport", slug: "bikes-transport", icon: "bike" },
    { name: "Cars", slug: "cars", icon: "car" },
    { name: "Properties", slug: "properties", icon: "home" },
    { name: "Jobs", slug: "jobs", icon: "briefcase" },
    { name: "Services", slug: "services", icon: "wrench" },
    { name: "Gaming & Entertainment", slug: "gaming-entertainment", icon: "gamepad-2" },
  ];

  const subcategoriesMap = {
    "mobiles-gadgets": ["Android Phones", "iPhones", "Tablets", "Smartwatch", "Earbuds", "Chargers", "Power Banks", "Mobile Accessories", "Other"],
    "electronics-appliances": ["TV", "Speaker", "Camera", "Fan", "Fridge", "AC", "Washing Machine", "Kitchen Appliances", "Cooler", "Other"],
    "computers-laptops": ["Laptop", "Desktop", "Monitor", "Printer", "Keyboard", "Mouse", "Router", "Hard Drive", "SSD", "Other"],
    "furniture-hostel": ["Chair", "Study Table", "Bed", "Mattress", "Storage Rack", "Lamp", "Fan", "Mirror", "Other"],
    "fashion": ["Shoes", "Bags", "Watches", "Jackets", "Men's Wear", "Women's Wear", "Accessories", "Other"],
    "books-sports-hobbies": ["Textbooks", "Notes", "Calculators", "Sports Equipment", "Musical Instruments", "Hobby Kits", "Other"],
    "bikes-transport": ["Bicycle", "Helmet", "Locks", "Accessories", "Other"],
    "cars": ["Cars", "Car Accessories", "Tyres", "Other"],
    "properties": ["Room", "PG", "Flat", "Hostel Transfer", "Shared Accommodation", "Other"],
    "jobs": ["Internship", "Part-Time", "Freelance", "Campus Ambassador", "Other"],
    "services": ["Repair", "Tutoring", "Printing", "Assignment Help", "Delivery Help", "Event Help", "Other"],
    "gaming-entertainment": ["Consoles", "Controllers", "Gaming Keyboard", "Gaming Mouse", "Headsets", "Gaming Chair", "Other"],
  };

  for (const cat of categories) {
    const category = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, icon: cat.icon },
      create: cat,
    });

    const subs = (subcategoriesMap as any)[cat.slug] || [];
    for (const subName of subs) {
      await prisma.subcategory.upsert({
        where: { 
          name_categoryId: { 
            name: subName, 
            categoryId: category.id 
          } 
        },
        update: {},
        create: {
          name: subName,
          slug: subName.toLowerCase().replace(/ /g, "-"),
          categoryId: category.id,
        },
      });
    }
  }

  // 4. Create fresh dummy products
  const dbCats = await prisma.category.findMany();
  const catMap = {};
  dbCats.forEach((c: any) => (catMap as any)[c.slug] = c.id);

  const dummyProducts = [
    {
      title: "iPhone 13 - 128GB - Midnight Blue",
      description: "Excellent condition iPhone 13. Always used with case and screen protector. Battery health 88%.",
      price: 32000,
      isNegotiable: true,
      condition: "GOOD",
      conditionDetails: { brand: "Apple", storage: "128GB", battery_health: "80-90%", screen_condition: "Pristine" },
      images: ["https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=800&q=80"],
      pickupLocation: "BH-4, Block A",
      isUrgent: false,
      sellerId: seller.id,
      categoryId: (catMap as any)["mobiles-gadgets"],
      campusId: lpu.id,
      status: "LIVE",
    },
    {
      title: "MacBook Air M1 - 16GB RAM",
      description: "Customized MacBook Air with 16GB RAM. Perfect for coding and design. Includes original box.",
      price: 62000,
      isNegotiable: false,
      condition: "GOOD",
      conditionDetails: { brand: "Apple", processor: "M1", ram: "16GB", storage: "256GB SSD" },
      images: ["https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&q=80"],
      pickupLocation: "BH-4, Block A",
      isUrgent: true,
      sellerId: seller.id,
      categoryId: (catMap as any)["electronics-appliances"],
      campusId: lpu.id,
      status: "LIVE",
    },
    {
      title: "Firefox Geared Cycle",
      description: "21-speed geared cycle, perfectly maintained. New tyres installed last month.",
      price: 4500,
      isNegotiable: true,
      condition: "GOOD",
      conditionDetails: { brand: "Firefox", gear_type: "21 Speed", brake_condition: "Perfect", tyre_condition: "New" },
      images: ["https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800&q=80"],
      pickupLocation: "BH-1 Cycle Stand",
      isUrgent: true,
      sellerId: seller.id,
      categoryId: (catMap as any)["bikes-transport"],
      campusId: lpu.id,
      status: "LIVE",
    }
  ];

  for (const product of dummyProducts) {
    if (product.categoryId) {
      await prisma.product.create({ data: product });
    }
  }

  console.log("Database seeded successfully with new architecture, locations and products!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
