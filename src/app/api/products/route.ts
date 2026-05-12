import { NextRequest, NextResponse } from "next/server";
import prisma, { withRetry } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { enforceRateLimit } from "@/lib/rate-limit";
import { getCached, invalidateCachePrefix } from "@/lib/cache";

export const dynamic = "force-dynamic";

const PRODUCT_SELECT = {
  id: true,
  title: true,
  description: true,
  price: true,
  originalPrice: true,
  brand: true,
  purchaseYear: true,
  condition: true,
  listingType: true,
  images: true,
  pickupLocation: true,
  status: true,
  isUrgent: true,
  inventory: true,
  views: true,
  wishlistCount: true,
  isExchangeAllowed: true,
  exchangeCategories: true,
  exchangeCashAllowed: true,
  sellerId: true,
  categoryId: true,
  subcategoryId: true,
  campusId: true,
  createdAt: true,
  updatedAt: true,
  seller: {
    select: {
      id: true,
      name: true,
      image: true,
      isVerified: true,
      verificationLevel: true,
      isTrustedSeller: true,
      trustScore: true,
    },
  },
  category: {
    select: { id: true, name: true, slug: true },
  },
  subcategory: {
    select: { id: true, name: true, slug: true },
  },
  campus: {
    select: { id: true, name: true, slug: true },
  },
} as const;

function numberParam(value: string | null) {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function positiveInt(value: unknown, fallback: number, max: number) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 1) return fallback;
  return Math.min(Math.floor(parsed), max);
}

function stringValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function GET(req: NextRequest) {
  const limited = await enforceRateLimit(req, {
    namespace: "search",
    limit: 50,
    windowSeconds: 60,
  });
  if (limited) return limited;

  const { searchParams } = new URL(req.url);
  const page = positiveInt(searchParams.get("page"), 1, 10_000);
  const pageSize = positiveInt(searchParams.get("pageSize") || searchParams.get("limit"), 24, 50);
  const search = (searchParams.get("search") || searchParams.get("q") || "").trim();
  const category = (searchParams.get("category") || "").trim();
  const listingType = (searchParams.get("listingType") || "").trim();
  const condition = (searchParams.get("condition") || "").trim();
  const minPrice = numberParam(searchParams.get("minPrice"));
  const maxPrice = numberParam(searchParams.get("maxPrice"));
  const sort = (searchParams.get("sort") || "newest").trim();

  const cacheKey = `products:${searchParams.toString() || "default"}`;

  const payload = await getCached(cacheKey, 30, async () => {
    const andFilters: any[] = [];

    if (search) {
      andFilters.push({
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
          { brand: { contains: search, mode: "insensitive" } },
          { category: { name: { contains: search, mode: "insensitive" } } },
        ],
      });
    }

    if (category) {
      andFilters.push({
        OR: [
          { categoryId: category },
          { category: { slug: category } },
        ],
      });
    }

    if (listingType) andFilters.push({ listingType });
    if (condition) andFilters.push({ condition });

    const priceFilter: Record<string, number> = {};
    if (minPrice !== undefined) priceFilter.gte = minPrice;
    if (maxPrice !== undefined) priceFilter.lte = maxPrice;
    if (Object.keys(priceFilter).length > 0) andFilters.push({ price: priceFilter });

    const where = {
      status: "LIVE",
      inventory: { gt: 0 },
      ...(andFilters.length > 0 ? { AND: andFilters } : {}),
    } as any;

    const orderBy =
      sort === "price_asc"
        ? [{ price: "asc" as const }]
        : sort === "price_desc"
          ? [{ price: "desc" as const }]
          : sort === "popular" || sort === "trending"
            ? [{ views: "desc" as const }, { createdAt: "desc" as const }]
            : [{ createdAt: "desc" as const }];

    const [data, total] = await Promise.all([
      withRetry(() => prisma.product.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: PRODUCT_SELECT,
      })),
      withRetry(() => prisma.product.count({ where })),
    ]);

    return {
      data,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  });

  return NextResponse.json({ success: true, ...payload });
}

export async function POST(req: NextRequest) {
  const limited = await enforceRateLimit(req, {
    namespace: "products:write",
    limit: 20,
    windowSeconds: 60,
  });
  if (limited) return limited;

  try {
    const currentUser = await requireUser();
    const body = await req.json();
    const sellerId = stringValue(body.sellerId) || currentUser.uid;

    if (sellerId !== currentUser.uid) {
      return NextResponse.json({ success: false, error: "Seller must match authenticated user" }, { status: 403 });
    }

    const title = stringValue(body.title);
    const description = stringValue(body.description);
    const categoryId = stringValue(body.categoryId);
    const campusId = stringValue(body.campusId);
    const pickupLocation = stringValue(body.pickupLocation || body.location);
    const price = Number(body.price);
    const inventory = positiveInt(body.inventory, 1, 10_000);

    if (!title || !description || !categoryId || !campusId || !pickupLocation) {
      return NextResponse.json({ success: false, error: "Missing required product fields" }, { status: 400 });
    }

    if (!Number.isFinite(price) || price <= 0) {
      return NextResponse.json({ success: false, error: "Price must be greater than zero" }, { status: 400 });
    }

    if (!Array.isArray(body.images) || body.images.length === 0 || body.images.some((image: unknown) => typeof image !== "string")) {
      return NextResponse.json({ success: false, error: "At least one product image is required" }, { status: 400 });
    }

    const duplicate = await prisma.product.findFirst({
      where: {
        sellerId,
        title: { equals: title, mode: "insensitive" },
        price,
        status: { in: ["LIVE", "PENDING"] },
      },
      select: { id: true },
    });

    if (duplicate) {
      return NextResponse.json({ success: false, error: "A similar active listing already exists" }, { status: 409 });
    }

    const product = await withRetry(() => prisma.product.create({
      data: {
        title,
        description,
        price,
        originalPrice: body.originalPrice ? Number(body.originalPrice) : undefined,
        brand: stringValue(body.brand) || undefined,
        purchaseYear: body.purchaseYear ? Number(body.purchaseYear) : undefined,
        condition: (stringValue(body.condition) || "GOOD") as any,
        conditionDetails: body.conditionDetails,
        listingType: (stringValue(body.listingType) || "SELL") as any,
        images: body.images,
        pickupLocation,
        inventory,
        isNegotiable: Boolean(body.isNegotiable),
        isUrgent: Boolean(body.isUrgent),
        isExchangeAllowed: Boolean(body.isExchangeAllowed),
        exchangeCategories: Array.isArray(body.exchangeCategories) ? body.exchangeCategories.filter((item: unknown) => typeof item === "string") : [],
        exchangeCashAllowed: Boolean(body.exchangeCashAllowed),
        sellerId,
        categoryId,
        subcategoryId: stringValue(body.subcategoryId) || undefined,
        campusId,
        customSubcategory: stringValue(body.customSubcategory) || undefined,
        status: "LIVE",
      },
      select: PRODUCT_SELECT,
    }));

    invalidateCachePrefix("products:");
    invalidateCachePrefix("home:");

    return NextResponse.json({ success: true, data: product }, { status: 201 });
  } catch (error: any) {
    const status = error.message === "Unauthorized" ? 401 : 500;
    console.error("[api/products] Create failed", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to create product" }, { status });
  }
}
