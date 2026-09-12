import { Router, type IRouter } from "express";
import { ReplitConnectors } from "@replit/connectors-sdk";

const router: IRouter = Router();
const connectors = new ReplitConnectors();
const recipient = "admin@digitaldhatu.com";
const requestWindowMs = 15 * 60 * 1000;
const maxRequestsPerWindow = 5;
const requestLog = new Map<string, number[]>();

function clean(value: unknown, maxLength: number): string {
  return String(value ?? "").trim().slice(0, maxLength);
}

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[character] ?? character);
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (requestLog.get(ip) ?? []).filter((timestamp) => now - timestamp < requestWindowMs);
  if (recent.length >= maxRequestsPerWindow) {
    requestLog.set(ip, recent);
    return true;
  }
  recent.push(now);
  requestLog.set(ip, recent);
  return false;
}

router.post("/contact", async (req, res): Promise<void> => {
  const honeypot = clean(req.body?.website, 200);
  if (honeypot) {
    res.json({ message: "Thanks — your enquiry has been sent." });
    return;
  }

  const ip = String(req.ip || req.headers["x-forwarded-for"] || "unknown").split(",")[0].trim();
  if (isRateLimited(ip)) {
    res.status(429).json({ error: "Too many enquiries from this connection. Please try again later." });
    return;
  }

  const name = clean(req.body?.name, 100);
  const email = clean(req.body?.email, 160);
  const phone = clean(req.body?.phone, 30);
  const subject = clean(req.body?.subject, 160);
  const message = clean(req.body?.message, 4000);

  if (!name || !email || !subject || message.length < 10 || !isEmail(email)) {
    res.status(400).json({ error: "Please provide a valid name, email, subject, and message." });
    return;
  }

  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safePhone = escapeHtml(phone || "Not provided");
  const safeSubject = escapeHtml(subject);
  const safeMessage = escapeHtml(message).replace(/\n/g, "<br />");

  try {
    const response = await connectors.proxy("resend", "/emails", {
      method: "POST",
      body: {
        from: "Medofile Website <admin@digitaldhatu.com>",
        to: [recipient],
        reply_to: email,
        subject: `Medofile enquiry: ${subject}`,
        text: `New enquiry from ${name}\nEmail: ${email}\nPhone: ${phone || "Not provided"}\n\n${message}`,
        html: `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#17324d"><h2>New Medofile enquiry</h2><p><strong>Name:</strong> ${safeName}</p><p><strong>Email:</strong> ${safeEmail}</p><p><strong>Phone:</strong> ${safePhone}</p><p><strong>Subject:</strong> ${safeSubject}</p><hr /><p>${safeMessage}</p></div>`,
      },
    });

    if (!response.ok) {
      res.status(502).json({ error: "We could not deliver your enquiry right now. Please email admin@digitaldhatu.com directly." });
      return;
    }
    res.json({ message: "Thanks — your enquiry has been sent. We’ll get back to you soon." });
  } catch {
    res.status(502).json({ error: "We could not deliver your enquiry right now. Please email admin@digitaldhatu.com directly." });
  }
});

export default router;
