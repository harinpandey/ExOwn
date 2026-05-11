const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Verticals (Rentals & Services)...");

  const lpu = await prisma.campus.findFirst({ where: { slug: "lpu" } });
  const seller = await prisma.user.findFirst({ where: { id: "seed-user-1" } });
  
  if (!lpu || !seller) {
    console.error("LPU campus or seed-user-1 not found. Run main seed first.");
    return;
  }

  const laptopCat = await prisma.category.findFirst({ where: { slug: "computers-laptops" } });
  const transportCat = await prisma.category.findFirst({ where: { slug: "bikes-transport" } });
  const serviceCat = await prisma.category.findFirst({ where: { slug: "services" } });

  // 1. Seed Rentals
  console.log("Adding Rentals...");
  const rent1 = await prisma.product.create({
    data: {
      title: "Geared Bicycle for Rent",
      description: "Hero Sprint 21-speed cycle. Available for daily or weekly rent.",
      price: 50, // Per day
      listingType: "RENT",
      condition: "GOOD",
      images: ["https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800&q=80"],
      pickupLocation: "BH-1 Cycle Stand",
      sellerId: seller.id,
      categoryId: transportCat.id,
      campusId: lpu.id,
      status: "LIVE",
      rentalDetail: {
        create: {
          securityDeposit: 500,
          minDuration: 1,
          terms: "Valid ID card required as collateral."
        }
      }
    }
  });

  const rent2 = await prisma.product.create({
    data: {
      title: "Gaming Laptop (RTX 3060) - Hourly/Daily",
      description: "ASUS ROG Zephyrus. High performance gaming laptop for project work or gaming sessions.",
      price: 200, // Per day
      listingType: "RENT",
      condition: "LIKE_NEW",
      images: ["https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&q=80"],
      pickupLocation: "BH-4, Block A",
      sellerId: seller.id,
      categoryId: laptopCat.id,
      campusId: lpu.id,
      status: "LIVE",
      rentalDetail: {
        create: {
          securityDeposit: 2000,
          minDuration: 1,
          terms: "Must be used within the hostel. No liquid damage."
        }
      }
    }
  });

  // 2. Seed Services
  console.log("Adding Services...");
  const service1 = await prisma.product.create({
    data: {
      title: "Laptop Repair & OS Installation",
      description: "Expert repair for all laptop brands. Windows/Linux installation, RAM upgrades, and deep cleaning.",
      price: 299, // Starting price
      listingType: "SERVICE",
      condition: "GOOD", // Default for services
      images: ["https://images.unsplash.com/photo-1597733336794-12d05021d510?w=800&q=80"],
      pickupLocation: "BH-4, Block B",
      sellerId: seller.id,
      categoryId: serviceCat.id,
      campusId: lpu.id,
      status: "LIVE",
      serviceDetail: {
        create: {
          hourlyRate: 150,
          experience: "3+ Years in HW Repair",
          availability: "Evenings (6 PM - 10 PM)",
          qualifications: "Certified Technician"
        }
      }
    }
  });

  const service2 = await prisma.product.create({
    data: {
      title: "Graphic Design & UI/UX Services",
      description: "Need a logo, poster, or UI design for your project? High-quality professional designs delivered in 24h.",
      price: 499,
      listingType: "SERVICE",
      condition: "GOOD",
      images: ["https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80"],
      pickupLocation: "Remote / Online",
      sellerId: seller.id,
      categoryId: serviceCat.id,
      campusId: lpu.id,
      status: "LIVE",
      serviceDetail: {
        create: {
          experience: "Freelance Designer for 2 years",
          availability: "Flexible / Weekends",
          portfolio: ["https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80"]
        }
      }
    }
  });

  console.log("Verticals Seeded Successfully!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
