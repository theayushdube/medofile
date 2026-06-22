---
name: Medofile admin credentials
description: JWT-based admin auth credentials and architecture for Medofile admin panel
---

Superadmin: username `Anay@2302`, password `Anjali@0223`
Admin: username `BrijeshDDPL`, password `BrijeshV@2711`

**Why:** These are bcrypt-hashed in the DB seed (`artifacts/api-server/src/seed.ts`) via `seedIfEmpty()` which runs on every server start. JWT secret env var is `JWT_SECRET` (falls back to `medofile_jwt_secret_2026`).

**How to apply:** The admin panel at `/admin` (web) uses JWT stored in `localStorage` key `medofile_admin_auth`. Auth headers: `Authorization: Bearer <token>`. Superadmin gets Users tab + delete doctor rights. Admin gets doctor profile edit only.
