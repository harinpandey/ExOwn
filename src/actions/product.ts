"use server";

import prisma from "@/lib/prisma";

export async function getTrendingProducts() {
  try {
    if (!process.env.DATABASE_URL) return [];

    const products = await prisma.product.findMany({
      where: {
        status: "LIVE",
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 8,
      include: {
        seller: {
          select: {
            name: true,
            image: true,
            isVerified: true,
          }
        }
      }
    });

    return products;
  } catch (error) {
    console.error("Error fetching trending products:", error);
    return [];
  }
}

export async function getCategories() {
  try {
    return await prisma.category.findMany({
      orderBy: {
        name: "asc",
      }
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

export async function getSubcategories(categoryId: string) {
  try {
    return await prisma.subcategory.findMany({
      where: { categoryId },
      orderBy: { name: "asc" }
    });
  } catch (error) {
    console.error("Error fetching subcategories:", error);
    return [];
  }
}

export async function searchProducts(opts: {
  query?: string;
  categorySlug?: string;
  condition?: string;
  listingType?: "SELL" | "RENT";
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  campusId?: string;
}) {
  try {
    const { query, categorySlug, condition, listingType, minPrice, maxPrice, sortBy, campusId } = opts;

    const products = await prisma.product.findMany({
      where: {
        status: "LIVE",
        ...(query && {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
          ],
        }),
        ...(categorySlug && {
          category: { slug: categorySlug },
        }),
        ...(campusId && { campusId }),
        ...(condition && { condition: condition as any }),
        ...(listingType && { listingType }),
        ...(minPrice !== undefined && { price: { gte: minPrice } }),
        ...(maxPrice !== undefined && { price: { lte: maxPrice } }),
      },
      orderBy:
        sortBy === "price_asc"
          ? { price: "asc" }
          : sortBy === "price_desc"
          ? { price: "desc" }
          : { createdAt: "desc" },
      include: {
        seller: {
          select: { name: true, image: true, isVerified: true },
        },
        category: { select: { name: true, slug: true } },
      },
    });

    return products;
  } catch (error) {
    console.error("Error searching products:", error);
    return [];
  }
}

export async function getRecentlyAdded() {
  try {
    return await prisma.product.findMany({
      where: { status: "LIVE" },
      take: 8,
      orderBy: { createdAt: "desc" },
      include: {
        seller: { select: { name: true, isVerified: true, image: true } }
      }
    });
  } catch (error) {
    console.error("Error fetching recent products:", error);
    return [];
  }
}

export async function getPopularRentals() {
  try {
    return await prisma.product.findMany({
      where: { 
        status: "LIVE",
        listingType: "RENT"
      },
      take: 8,
      orderBy: { createdAt: "desc" },
      include: {
        seller: { select: { name: true, isVerified: true, image: true } }
      }
    });
  } catch (error) {
    console.error("Error fetching rentals:", error);
    return [];
  }
}

export async function getVerifiedSellersProducts() {
  try {
    return await prisma.product.findMany({
      where: { 
        status: "LIVE",
        seller: { isVerified: true }
      },
      take: 8,
      orderBy: { createdAt: "desc" },
      include: {
        seller: { select: { name: true, isVerified: true, image: true } }
      }
    });
  } catch (error) {
    console.error("Error fetching verified products:", error);
    return [];
  }
}

export async function getProductById(id: string) {
  try {
    return await prisma.product.findUnique({
      where: { id },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            image: true,
            isVerified: true,
            createdAt: true,
            profile: {
              select: {
                collegeName: true,
                course: true,
                year: true,
                rating: true,
                successfulDeals: true,
                bio: true,
              }
            }
          }
        },
        category: {
          select: { name: true, slug: true }
        },
        campus: {
          select: { name: true }
        }
      }
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
}

export async function getUserListings(userId: string) {
  try {
    return await prisma.product.findMany({
      where: {
        sellerId: userId,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        seller: {
          select: {
            name: true,
            image: true,
            isVerified: true,
          }
        }
      }
    });
  } catch (error) {
    console.error("Error fetching user listings:", error);
    return [];
  }
}

export async function createProduct(data: {
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  brand?: string;
  purchaseYear?: number;
  condition: string;
  listingType?: "SELL" | "RENT";
  categoryId: string;
  subcategoryId?: string | null;
  customSubcategory?: string | null;
  sellerId: string;
  campusId: string;
  images: string[];
  location: string;
  isNegotiable: boolean;
  isUrgent: boolean;
  conditionDetails?: any;
}) {
  try {
    // 1. Fraud Check: Duplicate Listing
    const existing = await prisma.product.findFirst({
      where: {
        sellerId: data.sellerId,
        title: { equals: data.title, mode: 'insensitive' },
        price: data.price,
        status: { in: ['LIVE', 'PENDING'] }
      }
    });

    if (existing) {
      return { success: false, error: "You already have a similar active listing. Please edit the existing one." };
    }

    // 2. Fraud Check: Price Anomaly (Simple check for now)
    if (data.price <= 0) {
      return { success: false, error: "Price must be greater than zero." };
    }
    if (data.price > 1000000) {
      return { success: false, error: "Price seems unrealistic. Please contact support if this is intentional." };
    }

    // 3. Image check (Optional: check if these exact images were used before)

    const product = await prisma.product.create({
      data: {
        title: data.title,
        description: data.description,
        price: data.price,
        originalPrice: data.originalPrice,
        brand: data.brand,
        purchaseYear: data.purchaseYear,
        condition: data.condition as any,
        conditionDetails: data.conditionDetails,
        listingType: data.listingType || "SELL",
        categoryId: data.categoryId,
        subcategoryId: data.subcategoryId,
        customSubcategory: data.customSubcategory,
        sellerId: data.sellerId,
        campusId: data.campusId,
        images: data.images,
        pickupLocation: data.location,
        isNegotiable: data.isNegotiable,
        isUrgent: data.isUrgent,
        status: "LIVE", // New listings go live immediately for now
      }
    });

    return { success: true, productId: product.id };
  } catch (error: any) {
    console.error("Error creating product:", error);
    return { success: false, error: error.message || "Failed to create product" };
  }
}

export async function getProductsByIds(ids: string[]) {
  try {
    return await prisma.product.findMany({
      where: {
        id: { in: ids }
      },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            image: true,
            isVerified: true,
            profile: {
              select: {
                rating: true,
              }
            }
          }
        },
        category: { select: { name: true } }
      }
    });
  } catch (error) {
    console.error("Error fetching products by ids:", error);
    return [];
  }
}

export async function incrementProductViews(id: string) {
  try {
    await prisma.product.update({
      where: { id },
      data: { views: { increment: 1 } }
    });
  } catch (err) {
    console.error("Failed to increment views:", err);
  }
}
