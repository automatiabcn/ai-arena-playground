import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  // Cap both inputs so a crafted request can't pull the whole table or feed a
  // pathologically long search string into the query.
  const search = (searchParams.get("search") || "").slice(0, 500);
  const parsed = parseInt(searchParams.get("limit") || "50", 10);
  const limit = Number.isFinite(parsed) ? Math.min(Math.max(parsed, 1), 200) : 50;

  const comparisons = await prisma.comparison.findMany({
    where: search ? { prompt: { contains: search } } : {},
    include: { responses: { orderBy: { latencyMs: "asc" } } },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return NextResponse.json(comparisons);
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (id) {
    await prisma.comparison.delete({ where: { id } });
    return NextResponse.json({ success: true });
  }

  // Wiping the entire history is destructive, so require it to be explicit
  // (?all=true). A bare DELETE with no id used to silently delete everything.
  if (searchParams.get("all") === "true") {
    const { count } = await prisma.comparison.deleteMany();
    return NextResponse.json({ success: true, deleted: count });
  }

  return NextResponse.json(
    { error: "Provide ?id=<comparison> to delete one, or ?all=true to clear all history." },
    { status: 400 }
  );
}
