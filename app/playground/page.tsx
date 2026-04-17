"use client";

import { useState, useRef, useCallback, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { MODEL_REGISTRY, type ModelInfo, calculateCost } from "@/lib/cost-calculator";

interface PanelState {
  modelId: string;
  content: string;
  latencyMs: number;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
  error?: string;
  streaming: boolean;
  done: boolean;
}

const DEFAULT_PANEL: PanelState = {
  modelId: "", content: "", latencyMs: 0,
  inputTokens: 0, outputTokens: 0, costUsd: 0,
  streaming: false, done: false,
};

const AVAILABLE_MODELS = MODEL_REGISTRY;

function PlaygroundContent() {
  const searchParams = useSearchParams();
  const [prompt, setPrompt] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [showSystem, setShowSystem] = useState(false);
  const [panelCount, setPanelCount] = useState(2);

  // Read ?prompt= from templates page redirect
  useEffect(() => {
    const p = searchParams.get("prompt");
    if (p) setPrompt(decodeURIComponent(p));
  }, [searchParams]);
  const [panels, setPanels] = useState<PanelState[]>([
    { ...DEFAULT_PANEL, modelId: "llama-3.3-70b-versatile" },
    { ...DEFAULT_PANEL, modelId: "gpt-4o-mini" },
    { ...DEFAULT_PANEL, modelId: "claude-sonnet-4-20250514" },
    { ...DEFAULT_PANEL, modelId: "gemini-2.5-flash" },
  ]);
  const [isComparing, setIsComparing] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const updatePanel = useCallback((idx: number, update: Partial<PanelState>) => {
    setPanels((prev) => prev.map((p, i) => (i === idx ? { ...p, ...update } : p)));
  }, []);

  const handleCompare = async () => {
    if (!prompt.trim() || isComparing) return;

    // Reset panels
    const activePanels = panels.slice(0, panelCount);
    setPanels((prev) =>
      prev.map((p, i) =>
        i < panelCount
          ? { ...p, content: "", latencyMs: 0, inputTokens: 0, outputTokens: 0, costUsd: 0, error: undefined, streaming: true, done: false }
          : p
      )
    );
    setIsComparing(true);

    abortRef.current = new AbortController();

    try {
      const models = activePanels.map((p) => {
        const info = AVAILABLE_MODELS.find((m) => m.id === p.modelId);
        return { provider: info?.provider || "openai", model: p.modelId };
      });

      const res = await fetch("/api/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, systemPrompt: showSystem ? systemPrompt : undefined, models }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      if (reader) {
        while (true) {
          const { done: readerDone, value } = await reader.read();
          if (readerDone) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            try {
              const data = JSON.parse(line.slice(6));
              if (data.type === "chunk") {
                const idx = activePanels.findIndex((p) => p.modelId === data.model);
                if (idx === -1) continue;
                const info = AVAILABLE_MODELS.find((m) => m.id === data.model);
                const cost = info ? calculateCost(info.provider, info.id, data.inputTokens || 0, data.outputTokens || 0) : 0;
                updatePanel(idx, {
                  content: data.content,
                  latencyMs: data.latencyMs,
                  inputTokens: data.inputTokens || 0,
                  outputTokens: data.outputTokens || 0,
                  costUsd: cost,
                  error: data.error,
                  streaming: !data.done,
                  done: data.done,
                });
              }
            } catch {}
          }
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") return;
      console.error("Compare error:", err);
    } finally {
      setIsComparing(false);
      setPanels((prev) => prev.map((p) => ({ ...p, streaming: false })));
    }
  };

  const handleStop = () => {
    abortRef.current?.abort();
    setIsComparing(false);
    setPanels((prev) => prev.map((p) => ({ ...p, streaming: false })));
  };

  const handleClear = () => {
    setPanels((prev) => prev.map((p) => ({
      ...p, content: "", latencyMs: 0, inputTokens: 0, outputTokens: 0,
      costUsd: 0, error: undefined, streaming: false, done: false,
    })));
    setPrompt("");
  };

  const getModelInfo = (modelId: string): ModelInfo | undefined =>
    AVAILABLE_MODELS.find((m) => m.id === modelId);

  // Simple markdown-like rendering for code blocks and bold
  const renderContent = (text: string) => {
    // Split by code blocks
    const parts = text.split(/(```[\s\S]*?```)/g);
    return parts.map((part, i) => {
      if (part.startsWith("```")) {
        const code = part.replace(/```\w*\n?/, "").replace(/\n?```$/, "");
        return (
          <pre key={i} className="bg-black/30 border border-white/10 rounded-lg p-3 my-2 overflow-x-auto text-xs">
            <code>{code}</code>
          </pre>
        );
      }
      // Bold text
      const boldParts = part.split(/(\*\*[^*]+\*\*)/g);
      return (
        <span key={i}>
          {boldParts.map((bp, j) =>
            bp.startsWith("**") && bp.endsWith("**")
              ? <strong key={j} className="text-white font-semibold">{bp.slice(2, -2)}</strong>
              : bp
          )}
        </span>
      );
    });
  };

  const activePanels = panels.slice(0, panelCount);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Prompt input */}
      <div className="p-4 border-b border-white/5">
        <div className="max-w-7xl mx-auto">
          {showSystem && (
            <div className="mb-3">
              <label className="text-xs text-[hsl(var(--muted-foreground))] mb-1 block">System Prompt</label>
              <input
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-purple-500/50"
                placeholder="You are a helpful assistant..."
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
              />
            </div>
          )}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <textarea
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:border-purple-500/50 min-h-[52px] max-h-[200px]"
                placeholder="Enter your prompt... (Cmd+Enter to send)"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleCompare(); }}
                rows={2}
              />
            </div>
            <div className="flex flex-col gap-2">
              {isComparing ? (
                <button onClick={handleStop} className="px-6 py-3 rounded-xl bg-red-500/80 text-white font-medium text-sm hover:bg-red-500 transition-colors">
                  Stop
                </button>
              ) : (
                <button
                  onClick={handleCompare}
                  disabled={!prompt.trim()}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 text-white font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Compare
                </button>
              )}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowSystem(!showSystem)}
                  className={`text-xs px-2 py-1 rounded-lg transition-colors ${showSystem ? "bg-purple-500/20 text-purple-300" : "text-[hsl(var(--muted-foreground))] hover:text-white"}`}
                >
                  System
                </button>
                <button
                  onClick={handleClear}
                  className="text-xs px-2 py-1 rounded-lg text-[hsl(var(--muted-foreground))] hover:text-white transition-colors"
                  title="Clear all responses"
                >
                  Clear
                </button>
                <select
                  value={panelCount}
                  onChange={(e) => setPanelCount(parseInt(e.target.value))}
                  className="text-xs bg-white/5 border border-white/10 rounded-lg px-2 py-1 focus:outline-none"
                >
                  <option value={2}>2 models</option>
                  <option value={3}>3 models</option>
                  <option value={4}>4 models</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Split panels */}
      <div className={`flex-1 grid gap-3 p-4 overflow-hidden ${
        panelCount === 2 ? "grid-cols-1 md:grid-cols-2" :
        panelCount === 3 ? "grid-cols-1 md:grid-cols-3" :
        "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
      }`}>
        {activePanels.map((panel, idx) => {
          const info = getModelInfo(panel.modelId);
          return (
            <div key={idx} className="response-panel animate-fade-in">
              {/* Panel header */}
              <div className="flex items-center justify-between mb-3">
                <select
                  value={panel.modelId}
                  onChange={(e) => updatePanel(idx, { modelId: e.target.value })}
                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm font-medium focus:outline-none focus:border-purple-500/50 max-w-[200px]"
                  disabled={isComparing}
                >
                  {AVAILABLE_MODELS.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} {m.isFree ? "(Free)" : ""}
                    </option>
                  ))}
                </select>
                {info && (
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: info.color }} title={info.provider} />
                )}
              </div>

              {/* Response content */}
              <div className={`response-content ${panel.streaming ? "streaming-cursor" : ""}`}>
                {panel.error ? (
                  <div className="text-red-400 text-sm">{panel.error}</div>
                ) : panel.content ? (
                  <>{renderContent(panel.content)}</>
                ) : panel.streaming ? (
                  <div className="space-y-3 animate-fade-in">
                    <div className="skeleton h-4 w-3/4" />
                    <div className="skeleton h-4 w-full" />
                    <div className="skeleton h-4 w-5/6" />
                    <div className="skeleton h-4 w-2/3" />
                    <div className="skeleton h-4 w-4/5" />
                    <p className="text-xs text-purple-400/60 mt-4 animate-pulse">Streaming from {getModelInfo(panel.modelId)?.name || panel.modelId}...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center py-8 opacity-40">
                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-3 text-xl">
                      {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : "🏅"}
                    </div>
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">Select a model and enter a prompt</p>
                  </div>
                )}
              </div>

              {/* Stats bar */}
              {(panel.content || panel.error || panel.done) && (
                <div className="flex items-center gap-3 mt-3 pt-3 border-t border-white/5 text-xs text-[hsl(var(--muted-foreground))]">
                  <span className="flex items-center gap-1" title="Latency">
                    <span className={`w-1.5 h-1.5 rounded-full ${panel.latencyMs < 2000 ? "bg-green-400" : panel.latencyMs < 5000 ? "bg-yellow-400" : "bg-red-400"}`} />
                    {(panel.latencyMs / 1000).toFixed(1)}s
                  </span>
                  <span title="Tokens">
                    {panel.inputTokens + panel.outputTokens} tok
                  </span>
                  <span title="Cost" className={panel.costUsd === 0 ? "text-green-400" : ""}>
                    {panel.costUsd === 0 ? "FREE" : `$${panel.costUsd.toFixed(4)}`}
                  </span>
                  {panel.done && (
                    <button
                      onClick={() => navigator.clipboard.writeText(panel.content)}
                      className="ml-auto hover:text-white transition-colors"
                      title="Copy response"
                    >
                      Copy
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function PlaygroundPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-[calc(100vh-4rem)]"><div className="text-[hsl(var(--muted-foreground))]">Loading playground...</div></div>}>
      <PlaygroundContent />
    </Suspense>
  );
}
