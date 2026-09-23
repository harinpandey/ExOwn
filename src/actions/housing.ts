"use server";

import prisma, { withRetry } from "@/lib/prisma";

export interface HousingFilterParams {
  campus?: string;
  type?: string;
  minRent?: number;
  maxRent?: number;
  gender?: string;
  amenities?: string[];
}

export const DEMO_HOUSING_LISTINGS = [
  {
    id: "housing-demo-1",
    title: "Luxury Single PG near LPU Gate 1",
    description: "Fully furnished AC room with 3-time meals, high-speed WiFi, power backup, and daily housekeeping. Walking distance from main entrance.",
    type: "PG",
    status: "LIVE",
    monthlyRent: 9500,
    securityDeposit: 5000,
    utilitiesIncluded: true,
    availableFrom: new Date(),
    address: "Law Gate Rd, Green Valley, LPU Campus Area",
    locality: "Law Gate",
    roomCount: 1,
    bathroomCount: 1,
    maxOccupants: 1,
    currentOccupants: 0,
    amenities: ["WiFi", "Food Included", "AC", "Power Backup", "Laundry", "CCTV Security"],
    rules: ["No loud noise post 10 PM", "Visitors allowed till 8 PM"],
    preferredGender: "MALE",
    images: ["/exown-logo.png"],
    isVerifiedByAdmin: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    campus: { name: "LPU Campus", slug: "lpu" },
    owner: { name: "Rajesh Sharma (Property Owner)", trustScore: 92, isVerified: true, phone: "+91 98765 43210" },
    distance: "0.4 km from campus",
  },
  {
    id: "housing-demo-2",
    title: "Spacious 2BHK Flat for Students & Seniors",
    description: "Modular kitchen, attached balcony, RO water purifier, geyser in both bathrooms, fridge, and wooden beds with mattresses included.",
    type: "FLAT",
    status: "LIVE",
    monthlyRent: 16000,
    securityDeposit: 10000,
    utilitiesIncluded: false,
    availableFrom: new Date(),
    address: "Block B, Student Heights, DU North Campus",
    locality: "North Campus",
    roomCount: 2,
    bathroomCount: 2,
    maxOccupants: 4,
    currentOccupants: 2,
    amenities: ["WiFi", "Kitchen Access", "Geyser", "Fridge", "Balcony", "Parking"],
    rules: ["Non-smoker preferred", "Maintain cleanliness"],
    preferredGender: "ANY",
    images: ["/exown-icon.png"],
    isVerifiedByAdmin: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
    campus: { name: "Delhi University", slug: "du" },
    owner: { name: "Anita Verma", trustScore: 88, isVerified: true, phone: "+91 98123 45678" },
    distance: "0.8 km from campus",
  },
  {
    id: "housing-demo-3",
    title: "Private Hostel Room (Girls Only) with Study Desk",
    description: "Secure gated girls hostel with biometric entry, 24/7 warden support, healthy home-cooked mess food, and quiet study room environment.",
    type: "HOSTEL_TRANSFER",
    status: "LIVE",
    monthlyRent: 8000,
    securityDeposit: 3000,
    utilitiesIncluded: true,
    availableFrom: new Date(),
    address: "Sector 14, Near CU Main Gate, Chandigarh",
    locality: "Sector 14",
    roomCount: 1,
    bathroomCount: 1,
    maxOccupants: 1,
    currentOccupants: 0,
    amenities: ["WiFi", "Food Included", "Study Desk", "Geyser", "CCTV Security", "Warden"],
    rules: ["Curfew at 9 PM", "ID verification required"],
    preferredGender: "FEMALE",
    images: ["/exown-logo.png"],
    isVerifiedByAdmin: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1),
    campus: { name: "Chandigarh University", slug: "cu" },
    owner: { name: "Sunita Devi (Hostel Warden)", trustScore: 96, isVerified: true, phone: "+91 97654 32109" },
    distance: "0.2 km from campus",
  },
  {
    id: "housing-demo-4",
    title: "Shared Double Occupancy Room in Modern PG",
    description: "Fully air-conditioned room with twin beds, personal cupboards, high-speed fiber internet, and mess dining area.",
    type: "SHARED_ROOM",
    status: "LIVE",
    monthlyRent: 6500,
    securityDeposit: 3000,
    utilitiesIncluded: true,
    availableFrom: new Date(),
    address: "Katpadi Road, Near VIT Main Gate, Vellore",
    locality: "Katpadi",
    roomCount: 1,
    bathroomCount: 1,
    maxOccupants: 2,
    currentOccupants: 1,
    amenities: ["WiFi", "Food Included", "AC", "Power Backup", "Housekeeping"],
    rules: ["No alcohol", "Keep study hours quiet"],
    preferredGender: "MALE",
    images: ["/exown-icon.png"],
    isVerifiedByAdmin: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
    campus: { name: "VIT Vellore", slug: "vit" },
    owner: { name: "K. Murugan", trustScore: 90, isVerified: true, phone: "+91 94432 10987" },
    distance: "0.5 km from campus",
  },
];

export async function getHousingListings(params: HousingFilterParams = {}) {
  try {
    if (!process.env.DATABASE_URL) {
      return filterDemoHousing(params);
    }

    const where: any = {
      status: { in: ["LIVE", "PENDING"] },
    };

    if (params.type && params.type !== "ALL") {
      where.type = params.type;
    }

    if (params.minRent !== undefined || params.maxRent !== undefined) {
      where.monthlyRent = {};
      if (params.minRent !== undefined) where.monthlyRent.gte = params.minRent;
      if (params.maxRent !== undefined) where.monthlyRent.lte = params.maxRent;
    }

    if (params.gender && params.gender !== "ANY") {
      where.preferredGender = params.gender;
    }

    const dbListings = await withRetry(() =>
      prisma.housingListing.findMany({
        where,
        orderBy: { createdAt: "desc" },
        include: {
          campus: { select: { name: true, slug: true } },
          owner: { select: { name: true, trustScore: true, isVerified: true, phone: true } },
        },
      })
    );

    if (dbListings && dbListings.length > 0) {
      return dbListings.map((h) => ({
        ...h,
        distance: "Campus proximity verified",
      }));
    }

    return filterDemoHousing(params);
  } catch (error) {
    console.error("Error fetching housing listings:", error);
    return filterDemoHousing(params);
  }
}

function filterDemoHousing(params: HousingFilterParams) {
  return DEMO_HOUSING_LISTINGS.filter((item) => {
    if (params.type && params.type !== "ALL" && item.type !== params.type) return false;
    if (params.minRent && item.monthlyRent < params.minRent) return false;
    if (params.maxRent && item.monthlyRent > params.maxRent) return false;
    if (params.gender && params.gender !== "ANY" && item.preferredGender !== params.gender && item.preferredGender !== "ANY") return false;
    return true;
  });
}
