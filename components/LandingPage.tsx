
import React from 'react';
import { Sparkles, BrainCircuit, ShieldCheck, GraduationCap, ArrowRight, Zap, Globe, Users, ChevronRight, Play, Lock } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-indigo-500/30 overflow-x-hidden">
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] bg-indigo-600/30 blur-[120px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[55%] h-[55%] bg-purple-600/20 blur-[150px] rounded-full animate-pulse delay-700"></div>
      </div>

      {/* Modern Navigation */}
      <nav className="relative z-50 px-10 py-8 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-4 group cursor-pointer">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center p-1.5 shadow-2xl transform group-hover:rotate-6 transition-transform">
            <img src="https://iili.io/feG2UBt.md.png" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <span className="text-2xl font-black tracking-tighter uppercase">SVGPT</span>
        </div>
        <div className="hidden lg:flex items-center gap-12">
          {['Ecosystem', 'Roles', 'Security', 'Enterprise'].map((item) => (
            <a key={item} href="#" className="text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all">{item}</a>
          ))}
        </div>
        <button onClick={onGetStarted} className="px-8 py-3 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-[0_15px_30px_-5px_rgba(255,255,255,0.2)]">
          Enter Hub
        </button>
      </nav>

      {/* Hero Experience */}
      <section className="relative z-10 pt-24 pb-32 px-10 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 mb-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
           <Zap size={14} className="text-yellow-400" />
           <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">Powered by Gemini 3 Pro Neural Core</span>
        </div>
        
        <h1 className="text-7xl md:text-9xl font-[900] tracking-tighter leading-[0.8] mb-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          SYNTHTESIZING <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">EXCELLENCE.</span>
        </h1>

        <div className="mb-12 animate-in fade-in slide-in-from-bottom-9 duration-1000">
           <p className="text-indigo-400 font-black uppercase tracking-[0.4em] text-xs mb-2">Developed by Founders</p>
           <div className="flex items-center justify-center gap-4 text-lg md:text-xl font-bold text-white">
              <span className="px-4 py-1.5 bg-white/5 rounded-xl border border-white/10">Shreyas Gunjal</span>
              <span className="text-indigo-500 text-2xl font-black">&amp;</span>
              <span className="px-4 py-1.5 bg-white/5 rounded-xl border border-white/10">Vaibhav Chiniwar</span>
           </div>
        </div>
        
        <p className="text-lg md:text-2xl text-slate-400 font-medium max-w-2xl mx-auto mb-16 animate-in fade-in slide-in-from-bottom-10 duration-1000 leading-relaxed">
          The elite, role-based intelligence workspace connecting Educators, Scholars, and Families in one high-performance ecosystem.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-8 animate-in fade-in slide-in-from-bottom-12 duration-1000">
           <button onClick={onGetStarted} className="group px-12 py-6 bg-white text-black rounded-[2.5rem] font-black uppercase tracking-widest text-xs flex items-center gap-4 hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-indigo-500/20">
              Get Started <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
           </button>
           <button className="px-10 py-6 bg-white/5 border border-white/10 text-white rounded-[2.5rem] font-black uppercase tracking-widest text-xs flex items-center gap-4 hover:bg-white/10 transition-all group">
              <Play size={18} fill="currentColor" className="group-hover:scale-110 transition-transform" /> Watch Technical Overview
           </button>
        </div>
      </section>

      {/* Ecosystem Bento Grid */}
      <section className="relative z-10 px-10 py-32 bg-white/[0.02] backdrop-blur-3xl border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="mb-20 text-center lg:text-left">
            <h2 className="text-5xl font-black tracking-tighter uppercase mb-4">Role-Based Intelligence</h2>
            <p className="text-slate-500 font-black uppercase tracking-widest text-xs">Four Pillars of the Educational Ecosystem</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: 'Educator', desc: 'Neural lesson synthesis, instant grading, and curriculum architecture.', icon: GraduationCap, color: 'indigo' },
              { title: 'Scholar', desc: 'Focus modes, neural flashcards, and gamified study quests.', icon: BrainCircuit, color: 'purple' },
              { title: 'Parent', desc: 'Real-time grade heartbeats, attendance tracking, and direct teacher lines.', icon: ShieldCheck, color: 'emerald' },
              { title: 'Institution', desc: 'Macro school analytics, secure access code generation, and governance.', icon: Globe, color: 'pink' }
            ].map((role, i) => (
              <div key={i} className="p-10 rounded-[3rem] bg-black/40 border border-white/5 hover:border-white/20 transition-all group cursor-pointer">
                <div className={`w-16 h-16 rounded-2xl bg-${role.color}-500/10 flex items-center justify-center text-${role.color}-500 mb-10 group-hover:scale-110 transition-transform`}>
                  <role.icon size={32} />
                </div>
                <h3 className="text-2xl font-black uppercase tracking-tight mb-4">{role.title}</h3>
                <p className="text-sm text-slate-500 font-medium leading-relaxed opacity-80">{role.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The Neural Link Section */}
      <section className="relative z-10 px-10 py-40 max-w-7xl mx-auto overflow-hidden">
         <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 rounded-[5rem] border border-white/10 p-12 md:p-24 flex flex-col lg:flex-row items-center gap-20 relative">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/20 blur-[120px] rounded-full -mr-64 -mt-64"></div>
            
            <div className="flex-1 relative z-10 text-center lg:text-left">
               <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.9] mb-10 uppercase">
                 The Neural <br /> Link Protocol.
               </h2>
               <p className="text-xl text-slate-400 font-medium mb-12 leading-relaxed">
                 Institutional security simplified. Schools generate unique encrypted access codes for families, providing a real-time window into scholar performance without manual reporting.
               </p>
               <div className="flex flex-wrap items-center gap-4 justify-center lg:justify-start">
                  <div className="flex items-center gap-3 p-4 bg-black/60 rounded-3xl border border-white/10 shadow-2xl">
                    <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center font-mono font-black text-indigo-400">SV</div>
                    <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center font-mono font-black text-indigo-400">77</div>
                    <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center font-mono font-black text-indigo-400">XX</div>
                    <span className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Encrypted Access Code</span>
                  </div>
               </div>
            </div>

            <div className="w-full lg:w-1/2 relative z-10">
               <div className="aspect-square bg-white/[0.03] rounded-[4rem] border border-white/10 p-12 flex flex-col justify-center gap-10 shadow-3xl backdrop-blur-md">
                  <div className="flex items-center gap-8 p-8 bg-white/5 rounded-[2.5rem] border border-white/5 transform hover:scale-105 transition-all">
                     <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center"><Users size={28} /></div>
                     <div>
                        <p className="text-[10px] font-black uppercase text-emerald-400 tracking-widest mb-1">Scholar Synced</p>
                        <p className="text-xl font-black tracking-tight">Marcus Aurelius</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-8 p-8 bg-white/5 rounded-[2.5rem] border border-white/5 transform hover:scale-105 transition-all">
                     <div className="w-14 h-14 bg-indigo-500/20 text-indigo-400 rounded-2xl flex items-center justify-center"><Lock size={28} /></div>
                     <div>
                        <p className="text-[10px] font-black uppercase text-indigo-400 tracking-widest mb-1">Data Tunneling</p>
                        <p className="text-xl font-black tracking-tight">AES-256 Protocol Active</p>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* Footer Ecosystem */}
      <footer className="relative z-10 px-10 py-24 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 bg-white rounded-xl p-1.5"><img src="https://iili.io/feG2UBt.md.png" className="w-full h-full object-cover" /></div>
             <span className="font-black uppercase text-xl tracking-tighter">SVGPT</span>
          </div>
          <div className="flex flex-col items-center">
            <p className="text-slate-500 text-sm font-medium text-center">© 2024 SVGPT Research &amp; Development. Founders: Shreyas Gunjal &amp; Vaibhav Chiniwar.</p>
            <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest mt-1">Redefining Global Academic Standards</p>
          </div>
          <div className="flex gap-10">
            {['Privacy', 'Terms', 'Security'].map(t => (
              <a key={t} href="#" className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors">{t}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
