import { NextRequest } from "next/server";
import { streamCompletion, StreamResult } from "@/lib/providers";
import { calculateCost } from "@/lib/cost-calculator";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface CompareRequest {
  prompt: string;
  systemPrompt?: string;
  models: { provider: string; model: string }[];
}

export async function POST(req: NextRequest) {
  const body: CompareRequest = await req.json();
  const { prompt, systemPrompt, models } = body;

  if (!prompt || !models?.length) {
    return new Response(JSON.stringify({ error: "prompt and models required" }), { status: 400 });
  }

  // Create comparison record
  const comparison = await prisma.comparison.create({
    data: { prompt, category: null },
  });

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      // Run all models in parallel
      const promises = models.map(async ({ provider, model }) => {
        try {
          let lastResult: StreamResult | null = null;

          for await (const chunk of streamCompletion(provider, model, prompt, systemPrompt)) {
            lastResult = chunk;
            send({
              type: "chunk",
              provider,
              model,
              content: chunk.content,
              latencyMs: chunk.latencyMs,
              inputTokens: chunk.inputTokens,
              outputTokens: chunk.outputTokens,
              done: chunk.done,
              error: chunk.error,
            });
          }

          // Save response to DB
          if (lastResult) {
            const cost = calculateCost(provider, model, lastResult.inputTokens, lastResult.outputTokens);
            await prisma.response.create({
              data: {
                comparisonId: comparison.id,
                provider,
                model,
                content: lastResult.content,
                latencyMs: lastResult.latencyMs,
                inputTokens: lastResult.inputTokens,
                outputTokens: lastResult.outputTokens,
                costUsd: cost,
                error: lastResult.error,
              },
            });

            // Update model stats
            await prisma.modelStat.upsert({
              where: { provider_model_category: { provider, model, category: "general" } },
              create: {
                provider, model, category: "general",
                totalRuns: 1,
                avgLatencyMs: lastResult.latencyMs,
                avgCostUsd: cost,
                avgTokens: lastResult.outputTokens,
                winCount: 0,
              },
              update: {
                totalRuns: { increment: 1 },
                avgLatencyMs: lastResult.latencyMs,
                avgCostUsd: cost,
                avgTokens: lastResult.outputTokens,
              },
            });
          }
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : String(err);
          send({ type: "chunk", provider, model, content: "", latencyMs: 0, done: true, error: message });
        }
      });

      await Promise.all(promises);
      send({ type: "done", comparisonId: comparison.id });
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}
