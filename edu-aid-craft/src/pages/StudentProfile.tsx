import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { BookOpen, PenTool, Brain, Zap, Eye, Ear, ArrowRight, Gamepad2, Sparkles } from "lucide-react";
import StepIndicator from "@/components/StepIndicator";
import { useProcess } from "@/context/ProcessContext";

const STEPS = ["Upload", "Profile", "Customize", "Output"];

const disabilities = [
  { id: "Dyslexia", label: "Dyslexia", desc: "Reading difficulty – struggles with decoding text", icon: BookOpen },
  { id: "ASD", label: "ASD", desc: "Autism Spectrum – needs structured, predictable content", icon: Brain },
  { id: "ADHD", label: "ADHD", desc: "Attention disorder – benefits from concise, engaging material", icon: Zap },
  { id: "Visual Impairment", label: "Visual Impairment", desc: "Needs audio or high-contrast large-text formats", icon: Eye },
  { id: "APD", label: "APD", desc: "Auditory Processing – needs transcriptions and BLUF summaries", icon: Ear },
];

const StudentProfile = () => {
  const navigate = useNavigate();
  const { data, setData } = useProcess();
  const [selected, setSelected] = useState<string[]>(data.disabilities);

  const toggle = (id: string) =>
    setSelected((prev) => prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]);

  const handleNext = () => {
    setData({ disabilities: selected });
    navigate("/customize");
  }

  return (
    <div className="flex-1 p-4 md:p-8 space-y-8 max-w-5xl mx-auto w-full">
      <StepIndicator steps={STEPS} currentStep={1} />

      <div className="space-y-2">
        <h1 className="text-4xl font-serif text-foreground">
          Student <span className="heading-underline">Profile</span>
        </h1>
        <p className="text-muted-foreground">Select the learning disabilities to adapt content for.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {disabilities.map((d) => {
          const isSelected = selected.includes(d.id);
          return (
            <div
              key={d.id}
              onClick={() => toggle(d.id)}
              className={`cursor-pointer rounded-2xl p-5 transition-all border-2 hover:shadow-md ${
                isSelected
                  ? "border-teal bg-teal-light shadow-md"
                  : "border-transparent bg-popover hover:border-border"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                  isSelected ? "bg-teal text-primary-foreground" : "bg-card text-muted-foreground"
                }`}>
                  <d.icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">{d.label}</h3>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{d.desc}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ADHD Game Feature Banner */}
      <AnimatePresence>
        {selected.includes("ADHD") && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="rounded-[3rem] p-8 border-4 border-red-500/20 relative overflow-hidden group shadow-2xl shadow-red-500/10"
            style={{
              background: "linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(249, 115, 22, 0.1))",
            }}
          >
            {/* Animated racing track background effect */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-200/20 overflow-hidden">
               <motion.div 
                 animate={{ x: [-100, 1000] }}
                 transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                 className="w-20 h-full bg-red-500 shadow-[0_0_15px_red]"
               />
            </div>

            <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
              <div className="w-24 h-24 bg-red-500 rounded-[2rem] flex items-center justify-center shrink-0 shadow-2xl shadow-red-500/40 rotate-6 group-hover:rotate-0 transition-transform">
                <Gamepad2 className="w-12 h-12 text-white" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-red-500 text-white text-[10px] font-black uppercase tracking-widest mb-3">
                  <Sparkles className="w-3 h-3" /> Special Game Option Unlocked
                </div>
                <h3 className="font-black text-foreground text-3xl mb-2 italic">ADHD RACING ADVENTURE</h3>
                <p className="text-muted-foreground leading-relaxed max-w-xl">
                  Transform reading into a high-speed race! Speak words to boost your red racing car, jump over obstacles, and reach the finish line. 🏎️💨
                </p>
              </div>
              <button
                onClick={() => navigate("/adhd-game")}
                className="flex items-center gap-3 font-black text-lg px-10 py-5 rounded-full text-white shadow-2xl
                  hover:scale-105 active:scale-95 transition-all uppercase tracking-widest italic"
                style={{ 
                  background: "linear-gradient(135deg, #ef4444, #f97316)",
                  boxShadow: "0 10px 30px rgba(239, 68, 68, 0.4)"
                }}
              >
                PLAY NOW <Zap className="w-6 h-6 fill-white" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        className="bg-orange hover:bg-orange/90 text-foreground rounded-full px-8 h-12 font-semibold gap-2 shadow-lg shadow-orange/20"
        onClick={handleNext}
        disabled={selected.length === 0}
      >
        Continue <ArrowRight className="w-4 h-4" />
      </Button>
    </div>
  );
};

export default StudentProfile;
