
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AdminLayout } from "./components/AdminLayout";
import { AdminLogin } from "./pages/admin/AdminLogin";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { UserManagement } from "./pages/admin/UserManagement";
import { UserDetails } from "./pages/admin/UserDetails";
import { PaymentVerification } from "./pages/admin/PaymentVerification";
import { PayoutProcessing } from "./pages/admin/PayoutProcessing";
import { ResultDeclaration } from "./pages/admin/ResultDeclaration";
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
                  <Route path="users" element={<UserManagement />} />
                  <Route path="users/:userId" element={<UserDetails />} />
                  <Route path="games" element={<div className="p-8 text-center text-gray-500">Game Management - Coming Soon</div>} />
                  <Route path="results" element={<ResultDeclaration />} />
                  <Route path="payments" element={<PaymentVerification />} />
                  <Route path="payouts" element={<PayoutProcessing />} />
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
