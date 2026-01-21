
import React from 'react';
import { GraduationCap, Check, Wand2, PenTool, Brain, Moon, ArrowRight, ShieldCheck, Zap, Globe, Users, ChevronRight, LayoutDashboard, Timer } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  return (
    <div className="bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;800&display=swap');
        
        .glass-nav {
            background: rgba(255, 255, 255, 0.8);
            backdrop-filter: blur(10px);
            border-bottom: 1px solid rgba(229, 231, 235, 0.5);
        }

        .gradient-text {
            background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .feature-card {
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .feature-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
        }

        .focus-mode-glow {
            box-shadow: 0 0 20px rgba(99, 102, 241, 0.4);
        }
      `}</style>

      {/* Navigation */}
      <nav className="fixed w-full z-50 glass-nav">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 p-2.5 rounded-xl shadow-lg shadow-indigo-200">
                <GraduationCap className="text-white" size={24} />
              </div>
              <span className="text-2xl font-black tracking-tighter text-slate-900 uppercase">SVGPT</span>
            </div>
            <div className="hidden md:flex space-x-10 font-bold text-[11px] uppercase tracking-widest text-slate-500">
              <a href="#teachers" className="hover:text-indigo-600 transition-colors">For Teachers</a>
              <a href="#students" className="hover:text-indigo-600 transition-colors">For Students</a>
              <p className="text-indigo-500 font-black">By Shreyas Gunjal & Vaibhav Chiniwar</p>
            </div>
            <div>
              <button 
                onClick={onGetStarted}
                className="bg-indigo-600 text-white px-8 py-3 rounded-full font-black text-[11px] uppercase tracking-widest hover:bg-indigo-700 transition shadow-xl shadow-indigo-100 active:scale-95"
              >
                Enter Nexus
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
            <Zap size={14} /> Shreyas Gunjal & Vaibhav Chiniwar Present
          </div>
          <h1 className="text-6xl md:text-8xl font-[900] mb-8 tracking-tighter leading-[0.9] text-slate-900 uppercase">
            One Platform for <br />
            <span className="gradient-text">Teachers & Students</span>
          </h1>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-14 leading-relaxed font-medium">
            Streamline lesson planning, automate grading, and empower students with high-performance neural modules. Engineered by Shreyas Gunjal and Vaibhav Chiniwar.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <button 
              onClick={onGetStarted}
              className="bg-indigo-600 text-white px-12 py-5 rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-200 hover:scale-105 active:scale-95"
            >
              I'm a Teacher
            </button>
            <button 
              onClick={onGetStarted}
              className="bg-white border-2 border-slate-200 text-slate-700 px-12 py-5 rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-slate-50 transition-all hover:scale-105 active:scale-95"
            >
              I'm a Student
            </button>
          </div>
        </div>
      </header>

      {/* Teacher Section */}
      <section id="teachers" className="py-32 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-20 items-center">
            <div className="staggered-fade-in">
              <div className="text-indigo-600 font-black mb-4 uppercase tracking-[0.3em] text-xs">Empowering Educators</div>
              <h2 className="text-5xl font-[900] mb-8 tracking-tighter leading-tight uppercase text-slate-900">Master Your Curriculum with <span className="text-indigo-600">Precision</span></h2>
              <p className="text-lg text-slate-500 font-medium mb-12 leading-relaxed">Stop drowning in paperwork. Our teacher-first tools help you reclaim your time so you can focus on what matters: teaching.</p>
              
              <ul className="space-y-8">
                <li className="flex items-start gap-6 group">
                  <div className="bg-indigo-600/10 p-3 rounded-2xl text-indigo-600 transition-transform group-hover:scale-110"><Check size={24} strokeWidth={3} /></div>
                  <div>
                    <h4 className="font-black text-xl text-slate-900 uppercase tracking-tight">Neural Lesson Planner</h4>
                    <p className="text-slate-500 font-medium mt-1">Generate full curriculum-aligned plans in seconds.</p>
                  </div>
                </li>
                <li className="flex items-start gap-6 group">
                  <div className="bg-indigo-600/10 p-3 rounded-2xl text-indigo-600 transition-transform group-hover:scale-110"><Wand2 size={24} /></div>
                  <div>
                    <h4 className="font-black text-xl text-slate-900 uppercase tracking-tight">Instant Quiz Forge</h4>
                    <p className="text-slate-500 font-medium mt-1">Transform any PDF or text into interactive quizzes instantly.</p>
                  </div>
                </li>
                <li className="flex items-start gap-6 group">
                  <div className="bg-indigo-600/10 p-3 rounded-2xl text-indigo-600 transition-transform group-hover:scale-110"><ShieldCheck size={24} /></div>
                  <div>
                    <h4 className="font-black text-xl text-slate-900 uppercase tracking-tight">Smart Evaluator Pro</h4>
                    <p className="text-slate-500 font-medium mt-1">High-rigor grading and feedback for faster turnarounds.</p>
                  </div>
                </li>
              </ul>
            </div>
            <div className="bg-indigo-100 rounded-[3rem] p-10 relative overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10"></div>
              <img src="https://images.unsplash.com/photo-1544717297-fa154daaf762?auto=format&fit=crop&q=80&w=800" alt="Teacher Dashboard" className="rounded-[2rem] shadow-2xl relative z-10 grayscale-[20%]" />
              <div className="absolute bottom-12 right-12 bg-white/90 backdrop-blur-xl p-6 rounded-3xl shadow-2xl flex items-center gap-4 border border-white z-20 animate-bounce duration-[3000ms]">
                <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                  <Wand2 size={24} />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Neural Link</p>
                  <p className="font-black text-slate-900 text-sm">Quiz Generated!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Student Section */}
      <section id="students" className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-20 items-center">
            <div className="order-2 md:order-1 bg-[#050505] rounded-[3.5rem] p-12 relative focus-mode-glow overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-950 to-transparent opacity-50"></div>
              <div className="relative z-10 bg-white/5 backdrop-blur-3xl rounded-[2.5rem] p-8 border border-white/10 shadow-2xl">
                <div className="flex justify-between items-center mb-10">
                  <div className="flex items-center gap-3">
                    <Timer className="text-indigo-400" size={20} />
                    <span className="text-indigo-200 text-[10px] font-black uppercase tracking-[0.3em]">Focus Mode: ON</span>
                  </div>
                  <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]"></div>
                </div>
                <div className="space-y-6">
                  <div className="bg-white/5 p-6 rounded-2xl text-indigo-100 text-sm font-medium italic border border-white/5">
                    "Hey Scholar! Ready to deconstruct this theory with the Neural Core?"
                  </div>
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-500 flex-shrink-0 flex items-center justify-center shadow-lg shadow-indigo-500/20"><Brain size={20} className="text-white" /></div>
                    <div className="bg-white/5 p-4 rounded-2xl text-indigo-200 text-[11px] w-full border border-white/5 font-bold tracking-tight">
                      Analyzing: Core concepts mapped for instant recall.
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-indigo-600/20 blur-[60px] rounded-full"></div>
            </div>
            <div className="order-1 md:order-2">
              <div className="text-purple-600 font-black mb-4 uppercase tracking-[0.3em] text-xs">Next-Gen Learning</div>
              <h2 className="text-5xl font-[900] mb-8 tracking-tighter leading-tight uppercase text-slate-900">The Study Sanctuary for <span className="text-purple-600">Top Scholars</span></h2>
              <p className="text-lg text-slate-500 font-medium mb-12 leading-relaxed">An intelligent companion engineered for academic excellence.</p>
              
              <ul className="space-y-8">
                <li className="flex items-center gap-6 group">
                  <div className="bg-purple-600/10 w-14 h-14 rounded-2xl flex items-center justify-center text-purple-600 transition-all group-hover:bg-purple-600 group-hover:text-white shadow-sm"><PenTool size={24} /></div>
                  <div>
                    <h4 className="font-black text-xl text-slate-900 uppercase tracking-tight">Smart Scribe</h4>
                    <p className="text-slate-500 font-medium">Auto-generate structured notes from photos or text.</p>
                  </div>
                </li>
                <li className="flex items-center gap-6 group">
                  <div className="bg-purple-600/10 w-14 h-14 rounded-2xl flex items-center justify-center text-purple-600 transition-all group-hover:bg-purple-600 group-hover:text-white shadow-sm"><Brain size={24} /></div>
                  <div>
                    <h4 className="font-black text-xl text-slate-900 uppercase tracking-tight">24/7 Neural Tutor</h4>
                    <p className="text-slate-500 font-medium">Ask questions in real-time without leaving your study session.</p>
                  </div>
                </li>
                <li className="flex items-center gap-6 group">
                  <div className="bg-purple-600/10 w-14 h-14 rounded-2xl flex items-center justify-center text-purple-600 transition-all group-hover:bg-purple-600 group-hover:text-white shadow-sm"><Moon size={24} /></div>
                  <div>
                    <h4 className="font-black text-xl text-slate-900 uppercase tracking-tight">Focus Shield</h4>
                    <p className="text-slate-500 font-medium">Distraction-free mode with an integrated neural timer.</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-10">
            <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-900/40">
              <GraduationCap size={24} />
            </div>
            <span className="text-2xl font-black text-white uppercase tracking-tighter">SVGPT</span>
          </div>
          <p className="mb-6 text-lg font-medium max-w-md mx-auto">Empowering the next generation of global thinkers and academic leaders.</p>
          <div className="mb-12">
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-indigo-500 mb-2">Lead Developers</p>
            <p className="text-white font-bold tracking-widest text-lg">Shreyas Gunjal & Vaibhav Chiniwar</p>
          </div>
          <div className="text-[10px] font-black uppercase tracking-[0.4em] border-t border-slate-800 pt-12 text-slate-600">
            © 2026 SVGPT Intelligence Systems. All rights reserved. <br /> Designed by Shreyas Gunjal & Vaibhav Chiniwar.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
