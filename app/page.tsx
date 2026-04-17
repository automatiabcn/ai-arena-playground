"use client";

import Link from "next/link";
import { MODEL_REGISTRY } from "@/lib/cost-calculator";

const FEATURES = [
  { title: "Side-by-Side Streaming", desc: "Compare 2-4 models simultaneously with real-time SSE streaming. See responses arrive token by token.", icon: "⚡" },
  { title: "11 Models, 6 Providers", desc: "GPT-4o, Claude Sonnet, Gemini, Mistral, Groq (free!), Ollama (free local). All in one UI.", icon: "🧠" },
  { title: "Cost & Latency Tracking", desc: "See exact cost per response, latency in ms, and token count. Make data-driven model choices.", icon: "📊" },
  { title: "30+ Prompt Templates", desc: "Pre-built templates for coding, writing, analysis, creative, and education tasks. One click to compare.", icon: "📋" },
  { title: "Comparison History", desc: "Every comparison saved with full responses. Search, re-run, and export past results.", icon: "📚" },
  { title: "Model Leaderboard", desc: "Auto-generated rankings based on YOUR usage data. Fastest, cheapest, most used — by category.", icon: "🏆" },
];

const FREE_MODELS = MODEL_REGISTRY.filter((m) => m.isFree);
const PAID_MODELS = MODEL_REGISTRY.filter((m) => !m.isFree);

export default function LandingPage() {
  return (
    <div className="relative overflow-hidden">
      {/* Background gradient — vivid */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-24 left-1/4 w-[500px] h-[500px] bg-purple-500/30 rounded-full blur-[120px] animate-pulse-slow" />
        <div className="absolute top-1/3 right-1/5 w-[400px] h-[400px] bg-blue-500/25 rounded-full blur-[100px] animate-pulse-slow" style={{ animationDelay: "1s" }} />
        <div className="absolute -bottom-20 left-1/2 w-[500px] h-[500px] bg-cyan-500/20 rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: "2s" }} />
        <div className="absolute top-1/2 left-0 w-[300px] h-[300px] bg-pink-500/15 rounded-full blur-[80px]" />
      </div>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 glass px-4 py-1.5 rounded-full text-sm text-purple-300 mb-8">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          Free & Open Source — MIT License
        </div>
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6">
          <span className="gradient-text">Compare AI Models</span>
          <br />
          Side by Side
        </h1>
        <p className="text-xl text-[hsl(var(--muted-foreground))] max-w-2xl mx-auto mb-10">
          Which model is best for YOUR task? Find out in seconds.
          Paste a prompt, pick 2-4 models, watch them stream simultaneously.
          Track cost, latency, and quality — all for free.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/playground"
            className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold text-lg hover:opacity-90 transition-opacity shadow-lg shadow-purple-500/25"
          >
            Start Comparing
          </Link>
          <Link
            href="/templates"
            className="px-8 py-3.5 rounded-xl glass glass-hover font-medium text-lg"
          >
            Browse Templates
          </Link>
        </div>

        {/* Free badge */}
        <div className="mt-8 flex items-center justify-center gap-2 text-sm text-green-400">
          <span>✓ Groq (free API)</span>
          <span className="text-white/20">•</span>
          <span>✓ Ollama (free local)</span>
          <span className="text-white/20">•</span>
          <span>✓ No credit card needed</span>
        </div>
      </section>

      {/* Features grid */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Everything you need to choose the right model</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f) => (
            <div key={f.title} className="feature-card">
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
              <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Supported models */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-4">Supported Models</h2>
        <p className="text-center text-[hsl(var(--muted-foreground))] mb-10">
          Start free with Groq + Ollama. Add paid providers as you need them.
        </p>

        <div className="mb-8">
          <h3 className="text-lg font-semibold text-green-400 mb-4">Free (No API Cost)</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {FREE_MODELS.map((m) => (
              <div key={m.id} className="glass glass-hover p-4 flex items-center gap-3 border-green-500/20">
                <div className="w-3 h-3 rounded-full ring-2 ring-green-400/30" style={{ backgroundColor: m.color }} />
                <div>
                  <div className="font-medium text-sm">{m.name}</div>
                  <div className="text-xs text-green-400 font-medium">$0 — unlimited</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-blue-400 mb-4">Paid (Your API Keys)</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PAID_MODELS.map((m) => (
              <div key={m.id} className="glass glass-hover p-4 flex items-center gap-3">
                <div className="w-3 h-3 rounded-full ring-2 ring-white/10" style={{ backgroundColor: m.color }} />
                <div>
                  <div className="font-medium text-sm">{m.name}</div>
                  <div className="text-xs text-[hsl(var(--muted-foreground))]">
                    ${m.inputCostPer1M} / ${m.outputCostPer1M} per 1M tokens
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick start */}
      <section className="max-w-3xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-8">Get Running in 2 Minutes</h2>
        <div className="glass p-6 font-mono text-sm">
          <div className="text-[hsl(var(--muted-foreground))] mb-2"># Clone & setup</div>
          <div className="text-green-400">npm install && npm run setup</div>
          <div className="mt-4 text-[hsl(var(--muted-foreground))] mb-2"># Add one free API key (Groq — get at console.groq.com)</div>
          <div className="text-green-400"># Edit .env → paste GROQ_API_KEY</div>
          <div className="mt-4 text-[hsl(var(--muted-foreground))] mb-2"># Start</div>
          <div className="text-green-400">npm run dev</div>
          <div className="mt-4 text-[hsl(var(--muted-foreground))]"># Open http://localhost:3000 → start comparing!</div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="glass p-12 gradient-border">
          <h2 className="text-3xl font-bold mb-4">Ready to find your best model?</h2>
          <p className="text-[hsl(var(--muted-foreground))] mb-8">
            No account needed. No credit card. Just paste a prompt and compare.
          </p>
          <Link
            href="/playground"
            className="inline-block px-10 py-4 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold text-lg hover:opacity-90 transition-opacity shadow-lg shadow-purple-500/25"
          >
            Open Playground
          </Link>
        </div>
      </section>
    </div>
  );
}
