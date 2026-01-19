
import React from 'react';
import { Sparkles, ChevronRight, Menu, Globe, BrainCircuit, PlayCircle } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#7C83FD] to-[#9499ff] flex items-center justify-center p-4 md:p-12 selection:bg-indigo-500/30 overflow-hidden font-sans">
      {/* Main White Card Container */}
      <div className="w-full max-w-[1400px] bg-white rounded-[3rem] md:rounded-[5rem] shadow-[0_50px_100px_-20px_rgba(75,73,172,0.3)] overflow-hidden flex flex-col min-h-[85vh] relative animate-in fade-in zoom-in-95 duration-1000">
        
        {/* Navigation Bar */}
        <nav className="w-full px-8 md:px-20 py-10 flex items-center justify-between z-20">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-12 h-12 bg-[#4B49AC] rounded-2xl flex items-center justify-center shadow-lg transform group-hover:rotate-6 transition-transform">
              <Sparkles className="text-white" size={24} />
            </div>
            <span className="text-2xl font-black tracking-tighter text-[#1F2937] uppercase">SVGPT</span>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-14">
            {['Home', 'About us', 'Course', 'Pricing', 'Contact'].map((item) => (
              <a 
                key={item} 
                href="#" 
                className="text-sm font-extrabold text-slate-500 hover:text-[#4B49AC] transition-colors relative group"
              >
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#4B49AC] transition-all group-hover:w-full"></span>
              </a>
            ))}
          </div>

          {/* CTA / Menu */}
          <div className="flex items-center gap-6">
            <button 
              onClick={onGetStarted}
              className="hidden md:block px-10 py-3.5 bg-[#4B49AC] text-white rounded-full text-xs font-black uppercase tracking-widest hover:bg-[#3f3da0] hover:scale-105 active:scale-95 transition-all shadow-xl shadow-[#4b49ac]/30"
            >
              Get Started
            </button>
            <button className="lg:hidden p-3 bg-slate-50 rounded-xl text-slate-600">
              <Menu size={24} />
            </button>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="flex-1 flex flex-col lg:flex-row items-center px-8 md:px-24 py-12 gap-16 relative z-10">
          
          {/* Text Content - Left Side */}
          <div className="flex-1 space-y-10 text-center lg:text-left">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-5 py-2 bg-[#4B49AC]/10 rounded-full border border-[#4B49AC]/20">
                <BrainCircuit size={16} className="text-[#4B49AC]" />
                <span className="text-[11px] font-black uppercase tracking-widest text-[#4B49AC]">Next-Gen Intelligence</span>
              </div>

              <h1 className="text-6xl md:text-8xl font-[900] text-[#1F2937] leading-[0.95] tracking-tighter">
                ACADEMIC <br />
                <span className="text-[#4B49AC]">WORKSPACE.</span>
              </h1>
              
              <p className="text-slate-500 text-lg md:text-xl font-medium max-w-xl leading-relaxed mx-auto lg:mx-0 opacity-80">
                Synthesizing global academic excellence with Gemini 3 Pro. An elite, high-performance toolkit designed for modern educators and scholars.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-5 justify-center lg:justify-start">
              <button 
                onClick={onGetStarted}
                className="px-12 py-6 bg-[#4B49AC] text-white rounded-full font-black uppercase tracking-widest text-xs shadow-[0_20px_40px_-10px_rgba(75,73,172,0.4)] hover:scale-105 active:scale-95 transition-all flex items-center gap-4 group"
              >
                More Info <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
              
              <div className="flex items-center gap-4 px-8 py-5 rounded-full hover:bg-slate-50 cursor-pointer transition-all group">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-[#4B49AC] group-hover:bg-[#4B49AC] group-hover:text-white transition-all shadow-sm">
                  <PlayCircle size={22} />
                </div>
                <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Watch Demo</span>
              </div>
            </div>
          </div>

          {/* Illustration - Right Side */}
          <div className="flex-1 w-full relative">
            <div className="relative z-10 w-full animate-in slide-in-from-right-12 duration-1000 delay-200">
               <img 
                 src="https://img.freepik.com/free-vector/creative-team-working-on-project_23-2148408892.jpg?t=st=1716383000~exp=1716386600~hmac=62d85b14f884a9e992b45f448c5b04961559868846b9a89b47e5b5" 
                 alt="Scholars Collaborating"
                 className="w-full h-auto drop-shadow-[0_40px_60px_rgba(0,0,0,0.15)] scale-110 md:scale-125"
               />
            </div>
            
            {/* Background Accent Blobs */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] bg-gradient-to-br from-[#7C83FD]/10 to-transparent rounded-full blur-[100px] -z-0"></div>
          </div>
        </div>

        {/* Footer Bar (Contained in Card) */}
        <div className="w-full px-12 md:px-24 py-12 border-t border-slate-50 flex flex-col md:flex-row items-center justify-between text-[#94A3B8] text-[10px] font-black uppercase tracking-[0.3em] relative z-10">
           <div className="flex items-center gap-3">
             <div className="w-2 h-2 bg-[#4B49AC] rounded-full animate-pulse"></div>
             <span>Engineered for Excellence</span>
           </div>
           <div className="flex gap-12 mt-6 md:mt-0">
             <span className="hover:text-[#4B49AC] cursor-pointer transition-colors">Security Registry</span>
             <span className="hover:text-[#4B49AC] cursor-pointer transition-colors">Neural Docs</span>
             <span className="hover:text-[#4B49AC] cursor-pointer transition-colors">Privacy</span>
           </div>
        </div>

        {/* Decorative SVG Wave Accent (Simulating reference image curve) */}
        <div className="absolute bottom-0 right-0 w-[70%] h-[80%] -z-0 pointer-events-none opacity-[0.08] transform translate-x-[15%] translate-y-[15%]">
           <svg viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
             <path 
               d="M0,1000 C300,850 450,1000 750,750 C1050,500 1000,150 1000,0 L1000,1000 L0,1000 Z" 
               fill="#4B49AC"
             ></path>
           </svg>
        </div>
      </div>

      {/* Decorative Outer Elements */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-white/20 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#4B49AC]/20 blur-[150px] rounded-full pointer-events-none"></div>
    </div>
  );
};

export default LandingPage;
