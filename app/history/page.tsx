"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Response {
  id: string;
  provider: string;
  model: string;
  content: string;
  latencyMs: number;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
  error?: string;
}

interface Comparison {
  id: string;
  prompt: string;
  createdAt: string;
  responses: Response[];
}

export default function HistoryPage() {
  const router = useRouter();
  const [comparisons, setComparisons] = useState<Comparison[]>([]);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const handleRerun = (prompt: string) => {
    router.push(`/playground?prompt=${encodeURIComponent(prompt)}`);
  };

  useEffect(() => {
    fetch(`/api/history?search=${encodeURIComponent(search)}&limit=50`)
      .then((r) => r.json())
      .then(setComparisons)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [search]);

  const handleDelete = async (id?: string) => {
    const url = id ? `/api/history?id=${id}` : "/api/history?all=true";
    await fetch(url, { method: "DELETE" });
    setComparisons((prev) => (id ? prev.filter((c) => c.id !== id) : []));
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Comparison History</h1>
          <p className="text-[hsl(var(--muted-foreground))] text-sm mt-1">{comparisons.length} comparisons saved</p>
        </div>
        {comparisons.length > 0 && (
          <button onClick={() => handleDelete()} className="text-sm text-red-400 hover:text-red-300 transition-colors">
            Clear all
          </button>
        )}
      </div>

      {/* Search */}
      <input
        className="w-full mb-6 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500/50"
        placeholder="Search comparisons..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {loading ? (
        <div className="text-center py-16 text-[hsl(var(--muted-foreground))]">Loading...</div>
      ) : comparisons.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-[hsl(var(--muted-foreground))]">No comparisons yet.</p>
          <a href="/playground" className="text-purple-400 text-sm hover:text-purple-300 mt-2 inline-block">Go to Playground →</a>
        </div>
      ) : (
        <div className="space-y-4">
          {comparisons.map((comp) => (
            <div key={comp.id} className="glass glass-hover overflow-hidden">
              <div
                className="p-5 cursor-pointer"
                onClick={() => setExpanded(expanded === comp.id ? null : comp.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{comp.prompt}</p>
                    <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
                      {new Date(comp.createdAt).toLocaleString()} — {comp.responses.length} model{comp.responses.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {comp.responses.map((r) => (
                      <span key={r.id} className="text-xs glass px-2 py-0.5 rounded-full">{r.model.split("-")[0]}</span>
                    ))}
                  </div>
                </div>
              </div>

              {expanded === comp.id && (
                <div className="border-t border-white/5 p-5 animate-fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {comp.responses.map((r) => (
                      <div key={r.id} className="bg-white/5 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-sm">{r.model}</span>
                          <div className="flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))]">
                            <span>{(r.latencyMs / 1000).toFixed(1)}s</span>
                            <span>{r.inputTokens + r.outputTokens} tok</span>
                            <span className={r.costUsd === 0 ? "text-green-400" : ""}>{r.costUsd === 0 ? "FREE" : `$${r.costUsd.toFixed(4)}`}</span>
                          </div>
                        </div>
                        <div className="text-sm whitespace-pre-wrap font-mono max-h-48 overflow-y-auto">
                          {r.error ? <span className="text-red-400">{r.error}</span> : r.content}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-end gap-3 mt-3">
                    <button onClick={() => handleRerun(comp.prompt)} className="text-xs text-purple-400/60 hover:text-purple-400 transition-colors">
                      Re-run →
                    </button>
                    <button onClick={() => handleDelete(comp.id)} className="text-xs text-red-400/60 hover:text-red-400 transition-colors">
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
