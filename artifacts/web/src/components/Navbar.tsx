import { useState } from "react";
import { useLocation } from "wouter";
import { useClerk, useUser } from "@clerk/react";
import { Menu, X, Sparkles, UserRound } from "lucide-react";

export function Navbar() {
  const [, navigate] = useLocation();
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <button onClick={() => navigate("/")} className="flex items-center gap-2.5" aria-label="Go to Medofile home">
          <img src="/brand-mark.svg" alt="" className="w-9 h-9 rounded-xl shadow-sm" />
          <span className="text-xl font-bold tracking-tight text-foreground">
            Medo<span className="text-primary">file</span>
          </span>
        </button>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          <button onClick={() => navigate("/doctors")} className="text-sm font-medium text-foreground/70 hover:text-primary transition-colors">
            Find Doctors
          </button>
          <button onClick={() => navigate("/doctors")} className="text-sm font-medium text-foreground/70 hover:text-primary transition-colors">
            Specialists
          </button>
          <button
            onClick={() => navigate("/healthbot")}
            className="flex items-center gap-1.5 text-sm font-medium text-foreground/70 hover:text-primary transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            AI Assistant
          </button>
          <button onClick={() => navigate("/blog")} className="text-sm font-medium text-foreground/70 hover:text-primary transition-colors">
            Health Guides
          </button>
          {isLoaded && user ? <>
            <button onClick={() => navigate("/account")} className="flex items-center gap-1.5 text-primary text-sm font-semibold px-3 py-2 rounded-xl hover:bg-primary/10 transition-colors"><UserRound className="w-4 h-4" /> My care</button>
            <button onClick={() => signOut({ redirectUrl: import.meta.env.BASE_URL.replace(/\/$/, "") || "/" })} className="text-sm font-medium text-foreground/70 hover:text-primary transition-colors">Sign out</button>
          </> : <>
            <button onClick={() => navigate("/sign-in")} className="text-sm font-semibold text-foreground/70 hover:text-primary transition-colors">Sign in</button>
            <button onClick={() => navigate("/register")} className="text-primary text-sm font-semibold px-3 py-2 rounded-xl hover:bg-primary/10 transition-colors">Create account</button>
          </>}
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
            { label: "Specialists", href: "/doctors" },
            { label: "AI Health Assistant", href: "/healthbot" },
            { label: "Health Guides", href: "/blog" },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => { navigate(item.href); setOpen(false); }}
              className="block w-full text-left text-sm font-medium text-foreground/70 hover:text-primary py-2 transition-colors"
            >
              {item.label}
            </button>
          ))}
          {isLoaded && user ? <>
            <button onClick={() => { navigate("/account"); setOpen(false); }} className="w-full bg-primary text-white text-sm font-semibold py-3 rounded-xl">My care</button>
            <button onClick={() => { signOut({ redirectUrl: import.meta.env.BASE_URL.replace(/\/$/, "") || "/" }); setOpen(false); }} className="w-full text-sm font-semibold text-foreground py-2">Sign out</button>
          </> : <button onClick={() => { navigate("/register"); setOpen(false); }} className="w-full bg-primary text-white text-sm font-semibold py-3 rounded-xl">Create account</button>}
        </div>
      )}
    </nav>
  );
}
