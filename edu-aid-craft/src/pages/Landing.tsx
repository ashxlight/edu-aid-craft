import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, BookOpen, Star, Sparkles, BrainCircuit, Activity } from "lucide-react";
import heroStudent from "@/assets/hero-student.png";
import teacherAvatar from "@/assets/teacher-avatar.png";
import classroom from "@/assets/classroom.png";
import { motion, useScroll, useTransform } from "framer-motion";

const Landing = () => {
  const navigate = useNavigate();

  // Text Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const reviews = [
    { name: "Sarah Jenkins", role: "Special Needs Educator", text: "AdptLearn has completely transformed how my students engage with complex topics. The auto-Braille feature alone saves me hours of manual prep work every week!", rating: 5, img: "20" },
    { name: "David Chen", role: "School Administrator", text: "Implementing this platform across our district was seamless. The insights we get on student progress are unparalleled, and the students genuinely love using it.", rating: 5, img: "33" },
    { name: "Emily Turner", role: "Parent", text: "My son used to struggle with traditional worksheets. Now he loves learning through the interactive audio-visual modules. His confidence has skyrocketed.", rating: 5, img: "44" },
    { name: "Sarah Jenkins", role: "Special Needs Educator", text: "AdptLearn has completely transformed how my students engage with complex topics. The auto-Braille feature alone saves me hours of manual prep work every week!", rating: 5, img: "20" },
    { name: "David Chen", role: "School Administrator", text: "Implementing this platform across our district was seamless. The insights we get on student progress are unparalleled, and the students genuinely love using it.", rating: 5, img: "33" },
    { name: "Emily Turner", role: "Parent", text: "My son used to struggle with traditional worksheets. Now he loves learning through the interactive audio-visual modules. His confidence has skyrocketed.", rating: 5, img: "44" }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Navbar - Only Login / Signup */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-16 py-4 bg-background/80 backdrop-blur-md border-b border-border/40">
        <div className="flex items-center gap-1 cursor-pointer" onClick={() => navigate("/")}>
          <span className="text-teal text-2xl animate-pulse">✦</span>
          <span className="text-xl font-serif">
            <span className="text-teal">Adpt</span>
            <span className="font-bold">Learn</span>
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            className="hidden md:flex font-semibold hover:text-teal"
            onClick={() => navigate("/login")}
          >
            Log in
          </Button>
          <Button
            className="rounded-full bg-teal hover:bg-teal-dark text-white font-semibold px-6 shadow-md transition-transform hover:scale-105"
            onClick={() => navigate("/signup")}
          >
            Sign Up
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 md:px-16 pt-12 pb-20 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-teal/5 rounded-full blur-3xl -z-10" />
        <div className="grid md:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
          {/* Left - Text Animation */}
          <motion.div 
            className="space-y-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange/10 text-orange font-semibold text-sm">
              <Sparkles className="w-4 h-4" />
              <span>AI-Powered Learning Platform</span>
            </motion.div>
            <motion.h1 variants={itemVariants} className="text-5xl md:text-6xl lg:text-7xl font-serif leading-[1.1]">
              Keep <br className="hidden md:block"/>
              <span className="relative inline-block">
                <span className="relative z-10">Learning</span>
                <span className="absolute bottom-1 left-0 w-full h-4 bg-orange/30 -z-10 -rotate-2 rounded"></span>
              </span><br />
              on Track
            </motion.h1>
            <motion.p variants={itemVariants} className="text-muted-foreground max-w-lg text-lg leading-relaxed">
              When every student learns differently, our AI adapts content for students with learning disabilities — giving teachers the freedom to focus on what matters.
            </motion.p>
            <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-4">
              <Button
                className="bg-orange hover:bg-orange/90 text-primary-foreground rounded-full px-8 h-14 text-lg font-bold shadow-xl shadow-orange/20 transition-all hover:pr-6 group cursor-pointer"
                onClick={() => navigate("/signup")}
              >
                <span>Get Started</span>
                <ArrowUpRight className="ml-2 w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </Button>
              <Button
                variant="outline"
                className="rounded-full px-8 h-14 text-lg font-semibold border-border/80 hover:bg-muted"
                onClick={() => { document.getElementById("features")?.scrollIntoView({ behavior: 'smooth' }); }}
              >
                Explore Features
              </Button>
            </motion.div>

            {/* Stats row */}
            <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-6 pt-6 border-t border-border/50">
              <div className="flex items-center gap-3">
                <img src={teacherAvatar} alt="Teacher" width={512} height={512} className="w-12 h-12 rounded-full ring-4 ring-background shadow-md object-cover" loading="lazy" />
                <div>
                  <p className="font-bold text-sm">Best <span className="text-teal">Certified</span></p>
                  <p className="text-xs text-muted-foreground font-medium">Teachers Worldwide</p>
                </div>
              </div>
              <div className="w-px h-10 bg-border/50 hidden md:block"></div>
              <div className="flex items-center gap-4">
                <div className="bg-card rounded-2xl p-2 shadow-sm border border-border/50 flex items-center gap-2">
                  <img src={classroom} alt="Classroom" width={600} height={512} className="w-12 h-10 rounded-xl object-cover" loading="lazy" />
                  <div className="w-8 h-8 bg-orange/10 rounded-lg flex items-center justify-center mr-1">
                    <Star className="w-4 h-4 text-orange fill-orange" />
                  </div>
                </div>
                <div>
                  <p className="font-bold text-3xl">210+</p>
                  <p className="text-xs text-muted-foreground font-medium tracking-wide uppercase">Schools Joined</p>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right - Hero Image */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.5, type: "spring" }}
            className="relative flex justify-center lg:justify-end"
          >
            <div className="absolute top-8 right-8 w-[22rem] h-[26rem] bg-gradient-to-br from-teal/80 to-teal/40 rounded-[3rem] rotate-3 blur-sm shadow-2xl" />
            <div className="absolute bottom-4 left-4 w-24 h-24 bg-orange/20 rounded-full blur-2xl" />
            
            <motion.div 
              animate={{ y: [0, -10, 0] }} 
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              className="absolute top-0 right-24"
            >
              <svg width="40" height="40" viewBox="0 0 40 40" className="text-orange">
                <path d="M20 5 L25 15 L20 10 L15 15 Z" fill="currentColor" />
                <path d="M20 35 L25 25 L20 30 L15 25 Z" fill="currentColor" />
              </svg>
            </motion.div>
            
            <img
              src={heroStudent}
              alt="Student holding books"
              width={800} height={900}
              className="relative z-10 w-80 md:w-96 lg:w-[28rem] object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-700 ease-out"
            />
            
            <motion.div 
              animate={{ opacity: [0.7, 1, 0.7] }} 
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="absolute -left-8 top-1/4 bg-card p-4 rounded-2xl shadow-xl border border-border/50 z-20 flex items-center gap-3"
            >
              <div className="bg-orange/20 p-2 rounded-full">
                <BookOpen className="w-6 h-6 text-orange" />
              </div>
              <div>
                <p className="text-xs font-bold text-teal">Adaptive Lesson</p>
                <p className="text-[10px] text-muted-foreground text-center">Generated in 1.2s</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section - Scroll Animation */}
      <section id="features" className="px-6 md:px-16 py-24 bg-muted/30 border-y border-border/50 relative">
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-serif mb-4">Why Choose <span className="text-teal">AdptLearn?</span></h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Our platform uses advanced AI to create a truly inclusive learning environment, empowering both students and educators to achieve more.
            </p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: <BrainCircuit className="w-8 h-8 text-orange" />, title: "AI-Powered Adaptation", desc: "Automatically converts standard curriculum into accessible formats like Braille, Audio, and simplified text tailored to each student's needs." },
              { icon: <Sparkles className="w-8 h-8 text-teal" />, title: "Engaging Multimedia", desc: "Transforms text-heavy lessons with auto-generated contextual images, clear audio narration, and interactive presentations to maximize engagement." },
              { icon: <Activity className="w-8 h-8 text-blue-500" />, title: "Real-time Tracking", desc: "Teachers get instant, actionable insights into student performance and engagement, allowing for timely interventions and personalized support." }
            ].map((feat, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.2 }}
                className="bg-card p-8 rounded-[2rem] border border-border/50 shadow-sm hover:shadow-2xl hover:shadow-teal/10 transition-all duration-300 hover:-translate-y-2 group"
              >
                <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-background shadow-inner transition-all duration-300">
                  {feat.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{feat.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews Section - Sliding Animation via Framer Motion */}
      <section id="reviews" className="py-24 bg-background overflow-hidden relative">
        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-background to-transparent z-10 hidden md:block" />
        <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-background to-transparent z-10 hidden md:block" />
        
        <div className="max-w-7xl mx-auto px-6 md:px-16 mb-16 relative z-20">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row justify-between items-end gap-6 text-center md:text-left"
          >
            <div className="max-w-2xl mx-auto md:mx-0">
              <h2 className="text-3xl md:text-5xl font-serif mb-4">Trusted by <span className="text-orange relative">Educators</span></h2>
              <p className="text-muted-foreground text-lg">See how AdptLearn is making a tangible difference in classrooms worldwide.</p>
            </div>
          </motion.div>
        </div>
        
        {/* Animated Slide Show / Marquee using Framer Motion */}
        <div className="flex w-[200%] gap-6">
          <motion.div 
            className="flex gap-6 min-w-full"
            animate={{ x: [0, -2600] }} 
            transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
          >
            {reviews.map((review, i) => (
              <div key={i} className="min-w-[400px] w-[400px] bg-card p-8 rounded-[2rem] border border-border/50 relative hover:bg-muted/40 transition-colors duration-300 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex gap-1 mb-6">
                    {[...Array(review.rating)].map((_, j) => <Star key={j} className="w-5 h-5 fill-orange text-orange" />)}
                  </div>
                  <p className="text-foreground leading-relaxed italic mb-8 relative z-10">
                    <span className="text-4xl absolute -top-4 -left-2 text-teal/20 -z-10 font-serif">"</span>
                    {review.text}
                  </p>
                </div>
                <div className="flex items-center gap-4 mt-4">
                  <img src={`https://i.pravatar.cc/100?img=${review.img}`} alt={review.name} className="w-12 h-12 rounded-full object-cover shadow-sm" />
                  <div>
                    <p className="font-bold text-sm">{review.name}</p>
                    <p className="text-xs text-muted-foreground font-medium">{review.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
           <motion.div 
            className="flex gap-6 min-w-full"
            animate={{ x: [0, -2600] }} 
            transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
          >
            {reviews.map((review, i) => (
              <div key={i} className="min-w-[400px] w-[400px] bg-card p-8 rounded-[2rem] border border-border/50 relative hover:bg-muted/40 transition-colors duration-300 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex gap-1 mb-6">
                    {[...Array(review.rating)].map((_, j) => <Star key={j} className="w-5 h-5 fill-orange text-orange" />)}
                  </div>
                  <p className="text-foreground leading-relaxed italic mb-8 relative z-10">
                    <span className="text-4xl absolute -top-4 -left-2 text-teal/20 -z-10 font-serif">"</span>
                    {review.text}
                  </p>
                </div>
                <div className="flex items-center gap-4 mt-4">
                  <img src={`https://i.pravatar.cc/100?img=${review.img}`} alt={review.name} className="w-12 h-12 rounded-full object-cover shadow-sm" />
                  <div>
                    <p className="font-bold text-sm">{review.name}</p>
                    <p className="text-xs text-muted-foreground font-medium">{review.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Detailed Features & Image Section */}
      <section className="py-24 px-6 md:px-16 bg-muted/10 relative overflow-hidden">
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-96 h-96 bg-orange/5 rounded-full blur-3xl -z-10" />
        
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Huge Image with Some Floating Elements */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-teal/20 to-transparent rounded-[2rem] transform -rotate-3 scale-105 -z-10" />
            <img 
              src={classroom} 
              alt="Classroom learning" 
              className="w-full rounded-[2rem] shadow-2xl object-cover h-[500px]"
            />
            {/* Floating feature badge */}
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute -bottom-6 -right-6 bg-card p-4 rounded-2xl shadow-xl border border-border flex items-center gap-4"
            >
              <div className="w-12 h-12 bg-teal/10 rounded-full flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-teal" />
              </div>
              <div>
                <p className="font-bold text-sm">All-in-One</p>
                <p className="text-xs text-muted-foreground">Accessibility Tool</p>
              </div>
            </motion.div>
          </motion.div>

          {/* Right: Feature List */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div>
              <h2 className="text-3xl md:text-5xl font-serif mb-4">
                Designed for <span className="text-orange relative">Impact</span>
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Our comprehensive suite of tools ensures that no student is left behind, breaking down complex lessons into accessible, engaging formats.
              </p>
            </div>

            <div className="space-y-6">
              {[
                { title: "Audio Narration & TTS", desc: "Studio-quality voice synthesis that reads lesson content aloud for auditory learners." },
                { title: "Automated Braille Generation", desc: "Instantly translate text into formatted Braille ready for embossed printing or digital displays." },
                { title: "Smart Presentation Creator", desc: "Convert text documents directly into visual, engaging slide decks with AI-selected imagery." },
                { title: "Simplified Reading Levels", desc: "Adjust reading difficulty dynamically while retaining core educational concepts." },
                { title: "ADHD Racing Adventure", desc: "Voice-controlled racing game that transforms reading practice into an engaging, high-focus challenge." }
              ].map((feat, i) => (
                <div key={i} className="flex gap-4 items-start group">
                  <div className="w-12 h-12 rounded-xl bg-muted/50 flex-shrink-0 flex items-center justify-center group-hover:bg-teal group-hover:text-white transition-colors duration-300">
                    <span className="font-bold">{i + 1}</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold mb-1 group-hover:text-teal transition-colors duration-300">{feat.title}</h4>
                    <p className="text-muted-foreground text-sm leading-relaxed">{feat.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <Button className="mt-8 rounded-full bg-teal hover:bg-teal-dark text-white px-8 h-12 shadow-lg hover:translate-x-2 transition-transform" onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: 'smooth' })}>
              See All Features <ArrowUpRight className="ml-2 w-4 h-4" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 md:px-16 relative overflow-hidden bg-teal m-4 md:m-8 rounded-[3rem] shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange/20 rounded-full blur-[80px] pointer-events-none" />
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto text-center relative z-10"
        >
          <h2 className="text-4xl md:text-6xl font-serif text-white mb-6">
            Ready to <span className="text-orange relative">Transform<svg className="absolute -bottom-2 left-0 w-full h-3 text-orange opacity-40" viewBox="0 0 100 10" preserveAspectRatio="none"><path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="4" fill="none"/></svg></span> Your Classroom?
          </h2>
          <p className="text-teal-50/80 text-xl leading-relaxed max-w-2xl mx-auto mb-10 font-medium">
            Join thousands of educators using AdptLearn to create an inclusive, engaging, and personalized learning experience for every student.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              className="w-full sm:w-auto rounded-full bg-orange hover:bg-orange/90 text-primary-foreground px-10 h-16 text-lg font-bold shadow-xl shadow-orange/20 transition-all hover:scale-105"
              onClick={() => navigate("/signup")}
            >
              Join Now It's Free <ArrowUpRight className="ml-2 w-5 h-5" />
            </Button>
            <Button 
              variant="outline"
              className="w-full sm:w-auto rounded-full px-10 h-16 text-lg font-bold border-white/20 text-white bg-white/5 hover:bg-white/10 hover:text-white transition-all hover:scale-105"
              onClick={() => navigate("/login")}
            >
              Log In to Try
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 md:px-16 py-12 bg-background">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 mb-8">
          <div className="flex items-center gap-1">
            <span className="text-teal text-xl">✦</span>
            <span className="font-serif text-2xl">
              <span className="text-teal">Adpt</span><span className="font-bold">Learn</span>
            </span>
          </div>
          <Button className="bg-orange hover:bg-orange/90 text-primary-foreground rounded-full px-8 font-bold shadow-md hover:shadow-lg transition-all" onClick={() => navigate("/signup")}>
            Subscribe Now
          </Button>
        </div>
        <div className="max-w-7xl mx-auto flex flex-col-reverse md:flex-row items-center justify-between pt-8 border-t border-border/60 gap-4">
          <p className="text-sm text-muted-foreground font-medium">© 2026 AdptLearn. All Rights Reserved</p>
          <div className="flex gap-4">
            {["instagram", "facebook", "twitter", "linkedin"].map((social) => (
              <div key={social} className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-foreground hover:bg-teal hover:text-white transition-all cursor-pointer shadow-sm">
                <span className="text-xs font-bold">{social[0].toUpperCase()}</span>
              </div>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
