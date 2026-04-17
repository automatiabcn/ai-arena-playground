import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const limit = parseInt(searchParams.get("limit") || "50");

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
  } else {
    await prisma.comparison.deleteMany();
  }

  return NextResponse.json({ success: true });
}
