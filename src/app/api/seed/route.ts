import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { seedSubcategories } from "@/lib/seed-subs";

export const dynamic = "force-dynamic";

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Seed route disabled in production" }, { status: 403 });
  }

  try {
    // 1. Create a dummy seller
    const seller = await prisma.user.upsert({
      where: { id: "seed-user-1" },
      update: {},
      create: {
        id: "seed-user-1",
        name: "Rahul Sharma",
        email: "rahul.sharma@lpu.co.in",
        isVerified: true,
        trustScore: 85,
        isProfileCompleted: true,
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

    const country = await prisma.country.upsert({
      where: { slug: "india" },
      update: {},
      create: { name: "India", slug: "india" },
    });
    const state = await prisma.state.upsert({
      where: { name_countryId: { name: "Punjab", countryId: country.id } },
      update: {},
      create: { name: "Punjab", slug: "punjab", countryId: country.id },
    });
    const city = await prisma.city.upsert({
      where: { name_stateId: { name: "Phagwara", stateId: state.id } },
      update: {},
      create: { name: "Phagwara", slug: "phagwara", stateId: state.id },
    });
    const campus = await prisma.campus.upsert({
      where: { name_cityId: { name: "LPU Campus", cityId: city.id } },
      update: {},
      create: { name: "LPU Campus", slug: "lpu-campus", cityId: city.id },
    });

    // 2. Seed Categories (Safe for dev)
    const categoriesData = [
      { name: "Books", slug: "books", icon: "book-open" },
      { name: "Electronics", slug: "electronics", icon: "zap" },
      { name: "Mobiles", slug: "mobiles", icon: "smartphone" },
      { name: "Cycles", slug: "cycles", icon: "bike" },
      { name: "Hostel Essentials", slug: "hostel", icon: "package" },
      { name: "Fashion", slug: "fashion", icon: "shirt" },
      { name: "Gaming", slug: "gaming", icon: "gamepad" },
      { name: "Other", slug: "other", icon: "more-horizontal" },
    ];

    for (const cat of categoriesData) {
      await prisma.category.upsert({
        where: { slug: cat.slug },
        update: { name: cat.name, icon: cat.icon },
        create: cat,
      });
    }

    // 3. Seed Subcategories
    try {
      await seedSubcategories();
    } catch (e) {
      console.warn("Subcategory seeding failed:", e);
    }

    // 4. Create dummy products
    try {
      const electronicsCat = await prisma.category.findUnique({ where: { slug: "electronics" } });
      const p = prisma as any;
      const fanSub = p.subcategory ? await p.subcategory.findFirst({ 
        where: { name: "Fan", categoryId: electronicsCat?.id } 
      }) : null;
      
      if (electronicsCat && fanSub) {
        await prisma.product.upsert({
          where: { id: "seed-prod-1" },
          update: {},
          create: {
            id: "seed-prod-1",
            title: "Usha Table Fan - High Speed",
            description: "Portable high-speed fan. 3 settings. Perfect for summer in BH.",
            price: 1200,
            originalPrice: 2400,
            brand: "Usha",
            purchaseYear: 2023,
            condition: "GOOD",
            conditionDetails: { usage: "Regularly", functionality: "Yes", appearance: "Good" },
            listingType: "SELL",
            images: ["https://images.unsplash.com/photo-1549490349-8643362247b5?w=800&q=80"],
            pickupLocation: "BH-4, Block A",
            sellerId: seller.id,
            categoryId: electronicsCat.id,
            subcategoryId: fanSub.id,
            campusId: campus.id,
          }
        });
      }
    } catch (e) {
      console.warn("Product seeding failed:", e);
    }

    return NextResponse.json({ success: true, message: "Seed attempt complete. Check logs for soft failures." });
  } catch (error: any) {
    console.error("Global Seed error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
