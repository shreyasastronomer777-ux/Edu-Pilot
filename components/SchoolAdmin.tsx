
import React, { useState } from 'react';
import { Globe, Plus, Search, FileText, Key, Trash2, ShieldCheck, Download, Activity, LayoutGrid, Users, Zap, MoreHorizontal } from 'lucide-react';
import { AccessCode } from '../types';

const SchoolAdmin: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'registry' | 'reports'>('registry');
  const [codes, setCodes] = useState<AccessCode[]>([
    { code: 'SV-9912-XJ21', studentId: 'S-101', studentName: 'Marcus Aurelius', expires: '2024-12-31' },
    { code: 'SV-1288-PA09', studentId: 'S-102', studentName: 'Elena Gilbert', expires: '2024-12-31' },
    { code: 'SV-4450-ZB77', studentId: 'S-103', studentName: 'Peter Parker', expires: '2024-12-31' }
  ]);

  const generateCode = () => {
    const newCode: AccessCode = {
      code: `SV-${Math.floor(1000 + Math.random() * 9000)}-${Math.random().toString(36).substring(7).toUpperCase()}`,
      studentId: `S-${Math.floor(100 + Math.random() * 900)}`,
      studentName: 'Registration Staged',
      expires: '2025-06-30'
    };
    setCodes([newCode, ...codes]);
  };

  return (
    <div className="max-w-7xl mx-auto pb-24 px-6 animate-in fade-in duration-1000">
      <header className="mb-16 flex flex-col lg:flex-row justify-between items-end gap-10">
        <div className="space-y-4">
           <div className="flex items-center gap-3">
              <div className="p-2.5 bg-pink-500/10 rounded-xl">
                 <Globe className="text-pink-500" size={24} />
              </div>
              <span className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">Institutional Hub</span>
           </div>
           <h1 className="text-6xl font-black tracking-tighter uppercase leading-[0.9]">School Governance</h1>
           <p className="text-slate-500 dark:text-slate-400 font-medium text-xl">
             Managing neural architecture for <span className="text-pink-500 font-bold">Horizon Academy Global</span>
           </p>
        </div>
        
        <div className="flex p-1.5 bg-slate-100 dark:bg-white/5 rounded-[1.8rem] border border-slate-200 dark:border-white/10 shadow-inner backdrop-blur-xl">
           <button 
             onClick={() => setActiveTab('registry')}
             className={`px-10 py-3.5 rounded-[1.4rem] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'registry' ? 'bg-white dark:bg-slate-700 text-pink-500 shadow-2xl' : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'}`}
           >
             <Key size={16} className="inline mr-2" /> Access Link Registry
           </button>
           <button 
             onClick={() => setActiveTab('reports')}
             className={`px-10 py-3.5 rounded-[1.4rem] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'reports' ? 'bg-white dark:bg-slate-700 text-pink-500 shadow-2xl' : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'}`}
           >
             <FileText size={16} className="inline mr-2" /> Institutional Reports
           </button>
        </div>
      </header>

      {activeTab === 'registry' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
           <div className="lg:col-span-2 space-y-8">
              <div className="bg-white dark:bg-white/[0.03] rounded-[4rem] border border-slate-200 dark:border-white/10 overflow-hidden shadow-sm backdrop-blur-3xl">
                 <div className="p-10 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-black/20">
                    <div className="flex items-center gap-4">
                       <ShieldCheck size={20} className="text-pink-500" />
                       <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-500">Live Parent Links</h3>
                    </div>
                    <button onClick={generateCode} className="px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest flex items-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-2xl">
                       <Plus size={16} /> Synthesize New Code
                    </button>
                 </div>
                 <div className="divide-y divide-slate-100 dark:divide-white/5">
                    {codes.map((c, i) => (
                       <div key={i} className="p-8 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/5 transition-all group">
                          <div className="flex items-center gap-10">
                             <div className="p-4 bg-pink-500/10 rounded-2xl text-pink-500 shadow-inner group-hover:scale-110 transition-transform">
                                <Key size={24} />
                             </div>
                             <div>
                                <p className="text-2xl font-mono font-black text-slate-900 dark:text-white tracking-widest">{c.code}</p>
                                <div className="flex items-center gap-4 mt-1">
                                   <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Scholar: <span className="text-slate-900 dark:text-slate-300">{c.studentName}</span></p>
                                   <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
                                   <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">ID: {c.studentId}</p>
                                </div>
                             </div>
                          </div>
                          <div className="flex items-center gap-6">
                             <span className="px-3 py-1 bg-slate-100 dark:bg-white/5 rounded-full text-[9px] font-black text-slate-400 uppercase tracking-widest">Expires: {c.expires}</span>
                             <button className="p-3 text-slate-300 hover:text-red-500 transition-all rounded-xl hover:bg-red-50 dark:hover:bg-red-900/10">
                                <Trash2 size={20} />
                             </button>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>
           </div>

           <div className="space-y-8">
              <div className="bg-pink-600 rounded-[4rem] p-10 text-white shadow-3xl relative overflow-hidden transform hover:-translate-y-1 transition-all">
                 <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
                    <Activity size={120} />
                 </div>
                 <h4 className="text-2xl font-black uppercase tracking-tight mb-3">System Adoption</h4>
                 <p className="text-[11px] font-black uppercase tracking-widest opacity-60 mb-12">Neural Workspace Metrics</p>
                 <div className="space-y-8">
                    <div className="space-y-2">
                       <div className="flex justify-between text-[10px] font-black uppercase">
                          <span>Parent-Guardian Sync</span>
                          <span>88%</span>
                       </div>
                       <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                          <div className="h-full bg-white w-[88%] rounded-full shadow-[0_0_20px_white]"></div>
                       </div>
                    </div>
                    <div className="space-y-2">
                       <div className="flex justify-between text-[10px] font-black uppercase">
                          <span>AI Assessment Integration</span>
                          <span>62%</span>
                       </div>
                       <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                          <div className="h-full bg-white w-[62%] rounded-full shadow-[0_0_20px_white]"></div>
                       </div>
                    </div>
                 </div>
              </div>
              
              <div className="p-10 bg-white dark:bg-white/[0.03] rounded-[4rem] border border-slate-200 dark:border-white/10 shadow-sm">
                 <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 mb-8">Governance Exports</h4>
                 <div className="space-y-4">
                    <button className="w-full py-5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:bg-slate-100 transition-all flex items-center justify-center gap-3 shadow-sm">
                       <Download size={18} /> Global Student Registry
                    </button>
                    <button className="w-full py-5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:bg-slate-100 transition-all flex items-center justify-center gap-3 shadow-sm">
                       <Zap size={18} className="text-pink-500" /> Quarterly Analytics Hub
                    </button>
                 </div>
              </div>
           </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
           {[
             { t: 'Institutional Integrity', v: '96.2%', c: 'text-indigo-500', desc: 'Average grade reliability across all departments.' },
             { t: 'Educator Velocity', v: '+142%', c: 'text-emerald-500', desc: 'Increase in instructional asset synthesis.' },
             { t: 'Engagement Depth', v: 'Level 14', c: 'text-yellow-500', desc: 'Mean achievement rank of the student body.' }
           ].map((report, i) => (
              <div key={i} className="p-12 bg-white dark:bg-white/[0.03] rounded-[4rem] border border-slate-200 dark:border-white/10 flex flex-col items-center text-center shadow-sm hover:shadow-xl transition-all">
                 <LayoutGrid className="text-slate-200 dark:text-white/5 mb-10" size={64} />
                 <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-3">{report.t}</h3>
                 <p className={`text-6xl font-[900] tracking-tighter mb-6 ${report.c}`}>{report.v}</p>
                 <p className="text-sm text-slate-500 font-medium leading-relaxed mb-10">{report.desc}</p>
                 <button className="px-10 py-3 border border-slate-200 dark:border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-pink-500 hover:border-pink-500/30 transition-all">Download PDF Brief</button>
              </div>
           ))}
        </div>
      )}
    </div>
  );
};

export default SchoolAdmin;
