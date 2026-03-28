import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BookOpen, PenTool, Brain, Zap, Eye, Ear, ArrowRight } from "lucide-react";
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
