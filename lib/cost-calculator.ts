export interface ModelInfo {
  id: string;
  name: string;
  provider: "openai" | "anthropic" | "google" | "groq" | "mistral" | "ollama";
  inputCostPer1M: number;
  outputCostPer1M: number;
  isFree: boolean;
  maxTokens: number;
  envKey: string;
  color: string;
}

export const MODEL_REGISTRY: ModelInfo[] = [
  // Groq (FREE)
  { id: "llama-3.3-70b-versatile", name: "Llama 3.3 70B", provider: "groq", inputCostPer1M: 0, outputCostPer1M: 0, isFree: true, maxTokens: 128000, envKey: "GROQ_API_KEY", color: "#10b981" },
  { id: "llama-3.1-8b-instant", name: "Llama 3.1 8B", provider: "groq", inputCostPer1M: 0, outputCostPer1M: 0, isFree: true, maxTokens: 128000, envKey: "GROQ_API_KEY", color: "#10b981" },
  // Ollama (FREE local)
  { id: "ollama-local", name: "Ollama (Local)", provider: "ollama", inputCostPer1M: 0, outputCostPer1M: 0, isFree: true, maxTokens: 8192, envKey: "OLLAMA_BASE_URL", color: "#64748b" },
  // OpenAI
  { id: "gpt-4o-mini", name: "GPT-4o Mini", provider: "openai", inputCostPer1M: 0.15, outputCostPer1M: 0.60, isFree: false, maxTokens: 128000, envKey: "OPENAI_API_KEY", color: "#3b82f6" },
  { id: "gpt-4o", name: "GPT-4o", provider: "openai", inputCostPer1M: 2.50, outputCostPer1M: 10.00, isFree: false, maxTokens: 128000, envKey: "OPENAI_API_KEY", color: "#2563eb" },
  // Anthropic
  { id: "claude-sonnet-4-20250514", name: "Claude Sonnet 4", provider: "anthropic", inputCostPer1M: 3.00, outputCostPer1M: 15.00, isFree: false, maxTokens: 200000, envKey: "ANTHROPIC_API_KEY", color: "#f97316" },
  { id: "claude-haiku-3.5", name: "Claude Haiku 3.5", provider: "anthropic", inputCostPer1M: 0.80, outputCostPer1M: 4.00, isFree: false, maxTokens: 200000, envKey: "ANTHROPIC_API_KEY", color: "#fb923c" },
  // Google
  { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash", provider: "google", inputCostPer1M: 0.15, outputCostPer1M: 0.60, isFree: false, maxTokens: 1000000, envKey: "GOOGLE_AI_API_KEY", color: "#ef4444" },
  { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash", provider: "google", inputCostPer1M: 0.10, outputCostPer1M: 0.40, isFree: false, maxTokens: 1000000, envKey: "GOOGLE_AI_API_KEY", color: "#f87171" },
  // Mistral
  { id: "mistral-large-latest", name: "Mistral Large", provider: "mistral", inputCostPer1M: 2.00, outputCostPer1M: 6.00, isFree: false, maxTokens: 128000, envKey: "MISTRAL_API_KEY", color: "#8b5cf6" },
  { id: "mistral-small-latest", name: "Mistral Small", provider: "mistral", inputCostPer1M: 0.20, outputCostPer1M: 0.60, isFree: false, maxTokens: 128000, envKey: "MISTRAL_API_KEY", color: "#a78bfa" },
];

export function calculateCost(provider: string, modelId: string, inputTokens: number, outputTokens: number): number {
  const model = MODEL_REGISTRY.find((m) => m.provider === provider && m.id === modelId);
  if (!model || model.isFree) return 0;
  const total = (inputTokens / 1_000_000) * model.inputCostPer1M + (outputTokens / 1_000_000) * model.outputCostPer1M;
  return Math.round(total * 1_000_000) / 1_000_000;
}

export function getAvailableModels(): ModelInfo[] {
  return MODEL_REGISTRY.filter((m) => {
    const val = process.env[m.envKey];
    return typeof val === "string" && val.trim().length > 0;
  });
}

export function getModelInfo(modelId: string): ModelInfo | undefined {
  return MODEL_REGISTRY.find((m) => m.id === modelId);
}
