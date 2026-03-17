export type NovaAnalysisResult = {
  stressLevel: string;
  pressureType: string;
  calmMode: boolean;
  rewrittenMessage: string;
  supportMessage: string;
};

export async function analyzeWithNova(
  message: string,
  context: string
): Promise<NovaAnalysisResult> {
  const apiKey = process.env.NOVA_API_KEY;
  const model = process.env.NOVA_MODEL || "nova-2-lite-v1";

  if (!apiKey) {
    throw new Error("Missing NOVA_API_KEY in environment variables.");
  }

  const prompt = `
You are an emotional pressure analysis assistant for a wellness-focused communication app.

Analyze the user's message and return ONLY valid JSON with these exact fields:
- stressLevel: one of "Low", "Medium", "High"
- pressureType: short label like "Workload Anxiety", "Academic Pressure", "Social Overload", or "General Pressure"
- calmMode: true or false
- rewrittenMessage: a calmer, clearer, polite rewrite of the user's message
- supportMessage: one short supportive sentence

Context: ${context}
User message: ${message}

Rules:
- If the message sounds overwhelmed, panicked, highly stressed, or emotionally overloaded, use "High"
- If the message sounds worried, struggling, uncertain, or pressured, use "Medium"
- If the message sounds calm and manageable, use "Low"
- Return JSON only, with no markdown fences.
`;

  const response = await fetch("https://api.nova.amazon.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.2,
    }),
  });

  const text = await response.text();

  if (!response.ok) {
    throw new Error(`Nova API error: ${response.status} ${text}`);
  }

  let data: any;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`Nova returned non-JSON response: ${text.slice(0, 300)}`);
  }

  const rawContent = data?.choices?.[0]?.message?.content || "";

  if (!rawContent) {
    throw new Error("Nova returned an empty response.");
  }

  const cleaned = rawContent
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  return JSON.parse(cleaned);
}