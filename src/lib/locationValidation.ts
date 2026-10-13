// Utility to validate public pickup location strings.
// Returns true if the location appears to be a public campus landmark
// and does NOT contain private address patterns such as room numbers,
// flat/apartment identifiers, or plain phone numbers.

export function isPublicPickupLocation(value: string): boolean {
  const trimmed = value.trim().toLowerCase();
  if (!trimmed) return false;

  // Reject common private patterns.
  const privatePatterns = [
    /\broom\s*#?\s*\d+/i,
    /\bflat\s*#?\s*\d+/i,
    /\bapartment\s*#?\s*\d+/i,
    /\bapt\s*#?\s*\d+/i,
    /\b\d{5,}\b/, // phone numbers or long digit strings
    /\b\d{1,3}\s*(street|st|road|rd|lane|ln)\b/i,
  ];
  for (const pattern of privatePatterns) {
    if (pattern.test(trimmed)) return false;
  }

  // Accept typical campus landmark patterns.
  const publicPatterns = [
    /bh-?\d+/i,
    /gate\s*\d+/i,
    /block\s*[a-z]/i,
    /hostel\s*\d+/i,
    /\b(law|simar|green|university|jazz|mah[\w]*|phagwara|deepnagar|north|south|kamla|hudson|vijay|satya)\b/i,
  ];
  return publicPatterns.some((p) => p.test(trimmed));
}
