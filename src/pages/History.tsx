import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { FileText, Clock, UploadCloud, Sparkles } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const History = () => {
  const { token, user } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/history", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setItems(data.history);
        }
      } catch (err) {
        toast.error("Failed to load history.");
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchHistory();
  }, [token]);

  return (
    <div className="flex-1 p-4 md:p-8 space-y-8 max-w-4xl mx-auto w-full">
      <div className="space-y-2">
        <h1 className="text-4xl font-serif text-foreground">
          {user?.role === 'teacher' ? 'Upload' : 'Conversion'} <span className="heading-underline">History</span>
        </h1>
        <p className="text-muted-foreground">Your past {user?.role === 'teacher' ? 'actions and uploads' : 'content conversions'}.</p>
      </div>
      
      {loading ? (
        <div className="animate-pulse space-y-4">
          {[1,2,3].map(i => <div key={i} className="h-20 bg-card/50 rounded-2xl"></div>)}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center p-8 text-muted-foreground border rounded-2xl bg-card/30">
          No history found. Start using the system!
        </div>
      ) : (
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item._id} className="bg-popover rounded-2xl p-5 border border-border/50 hover:shadow-md transition-shadow cursor-pointer flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-light flex items-center justify-center shrink-0">
              {item.action === 'upload' ? <UploadCloud className="w-5 h-5 text-teal" /> : <Sparkles className="w-5 h-5 text-teal" />}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-foreground">{item.title}</h3>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {new Date(item.createdAt).toLocaleDateString()}
                </span>
                
                {item.action === 'upload' && (
                   <Badge className="text-xs bg-orange/20 text-orange border-0 rounded-full px-3">Uploaded</Badge>
                )}

                {item.metadata?.disability && (
                  <Badge className="text-xs bg-teal-light text-teal border-0 rounded-full px-3">{item.metadata.disability}</Badge>
                )}
                
                {item.metadata?.formats?.map((f: string) => (
                  <Badge key={f} variant="outline" className="text-xs rounded-full px-3">{f}</Badge>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
      )}
    </div>
  );
};
export default History;
