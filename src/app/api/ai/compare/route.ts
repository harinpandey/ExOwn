import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { productIds } = await req.json();

    if (!productIds || productIds.length < 2) {
      return NextResponse.json({ error: "At least 2 products required for comparison" }, { status: 400 });
    }

    // 1. Fetch detailed data
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      include: {
        seller: {
          include: { profile: true }
        },
        category: true,
        rentalDetail: true,
        serviceDetail: true
      }
    });

    // 2. Prepare AI Prompt
    const productsInfo = products.map(p => ({
      id: p.id,
      title: p.title,
      price: p.price,
      condition: p.condition,
      description: p.description.slice(0, 300),
      sellerTrust: p.seller.trustScore,
      sellerSuccess: p.seller.profile?.successRate || 0,
      responseTime: p.seller.profile?.avgResponseTime || "N/A",
      type: p.listingType
    }));

    const prompt = `
      Compare these marketplace listings for a student platform. 
      Analyze value, quality, and risk.
      
      Listings:
      ${JSON.stringify(productsInfo, null, 2)}
      
      Return ONLY a JSON object in this exact format:
      {
        "winner_id": "product_id",
        "winner_reason": "brief reason",
        "budget_pick_id": "product_id",
        "budget_reason": "brief reason",
        "premium_pick_id": "product_id",
        "premium_reason": "brief reason",
        "risk_alerts": ["list of risks"],
        "summary": "overall advice for student buyer"
      }
    `;

    // 3. Call Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean JSON if needed (Gemini sometimes adds markdown blocks)
    const jsonString = text.replace(/```json|```/g, "").trim();
    const analysis = JSON.parse(jsonString);

    return NextResponse.json(analysis);
  } catch (err: any) {
    console.error("AI Compare Error:", err);
    return NextResponse.json({ error: "AI analysis failed" }, { status: 500 });
  }
}
