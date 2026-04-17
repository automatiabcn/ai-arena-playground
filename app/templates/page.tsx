"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PROMPT_TEMPLATES, CATEGORIES } from "@/lib/templates";

export default function TemplatesPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const router = useRouter();

  const filtered = activeCategory === "all"
    ? PROMPT_TEMPLATES
    : PROMPT_TEMPLATES.filter((t) => t.category === activeCategory);

  const handleUseTemplate = (prompt: string) => {
    const encoded = encodeURIComponent(prompt);
    router.push(`/playground?prompt=${encoded}`);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold mb-3">Prompt Templates</h1>
        <p className="text-[hsl(var(--muted-foreground))]">
          {PROMPT_TEMPLATES.length} ready-to-use prompts. Click any template to compare models.
        </p>
      </div>

      {/* Category tabs */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeCategory === cat.id
                ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                : "glass glass-hover"
            }`}
          >
            {cat.name} ({cat.count})
          </button>
        ))}
      </div>

      {/* Templates grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((t) => (
          <div key={t.id} className="glass glass-hover p-5 flex flex-col group cursor-pointer" onClick={() => handleUseTemplate(t.prompt)}>
            <div className="flex items-center justify-between mb-3">
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                t.category === "code" ? "cat-code" :
                t.category === "writing" ? "cat-writing" :
                t.category === "analysis" ? "cat-analysis" :
                t.category === "creative" ? "cat-creative" :
                "cat-education"
              }`}>
                {t.category}
              </span>
            </div>
            <h3 className="font-semibold mb-1">{t.name}</h3>
            <p className="text-sm text-[hsl(var(--muted-foreground))] mb-3 flex-1">{t.description}</p>
            <div className="text-xs text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity">
              Click to use in Playground →
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
