import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const stats = await prisma.modelStat.findMany({
    orderBy: { totalRuns: "desc" },
  });

  // Compute rankings
  const fastest = [...stats].sort((a, b) => a.avgLatencyMs - b.avgLatencyMs);
  const cheapest = [...stats].sort((a, b) => a.avgCostUsd - b.avgCostUsd);
  const mostUsed = [...stats].sort((a, b) => b.totalRuns - a.totalRuns);

  return NextResponse.json({
    stats,
    rankings: {
      fastest: fastest.slice(0, 5),
      cheapest: cheapest.slice(0, 5),
      mostUsed: mostUsed.slice(0, 5),
    },
  });
}
