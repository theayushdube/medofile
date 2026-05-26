import { useState } from "react";
import { useLocation } from "wouter";
import { Menu, X, Phone } from "lucide-react";

export function Navbar() {
  const [, navigate] = useLocation();
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <button onClick={() => navigate("/")} className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">M</span>
          </div>
          <span className="text-xl font-bold text-foreground">
            Medo<span className="text-primary">file</span>
          </span>
        </button>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          <button onClick={() => navigate("/doctors")} className="text-sm font-medium text-foreground/70 hover:text-primary transition-colors">
            Find Doctors
          </button>
          <button onClick={() => navigate("/doctors?type=video")} className="text-sm font-medium text-foreground/70 hover:text-primary transition-colors">
            Video Consult
          </button>
          <button onClick={() => navigate("/doctors")} className="text-sm font-medium text-foreground/70 hover:text-primary transition-colors">
            Specialists
          </button>
          <div className="w-px h-4 bg-border" />
          <button
            onClick={() => navigate("/admin")}
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            Admin
          </button>
          <button
            onClick={() => navigate("/doctors")}
            className="bg-primary text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-primary/90 transition-colors"
          >
            Book Appointment
          </button>
        </div>

        {/* Mobile hamburger */}
        <button className="md:hidden" onClick={() => setOpen(!open)}>
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-border bg-white px-4 py-4 space-y-3">
          {[
            { label: "Find Doctors", href: "/doctors" },
            { label: "Video Consult", href: "/doctors?type=video" },
            { label: "Specialists", href: "/doctors" },
            { label: "Admin Panel", href: "/admin" },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => { navigate(item.href); setOpen(false); }}
              className="block w-full text-left text-sm font-medium text-foreground/70 hover:text-primary py-2 transition-colors"
            >
              {item.label}
            </button>
          ))}
          <button
            onClick={() => { navigate("/doctors"); setOpen(false); }}
            className="w-full bg-primary text-white text-sm font-semibold py-3 rounded-xl"
          >
            Book Appointment
          </button>
        </div>
      )}
    </nav>
  );
}
