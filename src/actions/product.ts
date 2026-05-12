"use server";

import prisma, { withRetry } from "@/lib/prisma";
import { logActivity } from "@/lib/logger";
import { getCurrentUser, requireSameUser } from "@/lib/auth";
import { getCached, invalidateCachePrefix } from "@/lib/cache";

export async function getTrendingProducts() {
  try {
    if (!process.env.DATABASE_URL) return [];

    const products = await getCached("home:trending-products", 45, () => withRetry(() => prisma.product.findMany({
      where: {
        status: "LIVE",
        inventory: { gt: 0 },
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
            verificationLevel: true,
            isTrustedSeller: true,
            trustScore: true,
          }
        }
      }
    })));

    return products;
  } catch (error) {
    console.error("Error fetching trending products:", error);
    return [];
  }
}

export async function getCategories() {
  try {
    const categories = await getCached("home:categories", 300, () => withRetry(() => prisma.category.findMany({
      orderBy: {
        name: "asc",
      }
    })));
    return categories;
  } catch (error) {
    console.error("[Action:getCategories] Error:", error);
    return [];
  }
}

export async function getSubcategories(categoryId: string) {
  try {
    const subcategories = await withRetry(() => prisma.subcategory.findMany({
      where: { categoryId },
      orderBy: { name: "asc" }
    }));
    return subcategories;
  } catch (error) {
    console.error("[Action:getSubcategories] Error:", error);
    return [];
  }
}


export async function searchProducts(opts: {
  query?: string;
  categorySlug?: string;
  condition?: string;
  listingType?: "SELL" | "RENT" | "SERVICE";
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  campusId?: string;
  page?: number;
  pageSize?: number;
}) {
  try {
    const { query, categorySlug, condition, listingType, minPrice, maxPrice, sortBy, campusId } = opts;
    const page = Math.max(1, opts.page || 1);
    const pageSize = Math.min(Math.max(opts.pageSize || 24, 1), 50);
    const andFilters: any[] = [];

    if (query) {
      andFilters.push({
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
          { category: { name: { contains: query, mode: "insensitive" } } },
          { brand: { contains: query, mode: "insensitive" } },
        ],
      });
    }

    if (categorySlug) {
      andFilters.push({
        OR: [
          { categoryId: categorySlug },
          { category: { slug: categorySlug } },
        ],
      });
    }

    const priceFilter: Record<string, number> = {};
    if (minPrice !== undefined) priceFilter.gte = minPrice;
    if (maxPrice !== undefined) priceFilter.lte = maxPrice;
    if (Object.keys(priceFilter).length > 0) {
      andFilters.push({ price: priceFilter });
    }

    const cacheKey = `search:${JSON.stringify({ query, categorySlug, condition, listingType, minPrice, maxPrice, sortBy, campusId, page, pageSize })}`;
    const products = await getCached(cacheKey, 30, () => withRetry(() => prisma.product.findMany({
      where: {
        status: "LIVE",
        inventory: { gt: 0 },
        ...(campusId && { campusId }),
        ...(condition && { condition: condition as any }),
        ...(listingType && { listingType }),
        ...(andFilters.length > 0 && { AND: andFilters }),
      },
      orderBy: [
        ...(campusId ? [{ campusId: "asc" as const }] : []), // Simple prioritization (database specific)
        sortBy === "price_asc"
          ? { price: "asc" as const }
          : sortBy === "price_desc"
          ? { price: "desc" as const }
          : { createdAt: "desc" as const }
      ],
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        title: true,
        price: true,
        images: true,
        pickupLocation: true,
        createdAt: true,
        isUrgent: true,
        listingType: true,
        condition: true,
        categoryId: true,
        subcategoryId: true,
        sellerId: true,
        seller: {
          select: { 
            name: true, 
            image: true, 
            isVerified: true,
            verificationLevel: true,
            isTrustedSeller: true,
            trustScore: true,
            profile: { select: { avgResponseTime: true } }
          },
        },
        category: { select: { name: true, slug: true } },
      },
    })));

    return products;
  } catch (error) {
    console.error("Error searching products:", error);
    return [];
  }
}

export async function getRecentlyAdded() {
  try {
    return await getCached("home:recently-added", 45, () => withRetry(() => prisma.product.findMany({
      where: { status: "LIVE", inventory: { gt: 0 } },
      take: 8,
      orderBy: { createdAt: "desc" },
      include: {
        seller: { select: { name: true, isVerified: true, image: true } }
      }
    })));
  } catch (error) {
    console.error("[Action:getRecentlyAdded] Error:", error);
    return [];
  }
}


export async function getPopularRentals() {
  try {
    return await getCached("home:popular-rentals", 45, () => withRetry(() => prisma.product.findMany({
      where: { 
        status: "LIVE",
        inventory: { gt: 0 },
        listingType: "RENT"
      },
      take: 8,
      orderBy: { createdAt: "desc" },
      include: {
        seller: { select: { name: true, isVerified: true, image: true } }
      }
    })));
  } catch (error) {
    console.error("[Action:getPopularRentals] Error:", error);
    return [];
  }
}


export async function getVerifiedSellersProducts() {
  try {
    return await getCached("home:verified-sellers-products", 45, () => withRetry(() => prisma.product.findMany({
      where: { 
        status: "LIVE",
        inventory: { gt: 0 },
        seller: { isVerified: true }
      },
      take: 8,
      orderBy: { createdAt: "desc" },
      include: {
        seller: { select: { name: true, isVerified: true, image: true } }
      }
    })));
  } catch (error) {
    console.error("[Action:getVerifiedSellersProducts] Error:", error);
    return [];
  }
}


export async function getProductById(id: string) {
  try {
    return await withRetry(() => prisma.product.findUnique({
      where: { id },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            image: true,
            isVerified: true,
            verificationLevel: true,
            isTrustedSeller: true,
            trustScore: true,
            createdAt: true,
            profile: {
              select: {
                collegeName: true,
                course: true,
                batch: true,
                year: true,
                rating: true,
                successfulDeals: true,
                successRate: true,
                avgResponseTime: true,
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
    }));
  } catch (error) {
    console.error("[Action:getProductById] Error:", error);
    return null;
  }
}


export async function getUserListings(userId: string) {
  try {
    const currentUser = await getCurrentUser();
    const isOwner = currentUser?.uid === userId;

    return await withRetry(() => prisma.product.findMany({
      where: {
        sellerId: userId,
        ...(isOwner ? {} : { status: "LIVE" as const }),
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
    }));
  } catch (error) {
    console.error("[Action:getUserListings] Error:", error);
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
  listingType?: "SELL" | "RENT" | "SERVICE";
  inventory?: number;
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
  isExchangeAllowed?: boolean;
  exchangeCategories?: string[];
  exchangeCashAllowed?: boolean;
}) {
  try {
    await requireSameUser(data.sellerId);

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

    const product = await withRetry(() => prisma.product.create({
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
        inventory: data.inventory || 1,
        categoryId: data.categoryId,
        subcategoryId: data.subcategoryId,
        customSubcategory: data.customSubcategory,
        sellerId: data.sellerId,
        campusId: data.campusId,
        images: data.images,
        pickupLocation: data.location,
        isNegotiable: data.isNegotiable,
        isUrgent: data.isUrgent,
        isExchangeAllowed: data.isExchangeAllowed || false,
        exchangeCategories: data.exchangeCategories || [],
        exchangeCashAllowed: data.exchangeCashAllowed || false,
        status: "LIVE", // New listings go live immediately for now
      }
    }));

    await logActivity({
      userId: data.sellerId,
      actionType: "PRODUCT_CREATED",
      productId: product.id,
      metadata: { title: product.title, price: product.price }
    });

    invalidateCachePrefix("products:");
    invalidateCachePrefix("search:");
    invalidateCachePrefix("home:");

    return { success: true, productId: product.id };
  } catch (error: any) {
    console.error("Error creating product:", error);
    return { success: false, error: error.message || "Failed to create product" };
  }
}

export async function updateProduct(productId: string, userId: string, data: Partial<any>) {
  try {
    await requireSameUser(userId);

    // 1. Verify Ownership
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { sellerId: true, price: true, title: true }
    });

    if (!product) {
      return { success: false, error: "Product not found" };
    }

    if (product.sellerId !== userId) {
      return { success: false, error: "Unauthorized: You do not own this listing" };
    }

    // 2. Perform Update
    const updated = await prisma.product.update({
      where: { id: productId },
      data: {
        ...data,
        updatedAt: new Date(),
      }
    });

    await logActivity({
      userId,
      actionType: "PRODUCT_EDITED",
      productId: productId,
      metadata: { changes: Object.keys(data) }
    });

    invalidateCachePrefix("products:");
    invalidateCachePrefix("search:");
    invalidateCachePrefix("home:");

    // 3. Trigger Notification if price dropped
    if (data.price && data.price < product.price) {
      try {
        const wishlistedUsers = await prisma.wishlist.findMany({
          where: { productId },
          select: { userId: true }
        });

        if (wishlistedUsers.length > 0) {
          const { createNotification } = await import("./notification");
          for (const item of wishlistedUsers) {
            await createNotification({
              userId: item.userId,
              type: "SYSTEM",
              title: "Price Drop Alert! 📉",
              content: `Price dropped for "${product.title}"! Now ₹${data.price.toLocaleString('en-IN')} (was ₹${product.price.toLocaleString('en-IN')})`,
              link: `/product/${productId}`
            });
          }
        }
      } catch (notifErr) {
        console.error("Failed to trigger price change notifications:", notifErr);
      }
    }

    return { success: true, product: updated };
  } catch (error: any) {
    console.error("Error updating product:", error);
    return { success: false, error: error.message || "Failed to update product" };
  }
}

export async function archiveProduct(productId: string, userId: string) {
  try {
    await requireSameUser(userId);

    // 1. Verify Ownership
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { sellerId: true }
    });

    if (!product) {
      return { success: false, error: "Product not found" };
    }

    if (product.sellerId !== userId) {
      return { success: false, error: "Unauthorized: You do not own this listing" };
    }

    // 2. Soft Delete
    await prisma.product.update({
      where: { id: productId },
      data: { status: "ARCHIVED" }
    });

    await logActivity({
      userId,
      actionType: "PRODUCT_ARCHIVED",
      productId: productId
    });

    invalidateCachePrefix("products:");
    invalidateCachePrefix("search:");
    invalidateCachePrefix("home:");

    return { success: true };
  } catch (error: any) {
    console.error("Error archiving product:", error);
    return { success: false, error: error.message || "Failed to archive product" };
  }
}

export async function getProductsByIds(ids: string[]) {
  try {
    return await withRetry(() => prisma.product.findMany({
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
    }));
  } catch (error) {
    console.error("[Action:getProductsByIds] Error:", error);
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
export async function markProductAsSold(productId: string, userId: string) {
  try {
    await requireSameUser(userId);

    // 1. Verify Ownership
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { sellerId: true, title: true }
    });

    if (!product || product.sellerId !== userId) {
      return { success: false, error: "Unauthorized" };
    }

    // 2. Update Status
    await prisma.product.update({
      where: { id: productId },
      data: { status: "SOLD" }
    });

    await logActivity({
      userId,
      actionType: "PRODUCT_MARKED_SOLD",
      productId: productId
    });

    invalidateCachePrefix("products:");
    invalidateCachePrefix("search:");
    invalidateCachePrefix("home:");

    // 3. Notify Wishlisted Users
    try {
      const wishlistedUsers = await prisma.wishlist.findMany({
        where: { productId },
        select: { userId: true }
      });

      if (wishlistedUsers.length > 0) {
        const { createNotification } = await import("./notification");
        for (const item of wishlistedUsers) {
          await createNotification({
            userId: item.userId,
            type: "SYSTEM",
            title: "Item Sold Out! 💨",
            content: `The item "${product.title}" in your wishlist has been sold.`,
            link: `/search`
          });
        }
      }
    } catch (notifErr) {
      console.error("Failed to trigger sold notifications:", notifErr);
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error marking product as sold:", error);
    return { success: false, error: error.message };
  }
}
