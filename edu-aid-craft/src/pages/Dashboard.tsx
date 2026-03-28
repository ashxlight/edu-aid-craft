import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Upload, FileText, Sparkles, Clock, BarChart3, ArrowUpRight, BookOpen, User, Zap } from "lucide-react";
import StepIndicator from "@/components/StepIndicator";
import { useProcess } from "@/context/ProcessContext";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const STEPS = ["Source", "Profile", "Customize", "Output"];

const TeacherDashboard = ({ token }: { token: string | null }) => {
  const [stats, setStats] = useState({ total: 0, thisWeek: 0, formatsCount: 0 });
  const [documents, setDocuments] = useState<any[]>([]);

  // Upload state
  const [localText, setLocalText] = useState("");
  const [localFile, setLocalFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [standard, setStandard] = useState("1");
  const [isUploading, setIsUploading] = useState(false);

  const fetchDocsAndStats = () => {
    if (token) {
      fetch("http://localhost:5000/api/history", { headers: { Authorization: `Bearer ${token}` } })
        .then(res => res.json())
        .then(data => setStats(data.stats))
        .catch(() => {});
        
      fetch("http://localhost:5000/api/documents", { headers: { Authorization: `Bearer ${token}` } })
        .then(res => res.json())
        .then(data => setDocuments(data))
        .catch(() => {});
    }
  };

  useEffect(() => {
    fetchDocsAndStats();
  }, [token]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setLocalFile(file);
  };

  const handleUpload = async () => {
    if (!title) return toast.error("Topic heading is required.");
    if (!localText && !localFile) return toast.error("Either text or a file must be provided.");
    
    setIsUploading(true);
    const formData = new FormData();
    if (localFile) formData.append("file", localFile);
    if (localText) formData.append("text", localText);
    formData.append("title", title);
    formData.append("standard", standard);
    formData.append("gradeLevel", "Medium");

    try {
      const res = await fetch("http://localhost:5000/api/documents/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (res.ok) {
        toast.success("Content uploaded successfully to the system database!");
        setLocalText("");
        setLocalFile(null);
        setTitle("");
        fetchDocsAndStats(); // Refresh grid and stats
      } else {
        const err = await res.json();
        toast.error(err.message || "Failed to upload content");
      }
    } catch (e) {
      toast.error("Network error during upload");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-serif text-foreground">
          Analytics & <span className="heading-underline">Upload</span>
        </h1>
        <p className="text-muted-foreground">Monitor the impact of your materials and add new curated content specific to a class standard.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: FileText, label: "Total Uploads", value: stats.total, iconColor: "text-teal" },
          { icon: Clock, label: "Uploads This Week", value: stats.thisWeek, iconColor: "text-orange" },
        ].map((stat) => (
          <div key={stat.label} className="bg-popover rounded-2xl p-5 border border-border/50 flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-card flex items-center justify-center">
              <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
            </div>
            <div>
              <p className="text-3xl font-serif text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <h2 className="text-2xl font-serif mt-8 mb-4">Upload New Material</h2>
      
      <div className="grid md:grid-cols-2 gap-6 bg-popover rounded-2xl p-6 border border-border/50">
        <div className="space-y-2 col-span-1 border-r border-border/50 pr-6">
          <label htmlFor="topicTitle" className="text-sm font-medium">Heading of Topic <span className="text-orange">*</span></label>
          <input 
             id="topicTitle" 
             placeholder="E.g. The Solar System" 
             value={title} 
             onChange={(e) => setTitle(e.target.value)} 
             className="flex h-11 w-full rounded-xl border border-input bg-card px-3 py-2 text-sm text-foreground ring-offset-background outline-none focus:ring-1 focus:ring-teal" 
          />
        </div>
        <div className="space-y-2 col-span-1 pl-2">
          <label htmlFor="standard" className="text-sm font-medium">Standard / Grade <span className="text-orange">*</span></label>
          <select 
             id="standard" 
             className="flex h-11 w-full items-center justify-between rounded-xl border border-input bg-card px-3 py-2 text-sm text-foreground ring-offset-background outline-none focus:ring-1 focus:ring-teal"
             value={standard} 
             onChange={(e) => setStandard(e.target.value)}
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map(num => (
              <option key={num} value={num}>Standard {num}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-popover rounded-2xl p-6 border border-border/50">
          <div className="flex items-center gap-2 mb-4">
            <Upload className="w-5 h-5 text-teal" />
            <h3 className="font-bold text-foreground text-lg font-sans">File Content</h3>
          </div>
          <label className="flex flex-col items-center justify-center h-44 rounded-2xl border-2 border-dashed border-border hover:border-teal/50 cursor-pointer transition-colors bg-card/50">
            <div className="w-14 h-14 rounded-2xl bg-teal-light flex items-center justify-center mb-3">
              <Upload className="w-6 h-6 text-teal" />
            </div>
            <span className="text-sm font-medium text-muted-foreground text-center px-4">
              {localFile?.name || "Drop PDF, DOC, DOCX or TXT here"}
            </span>
            <input type="file" className="hidden" accept=".pdf,.doc,.docx,.txt" onChange={handleFileChange} />
          </label>
        </div>

        <div className="bg-popover rounded-2xl p-6 border border-border/50">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-orange" />
            <h3 className="font-bold text-foreground text-lg font-sans">Pasted Text</h3>
          </div>
          <Textarea
            placeholder="Paste your learning content here..."
            value={localText} onChange={(e) => setLocalText(e.target.value)}
            className="h-44 resize-none rounded-2xl bg-card/50 border-border"
          />
        </div>
      </div>
      <Button
        className="bg-teal hover:bg-teal-dark text-primary-foreground rounded-full px-8 h-12 text-base font-semibold shadow-lg gap-2"
        onClick={handleUpload}
        disabled={!title || (!localText && !localFile) || isUploading}
      >
        <Upload className="w-4 h-4" /> {isUploading ? "Uploading..." : "Upload Context to System"}
      </Button>

      <h2 className="text-2xl font-serif mt-12 mb-4 border-t border-border pt-8">Your Recent Documents</h2>
      {documents.length === 0 ? (
        <div className="text-muted-foreground text-center p-8 bg-card rounded-2xl">You haven't uploaded any documents yet.</div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.map((doc) => (
            <div key={doc._id} className="bg-popover rounded-2xl p-6 border border-border/50 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-teal-light flex items-center justify-center mb-4">
                <BookOpen className="w-5 h-5 text-teal" />
              </div>
              <h3 className="font-bold text-foreground text-lg truncate">{doc.title}</h3>
              <div className="mt-4 flex items-center justify-between text-xs font-semibold">
                <span className="text-teal bg-teal-light px-2 py-1 rounded-md">Std {doc.standard || '?'}</span>
                <span className="text-muted-foreground">{new Date(doc.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const StudentDashboard = ({ token }: { token: string | null }) => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, thisWeek: 0, formatsCount: 0 });
  const [filterStandard, setFilterStandard] = useState("All");
  const { setData } = useProcess();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) return;
    const fetchDocs = async () => {
      setIsLoading(true);
      try {
        const url = filterStandard !== "All" 
          ? `http://localhost:5000/api/documents?standard=${filterStandard}` 
          : `http://localhost:5000/api/documents`;
        const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) setDocuments(await res.json());
      } catch (err) { toast.error("Failed to fetch available documents"); } 
      finally { setIsLoading(false); }
    };
    
    fetchDocs();
  }, [filterStandard, token]);

  useEffect(() => {
    if (!token) return;
    // Fetch Stats
    fetch("http://localhost:5000/api/history", { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => setStats(data.stats))
      .catch(() => {});
  }, [token]);

  const selectDocument = async (id: string, title: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/documents/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const doc = await res.json();
        setData({ text: doc.content, file: null, documentTitle: title, documentId: id });
        navigate("/profile");
      }
    } catch(err) {
      toast.error("Failed to load document content.");
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-serif text-foreground">
          Student <span className="heading-underline">Library</span>
        </h1>
        <p className="text-muted-foreground">Select a file uploaded by your teachers to begin generating adapted content.</p>
      </div>

      {/* ── ADHD Special Section ── */}
      <div className="bg-gradient-to-br from-red-500/10 to-orange-500/10 border-2 border-red-500/20 rounded-[2.5rem] p-8 relative overflow-hidden group">
         <div className="absolute -right-12 -top-12 w-48 h-48 bg-red-500/5 rounded-full blur-3xl group-hover:bg-red-500/10 transition-colors" />
         <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
            <div className="w-24 h-24 bg-red-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-red-500/30 rotate-3 group-hover:rotate-0 transition-transform">
               <Zap className="w-12 h-12 text-white fill-white" />
            </div>
            <div className="flex-1 text-center md:text-left">
               <div className="inline-block px-3 py-1 rounded-full bg-red-500 text-white text-[10px] font-black uppercase tracking-widest mb-2">Specialized for ADHD</div>
               <h2 className="text-3xl font-black text-foreground mb-2">ADHD Racing Adventure</h2>
               <p className="text-muted-foreground max-w-lg">An interactive, voice-controlled learning game designed to improve focus and pronunciation through gamified racing.</p>
            </div>
            <Button 
               onClick={() => navigate("/adhd-game")}
               className="bg-red-500 hover:bg-red-600 text-white rounded-full px-10 h-14 text-lg font-bold shadow-xl shadow-red-500/20 transition-all hover:scale-105"
            >
               START RACING <ArrowUpRight className="ml-2 w-5 h-5" />
            </Button>
         </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: FileText, label: "Total Conversions", value: stats.total, iconColor: "text-teal" },
          { icon: Clock, label: "This Week", value: stats.thisWeek, iconColor: "text-orange" },
          { icon: BarChart3, label: "Unique Formats", value: stats.formatsCount, iconColor: "text-teal" },
        ].map((stat) => (
          <div key={stat.label} className="bg-popover rounded-2xl p-5 border border-border/50 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-card flex items-center justify-center">
              <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
            </div>
            <div>
              <p className="text-3xl font-serif text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex justify-between items-center mt-6">
         <h2 className="text-2xl font-serif">Available Materials</h2>
         <div className="flex items-center gap-2">
           <span className="text-sm font-medium">Filter by Class:</span>
           <select 
             className="h-10 rounded-xl border border-input bg-card px-3 py-2 text-sm focus:ring-1 focus:ring-teal"
             value={filterStandard} 
             onChange={(e) => setFilterStandard(e.target.value)}
           >
             <option value="All">All Standards</option>
             {Array.from({ length: 12 }, (_, i) => i + 1).map(num => (
               <option key={num} value={num}>Standard {num}</option>
             ))}
           </select>
         </div>
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-4">
          {[1,2,3].map(i => <div key={i} className="h-24 bg-card/50 rounded-2xl"></div>)}
        </div>
      ) : documents.length === 0 ? (
        <div className="text-muted-foreground text-center p-8 bg-card rounded-2xl">No documents uploaded for this standard yet.</div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.map((doc) => (
            <div key={doc._id} onClick={() => selectDocument(doc._id, doc.title)} className="bg-popover hover:bg-card cursor-pointer rounded-2xl p-6 border border-border/50 transition-colors shadow-sm group relative">
              <div className="w-12 h-12 rounded-2xl bg-teal-light flex items-center justify-center mb-4 group-hover:bg-teal group-hover:text-white transition-colors">
                <BookOpen className="w-5 h-5 text-teal group-hover:text-white" />
              </div>
              <h3 className="font-bold text-foreground text-lg truncate mr-8">{doc.title}</h3>
              <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                 <User className="w-3 h-3" /> {doc.uploadedBy?.name || "Unknown Teacher"}
              </p>
              <div className="mt-4 flex items-center justify-between text-xs font-semibold">
                <span className="text-teal bg-teal-light px-2 py-1 rounded-md">Std {doc.standard || '?'}</span>
                
                {/* Quick ADHD Game Mode */}
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setData({ text: doc.content, file: null, documentTitle: doc.title, documentId: doc._id });
                    navigate("/adhd-game");
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-all font-black shadow-lg shadow-red-500/10"
                >
                   <Zap className="w-3 h-3 fill-white" /> ADHD GAME
                </button>
              </div>
              <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowUpRight className="w-5 h-5 text-teal" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const Dashboard = () => {
  const { user, token } = useAuth();
  
  return (
    <div className="flex-1 p-4 md:p-8 space-y-8 max-w-5xl mx-auto w-full">
      {user?.role === "student" && <StepIndicator steps={STEPS} currentStep={0} />}
      {user?.role === "teacher" ? <TeacherDashboard token={token} /> : <StudentDashboard token={token} />}
    </div>
  );
};

export default Dashboard;
