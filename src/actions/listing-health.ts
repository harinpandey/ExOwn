"use server";

export async function calculateListingHealth(product: any) {
  let score = 0;
  const suggestions: string[] = [];

  // 1. Photos (0-30 points)
  const photoCount = product.images?.length || 0;
  if (photoCount === 0) suggestions.push("Add at least one photo");
  else if (photoCount < 3) {
    score += 15;
    suggestions.push("Add more photos (at least 3) for better conversion");
  } else {
    score += 30;
  }

  // 2. Description (0-30 points)
  const descLength = product.description?.length || 0;
  if (descLength < 50) {
    score += 10;
    suggestions.push("Write a longer description (at least 50 chars)");
  } else if (descLength < 200) {
    score += 20;
    suggestions.push("Add more details to your description");
  } else {
    score += 30;
  }

  // 3. Pricing (0-20 points)
  if (product.price > 0) {
    score += 20;
  } else {
    suggestions.push("Set a valid price");
  }

  // 4. Listing Type & Details (0-20 points)
  if (product.condition) score += 10;
  if (product.pickupLocation) score += 10;
  else suggestions.push("Add a pickup location");

  return {
    score,
    status: score > 80 ? "EXCELLENT" : score > 50 ? "GOOD" : "POOR",
    suggestions
  };
}
