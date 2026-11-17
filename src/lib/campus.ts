import "server-only";

import prisma, { withRetry } from "@/lib/prisma";
import { CAMPUS_DIRECTORY } from "@/config/campuses";

/**
 * Resolve the client-side campus label to the canonical database Campus.id.
 * Unknown or missing campuses return null; callers must not fall back to an
 * unscoped query because that could mix students from different universities.
 */
export async function resolveCampusId(campus?: string | null): Promise<string | null> {
  const value = campus?.trim();
  if (!value) return null;

  const normalized = value.toLocaleLowerCase();
  const directoryEntry = CAMPUS_DIRECTORY.find((entry) =>
    [entry.id, entry.name, entry.shortName].some(
      (candidate) => candidate.toLocaleLowerCase() === normalized
    )
  );

  if (!directoryEntry) return null;

  try {
    const record = await withRetry(() =>
      prisma.campus.findFirst({
        where: {
          OR: [
            { slug: { equals: directoryEntry.id, mode: "insensitive" } },
            { name: { equals: directoryEntry.name, mode: "insensitive" } },
          ],
        },
        select: { id: true },
      })
    );

    return record?.id ?? null;
  } catch (error) {
    console.error("[campus] Failed to resolve campus:", error);
    return null;
  }
}
