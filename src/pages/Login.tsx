import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, User, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isTeacher, setIsTeacher] = useState(false);
  
  // Default to signup mode if path is /signup
  const [isLoginMode, setIsLoginMode] = useState(location.pathname !== "/signup");
  const { login } = useAuth();

  useEffect(() => {
    setIsLoginMode(location.pathname !== "/signup");
  }, [location.pathname]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (!isLoginMode && !name)) {
      return toast.error("Please fill in all required fields.");
    }
    
    try {
      const endpoint = isLoginMode ? "http://localhost:5000/api/auth/login" : "http://localhost:5000/api/auth/register";
      const body = isLoginMode 
        ? { email, password }
        : { name, email, password, role: isTeacher ? "teacher" : "student" };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      
      const data = await res.json();
      
      if (res.ok) {
        login(data.token, data);
        toast.success(isLoginMode ? `Welcome back, ${data.role}` : `Account created as ${data.role}`);
        navigate("/dashboard");
      } else {
        toast.error(data.message || "Authentication failed");
      }
    } catch (err) {
      toast.error("Network error connecting to backend");
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f2eb] relative overflow-hidden flex justify-center items-center font-sans">
      
      {/* Background blobs */}
      <div className="absolute top-0 left-1/4 w-[30rem] h-[30rem] bg-teal-400/10 rounded-full blur-[100px] -z-10" />
      <div className="absolute bottom-0 right-1/4 w-[30rem] h-[30rem] bg-orange-400/10 rounded-full blur-[100px] -z-10" />

      {/* Floating Back Button */}
      <div className="absolute top-8 left-8 z-20">
        <Button variant="ghost" className="flex items-center gap-2 hover:bg-black/5 rounded-full px-4" onClick={() => navigate("/")}>
          <ArrowLeft className="w-4 h-4" />
          <span className="font-semibold text-[#1e293b]">Back to Home</span>
        </Button>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-[440px] bg-[#fdfcf8] rounded-[40px] p-8 md:p-10 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.1)] border border-[#e8e6df] relative z-10 mx-6"
      >
        <div className="flex bg-[#edeae1] p-1.5 rounded-2xl mb-10 w-full relative">
          <button 
            className={`flex-1 py-3 text-[15px] font-bold rounded-[14px] transition-all duration-300 z-10 ${isLoginMode ? 'text-[#1a1f2e]' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => { setIsLoginMode(true); navigate("/login"); }}
          >
            Sign In
          </button>
          <button 
            className={`flex-1 py-3 text-[15px] font-bold rounded-[14px] transition-all duration-300 z-10 ${!isLoginMode ? 'text-[#1a1f2e]' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => { setIsLoginMode(false); navigate("/signup"); }}
          >
            Sign Up
          </button>
          <div 
            className={`absolute top-1.5 bottom-1.5 w-[calc(50%-0.375rem)] bg-white rounded-[14px] shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-transform duration-300 ease-in-out`}
            style={{ transform: isLoginMode ? 'translateX(0)' : 'translateX(100%)', left: '0.375rem' }}
          />
        </div>
        
        <div className="mb-8 text-center">
          <h2 className="text-[32px] font-serif text-[#161f2e] mb-2 tracking-tight">
            {isLoginMode ? "Welcome Back" : "Create Account"}
          </h2>
          <p className="text-[#64748b] text-[15px]">
            {isLoginMode ? "Enter your details to access your dashboard." : "Join us to transform your educational experience."}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-5">
          {!isLoginMode && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2"
            >
              <Label htmlFor="name" className="text-[14px] font-bold text-[#161f2e]">Full Name</Label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#889fb8] transition-colors group-focus-within:text-[#337a6c]" />
                <Input
                  id="name" type="text" placeholder="John Doe"
                  value={name} onChange={(e) => setName(e.target.value)}
                  className="pl-12 h-14 rounded-xl bg-[#eef3fd] border-transparent text-[#1e293b] placeholder:text-[#889fb8] focus:bg-white focus:border-[#337a6c] focus:ring-1 focus:ring-[#337a6c] hover:bg-[#e6edfa] transition-all shadow-sm"
                />
              </div>
            </motion.div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="email" className="text-[14px] font-bold text-[#161f2e]">Email Address</Label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#889fb8] transition-colors group-focus-within:text-[#337a6c]" />
              <Input
                id="email" type="email" placeholder="teacher@school.edu"
                value={email} onChange={(e) => setEmail(e.target.value)}
                className="pl-12 h-14 rounded-xl bg-[#eef3fd] border-transparent text-[#1e293b] placeholder:text-[#889fb8] focus:bg-white focus:border-[#337a6c] focus:ring-1 focus:ring-[#337a6c] hover:bg-[#e6edfa] transition-all shadow-sm"
              />
            </div>
          </div>
          
          <div className="space-y-2">
             <div className="flex justify-between items-center">
               <Label htmlFor="password" className="text-[14px] font-bold text-[#161f2e]">Password</Label>
               {isLoginMode && (
                 <a href="#" className="text-[13px] font-bold text-[#357b6f] hover:text-[#255f55] transition-colors">Forgot password?</a>
               )}
             </div>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#889fb8] transition-colors group-focus-within:text-[#337a6c]" />
              <Input
                id="password" type="password" placeholder="••••••••"
                value={password} onChange={(e) => setPassword(e.target.value)}
                className="pl-12 h-14 rounded-xl bg-[#eef3fd] border-transparent text-[#1e293b] placeholder:text-[#889fb8] focus:bg-white focus:border-[#337a6c] focus:ring-1 focus:ring-[#337a6c] hover:bg-[#e6edfa] transition-all shadow-sm"
              />
            </div>
          </div>

          {!isLoginMode && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center space-x-3 pt-2"
            >
              <div className="relative flex items-start">
                <div className="flex h-6 items-center">
                  <input
                    type="checkbox" id="isTeacher"
                    checked={isTeacher} onChange={(e) => setIsTeacher(e.target.checked)}
                    className="h-5 w-5 rounded border-[#e2e1d7] text-[#367a6d] focus:ring-[#367a6d] bg-white transition-colors cursor-pointer"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <Label htmlFor="isTeacher" className="font-bold text-[#161f2e] cursor-pointer">I am a Teacher</Label>
                  <p className="text-[#64748b] text-[12px] mt-0.5">Select this to access educator tools.</p>
                </div>
              </div>
            </motion.div>
          )}

          <Button type="submit" className="w-full h-14 rounded-xl bg-[#367a6d] hover:bg-[#2c685b] text-white font-bold text-[16px] transition-all hover:-translate-y-0.5 mt-6 shadow-[0_6px_20px_rgba(54,122,109,0.25)]">
            {isLoginMode ? "Sign In" : "Create Account"}
          </Button>
          
          <div className="relative py-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-[#eae8db]" />
            </div>
            <div className="relative flex justify-center text-[12px] uppercase font-bold tracking-widest text-[#818f9c]">
              <span className="bg-[#fdfcf8] px-4">Or</span>
            </div>
          </div>
          
          <Button
            type="button" variant="outline"
            className="w-full h-14 rounded-xl border border-[#eae8db] font-bold text-[#1e293b] flex items-center justify-center gap-3 bg-white hover:bg-[#fcfbf7] transition-colors shadow-sm text-[15px]"
            onClick={() => window.location.href = "http://localhost:5000/api/auth/google"}
          >
            <svg viewBox="0 0 24 24" className="w-[18px] h-[18px]" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Continue with Google
          </Button>
        </form>
      </motion.div>
    </div>
  );
};

export default Login;

