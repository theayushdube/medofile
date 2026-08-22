import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ClerkProvider, SignIn, SignUp } from "@clerk/react";
import { publishableKeyFromHost } from "@clerk/react/internal";
import { shadcn } from "@clerk/themes";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Suspense, lazy, type ReactNode } from "react";
import { MessageCircle } from "lucide-react";
import NotFound from "@/pages/not-found";

const Home = lazy(() => import("@/pages/Home"));
const DoctorProfile = lazy(() => import("@/pages/DoctorProfile"));
const DoctorList = lazy(() => import("@/pages/DoctorList"));
const Booking = lazy(() => import("@/pages/Booking"));
const AdminPanel = lazy(() => import("@/pages/AdminPanel"));
const HealthBot = lazy(() => import("@/pages/HealthBot"));
const Register = lazy(() => import("@/pages/Register"));
const DoctorProfileManager = lazy(() => import("@/pages/DoctorProfileManager"));
const Account = lazy(() => import("@/pages/Account"));
const BlogIndex = lazy(() => import("@/pages/BlogIndex"));
const BlogArticle = lazy(() => import("@/pages/BlogArticle"));

const queryClient = new QueryClient();
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");
const clerkPubKey = publishableKeyFromHost(window.location.hostname, import.meta.env.VITE_CLERK_PUBLISHABLE_KEY);
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;

const clerkAppearance = {
  theme: shadcn,
  options: { logoPlacement: "inside" as const, logoLinkUrl: basePath || "/", logoImageUrl: `${window.location.origin}${basePath}/logo.svg` },
  variables: { colorPrimary: "#0A56B7", colorForeground: "#17324d", colorMutedForeground: "#64748b", colorBackground: "#ffffff", colorInput: "#f8fafc", colorInputForeground: "#17324d", colorNeutral: "#d9e2ef", fontFamily: "Inter, sans-serif", borderRadius: "0.875rem" },
  elements: { cardBox: "bg-white rounded-2xl w-[440px] max-w-full overflow-hidden shadow-xl", card: "!shadow-none !border-0 !bg-transparent", footer: "!shadow-none !border-0 !bg-transparent", headerTitle: "text-foreground", headerSubtitle: "text-muted-foreground", formFieldLabel: "text-foreground", footerActionLink: "text-primary", footerActionText: "text-muted-foreground", dividerText: "text-muted-foreground", formButtonPrimary: "bg-primary", formFieldInput: "bg-slate-50 border-slate-200", socialButtonsBlockButton: "border-slate-200", socialButtonsBlockButtonText: "text-foreground" },
};

const clerkLocalization = {
  signIn: {
    start: {
      title: "Sign in to Medofile",
      subtitle: "Welcome back. Continue to your Medofile account.",
    },
  },
  signUp: {
    start: {
      title: "Create your Medofile account",
      subtitle: "Set up a secure account for your care journey.",
    },
  },
};

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-muted-foreground font-medium">Loading Medofile...</span>
      </div>
    </div>
  );
}

function Router() {
  const authCard = (content: ReactNode, footer?: ReactNode) => (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-[440px]">
        <div className="text-center mb-5">
          <p className="text-sm font-semibold tracking-wide text-primary">Medofile</p>
          <h1 className="text-2xl font-bold text-foreground mt-2">Your care, connected</h1>
          <p className="text-sm text-muted-foreground mt-1">One secure account for patients and doctors.</p>
        </div>
        {content}
        {footer}
      </div>
    </div>
  );

  return (
    <Suspense fallback={<LoadingFallback />}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/doctors" component={DoctorList} />
        <Route path="/doctors/:id" component={DoctorProfile} />
        <Route path="/book/:doctorId" component={Booking} />
        <Route path="/admin" component={AdminPanel} />
        <Route path="/healthbot" component={HealthBot} />
        <Route path="/register" component={Register} />
        <Route path="/account" component={Account} />
        <Route path="/blog" component={BlogIndex} />
        <Route path="/blog/:slug" component={BlogArticle} />
        <Route path="/sign-in/*?">{() => authCard(
          <SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} />,
          <p className="text-center text-sm text-muted-foreground mt-4">Are you a doctor? <a className="font-semibold text-primary hover:underline" href={`${basePath}/register?role=doctor`}>Join Medofile as a doctor</a></p>,
        )}</Route>
        <Route path="/sign-up/*?">{() => {
          const doctorSignup = new URLSearchParams(window.location.search).get("role") === "doctor";
          const redirect = `${basePath}/register?role=${doctorSignup ? "doctor" : "patient"}`;
          return authCard(
            <>
              <div className="text-center mb-4">
                <p className="text-xs font-semibold uppercase tracking-[.16em] text-primary">{doctorSignup ? "Doctor registration" : "Patient registration"}</p>
                <h2 className="text-lg font-bold text-foreground mt-1">{doctorSignup ? "Create your Medofile doctor account" : "Create your Medofile account"}</h2>
              </div>
              <SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} fallbackRedirectUrl={redirect} />,
            </>,
            <p className="text-center text-sm text-muted-foreground mt-4">{doctorSignup ? "Looking for patient care?" : "Are you a doctor?"} <a className="font-semibold text-primary hover:underline" href={`${basePath}/sign-up?role=${doctorSignup ? "patient" : "doctor"}`}>{doctorSignup ? "Create a patient account" : "Register as a doctor"}</a></p>,
          );
        }}</Route>
        <Route path="/doctor-profile/manage/:id" component={DoctorProfileManager} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function FloatingAssistant() {
  const [, navigate] = useLocation();
  return (
    <button
      onClick={() => navigate("/healthbot")}
      className="fixed bottom-5 right-5 z-50 group flex items-center gap-3 rounded-2xl bg-[#0D1B2A] text-white px-4 py-3 shadow-2xl shadow-blue-950/25 hover:bg-primary transition-colors"
      aria-label="Open Medofile AI Assistant"
    >
      <span className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-[#00C897] text-[#062C2A]">
        <MessageCircle className="w-5 h-5" />
        <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-red-500 ring-2 ring-[#0D1B2A]" />
      </span>
      <span className="text-left">
        <span className="block text-xs font-semibold text-[#8FE8D2]">Medofile AI</span>
        <span className="block text-sm font-semibold">Get your problem solved</span>
      </span>
    </button>
  );
}

function App() {
  const [, setLocation] = useLocation();
  return (
    <ClerkProvider publishableKey={clerkPubKey} proxyUrl={clerkProxyUrl} appearance={clerkAppearance} localization={clerkLocalization} signInUrl={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} routerPush={(to) => setLocation(to.replace(basePath, "") || "/")} routerReplace={(to) => setLocation(to.replace(basePath, "") || "/", { replace: true })}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Router />
          <FloatingAssistant />
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

export default function AppWithRouter() {
  return <WouterRouter base={basePath}><App /></WouterRouter>;
}
