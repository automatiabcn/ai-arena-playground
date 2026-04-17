"use client";

import { useState, useEffect } from "react";
import { MODEL_REGISTRY } from "@/lib/cost-calculator";

interface ModelStat {
  provider: string;
  model: string;
  totalRuns: number;
  avgLatencyMs: number;
  avgCostUsd: number;
  avgTokens: number;
  winCount: number;
}

export default function LeaderboardPage() {
  const [stats, setStats] = useState<ModelStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/leaderboard")
      .then((r) => r.json())
      .then((data) => setStats(data.stats || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const getColor = (model: string) =>
    MODEL_REGISTRY.find((m) => m.id === model)?.color || "#888";

  const sorted = {
    fastest: [...stats].sort((a, b) => a.avgLatencyMs - b.avgLatencyMs),
    cheapest: [...stats].sort((a, b) => a.avgCostUsd - b.avgCostUsd),
    mostUsed: [...stats].sort((a, b) => b.totalRuns - a.totalRuns),
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold mb-3">Model Leaderboard</h1>
        <p className="text-[hsl(var(--muted-foreground))]">
          Rankings based on YOUR comparison data. The more you compare, the more accurate these become.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-16 text-[hsl(var(--muted-foreground))]">Loading...</div>
      ) : stats.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-[hsl(var(--muted-foreground))]">No data yet. Start comparing models in the Playground!</p>
          <a href="/playground" className="text-purple-400 text-sm hover:text-purple-300 mt-2 inline-block">Go to Playground →</a>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Fastest */}
          <div className="glass p-6">
            <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <span className="text-green-400">⚡</span> Fastest Response
            </h2>
            <div className="space-y-3">
              {sorted.fastest.map((s, i) => (
                <div key={s.model} className="flex items-center gap-3">
                  <span className="text-sm font-bold text-[hsl(var(--muted-foreground))] w-5">{i + 1}</span>
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: getColor(s.model) }} />
                  <span className="text-sm flex-1 truncate">{s.model}</span>
                  <span className="text-sm font-mono">{(s.avgLatencyMs / 1000).toFixed(1)}s</span>
                </div>
              ))}
            </div>
          </div>

          {/* Cheapest */}
          <div className="glass p-6">
            <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <span className="text-blue-400">💰</span> Most Cost-Effective
            </h2>
            <div className="space-y-3">
              {sorted.cheapest.map((s, i) => (
                <div key={s.model} className="flex items-center gap-3">
                  <span className="text-sm font-bold text-[hsl(var(--muted-foreground))] w-5">{i + 1}</span>
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: getColor(s.model) }} />
                  <span className="text-sm flex-1 truncate">{s.model}</span>
                  <span className="text-sm font-mono">{s.avgCostUsd === 0 ? "FREE" : `$${s.avgCostUsd.toFixed(4)}`}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Most Used */}
          <div className="glass p-6">
            <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <span className="text-purple-400">🏆</span> Most Used
            </h2>
            <div className="space-y-3">
              {sorted.mostUsed.map((s, i) => (
                <div key={s.model} className="flex items-center gap-3">
                  <span className="text-sm font-bold text-[hsl(var(--muted-foreground))] w-5">{i + 1}</span>
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: getColor(s.model) }} />
                  <span className="text-sm flex-1 truncate">{s.model}</span>
                  <span className="text-sm font-mono">{s.totalRuns} runs</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
