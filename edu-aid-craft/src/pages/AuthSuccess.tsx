import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";

const AuthSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get("token");
    const userId = searchParams.get("userId");

    if (token) {
      // Store authentication data
      localStorage.setItem("token", token);
      if (userId) localStorage.setItem("userId", userId);
      
      // Successfully authenticated, hit the dashboard via full reload to hydrate context
      window.location.href = "/dashboard";
    } else {
      // Missing token, fallback to login
      window.location.href = "/";
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-16 h-16 rounded-3xl bg-teal-light flex items-center justify-center animate-pulse-soft mb-6">
        <Loader2 className="w-8 h-8 text-teal animate-spin" />
      </div>
      <h2 className="text-2xl font-serif text-foreground">Signing you in...</h2>
      <p className="text-muted-foreground text-sm mt-2">Connecting securely to Google.</p>
    </div>
  );
};

export default AuthSuccess;
