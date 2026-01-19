
import React, { useState } from 'react';
import { ShieldCheck, LayoutDashboard, Calendar, TrendingUp, MessageSquare, Key, ArrowRight, CheckCircle2, User, Zap, Lock } from 'lucide-react';

const ParentPortal: React.FC = () => {
  const [accessCode, setAccessCode] = useState('');
  const [isLinked, setIsLinked] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLink = async () => {
    if (!accessCode) return;
    setLoading(true);
    // Simulate Neural Link decryption
    setTimeout(() => {
      setIsLinked(true);
      setLoading(false);
    }, 1500);
  };

  if (!isLinked) {
    return (
      <div className="max-w-xl mx-auto pt-20 animate-in fade-in zoom-in-95">
        <div className="bg-white dark:bg-white/[0.02] backdrop-blur-3xl p-10 rounded-[3.5rem] border border-slate-200 dark:border-white/10 shadow-2xl text-center">
           <div className="w-20 h-20 bg-indigo-500/10 rounded-[2rem] flex items-center justify-center text-indigo-500 mx-auto mb-8">
              <Key size={40} />
           </div>
           <h2 className="text-3xl font-black tracking-tighter uppercase mb-4">Parent Neural Link</h2>
           <p className="text-slate-500 dark:text-slate-400 font-medium mb-10">Enter the unique access code provided by your school to link your parent profile to your child's data stream.</p>
           
           <div className="relative mb-8">
              <input 
                type="text" 
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                placeholder="SV-XXXX-XXXX"
                className="w-full px-8 py-5 rounded-2xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-center text-2xl font-mono font-black text-indigo-500 outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
              />
           </div>

           <button 
             onClick={handleLink}
             disabled={loading || !accessCode}
             className="w-full py-5 premium-gradient text-white rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 shadow-xl active:scale-95 disabled:opacity-50"
           >
             {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <ShieldCheck size={20} />}
             Initialize Link
           </button>
           
           <p className="mt-8 text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center justify-center gap-2">
              <Lock size={12} /> Military-grade end-to-end encryption active
           </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-20 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
        <div>
           <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-[9px] font-black uppercase tracking-widest rounded-full border border-emerald-500/20 flex items-center gap-1">
                 <CheckCircle2 size={10} /> Neural Link Active
              </span>
           </div>
           <h1 className="text-5xl font-black tracking-tighter uppercase">Scholar Heartbeat</h1>
           <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">Monitoring performance for <span className="text-indigo-500 font-bold">Marcus Aurelius</span></p>
        </div>
        <div className="flex gap-3">
           <button className="px-6 py-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50 transition-all">
              <MessageSquare size={16} className="text-indigo-500" /> Contact Teacher
           </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
         <div className="p-8 bg-white dark:bg-white/[0.03] rounded-[2.5rem] border border-slate-200 dark:border-white/10 flex flex-col items-center">
            <TrendingUp size={32} className="text-indigo-500 mb-6" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Academic Score</span>
            <h3 className="text-5xl font-black tracking-tighter">94.2%</h3>
            <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mt-2">+2.4% this month</p>
         </div>
         <div className="p-8 bg-white dark:bg-white/[0.03] rounded-[2.5rem] border border-slate-200 dark:border-white/10 flex flex-col items-center">
            <Calendar size={32} className="text-emerald-500 mb-6" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Attendance Consistency</span>
            <h3 className="text-5xl font-black tracking-tighter">98.5%</h3>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-2">1 Late Departure</p>
         </div>
         <div className="p-8 bg-white dark:bg-white/[0.03] rounded-[2.5rem] border border-slate-200 dark:border-white/10 flex flex-col items-center">
            <Zap size={32} className="text-yellow-500 mb-6" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Neural Mastery Rank</span>
            <h3 className="text-5xl font-black tracking-tighter">PLATINUM</h3>
            <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest mt-2">Top 5% in Physics</p>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <div className="bg-white dark:bg-white/[0.03] rounded-[3rem] border border-slate-200 dark:border-white/10 p-10">
            <h4 className="text-xl font-black uppercase tracking-tight mb-8">Subject Performance</h4>
            <div className="space-y-6">
               {[
                 { s: 'Advanced Physics', p: 98 },
                 { s: 'Molecular Biology', p: 92 },
                 { s: 'World History', p: 88 },
                 { s: 'Calculus BC', p: 95 }
               ].map((item, i) => (
                 <div key={i} className="space-y-2">
                    <div className="flex justify-between items-end">
                       <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{item.s}</span>
                       <span className="text-xs font-black text-indigo-500">{item.p}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                       <div className="h-full premium-gradient rounded-full" style={{ width: `${item.p}%` }}></div>
                    </div>
                 </div>
               ))}
            </div>
         </div>

         <div className="bg-white dark:bg-white/[0.03] rounded-[3rem] border border-slate-200 dark:border-white/10 p-10">
            <div className="flex items-center justify-between mb-8">
               <h4 className="text-xl font-black uppercase tracking-tight">Recent Feedback</h4>
               <button className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">View Archive</button>
            </div>
            <div className="space-y-4">
               {[
                 { t: 'Prof. Xavier', msg: 'Exceptional synthesis on the quantum mechanics assignment.', d: '2h ago' },
                 { t: 'Dr. Strange', msg: 'Attendance remains perfect. High engagement noted.', d: '1d ago' }
               ].map((f, i) => (
                 <div key={i} className="p-5 bg-slate-50 dark:bg-black/40 rounded-2xl border border-slate-100 dark:border-white/5">
                    <p className="text-xs font-black text-indigo-500 uppercase tracking-widest mb-1">{f.t}</p>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">"{f.msg}"</p>
                    <p className="text-[9px] font-bold text-slate-400">{f.d}</p>
                 </div>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
};

export default ParentPortal;
