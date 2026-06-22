---
name: Medofile web doctor hook
description: How the web app fetches doctors from the API — shared hook, type shape, caching
---

Hook file: `artifacts/web/src/hooks/useDoctors.ts`

- `useDoctors()` — fetches all doctors from `/api/doctors`, 60s in-memory cache, returns `{ doctors: WebDoctor[], loading: boolean }`
- `useDoctor(id)` — fetches single doctor from cache first, then `/api/doctors/:id`

**Why:** `WebDoctor = Omit<ApiDoctor, "id"> & { id: string }` — must use Omit to avoid `number & string = never` type error. API returns numeric IDs; web pages expect string IDs for route matching.

**How to apply:** Import from `@/hooks/useDoctors`. Pass `doc as any` to `DoctorCard` when needed (DoctorCard's Doctor type from static data has narrower consultationTypes). DoctorProfile and Booking use `useDoctor(params?.id)` and include loading/null guards before the main return.
