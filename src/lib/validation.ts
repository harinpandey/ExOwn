import "server-only";

/**
 * Sanitizes input strings to prevent XSS (Script/HTML injection)
 */
export function sanitizeString(val: string | null | undefined): string {
  if (!val) return "";
  return val
    .replace(/<[^>]*>/g, "") // Strip HTML tags
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;")
    .trim();
}

/**
 * Validate phone number (optional leading '+', followed by 10 to 14 digits)
 */
export function validatePhone(phone: string | null | undefined): boolean {
  if (!phone) return false;
  const cleaned = phone.replace(/\s+/g, "");
  return /^\+?[0-9]{10,14}$/.test(cleaned);
}

/**
 * Validate email address
 */
export function validateEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email) && email.length <= 150;
}

/**
 * Validate length constraint
 */
export function validateLength(str: string | null | undefined, min: number, max: number): boolean {
  if (!str) return min === 0;
  return str.length >= min && str.length <= max;
}

/**
 * Validate numeric range
 */
export function validateRange(num: number | null | undefined, min: number, max: number): boolean {
  if (num === null || num === undefined || isNaN(num)) return false;
  return num >= min && num <= max;
}
