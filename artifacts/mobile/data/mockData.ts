export interface Doctor {
  id: string;
  name: string;
  qualification: string;
  degrees: string[];
  specialization: string;
  experience: number;
  rating: number;
  reviewCount: number;
  fee: number;
  hospital: string;
  clinicName: string;
  address: string;
  landmark: string;
  city: string;
  about: string;
  languages: string[];
  availability: string;
  isVerified: boolean;
  isPremium: boolean;
  gender: "Male" | "Female";
  consultationTypes: ("clinic" | "video" | "home")[];
  registrationNumber: string;
  avatar: string;
  socials: {
    instagram?: string;
    facebook?: string;
    linkedin?: string;
    youtube?: string;
    twitter?: string;
    website?: string;
    whatsapp?: string;
    telegram?: string;
  };
  treatments: string[];
  education: Array<{ degree: string; college: string; year: number }>;
  memberships: string[];
  insurances: string[];
  timing: string;
  emergencyAvailable: boolean;
  branches: Array<{ name: string; address: string; timing: string }>;
}

export interface Review {
  id: string;
  doctorId: string;
  patientName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Appointment {
  id: string;
  doctorId: string;
  patientName: string;
  date: string;
  time: string;
  type: "clinic" | "video" | "home";
  status: "upcoming" | "completed" | "cancelled";
  branch?: string;
  fee: number;
  notes?: string;
}

export interface Specialization {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export const SPECIALIZATIONS: Specialization[] = [
  { id: "1", name: "Cardiologist", icon: "heart", color: "#E53E3E" },
  { id: "2", name: "Dermatologist", icon: "leaf", color: "#38A169" },
  { id: "3", name: "Neurologist", icon: "pulse", color: "#805AD5" },
  { id: "4", name: "Orthopedic", icon: "fitness", color: "#DD6B20" },
  { id: "5", name: "Pediatrician", icon: "happy", color: "#3182CE" },
  { id: "6", name: "Gynecologist", icon: "woman", color: "#D53F8C" },
  { id: "7", name: "Dentist", icon: "medical", color: "#2B6CB0" },
  { id: "8", name: "Ophthalmologist", icon: "eye", color: "#2C7A7B" },
  { id: "9", name: "Psychiatrist", icon: "fitness", color: "#553C9A" },
  { id: "10", name: "ENT Specialist", icon: "ear", color: "#744210" },
  { id: "11", name: "General Physician", icon: "person", color: "#276749" },
  { id: "12", name: "Oncologist", icon: "shield-checkmark", color: "#C05621" },
];

export const DOCTORS: Doctor[] = [
  {
    id: "1",
    name: "Dr. Anil Sharma",
    qualification: "MBBS, MD, DM (Cardiology)",
    degrees: ["MBBS", "MD", "DM (Cardiology)"],
    specialization: "Cardiologist",
    experience: 18,
    rating: 4.9,
    reviewCount: 312,
    fee: 800,
    hospital: "Apollo Hospital",
    clinicName: "Sharma Heart Clinic",
    address: "42, MG Road, Connaught Place",
    landmark: "Near Metro Station",
    city: "New Delhi",
    about:
      "Dr. Anil Sharma is a senior interventional cardiologist with 18+ years of experience. He specializes in complex coronary interventions, cardiac catheterization, and heart failure management. He has performed over 5000 cardiac procedures and is known for his compassionate approach.",
    languages: ["English", "Hindi"],
    availability: "Mon-Sat, 10am-7pm",
    isVerified: true,
    isPremium: true,
    gender: "Male",
    consultationTypes: ["clinic", "video"],
    registrationNumber: "DMC-23456",
    avatar: "https://i.pravatar.cc/200?img=68",
    socials: {
      instagram: "@dranilsharma_cardio",
      youtube: "DrAnilSharmaCardio",
      website: "dranilsharma.com",
      linkedin: "dranilsharma",
    },
    treatments: [
      "Angioplasty",
      "Bypass Surgery Consultation",
      "Echocardiography",
      "Stress Test",
      "Holter Monitoring",
      "Pacemaker Implantation",
    ],
    education: [
      { degree: "MBBS", college: "AIIMS Delhi", year: 1999 },
      { degree: "MD Medicine", college: "PGI Chandigarh", year: 2003 },
      { degree: "DM Cardiology", college: "AIIMS Delhi", year: 2006 },
    ],
    memberships: [
      "Cardiological Society of India",
      "European Society of Cardiology",
      "American College of Cardiology",
    ],
    insurances: ["Star Health", "HDFC ERGO", "Max Bupa", "Bajaj Allianz"],
    timing: "10:00 AM - 7:00 PM",
    emergencyAvailable: true,
    branches: [
      { name: "Connaught Place", address: "42, MG Road, CP", timing: "10am-2pm" },
      { name: "Saket", address: "Apollo Hospital, Saket", timing: "3pm-7pm" },
    ],
  },
  {
    id: "2",
    name: "Dr. Priya Nair",
    qualification: "MBBS, MD (Dermatology)",
    degrees: ["MBBS", "MD (Dermatology)"],
    specialization: "Dermatologist",
    experience: 11,
    rating: 4.8,
    reviewCount: 287,
    fee: 600,
    hospital: "Fortis Hospital",
    clinicName: "Glow Skin Clinic",
    address: "15, Park Avenue, Bandra West",
    landmark: "Near Linking Road",
    city: "Mumbai",
    about:
      "Dr. Priya Nair is a renowned dermatologist specializing in cosmetic dermatology, hair loss treatments, and skin disorders. She has trained in advanced laser and aesthetic procedures in the USA and Germany.",
    languages: ["English", "Hindi", "Malayalam"],
    availability: "Mon-Fri, 9am-6pm",
    isVerified: true,
    isPremium: true,
    gender: "Female",
    consultationTypes: ["clinic", "video"],
    registrationNumber: "MMC-78901",
    avatar: "https://i.pravatar.cc/200?img=47",
    socials: {
      instagram: "@drpriyanair_skin",
      youtube: "GlowWithDrPriya",
      facebook: "drpriyanair",
      website: "glowskin.in",
    },
    treatments: [
      "Acne Treatment",
      "Anti-Aging",
      "Laser Hair Removal",
      "Chemical Peel",
      "PRP Therapy",
      "Botox & Fillers",
    ],
    education: [
      { degree: "MBBS", college: "Seth GS Medical College", year: 2006 },
      { degree: "MD Dermatology", college: "KEM Hospital", year: 2010 },
    ],
    memberships: [
      "Indian Association of Dermatologists",
      "International Society of Dermatology",
    ],
    insurances: ["Religare Health", "New India Assurance"],
    timing: "9:00 AM - 6:00 PM",
    emergencyAvailable: false,
    branches: [
      { name: "Bandra West", address: "15, Park Avenue, Bandra", timing: "9am-2pm" },
      { name: "Andheri", address: "78, Versova Road", timing: "3pm-6pm" },
    ],
  },
  {
    id: "3",
    name: "Dr. Rajesh Kumar",
    qualification: "MBBS, MS (Orthopedics)",
    degrees: ["MBBS", "MS (Orthopedics)"],
    specialization: "Orthopedic",
    experience: 22,
    rating: 4.7,
    reviewCount: 451,
    fee: 700,
    hospital: "Max Hospital",
    clinicName: "Kumar Bone & Joint Clinic",
    address: "99, Sector 14, Gurugram",
    landmark: "Near Huda City Centre",
    city: "Gurugram",
    about:
      "Dr. Rajesh Kumar is one of Delhi NCR's leading orthopedic surgeons, specializing in joint replacement surgery, sports injuries, and spine care. He has performed over 3000 joint replacement surgeries.",
    languages: ["English", "Hindi"],
    availability: "Mon-Sat, 11am-8pm",
    isVerified: true,
    isPremium: false,
    gender: "Male",
    consultationTypes: ["clinic", "home"],
    registrationNumber: "HMC-34567",
    avatar: "https://i.pravatar.cc/200?img=12",
    socials: {
      linkedin: "drrajeshkumar",
      website: "drkumarortho.com",
    },
    treatments: [
      "Total Knee Replacement",
      "Hip Replacement",
      "Spine Surgery",
      "Sports Injury Management",
      "Arthroscopy",
    ],
    education: [
      { degree: "MBBS", college: "MAMC Delhi", year: 1994 },
      { degree: "MS Orthopedics", college: "LNJP Hospital", year: 1998 },
    ],
    memberships: [
      "Indian Orthopedic Association",
      "Delhi Orthopedic Association",
    ],
    insurances: ["Star Health", "HDFC ERGO", "United India Insurance"],
    timing: "11:00 AM - 8:00 PM",
    emergencyAvailable: true,
    branches: [
      { name: "Gurugram", address: "99, Sector 14, Gurugram", timing: "11am-4pm" },
      { name: "Delhi", address: "Max Hospital, Saket", timing: "5pm-8pm" },
    ],
  },
  {
    id: "4",
    name: "Dr. Sneha Patel",
    qualification: "MBBS, MD (Pediatrics), Fellowship in Neonatology",
    degrees: ["MBBS", "MD (Pediatrics)", "Fellowship (Neonatology)"],
    specialization: "Pediatrician",
    experience: 14,
    rating: 4.9,
    reviewCount: 523,
    fee: 550,
    hospital: "Rainbow Hospital",
    clinicName: "Little Stars Pediatric Clinic",
    address: "22, Jubilee Hills Road",
    landmark: "Near Film Nagar",
    city: "Hyderabad",
    about:
      "Dr. Sneha Patel is a dedicated pediatrician and neonatologist with 14 years of experience. She specializes in newborn care, developmental pediatrics, and childhood vaccinations.",
    languages: ["English", "Hindi", "Telugu", "Gujarati"],
    availability: "Mon-Sat, 9am-5pm",
    isVerified: true,
    isPremium: true,
    gender: "Female",
    consultationTypes: ["clinic", "video", "home"],
    registrationNumber: "TSMC-12345",
    avatar: "https://i.pravatar.cc/200?img=32",
    socials: {
      instagram: "@drsneha_pediatrics",
      youtube: "LittleStarsHealth",
      facebook: "drsnehapatelpeds",
      whatsapp: "+91-9876543210",
    },
    treatments: [
      "Newborn Care",
      "Vaccination Program",
      "Developmental Assessment",
      "Child Nutrition",
      "Fever & Infection Management",
    ],
    education: [
      { degree: "MBBS", college: "Osmania Medical College", year: 2003 },
      { degree: "MD Pediatrics", college: "Niloufer Hospital", year: 2007 },
    ],
    memberships: [
      "Indian Academy of Pediatrics",
      "National Neonatology Forum",
    ],
    insurances: ["Arogya Sanjeevani", "Star Health", "Max Bupa"],
    timing: "9:00 AM - 5:00 PM",
    emergencyAvailable: true,
    branches: [
      { name: "Jubilee Hills", address: "22, Jubilee Hills Road", timing: "9am-5pm" },
    ],
  },
  {
    id: "5",
    name: "Dr. Vikram Mehta",
    qualification: "MBBS, MD (Neurology), DM",
    degrees: ["MBBS", "MD", "DM (Neurology)"],
    specialization: "Neurologist",
    experience: 20,
    rating: 4.8,
    reviewCount: 289,
    fee: 900,
    hospital: "Medanta Hospital",
    clinicName: "NeuroMind Clinic",
    address: "Sector 38, Golf Course Road",
    landmark: "Near DLF Phase 4",
    city: "Gurugram",
    about:
      "Dr. Vikram Mehta is a senior consultant neurologist with expertise in stroke, epilepsy, Parkinson's disease, and headache disorders. He has trained at Cleveland Clinic, USA.",
    languages: ["English", "Hindi"],
    availability: "Tue-Sat, 10am-6pm",
    isVerified: true,
    isPremium: true,
    gender: "Male",
    consultationTypes: ["clinic", "video"],
    registrationNumber: "HMC-55678",
    avatar: "https://i.pravatar.cc/200?img=67",
    socials: {
      linkedin: "drvikrammehta",
      twitter: "@drvikramneurology",
      website: "neuromind.in",
    },
    treatments: [
      "Epilepsy Management",
      "Stroke Treatment",
      "Parkinson's Disease",
      "Migraine Treatment",
      "Memory Disorders",
      "EEG & EMG Studies",
    ],
    education: [
      { degree: "MBBS", college: "AIIMS Delhi", year: 1997 },
      { degree: "MD Medicine", college: "AIIMS Delhi", year: 2001 },
      { degree: "DM Neurology", college: "AIIMS Delhi", year: 2004 },
    ],
    memberships: [
      "Neurological Society of India",
      "Indian Epilepsy Society",
    ],
    insurances: ["Star Health", "HDFC ERGO", "Bajaj Allianz"],
    timing: "10:00 AM - 6:00 PM",
    emergencyAvailable: false,
    branches: [
      { name: "Gurugram", address: "Medanta Hospital, Sector 38", timing: "10am-6pm" },
    ],
  },
  {
    id: "6",
    name: "Dr. Ananya Roy",
    qualification: "MBBS, MS (Gynecology & Obstetrics)",
    degrees: ["MBBS", "MS (Gynecology)"],
    specialization: "Gynecologist",
    experience: 16,
    rating: 4.9,
    reviewCount: 412,
    fee: 700,
    hospital: "Apollo Cradle",
    clinicName: "Women's Wellness Centre",
    address: "78, AJC Bose Road",
    landmark: "Near Park Street Metro",
    city: "Kolkata",
    about:
      "Dr. Ananya Roy is a highly experienced obstetrician and gynecologist. She specializes in high-risk pregnancy, laparoscopic surgery, infertility treatment, and women's health.",
    languages: ["English", "Hindi", "Bengali"],
    availability: "Mon-Sat, 10am-6pm",
    isVerified: true,
    isPremium: true,
    gender: "Female",
    consultationTypes: ["clinic", "video", "home"],
    registrationNumber: "WBMC-67890",
    avatar: "https://i.pravatar.cc/200?img=21",
    socials: {
      instagram: "@drananyaroy_gyn",
      facebook: "womenwellnesskolkata",
      youtube: "DrAnanyaRoyGynecology",
    },
    treatments: [
      "High-Risk Pregnancy",
      "Normal & C-Section Delivery",
      "Laparoscopic Surgery",
      "PCOS Management",
      "IUI/IVF Consultation",
      "Menstrual Disorders",
    ],
    education: [
      { degree: "MBBS", college: "Medical College Kolkata", year: 2001 },
      { degree: "MS Gynecology", college: "IPGME&R Kolkata", year: 2005 },
    ],
    memberships: [
      "Federation of Obstetric & Gynaecological Societies of India",
      "Bengal Obstetric & Gynaecological Society",
    ],
    insurances: ["Star Health", "Niva Bupa", "ICICI Lombard"],
    timing: "10:00 AM - 6:00 PM",
    emergencyAvailable: true,
    branches: [
      { name: "Park Street", address: "78, AJC Bose Road", timing: "10am-2pm" },
      { name: "Salt Lake", address: "Block BF, Sector 1, Salt Lake", timing: "3pm-6pm" },
    ],
  },
  {
    id: "7",
    name: "Dr. Suresh Venkatesh",
    qualification: "BDS, MDS (Prosthodontics)",
    degrees: ["BDS", "MDS (Prosthodontics)"],
    specialization: "Dentist",
    experience: 15,
    rating: 4.7,
    reviewCount: 198,
    fee: 500,
    hospital: "",
    clinicName: "SmileZone Dental Studio",
    address: "112, 2nd Cross, Indiranagar",
    landmark: "Near 100 Feet Road",
    city: "Bengaluru",
    about:
      "Dr. Suresh Venkatesh is a specialist in prosthodontics and implant dentistry. His clinic is equipped with the latest digital dentistry tools and provides comprehensive dental care.",
    languages: ["English", "Kannada", "Tamil", "Telugu"],
    availability: "Mon-Sat, 10am-8pm",
    isVerified: true,
    isPremium: false,
    gender: "Male",
    consultationTypes: ["clinic"],
    registrationNumber: "KDC-23456",
    avatar: "https://i.pravatar.cc/200?img=53",
    socials: {
      instagram: "@smilezone_dental",
      website: "smilezoneblr.com",
      facebook: "smilezoneblr",
    },
    treatments: [
      "Dental Implants",
      "Teeth Whitening",
      "Braces & Aligners",
      "Root Canal",
      "Crown & Bridge",
      "Veneers",
    ],
    education: [
      { degree: "BDS", college: "Dayananda Sagar College of Dental Sciences", year: 2002 },
      { degree: "MDS Prosthodontics", college: "Manipal College of Dental Sciences", year: 2006 },
    ],
    memberships: [
      "Indian Dental Association",
      "Karnataka Dental Council",
    ],
    insurances: ["Religare", "HDFC ERGO"],
    timing: "10:00 AM - 8:00 PM",
    emergencyAvailable: false,
    branches: [
      { name: "Indiranagar", address: "112, 2nd Cross, Indiranagar", timing: "10am-8pm" },
    ],
  },
  {
    id: "8",
    name: "Dr. Meera Krishnaswamy",
    qualification: "MBBS, MD (General Medicine)",
    degrees: ["MBBS", "MD (General Medicine)"],
    specialization: "General Physician",
    experience: 12,
    rating: 4.6,
    reviewCount: 634,
    fee: 400,
    hospital: "Narayana Health",
    clinicName: "Meera Family Clinic",
    address: "45, 3rd Block, Rajajinagar",
    landmark: "Near BEL Circle",
    city: "Bengaluru",
    about:
      "Dr. Meera Krishnaswamy provides comprehensive primary care for all age groups. She is known for her thorough approach, timely diagnosis, and personalized care.",
    languages: ["English", "Kannada", "Tamil"],
    availability: "Mon-Sat, 8am-9pm",
    isVerified: true,
    isPremium: false,
    gender: "Female",
    consultationTypes: ["clinic", "video", "home"],
    registrationNumber: "KMC-45678",
    avatar: "https://i.pravatar.cc/200?img=44",
    socials: {
      whatsapp: "+91-8765432109",
    },
    treatments: [
      "General Check-up",
      "Diabetes Management",
      "Hypertension",
      "Fever & Infections",
      "Thyroid Disorders",
      "Preventive Health",
    ],
    education: [
      { degree: "MBBS", college: "MS Ramaiah Medical College", year: 2005 },
      { degree: "MD General Medicine", college: "NIMHANS", year: 2009 },
    ],
    memberships: [
      "Karnataka Medical Council",
      "Indian Medical Association",
    ],
    insurances: [
      "Arogya Sanjeevani",
      "PM Jan Arogya Yojana",
      "Star Health",
      "Niva Bupa",
    ],
    timing: "8:00 AM - 9:00 PM",
    emergencyAvailable: true,
    branches: [
      { name: "Rajajinagar", address: "45, 3rd Block, Rajajinagar", timing: "8am-9pm" },
    ],
  },
];

export const REVIEWS: Review[] = [
  {
    id: "r1",
    doctorId: "1",
    patientName: "Rahul Gupta",
    rating: 5,
    comment:
      "Dr. Sharma is exceptional. He explained my condition very clearly and the treatment was very effective. Highly recommend!",
    date: "2025-05-10",
  },
  {
    id: "r2",
    doctorId: "1",
    patientName: "Anita Verma",
    rating: 5,
    comment:
      "Very knowledgeable and patient doctor. He took time to understand my history before prescribing anything. Will visit again.",
    date: "2025-05-02",
  },
  {
    id: "r3",
    doctorId: "1",
    patientName: "Mohan Singh",
    rating: 4,
    comment: "Good doctor, but waiting time is long. The treatment was effective though.",
    date: "2025-04-20",
  },
  {
    id: "r4",
    doctorId: "2",
    patientName: "Pooja Shah",
    rating: 5,
    comment:
      "Dr. Priya is amazing! My skin has transformed completely after her treatment. Very professional and friendly.",
    date: "2025-05-12",
  },
  {
    id: "r5",
    doctorId: "2",
    patientName: "Neha Joshi",
    rating: 5,
    comment: "Best dermatologist in Mumbai. Very thorough consultation and brilliant results.",
    date: "2025-04-28",
  },
];

export const SAMPLE_APPOINTMENTS: Appointment[] = [
  {
    id: "apt1",
    doctorId: "1",
    patientName: "You",
    date: "2025-06-15",
    time: "11:00 AM",
    type: "clinic",
    status: "upcoming",
    branch: "Connaught Place",
    fee: 800,
    notes: "Routine cardiac checkup",
  },
  {
    id: "apt2",
    doctorId: "4",
    patientName: "You",
    date: "2025-06-20",
    time: "10:30 AM",
    type: "video",
    status: "upcoming",
    fee: 550,
    notes: "Child vaccination follow-up",
  },
  {
    id: "apt3",
    doctorId: "2",
    patientName: "You",
    date: "2025-05-20",
    time: "3:00 PM",
    type: "clinic",
    status: "completed",
    branch: "Bandra West",
    fee: 600,
  },
];

export const TIME_SLOTS = [
  "09:00 AM",
  "09:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "12:00 PM",
  "02:00 PM",
  "02:30 PM",
  "03:00 PM",
  "03:30 PM",
  "04:00 PM",
  "04:30 PM",
  "05:00 PM",
  "05:30 PM",
  "06:00 PM",
];

export const DOCTOR_SAMPLE: Doctor = DOCTORS[0];
