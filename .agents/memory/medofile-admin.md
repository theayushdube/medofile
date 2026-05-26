---
name: Medofile Admin Panel
description: Admin panel access, auth, and data management for Medofile web app
---

## Access
- URL: /web/admin
- Password: medofile2026 (frontend-only check, no backend auth)
- Tabs: Overview, Doctors, Bookings, Analytics

## Data storage
- Web bookings persist to localStorage key `medofile_bookings`
- Functions: getBookings(), addBooking(), updateBookingStatus() in `artifacts/web/src/data/doctors.ts`
- Admin panel reads/updates bookings from localStorage in real time

## Why
- Simple frontend-only password guard keeps it lightweight (no auth backend needed for demo)
- localStorage bookings allow admin to see all web-app bookings without a database round-trip
