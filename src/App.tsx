import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "@/context/AppContext";
import { AuthProvider } from "@/context/AuthContext";
import Index from "./pages/Index";
import StartProject from "./pages/StartProject";
import ServiceDetail from "./pages/ServiceDetail";
import ClientDashboard from "./pages/ClientDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import "@/styles/landing.css";
const queryClient = new QueryClient();
const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <AppProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/start-project" element={<ProtectedRoute><StartProject /></ProtectedRoute>} />
              <Route path="/services/:serviceId" element={<ServiceDetail />} />
              <Route path="/dashboard" element={<ProtectedRoute><ClientDashboard /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AppProvider>
    </AuthProvider>
  </QueryClientProvider>
);
export default App;
