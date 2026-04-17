import { NextRequest, NextResponse } from "next/server";
import { getTemplatesByCategory, CATEGORIES } from "@/lib/templates";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category") || "all";

  return NextResponse.json({
    categories: CATEGORIES,
    templates: getTemplatesByCategory(category),
  });
}
