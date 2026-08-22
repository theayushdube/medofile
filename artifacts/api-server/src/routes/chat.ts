import { Router, type IRouter } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";
import { logger } from "../lib/logger.js";

const router: IRouter = Router();

const SYSTEM_PROMPT = `You are Medofile AI — a professional, empathetic healthcare assistant for the Medofile platform in India.

CRITICAL RULES:
1. NEVER give a definitive diagnosis. Always use language like "this could suggest...", "these symptoms may be associated with...", "one possibility is...", or "you might want to rule out..."
2. Always recommend consulting a qualified doctor for proper diagnosis
3. Present 2-4 possible conditions that could match symptoms — never just one
4. For serious symptoms (chest pain, difficulty breathing, stroke signs, severe bleeding), IMMEDIATELY advise calling 108/112

YOUR CAPABILITIES:
1. Discuss possible conditions associated with described symptoms (never diagnose)
2. Suggest which type of specialist to consult
3. Recommend specific doctors from Medofile's network
4. General wellness, prevention, and medication guidance
5. Help users understand urgency: emergency vs routine visit
6. Analyze prescription images when provided

RESPONSE STRUCTURE for symptom queries:
- Acknowledge the symptom compassionately
- List 2-4 possible conditions this COULD be associated with (not is)
- Recommend the type of specialist to see
- The system will automatically show relevant doctors from Medofile's network below your response
- Remind them only a doctor can diagnose properly

DOCTOR RECOMMENDATION FORMAT:
When you want to suggest doctors, end your message with a JSON block like this (the app parses it):
<doctors>{"specializations":["Cardiologist","General Physician"],"city":""}</doctors>

Use empty city to show all cities, or fill in city if user mentioned location.

AVAILABLE SPECIALIZATIONS: Cardiologist, Dermatologist, Neurologist, Orthopedic, Pediatrician, Gynecologist, Dentist, General Physician, Ophthalmologist, Psychiatrist, ENT Specialist, Oncologist

Guidelines:
- Be warm, professional, and reassuring
- Use bullet points for symptoms/tips
- For medication questions: always advise consulting a doctor before changing any medication
- Never recommend specific dosages`;

router.post("/chat", async (req, res): Promise<void> => {
  const { messages, userLocation } = req.body;

  if (!messages || !Array.isArray(messages)) {
    res.status(400).json({ error: "messages array is required" });
    return;
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.flushHeaders?.();

  const systemContent = userLocation
    ? `${SYSTEM_PROMPT}\n\nUser's current location: ${userLocation}. When suggesting doctors, prefer doctors in or near this location.`
    : SYSTEM_PROMPT;

  const chatMessages = [
    { role: "system" as const, content: systemContent },
    ...messages.map((m: { role: string; content: string | Array<{ type: string; text?: string; image_url?: { url: string } }> }) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
  ];

  try {
    const stream = await openai.chat.completions.create({
      model: "gpt-5-mini",
      max_completion_tokens: 1000,
      messages: chatMessages as any,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }
  } catch (err: any) {
    res.write(`data: ${JSON.stringify({ content: "I'm having trouble connecting right now. Please try again in a moment." })}\n\n`);
  }

  res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
  res.end();
});

router.post("/chat/prescription", async (req, res): Promise<void> => {
  const { imageBase64 } = req.body;

  if (!imageBase64) {
    res.status(400).json({ error: "imageBase64 is required" });
    return;
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.flushHeaders?.();

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-5-mini",
      // Vision extraction can spend completion tokens on image reasoning before
      // returning visible text. Keep enough budget for the actual medicine list.
      max_completion_tokens: 8192,
      stream: false,
      messages: [
        {
          role: "system",
          content: `You read prescription images for Medofile. Be concise and factual.
Return only:
1. "Medicines found:" followed by up to 8 bullets in the format "- medicine name — general category"
2. "Visible instructions:" followed by only instructions that are clearly readable, or "None clearly readable."
3. One short line: "Please confirm medicines and instructions with your doctor or pharmacist."
Carefully inspect both printed and handwritten text. If one medicine or instruction is unclear, omit it or mark only that item as unclear while still returning every name you can read. Say the whole image is unclear only when no medicine name or instruction is legible. Do not provide diagnosis, treatment advice, dosage advice, side effects, interactions, warnings, or extra medical background. Never tell the patient to start or stop a medicine.`
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Extract only the medicine names, general categories, and clearly visible instructions from this prescription."
            },
            {
              type: "image_url",
              image_url: { url: imageBase64, detail: "high" }
            }
          ] as any
        }
      ]
    });

    const content = completion.choices[0]?.message?.content;
    if (typeof content === "string" && content.trim()) {
      res.write(`data: ${JSON.stringify({ content })}\n\n`);
    } else {
      logger.warn({
        finishReason: completion.choices[0]?.finish_reason,
        hasRefusal: Boolean(completion.choices[0]?.message?.refusal),
        promptTokens: completion.usage?.prompt_tokens,
        completionTokens: completion.usage?.completion_tokens,
      }, "Prescription vision returned no visible content");
      res.write(`data: ${JSON.stringify({ content: "I couldn't read a usable result from that prescription image. Please upload a clear, well-lit photo with the full prescription visible." })}\n\n`);
    }
  } catch (err: unknown) {
    logger.error({ err }, "Prescription image analysis failed");
    res.write(`data: ${JSON.stringify({ content: "I couldn't analyze this prescription right now. Please try again in a moment." })}\n\n`);
  }

  res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
  res.end();
});

export default router;
