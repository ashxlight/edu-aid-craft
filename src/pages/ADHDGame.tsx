import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useProcess } from "@/context/ProcessContext";
import {
  Mic, Volume2, RotateCcw,
  BookOpen, Loader2, Zap,
  Flag, ShieldAlert, Headphones, Car
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Document { _id: string; title: string; standard: number; uploadedBy?: { name: string }; }
type Phase = "pick" | "mode" | "loading" | "game" | "end";
type GameMode = "words" | "sentences";

// ─── Super Premium Racing Car Component ──────────────────────────────────────────────────
const RacingCar = ({ status, jump, hitWall, progress }: { status: string, jump: boolean, hitWall: boolean, progress: number }) => {
  const wavyY = Math.sin(progress * 0.3) * 15;
  return (
    <motion.div 
      className="relative z-20"
      animate={{ 
        y: (jump ? -60 : hitWall ? -15 : 4) + wavyY,
        x: `${progress * 0.8}%`,
        rotateY: hitWall ? 20 : 0,
        rotateZ: Math.cos(progress * 0.3) * 5,
      }}
      transition={{ 
        y: { duration: 0.45, ease: "easeOut" },
        x: { duration: 0.7, type: "spring", stiffness: 100 },
      }}
    >
      <div className="relative">
         {hitWall && <motion.div initial={{ scale: 0, opacity: 1 }} animate={{ scale: 3, opacity: 0 }} className="absolute inset-0 bg-red-600 rounded-full blur-2xl -z-10" />}
         <svg viewBox="0 0 180 100" className="w-32 md:w-36 h-auto drop-shadow-2xl">
           <defs>
              <linearGradient id="bodyGradEx" x1="0%" y1="0%" x2="0%" y2="100%">
                 <stop offset="0%" stopColor="#ff4d4d" /><stop offset="60%" stopColor="#ef4444" /><stop offset="100%" stopColor="#7f1d1d" />
              </linearGradient>
           </defs>
           <g>
             <circle cx="45" cy="75" r="16" fill="#0f172a" />
             <circle cx="135" cy="75" r="16" fill="#0f172a" />
             <circle cx="45" cy="75" r="8" fill="#cbd5e1" stroke="#475569" strokeWidth="2" />
             <circle cx="135" cy="75" r="8" fill="#cbd5e1" stroke="#475569" strokeWidth="2" />
           </g>
           <path d="M5,60 L30,40 Q55,15 100,15 L150,25 Q175,32 175,60 L175,80 Q175,85 160,85 L20,85 Q5,85 5,80 Z" fill="url(#bodyGradEx)" />
           <path d="M5,45 L35,45 L30,30 L0,30 Z" fill="#991b1b" />
           <rect x="10" y="45" width="2" height="15" fill="#7f1d1d" />
           <path d="M55,22 L105,22 Q115,22 115,48 L45,48 Q45,22 55,22 Z" fill="#60a5fa" fillOpacity="0.5" stroke="#bfdbfe" strokeWidth="1.5" />
           <rect x="40" y="65" width="100" height="5" fill="white" fillOpacity="0.1" rx="2" />
           <circle cx="130" cy="55" r="16" fill="white" /><text x="122" y="61" fontSize="16" fontWeight="900" fill="#ef4444" fontStyle="italic">01</text>
         </svg>
      </div>
    </motion.div>
  );
};

// ─── Main ADHD Adventure Game ──────────────────────────────────────────────────
export default function ADHDGame() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const { data } = useProcess();

  const [phase, setPhase] = useState<Phase>("pick");
  const [mode, setMode] = useState<GameMode>("words");
  const [docs, setDocs] = useState<Document[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);

  const [content, setContent] = useState<string[]>([]);
  const [idx, setIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const [score, setScore] = useState(0);
  const [tries, setTries] = useState(0);
  const [status, setStatus] = useState<"idle" | "listening" | "happy" | "sad">("idle");
  const [isJumping, setIsJumping] = useState(false);
  const [hitWall, setHitWall] = useState(false);

  const [listening, setListening] = useState(false);
  const [feedback, setFeedback] = useState<{ msg: string; type: "success" | "error" | "none" }>({ msg: "", type: "none" });

  const recRef = useRef<any>(null);

  useEffect(() => {
    if (!token) return;
    if (data.documentId && data.documentTitle) {
      setSelectedDoc({ _id: data.documentId, title: data.documentTitle, standard: 0 });
      setPhase("mode");
      return;
    }
    fetch("http://localhost:5000/api/documents", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => setDocs(Array.isArray(d) ? d : []));
  }, [token, data.documentId, data.documentTitle]);

  const selectDoc = (doc: Document) => {
    setSelectedDoc(doc);
    setPhase("mode");
  };

  const startLevel = async (gameMode: GameMode) => {
    setMode(gameMode);
    setPhase("loading");
    try {
      const endpoint = gameMode === "words" ? "adhd-words" : "adhd-sentences";
      const res = await fetch(`http://localhost:5000/api/documents/${endpoint}/${selectedDoc?._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const resData = await res.json();
      let list = gameMode === "words" ? resData.words : resData.sentences;
      if (gameMode === "words") list = list.slice(0, 5); else list = list.slice(0, 4);
      if (!list || list.length === 0) throw new Error("No content");
      setContent(list);
      setIdx(0); setProgress(0); setScore(0); setTries(0);
      setPhase("game");
      setTimeout(() => speak(list[0]), 800);
    } catch (e) { setPhase("pick"); }
  };

  const speak = (text: string) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.85; window.speechSynthesis.speak(u);
  };

  const checkResult = useCallback((said: string) => {
    const target = content[idx].toLowerCase().replace(/[^a-z0-9]/g, "");
    const input = said.toLowerCase().replace(/[^a-z0-9]/g, "");
    const isCorrect = input.includes(target) || target.includes(input);

    if (isCorrect) {
      setScore(s => s + 10); setStatus("happy"); setIsJumping(true);
      setFeedback({ msg: "PERFECT! 🏎️💨", type: "success" });
      setTimeout(() => {
        setIsJumping(false);
        const chunk = 100 / content.length; const nextProg = Math.min(progress + chunk, 100);
        setProgress(nextProg);
        if (nextProg >= 99 || idx + 1 >= content.length) { setPhase("end"); } 
        else { setIdx(prev => prev + 1); setTries(0); setFeedback({ msg: "", type: "none" }); setStatus("idle"); speak(content[idx + 1]); }
      }, 1200);
    } else {
      setTries(t => t + 1); setHitWall(true); setStatus("sad"); setFeedback({ msg: "HIT THE WALL! 💥", type: "error" });
      const chunk = 100 / content.length; const nextProg = Math.max(progress - (chunk / 2), 0);
      setProgress(nextProg);
      setTimeout(() => {
        setHitWall(false);
        if (tries + 1 >= 3) {
           if (idx + 1 < content.length) { setIdx(idx + 1); setTries(0); setFeedback({ msg: "SKIPPING", type: "none" }); setStatus("idle"); speak(content[idx + 1]); } 
           else { setPhase("end"); }
        } else { setStatus("idle"); }
      }, 1000);
    }
  }, [idx, content, tries, progress]);

  const startMic = useCallback(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return alert("Use Chrome for voice.");
    const rec = new SR(); recRef.current = rec;
    rec.onstart = () => { setListening(true); setStatus("listening"); };
    rec.onresult = (e: any) => { checkResult(e.results[0][0].transcript); };
    rec.onerror = () => { setListening(false); setStatus("idle"); };
    rec.onend = () => setListening(false);
    rec.start();
  }, [checkResult]);

  if (phase === "pick") {
    return (
      <div className="h-screen bg-[#0f172a] text-white p-4 flex flex-col overflow-hidden">
        <nav className="flex justify-between items-center mb-4 shrink-0">
           <button onClick={() => navigate(-1)} className="font-black text-slate-500 hover:text-white uppercase text-[10px] bg-slate-800/50 px-3 py-1.5 rounded-lg border border-white/5">← EXIT</button>
           <h2 className="text-sm font-black text-red-500 italic flex items-center gap-2"><Car className="w-4 h-4" /> SELECT YOUR TRACK</h2>
        </nav>
        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {docs.map((doc) => (
                 <button key={doc._id} onClick={() => selectDoc(doc)} className="bg-slate-800/30 border-b-4 border-slate-900 border-x border-slate-700/50 p-6 rounded-[2rem] hover:bg-slate-800/60 transition-all text-left group relative overflow-hidden">
                    <div className="absolute right-0 bottom-0 opacity-10 group-hover:opacity-30 transition-opacity translate-x-4 translate-y-4"><Car className="w-24 h-24 rotate-12" /></div>
                    <h3 className="font-black text-white text-md truncate uppercase group-hover:text-red-400 tracking-tight">{doc.title}</h3>
                    <div className="flex items-center gap-2 mt-2"><span className="text-[10px] bg-red-600/20 text-red-400 px-2 py-0.5 rounded-full font-black uppercase tracking-widest">Std {doc.standard}</span></div>
                 </button>
              ))}
           </div>
        </div>
      </div>
    );
  }

  if (phase === "mode") {
    return (
      <div className="h-screen bg-[#0f172a] flex flex-col items-center justify-center p-4 overflow-hidden relative">
         <h2 className="text-4xl font-black text-white italic mb-10 tracking-tighter uppercase">CHOOSE GAME TYPE</h2>
         <div className="flex gap-6 w-full max-w-2xl px-4">
            <button onClick={() => startLevel("words")} className="flex-1 bg-slate-800/40 p-12 rounded-[3.5rem] border border-slate-700 hover:border-red-500 transition-all text-center group relative shadow-2xl">
               <div className="text-7xl mb-4 group-hover:scale-110 transition-transform">🔤</div>
               <h3 className="font-black text-white text-xl uppercase tracking-tighter">5 WORD SPRINT</h3>
            </button>
            <button onClick={() => startLevel("sentences")} className="flex-1 bg-slate-800/40 p-12 rounded-[3.5rem] border border-slate-700 hover:border-red-500 transition-all text-center group relative shadow-2xl">
               <div className="text-7xl mb-4 group-hover:scale-110 transition-transform flex justify-center text-red-500"><Car className="w-20 h-20" strokeWidth={1.5} /></div>
               <h3 className="font-black text-white text-xl uppercase tracking-tighter">4 SENTENCE TRACK</h3>
            </button>
         </div>
      </div>
    );
  }

  if (phase === "loading") {
    return (
      <div className="h-screen flex items-center justify-center bg-[#0f172a]">
         <div className="text-center relative">
            <div className="w-24 h-24 border-4 border-slate-800 border-t-red-600 rounded-full animate-spin mx-auto mb-6" />
            <p className="font-black text-white text-3xl italic uppercase tracking-[0.2em] animate-pulse">WARMING ENGINES...</p>
         </div>
      </div>
    );
  }

  if (phase === "end") {
    return (
      <div className="h-screen flex items-center justify-center bg-[#0f172a] p-4 overflow-hidden">
         <motion.div initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} className="bg-slate-800/50 p-12 rounded-[4.5rem] text-center max-w-lg w-full border border-white/5 shadow-2xl">
            <div className="text-9xl mb-6">🏁</div>
            <h1 className="text-6xl font-black text-white italic mb-4 uppercase tracking-tighter">FINISHED!</h1>
            <button onClick={() => { setPhase("mode"); }} className="w-full py-6 bg-red-600 text-white rounded-[2rem] font-black uppercase text-xl hover:bg-red-500 transition-all shadow-xl">RACE AGAIN</button>
         </motion.div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#0f172a] flex flex-col items-center overflow-hidden font-sans relative">
       {/* ── Top Header ── */}
       <div className="w-full p-4 flex justify-between items-center bg-slate-900/40 border-b border-white/5 shrink-0 z-50">
          <button onClick={() => navigate(-1)} className="font-black text-slate-500 hover:text-red-500 uppercase text-[10px] flex items-center gap-1.5 px-4 py-2 bg-slate-800/50 rounded-xl transition-colors"><RotateCcw className="w-3.5 h-3.5" /> ABORT</button>
          <div className="flex items-center gap-3">
             <div className="bg-[#1e293b] px-6 py-2.5 rounded-2xl border border-red-500/20 font-black text-sm text-red-500 shadow-xl">XP: {score}</div>
             <div className="bg-[#1e293b] px-6 py-2.5 rounded-2xl border border-blue-500/20 font-black text-sm text-blue-400">{idx + 1}/{content.length}</div>
          </div>
       </div>

       {/* ── ACTUAL WAVY ROAD ── */}
       <div className="w-full max-w-5xl mt-8 px-10 relative h-[180px] flex items-end pb-12 shrink-0 overflow-visible">
          <svg className="absolute inset-x-10 bottom-12 w-[calc(100%-80px)] h-20 overflow-visible z-0" preserveAspectRatio="none">
             {/* USER REQUEST: "actual road" (Thick dark gray road) */}
             <path 
                d={`M 0 40 ${Array.from({ length: 20 }).map((_, i) => {
                   const x = (i + 1) * (1000 / 20);
                   const y = 40 + Math.sin((i + 1) * 0.8) * 20;
                   return `L ${x} ${y}`;
                }).join(' ')}`}
                fill="none" stroke="#1e293b" strokeWidth="50" strokeLinecap="round" 
             />
             
             {/* USER REQUEST: "white line" (Dashed center line) */}
             <path 
                d={`M 0 40 ${Array.from({ length: 20 }).map((_, i) => {
                   const x = (i + 1) * (1000 / 20);
                   const y = 40 + Math.sin((i + 1) * 0.8) * 20;
                   return `L ${x} ${y}`;
                }).join(' ')}`}
                fill="none" stroke="white" strokeWidth="3" strokeDasharray="10, 15" strokeLinecap="round" opacity="0.4"
             />

             {/* Dynamic Glow Surface (Visible Progress) */}
             <motion.path 
                d={`M 0 40 ${Array.from({ length: 20 }).map((_, i) => {
                   const x = (i + 1) * (1000 / 20);
                   const y = 40 + Math.sin((i + 1) * 0.8) * 20;
                   return `L ${x} ${y}`;
                }).join(' ')}`}
                fill="none" stroke="url(#roadGrad)" strokeWidth="45" strokeLinecap="round" opacity="0.3"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: progress / 100 }}
                transition={{ duration: 0.8 }}
             />
             
             <defs>
                <linearGradient id="roadGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                   <stop offset="0%" stopColor="#ef4444" /><stop offset="100%" stopColor="#f97316" />
                </linearGradient>
             </defs>
          </svg>
          
          {/* Finish Flag */}
          <div className="absolute right-10 bottom-12 opacity-80 z-10 flex flex-col items-center">
             <Flag className="w-12 h-12 text-red-500 animate-bounce" />
             <div className="w-1.5 h-10 bg-slate-700 rounded-full" />
          </div>

          <RacingCar status={status} jump={isJumping} hitWall={hitWall} progress={progress} />
       </div>

       {/* Prompt Section */}
       <div className="flex-1 flex flex-col items-center justify-center gap-6 w-full max-w-4xl text-center px-6 overflow-hidden pt-2">
          <motion.div 
            key={idx}
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className={`transition-all duration-500 p-10 md:p-14 rounded-[4rem] border-2 w-full relative backdrop-blur-3xl flex items-center justify-between shadow-2xl
              ${hitWall ? 'bg-red-900/20 border-red-500/50' : 'bg-[#1e293b]/40 border-white/5'}`}
          >
             <div className="flex-1 flex flex-col items-start pr-8 text-left">
                <p className="text-slate-500 font-black uppercase text-[11px] tracking-[0.5em] mb-4 shrink-0">Track Command</p>
                <h2 className="text-2xl sm:text-3xl md:text-5xl font-black text-white italic uppercase tracking-[0.1em] leading-tight">
                   {content[idx]}
                </h2>
             </div>
             <button onClick={() => speak(content[idx])} className="w-16 h-16 flex-shrink-0 flex items-center justify-center bg-[#3b82f6] hover:bg-[#2563eb] text-white rounded-2xl shadow-xl active:scale-95 group">
                <Headphones className="w-8 h-8 group-hover:scale-110 transition-transform" />
             </button>
          </motion.div>

          {/* Controls Panel */}
          <div className="flex flex-col items-center gap-4 pb-12 shrink-0 w-full max-w-lg">
             <div className="relative">
                {listening && <motion.div initial={{ scale: 1, opacity: 0.8 }} animate={{ scale: 2.2, opacity: 0 }} transition={{ repeat: Infinity, duration: 0.8 }} className="absolute inset-0 bg-red-600 rounded-full -z-10 blur-xl" />}
                <motion.div className={`w-28 h-28 rounded-full border-[6px] flex items-center justify-center transition-all z-20 shadow-2xl ${listening ? "bg-red-600 border-white" : "bg-slate-800 border-slate-700"}`}>
                   <Mic className={`w-12 h-12 ${listening ? "text-white" : "text-slate-600"}`} />
                </motion.div>
             </div>
             <button onClick={listening ? () => recRef.current?.stop() : startMic} className={`px-16 py-6 rounded-[2.5rem] font-black text-2xl uppercase italic tracking-[0.1em] transition-all
             ${listening ? "bg-white text-red-600 shadow-xl" : "bg-red-600 text-white shadow-2xl hover:bg-red-500"}`}>
                {listening ? "SPEAK NOW!" : "START ENGINE"}
             </button>
          </div>
       </div>
    </div>
  );
}
