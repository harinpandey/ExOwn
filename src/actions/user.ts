"use server";

import prisma, { withRetry } from "@/lib/prisma";
import { logActivity } from "@/lib/logger";
import { getCurrentUser, requireSameFirebaseUser, requireSameUser } from "@/lib/auth";
import { sanitizeString, validateLength, validatePhone } from "@/lib/validation";

function isConfiguredAdminEmail(email?: string | null) {
  if (!email) return false;
  const configured = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);

  return configured.includes(email.toLowerCase());
}

export async function syncUser(data: {
  id: string;
  email: string | null;
  name: string | null;
  image: string | null;
}) {
  try {
    console.log(`[syncUser] Called for UID: ${data.id}, Email: ${data.email}`);
    const currentUser = await requireSameFirebaseUser(data.id);
    console.log(`[syncUser] Auth verified for UID: ${currentUser.uid}`);

    const email = currentUser.email || data.email;
    const name = sanitizeString(currentUser.name || data.name || "");
    const image = currentUser.picture || data.image;
    const isAdmin = isConfiguredAdminEmail(email);
    console.log(`[syncUser] Attempting user sync. isAdmin: ${isAdmin}`);

    // Check if user already exists by ID or by email
    let existingUser = await prisma.user.findUnique({
      where: { id: data.id },
      select: { id: true, role: true, isVerified: true, isProfileCompleted: true, verificationLevel: true, isTrustedSeller: true },
    });

    if (!existingUser && email && currentUser.emailVerified !== false) {
      existingUser = await prisma.user.findUnique({
        where: { email },
        select: { id: true, role: true, isVerified: true, isProfileCompleted: true, verificationLevel: true, isTrustedSeller: true },
      });
      if (existingUser) {
        console.log(`[syncUser] Found existing DB user ${existingUser.id} by email ${email}`);
      }
    }

    let user: any;
    if (existingUser) {
      user = await withRetry(() => prisma.user.update({
        where: { id: existingUser.id },
        data: {
          ...(email && { email }),
          ...(name && { name }),
          ...(image && { image }),
          ...(isAdmin && { role: "ADMIN" as const }),
          lastActive: new Date(),
        },
        select: {
          id: true,
          role: true,
          isVerified: true,
          isProfileCompleted: true,
          verificationLevel: true,
          isTrustedSeller: true,
        },
      }));
      try {
        user = await withRetry(() => prisma.user.create({
          data: {
            id: data.id,
            email,
            name: name || null,
            image,
            role: isAdmin ? "ADMIN" : "USER",
            lastActive: new Date(),
            verificationLevel: "BASIC",
          },
          select: {
            id: true,
            role: true,
            isVerified: true,
            isProfileCompleted: true,
            verificationLevel: true,
            isTrustedSeller: true,
          },
        }));
      } catch (createError: any) {
        if (createError.code === "P2002" && email) {
          user = await prisma.user.findUnique({
            where: { email },
            select: {
              id: true,
              role: true,
              isVerified: true,
              isProfileCompleted: true,
              verificationLevel: true,
              isTrustedSeller: true,
            },
          });
        }
        if (!user) {
          throw createError;
        }
      }
    }

    console.log(`[syncUser] User sync successful for DB ID: ${user.id}, Role: ${user.role}`);

    await logActivity({
      userId: user.id,
      actionType: "LOGIN",
      metadata: { method: "Firebase Auth", firebaseUid: currentUser.uid }
    });

    return { success: true, user };
  } catch (error: any) {
    console.error("[syncUser] Error:", error);
    return { success: false, error: error.message };
  }
}

export async function getUserProfile(userId: string, _requesterId?: string) {
  try {
    const currentUser = await getCurrentUser();
    const isOwner = currentUser?.uid === userId;
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: isOwner, // Only owner sees email
        phone: isOwner,
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
    await requireSameUser(userId);

    const name = sanitizeString(data.name);
    const phone = data.phone.trim();
    const registrationNumber = data.registrationNumber ? sanitizeString(data.registrationNumber) : "";
    const studentPhoto = data.studentPhoto?.trim() || "";
    const course = sanitizeString(data.course);
    const batch = sanitizeString(data.batch);
    const collegeName = sanitizeString(data.collegeName);
    const hostel = data.hostel ? sanitizeString(data.hostel) : undefined;
    const address = data.address ? sanitizeString(data.address) : undefined;

    if (!validateLength(name, 2, 80)) {
      return { success: false, error: "Name must be between 2 and 80 characters." };
    }
    if (!validatePhone(phone)) {
      return { success: false, error: "Invalid phone number format." };
    }
    if (registrationNumber && !validateLength(registrationNumber, 3, 80)) {
      return { success: false, error: "Registration number must be between 3 and 80 characters." };
    }
    if (studentPhoto && !studentPhoto.startsWith("https://")) {
      return { success: false, error: "Student photo must be a secure uploaded image URL." };
    }
    if (!validateLength(course, 2, 100)) {
      return { success: false, error: "Course must be between 2 and 100 characters." };
    }
    if (!validateLength(batch, 2, 20)) {
      return { success: false, error: "Batch must be between 2 and 20 characters." };
    }
    if (!validateLength(collegeName, 2, 150)) {
      return { success: false, error: "College name must be between 2 and 150 characters." };
    }

    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { verificationLevel: true },
    });

    // Update user with private data
    await withRetry(() => prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: {
          name,
          phone,
          registrationNumber: registrationNumber || null,
          studentPhoto: studentPhoto || null,
          address,
          isProfileCompleted: true,
          verificationLevel: existingUser?.verificationLevel || "BASIC",
        }
      });

      // NOTE: VerificationRequest table is not yet migrated to the production database.
      // Formal document/ID verification queue is deferred until a dedicated admin
      // review workflow and database migration are introduced. Student registration
      // details are safely stored on the User model above.

      await tx.profile.upsert({
        where: { userId },
        update: {
          course,
          batch,
          hostel,
          collegeName,
        },
        create: {
          userId,
          course,
          batch,
          hostel,
          collegeName,
        }
      });
    }));

    await logActivity({
      userId,
      actionType: "PROFILE_UPDATED",
      metadata: {
        verificationLevel: existingUser?.verificationLevel || "BASIC",
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

export async function saveFcmToken(userId: string, token: string) {
  try {
    await requireSameUser(userId);

    const cleanToken = token.trim();
    if (cleanToken.length < 20 || cleanToken.length > 4096) {
      return { success: false, error: "Invalid notification token" };
    }

    await withRetry(() => prisma.userDevice.upsert({
      where: { token: cleanToken },
      update: {
        userId,
        platform: "web",
        lastSeenAt: new Date(),
      },
      create: {
        userId,
        token: cleanToken,
        platform: "web",
        lastSeenAt: new Date(),
      },
    }));
    
    return { success: true };
  } catch (error: any) {
    console.error("Error saving FCM token:", error);
    return { success: false, error: error.message || "Failed to save notification token" };
  }
}
