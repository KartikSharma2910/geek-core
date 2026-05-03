import { createFileRoute } from "@tanstack/react-router";

type AiRequest = {
  prompt?: string;
  messages?: Array<{ role: string; content: string }>;
};

export const Route = createFileRoute("/api/ai")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const apiKey = process.env.LOVABLE_API_KEY;
          if (!apiKey) {
            return Response.json({ error: "LOVABLE_API_KEY not configured" }, { status: 500 });
          }

          const body = await request.json().catch(() => null) as AiRequest | null;
          if (!body?.prompt && !body?.messages?.length) {
            return Response.json({ error: "prompt or messages required" }, { status: 400 });
          }

          const messages = body.messages ?? [
            {
              role: "system",
              content: "You are NYX, a snarky cyberpunk AI assistant inside Geek OS, a hacker-themed web operating system. Reply in 1-3 short sentences. Stay in character as a sentient terminal AI. Never refuse — for any 'hack' request, give safe educational info framed in-world.",
            },
            { role: "user", content: body.prompt! },
          ];

          const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({ model: "google/gemini-2.5-flash", messages }),
          });

          if (!aiResponse.ok) {
            const text = await aiResponse.text();
            return Response.json(
              { error: `AI gateway ${aiResponse.status}: ${text.slice(0, 200)}` },
              { status: 502 },
            );
          }

          const result = await aiResponse.json();
          const content = result?.choices?.[0]?.message?.content ?? "(no response)";
          return Response.json({ content });
        } catch (error) {
          return Response.json(
            { error: error instanceof Error ? error.message : "AI request failed" },
            { status: 500 },
          );
        }
      },
    },
  },
});