// Utility to validate public pickup location strings.
// Returns true only for a recognizable public campus landmark and rejects
// private address details such as room numbers, flat numbers, and phone numbers.

export function isPublicPickupLocation(value: string): boolean {
  const trimmed = value.trim().toLowerCase();
  if (!trimmed) return false;

  const privatePatterns = [
    /\broom\s*#?\s*\d+/i,
    /\bflat\s*#?\s*\d+/i,
    /\bapartment\s*#?\s*\d+/i,
    /\bapt\s*#?\s*\d+/i,
    /\b\d{5,}\b/,
    /\b\d{1,3}\s*(street|st|road|rd|lane|ln)\b/i,
  ];
  if (privatePatterns.some((pattern) => pattern.test(trimmed))) return false;

  const publicPatterns = [
    /\bbh-?\d+\s+(entrance|gate|reception|lobby|common\s+area)\b/i,
    /\bhostel\s*\d+\s+(entrance|gate|reception|lobby|common\s+area)\b/i,
    /\bgate\s*\d+\b/i,
    /\bblock\s*[a-z]\s+(entrance|gate|reception|lobby|common\s+area)\b/i,
    /\bsector\s*\d+\b/i,
    /\b(law|simar|green|university|jazz|mah[\w]*|phagwara|deepnagar|north|south|kamla|hudson|vijay|satya|gharuan|kharar|landran|katpadi|sathuvachari|bramhapuram|gandhi|vellore|mohali)\b/i,
  ];

  return publicPatterns.some((pattern) => pattern.test(trimmed));
}
