
import React from 'react';
import { Sparkles, BrainCircuit, ShieldCheck, GraduationCap, ArrowRight, Zap, Globe, Users, ChevronRight, Play, Lock, Code2, Layers, Cpu } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-indigo-500/30 overflow-x-hidden font-sans">
      {/* Cinematic Background Mesh */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-25">
        <div className="absolute top-[-15%] left-[-10%] w-[60%] h-[60%] bg-indigo-600/20 blur-[140px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-15%] w-[70%] h-[70%] bg-purple-600/15 blur-[160px] rounded-full animate-pulse delay-1000"></div>
        <div className="absolute top-[30%] left-[20%] w-[30%] h-[30%] bg-blue-500/10 blur-[100px] rounded-full animate-bounce duration-[10s]"></div>
      </div>

      {/* Persistent Navigation */}
      <nav className="relative z-50 px-6 md:px-12 py-10 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-5 group cursor-pointer">
          <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center p-2 shadow-[0_0_40px_rgba(255,255,255,0.1)] transform group-hover:rotate-12 group-hover:scale-110 transition-all duration-500">
            <img src="https://iili.io/feG2UBt.md.png" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-black tracking-tighter uppercase leading-none">SVGPT</span>
            <span className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.4em] mt-2">Neural Engine v3.0</span>
          </div>
        </div>
        
        <div className="hidden lg:flex items-center gap-14">
          {['Ecosystem', 'Security', 'Enterprise'].map((item) => (
            <a key={item} href={`#${item.toLowerCase()}`} className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-500 hover:text-white transition-all hover:translate-y-[-2px]">{item}</a>
          ))}
        </div>

        <button 
          onClick={onGetStarted} 
          className="group px-10 py-3.5 bg-white text-black rounded-2xl text-[11px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-[0_15px_30px_-5px_rgba(255,255,255,0.2)] flex items-center gap-3"
        >
          Launch Portal <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </nav>

      {/* Hero Experience */}
      <section className="relative z-10 pt-16 pb-40 px-6 md:px-12 max-w-7xl mx-auto text-center">
        {/* Founders Spotlight - High Visibility */}
        <div className="mb-20 animate-in fade-in slide-in-from-bottom-6 duration-1000">
          <div className="inline-flex items-center gap-4 px-6 py-2.5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] mb-10 shadow-2xl">
             <Code2 size={16} className="text-indigo-400" />
             <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Architected by Founders</span>
          </div>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-10 md:gap-24">
            <div className="group relative">
               <div className="absolute -inset-4 bg-indigo-500/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
               <div className="relative flex flex-col items-center">
                  <span className="text-3xl md:text-5xl font-black tracking-tighter text-white group-hover:text-indigo-400 transition-colors duration-500">SHREYAS GUNJAL</span>
                  <div className="w-16 h-1.5 bg-indigo-600/30 rounded-full mt-4 group-hover:w-full transition-all duration-700 ease-expo"></div>
               </div>
            </div>
            
            <div className="text-slate-800 text-5xl font-thin hidden md:block select-none">&</div>
            
            <div className="group relative">
               <div className="absolute -inset-4 bg-purple-500/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
               <div className="relative flex flex-col items-center">
                  <span className="text-3xl md:text-5xl font-black tracking-tighter text-white group-hover:text-purple-400 transition-colors duration-500">VAIBHAV CHINIWAR</span>
                  <div className="w-16 h-1.5 bg-purple-600/30 rounded-full mt-4 group-hover:w-full transition-all duration-700 ease-expo"></div>
               </div>
            </div>
          </div>
        </div>

        <div className="space-y-6 mb-16 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-200">
           <h1 className="text-6xl md:text-[9.5rem] font-[1000] tracking-[-0.08em] leading-[0.8] mb-4">
            SYNTHESIZING <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">EXCELLENCE.</span>
          </h1>
          <p className="text-lg md:text-2xl text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed">
            The next-generation, high-performance intelligence workspace. Engineering the future of global academic standards.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-10 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300">
           <button 
             onClick={onGetStarted} 
             className="group px-16 py-8 bg-white text-black rounded-[3rem] font-black uppercase tracking-widest text-xs flex items-center gap-5 hover:scale-105 active:scale-95 transition-all shadow-[0_25px_50px_-12px_rgba(255,255,255,0.3)] shadow-indigo-500/30"
           >
              Get Started <ChevronRight size={22} className="group-hover:translate-x-1 transition-transform" />
           </button>
           <button className="px-12 py-8 bg-white/5 border border-white/10 text-white rounded-[3rem] font-black uppercase tracking-widest text-xs flex items-center gap-5 hover:bg-white/10 transition-all group backdrop-blur-xl">
              <Play size={20} fill="currentColor" className="group-hover:scale-110 transition-transform" /> Technical Overview
           </button>
        </div>
      </section>

      {/* Bento Grid - Feature Ecosystem */}
      <section id="ecosystem" className="relative z-10 px-6 md:px-12 py-40 bg-white/[0.02] backdrop-blur-[120px] border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="mb-24 text-center">
            <div className="inline-flex items-center gap-3 px-5 py-2 bg-indigo-500/10 rounded-full border border-indigo-500/20 mb-6">
               <Layers size={14} className="text-indigo-400" />
               <span className="text-[9px] font-black uppercase tracking-[0.3em] text-indigo-300">Ecosystem Architecture</span>
            </div>
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase mb-6">Role-Based Intelligence.</h2>
            <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-xs">Four Pillars of Academic Modernization</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: 'Educator', desc: 'Neural lesson architecture, rapid grading, and curriculum synchronization.', icon: GraduationCap, color: 'indigo' },
              { title: 'Scholar', desc: 'Immersive focus environments, neural recall nodes, and gamified mastery.', icon: BrainCircuit, color: 'purple' },
              { title: 'Parent', desc: 'Secure heartbeat monitoring and encrypted direct communication lines.', icon: ShieldCheck, color: 'emerald' },
              { title: 'Institution', desc: 'Macro-analytics, governance tools, and secure access link management.', icon: Globe, color: 'pink' }
            ].map((role, i) => (
              <div key={i} className="p-12 rounded-[4rem] bg-black/40 border border-white/5 hover:border-white/20 transition-all duration-700 group cursor-pointer flex flex-col h-full hover:shadow-[0_0_50px_rgba(255,255,255,0.02)]">
                <div className={`w-20 h-20 rounded-3xl bg-${role.color}-500/10 flex items-center justify-center text-${role.color}-500 mb-12 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-inner`}>
                  <role.icon size={36} />
                </div>
                <h3 className="text-3xl font-black uppercase tracking-tight mb-6 group-hover:text-white transition-colors">{role.title}</h3>
                <p className="text-base text-slate-500 font-medium leading-relaxed opacity-80 flex-1 group-hover:opacity-100 transition-opacity">{role.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The Neural Link Section */}
      <section id="security" className="relative z-10 px-6 md:px-12 py-48 max-w-7xl mx-auto overflow-hidden">
         <div className="bg-gradient-to-br from-indigo-950/40 to-purple-950/40 rounded-[6rem] border border-white/10 p-12 md:p-28 flex flex-col lg:flex-row items-center gap-24 relative shadow-3xl">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500/20 blur-[150px] rounded-full -mr-80 -mt-80 opacity-60"></div>
            
            <div className="flex-1 relative z-10 text-center lg:text-left">
               <h2 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.85] mb-12 uppercase">
                 The Neural <br /> Link Protocol.
               </h2>
               <p className="text-xl md:text-2xl text-slate-400 font-medium mb-14 leading-relaxed">
                 Simplified institutional security. Schools generate encrypted codes for families, establishing a high-bandwidth sync for scholar performance tracking.
               </p>
               <div className="flex flex-wrap items-center gap-6 justify-center lg:justify-start">
                  <div className="flex items-center gap-4 p-6 bg-black/80 rounded-[2.5rem] border border-white/10 shadow-3xl backdrop-blur-2xl">
                    <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center font-mono font-black text-indigo-400 text-xl">SV</div>
                    <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center font-mono font-black text-indigo-400 text-xl">77</div>
                    <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center font-mono font-black text-indigo-400 text-xl">XX</div>
                    <span className="px-6 text-[11px] font-black uppercase tracking-[0.4em] text-slate-500">Encrypted Key</span>
                  </div>
               </div>
            </div>

            <div className="w-full lg:w-1/2 relative z-10">
               <div className="aspect-square bg-white/[0.02] rounded-[5rem] border border-white/10 p-14 flex flex-col justify-center gap-12 shadow-3xl backdrop-blur-3xl">
                  <div className="flex items-center gap-10 p-10 bg-white/5 rounded-[3rem] border border-white/5 transform hover:scale-105 transition-all duration-500 shadow-2xl">
                     <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center shadow-inner"><Users size={32} /></div>
                     <div>
                        <p className="text-[11px] font-black uppercase text-emerald-400 tracking-widest mb-1">Scholar Heartbeat</p>
                        <p className="text-2xl font-black tracking-tight">Handshake Verified</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-10 p-10 bg-white/5 rounded-[3rem] border border-white/5 transform hover:scale-105 transition-all duration-500 shadow-2xl">
                     <div className="w-16 h-16 bg-indigo-500/20 text-indigo-400 rounded-2xl flex items-center justify-center shadow-inner"><Cpu size={32} /></div>
                     <div>
                        <p className="text-[11px] font-black uppercase text-indigo-400 tracking-widest mb-1">Data Pipeline</p>
                        <p className="text-2xl font-black tracking-tight">Active Tunneling</p>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* Global Footer */}
      <footer className="relative z-10 px-6 md:px-12 py-32 border-t border-white/5 bg-black">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-16 text-center md:text-left">
          <div className="flex items-center gap-5">
             <div className="w-14 h-14 bg-white rounded-2xl p-2.5 shadow-2xl"><img src="https://iili.io/feG2UBt.md.png" className="w-full h-full object-cover" /></div>
             <div className="flex flex-col">
                <span className="font-[1000] uppercase text-2xl tracking-tighter leading-none">SVGPT</span>
                <span className="text-[8px] font-black uppercase tracking-[0.6em] text-slate-600 mt-2">The Standard.</span>
             </div>
          </div>
          
          <div className="flex flex-col items-center">
            <p className="text-slate-400 text-base font-bold">© 2024 SVGPT Research & Development.</p>
            <div className="flex items-center gap-3 mt-3">
               <span className="text-indigo-500 text-[11px] font-black uppercase tracking-[0.4em]">Shreyas Gunjal</span>
               <div className="w-1 h-1 bg-slate-800 rounded-full"></div>
               <span className="text-purple-500 text-[11px] font-black uppercase tracking-[0.4em]">Vaibhav Chiniwar</span>
            </div>
          </div>

          <div className="flex gap-12">
            {['Privacy', 'Terms', 'Archive'].map(t => (
              <a key={t} href="#" className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-500 hover:text-white transition-colors">{t}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
