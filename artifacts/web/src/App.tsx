import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
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

const queryClient = new QueryClient();

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
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
