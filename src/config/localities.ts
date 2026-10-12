export interface CampusLocality {
  name: string;
  description?: string;
}

export interface CampusHousingConfig {
  campusSlug: string;
  campusName: string;
  localities: CampusLocality[];
}

export const CAMPUS_LOCALITIES: Record<string, CampusHousingConfig> = {
  // Lovely Professional University (LPU)
  lpu: {
    campusSlug: "lpu",
    campusName: "Lovely Professional University",
    localities: [
      { name: "Law Gate", description: "Student residential area near Law Gate" },
      { name: "Simar Enclave", description: "Residential enclave near Law Gate" },
      { name: "Green Valley", description: "Residential area near campus entrance" },
      { name: "University View Estate", description: "Housing area near campus" },
      { name: "Jazzy Colony", description: "Student residential area" },
      { name: "Maheru", description: "Locality adjoining campus perimeter" },
      { name: "Phagwara", description: "Nearby town residential area" },
      { name: "Deepnagar", description: "Residential area along highway approach" },
    ],
  },
  // Delhi University (DU)
  du: {
    campusSlug: "du",
    campusName: "Delhi University",
    localities: [
      { name: "North Campus", description: "University enclave residential area" },
      { name: "Kamla Nagar", description: "Student residential and commercial area" },
      { name: "Hudson Lane", description: "Student residential area" },
      { name: "Vijay Nagar", description: "Student residential area" },
      { name: "Satya Niketan", description: "South campus student residential area" },
    ],
  },
  // Chandigarh University (CU)
  cu: {
    campusSlug: "cu",
    campusName: "Chandigarh University",
    localities: [
      { name: "Gharuan", description: "Residential area adjoining campus" },
      { name: "Sector 14", description: "Student residential area" },
      { name: "Kharar", description: "Nearby residential town" },
      { name: "Landran", description: "Nearby residential area" },
    ],
  },
  // VIT Vellore (VIT)
  vit: {
    campusSlug: "vit",
    campusName: "VIT Vellore",
    localities: [
      { name: "Katpadi", description: "Residential area near campus" },
      { name: "Sathuvachari", description: "Town residential area" },
      { name: "Bramhapuram", description: "Residential area near campus" },
      { name: "Gandhi Nagar", description: "Town residential area" },
    ],
  },
};

/**
 * Returns student localities for a given campus slug or name match.
 * Returns null or an empty config if the campus does not have curated localities.
 * Never silently substitutes another campus's localities.
 */
export function getLocalitiesForCampus(campusIdentifier?: string | null): CampusHousingConfig | null {
  if (!campusIdentifier) {
    return null;
  }

  const id = campusIdentifier.toLowerCase().trim();

  // Direct key match
  if (CAMPUS_LOCALITIES[id]) {
    return CAMPUS_LOCALITIES[id];
  }

  // Name / slug matching
  if (id.includes("lovely") || id === "lpu") {
    return CAMPUS_LOCALITIES.lpu;
  }
  if (id.includes("delhi") || id === "du") {
    return CAMPUS_LOCALITIES.du;
  }
  if (id.includes("chandigarh") || id === "cu") {
    return CAMPUS_LOCALITIES.cu;
  }
  if (id.includes("vellore") || id === "vit") {
    return CAMPUS_LOCALITIES.vit;
  }

  // No match: return null so the UI can show a clean coming-soon / search-based state
  return null;
}
