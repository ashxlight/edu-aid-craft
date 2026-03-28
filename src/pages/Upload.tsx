import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload as UploadIcon, FileText } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const Upload = () => {
  const { token, user } = useAuth();
  const [localText, setLocalText] = useState("");
  const [localFile, setLocalFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [standard, setStandard] = useState("1");
  const [isUploading, setIsUploading] = useState(false);

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

  if (user?.role !== "teacher") {
    return <div className="p-8 text-center text-muted-foreground">Access Restricted: Teachers Only.</div>;
  }

  return (
    <div className="flex-1 p-4 md:p-8 space-y-8 max-w-5xl mx-auto w-full">
      <div className="space-y-2">
        <h1 className="text-4xl font-serif text-foreground">
          Teacher <span className="heading-underline">Upload</span>
        </h1>
        <p className="text-muted-foreground">Add curated learning material specific to a class standard.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 bg-popover rounded-2xl p-6 border border-border/50">
        <div className="space-y-2 col-span-1 border-r border-border/50 pr-6">
          <Label htmlFor="topicTitle" className="text-sm font-medium">Heading of Topic <span className="text-orange">*</span></Label>
          <Input 
             id="topicTitle" 
             placeholder="E.g. The Solar System" 
             value={title} 
             onChange={(e) => setTitle(e.target.value)} 
             className="h-11 rounded-xl bg-card" 
          />
        </div>
        <div className="space-y-2 col-span-1 pl-2">
          <Label htmlFor="standard" className="text-sm font-medium">Standard / Grade <span className="text-orange">*</span></Label>
          <select 
             id="standard" 
             className="flex h-11 w-full items-center justify-between rounded-xl border border-input bg-card px-3 py-2 text-sm text-foreground ring-offset-background outline-none focus:ring-1 focus:ring-teal"
             value={standard} 
             onChange={(e) => setStandard(e.target.value)}
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map(num => (
              <option key={num} value={num}>Grade / Standard {num}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-popover rounded-2xl p-6 border border-border/50">
          <div className="flex items-center gap-2 mb-4">
            <UploadIcon className="w-5 h-5 text-teal" />
            <h3 className="font-bold text-foreground text-lg font-sans">Upload Content</h3>
          </div>
          <label className="flex flex-col items-center justify-center h-44 rounded-2xl border-2 border-dashed border-border hover:border-teal/50 cursor-pointer transition-colors bg-card/50">
            <div className="w-14 h-14 rounded-2xl bg-teal-light flex items-center justify-center mb-3">
              <UploadIcon className="w-6 h-6 text-teal" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">
              {localFile?.name || "Drop PDF, DOC, DOCX or TXT here"}
            </span>
            <span className="text-xs text-muted-foreground mt-1">or click to browse</span>
            <input type="file" className="hidden" accept=".pdf,.doc,.docx,.txt" onChange={handleFileChange} />
          </label>
        </div>

        <div className="bg-popover rounded-2xl p-6 border border-border/50">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-orange" />
            <h3 className="font-bold text-foreground text-lg font-sans">Paste Text</h3>
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
        <UploadIcon className="w-4 h-4" /> {isUploading ? "Uploading..." : "Upload Context to System"}
      </Button>
    </div>
  );
};

export default Upload;
