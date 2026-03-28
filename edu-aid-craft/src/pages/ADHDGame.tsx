import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useProcess } from "@/context/ProcessContext";
import {
  Mic, MicOff, Volume2, Home, RotateCcw, Star,
  Trophy, ChevronRight, BookOpen, Loader2, Zap, AlertCircle,
  Flag, Play, Info
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Document { _id: string; title: string; standard: number; uploadedBy?: { name: string }; }
type Phase = "pick" | "mode" | "loading" | "game" | "end";
type GameMode = "words" | "sentences";

// ─── Racing Car Component ──────────────────────────────────────────────────────
const RacingCar = ({ status, jump, progress }: { status: "idle" | "listening" | "happy" | "sad", jump: boolean, progress: number }) => {
  return (
    <motion.div 
      className="relative z-20"
      animate={{ 
        y: jump ? [0, -60, 0] : [0, 2, 0],
        x: `${progress * 0.8}%`, // Move car across the screen base
      }}
      transition={{ 
        y: { duration: 0.5, ease: "easeOut" },
        x: { duration: 0.8, type: "spring" },
        repeat: jump ? 0 : Infinity,
        repeatDelay: 1
      }}
    >
      <svg viewBox="0 0 140 80" className="w-48 h-auto drop-shadow-2xl">
        {/* Wheels */}
        <circle cx="35" cy="65" r="12" fill="#1a1a1a" />
        <circle cx="105" cy="65" r="12" fill="#1a1a1a" />
        <circle cx="35" cy="65" r="5" fill="#4d4d4d" />
        <circle cx="105" cy="65" r="5" fill="#4d4d4d" />
        
        {/* Car Body (Red Racing Car) */}
        <path d="M10,50 L20,30 Q40,15 80,15 L110,25 Q130,30 135,50 L135,65 Q135,70 125,70 L15,70 Q5,70 5,65 Z" fill="#ef4444" />
        
        {/* Details / Accents */}
        <path d="M40,20 L75,20 L75,40 L35,40 Z" fill="#99f6e4" opacity="0.6" /> {/* Window */}
        <rect x="20" y="55" width="20" height="4" fill="#fecaca" rx="2" /> {/* Side Stripe */}
        <rect x="50" y="55" width="40" height="4" fill="#fecaca" rx="2" />
        
        {/* Racing Number 01 */}
        <circle cx="95" cy="45" r="12" fill="white" />
        <text x="88" y="51" fontSize="12" fontWeight="bold" fill="#ef4444">01</text>
        
        {/* Spoiler */}
        <path d="M5,40 L25,40 L20,30 L0,30 Z" fill="#b91c1c" />
        
        {/* Animation feedback */}
        {status === "happy" && (
           <motion.text x="110" y="10" initial={{ opacity: 0 }} animate={{ opacity: 1, y: -20 }} className="text-2xl">✨</motion.text>
        )}
      </svg>
      
      {listeningIndicator(status)}
    </motion.div>
  );
};

const listeningIndicator = (status: string) => {
  if (status !== "listening") return null;
  return (
    <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex gap-1">
      {[1,2,3].map(i => (
        <motion.div 
          key={i}
          animate={{ height: [10, 30, 10] }}
          transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.1 }}
          className="w-2 bg-blue-500 rounded-full"
        />
      ))}
    </div>
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
  const [docsLoading, setDocsLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);

  // Game state
  const [content, setContent] = useState<string[]>([]);
  const [idx, setIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const [score, setScore] = useState(0);
  const [tries, setTries] = useState(0);
  const [status, setStatus] = useState<"idle" | "listening" | "happy" | "sad">("idle");
  const [isJumping, setIsJumping] = useState(false);

  // Voice
  const [listening, setListening] = useState(false);
  const [recognized, setRecognized] = useState("");
  const [feedback, setFeedback] = useState<{ msg: string; type: "success" | "error" | "none" }>({ msg: "", type: "none" });

  const recRef = useRef<any>(null);

  useEffect(() => {
    if (!token) return;
    
    // If a document is already selected in the context, use it!
    if (data.documentId && data.documentTitle) {
      setSelectedDoc({ _id: data.documentId, title: data.documentTitle, standard: 0 });
      setPhase("mode");
      setDocsLoading(false);
      return;
    }

    fetch("http://localhost:5000/api/documents", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { setDocs(Array.isArray(d) ? d : []); setDocsLoading(false); })
      .catch(() => setDocsLoading(false));
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
      const data = await res.json();
      const list = gameMode === "words" ? data.words : data.sentences;
      
      if (!list || list.length === 0) throw new Error("No content generated");
      
      setContent(list);
      setIdx(0); setProgress(0); setScore(0); setTries(0);
      setPhase("game");
      setTimeout(() => speak(list[0]), 800);
    } catch (e) {
      setFeedback({ msg: "Could not start game. Try another topic!", type: "error" });
      setPhase("pick");
    }
  };

  const speak = (text: string) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.85;
    u.pitch = 1.1; // Kid friendly
    window.speechSynthesis.speak(u);
  };

  const checkResult = useCallback((said: string) => {
    const target = content[idx].toLowerCase().replace(/[^a-z0-9]/g, "");
    const input = said.toLowerCase().replace(/[^a-z0-9]/g, "");
    
    // Fuzzy matching
    const isCorrect = input.includes(target) || target.includes(input) || 
                      (target.length > 3 && input.length > 3 && (input.startsWith(target.slice(0,3)) || target.startsWith(input.slice(0,3))));

    if (isCorrect) {
      setScore(s => s + 10);
      setStatus("happy");
      setIsJumping(true);
      setFeedback({ msg: "ZOOM! Perfect! 🏎️💨", type: "success" });
      
      setTimeout(() => {
        setIsJumping(false);
        const nextProg = Math.min(progress + (100 / content.length), 100);
        setProgress(nextProg);
        
        if (nextProg >= 99 || idx + 1 >= content.length) {
          setPhase("end");
        } else {
          setIdx(prev => prev + 1);
          setTries(0);
          setRecognized("");
          setFeedback({ msg: "", type: "none" });
          setStatus("idle");
          speak(content[idx + 1]);
        }
      }, 1500);
    } else {
      setTries(t => t + 1);
      setStatus("sad");
      setFeedback({ msg: "Hold on! Try one more time! 🛠️", type: "error" });
      
      if (tries + 1 >= 3) {
        setTimeout(() => {
           if (idx + 1 < content.length) {
              setIdx(idx + 1);
              setTries(0);
              setRecognized("");
              setFeedback({ msg: "", type: "none" });
              setStatus("idle");
              speak(content[idx + 1]);
           } else {
              setPhase("end");
           }
        }, 2000);
      } else {
        setTimeout(() => setStatus("idle"), 1000);
      }
    }
  }, [idx, content, tries, progress]);

  const startMic = useCallback(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return alert("Please use Chrome browser for voice features.");
    
    const rec = new SR();
    recRef.current = rec;
    rec.lang = "en-US";
    rec.continuous = false;
    rec.interimResults = false;
    
    rec.onstart = () => { setListening(true); setStatus("listening"); };
    rec.onresult = (e: any) => {
      const said = e.results[0][0].transcript;
      setRecognized(said);
      checkResult(said);
    };
    rec.onerror = () => { setListening(false); setStatus("idle"); };
    rec.onend = () => setListening(false);
    rec.start();
  }, [checkResult]);

  // ─── Phase: Pick Topic ───────────────────────────────────────────────────────
  if (phase === "pick") {
    return (
      <div className="min-h-screen bg-[#0f172a] text-white p-8 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] -z-10" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-red-500/10 rounded-full blur-[120px] -z-10" />
        
        <nav className="max-w-7xl mx-auto flex justify-between items-center mb-16">
           <button onClick={() => navigate(-1)} className="flex items-center gap-2 font-black text-slate-400 hover:text-white transition-all bg-slate-800/50 px-6 py-3 rounded-2xl backdrop-blur-md border border-white/5 uppercase tracking-widest text-xs">
             ← BACK TO ADAPTATION
           </button>
           <div className="bg-red-500/20 px-4 py-1 rounded-full border border-red-500/30 flex items-center gap-2">
             <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
             <span className="text-xs font-bold text-red-400 uppercase tracking-widest">Racing Zone</span>
           </div>
        </nav>

        <div className="text-center mb-12">
           <motion.div 
             initial={{ scale: 0 }} animate={{ scale: 1 }}
             className="w-24 h-24 bg-gradient-to-tr from-red-500 to-orange-400 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-red-500/20 rotate-6"
           >
              <Zap className="w-12 h-12 text-white fill-white" />
           </motion.div>
           <h1 className="text-5xl md:text-6xl font-black mb-4 font-serif bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
             ADHD Adventure
           </h1>
           <p className="text-slate-400 text-lg max-w-2xl mx-auto">
             Level up your reading skills and race to the finish line! Choose a topic to begin the challenge.
           </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl mx-auto pb-20">
           {docs.map((doc, i) => (
              <motion.button 
                key={doc._id} 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => selectDoc(doc)} 
                className="group bg-slate-800/30 border border-slate-700/50 p-6 rounded-[2.5rem] hover:bg-slate-800/60 hover:border-red-500/50 transition-all text-left backdrop-blur-sm relative overflow-hidden"
              >
                 <div className="absolute -right-4 -top-4 w-20 h-20 bg-red-500/5 rounded-full group-hover:scale-150 transition-transform" />
                 <BookOpen className="w-8 h-8 text-red-400 mb-4" />
                 <h3 className="font-bold text-white text-xl leading-tight mb-2 line-clamp-2 group-hover:text-red-400 transition-colors uppercase tracking-tight">{doc.title}</h3>
                 <div className="flex items-center gap-2 mt-4 text-xs font-black text-slate-500">
                    <span className="bg-slate-700/50 px-3 py-1 rounded-full text-slate-300">GRADE {doc.standard}</span>
                    <span className="flex items-center gap-1"><Star className="w-3 h-3 fill-orange-400 text-orange-400" /> READY</span>
                 </div>
              </motion.button>
           ))}
        </div>
      </div>
    );
  }

  // ─── Phase: Mode Select ──────────────────────────────────────────────────────
  if (phase === "mode") {
    return (
      <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center p-8 gap-12">
         <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
           <h2 className="text-4xl md:text-6xl font-black mb-4 text-white uppercase italic tracking-tighter">Choose Your Gear</h2>
           <p className="text-slate-400 text-lg">Select a mode to tune your racing engine!</p>
         </motion.div>
         
         <div className="flex flex-col md:flex-row gap-8 w-full max-w-4xl">
            <button onClick={() => startLevel("words")} className="flex-1 bg-slate-800/40 p-12 rounded-[3.5rem] border-2 border-slate-700 hover:border-blue-500 hover:bg-slate-800/80 transition-all group relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 transition-opacity">
                 <Zap className="w-24 h-24 text-blue-500" />
               </div>
               <div className="text-7xl mb-8 group-hover:rotate-12 transition-transform drop-shadow-lg">🔤</div>
               <h3 className="text-3xl font-black mb-3 text-white">WORD SPRINT</h3>
               <p className="text-slate-400">Quick bursts of reading! Say the words clearly to accelerate.</p>
               <div className="mt-8 flex items-center gap-2 text-blue-400 font-bold uppercase tracking-widest text-sm translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all">
                 SELECT MODE <ChevronRight className="w-4 h-4" />
               </div>
            </button>
            
            <button onClick={() => startLevel("sentences")} className="flex-1 bg-slate-800/40 p-12 rounded-[3.5rem] border-2 border-slate-700 hover:border-red-500 hover:bg-slate-800/80 transition-all group relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 transition-opacity">
                 <Flag className="w-24 h-24 text-red-500" />
               </div>
               <div className="text-7xl mb-8 group-hover:-rotate-12 transition-transform drop-shadow-lg">🏎️</div>
               <h3 className="text-3xl font-black mb-3 text-white">SENTENCE TRACK</h3>
               <p className="text-slate-400">Long stretches of focus! Read full sentences to stay ahead.</p>
               <div className="mt-8 flex items-center gap-2 text-red-400 font-bold uppercase tracking-widest text-sm translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all">
                 SELECT MODE <ChevronRight className="w-4 h-4" />
               </div>
            </button>
         </div>
         <button onClick={() => navigate(-1)} className="text-slate-500 font-black hover:text-white transition-all uppercase tracking-widest">← Return to Profile</button>
      </div>
    );
  }

  // ─── Phase: Loading ────────────────────────────────────────────────────────
  if (phase === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f172a]">
         <div className="text-center space-y-6">
            <div className="relative">
              <Loader2 className="w-20 h-20 animate-spin text-red-500 mx-auto" strokeWidth={3} />
              <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-white animate-pulse" />
            </div>
            <p className="font-black text-white text-3xl uppercase italic tracking-tighter">Fueling Up...</p>
            <p className="text-slate-500 animate-pulse font-bold tracking-widest">PREPARING TRACK: {selectedDoc?.title}</p>
         </div>
      </div>
    );
  }

  // ─── Phase: Result / Final ──────────────────────────────────────────────────
  if (phase === "end") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f172a] p-8">
         <motion.div 
           initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
           className="bg-slate-800/50 p-16 rounded-[4rem] text-center shadow-2xl border border-white/10 backdrop-blur-xl max-w-xl w-full"
         >
            <div className="text-9xl mb-8 drop-shadow-2xl">🏆</div>
            <h1 className="text-6xl font-black mb-4 text-white uppercase italic skew-x-12">VICTORY!</h1>
            <p className="text-slate-400 text-xl mb-12 font-medium">You dominated the track with <span className="text-red-500 font-bold">{score}</span> points!</p>
            <div className="grid grid-cols-2 gap-4 mb-12">
               <div className="bg-white/5 p-4 rounded-3xl border border-white/5">
                  <p className="text-xs text-slate-500 font-black uppercase">Accuracy</p>
                  <p className="text-2xl font-black text-white">94%</p>
               </div>
               <div className="bg-white/5 p-4 rounded-3xl border border-white/5">
                  <p className="text-xs text-slate-500 font-black uppercase">Speed</p>
                  <p className="text-2xl font-black text-white">PRO</p>
               </div>
            </div>
            <div className="flex flex-col gap-4">
               <button onClick={() => { setPhase("mode"); setIdx(0); setScore(0); setProgress(0); }} className="w-full py-6 bg-red-600 text-white rounded-[2rem] font-black text-xl hover:bg-red-500 transition-all shadow-xl shadow-red-900/20 active:scale-95 uppercase tracking-widest">
                  RESTART RACE
               </button>
               <button onClick={() => navigate(-1)} className="w-full py-6 bg-white/5 text-slate-400 rounded-[2rem] font-black text-xl hover:bg-white/10 transition-all uppercase tracking-widest">
                  RETURN TO LESSON
               </button>
            </div>
         </motion.div>
      </div>
    );
  }

  // ─── Phase: Main Gameplay ──────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col items-center overflow-x-hidden">
       {/* ── Racing Header ── */}
       <div className="w-full p-6 flex justify-between items-center bg-slate-900 border-b border-red-500/20">
          <button onClick={() => navigate(-1)} className="font-black text-slate-400 hover:text-red-500 transition-all uppercase tracking-[0.2em] text-xs flex items-center gap-2">
            <RotateCcw className="w-4 h-4" /> ABORT RACE
          </button>
          <div className="flex items-center gap-4">
             <div className="bg-red-500/10 px-6 py-2 rounded-2xl border-2 border-red-500/30">
                <span className="text-red-500 font-black text-xl italic leading-none whitespace-nowrap">SCORE: {score}</span>
             </div>
             <div className="bg-blue-500/10 px-6 py-2 rounded-2xl border-2 border-blue-500/30">
                <span className="text-blue-500 font-black text-xl italic leading-none tracking-tighter">{idx + 1} OF {content.length}</span>
             </div>
          </div>
       </div>

       {/* ── Racing Track (Progress Goal) ── */}
       <div className="w-full max-w-6xl mt-12 px-10 relative h-[180px] flex items-end pb-12">
          {/* Finish Line Flag */}
          <div className="absolute right-10 bottom-12 z-30 opacity-50">
             <Flag className="w-16 h-16 text-red-500 animate-bounce" />
          </div>
          
          {/* Progress Road */}
          <div className="absolute bottom-10 left-10 right-10 h-6 bg-[#1e293b] rounded-full border-t border-slate-700 shadow-inner overflow-hidden">
             {/* Road markings */}
             <div className="w-full h-full opacity-30 flex gap-4 pr-10 items-center">
                {Array.from({ length: 20 }).map((_, i) => <div key={i} className="w-8 h-1 bg-white/50" />)}
             </div>
             {/* Road Progress Glow */}
             <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-red-600 to-orange-400 transition-all duration-1000" style={{ width: `${progress}%` }}>
                <div className="absolute top-0 right-0 w-8 h-full bg-white opacity-40 blur-sm" />
             </div>
          </div>
          
          <RacingCar status={status} jump={isJumping} progress={progress} />
       </div>

       {/* ── Gameplay UI ── */}
       <div className="flex-1 flex flex-col items-center justify-start gap-8 w-full max-w-4xl text-center px-4 pt-12">
          
          {/* Word/Sentence Prompt */}
          <motion.div 
            key={idx}
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="space-y-4 bg-slate-800/30 p-12 rounded-[4rem] border border-white/5 backdrop-blur-md w-full relative group"
          >
             <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 px-6 py-1 rounded-full font-black text-xs text-white uppercase tracking-widest italic shadow-lg">
               TARGET READ
             </div>
             <p className="text-slate-500 font-black uppercase tracking-[0.3em] text-xs">Voice Command Required</p>
             <h2 className="text-5xl md:text-8xl font-black text-white leading-none tracking-tighter py-4 uppercase italic">
                {content[idx]}
             </h2>
             <div className="flex justify-center gap-4">
                <button onClick={() => speak(content[idx])} className="p-4 bg-slate-700/50 rounded-2xl border border-white/5 hover:bg-slate-700 hover:text-red-400 transition-all text-slate-400 shadow-xl group">
                   <Volume2 className="w-8 h-8 group-hover:scale-110 transition-transform" />
                </button>
                <div className="p-4 bg-slate-700/50 rounded-2xl border border-white/5 text-slate-500 italic text-sm flex items-center gap-2">
                   <Info className="w-4 h-4" /> Listen first, then speak!
                </div>
             </div>
          </motion.div>

          {/* Voice Input Section */}
          <div className="flex flex-col items-center gap-8 py-8 w-full">
             <div className="relative group">
                <motion.div 
                  animate={listening ? { scale: [1, 1.15, 1] } : {}}
                  transition={{ repeat: Infinity, duration: 1 }}
                  className={`w-36 h-36 rounded-full border-4 flex items-center justify-center transition-all shadow-2xl relative z-10
                  ${listening ? "bg-red-500 border-white ring-8 ring-red-500/20" : "bg-slate-800 border-slate-700 group-hover:border-red-500/50"}`}
                >
                   <Mic className={`w-14 h-14 ${listening ? "text-white animate-pulse" : "text-slate-500"}`} />
                </motion.div>
                {/* Pulsing rings when listening */}
                <AnimatePresence>
                  {listening && (
                    <>
                      <motion.div initial={{ scale: 1, opacity: 0.5 }} animate={{ scale: 2, opacity: 0 }} exit={{ opacity: 0 }} transition={{ duration: 1, repeat: Infinity }} className="absolute inset-0 bg-red-500 rounded-full -z-0" />
                      <motion.div initial={{ scale: 1, opacity: 0.3 }} animate={{ scale: 2.5, opacity: 0 }} exit={{ opacity: 0 }} transition={{ duration: 1.5, repeat: Infinity }} className="absolute inset-0 bg-red-500 rounded-full -z-0" />
                    </>
                  )}
                </AnimatePresence>
             </div>

             <div className="flex flex-col items-center gap-4">
                <button onClick={listening ? () => recRef.current?.stop() : startMic}
                   className={`px-16 py-6 rounded-[2rem] font-black text-2xl shadow-2xl transition-all active:scale-95 uppercase tracking-widest italic
                   ${listening ? "bg-white text-red-600" : "bg-red-600 text-white hover:bg-red-500 shadow-red-900/20"}`}>
                   {listening ? "LISTENING NOW..." : "PUSH TO TALK"}
                </button>
                
                <div className="min-h-[60px] flex flex-col items-center justify-center gap-2">
                   {recognized && (
                      <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-slate-400 font-bold italic text-lg uppercase tracking-tight">
                        "ECHO: <span className="text-white">{recognized}</span>"
                      </motion.p>
                   )}
                   {feedback.type !== "none" && (
                      <motion.div 
                        initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                        className={`px-8 py-3 rounded-full font-black uppercase tracking-widest text-sm shadow-xl ${feedback.type === 'success' ? 'bg-green-500 text-white shadow-green-900/20' : 'bg-orange-500 text-white shadow-orange-900/20'}`}>
                         {feedback.msg}
                      </motion.div>
                   )}
                </div>
             </div>
          </div>
       </div>

       {/* Footer guidance */}
       <div className="w-full p-8 text-slate-600 text-xs font-black uppercase tracking-[0.4em] flex justify-center gap-12 sm:opacity-50">
          <span>Voice: AI Ready</span>
          <span>Engine: High Focus</span>
          <span>Driver: Student</span>
       </div>
    </div>
  );
}
