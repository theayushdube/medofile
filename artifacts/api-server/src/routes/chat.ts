import { Router, type IRouter } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";
import { db } from "@workspace/db";
import { doctors } from "@workspace/db/schema";

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

  try {
    const stream = await openai.chat.completions.create({
      model: "gpt-5-mini",
      max_completion_tokens: 800,
      stream: true,
      messages: [
        {
          role: "system",
          content: `You are a medical prescription reader for Medofile in India. 
          When given a prescription image:
          1. If clearly readable: List the medicines, their general purpose (e.g. "antibiotic", "painkiller"), and any visible instructions. Do NOT suggest dosages or recommend taking them.
          2. If partially readable: Share what you can read and note what is unclear.
          3. If not readable at all: Say the image is not clear enough.
          
          IMPORTANT: Always end with: "Please consult your doctor or a licensed pharmacist before taking any medication."
          NEVER suggest the patient take or not take any specific medication.
          NEVER provide medical advice based on the prescription.`
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Please analyze this prescription image and tell me what medicines are listed and their general category."
            },
            {
              type: "image_url",
              image_url: { url: imageBase64 }
            }
          ] as any
        }
      ]
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }
  } catch (err: any) {
    res.write(`data: ${JSON.stringify({ content: "I couldn't analyze this image clearly. Please visit your nearest pharmacy or doctor for assistance." })}\n\n`);
  }

  res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
  res.end();
});

router.get("/doctors/suggestions", async (req, res): Promise<void> => {
  try {
    const { specializations, city } = req.query as { specializations?: string; city?: string };
    const specList = specializations ? specializations.split(",").map(s => s.trim()) : [];

    let all = await db.select().from(doctors);

    if (specList.length > 0) {
      all = all.filter(d => specList.some(s => d.specialization.toLowerCase().includes(s.toLowerCase())));
    }
    if (city) {
      all = all.filter(d => d.city.toLowerCase().includes(city.toLowerCase()));
    }

    res.json(all.slice(0, 3));
  } catch {
    res.status(500).json({ error: "Failed to fetch suggestions" });
  }
});

export default router;
