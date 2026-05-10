import prisma from "@/lib/prisma";

export async function seedSubcategories() {
  if (!(prisma as any).subcategory) {
    console.warn("Subcategory model not found in Prisma client. Skipping.");
    return;
  }
  const categories = await prisma.category.findMany();
  
  const subMapping: Record<string, string[]> = {
    "Electronics": ["Laptop", "Fan", "Monitor", "Keyboard", "Speaker", "Cooler", "Iron", "Induction", "Printer", "Projector"],
    "Mobiles": ["iPhone", "Samsung", "Android Phone", "Charger", "Headphones", "Smartwatch", "Tablet"],
    "Books": ["Engineering", "Management", "Fiction", "Entrance Exam", "Notebooks", "Novels", "Law"],
    "Fashion": ["Clothing", "Footwear", "Bags", "Accessories", "Watch"],
    "Transport": ["Bicycle", "Electric Scooter", "Helmet", "Skateboard"],
    "Hostel Essentials": ["Bedding", "Bucket/Mug", "Storage Box", "Mirror", "Curtains", "Mattress", "Lamp"],
    "Gaming": ["Gaming Laptop", "PlayStation", "Xbox", "Gaming Console", "Controller", "VR Headset"],
  };

  for (const cat of categories) {
    const subs = subMapping[cat.name] || [];
    for (const subName of subs) {
      const slug = subName.toLowerCase().replace(/ /g, "-");
      const p = prisma as any;
      if (p.subcategory) {
        await p.subcategory.upsert({
          where: { name_categoryId: { name: subName, categoryId: cat.id } },
          update: { slug },
          create: {
            name: subName,
            slug,
            categoryId: cat.id
          }
        });
      }
    }
  }
}
