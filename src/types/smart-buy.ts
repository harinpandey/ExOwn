export type RecommendationType =
  | "Strong Buy"
  | "Fair Deal"
  | "Caution"
  | "Avoid"
  | "Insufficient Data";

export type RiskLevelType = "LOW" | "MEDIUM" | "HIGH" | "UNKNOWN";

export type ConfidenceType = "HIGH" | "MEDIUM" | "LOW";

export interface SmartBuyAnalysis {
  score: number | null;
  recommendation: RecommendationType;
  analysis: string;
  pros: string[];
  cons: string[];
  riskLevel: RiskLevelType;
  confidence: ConfidenceType;
  evidence: string[];
}

export const VALID_RECOMMENDATIONS: readonly RecommendationType[] = [
  "Strong Buy",
  "Fair Deal",
  "Caution",
  "Avoid",
  "Insufficient Data",
] as const;

export const VALID_RISK_LEVELS: readonly RiskLevelType[] = [
  "LOW",
  "MEDIUM",
  "HIGH",
  "UNKNOWN",
] as const;

export const VALID_CONFIDENCES: readonly ConfidenceType[] = [
  "HIGH",
  "MEDIUM",
  "LOW",
] as const;

export function getCanonicalFallback(reason?: string): SmartBuyAnalysis {
  return {
    score: null,
    recommendation: "Insufficient Data",
    analysis: reason
      ? `Analysis unavailable at this time (${reason}). Please inspect listing details directly.`
      : "Not enough listing evidence available to compute an automated recommendation. Please review photos and verify condition in person.",
    pros: [],
    cons: [],
    riskLevel: "UNKNOWN",
    confidence: "LOW",
    evidence: ["Automated evaluation deferred due to insufficient data or service limits."],
  };
}

export function validateSmartBuyResponse(raw: unknown): SmartBuyAnalysis {
  if (!raw || typeof raw !== "object") {
    return getCanonicalFallback("Invalid AI response format");
  }

  const obj = raw as Record<string, unknown>;

  // Score validation: number between 0 and 100 or null
  let score: number | null = null;
  if (typeof obj.score === "number" && !isNaN(obj.score) && obj.score >= 0 && obj.score <= 100) {
    score = Math.round(obj.score);
  }

  // Recommendation validation
  let recommendation: RecommendationType = "Insufficient Data";
  if (typeof obj.recommendation === "string" && VALID_RECOMMENDATIONS.includes(obj.recommendation as RecommendationType)) {
    recommendation = obj.recommendation as RecommendationType;
  } else if (typeof obj.recommendation === "string") {
    const recLower = obj.recommendation.toLowerCase();
    if (recLower.includes("strong") || recLower.includes("great")) recommendation = "Strong Buy";
    else if (recLower.includes("fair") || recLower.includes("good")) recommendation = "Fair Deal";
    else if (recLower.includes("caution") || recLower.includes("slightly") || recLower.includes("overprice")) recommendation = "Caution";
    else if (recLower.includes("avoid")) recommendation = "Avoid";
  }

  // Analysis validation
  let analysis = "";
  if (typeof obj.analysis === "string" && obj.analysis.trim().length > 0) {
    analysis = obj.analysis.trim();
  } else if (typeof obj.verdict === "string" && obj.verdict.trim().length > 0) {
    analysis = obj.verdict.trim();
  } else if (typeof obj.summary === "string" && obj.summary.trim().length > 0) {
    analysis = obj.summary.trim();
  } else {
    analysis = "Automated analysis completed based on available listing parameters.";
  }

  // Pros & Cons validation
  const pros = Array.isArray(obj.pros)
    ? obj.pros.filter((p): p is string => typeof p === "string" && p.trim().length > 0).map((p) => p.trim())
    : [];

  const cons = Array.isArray(obj.cons)
    ? obj.cons.filter((c): c is string => typeof c === "string" && c.trim().length > 0).map((c) => c.trim())
    : [];

  // RiskLevel validation
  let riskLevel: RiskLevelType = "UNKNOWN";
  if (typeof obj.riskLevel === "string" && VALID_RISK_LEVELS.includes(obj.riskLevel as RiskLevelType)) {
    riskLevel = obj.riskLevel as RiskLevelType;
  } else if (typeof obj.riskLevel === "string") {
    const rLower = obj.riskLevel.toLowerCase();
    if (rLower === "low") riskLevel = "LOW";
    else if (rLower === "medium") riskLevel = "MEDIUM";
    else if (rLower === "high") riskLevel = "HIGH";
  }

  // Confidence validation
  let confidence: ConfidenceType = "LOW";
  if (typeof obj.confidence === "string" && VALID_CONFIDENCES.includes(obj.confidence as ConfidenceType)) {
    confidence = obj.confidence as ConfidenceType;
  } else if (typeof obj.confidence === "string") {
    const cLower = obj.confidence.toLowerCase();
    if (cLower === "high") confidence = "HIGH";
    else if (cLower === "medium") confidence = "MEDIUM";
    else confidence = "LOW";
  } else {
    // Infer confidence from available evidence
    confidence = pros.length + cons.length >= 3 ? "MEDIUM" : "LOW";
  }

  // Evidence validation
  const evidence = Array.isArray(obj.evidence)
    ? obj.evidence.filter((e): e is string => typeof e === "string" && e.trim().length > 0).map((e) => e.trim())
    : [];

  // If score is null or recommendation is Insufficient Data, enforce consistent unknown state
  if (recommendation === "Insufficient Data" && score === null) {
    riskLevel = "UNKNOWN";
  }

  return {
    score,
    recommendation,
    analysis,
    pros,
    cons,
    riskLevel,
    confidence,
    evidence,
  };
}
