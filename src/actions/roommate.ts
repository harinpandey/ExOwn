"use server";

import prisma, { withRetry } from "@/lib/prisma";
import { requireSameUser } from "@/lib/auth";
import { createNotification } from "./notification";

export interface RoommateFilterParams {
  campus?: string;
  maxBudget?: number;
  gender?: string;
  roomType?: string;
}

export const DEMO_ROOMMATE_PROFILES = [
  {
    id: "roommate-demo-1",
    bio: "Final year B.Tech CSE student looking for a clean, quiet roommate to share a 2BHK flat near Law Gate. Non-smoker, loves coding & gaming weekends.",
    budgetMin: 5000,
    budgetMax: 9000,
    preferredGender: "MALE",
    roomType: "PRIVATE",
    moveInFrom: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
    leaseMonths: 6,
    lifestyle: { sleepHours: "11 PM - 7 AM", diet: "Veg", cleanliness: "High" },
    interests: ["Coding", "Gaming", "Gym", "Tech"],
    visibility: "CAMPUS",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
    campus: { name: "LPU Campus", slug: "lpu" },
    user: {
      id: "u-demo-1",
      name: "Aman Verma (CSE '25)",
      image: "/exown-logo.png",
      trustScore: 94,
      isVerified: true,
    },
    matchReasons: ["Same Campus", "Budget Overlap", "Move-in Period Match"],
  },
  {
    id: "roommate-demo-2",
    bio: "2nd year Economics student at DU seeking a female roommate for a spacious PG/flat in North Campus. Friendly, tidy, and loves study sessions.",
    budgetMin: 7000,
    budgetMax: 12000,
    preferredGender: "FEMALE",
    roomType: "SHARED",
    moveInFrom: new Date(Date.now() + 1000 * 60 * 60 * 24 * 10),
    leaseMonths: 12,
    lifestyle: { sleepHours: "12 AM - 8 AM", diet: "Non-Veg", cleanliness: "Very High" },
    interests: ["Reading", "Coffee", "Economics", "Music"],
    visibility: "CAMPUS",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
    campus: { name: "Delhi University", slug: "du" },
    user: {
      id: "u-demo-2",
      name: "Sneha Kapoor (Econ '26)",
      image: "/exown-icon.png",
      trustScore: 96,
      isVerified: true,
    },
    matchReasons: ["Same Campus", "Female Roommate Preference", "Shared Room Fit"],
  },
  {
    id: "roommate-demo-3",
    bio: "Mechanical Engg senior at CU looking for a flatmate to take over a master bedroom in a fully furnished 3BHK flat near Sector 14.",
    budgetMin: 6000,
    budgetMax: 8500,
    preferredGender: "MALE",
    roomType: "PRIVATE",
    moveInFrom: new Date(Date.now() + 1000 * 60 * 60 * 24 * 4),
    leaseMonths: 6,
    lifestyle: { sleepHours: "11 PM - 6 AM", diet: "Any", cleanliness: "Moderate" },
    interests: ["Robotics", "Football", "Movies"],
    visibility: "CAMPUS",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    campus: { name: "Chandigarh University", slug: "cu" },
    user: {
      id: "u-demo-3",
      name: "Karan Singh (Mech '25)",
      image: "/exown-logo.png",
      trustScore: 90,
      isVerified: true,
    },
    matchReasons: ["Same Campus", "Private Room Fit", "Immediate Move-in"],
  },
];

export async function getRoommateProfiles(params: RoommateFilterParams = {}) {
  try {
    if (!process.env.DATABASE_URL) {
      return filterDemoRoommates(params);
    }

    const where: any = {
      status: "LIVE",
    };

    if (params.gender && params.gender !== "ANY") {
      where.preferredGender = params.gender;
    }

    if (params.maxBudget) {
      where.budgetMax = { lte: params.maxBudget };
    }

    const dbProfiles = await withRetry(() =>
      prisma.roommateProfile.findMany({
        where,
        orderBy: { updatedAt: "desc" },
        include: {
          campus: { select: { name: true, slug: true } },
          user: { select: { id: true, name: true, image: true, trustScore: true, isVerified: true } },
        },
      })
    );

    if (dbProfiles && dbProfiles.length > 0) {
      return dbProfiles.map((p) => ({
        ...p,
        matchReasons: ["Verified Campus Peer", "Budget Compatibility"],
      }));
    }

    return filterDemoRoommates(params);
  } catch (error) {
    console.error("Error fetching roommate profiles:", error);
    return filterDemoRoommates(params);
  }
}

function filterDemoRoommates(params: RoommateFilterParams) {
  return DEMO_ROOMMATE_PROFILES.filter((item) => {
    if (params.gender && params.gender !== "ANY" && item.preferredGender !== params.gender) return false;
    if (params.maxBudget && item.budgetMax > params.maxBudget) return false;
    return true;
  });
}

export async function sendRoommateInterest(data: { receiverId: string; senderId: string; message?: string }) {
  try {
    await requireSameUser(data.senderId);

    await createNotification({
      userId: data.receiverId,
      type: "ROOMMATE_MATCH",
      title: "🤝 Roommate Interest Received!",
      content: `A student from your campus sent you a roommate request. Check details now.`,
      link: "/roommates",
    });

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
