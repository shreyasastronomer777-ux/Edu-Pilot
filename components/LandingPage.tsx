import React from 'react';
import { GraduationCap, Check, Wand2, PenTool, Brain, Moon, ArrowRight, ShieldCheck, Zap, Globe, Users, ChevronRight, LayoutDashboard, Timer, Lock, HeartHandshake } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  return (
    <div className="bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900 overflow-x-hidden">
      <style>{`
        .gradient-text {
            background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        .feature-card {
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .feature-card:hover {
            transform: translateY(-8px);
            box-shadow: 0 20px 40px -12px rgba(0, 0, 0, 0.08);
        }
        .glass-nav {
            background: rgba(255, 255, 255, 0.85);
            backdrop-filter: blur(12px);
            border-bottom: 1px solid rgba(229, 231, 235, 0.3);
        }
      `}</style>

      {/* Navigation */}
      <nav className="fixed w-full z-50 glass-nav">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 p-2.5 rounded-xl shadow-lg shadow-indigo-200">
                <GraduationCap className="text-white" size={24} />
              </div>
              <span className="text-2xl font-black tracking-tighter text-slate-900 uppercase">SVGPT</span>
            </div>
            <div className="hidden md:flex space-x-10 font-bold text-[11px] uppercase tracking-widest text-slate-500">
              <a href="#teachers" className="hover:text-indigo-600 transition-colors">Educators</a>
              <a href="#students" className="hover:text-indigo-600 transition-colors">Scholars</a>
              <a href="#philosophy" className="hover:text-indigo-600 transition-colors">Philosophy</a>
            </div>
            <div>
              <button 
                onClick={onGetStarted}
                className="bg-indigo-600 text-white px-8 py-3 rounded-full font-black text-[11px] uppercase tracking-widest hover:bg-indigo-700 transition shadow-xl shadow-indigo-100 active:scale-95"
              >
                Access Nexus
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="pt-48 pb-32 px-6 bg-white overflow-hidden relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-full pointer-events-none opacity-20">
          <div className="absolute top-20 left-0 w-72 h-72 bg-indigo-400 blur-[120px] rounded-full"></div>
          <div className="absolute bottom-20 right-0 w-72 h-72 bg-purple-400 blur-[120px] rounded-full"></div>
        </div>

        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-5 py-2 rounded-full text-[10px] font-black mb-8 uppercase tracking-[0.2em] border border-indigo-100">
             <Zap size={14} /> SVGPT v3.0 | Now in Global Beta
          </div>
          <h1 className="text-6xl md:text-8xl font-[900] mb-8 tracking-tighter leading-[0.9] text-slate-900 uppercase">
            Teach Better. <br />
            <span className="gradient-text">Learn Smarter.</span>
          </h1>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-14 leading-relaxed font-medium">
            The intelligent academic operating system. Handling the heavy lifting for educators and providing a distraction-free sanctuary for scholars.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <button 
              onClick={onGetStarted}
              className="bg-indigo-600 text-white px-12 py-5 rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-200 hover:scale-105 active:scale-95"
            >
              Enter as Educator
            </button>
            <button 
              onClick={onGetStarted}
              className="bg-white border-2 border-slate-200 text-slate-700 px-12 py-5 rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-slate-50 transition-all hover:scale-105 active:scale-95"
            >
              Enter as Scholar
            </button>
          </div>
        </div>
      </header>

      {/* Philosophy Section - Inspired by Shared Add */}
      <section id="philosophy" className="py-24 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 blur-[120px] rounded-full"></div>
        <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full text-[10px] font-black mb-8 uppercase tracking-widest text-indigo-400">
               Polite Intelligence Architecture
            </div>
            <h2 className="text-4xl md:text-5xl font-[900] mb-8 tracking-tighter uppercase leading-tight">Supportive, Not Intrusive.</h2>
            <p className="text-xl text-slate-400 mb-16 leading-relaxed max-w-3xl mx-auto">
                We believe ed-tech should be a silent partner. SVGPT uses a "Polite First" architecture—meaning it respects student flow, safeguards privacy, and assists teachers without replacing the human element.
            </p>
            <div className="grid md:grid-cols-3 gap-8">
                <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/10 text-left feature-card">
                    <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400 mb-6"><Lock size={24} /></div>
                    <h4 className="font-black mb-3 uppercase tracking-tight">Privacy First</h4>
                    <p className="text-slate-500 text-sm leading-relaxed">Your data is yours. Academic assets are processed in isolated neural buffers and never sold.</p>
                </div>
                <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/10 text-left feature-card">
                    <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400 mb-6"><HeartHandshake size={24} /></div>
                    <h4 className="font-black mb-3 uppercase tracking-tight">Non-Intrusive</h4>
                    <p className="text-slate-500 text-sm leading-relaxed">No unnecessary pings. SVGPT acts as a quiet, helping hand that activates only when summoned.</p>
                </div>
                <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/10 text-left feature-card">
                    <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center text-purple-400 mb-6"><GraduationCap size={24} /></div>
                    <h4 className="font-black mb-3 uppercase tracking-tight">Teacher-Led</h4>
                    <p className="text-slate-500 text-sm leading-relaxed">AI functions as a specialized lab assistant, following the educator's specific pedagogical directive.</p>
                </div>
            </div>
        </div>
      </section>

      {/* Teacher Section */}
      <section id="teachers" className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-24 items-center">
            <div className="staggered-fade-in">
              <div className="text-indigo-600 font-black mb-4 uppercase tracking-[0.3em] text-xs">The Educator Suite</div>
              <h2 className="text-5xl font-[900] mb-8 tracking-tighter leading-tight uppercase text-slate-900">Reclaim 10+ hours <br />every <span className="text-indigo-600">single week.</span></h2>
              <p className="text-lg text-slate-500 font-medium mb-12 leading-relaxed">SVGPT handles the repetitive logistics. From standard-aligned planning to multimodal quiz generation, we help you refocus on the art of teaching.</p>
              
              <ul className="space-y-8">
                <li className="flex items-start gap-6 group">
                  <div className="bg-indigo-600/10 p-3 rounded-2xl text-indigo-600 transition-transform group-hover:scale-110 shadow-sm"><Wand2 size={24} /></div>
                  <div>
                    <h4 className="font-black text-xl text-slate-900 uppercase tracking-tight">Lesson Architect</h4>
                    <p className="text-slate-500 font-medium mt-1">Generate deep curriculum blueprints from a single prompt.</p>
                  </div>
                </li>
                <li className="flex items-start gap-6 group">
                  <div className="bg-emerald-600/10 p-3 rounded-2xl text-emerald-600 transition-transform group-hover:scale-110 shadow-sm"><Globe size={24} /></div>
                  <div>
                    <h4 className="font-black text-xl text-slate-900 uppercase tracking-tight">Evaluator AI</h4>
                    <p className="text-slate-500 font-medium mt-1">Instant, high-rigor grading and feedback for text and scans.</p>
                  </div>
                </li>
              </ul>
            </div>
            <div className="bg-slate-50 rounded-[4rem] p-10 relative overflow-hidden shadow-2xl border border-slate-100">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5"></div>
              <img src="https://images.unsplash.com/photo-1544717297-fa154daaf762?auto=format&fit=crop&q=80&w=800" alt="Dashboard Preview" className="rounded-[3rem] shadow-3xl relative z-10 grayscale-[20%]" />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-50 border-t border-slate-200 py-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-10">
            <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg">
              <GraduationCap size={24} />
            </div>
            <span className="text-2xl font-black text-slate-900 uppercase tracking-tighter">SVGPT</span>
          </div>
          <p className="mb-12 text-slate-500 font-medium max-w-md mx-auto">Empowering the next generation of academic leaders with polite, powerful intelligence.</p>
          <div className="pt-10 border-t border-slate-200 text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">
            © 2026 SVGPT Intelligence Systems. Engineered with precision by Shreyas Gunjal & Vaibhav Chiniwar.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;