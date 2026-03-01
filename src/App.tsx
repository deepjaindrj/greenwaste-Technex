import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "./components/AppLayout";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Scan from "./pages/Scan";
import Carbon from "./pages/Carbon";
import Rewards from "./pages/Rewards";
import Municipal from "./pages/Municipal";
import Predict from "./pages/Predict";
import Business from "./pages/Business";
import Leaderboard from "./pages/Leaderboard";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import RequestPickup from "./pages/RequestPickup";
import CollectionTracker from "./pages/CollectionTracker";
import CarbonMarket from "./pages/CarbonMarket";
import EsgMarket from "./pages/EsgMarket";
import Analytics from "./pages/Analytics";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/scan" element={<Scan />} />
            <Route path="/carbon" element={<Carbon />} />
            <Route path="/request-pickup" element={<RequestPickup />} />
            <Route path="/collection" element={<CollectionTracker />} />
            <Route path="/marketplace" element={<CarbonMarket />} />
            <Route path="/esg" element={<EsgMarket />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/municipal" element={<Municipal />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
            {/* Legacy redirects */}
            <Route path="/rewards" element={<Navigate to="/marketplace" replace />} />
            <Route path="/predict" element={<Navigate to="/analytics" replace />} />
            <Route path="/business" element={<Navigate to="/esg" replace />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
