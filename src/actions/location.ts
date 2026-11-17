"use server";

import prisma from "@/lib/prisma";
import { CAMPUS_DIRECTORY } from "@/config/campuses";

/**
 * Add missing featured campus location rows without deleting or
 * replacing existing records. Repeated calls are safe and idempotent.
 */
async function ensureCampusDirectory() {
  await prisma.$transaction(async (tx) => {
    for (const campus of CAMPUS_DIRECTORY) {
      const country = await tx.country.upsert({
        where: { slug: campus.countrySlug },
        update: { name: campus.country },
        create: { name: campus.country, slug: campus.countrySlug },
      });
      const state = await tx.state.upsert({
        where: { name_countryId: { name: campus.state, countryId: country.id } },
        update: { slug: campus.stateSlug },
        create: { name: campus.state, slug: campus.stateSlug, countryId: country.id },
      });
      const city = await tx.city.upsert({
        where: { name_stateId: { name: campus.city, stateId: state.id } },
        update: { slug: campus.citySlug },
        create: { name: campus.city, slug: campus.citySlug, stateId: state.id },
      });
      await tx.campus.upsert({
        where: { name_cityId: { name: campus.name, cityId: city.id } },
        update: { slug: campus.id },
        create: { name: campus.name, slug: campus.id, cityId: city.id },
      });
    }
  });
}
export async function getCountries() {
  try {
    await ensureCampusDirectory();
    return await prisma.country.findMany({
      orderBy: { name: "asc" }
    });
  } catch (error) {
    console.error("Error fetching countries:", error);
    return [];
  }
}

export async function getStates(countryId: string) {
  try {
    return await prisma.state.findMany({
      where: { countryId },
      orderBy: { name: "asc" }
    });
  } catch (error) {
    console.error("Error fetching states:", error);
    return [];
  }
}

export async function getCities(stateId: string) {
  try {
    return await prisma.city.findMany({
      where: { stateId },
      orderBy: { name: "asc" }
    });
  } catch (error) {
    console.error("Error fetching cities:", error);
    return [];
  }
}

export async function getCampuses(cityId: string) {
  try {
    return await prisma.campus.findMany({
      where: { cityId },
      orderBy: { name: "asc" }
    });
  } catch (error) {
    console.error("Error fetching campuses:", error);
    return [];
  }
}

export async function requestCampusAddition(_data: {
  country: string;
  state: string;
  city: string;
  campusName: string;
  userId: string;
}) {
  try {
    // For now, just log the request or create a specific model if needed
    // In a real app, this would go to a 'CampusRequest' model

    return { success: true };
  } catch (error) {
    console.error("Error requesting campus addition:", error);
    return { success: false };
  }
}

/**
 * Safely resolves a campus identifier (ID, slug, or campus name)
 * to a verified database Campus record.
 * Returns null if not found. Does not hardcode fallbacks.
 */
export async function resolveCampus(identifier?: string | null) {
  if (!identifier || typeof identifier !== "string") return null;
  const trimmed = identifier.trim();
  if (!trimmed) return null;

  try {
    return await prisma.campus.findFirst({
      where: {
        OR: [
          { id: trimmed },
          { slug: { equals: trimmed, mode: "insensitive" } },
          { name: { equals: trimmed, mode: "insensitive" } }
        ]
      },
      select: {
        id: true,
        name: true,
        slug: true
      }
    });
  } catch (error) {
    console.error("[Action:resolveCampus] Error:", error);
    return null;
  }
}
