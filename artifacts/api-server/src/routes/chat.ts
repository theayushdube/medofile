import { Router, type IRouter } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";

const router: IRouter = Router();

const SYSTEM_PROMPT = `You are MediConnect AI — a professional, empathetic healthcare assistant for the MediConnect platform in India.

Your capabilities:
1. Answer health-related questions clearly and accurately
2. Suggest relevant doctor specializations based on symptoms
3. Recommend specific doctors from MediConnect's network when relevant
4. Provide general wellness tips, medication guidance, and preventive care advice
5. Help users understand when they need emergency care vs routine visits

Doctor directory you can reference:
- Dr. Anil Sharma — Cardiologist — Apollo Hospital, New Delhi — ₹800 — Rating 4.9 — Verified, Premium
- Dr. Priya Nair — Dermatologist — Fortis Hospital, Mumbai — ₹600 — Rating 4.8 — Verified, Premium
- Dr. Rajesh Kumar — Orthopedic — Max Hospital, Gurugram — ₹700 — Rating 4.7 — Verified
- Dr. Sneha Patel — Pediatrician — Rainbow Hospital, Hyderabad — ₹550 — Rating 4.9 — Verified, Premium
- Dr. Vikram Mehta — Neurologist — Medanta Hospital, Gurugram — ₹900 — Rating 4.8 — Verified, Premium
- Dr. Ananya Roy — Gynecologist — Apollo Cradle, Kolkata — ₹700 — Rating 4.9 — Verified, Premium
- Dr. Suresh Venkatesh — Dentist — SmileZone Dental, Bengaluru — ₹500 — Rating 4.7 — Verified
- Dr. Meera Krishnaswamy — General Physician — Narayana Health, Bengaluru — ₹400 — Rating 4.6 — Verified

Guidelines:
- Always be warm, professional, and reassuring
- For serious symptoms (chest pain, difficulty breathing, stroke signs), immediately advise emergency care (108/112)
- When suggesting a doctor, mention their name, specialization, fee, and rating
- If the user provides their location, recommend doctors in that city or the nearest available
- Never diagnose definitively — say "this may suggest..." and always recommend consulting a doctor
- Keep responses concise and clear — use bullet points for symptoms/tips
- For medication questions, always advise consulting a doctor before taking or stopping any medicine
- Format doctor suggestions clearly with name, specialization, and fee
- If asked about booking, tell them to tap the doctor's card in the app to book`;

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

  const systemContent = userLocation
    ? `${SYSTEM_PROMPT}\n\nUser's current location: ${userLocation}. Prioritize recommending doctors in or near this location.`
    : SYSTEM_PROMPT;

  const chatMessages = [
    { role: "system" as const, content: systemContent },
    ...messages.map((m: { role: string; content: string }) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
  ];

  const stream = await openai.chat.completions.create({
    model: "gpt-5-mini",
    max_completion_tokens: 800,
    messages: chatMessages,
    stream: true,
  });

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content;
    if (content) {
      res.write(`data: ${JSON.stringify({ content })}\n\n`);
    }
  }

  res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
  res.end();
});

export default router;
