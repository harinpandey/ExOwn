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

export async function requestCampusAddition(data: {
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
