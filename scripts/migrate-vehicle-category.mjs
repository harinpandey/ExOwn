require("dotenv").config();
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient({ log: ["error"] });

const desiredSubcategories = [
  "Cycles",
  "E-Bikes",
  "Motorcycles",
  "Scooters",
  "Cars",
  "Helmets",
  "Locks",
  "Tyres",
  "Spare Parts",
  "Accessories",
  "Other",
];

const legacySubcategoryNames = {
  Bicycle: "Cycles",
  Bike: "Cycles",
  Helmet: "Helmets",
  "Car Accessories": "Accessories",
};

function slugify(value) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

async function main() {
  await prisma.$transaction(async (tx) => {
    const [vehicles, legacyBikes, legacyCars] = await Promise.all([
      tx.category.findUnique({ where: { slug: "vehicles" } }),
      tx.category.findUnique({ where: { slug: "bikes-transport" } }),
      tx.category.findUnique({ where: { slug: "cars" } }),
    ]);

    let destination = vehicles || legacyBikes || legacyCars;

    if (!destination) {
      destination = await tx.category.create({
        data: { name: "Vehicles", slug: "vehicles", icon: "car" },
      });
    } else if (destination.slug !== "vehicles" || destination.name !== "Vehicles") {
      destination = await tx.category.update({
        where: { id: destination.id },
        data: { name: "Vehicles", slug: "vehicles", icon: "car" },
      });
    }

    const legacyCategories = [legacyBikes, legacyCars].filter(
      (category) => category && category.id !== destination.id
    );

    for (const legacyCategory of legacyCategories) {
      const oldSubcategories = await tx.subcategory.findMany({
        where: { categoryId: legacyCategory.id },
      });

      for (const oldSubcategory of oldSubcategories) {
        const nextName =
          legacySubcategoryNames[oldSubcategory.name] || oldSubcategory.name;
        const nextSlug = slugify(nextName);

        const existingSubcategory = await tx.subcategory.findFirst({
          where: {
            categoryId: destination.id,
            OR: [{ name: nextName }, { slug: nextSlug }],
          },
        });

        if (existingSubcategory) {
          await tx.product.updateMany({
            where: { subcategoryId: oldSubcategory.id },
            data: { subcategoryId: existingSubcategory.id },
          });
          await tx.subcategory.delete({ where: { id: oldSubcategory.id } });
        } else {
          await tx.subcategory.update({
            where: { id: oldSubcategory.id },
            data: {
              name: nextName,
              slug: nextSlug,
              categoryId: destination.id,
            },
          });
        }
      }

      await tx.product.updateMany({
        where: { categoryId: legacyCategory.id },
        data: { categoryId: destination.id },
      });

      await tx.category.delete({ where: { id: legacyCategory.id } });
    }

    for (const name of desiredSubcategories) {
      await tx.subcategory.upsert({
        where: {
          name_categoryId: {
            name,
            categoryId: destination.id,
          },
        },
        update: { slug: slugify(name) },
        create: {
          name,
          slug: slugify(name),
          categoryId: destination.id,
        },
      });
    }

    console.log(
      `Vehicles category ready. Existing listings are preserved under category ID ${destination.id}.`
    );
  });
}

main()
  .catch((error) => {
    console.error("Vehicle category migration failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
