import { useAuth } from "@/context/AuthContext";
import { StudentDashboard } from "./Dashboard";

const Library = () => {
  const { token, user } = useAuth();
  
  if (user?.role !== "teacher") {
    return <div className="p-8 text-center text-muted-foreground">Access Restricted: Teachers Only.</div>;
  }

  return (
    <div className="flex-1 p-4 md:p-8 space-y-8 max-w-5xl mx-auto w-full">
      <div className="mb-4 text-orange font-semibold text-sm px-4 py-2 bg-orange/10 rounded-xl border border-orange/20 inline-block">
        Teacher Review Mode: You are viewing the platform exactly as a student sees it.
      </div>
      <StudentDashboard token={token} />
    </div>
  );
};

export default Library;
