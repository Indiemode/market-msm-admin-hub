
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AdminLayout } from "./components/AdminLayout";
import { AdminLogin } from "./pages/admin/AdminLogin";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { useAuthStore } from "./stores/authStore";
import { useEffect } from "react";

const queryClient = new QueryClient();

const App = () => {
  const { initializeAuth } = useAuthStore();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Redirect root to admin dashboard */}
            <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
            
            {/* Admin Authentication */}
            <Route path="/admin/login" element={<AdminLogin />} />
            
            {/* Protected Admin Routes */}
            <Route path="/admin/*" element={
              <AdminLayout>
                <Routes>
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="users" element={<div className="p-8 text-center text-gray-500">User Management - Coming Soon</div>} />
                  <Route path="games" element={<div className="p-8 text-center text-gray-500">Game Management - Coming Soon</div>} />
                  <Route path="results" element={<div className="p-8 text-center text-gray-500">Result Declaration - Coming Soon</div>} />
                  <Route path="payments" element={<div className="p-8 text-center text-gray-500">Payment Verification - Coming Soon</div>} />
                  <Route path="payouts" element={<div className="p-8 text-center text-gray-500">Payout Processing - Coming Soon</div>} />
                  <Route path="logs" element={<div className="p-8 text-center text-gray-500">Flags & Monitoring - Coming Soon</div>} />
                </Routes>
              </AdminLayout>
            } />
            
            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
