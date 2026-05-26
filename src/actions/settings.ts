"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireSameUser } from "@/lib/auth";
import { sanitizeString, validatePhone, validateLength } from "@/lib/validation";

export async function updateProfile(userId: string, data: {
  name?: string;
  image?: string;
  phone?: string;
  course?: string;
  year?: string;
  hostel?: string;
}) {
  try {
    await requireSameUser(userId);

    // 1. Sanitize & Validate Inputs
    const name = data.name ? sanitizeString(data.name) : undefined;
    const phone = data.phone ? data.phone.trim() : undefined;
    const course = data.course ? sanitizeString(data.course) : undefined;
    const year = data.year ? sanitizeString(data.year) : undefined;
    const hostel = data.hostel ? sanitizeString(data.hostel) : undefined;

    if (name && !validateLength(name, 2, 80)) {
      return { success: false, error: "Name must be between 2 and 80 characters." };
    }
    if (phone && !validatePhone(phone)) {
      return { success: false, error: "Invalid phone number format." };
    }
    if (course && !validateLength(course, 2, 100)) {
      return { success: false, error: "Course must be between 2 and 100 characters." };
    }
    if (year && !/^\d{4}$/.test(year)) {
      return { success: false, error: "Batch Year must be a 4-digit number." };
    }
    if (hostel && !validateLength(hostel, 2, 50)) {
      return { success: false, error: "Hostel details must be between 2 and 50 characters." };
    }

    // 2. Update User table
    if (name || data.image || phone) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          ...(name && { name }),
          ...(data.image && { image: data.image }),
          ...(phone && { phone }),
        }
      });
    }

    // 3. Update Profile table
    await prisma.profile.upsert({
      where: { userId },
      update: {
        ...(course && { course }),
        ...(year && { batch: year }),
        ...(hostel && { hostel }),
      },
      create: {
        userId,
        course: course || "",
        batch: year || "",
        hostel: hostel || "",
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
