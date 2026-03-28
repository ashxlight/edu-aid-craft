import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, Download, Volume2, FileText, Loader2, Presentation, Braces, Square, Sparkles, ExternalLink, Maximize, Minimize } from "lucide-react";
import StepIndicator from "@/components/StepIndicator";
import { useProcess } from "@/context/ProcessContext";
import { toast } from "sonner";

const STEPS = ["Upload", "Profile", "Customize", "Output"];

/* ── Disability theming ─────────────────────────────────── */
const DISABILITY_THEME: Record<string, { accent: string; light: string; keyword: string; label: string }> = {
  "ADHD":              { accent: "#4F6CF7", light: "#EEF1FF", keyword: "#DBEAFE", label: "ADHD" },
  "Dyslexia":          { accent: "#D97706", light: "#FFF8EB", keyword: "#FEF3C7", label: "Dyslexia" },
  "Visual Impairment": { accent: "#B45309", light: "#FFFBEB", keyword: "#FDE68A", label: "Visual Impairment" },
  "ASD":               { accent: "#059669", light: "#ECFDF5", keyword: "#D1FAE5", label: "ASD" },
  "APD":               { accent: "#7C3AED", light: "#F5F3FF", keyword: "#EDE9FE", label: "APD" },
  "None":              { accent: "#2C7A7B", light: "#E8F5F5", keyword: "#CCFBF1", label: "General" },
};

/* Format IDs from Customize page: simplified, audio, braille, visual */

/* ── Markdown-like renderer with keyword highlights ────── */
function RichContent({ text, keywordBg, keywordColor }: { text: string; keywordBg: string; keywordColor: string }) {
  // Split into lines and process each
  const lines = text.split("\n");

  const renderInline = (line: string) => {
    // Match both <<keyword>> and **keyword** patterns
    const parts = line.split(/(<<[^>]+>>|\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      // <<keyword>> format
      if (part.startsWith("<<") && part.endsWith(">>")) {
        const word = part.slice(2, -2);
        return (
          <span
            key={i}
            className="inline-block px-2 py-0.5 rounded-md font-semibold text-sm mx-0.5"
            style={{ background: keywordBg, color: keywordColor }}
          >
            {word}
          </span>
        );
      }
      // **keyword** format (fallback)
      if (part.startsWith("**") && part.endsWith("**")) {
        const word = part.slice(2, -2);
        return (
          <span
            key={i}
            className="inline-block px-2 py-0.5 rounded-md font-semibold text-sm mx-0.5"
            style={{ background: keywordBg, color: keywordColor }}
          >
            {word}
          </span>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <div className="space-y-3">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return null;

        // H2 heading
        if (trimmed.startsWith("## ")) {
          return (
            <h2 key={idx} className="text-xl font-serif font-bold text-foreground mt-5 mb-2">
              {renderInline(trimmed.slice(3))}
            </h2>
          );
        }
        // H3 heading
        if (trimmed.startsWith("### ")) {
          return (
            <h3 key={idx} className="text-lg font-semibold text-foreground mt-4 mb-1.5">
              {renderInline(trimmed.slice(4))}
            </h3>
          );
        }
        // H1 heading
        if (trimmed.startsWith("# ")) {
          return (
            <h1 key={idx} className="text-2xl font-serif font-bold text-foreground mt-5 mb-3">
              {renderInline(trimmed.slice(2))}
            </h1>
          );
        }
        // Numbered list
        if (/^\d+\.\s/.test(trimmed)) {
          const match = trimmed.match(/^(\d+)\.\s(.+)/);
          if (match) {
            return (
              <div key={idx} className="flex items-start gap-3 pl-4 py-1">
                <span className="text-base font-bold text-muted-foreground w-5 shrink-0">{match[1]}.</span>
                <p className="text-base leading-7 text-foreground">{renderInline(match[2])}</p>
              </div>
            );
          }
        }
        // Bullet list
        if (trimmed.startsWith("- ") || trimmed.startsWith("• ")) {
          return (
            <div key={idx} className="flex items-start gap-3 pl-4 py-1">
              <span className="text-base text-muted-foreground mt-1.5">•</span>
              <p className="text-base leading-7 text-foreground">{renderInline(trimmed.slice(2))}</p>
            </div>
          );
        }
        // Regular paragraph
        return (
          <p key={idx} className="text-base leading-7 text-foreground">
            {renderInline(trimmed)}
          </p>
        );
      })}
    </div>
  );
}

/* ── Pexels Smart Card Component ─────────────────── */
function PexelsCard({ query, title, idx }: { query: string; title: string, idx: number }) {
  const [src, setSrc] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPhoto = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/content/pexels/search-photo?query=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setSrc(data.photoUrl);
        } else {
          // Fallback to LoremFlickr for niche/copyright topics
          const k = query.replace(/[^\w\s]/gi, '').split(' ').slice(0,2).join(',');
          setSrc(`https://loremflickr.com/500/350/${k || 'education'}?lock=${idx}`);
        }
      } catch (e) {
        setSrc(`https://loremflickr.com/500/350/school?lock=${idx}`);
      } finally {
        setLoading(false);
      }
    };
    fetchPhoto();
  }, [query, idx]);

  return (
    <div className="relative w-full h-full bg-neutral-100 overflow-hidden">
      {loading ? (
         <div className="absolute inset-0 flex items-center justify-center bg-neutral-100">
            <div className="w-6 h-6 border-2 border-teal border-t-transparent rounded-full animate-spin" />
         </div>
      ) : (
         <img 
            src={src} 
            alt={title}
            className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700"
         />
      )}
    </div>
  );
}

/* ── Video Segment Viewer ─────────────────────────── */
function VideoViewer({ segments, theme, disability, language }: { segments: any[]; theme: any; disability: string; language: string }) {
  const [currentIdx, setCurrentIdx] = useState(-1); // -1 is "not started"
  const [playing, setPlaying] = useState(false);
  const [imgLoading, setImgLoading] = useState(true);
  const [preGenerating, setPreGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [preLoadedImgMap, setPreLoadedImgMap] = useState<Record<number, string>>({});
  const [preLoadedAudioMap, setPreLoadedAudioMap] = useState<Record<number, string>>({});
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const total = segments.length;

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const preGenerateAll = async () => {
    setPreGenerating(true);
    setProgress(0);
    const imgMap: Record<number, string> = {};
    const audioMap: Record<number, string> = {};
    
    for (let i = 0; i < segments.length; i++) {
       const segment = segments[i];
       const query = segment.imageQuery || "educational topic";
       
       try {
          const res = await fetch(`http://localhost:5000/api/content/pexels/search-video?query=${encodeURIComponent(query)}`);
          if (res.ok) {
             const json = await res.json();
             imgMap[i] = json.videoUrl;
          } else {
             // Second try with simpler query
             const simpleQuery = query.split(' ').slice(0, 2).join(' ');
             const res2 = await fetch(`http://localhost:5000/api/content/pexels/search-video?query=${encodeURIComponent(simpleQuery)}`);
             if (res2.ok) {
                const json2 = await res2.json();
                imgMap[i] = json2.videoUrl;
             }
          }
       } catch (e) {
          console.error("Pexels fetch error", e);
       }

       // Also pre-generate Sarvam TTS audio
       try {
          const ttsRes = await fetch("http://localhost:5000/api/content/sarvam-tts", {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ 
                text: segment.text, 
                targetLanguageCode: language || "hi-IN"
             })
          });
          if (ttsRes.ok) {
             const ttsData = await ttsRes.json();
             if (ttsData.audioBase64) {
                 audioMap[i] = `data:audio/wav;base64,${ttsData.audioBase64}`;
             }
          }
       } catch (e) {
          console.error("Sarvam TTS fetch error", e);
       }

       setProgress(((i+1)/segments.length) * 100);
    }
    
    setPreLoadedImgMap(imgMap);
    setPreLoadedAudioMap(audioMap);
    setTimeout(() => {
        setPreGenerating(false);
        playSegment(0);
    }, 800);
  };

  const playSegment = useCallback((idx: number) => {
    if (idx >= total) {
      setPlaying(false);
      setCurrentIdx(-1);
      return;
    }
    setImgLoading(true);
    setCurrentIdx(idx);
    setPlaying(true);

    if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
    }

    const audioUrl = preLoadedAudioMap[idx];
    if (audioUrl) {
       const audio = new Audio(audioUrl);
       audioRef.current = audio;
       audio.onended = () => {
          setTimeout(() => playSegment(idx + 1), 1000);
       };
       audio.onerror = () => {
          setPlaying(false);
          setCurrentIdx(-1);
       };
       audio.play().catch(e => {
          console.error('Audio play error:', e);
          setPlaying(false);
       });
    } else {
       // Fallback to browser TTS if Sarvam fails
       const segment = segments[idx];
       const utter = new SpeechSynthesisUtterance(segment.text);
       utter.rate = 0.95;
       utter.pitch = 1.0;
       utter.lang = language || "hi-IN";
       
       utter.onend = () => {
         setTimeout(() => playSegment(idx + 1), 1500);
       };
       utter.onerror = () => {
         setPlaying(false);
         setCurrentIdx(-1);
       };
       window.speechSynthesis.speak(utter);
    }
  }, [segments, total, preLoadedAudioMap]);

  const stopVideo = () => {
    window.speechSynthesis.cancel();
    if (audioRef.current) {
       audioRef.current.pause();
       audioRef.current = null;
    }
    setPlaying(false);
    setCurrentIdx(-1);
    setPreGenerating(false);
  };

  if (preGenerating) {
    return (
      <div className="relative rounded-3xl aspect-video bg-neutral-900 border border-white/10 flex flex-col items-center justify-center p-8 shadow-2xl text-center">
         <div className="mb-8 relative">
            <div className="w-24 h-24 border-b-4 border-teal rounded-full animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center text-teal font-black text-xl">
               {Math.round(progress)}%
            </div>
         </div>
         <div className="space-y-3">
            <h4 className="text-white font-bold text-2xl tracking-tight">Rendering AI Presentation</h4>
            <p className="text-white/50 text-sm max-w-[280px]">Generating unique AI visuals and synchronizing neural voice narration...</p>
         </div>
      </div>
    );
  }

  if (currentIdx === -1 && !playing) {
    return (
      <div className="relative group overflow-hidden rounded-3xl aspect-video bg-popover border border-border flex flex-col items-center justify-center gap-4 transition-all hover:border-teal/30 shadow-md">
        <div className="absolute inset-0 bg-gradient-to-br from-black/5 to-transparent pointer-events-none" />
        <div className="w-20 h-20 rounded-full flex items-center justify-center bg-teal text-white shadow-xl group-hover:scale-110 transition-all cursor-pointer" onClick={preGenerateAll}>
          <Play className="w-10 h-10 ml-1" />
        </div>
        <div className="text-center px-6">
          <h4 className="font-bold text-foreground text-lg">Generate Video Lesson</h4>
          <p className="text-sm text-muted-foreground max-w-[320px]">Click to pre-generate AI visuals and start the interactive summary.</p>
        </div>
      </div>
    );
  }

  const segment = segments[currentIdx] || segments[0];
  const imgSrc = preLoadedImgMap[currentIdx] || `https://images.pexels.com/photos/1103970/pexels-photo-1103970.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1`;

  return (
    <div ref={containerRef} className={`relative rounded-3xl bg-neutral-950 overflow-hidden shadow-2xl border-4 border-white/10 ring-1 ring-border group/video ${isFullscreen ? 'w-screen h-screen !rounded-none !border-0' : 'aspect-video'}`}>
      {/* ── Cinematic Media Layer (Video or Image) ── */}
      <div className="absolute inset-0 overflow-hidden">
        {imgSrc && imgSrc.includes('.mp4') ? (
           <video 
              src={imgSrc} 
              key={currentIdx}
              autoPlay 
              muted 
              loop 
              playsInline
              className="w-full h-full object-cover block absolute inset-0"
              onLoadedData={() => setImgLoading(false)}
           />
        ) : (
           <img 
             src={imgSrc} 
             key={currentIdx}
             alt="Cinematic stock background"
             className="w-full h-full object-cover block absolute inset-0 transition-opacity duration-1000 animate-ken-burns"
             onLoad={() => setImgLoading(false)}
           />
        )}
      </div>

      {/* Loading Overlay */}
      {imgLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-20 bg-black/40 backdrop-blur-sm">
          <div className="w-10 h-10 border-4 border-teal border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Overlay Styling */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent pointer-events-none" />
      
      {/* Content Layer */}
      <div className="absolute bottom-10 left-10 right-10 space-y-4 z-20">
        <div className="flex items-center gap-3">
          <div className="inline-flex px-3 py-1 rounded-full bg-teal/90 text-white text-[10px] font-bold tracking-widest uppercase shadow-xl backdrop-blur-md">
            Section {currentIdx + 1} of {total}
          </div>
          <div className="h-[1px] flex-1 bg-white/20" />
        </div>
        <p className="text-white text-2xl md:text-4xl font-black leading-tight drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] text-balance transition-all">
           {segment.text}
        </p>
      </div>

      {/* Video Navigation Controls */}
      <div className="absolute bottom-0 left-0 right-0 h-2 flex gap-1 bg-black/40 p-0 z-30 opacity-0 group-hover/video:opacity-100 transition-opacity">
         {segments.map((_, i) => (
           <div key={i} className={`h-full flex-1 transition-all duration-300 ${i === currentIdx ? 'bg-teal' : i < currentIdx ? 'bg-teal/50' : 'bg-white/10'}`} />
         ))}
      </div>

      {/* Top Header Row */}
      <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-30 opacity-0 group-hover/video:opacity-100 transition-opacity">
         <div className="flex items-center gap-2 text-white/80 font-bold text-xs tracking-wider uppercase">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> AI Interactive Video
         </div>
         <div className="flex items-center gap-2">
           <Button size="icon" variant="ghost" className="rounded-full bg-black/40 text-white hover:bg-black/60 shadow-lg backdrop-blur-md" onClick={toggleFullscreen}>
             {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
           </Button>
           <Button size="icon" variant="ghost" className="rounded-full bg-black/40 text-white hover:bg-black/60 shadow-lg backdrop-blur-md" onClick={stopVideo}>
             <Square className="w-5 h-5 fill-white" />
           </Button>
         </div>
      </div>
    </div>
  );
}

/* ── Component ──────────────────────────────────────────── */
const Output = () => {
  const { data } = useProcess();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<any>(null);
  const [speaking, setSpeaking] = useState(false);
  const fetched = useRef(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const disability = data.disabilities?.[0] || "None";
  const theme = DISABILITY_THEME[disability] || DISABILITY_THEME["None"];
  const selectedFormats = data.formats || ["simplified"];

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;

    const generateContent = async () => {
      try {
        const formData = new FormData();
        if (data.file) formData.append("file", data.file);
        if (data.text) formData.append("text", data.text);
        if (data.documentTitle) formData.append("title", data.documentTitle);
        formData.append("disability", disability);
        formData.append("grade", data.grade || "Middle School");
        formData.append("formats", selectedFormats.join(","));
        formData.append("language", data.language || "hi-IN");

        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:5000/api/content/process", {
          method: "POST",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: formData,
        });

        if (!res.ok) {
          let errMsg = "Failed to process content.";
          try { const errBody = await res.json(); errMsg = errBody.message || errMsg; } catch (e) {}
          throw new Error(errMsg);
        }

        const json = await res.json();
        setResult(json);
      } catch (err: any) {
        toast.error(err.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    };
    generateContent();
  }, [data]);

  /* ── Browser TTS ───────────────────────────────── */
  const handlePlayAudio = useCallback(() => {
    if (!result?.audioScript) return;
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    const utter = new SpeechSynthesisUtterance(result.audioScript);
    utter.rate = 0.95;
    utter.pitch = 1.05;
    utter.lang = data.language || "hi-IN";
    
    // Try to find a voice that matches the language
    const langPrefix = (data.language || "hi-IN").split("-")[0];
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v => v.lang.startsWith(langPrefix));
    if (preferred) utter.voice = preferred;

    utter.onend = () => setSpeaking(false);
    utter.onerror = () => setSpeaking(false);
    utteranceRef.current = utter;
    setSpeaking(true);
    window.speechSynthesis.speak(utter);
  }, [result, speaking]);

  // cleanup on unmount
  useEffect(() => () => { window.speechSynthesis.cancel(); }, []);

  const handleDownloadPPT = () => {
    if (!result?.assets?.pptBase64) return;
    const link = document.createElement("a");
    link.href = `data:application/vnd.openxmlformats-officedocument.presentationml.presentation;base64,${result.assets.pptBase64}`;
    link.download = "Adaptive_Content.pptx";
    link.click();
  };

  const handleDownloadBraille = () => {
    if (!result?.assets?.brailleFormat) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Braille PDF Render</title>
          <style>
            @page { margin: 20mm; }
            body { 
              font-family: 'Segoe UI Symbol', 'DejaVu Sans', 'Swell Braille', sans-serif; 
              font-size: 28px; 
              line-height: 2.0; 
              word-break: break-all;
              padding: 20px;
            }
            .header { font-size: 16px; font-family: Arial, sans-serif; margin-bottom: 30px; border-bottom: 2px solid #000; padding-bottom: 10px; }
            .hint { font-size: 12px; color: gray; margin-bottom: 20px; font-family: Arial, sans-serif; }
          </style>
        </head>
        <body>
          <div class="header">
            <strong>EduAid Braille Content Document</strong><br/>
            Language: ${data.language || "English"} | Accessibility Mode: ${data.disabilities.join(", ")}
          </div>
          <div class="hint">Please select "Save as PDF" directly in the print dialog.</div>
          <div>${result.assets.brailleFormat.replace(/\n/g, '<br/>')}</div>
          <script>
            setTimeout(() => {
              window.print();
              setTimeout(() => { window.close(); }, 500);
            }, 600);
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  /* ── LOADING STATE ─────────────────────────────── */
  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-5 p-8 min-h-[60vh]">
        <div className="w-20 h-20 rounded-3xl flex items-center justify-center animate-pulse-soft" style={{ background: theme.light }}>
          <Loader2 className="w-10 h-10 animate-spin" style={{ color: theme.accent }} />
        </div>
        <h2 className="text-2xl font-serif text-foreground">Generating Adaptive Content…</h2>
        <p className="text-muted-foreground text-sm">Our AI is transforming your content for <strong>{theme.label}</strong>.</p>
      </div>
    );
  }

  /* ── ERROR STATE ───────────────────────────────── */
  if (!result) {
    return (
      <div className="flex-1 p-8 flex flex-col items-center justify-center gap-3">
        <h2 className="text-2xl font-serif text-foreground">Failed to Generate</h2>
        <p className="text-muted-foreground">Check the console or server logs for details.</p>
      </div>
    );
  }

  /* ── SUCCESS ───────────────────────────────────── */
  return (
    <div className="flex-1 p-4 md:p-8 space-y-7 max-w-5xl mx-auto w-full pb-16">
      <StepIndicator steps={STEPS} currentStep={3} />

      {/* Header row */}
      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-4xl font-serif text-foreground">
            Generated <span className="heading-underline">Content</span>
          </h1>
          <span
            className="text-xs font-bold px-3 py-1 rounded-full"
            style={{ background: theme.light, color: theme.accent, border: `1px solid ${theme.accent}30` }}
          >
            {theme.label}
          </span>
        </div>
        <p className="text-muted-foreground text-sm">
          Grade: <strong>{result.gradeLevel}</strong> &nbsp;•&nbsp; Adapted for: <strong>{result.disabilityProcessed}</strong>
        </p>
      </div>

      {/* ── Simplified Text Card (Foundation) ──── */}
      <div className="rounded-2xl border border-border overflow-hidden shadow-sm" style={{ background: theme.light }}>
        <div className="flex items-center gap-3 px-6 py-4">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: theme.accent }}>
            <FileText className="w-4.5 h-4.5 text-white" />
          </div>
          <h3 className="font-bold text-foreground text-lg font-serif">Simplified Lesson Content</h3>
        </div>
        <div className="bg-background/60 backdrop-blur-sm mx-4 mb-4 rounded-xl px-7 py-6 overflow-auto max-h-[600px] shadow-inner border border-border/30">
          <RichContent
            text={result.simplifiedContent || "No text available."}
            keywordBg={theme.keyword}
            keywordColor={theme.accent}
          />
        </div>
      </div>

      {/* ── Video Explanation (Always On-Demand) ──── */}
      {result.videoSegments && result.videoSegments.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-orange text-white shadow-lg">
                <Play className="w-5 h-5" />
             </div>
             <h3 className="font-bold text-foreground text-xl font-serif">Interactive Video Lesson</h3>
          </div>
          <VideoViewer 
            segments={result.videoSegments} 
            theme={theme} 
            disability={disability}
            language={data.language || "hi-IN"}
          />
        </div>
      )}

      {/* ── Visual Summary Gallery (if selected) ──── */}
      {selectedFormats.includes("visual") && result.slides && result.slides.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-teal text-white">
                <Sparkles className="w-5 h-5" />
             </div>
             <h3 className="font-bold text-foreground text-xl font-serif">Visual Summary</h3>
          </div>
          <div className="bg-popover border border-border rounded-3xl p-6 shadow-sm overflow-hidden">
             <div className="flex overflow-x-auto gap-5 pb-4 custom-scrollbar">
                {result.slides.map((slide: any, idx: number) => (
                   <div key={idx} className="flex-shrink-0 w-72 h-auto group bg-card rounded-2xl border border-border/50 hover:border-teal/30 hover:shadow-md transition-all overflow-hidden">
                      {slide.imageQuery && (
                         <div className="relative h-44 w-full overflow-hidden">
                             <PexelsCard 
                                query={slide.imageQuery || "educational topic"} 
                                title={slide.title} 
                                idx={idx} 
                             />
                             {slide.visualIcon && (
                                <div className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur shadow-lg flex items-center justify-center text-xl">
                                   {slide.visualIcon}
                                </div>
                             )}
                          </div>
                       )}
                      <div className="p-4 space-y-2">
                         <h4 className="font-bold text-foreground text-sm line-clamp-1">{slide.title}</h4>
                         <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                            {slide.bulletPoints?.[0] || "Exploring this section important concepts..."}
                         </p>
                      </div>
                   </div>
                ))}
             </div>
             <p className="text-[10px] text-center text-muted-foreground mt-2 italic font-sans italic opacity-60">
                These visuals are generated based on the concepts of each section to provide visual context.
             </p>
          </div>
        </div>
      )}

      {/* ── Asset Action Cards ─────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Audio Card */}
        {selectedFormats.includes("audio") && (result.assets?.hasAudio || result.audioScript) && (
          <div className="bg-popover border border-border rounded-2xl p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: theme.light }}>
              <Volume2 className="w-6 h-6" style={{ color: theme.accent }} />
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-sm">Audio Narration</h3>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">Teacher-style spoken explanation using browser TTS</p>
            </div>
            <div className="flex flex-col gap-2 mt-auto">
              <Button
                size="sm"
                className="rounded-xl gap-2 text-white text-sm h-10 w-full"
                style={{ background: speaking ? "#DC2626" : theme.accent }}
                onClick={handlePlayAudio}
              >
                {speaking ? <><Pause className="w-4 h-4" /> Stop</> : <><Play className="w-4 h-4" /> Play Audio</>}
              </Button>
              {result.assets?.audioURL && (
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl gap-2 text-sm h-10 w-full"
                  style={{ borderColor: `${theme.accent}50`, color: theme.accent }}
                  onClick={() => window.open(result.assets.audioURL, "_blank")}
                >
                  <ExternalLink className="w-4 h-4" /> Open Audio URL
                </Button>
              )}
            </div>
          </div>
        )}

        {/* PPT Card */}
        {(selectedFormats.includes("visual") || selectedFormats.includes("simplified")) && result.assets?.pptBase64 && (
          <div className="bg-popover border border-border rounded-2xl p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: theme.light }}>
              <Presentation className="w-6 h-6" style={{ color: theme.accent }} />
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-sm">Presentation (PPT)</h3>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                {disability === "Visual Impairment" ? "High-contrast black & yellow theme" :
                 disability === "ADHD" ? "Calm blue theme, short bullet points" :
                 disability === "Dyslexia" ? "Warm cream theme, simple language" :
                 disability === "ASD" ? "Structured green theme, literal language" :
                 disability === "APD" ? "Purple theme with BLUF summaries" :
                 "Themed adaptive slide deck"}
              </p>
            </div>
            <Button
              size="sm"
              className="rounded-xl gap-2 text-white text-sm h-10 mt-auto"
              style={{ background: theme.accent }}
              onClick={handleDownloadPPT}
            >
              <Download className="w-4 h-4" /> Download .pptx
            </Button>
          </div>
        )}

        {/* Braille Card */}
        {selectedFormats.includes("braille") && result.assets?.brailleFormat && (
          <div className="bg-popover border border-border rounded-2xl p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: theme.light }}>
              <Braces className="w-6 h-6" style={{ color: theme.accent }} />
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-sm">Braille-Ready Text</h3>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">Formatted for braille printers (40 chars/line)</p>
            </div>
            <Button
              size="sm"
              className="rounded-xl gap-2 text-white text-sm h-10 mt-auto"
              style={{ background: theme.accent }}
              onClick={handleDownloadBraille}
            >
              <Download className="w-4 h-4" /> Download .txt
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Output;
