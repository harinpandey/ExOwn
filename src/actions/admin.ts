"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getAiRules() {
  try {
    return await prisma.aiRule.findMany({
      orderBy: { createdAt: "desc" }
    });
  } catch (error) {
    console.error("Error fetching rules:", error);
    return [];
  }
}

export async function createAiRule(data: { name: string; rule: any }) {
  try {
    await prisma.aiRule.create({
      data: {
        name: data.name,
        rule: data.rule,
      }
    });
    revalidatePath("/admin/ai-rules");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function toggleAiRule(id: string, isActive: boolean) {
  try {
    await prisma.aiRule.update({
      where: { id },
      data: { isActive }
    });
    revalidatePath("/admin/ai-rules");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteAiRule(id: string) {
  try {
    await prisma.aiRule.delete({
      where: { id }
    });
    revalidatePath("/admin/ai-rules");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
