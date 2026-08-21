import { useLocation } from "wouter";
import { Star, MapPin, Shield, Home, Building2, Phone } from "lucide-react";
import { motion } from "framer-motion";
import type { Doctor } from "@/data/doctors";

interface Props {
  doctor: Doctor;
  compact?: boolean;
  matchReasons?: string[];
}

export function DoctorCard({ doctor, compact = false, matchReasons = [] }: Props) {
  const [, navigate] = useLocation();

  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: "0 12px 32px rgba(27,114,232,0.12)" }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-2xl border border-border hover:border-primary/40 transition-colors cursor-pointer group overflow-hidden"
      onClick={() => navigate(`/doctors/${doctor.id}`)}
    >
      {doctor.isPremium && (
        <div className="h-1 bg-gradient-to-r from-primary to-[#00C897]" />
      )}

      <div className="p-5">
        <div className="flex gap-4">
          <div className="relative shrink-0">
            <img
              src={doctor.avatar}
              alt={doctor.name}
              className="w-16 h-16 rounded-2xl object-cover bg-muted"
            />
            {doctor.isVerified && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                <Shield className="w-3 h-3 text-white" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-foreground text-sm leading-tight group-hover:text-primary transition-colors">{doctor.name}</h3>
              <div className="flex items-center gap-1 shrink-0">
                <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                <span className="text-xs font-semibold text-foreground">{doctor.rating}</span>
              </div>
            </div>
            <p className="text-primary text-xs font-medium mt-0.5">{doctor.specialization}</p>
            <p className="text-muted-foreground text-xs mt-0.5">{doctor.qualification}</p>
            <div className="flex items-center gap-1 mt-1.5">
              <MapPin className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{doctor.city}</span>
              <span className="text-xs text-muted-foreground">•</span>
              <span className="text-xs text-muted-foreground">{doctor.experience} yrs exp</span>
            </div>
          </div>
        </div>

        {!compact && (
          <>
            <div className="flex gap-2 mt-3">
              {doctor.consultationTypes.includes("clinic") && (
                <span className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-lg">
                  <Building2 className="w-3 h-3" /> Clinic
                </span>
              )}
              {doctor.consultationTypes.includes("home") && (
                <span className="inline-flex items-center gap-1 text-xs bg-orange-50 text-orange-700 px-2 py-1 rounded-lg">
                  <Home className="w-3 h-3" /> Home
                </span>
              )}
            </div>
            {matchReasons.length > 0 && <div className="mt-3 rounded-xl bg-primary/5 px-3 py-2"><p className="text-[11px] font-semibold text-primary">Why this matches</p><p className="text-xs text-muted-foreground mt-0.5">{matchReasons.slice(0, 2).join(" · ")}</p></div>}

            <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
              <div>
                <div className="text-xs text-muted-foreground">Consultation Fee</div>
                <div className="text-base font-bold text-primary">₹{doctor.fee}</div>
              </div>
              <div className="flex gap-2">
                <a
                  href={`tel:${doctor.phone}`}
                  onClick={(e) => e.stopPropagation()}
                  className="w-9 h-9 rounded-xl border border-border flex items-center justify-center hover:bg-muted transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-foreground" />
                </a>
                <button
                  onClick={(e) => { e.stopPropagation(); navigate(`/book/${doctor.id}`); }}
                  className="bg-primary text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-primary/90 active:scale-95 transition-all"
                >
                  Book Now
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}
