import { EXOWN_AI_PROMPT } from "@/lib/exown-ai-prompt";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

export async function POST(req: Request) {
  try {
    const { productData } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "AI service not configured" }, { status: 500 });
    }

    // Fetch Admin Rules from DB
    let adminRules = [];
    try {
      adminRules = await prisma.aiRule.findMany({
        where: { isActive: true },
        select: { name: true, rule: true }
      });
    } catch (dbError) {
      console.error("DB Error fetching rules:", dbError);
      // Continue without rules if DB fails
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
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API Error:", response.status, errorText);
      return NextResponse.json({ error: "AI Service Error" }, { status: response.status });
    }

    const data = await response.json();
    
    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      console.error("AI Error: Missing content parts", data);
      throw new Error("Invalid AI response");
    }

    try {
      const aiResult = JSON.parse(data.candidates[0].content.parts[0].text);
      return NextResponse.json(aiResult);
    } catch (parseError) {
      console.error("AI Error: JSON Parse Failed", data.candidates[0].content.parts[0].text);
      throw parseError;
    }
  } catch (error: any) {
    console.error("AI Analysis Global Error:", error);
    return NextResponse.json({ error: "Failed to analyze product", details: error.message }, { status: 500 });
  }
}
