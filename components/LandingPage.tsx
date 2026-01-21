
import React from 'react';
import { GraduationCap, Check, Wand2, PenTool, Brain, Moon, ArrowRight, ShieldCheck, Zap, Globe, Users, ChevronRight, LayoutDashboard, Timer } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  return (
    <div className="bg-[#050505] text-white font-sans selection:bg-indigo-500/30">
      <style>{`
        @keyframes neural-pulse {
          0% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.4); }
          70% { box-shadow: 0 0 0 20px rgba(99, 102, 241, 0); }
          100% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0); }
        }
        .animate-neural { animation: neural-pulse 3s infinite; }
        .glass-obsidian {
          background: rgba(15, 15, 15, 0.7);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        .gradient-text-indigo {
          background: linear-gradient(135deg, #818cf8 0%, #c084fc 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      `}</style>

      {/* Navigation */}
      <nav className="fixed w-full z-[100] glass-obsidian">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between h-24 items-center">
            <div className="flex items-center gap-4">
              <div className="bg-indigo-600 p-2.5 rounded-2xl shadow-lg shadow-indigo-900/40">
                <GraduationCap className="text-white" size={28} />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-black tracking-tighter uppercase leading-none">SVGPT</span>
                <span className="text-[9px] font-black tracking-[0.4em] text-indigo-400 uppercase mt-1">Neural Core</span>
              </div>
            </div>
            <div className="hidden lg:flex items-center gap-12 font-black text-[10px] uppercase tracking-[0.2em] text-slate-400">
              <a href="#vision" className="hover:text-white transition-colors">Architecture</a>
              <a href="#features" className="hover:text-white transition-colors">Neural Modules</a>
              <div className="h-4 w-px bg-white/10"></div>
              <p className="text-indigo-400">By Shreyas Gunjal & Vaibhav Chiniwar</p>
            </div>
            <button 
              onClick={onGetStarted}
              className="bg-white text-black px-8 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-500 hover:text-white transition-all shadow-2xl active:scale-95"
            >
              Initialize Nexus
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative pt-48 pb-40 px-6 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/10 blur-[150px] rounded-full animate-pulse"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 blur-[150px] rounded-full animate-pulse delay-700"></div>
        </div>

        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-3 bg-white/5 border border-white/10 px-6 py-2.5 rounded-full text-[10px] font-black mb-12 uppercase tracking-[0.3em] animate-in slide-in-from-top-4 duration-1000">
            <Zap size={14} className="text-yellow-400" /> Lead Developers: Shreyas Gunjal & Vaibhav Chiniwar
          </div>
          
          <h1 className="text-7xl md:text-9xl font-[900] mb-10 tracking-tighter leading-[0.85] uppercase animate-in fade-in zoom-in-95 duration-1000">
            Intelligent <br />
            <span className="gradient-text-indigo">Academia.</span>
          </h1>
          
          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-16 leading-relaxed font-medium animate-in fade-in duration-1000 delay-300">
            The next generation of educational intelligence. Standards-aligned lesson architecting and deep study synthesis for the elite scholar.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-6 animate-in slide-in-from-bottom-8 duration-1000 delay-500">
            <button 
              onClick={onGetStarted}
              className="bg-indigo-600 text-white px-14 py-6 rounded-[2rem] text-xs font-black uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-[0_20px_50px_-10px_rgba(79,70,229,0.5)] hover:scale-105 active:scale-95 group"
            >
              Start as Educator <ArrowRight className="inline ml-2 group-hover:translate-x-1 transition-transform" size={16} />
            </button>
            <button 
              onClick={onGetStarted}
              className="glass-obsidian text-white px-14 py-6 rounded-[2rem] text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all hover:scale-105 active:scale-95"
            >
              Enter Scholar Hub
            </button>
          </div>
        </div>
      </header>

      {/* Feature Grid */}
      <section id="features" className="py-40 relative bg-[#080808]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-10">
            {[
              { 
                title: 'Curriculum Architect', 
                desc: 'Generate standards-aligned lesson plans with high-rigor logic.', 
                icon: Wand2, 
                color: 'text-blue-400' 
              },
              { 
                title: 'Neural Evaluator', 
                desc: 'Precision grading and AI-powered feedback for complex assignments.', 
                icon: ShieldCheck, 
                color: 'text-emerald-400' 
              },
              { 
                title: 'Knowledge Scribe', 
                desc: 'Synthesize structured study archives from any academic asset.', 
                icon: PenTool, 
                color: 'text-purple-400' 
              }
            ].map((feature, i) => (
              <div key={i} className="glass-obsidian p-12 rounded-[3.5rem] hover:border-indigo-500/30 transition-all duration-700 group">
                <div className={`w-16 h-16 rounded-[1.5rem] bg-white/5 flex items-center justify-center mb-10 group-hover:scale-110 transition-transform duration-500 ${feature.color}`}>
                  <feature.icon size={32} />
                </div>
                <h3 className="text-2xl font-black uppercase tracking-tighter mb-4">{feature.title}</h3>
                <p className="text-slate-400 font-medium leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Developers Section */}
      <section className="py-40 bg-[#050505] relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
           <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(99, 102, 241, 0.15) 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
        </div>
        
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
           <div className="w-24 h-px bg-gradient-to-r from-transparent via-indigo-500 to-transparent mx-auto mb-12"></div>
           <h2 className="text-4xl md:text-5xl font-[900] uppercase tracking-tighter mb-8 leading-tight">
             Engineered for <span className="gradient-text-indigo">Excellence.</span>
           </h2>
           <p className="text-lg text-slate-400 mb-16 font-medium leading-relaxed">
             SVGPT is a high-performance neural workspace architected by industry-leading developers to bridge the gap between AI and academic rigor.
           </p>
           
           <div className="flex flex-col md:flex-row justify-center items-center gap-20">
              <div className="flex flex-col items-center group">
                 <div className="w-24 h-24 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-6 group-hover:animate-neural transition-all">
                    <Users size={32} className="text-indigo-400" />
                 </div>
                 <h4 className="text-xl font-black uppercase tracking-tight">Shreyas Gunjal</h4>
                 <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mt-2">Lead Developer</p>
              </div>
              
              <div className="flex flex-col items-center group">
                 <div className="w-24 h-24 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-6 group-hover:animate-neural transition-all">
                    <Users size={32} className="text-purple-400" />
                 </div>
                 <h4 className="text-xl font-black uppercase tracking-tight">Vaibhav Chiniwar</h4>
                 <p className="text-[10px] font-black uppercase tracking-widest text-purple-400 mt-2">Lead Developer</p>
              </div>
           </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black py-24 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-4 mb-12">
            <div className="bg-indigo-600 p-2 rounded-xl">
              <GraduationCap size={24} />
            </div>
            <span className="text-2xl font-black uppercase tracking-tighter">SVGPT</span>
          </div>
          
          <div className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 leading-relaxed">
            © 2026 SVGPT NEURAL SYSTEMS <br />
            ARCHITECTED BY SHREYAS GUNJAL & VAIBHAV CHINIWAR <br />
            ALL RIGHTS RESERVED.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
