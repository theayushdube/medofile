import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ClerkProvider, SignIn, SignUp } from "@clerk/react";
import { publishableKeyFromHost } from "@clerk/react/internal";
import { shadcn } from "@clerk/themes";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Suspense, lazy } from "react";
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
        <Route path="/sign-in/*?">{() => <div className="min-h-screen bg-background flex items-center justify-center px-4"><SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} /></div>}</Route>
        <Route path="/sign-up/*?">{() => <div className="min-h-screen bg-background flex items-center justify-center px-4"><SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} /></div>}</Route>
        <Route path="/doctor-profile/manage/:id" component={DoctorProfileManager} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  const [, setLocation] = useLocation();
  return (
    <ClerkProvider publishableKey={clerkPubKey} proxyUrl={clerkProxyUrl} appearance={clerkAppearance} signInUrl={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} routerPush={(to) => setLocation(to.replace(basePath, "") || "/")} routerReplace={(to) => setLocation(to.replace(basePath, "") || "/", { replace: true })}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Router />
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

export default function AppWithRouter() {
  return <WouterRouter base={basePath}><App /></WouterRouter>;
}
