---
name: Medofile API architecture
description: Key API routes, DB seeding, and data flow for the Medofile backend
---

API routes (all under `/api`):
- `POST /auth/login` → JWT token (bcrypt verify)
- `GET /doctors` → all 8 doctors (public)
- `GET /doctors/:id` → single doctor (public)  
- `GET /doctors/suggestions?specializations=X&city=Y` → AI chatbot doctor cards
- `POST /bookings` → create booking (public, saves to DB)
- `GET /bookings` → all bookings (admin auth required)
- `PUT /bookings/:id/status` → update booking status (admin auth)
- `GET /admin/users` → list admin users (superadmin only)
- `POST /admin/users` → create admin user (superadmin only)
- `DELETE /admin/users/:id` → delete admin user (superadmin only)
- `POST /chat` → AI SSE streaming chat
- `POST /chat/prescription` → vision analysis of prescription photo

**Why:** `seedIfEmpty()` in `artifacts/api-server/src/seed.ts` runs on startup — safe to restart without losing data if DB already populated.

**How to apply:** Always go through shared proxy at `localhost:80/api/...` for curl testing. Mobile uses `https://${EXPO_PUBLIC_DOMAIN}/api` as base URL.
