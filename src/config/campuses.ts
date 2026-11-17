export interface CampusDirectoryEntry {
  id: string;
  name: string;
  shortName: string;
  country: string;
  countrySlug: string;
  state: string;
  stateSlug: string;
  city: string;
  citySlug: string;
}

/** Canonical campus directory shared by the homepage and sell flow. */
export const CAMPUS_DIRECTORY: CampusDirectoryEntry[] = [
  { id: "lpu", name: "Lovely Professional University", shortName: "LPU Campus", country: "India", countrySlug: "india", state: "Punjab", stateSlug: "punjab", city: "Jalandhar", citySlug: "jalandhar" },
  { id: "du", name: "Delhi University", shortName: "Delhi University", country: "India", countrySlug: "india", state: "Delhi", stateSlug: "delhi", city: "Delhi", citySlug: "delhi" },
  { id: "cu", name: "Chandigarh University", shortName: "Chandigarh University", country: "India", countrySlug: "india", state: "Punjab", stateSlug: "punjab", city: "Mohali", citySlug: "mohali" },
  { id: "vit", name: "VIT Vellore", shortName: "VIT Vellore", country: "India", countrySlug: "india", state: "Tamil Nadu", stateSlug: "tamil-nadu", city: "Vellore", citySlug: "vellore" },
];
