"use server";

import prisma, { withRetry } from "@/lib/prisma";
import { logActivity } from "@/lib/logger";

export async function syncUser(data: {
  id: string;
  email: string | null;
  name: string | null;
  image: string | null;
}) {
  try {
    const user = await withRetry(() => prisma.user.upsert({
      where: { id: data.id },
      update: {
        ...(data.email && { email: data.email }),
        ...(data.name && { name: data.name }),
        ...(data.image && { image: data.image }),
        lastActive: new Date(),
      },
      create: {
        id: data.id,
        email: data.email,
        name: data.name,
        image: data.image,
        lastActive: new Date(),
        verificationLevel: "BASIC", // Explicit default
      },
      select: {
        id: true,
        isVerified: true,
        isProfileCompleted: true,
        verificationLevel: true,
        isTrustedSeller: true,
      }
    }));

    await logActivity({
      userId: data.id,
      actionType: "LOGIN",
      metadata: { method: "Firebase Auth" }
    });

    return { success: true, user };
  } catch (error: any) {
    console.error("Error syncing user:", error);
    return { success: false, error: error.message };
  }
}

export async function getUserProfile(userId: string, requesterId?: string) {
  try {
    const isOwner = userId === requesterId;
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: isOwner, // Only owner sees email
        image: true,
        isVerified: true,
        isProfileCompleted: true,
        verificationLevel: true,
        isTrustedSeller: true,
        registrationNumber: isOwner, 
        studentPhoto: isOwner,      
        address: isOwner,           
        trustScore: true,
        createdAt: true,
        profile: {
          select: {
            collegeName: true,
            course: true,
            year: true,
            batch: true,
            hostel: true,
            businessType: true,
            bio: true,
            rating: true,
            successfulDeals: true,
            avgResponseTime: true,
          }
        }
      }
    });

    return user;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
}

export async function completeProfile(userId: string, data: {
  name: string;
  phone: string;
  registrationNumber: string;
  studentPhoto: string;
  course: string;
  batch: string;
  collegeName: string;
  hostel?: string;
  address?: string;
}) {
  try {
    // Update user with private data
    await withRetry(() => prisma.user.update({
      where: { id: userId },
      data: {
        name: data.name,
        phone: data.phone,
        registrationNumber: data.registrationNumber || null,
        studentPhoto: data.studentPhoto || null,
        address: data.address,
        isProfileCompleted: true,
        // If they provided student info, they might be CAMPUS level
        verificationLevel: data.registrationNumber ? "CAMPUS" : "VERIFIED", 
      }
    }));

    await logActivity({
      userId,
      actionType: "PROFILE_UPDATED",
      metadata: { verificationLevel: data.registrationNumber ? "CAMPUS" : "VERIFIED" }
    });

    // Update profile with public-ish data
    await prisma.profile.upsert({
      where: { userId },
      update: {
        course: data.course,
        batch: data.batch,
        hostel: data.hostel,
        collegeName: data.collegeName,
      },
      create: {
        userId,
        course: data.course,
        batch: data.batch,
        hostel: data.hostel,
        collegeName: data.collegeName,
      }
    });

    return { success: true };
  } catch (error: any) {
    console.error("Error completing profile:", error);
    if (error.code === 'P2002') {
      return { success: false, error: "Registration number already in use." };
    }
    return { success: false, error: error.message };
  }
}

export async function getPublicProfile(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        image: true,
        createdAt: true,
        isVerified: true,
        isProfileCompleted: true,
        verificationLevel: true,
        isTrustedSeller: true,
        trustScore: true,
        _count: {
          select: { products: true }
        },
        profile: {
          select: {
            collegeName: true,
            course: true,
            year: true,
            rating: true,
            successfulDeals: true,
            successRate: true,
            bio: true,
            avgResponseTime: true,
          }
        }
      }
    });
    
    if (!user) return null;

    // Privacy rule: Only show first name if preferred, or full name if verified
    // For premium marketplace, full name of verified sellers is often preferred for trust
    // but user mentioned "Privacy Rule" so let's stick to select-only non-sensitive fields.

    return {
      ...user,
      listingCount: user._count.products,
    };
  } catch (error) {
    console.error("Error fetching public profile:", error);
    return null;
  }
}
