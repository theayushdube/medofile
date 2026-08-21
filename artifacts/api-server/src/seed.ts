import bcrypt from "bcryptjs";
import { db } from "@workspace/db";
import { adminUsers, doctors } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { logger } from "./lib/logger.js";

const DOCTORS_DATA = [
  {
    name: "Dr. Anil Sharma", qualification: "MBBS, MD, DM (Cardiology)",
    specialization: "Cardiologist", experience: 18, rating: 4.9, reviewCount: 312,
    fee: 800, hospital: "Apollo Hospital", clinicName: "Sharma Heart Clinic",
    address: "42, MG Road, Connaught Place", city: "New Delhi", phone: "+91-9876543001",
    about: "Dr. Anil Sharma is a senior interventional cardiologist with 18+ years of experience. He specializes in complex coronary interventions, cardiac catheterization, and heart failure management.",
    languages: ["English", "Hindi"], availability: "Mon-Sat, 10am-7pm",
    isVerified: true, isPremium: true, gender: "Male",
    consultationTypes: ["clinic"], registrationNumber: "DMC-23456",
    avatar: "https://i.pravatar.cc/200?img=68",
    location: { lat: 28.6315, lng: 77.2167, mapsUrl: "https://maps.google.com/?q=Connaught+Place+New+Delhi" },
    socials: { instagram: "@dranilsharma_cardio", youtube: "DrAnilSharmaCardio", website: "https://dranilsharma.com", linkedin: "dranilsharma", x: "@dranilcardio", googleBusiness: "https://g.co/kgs/ChIJ123", whatsapp: "+919876543001" },
    analytics: { impressions: 4820, profileViews: 1240, callClicks: 186, chatClicks: 203, bookings: 94, directionsClicks: 67, weeklyTrend: [120, 145, 132, 178, 165, 190, 210] },
    treatments: ["Angioplasty", "Bypass Surgery Consultation", "Echocardiography", "Stress Test", "Holter Monitoring", "Pacemaker Implantation"],
    education: [{ degree: "MBBS", college: "AIIMS Delhi", year: 1999 }, { degree: "MD Medicine", college: "PGI Chandigarh", year: 2003 }, { degree: "DM Cardiology", college: "AIIMS Delhi", year: 2006 }],
    memberships: ["Cardiological Society of India", "European Society of Cardiology", "American College of Cardiology"],
    insurances: ["Star Health", "HDFC ERGO", "Max Bupa", "Bajaj Allianz"],
    timing: "10:00 AM - 7:00 PM", emergencyAvailable: true,
    branches: [{ name: "Connaught Place", address: "42, MG Road, CP", timing: "10am-2pm" }, { name: "Saket", address: "Apollo Hospital, Saket", timing: "3pm-7pm" }],
  },
  {
    name: "Dr. Priya Nair", qualification: "MBBS, MD (Dermatology)",
    specialization: "Dermatologist", experience: 11, rating: 4.8, reviewCount: 287,
    fee: 600, hospital: "Fortis Hospital", clinicName: "Glow Skin Clinic",
    address: "15, Park Avenue, Bandra West", city: "Mumbai", phone: "+91-9876543002",
    about: "Dr. Priya Nair is a renowned dermatologist specializing in cosmetic dermatology, hair loss treatments, and skin disorders.",
    languages: ["English", "Hindi", "Malayalam"], availability: "Mon-Fri, 9am-6pm",
    isVerified: true, isPremium: true, gender: "Female",
    consultationTypes: ["clinic"], registrationNumber: "MMC-78901",
    avatar: "https://i.pravatar.cc/200?img=47",
    location: { lat: 19.0596, lng: 72.8295, mapsUrl: "https://maps.google.com/?q=Bandra+West+Mumbai" },
    socials: { instagram: "@drpriyanair_skin", youtube: "GlowWithDrPriya", facebook: "drpriyanair", website: "https://glowskin.in", x: "@drpriyanair", whatsapp: "+919876543002", googleBusiness: "https://g.co/kgs/ChIJ456" },
    analytics: { impressions: 6340, profileViews: 2180, callClicks: 241, chatClicks: 318, bookings: 127, directionsClicks: 89, weeklyTrend: [180, 210, 195, 225, 240, 260, 270] },
    treatments: ["Acne Treatment", "Anti-Aging", "Laser Hair Removal", "Chemical Peel", "PRP Therapy", "Botox & Fillers"],
    education: [{ degree: "MBBS", college: "Seth GS Medical College", year: 2006 }, { degree: "MD Dermatology", college: "KEM Hospital", year: 2010 }],
    memberships: ["Indian Association of Dermatologists", "International Society of Dermatology"],
    insurances: ["Religare Health", "New India Assurance"],
    timing: "9:00 AM - 6:00 PM", emergencyAvailable: false,
    branches: [{ name: "Bandra West", address: "15, Park Avenue, Bandra", timing: "9am-2pm" }, { name: "Andheri", address: "78, Versova Road", timing: "3pm-6pm" }],
  },
  {
    name: "Dr. Rajesh Kumar", qualification: "MBBS, MS (Orthopedics)",
    specialization: "Orthopedic", experience: 22, rating: 4.7, reviewCount: 451,
    fee: 700, hospital: "Max Hospital", clinicName: "Kumar Bone & Joint Clinic",
    address: "99, Sector 14, Gurugram", city: "Gurugram", phone: "+91-9876543003",
    about: "Dr. Rajesh Kumar is one of Delhi NCR's leading orthopedic surgeons, specializing in joint replacement surgery, sports injuries, and spine care.",
    languages: ["English", "Hindi"], availability: "Mon-Sat, 11am-8pm",
    isVerified: true, isPremium: false, gender: "Male",
    consultationTypes: ["clinic", "home"], registrationNumber: "HMC-34567",
    avatar: "https://i.pravatar.cc/200?img=12",
    location: { lat: 28.4595, lng: 77.0266, mapsUrl: "https://maps.google.com/?q=Sector+14+Gurugram" },
    socials: { linkedin: "drrajeshkumar", website: "https://drkumarortho.com", whatsapp: "+919876543003", x: "@drrajeshortho" },
    analytics: { impressions: 3210, profileViews: 980, callClicks: 142, chatClicks: 98, bookings: 76, directionsClicks: 54, weeklyTrend: [90, 105, 98, 115, 108, 120, 130] },
    treatments: ["Total Knee Replacement", "Hip Replacement", "Spine Surgery", "Sports Injury Management", "Arthroscopy"],
    education: [{ degree: "MBBS", college: "MAMC Delhi", year: 1994 }, { degree: "MS Orthopedics", college: "LNJP Hospital", year: 1998 }],
    memberships: ["Indian Orthopedic Association", "Delhi Orthopedic Association"],
    insurances: ["Star Health", "HDFC ERGO", "United India Insurance"],
    timing: "11:00 AM - 8:00 PM", emergencyAvailable: true,
    branches: [{ name: "Gurugram", address: "99, Sector 14, Gurugram", timing: "11am-4pm" }, { name: "Delhi", address: "Max Hospital, Saket", timing: "5pm-8pm" }],
  },
  {
    name: "Dr. Sneha Patel", qualification: "MBBS, MD (Pediatrics), Fellowship in Neonatology",
    specialization: "Pediatrician", experience: 14, rating: 4.9, reviewCount: 523,
    fee: 550, hospital: "Rainbow Hospital", clinicName: "Little Stars Pediatric Clinic",
    address: "22, Jubilee Hills Road", city: "Hyderabad", phone: "+91-9876543004",
    about: "Dr. Sneha Patel is a dedicated pediatrician and neonatologist with 14 years of experience.",
    languages: ["English", "Hindi", "Telugu", "Gujarati"], availability: "Mon-Sat, 9am-5pm",
    isVerified: true, isPremium: true, gender: "Female",
    consultationTypes: ["clinic", "home"], registrationNumber: "TSMC-12345",
    avatar: "https://i.pravatar.cc/200?img=32",
    location: { lat: 17.4239, lng: 78.4738, mapsUrl: "https://maps.google.com/?q=Jubilee+Hills+Hyderabad" },
    socials: { instagram: "@drsneha_pediatrics", youtube: "LittleStarsHealth", facebook: "drsnehapatelpeds", whatsapp: "+919876543004", x: "@drsnehapaed", googleBusiness: "https://g.co/kgs/ChIJ789" },
    analytics: { impressions: 5670, profileViews: 1890, callClicks: 267, chatClicks: 312, bookings: 148, directionsClicks: 103, weeklyTrend: [160, 185, 175, 200, 215, 230, 245] },
    treatments: ["Newborn Care", "Vaccination Program", "Developmental Assessment", "Child Nutrition", "Fever & Infection Management"],
    education: [{ degree: "MBBS", college: "Osmania Medical College", year: 2003 }, { degree: "MD Pediatrics", college: "Niloufer Hospital", year: 2007 }],
    memberships: ["Indian Academy of Pediatrics", "National Neonatology Forum"],
    insurances: ["Arogya Sanjeevani", "Star Health", "Max Bupa"],
    timing: "9:00 AM - 5:00 PM", emergencyAvailable: true,
    branches: [{ name: "Jubilee Hills", address: "22, Jubilee Hills Road", timing: "9am-5pm" }],
  },
  {
    name: "Dr. Vikram Mehta", qualification: "MBBS, MD (Neurology), DM",
    specialization: "Neurologist", experience: 20, rating: 4.8, reviewCount: 289,
    fee: 900, hospital: "Medanta Hospital", clinicName: "NeuroMind Clinic",
    address: "Sector 38, Golf Course Road", city: "Gurugram", phone: "+91-9876543005",
    about: "Dr. Vikram Mehta is a senior consultant neurologist with expertise in stroke, epilepsy, Parkinson's disease, and headache disorders.",
    languages: ["English", "Hindi"], availability: "Tue-Sat, 10am-6pm",
    isVerified: true, isPremium: true, gender: "Male",
    consultationTypes: ["clinic"], registrationNumber: "HMC-55678",
    avatar: "https://i.pravatar.cc/200?img=67",
    location: { lat: 28.4200, lng: 77.0939, mapsUrl: "https://maps.google.com/?q=Golf+Course+Road+Gurugram" },
    socials: { linkedin: "drvikrammehta", x: "@drvikramneurology", website: "https://neuromind.in", whatsapp: "+919876543005" },
    analytics: { impressions: 2980, profileViews: 876, callClicks: 112, chatClicks: 134, bookings: 58, directionsClicks: 41, weeklyTrend: [80, 95, 88, 102, 97, 115, 120] },
    treatments: ["Epilepsy Management", "Stroke Treatment", "Parkinson's Disease", "Migraine Treatment", "Memory Disorders", "EEG & EMG Studies"],
    education: [{ degree: "MBBS", college: "AIIMS Delhi", year: 1997 }, { degree: "MD Medicine", college: "AIIMS Delhi", year: 2001 }, { degree: "DM Neurology", college: "AIIMS Delhi", year: 2004 }],
    memberships: ["Neurological Society of India", "Indian Epilepsy Society"],
    insurances: ["Star Health", "HDFC ERGO", "Bajaj Allianz"],
    timing: "10:00 AM - 6:00 PM", emergencyAvailable: false,
    branches: [{ name: "Gurugram", address: "Medanta Hospital, Sector 38", timing: "10am-6pm" }],
  },
  {
    name: "Dr. Ananya Roy", qualification: "MBBS, MS (Gynecology & Obstetrics)",
    specialization: "Gynecologist", experience: 16, rating: 4.9, reviewCount: 412,
    fee: 700, hospital: "Apollo Cradle", clinicName: "Women's Wellness Centre",
    address: "78, AJC Bose Road", city: "Kolkata", phone: "+91-9876543006",
    about: "Dr. Ananya Roy is a highly experienced obstetrician and gynecologist specializing in high-risk pregnancy, laparoscopic surgery, and infertility treatment.",
    languages: ["English", "Hindi", "Bengali"], availability: "Mon-Sat, 10am-6pm",
    isVerified: true, isPremium: true, gender: "Female",
    consultationTypes: ["clinic", "home"], registrationNumber: "WBMC-67890",
    avatar: "https://i.pravatar.cc/200?img=21",
    location: { lat: 22.5448, lng: 88.3503, mapsUrl: "https://maps.google.com/?q=AJC+Bose+Road+Kolkata" },
    socials: { instagram: "@drananyaroy_gyn", facebook: "womenwellnesskolkata", youtube: "DrAnanyaRoyGynecology", whatsapp: "+919876543006", x: "@drananyaroy", googleBusiness: "https://g.co/kgs/ChIJ012" },
    analytics: { impressions: 5120, profileViews: 1650, callClicks: 224, chatClicks: 276, bookings: 118, directionsClicks: 87, weeklyTrend: [145, 162, 155, 175, 185, 195, 205] },
    treatments: ["High-Risk Pregnancy", "Normal & C-Section Delivery", "Laparoscopic Surgery", "PCOS Management", "IUI/IVF Consultation", "Menstrual Disorders"],
    education: [{ degree: "MBBS", college: "Medical College Kolkata", year: 2001 }, { degree: "MS Gynecology", college: "IPGME&R Kolkata", year: 2005 }],
    memberships: ["Federation of Obstetric & Gynaecological Societies of India", "Bengal Obstetric & Gynaecological Society"],
    insurances: ["Star Health", "Niva Bupa", "ICICI Lombard"],
    timing: "10:00 AM - 6:00 PM", emergencyAvailable: true,
    branches: [{ name: "Park Street", address: "78, AJC Bose Road", timing: "10am-2pm" }, { name: "Salt Lake", address: "Block BF, Sector 1, Salt Lake", timing: "3pm-6pm" }],
  },
  {
    name: "Dr. Suresh Venkatesh", qualification: "BDS, MDS (Prosthodontics)",
    specialization: "Dentist", experience: 15, rating: 4.7, reviewCount: 198,
    fee: 500, hospital: "", clinicName: "SmileZone Dental Studio",
    address: "112, 2nd Cross, Indiranagar", city: "Bengaluru", phone: "+91-9876543007",
    about: "Dr. Suresh Venkatesh is a specialist in prosthodontics and implant dentistry with the latest digital dentistry tools.",
    languages: ["English", "Kannada", "Tamil", "Telugu"], availability: "Mon-Sat, 10am-8pm",
    isVerified: true, isPremium: false, gender: "Male",
    consultationTypes: ["clinic"], registrationNumber: "KDC-23456",
    avatar: "https://i.pravatar.cc/200?img=53",
    location: { lat: 12.9784, lng: 77.6408, mapsUrl: "https://maps.google.com/?q=Indiranagar+Bengaluru" },
    socials: { instagram: "@smilezone_dental", website: "https://smilezoneblr.com", facebook: "smilezoneblr", whatsapp: "+919876543007", x: "@smilezoneblr", googleBusiness: "https://g.co/kgs/ChIJ345" },
    analytics: { impressions: 2540, profileViews: 720, callClicks: 98, chatClicks: 76, bookings: 52, directionsClicks: 48, weeklyTrend: [65, 78, 70, 85, 80, 90, 95] },
    treatments: ["Dental Implants", "Teeth Whitening", "Braces & Aligners", "Root Canal", "Crown & Bridge", "Veneers"],
    education: [{ degree: "BDS", college: "Dayananda Sagar College of Dental Sciences", year: 2002 }, { degree: "MDS Prosthodontics", college: "Manipal College of Dental Sciences", year: 2006 }],
    memberships: ["Indian Dental Association", "Karnataka Dental Council"],
    insurances: ["Religare", "HDFC ERGO"],
    timing: "10:00 AM - 8:00 PM", emergencyAvailable: false,
    branches: [{ name: "Indiranagar", address: "112, 2nd Cross, Indiranagar", timing: "10am-8pm" }],
  },
  {
    name: "Dr. Meera Krishnaswamy", qualification: "MBBS, MD (General Medicine)",
    specialization: "General Physician", experience: 12, rating: 4.6, reviewCount: 634,
    fee: 400, hospital: "Narayana Health", clinicName: "Meera Family Clinic",
    address: "45, 3rd Block, Rajajinagar", city: "Bengaluru", phone: "+91-9876543008",
    about: "Dr. Meera Krishnaswamy provides comprehensive primary care for all age groups with a thorough approach and personalized care.",
    languages: ["English", "Kannada", "Tamil"], availability: "Mon-Sat, 8am-9pm",
    isVerified: true, isPremium: false, gender: "Female",
    consultationTypes: ["clinic", "home"], registrationNumber: "KMC-45678",
    avatar: "https://i.pravatar.cc/200?img=44",
    location: { lat: 12.9902, lng: 77.5559, mapsUrl: "https://maps.google.com/?q=Rajajinagar+Bengaluru" },
    socials: { whatsapp: "+919876543008", facebook: "meerafamilyclinic", googleBusiness: "https://g.co/kgs/ChIJ678" },
    analytics: { impressions: 3890, profileViews: 1120, callClicks: 198, chatClicks: 145, bookings: 87, directionsClicks: 72, weeklyTrend: [110, 125, 118, 138, 130, 148, 155] },
    treatments: ["General Check-up", "Diabetes Management", "Hypertension", "Fever & Infections", "Thyroid Disorders", "Preventive Health"],
    education: [{ degree: "MBBS", college: "MS Ramaiah Medical College", year: 2005 }, { degree: "MD General Medicine", college: "NIMHANS", year: 2009 }],
    memberships: ["Karnataka Medical Council", "Indian Medical Association"],
    insurances: ["Arogya Sanjeevani", "PM Jan Arogya Yojana", "Star Health", "Niva Bupa"],
    timing: "8:00 AM - 9:00 PM", emergencyAvailable: true,
    branches: [{ name: "Rajajinagar", address: "45, 3rd Block, Rajajinagar", timing: "8am-9pm" }],
  },
];

let seeded = false;

export async function seedIfEmpty() {
  if (seeded) return;
  seeded = true;
  try {
    const existing = await db.select().from(doctors);
    if (existing.length === 0) {
      await db.insert(doctors).values(DOCTORS_DATA as any);
      logger.info("Seeded 8 doctors");
    }
    const existingAdmins = await db.select().from(adminUsers);
    if (existingAdmins.length === 0) {
      const superAdminHash = await bcrypt.hash("Brijesh132@", 12);
      const adminHash = await bcrypt.hash("BrijeshV@2711", 12);
      await db.insert(adminUsers).values([
        { username: "DDPL2302", passwordHash: superAdminHash, role: "superadmin" },
        { username: "BrijeshDDPL", passwordHash: adminHash, role: "admin" },
      ]);
      logger.info("Seeded admin users");
    } else {
      const legacySuperAdmin = existingAdmins.find((user) => user.username === "Anay@2302" && user.role === "superadmin");
      if (legacySuperAdmin) {
        const superAdminHash = await bcrypt.hash("Brijesh132@", 12);
        await db.update(adminUsers)
          .set({ username: "DDPL2302", passwordHash: superAdminHash })
          .where(eq(adminUsers.id, legacySuperAdmin.id));
        logger.info("Migrated super admin credentials");
      }
    }
  } catch (err) {
    logger.error({ err }, "Seed failed");
  }
}
