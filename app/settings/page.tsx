"use client";

import { MODEL_REGISTRY } from "@/lib/cost-calculator";

const PROVIDERS = [
  { key: "GROQ_API_KEY", name: "Groq", url: "https://console.groq.com", free: true, color: "#10b981", desc: "Free tier — Llama 70B, Llama 8B" },
  { key: "OLLAMA_BASE_URL", name: "Ollama", url: "https://ollama.com", free: true, color: "#64748b", desc: "Free local — any model, runs on your machine" },
  { key: "OPENAI_API_KEY", name: "OpenAI", url: "https://platform.openai.com/api-keys", free: false, color: "#3b82f6", desc: "GPT-4o, GPT-4o Mini" },
  { key: "ANTHROPIC_API_KEY", name: "Anthropic", url: "https://console.anthropic.com", free: false, color: "#f97316", desc: "Claude Sonnet 4, Claude Haiku 3.5" },
  { key: "GOOGLE_AI_API_KEY", name: "Google", url: "https://aistudio.google.com/apikey", free: false, color: "#ef4444", desc: "Gemini 2.5 Flash, Gemini 2.0 Flash" },
  { key: "MISTRAL_API_KEY", name: "Mistral", url: "https://console.mistral.ai", free: false, color: "#8b5cf6", desc: "Mistral Large, Mistral Small" },
];

export default function SettingsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Settings</h1>
      <p className="text-[hsl(var(--muted-foreground))] mb-8">
        Configure your API keys. AI Arena stores keys locally in your <code className="text-purple-400">.env</code> file — nothing is sent to our servers.
      </p>

      {/* Provider cards */}
      <div className="space-y-4 mb-10">
        {PROVIDERS.map((p) => (
          <div key={p.key} className="glass p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }} />
                <span className="font-semibold">{p.name}</span>
                {p.free && (
                  <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">FREE</span>
                )}
              </div>
              <a
                href={p.url}
                target="_blank"
                rel="noopener"
                className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
              >
                Get API key →
              </a>
            </div>
            <p className="text-sm text-[hsl(var(--muted-foreground))] mb-3">{p.desc}</p>
            <div className="flex items-center gap-2">
              <code className="text-xs text-[hsl(var(--muted-foreground))]">{p.key}=</code>
              <div className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm font-mono text-[hsl(var(--muted-foreground))]">
                {p.key === "OLLAMA_BASE_URL" ? "http://localhost:11434" : "••••••••"}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* How to configure */}
      <div className="glass p-6">
        <h2 className="font-semibold text-lg mb-4">How to Add API Keys</h2>
        <div className="space-y-3 text-sm text-[hsl(var(--muted-foreground))]">
          <div className="flex gap-3">
            <span className="font-bold text-purple-400">1.</span>
            <span>Open the <code className="text-purple-400">.env</code> file in your project root</span>
          </div>
          <div className="flex gap-3">
            <span className="font-bold text-purple-400">2.</span>
            <span>Paste your API key next to the provider variable (e.g., <code className="text-purple-400">GROQ_API_KEY=gsk_abc123...</code>)</span>
          </div>
          <div className="flex gap-3">
            <span className="font-bold text-purple-400">3.</span>
            <span>Restart the dev server (<code className="text-purple-400">npm run dev</code>)</span>
          </div>
          <div className="flex gap-3">
            <span className="font-bold text-purple-400">4.</span>
            <span>The provider's models will automatically appear in the Playground model selector</span>
          </div>
        </div>
        <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-sm text-green-400">
          <strong>Start free:</strong> Get a Groq API key (free, no credit card) + install Ollama. You can compare models without spending a cent.
        </div>
      </div>

      {/* Model pricing reference */}
      <div className="glass p-6 mt-6">
        <h2 className="font-semibold text-lg mb-4">Model Pricing Reference</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[hsl(var(--muted-foreground))]">
                <th className="pb-2">Model</th>
                <th className="pb-2">Provider</th>
                <th className="pb-2">Input / 1M tokens</th>
                <th className="pb-2">Output / 1M tokens</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {MODEL_REGISTRY.map((m) => (
                <tr key={m.id}>
                  <td className="py-2 font-medium flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: m.color }} />
                    {m.name}
                  </td>
                  <td className="py-2 text-[hsl(var(--muted-foreground))]">{m.provider}</td>
                  <td className="py-2">{m.isFree ? <span className="text-green-400">FREE</span> : `$${m.inputCostPer1M}`}</td>
                  <td className="py-2">{m.isFree ? <span className="text-green-400">FREE</span> : `$${m.outputCostPer1M}`}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
