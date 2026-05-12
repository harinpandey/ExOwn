import { EXOWN_AI_PROMPT } from "@/lib/exown-ai-prompt";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { enforceRateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

export async function POST(req: Request) {
  const limited = await enforceRateLimit(req, {
    namespace: "ai",
    limit: 30,
    windowSeconds: 60,
  });
  if (limited) return limited;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

  try {
    const { productData } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      console.warn("AI Warning: GEMINI_API_KEY is missing.");
      return NextResponse.json(getFallbackResponse("AI key missing"));
    }

    // Fetch Admin Rules from DB with timeout
    let adminRules: Array<{ name: string; rule: unknown }> = [];
    try {
      adminRules = await prisma.aiRule.findMany({
        where: { isActive: true },
        select: { name: true, rule: true },
        take: 10
      });
    } catch (dbError) {
      console.error("AI Error: DB rules fetch failed", dbError);
    }

    const prompt = `
      ${EXOWN_AI_PROMPT}
      
      ADMIN DEFINED RULES (PRIORITIZE THESE):
      ${JSON.stringify(adminRules, null, 2)}
      
      PRODUCT DATA:
      ${JSON.stringify(productData, null, 2)}
      
      CRITICAL: Respond ONLY with a valid JSON object. 
      Ensure "pros" and "cons" are ALWAYS arrays of strings, even if empty.
    `;

    const response = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: { 
          temperature: 0.2, 
          maxOutputTokens: 1024,
          responseMimeType: "application/json" 
        }
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Error: Gemini API rejected request", response.status, errorText);
      return NextResponse.json(getFallbackResponse("Service error"));
    }

    const data = await response.json();
    
    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      console.error("AI Error: Missing response parts", data);
      return NextResponse.json(getFallbackResponse("Invalid AI format"));
    }

    try {
      const aiResult = JSON.parse(data.candidates[0].content.parts[0].text);
      return NextResponse.json(aiResult);
    } catch {
      console.error("AI Error: JSON Parse Failed", data.candidates[0].content.parts[0].text);
      return NextResponse.json(getFallbackResponse("Parse failure"));
    }
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      console.error("AI Error: Request timed out after 10s");
      return NextResponse.json(getFallbackResponse("Timeout"));
    }
    console.error("AI Error: Global analysis failure", error);
    return NextResponse.json(getFallbackResponse("Generic failure"));
  }
}

function getFallbackResponse(reason: string) {
  return { 
    summary: "AI Analysis Temporarily Unavailable",
    pros: [],
    cons: [],
    verdict: `We're experiencing high traffic or a temporary issue (${reason}). Please check manually for now.`,
    score: 0
  };
}
