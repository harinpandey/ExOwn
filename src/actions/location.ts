"use server";

import prisma from "@/lib/prisma";

export async function getCountries() {
  try {
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
