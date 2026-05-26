# Medofile

A comprehensive healthcare platform connecting patients with verified doctors across India — with a React Native mobile app, a full-featured React web app, and an AI health assistant.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/mobile run dev` — run the Expo mobile app
- `pnpm --filter @workspace/web run dev` — run the web app (port 22333, path /web/)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- **API**: Express 5, Drizzle ORM, PostgreSQL
- **Mobile**: Expo SDK 54, expo-router, React Native 0.81.5
- **Web**: React 19, Vite, Tailwind v4, shadcn/ui (Radix), wouter router, react-query, recharts, framer-motion, lucide-react
- **AI**: OpenAI GPT-4o-mini via Replit AI Integration (SSE streaming)
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- Build: esbuild (CJS bundle)

## Where Things Live

```
artifacts/mobile/         — Expo React Native app
  app/index.tsx           — Animated splash screen
  app/(patient)/          — Patient tab layout (Home, Search, Appointments, Profile)
  app/(doctor)/           — Doctor tab layout (Dashboard, Bookings, Analytics)
  app/doctor/[id].tsx     — Full doctor profile with Call/WhatsApp/Directions/Social/Book
  app/book/[doctorId].tsx — 3-step booking flow (Date→Patient Details→Confirm)
  app/healthbot.tsx       — AI Health Assistant with SSE streaming
  data/mockData.ts        — Shared Doctor/Booking/Review types + mock data

artifacts/web/src/        — React Vite web app (preview path: /web/)
  pages/Home.tsx          — JustDial-style home with hero search + specialty grid
  pages/DoctorList.tsx    — Search, filter, sort doctors
  pages/DoctorProfile.tsx — Full profile: overview, treatments, reviews, location, socials
  pages/Booking.tsx       — 3-step booking: Date/Time → Patient Details → Confirm
  pages/AdminPanel.tsx    — Password-protected admin panel (pw: medofile2026)
  data/doctors.ts         — Doctor data + localStorage booking helpers

artifacts/api-server/     — Express 5 API
  src/routes/             — API routes including /api/chat (SSE streaming)

lib/db/                   — Drizzle ORM + PostgreSQL schema
lib/api-spec/             — OpenAPI spec (source of truth)
lib/api-client-react/     — Generated React Query hooks
lib/api-zod/              — Generated Zod validation schemas
```

## Architecture Decisions

- **Contract-first API**: OpenAPI spec in `lib/api-spec/openapi.yaml` drives Zod schemas and React Query hooks via Orval codegen.
- **Mock data over DB for doctors**: Doctor profiles are local mock data for speed; only AI chat conversations use the database.
- **Shared type-compatible Doctor interface**: Both mobile (`data/mockData.ts`) and web (`data/doctors.ts`) use the same Doctor shape for consistency.
- **SSE streaming for AI**: The `/api/chat` endpoint uses Server-Sent Events for real-time AI response streaming on both mobile and web.
- **localStorage for web bookings**: Bookings are persisted in localStorage on the web app, readable in the Admin Panel.

## Product

- **Patient app (mobile + web)**: Search doctors by specialty, city, or name → View rich profiles with socials, education, treatments, location map → Book with patient details form (name/email/phone/concern) → Manage appointments
- **Doctor profiles**: Call, WhatsApp, Directions, Instagram, YouTube, LinkedIn, X, Google Business, website — all one-tap
- **AI Health Assistant**: Chat with GPT-4o-mini about symptoms, get specialist recommendations
- **Admin Panel** (web, `/admin`): Overview stats, doctor management, booking management, full analytics table. Password: `medofile2026`
- **Doctor Analytics**: GMB-style metrics — impressions, profile views, call clicks, chat clicks, direction clicks, bookings, weekly trend

## User Preferences

- NEVER create `app.config.ts` in the mobile app — use `app.json` only.
- App name: **Medofile** (previously MediConnect — fully renamed)
- Brand colors: primary `#1B72E8` (blue), accent `#00C897` (teal), background `#F4F7FC`
- Admin password: `medofile2026`

## Gotchas

- Pre-existing TS errors in mobile: `calendar.fill` icon type and `useColors.ts` cast — don't affect runtime, pre-date Medofile work.
- Web app is at preview path `/web/` — all routes are prefixed with `/web/` in production.
- Mobile BASE_URL: `https://${process.env.EXPO_PUBLIC_DOMAIN}/api` for API calls.
- `pnpm run typecheck:libs` must pass before deploying (runs `tsc --build` on composite libs).

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
- Web booking data persists to `localStorage` key `medofile_bookings`
- Doctor mock data: 8 doctors across 5 cities with full analytics, socials, education, treatments
