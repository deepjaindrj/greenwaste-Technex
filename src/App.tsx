import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
            <Route path="/rewards" element={<Rewards />} />
            <Route path="/municipal" element={<Municipal />} />
            <Route path="/predict" element={<Predict />} />
            <Route path="/business" element={<Business />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;