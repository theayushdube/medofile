---
name: Medofile project overview
description: Architecture, file layout, and key decisions for the Medofile healthcare platform
---

## Key facts

- App name: **Medofile** (renamed from MediConnect — completed)
- Brand: primary #1B72E8 (blue), accent #00C897 (teal), background #F4F7FC
- 3 artifacts: mobile (Expo, port 18115), web (React+Vite, port 22333, path /web/), api-server (Express, port 8080)

## Doctor data
- Shared interface in `artifacts/mobile/data/mockData.ts` and `artifacts/web/src/data/doctors.ts`
- Doctor has: phone, location {lat, lng, mapsUrl}, socials {instagram, facebook, linkedin, youtube, twitter, x, website, whatsapp, telegram, googleBusiness}, analytics {impressions, profileViews, callClicks, chatClicks, bookings, directionsClicks, weeklyTrend}
- 8 doctors across New Delhi, Mumbai, Bengaluru, Hyderabad, Kolkata, Gurugram

## Mobile doctor profile buttons
- Row 1: Call (tel:), WhatsApp (wa.me/), Directions (maps URL), Bookmark
- Row 2: Chat (AI), Book Appointment

## Why
- Doctor interface was enhanced with phone/location/googleBusiness/x to support one-tap actions and maps integration
- NEVER create app.config.ts in mobile — use app.json only
- Pre-existing TS errors in mobile (calendar.fill icon + useColors cast) don't affect runtime

**How to apply:** Always include phone and location fields when adding new doctors to mockData.
