import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";

export interface StreamResult {
  provider: string;
  model: string;
  content: string;
  latencyMs: number;
  inputTokens: number;
  outputTokens: number;
  error?: string;
  done: boolean;
}

const PROVIDER_TIMEOUT_MS = 60_000; // 60s max per provider

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

export async function* streamCompletion(
  provider: string,
  modelId: string,
  prompt: string,
  systemPrompt?: string
): AsyncGenerator<StreamResult> {
  const start = Date.now();
  let content = "";
  let inputTokens = 0;
  let outputTokens = 0;

  const result = (done: boolean, error?: string): StreamResult => ({
    provider, model: modelId, content,
    latencyMs: Date.now() - start,
    inputTokens, outputTokens, done, error,
  });

  try {
    switch (provider) {
      case "openai":
      case "groq": {
        const apiKey = provider === "openai"
          ? process.env.OPENAI_API_KEY
          : process.env.GROQ_API_KEY;
        const client = new OpenAI({
          apiKey: apiKey || "",
          ...(provider === "groq" ? { baseURL: "https://api.groq.com/openai/v1" } : {}),
        });

        const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];
        if (systemPrompt) messages.push({ role: "system", content: systemPrompt });
        messages.push({ role: "user", content: prompt });

        const stream = await client.chat.completions.create({
          model: modelId, messages, stream: true, stream_options: { include_usage: true },
        });

        for await (const chunk of stream) {
          const delta = chunk.choices?.[0]?.delta?.content;
          if (delta) content += delta;
          if (chunk.usage) {
            inputTokens = chunk.usage.prompt_tokens ?? 0;
            outputTokens = chunk.usage.completion_tokens ?? 0;
          }
          yield result(false);
        }
        if (!inputTokens) inputTokens = estimateTokens(prompt);
        if (!outputTokens) outputTokens = estimateTokens(content);
        yield result(true);
        break;
      }

      case "anthropic": {
        const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || "" });
        const messages: Anthropic.MessageParam[] = [{ role: "user", content: prompt }];

        const stream = client.messages.stream({
          model: modelId, max_tokens: 4096, messages,
          ...(systemPrompt ? { system: systemPrompt } : {}),
        });

        for await (const event of stream) {
          if (event.type === "content_block_delta" && "delta" in event) {
            const delta = event.delta as { type: string; text?: string };
            if (delta.text) content += delta.text;
            yield result(false);
          }
        }

        const finalMessage = await stream.finalMessage();
        inputTokens = finalMessage.usage?.input_tokens ?? estimateTokens(prompt);
        outputTokens = finalMessage.usage?.output_tokens ?? estimateTokens(content);
        yield result(true);
        break;
      }

      case "google": {
        const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || "");
        const model = genAI.getGenerativeModel({ model: modelId });

        const chatConfig = systemPrompt
          ? { systemInstruction: { role: "system" as const, parts: [{ text: systemPrompt }] } }
          : {};

        const streamResult = await model.generateContentStream({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          ...chatConfig,
        });

        for await (const chunk of streamResult.stream) {
          const text = chunk.text();
          if (text) content += text;
          yield result(false);
        }

        const response = await streamResult.response;
        const usage = response.usageMetadata;
        inputTokens = usage?.promptTokenCount ?? estimateTokens(prompt);
        outputTokens = usage?.candidatesTokenCount ?? estimateTokens(content);
        yield result(true);
        break;
      }

      case "mistral": {
        const apiKey = process.env.MISTRAL_API_KEY || "";
        const messages = [];
        if (systemPrompt) messages.push({ role: "system", content: systemPrompt });
        messages.push({ role: "user", content: prompt });

        const res = await fetch("https://api.mistral.ai/v1/chat/completions", { signal: AbortSignal.timeout(PROVIDER_TIMEOUT_MS),
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
          body: JSON.stringify({ model: modelId, messages, stream: true, max_tokens: 4096 }),
        });

        if (!res.ok) {
          yield result(true, `Mistral error: ${res.status} ${await res.text()}`);
          break;
        }

        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        if (reader) {
          while (true) {
            const { done: readerDone, value } = await reader.read();
            if (readerDone) break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              if (!line.startsWith("data: ") || line.includes("[DONE]")) continue;
              try {
                const data = JSON.parse(line.slice(6));
                const delta = data.choices?.[0]?.delta?.content;
                if (delta) content += delta;
                if (data.usage) {
                  inputTokens = data.usage.prompt_tokens ?? 0;
                  outputTokens = data.usage.completion_tokens ?? 0;
                }
              } catch (e) { /* SSE parse skip */ }
            }
            yield result(false);
          }
        }

        if (!inputTokens) inputTokens = estimateTokens(prompt);
        if (!outputTokens) outputTokens = estimateTokens(content);
        yield result(true);
        break;
      }

      case "ollama": {
        const baseUrl = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
        const ollamaModel = modelId === "ollama-local"
          ? (process.env.OLLAMA_MODEL || "llama3.1:8b")
          : modelId;

        const messages = [];
        if (systemPrompt) messages.push({ role: "system", content: systemPrompt });
        messages.push({ role: "user", content: prompt });

        const res = await fetch(`${baseUrl}/api/chat`, { signal: AbortSignal.timeout(PROVIDER_TIMEOUT_MS),
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ model: ollamaModel, messages, stream: true }),
        });

        if (!res.ok) {
          yield result(true, `Ollama error: ${res.status} ${await res.text()}`);
          break;
        }

        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        if (reader) {
          while (true) {
            const { done: readerDone, value } = await reader.read();
            if (readerDone) break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              if (!line.trim()) continue;
              try {
                const data = JSON.parse(line);
                if (data.message?.content) content += data.message.content;
                if (data.done && data.prompt_eval_count) {
                  inputTokens = data.prompt_eval_count;
                  outputTokens = data.eval_count ?? 0;
                }
              } catch (e) { /* SSE parse skip */ }
            }
            yield result(false);
          }
        }

        if (!inputTokens) inputTokens = estimateTokens(prompt);
        if (!outputTokens) outputTokens = estimateTokens(content);
        yield result(true);
        break;
      }

      default:
        yield result(true, `Unknown provider: ${provider}`);
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    yield result(true, message);
  }
}
