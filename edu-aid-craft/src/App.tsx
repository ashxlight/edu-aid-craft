import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/AuthContext";
import { ProcessProvider } from "@/context/ProcessContext";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import AuthSuccess from "./pages/AuthSuccess";
import AppLayout from "./components/AppLayout";
import Dashboard from "./pages/Dashboard";
import StudentProfile from "./pages/StudentProfile";
import Customize from "./pages/Customize";
import Output from "./pages/Output";
import History from "./pages/History";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Library from "./pages/Library";
import ADHDGame from "./pages/ADHDGame";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <ProcessProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Login />} />
            <Route path="/auth/success" element={<AuthSuccess />} />
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/library" element={<Library />} />
              <Route path="/profile" element={<StudentProfile />} />
              <Route path="/customize" element={<Customize />} />
              <Route path="/output" element={<Output />} />
              <Route path="/history" element={<History />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
            <Route path="/adhd-game" element={<ADHDGame />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        </ProcessProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
