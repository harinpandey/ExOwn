import { EXOWN_AI_PROMPT } from "@/lib/exown-ai-prompt";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { enforceRateLimit } from "@/lib/rate-limit";
import {
  getCanonicalFallback,
  validateSmartBuyResponse,
} from "@/types/smart-buy";

export const dynamic = "force-dynamic";

interface GeminiRequestResult {
  ok: boolean;
  status: number;
  data?: any;
  errorText?: string;
}

async function executeGeminiRequest(
  model: string,
  apiKey: string,
  prompt: string,
  signal: AbortSignal
): Promise<GeminiRequestResult> {
  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

  const response = await fetch(geminiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        thinkingConfig: {
          thinkingLevel: "low",
        },
        maxOutputTokens: 1024,
        responseMimeType: "application/json",
      },
    }),
    signal,
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    return { ok: false, status: response.status, errorText };
  }

  const data = await response.json();
  return { ok: true, status: response.status, data };
}

function logGeminiError(model: string, status: number, errorText?: string) {
  if (status === 401 || status === 403) {
    console.error(`AI Error: Gemini authentication failure on model '${model}' (HTTP ${status}). Check GEMINI_API_KEY validity.`);
  } else if (status === 404) {
    console.error(`AI Error: Gemini model '${model}' not found or unavailable (HTTP 404). Check GEMINI_MODEL setting.`);
  } else if (status === 429) {
    console.warn(`AI Warning: Gemini upstream rate limit exceeded on model '${model}' (HTTP 429).`);
  } else if (status === 503) {
    console.warn(`AI Warning: Gemini model '${model}' temporarily unavailable / high demand (HTTP 503).`);
  } else if (status >= 500) {
    console.error(`AI Error: Gemini upstream server error on model '${model}' (HTTP ${status}).`);
  } else {
    console.error(`AI Error: Gemini request rejected on model '${model}' (HTTP ${status}). Response:`, errorText);
  }
}

export async function POST(req: Request) {
  const limited = await enforceRateLimit(req, {
    namespace: "ai",
    limit: 30,
    windowSeconds: 60,
  });
  if (limited) return limited;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s overall timeout

  try {
    const { productData } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("AI Warning: GEMINI_API_KEY is not configured.");
      return NextResponse.json(getCanonicalFallback("AI service key unconfigured"));
    }

    const primaryModel = process.env.GEMINI_MODEL || "gemini-3.8-flash";
    const fallbackModel = process.env.GEMINI_FALLBACK_MODEL || "gemini-3.6-flash";

    // Fetch Admin Rules from DB with safety fallback
    let adminRules: Array<{ name: string; rule: unknown }> = [];
    try {
      adminRules = await prisma.aiRule.findMany({
        where: { isActive: true },
        select: { name: true, rule: true },
        take: 10,
      });
    } catch (dbError) {
      console.error("AI Error: DB rules fetch failed", dbError);
    }

    const prompt = `
${EXOWN_AI_PROMPT}

ADMIN DEFINED RULES (PRIORITIZE THESE):
${JSON.stringify(adminRules, null, 2)}

PRODUCT DATA TO EVALUATE:
${JSON.stringify(productData, null, 2)}

CRITICAL: Respond ONLY with a valid JSON object matching the strict contract.
`;

    // 1. Primary Model Attempt
    let result = await executeGeminiRequest(primaryModel, apiKey, prompt, controller.signal);

    // 2. Capacity/Rate-limit fallback check (HTTP 503 or 429)
    if (!result.ok && (result.status === 503 || result.status === 429)) {
      logGeminiError(primaryModel, result.status, result.errorText);
      console.warn(
        `AI Notice: Primary model '${primaryModel}' returned HTTP ${result.status}. Attempting single fallback to '${fallbackModel}'...`
      );

      const fallbackResult = await executeGeminiRequest(fallbackModel, apiKey, prompt, controller.signal);

      if (fallbackResult.ok) {
        console.log(`AI Success: Primary model '${primaryModel}' was unavailable, but fallback to '${fallbackModel}' succeeded.`);
        result = fallbackResult;
      } else {
        logGeminiError(fallbackModel, fallbackResult.status, fallbackResult.errorText);
        console.error(
          `AI Error: Both primary '${primaryModel}' (HTTP ${result.status}) and fallback '${fallbackModel}' (HTTP ${fallbackResult.status}) failed.`
        );
        clearTimeout(timeoutId);
        return NextResponse.json(getCanonicalFallback("Upstream service error"));
      }
    } else if (!result.ok) {
      logGeminiError(primaryModel, result.status, result.errorText);
      clearTimeout(timeoutId);
      return NextResponse.json(getCanonicalFallback("Upstream service error"));
    }

    clearTimeout(timeoutId);

    const rawText = result.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) {
      console.error("AI Error: Missing response candidate text from Gemini", result.data);
      return NextResponse.json(getCanonicalFallback("Empty AI response"));
    }

    try {
      const parsed = JSON.parse(rawText);
      const validated = validateSmartBuyResponse(parsed);
      return NextResponse.json(validated);
    } catch (jsonErr) {
      console.error("AI Error: Failed to parse Gemini JSON:", jsonErr, rawText);
      return NextResponse.json(getCanonicalFallback("Malformed AI format"));
    }
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === "AbortError") {
      console.error("AI Error: Request timed out after 20s");
      return NextResponse.json(getCanonicalFallback("Analysis timed out"));
    }
    console.error("AI Error: Global analysis failure", error);
    return NextResponse.json(getCanonicalFallback("Service temporarily unavailable"));
  }
}
