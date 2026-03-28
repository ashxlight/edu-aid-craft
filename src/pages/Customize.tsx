import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Sparkles, ArrowRight, Wand2 } from "lucide-react";
import StepIndicator from "@/components/StepIndicator";
import { useProcess } from "@/context/ProcessContext";

const STEPS = ["Upload", "Profile", "Customize", "Output"];

const outputFormats = [
  { id: "simplified", label: "Simplified Text", desc: "Easy-to-read language with short sentences" },
  { id: "audio", label: "Audio", desc: "Text-to-speech audio file" },
  { id: "braille", label: "Braille-ready", desc: "Formatted for braille printers" },
  { id: "visual", label: "Visual Summary", desc: "Infographic-style visual content" },
];

const Customize = () => {
  const navigate = useNavigate();
  const { data, setData } = useProcess();
  const [grade, setLocalGrade] = useState(data.grade);
  const [language, setLocalLanguage] = useState(data.language || "hi-IN");
  const [formats, setFormats] = useState<string[]>(["simplified"]);

  const toggleFormat = (id: string) =>
    setFormats((prev) => prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]);

  const autoSelectFormats = () => {
    const recommended = new Set(["simplified"]);
    data.disabilities.forEach(d => {
      if (d === "Visual Impairment") {
         recommended.add("audio");
         recommended.add("braille");
      }
      if (d === "Dyslexia" || d === "APD") {
         recommended.add("audio");
         recommended.add("visual");
      }
      if (d === "ADHD" || d === "ASD") {
         recommended.add("visual");
      }
    });
    setFormats(Array.from(recommended));
  };

  const handleNext = () => {
    setData({ grade, formats, language });
    navigate("/output");
  }

  return (
    <div className="flex-1 p-4 md:p-8 space-y-8 max-w-4xl mx-auto w-full">
      <StepIndicator steps={STEPS} currentStep={2} />

      <div className="space-y-2">
        <h1 className="text-4xl font-serif text-foreground">
          <span className="heading-underline">Customize</span> Output
        </h1>
        <p className="text-muted-foreground">Choose the grade level and output formats.</p>
      </div>

      <div className="bg-popover rounded-2xl p-6 border border-border/50">
        <h3 className="font-bold text-foreground text-lg mb-4 font-sans">Grade Level</h3>
        <Select value={grade} onValueChange={setLocalGrade}>
          <SelectTrigger className="w-full sm:w-72 h-11 rounded-xl bg-card">
            <SelectValue placeholder="Select grade level" />
          </SelectTrigger>
          <SelectContent>
             <SelectItem value="Easy">Easy (Simplified Concepts)</SelectItem>
             <SelectItem value="Medium">Medium (Standard Concepts)</SelectItem>
             <SelectItem value="Hard">Hard (Complex Concepts)</SelectItem>
             <SelectItem value="Advanced">Advanced (Deep Dive)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-popover rounded-2xl p-6 border border-border/50">
        <h3 className="font-bold text-foreground text-lg mb-4 font-sans">Output Language</h3>
        <Select value={language} onValueChange={setLocalLanguage}>
          <SelectTrigger className="w-full sm:w-72 h-11 rounded-xl bg-card">
            <SelectValue placeholder="Select output language" />
          </SelectTrigger>
          <SelectContent>
             <SelectItem value="en-IN">English (India)</SelectItem>
             <SelectItem value="hi-IN">Hindi (hi-IN)</SelectItem>
             <SelectItem value="gu-IN">Gujarati (gu-IN)</SelectItem>
             <SelectItem value="bn-IN">Bengali (bn-IN)</SelectItem>
             <SelectItem value="te-IN">Telugu (te-IN)</SelectItem>
             <SelectItem value="ta-IN">Tamil (ta-IN)</SelectItem>
             <SelectItem value="mr-IN">Marathi (mr-IN)</SelectItem>
             <SelectItem value="ml-IN">Malayalam (ml-IN)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-popover rounded-2xl p-6 border border-border/50 relative">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-foreground text-lg font-sans">Output Formats</h3>
          <Button variant="outline" size="sm" onClick={autoSelectFormats} className="rounded-full gap-2 border-teal text-teal hover:bg-teal-light hover:text-teal-dark">
            <Wand2 className="w-4 h-4" /> Auto-Select best for {data.disabilities.join(', ')}
          </Button>
        </div>
        <div className="space-y-3">
          {outputFormats.map((fmt) => (
            <div key={fmt.id} className="flex items-center justify-between p-4 rounded-2xl bg-card hover:bg-card/80 transition-colors">
              <div>
                <Label htmlFor={fmt.id} className="font-semibold text-foreground cursor-pointer">{fmt.label}</Label>
                <p className="text-xs text-muted-foreground mt-0.5">{fmt.desc}</p>
              </div>
              <Switch
                id={fmt.id}
                checked={formats.includes(fmt.id)}
                onCheckedChange={() => toggleFormat(fmt.id)}
              />
            </div>
          ))}
        </div>
      </div>

      <Button
        className="bg-orange hover:bg-orange/90 text-foreground rounded-full px-8 h-12 font-semibold gap-2 shadow-lg shadow-orange/20"
        onClick={handleNext}
        disabled={!grade || formats.length === 0}
      >
        <Sparkles className="w-4 h-4" /> Generate Content <ArrowRight className="w-4 h-4" />
      </Button>
    </div>
  );
};

export default Customize;
