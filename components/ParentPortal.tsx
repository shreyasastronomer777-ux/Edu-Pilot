
import React, { useState } from 'react';
import { ShieldCheck, LayoutDashboard, Calendar, TrendingUp, MessageSquare, Key, ArrowRight, CheckCircle2, User, Zap, Lock, Activity, ArrowUpRight } from 'lucide-react';

const ParentPortal: React.FC = () => {
  const [accessCode, setAccessCode] = useState('');
  const [isLinked, setIsLinked] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLink = async () => {
    if (!accessCode) return;
    setLoading(true);
    // Simulate Neural Link handshake
    setTimeout(() => {
      setIsLinked(true);
      setLoading(false);
    }, 1800);
  };

  if (!isLinked) {
    return (
      <div className="max-w-2xl mx-auto pt-24 animate-in fade-in zoom-in-95 duration-700 px-4">
        <div className="bg-white dark:bg-white/[0.02] backdrop-blur-[100px] p-12 md:p-16 rounded-[4rem] border border-slate-200 dark:border-white/10 shadow-3xl text-center">
           <div className="w-24 h-24 bg-indigo-500/10 rounded-[2.5rem] flex items-center justify-center text-indigo-500 mx-auto mb-10 shadow-inner">
              <Key size={48} />
           </div>
           <h2 className="text-4xl font-black tracking-tighter uppercase mb-6">Parent Neural Link</h2>
           <p className="text-slate-500 dark:text-slate-400 font-medium text-lg mb-12 leading-relaxed">
             Enter the unique institutional access code to securely sync your guardian profile with your child's academic data stream.
           </p>
           
           <div className="relative mb-10">
              <input 
                type="text" 
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                placeholder="SV-XXXX-XXXX"
                className="w-full px-10 py-7 rounded-[2rem] bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-center text-3xl font-mono font-black text-indigo-500 outline-none focus:ring-8 focus:ring-indigo-500/10 transition-all uppercase tracking-widest placeholder:text-slate-300 dark:placeholder:text-slate-800"
              />
           </div>

           <button 
             onClick={handleLink}
             disabled={loading || !accessCode}
             className="w-full py-6 premium-gradient text-white rounded-[2rem] font-black uppercase tracking-widest text-sm flex items-center justify-center gap-4 shadow-2xl shadow-indigo-500/20 active:scale-95 disabled:opacity-50 transition-all"
           >
             {loading ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <ShieldCheck size={22} />}
             Authorize Neural Link
           </button>
           
           <div className="mt-12 flex items-center justify-center gap-3 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
              <Lock size={14} className="text-indigo-500" /> End-to-End Encrypted Tunneling Active
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pb-24 px-6 animate-in fade-in duration-1000">
      <header className="flex flex-col lg:flex-row justify-between items-end gap-8 mb-16">
        <div className="space-y-4 text-left">
           <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-500/20">
              <CheckCircle2 size={12} /> Institutional Sync: Active
           </div>
           <h1 className="text-6xl font-black tracking-tighter uppercase leading-[0.9]">Scholar Heartbeat</h1>
           <p className="text-slate-500 dark:text-slate-400 font-medium text-xl">
             Monitoring trajectory for <span className="text-indigo-500 font-bold">Marcus Aurelius</span>
           </p>
        </div>
        <div className="flex gap-4">
           <button className="px-8 py-4 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-3 hover:bg-slate-50 transition-all shadow-sm">
              <MessageSquare size={18} className="text-indigo-500" /> Open Secure Comm Line
           </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mb-16">
         <div className="p-10 bg-white dark:bg-white/[0.03] rounded-[3.5rem] border border-slate-200 dark:border-white/10 flex flex-col items-center text-center shadow-sm">
            <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-500 mb-8"><TrendingUp size={32} /></div>
            <span className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2">Mastery Index</span>
            <h3 className="text-6xl font-[900] tracking-tighter">94.2%</h3>
            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mt-4 flex items-center gap-1">
               <ArrowUpRight size={14} /> +2.4% Neural Velocity
            </p>
         </div>
         
         <div className="p-10 bg-white dark:bg-white/[0.03] rounded-[3.5rem] border border-slate-200 dark:border-white/10 flex flex-col items-center text-center shadow-sm">
            <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 mb-8"><Calendar size={32} /></div>
            <span className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2">Attendance Rhythm</span>
            <h3 className="text-6xl font-[900] tracking-tighter">98.5%</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-4">1 Minimal Delay Logged</p>
         </div>

         <div className="p-10 bg-white dark:bg-white/[0.03] rounded-[3.5rem] border border-slate-200 dark:border-white/10 flex flex-col items-center text-center shadow-sm">
            <div className="w-16 h-16 bg-yellow-500/10 rounded-2xl flex items-center justify-center text-yellow-500 mb-8"><Zap size={32} /></div>
            <span className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2">Academic Tier</span>
            <h3 className="text-6xl font-[900] tracking-tighter text-indigo-500">GOLD</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-4">Top 5% Institutional Peer Group</p>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
         <div className="bg-white dark:bg-white/[0.03] rounded-[4rem] border border-slate-200 dark:border-white/10 p-12 shadow-sm">
            <h4 className="text-2xl font-black uppercase tracking-tight mb-10 flex items-center gap-3">
               <Activity className="text-indigo-500" size={24} /> Subject Analysis
            </h4>
            <div className="space-y-8">
               {[
                 { s: 'Quantum Physics', p: 98, c: 'bg-indigo-500' },
                 { s: 'Advanced Calculus', p: 92, c: 'bg-purple-500' },
                 { s: 'Bio-Architecture', p: 88, c: 'bg-pink-500' },
                 { s: 'World History', p: 95, c: 'bg-emerald-500' }
               ].map((item, i) => (
                 <div key={i} className="space-y-3">
                    <div className="flex justify-between items-end">
                       <span className="text-sm font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">{item.s}</span>
                       <span className="text-xs font-black text-indigo-500">{item.p}% Mastery</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden shadow-inner">
                       <div className={`h-full ${item.c} rounded-full transition-all duration-1000 shadow-lg`} style={{ width: `${item.p}%` }}></div>
                    </div>
                 </div>
               ))}
            </div>
         </div>

         <div className="bg-white dark:bg-white/[0.03] rounded-[4rem] border border-slate-200 dark:border-white/10 p-12 shadow-sm">
            <div className="flex items-center justify-between mb-10">
               <h4 className="text-2xl font-black uppercase tracking-tight">Teacher Briefings</h4>
               <button className="text-[10px] font-black text-indigo-500 uppercase tracking-widest hover:underline">Full Archive</button>
            </div>
            <div className="space-y-6">
               {[
                 { t: 'Prof. Julian Xavier', msg: 'Exceptional synthesis demonstrated in the latest research asset. Mastery Tier confirmed.', d: '2h ago', role: 'Physics Chair' },
                 { t: 'Dr. Sarah Connor', msg: 'Attendance remains perfect. High engagement noted during the neural focus sessions.', d: '1d ago', role: 'History Lead' }
               ].map((f, i) => (
                 <div key={i} className="p-8 bg-slate-50 dark:bg-black/40 rounded-[2.5rem] border border-slate-100 dark:border-white/5 group hover:border-indigo-500/30 transition-all">
                    <div className="flex justify-between items-start mb-4">
                       <div>
                          <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{f.t}</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{f.role}</p>
                       </div>
                       <p className="text-[9px] font-bold text-slate-400 uppercase">{f.d}</p>
                    </div>
                    <p className="text-base font-medium text-slate-600 dark:text-slate-300 leading-relaxed italic">"{f.msg}"</p>
                 </div>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
};

export default ParentPortal;
