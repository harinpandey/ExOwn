"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateProfile(userId: string, data: {
  name?: string;
  image?: string;
  phone?: string;
  course?: string;
  year?: string;
  hostel?: string;
}) {
  try {
    // 1. Update User table (name, image)
    if (data.name || data.image) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          ...(data.name && { name: data.name }),
          ...(data.image && { image: data.image }),
        }
      });
    }

    // 2. Update Profile table
    await prisma.profile.upsert({
      where: { userId },
      update: {
        ...(data.phone && { phone: data.phone }),
        ...(data.course && { course: data.course }),
        ...(data.year && { batch: data.year }),
        ...(data.hostel && { hostel: data.hostel }),
      },
      create: {
        userId,
        phone: data.phone,
        course: data.course,
        batch: data.year,
        hostel: data.hostel,
      }
    });

    revalidatePath("/profile");
    revalidatePath("/settings");
    
    return { success: true };
  } catch (error: any) {
    console.error("Profile Update Error:", error);
    return { success: false, error: error.message || "Failed to update profile" };
  }
}
