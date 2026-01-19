
import React, { useState } from 'react';
import { Globe, Plus, Search, FileText, UserPlus, Key, Trash2, ArrowRight, ShieldCheck, Download, Activity, LayoutGrid } from 'lucide-react';
import { AccessCode } from '../types';

const SchoolAdmin: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'registry' | 'reports'>('registry');
  const [codes, setCodes] = useState<AccessCode[]>([
    { code: 'SV-9912-XJ21', studentId: '101', studentName: 'Alice Johnson', expires: '2024-12-31' },
    { code: 'SV-1288-PA09', studentId: '102', studentName: 'Bob Smith', expires: '2024-12-31' }
  ]);

  const generateCode = () => {
    const newCode: AccessCode = {
      code: `SV-${Math.floor(1000 + Math.random() * 9000)}-${Math.random().toString(36).substring(7).toUpperCase()}`,
      studentId: Math.floor(Math.random() * 1000).toString(),
      studentName: 'Pending Registration',
      expires: '2025-06-30'
    };
    setCodes([newCode, ...codes]);
  };

  return (
    <div className="max-w-7xl mx-auto pb-20 animate-in fade-in duration-700">
      <header className="mb-12 flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-pink-500/10 rounded-xl">
                 <Globe className="text-pink-500" size={20} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Institutional Governance</span>
           </div>
           <h1 className="text-5xl font-black tracking-tighter uppercase">School Control Center</h1>
           <p className="text-slate-500 dark:text-slate-400 font-medium">Managing SVGPT neural integration for <span className="text-pink-500 font-bold">Horizon Academy</span></p>
        </div>
        
        <div className="flex p-1 bg-slate-100 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10">
           <button 
             onClick={() => setActiveTab('registry')}
             className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'registry' ? 'bg-white dark:bg-slate-700 text-pink-500 shadow-xl' : 'text-slate-500 hover:text-slate-800'}`}
           >
             <Key size={14} className="inline mr-2" /> Access Codes
           </button>
           <button 
             onClick={() => setActiveTab('reports')}
             className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'reports' ? 'bg-white dark:bg-slate-700 text-pink-500 shadow-xl' : 'text-slate-500 hover:text-slate-800'}`}
           >
             <FileText size={14} className="inline mr-2" /> School Reports
           </button>
        </div>
      </header>

      {activeTab === 'registry' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
           <div className="lg:col-span-2 space-y-6">
              <div className="bg-white dark:bg-white/[0.03] rounded-[2.5rem] border border-slate-200 dark:border-white/10 overflow-hidden shadow-sm">
                 <div className="p-8 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-black/20">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                       <ShieldCheck size={16} className="text-pink-500" /> Active Parent Links
                    </h3>
                    <button onClick={generateCode} className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-xl">
                       <Plus size={14} /> New Link Code
                    </button>
                 </div>
                 <div className="divide-y divide-slate-100 dark:divide-white/5">
                    {codes.map((c, i) => (
                       <div key={i} className="p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/5 transition-all group">
                          <div className="flex items-center gap-6">
                             <div className="p-3 bg-pink-500/10 rounded-xl text-pink-500">
                                <Key size={20} />
                             </div>
                             <div>
                                <p className="text-lg font-mono font-black text-slate-900 dark:text-white">{c.code}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Student: {c.studentName}</p>
                             </div>
                          </div>
                          <div className="flex items-center gap-4">
                             <span className="text-[9px] font-black text-slate-400 uppercase">Exp: {c.expires}</span>
                             <button className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                                <Trash2 size={16} />
                             </button>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>
           </div>

           <div className="space-y-6">
              <div className="bg-pink-600 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Activity size={80} />
                 </div>
                 <h4 className="text-xl font-black uppercase tracking-tight mb-2">Neural Adoption</h4>
                 <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-8">System Usage Statistics</p>
                 <div className="space-y-4">
                    <div>
                       <div className="flex justify-between text-xs font-bold mb-1">
                          <span>Parent Linked</span>
                          <span>82%</span>
                       </div>
                       <div className="h-1 bg-white/20 rounded-full">
                          <div className="h-full bg-white w-[82%] rounded-full shadow-[0_0_10px_white]"></div>
                       </div>
                    </div>
                    <div>
                       <div className="flex justify-between text-xs font-bold mb-1">
                          <span>AI Assessment Adoption</span>
                          <span>65%</span>
                       </div>
                       <div className="h-1 bg-white/20 rounded-full">
                          <div className="h-full bg-white w-[65%] rounded-full shadow-[0_0_10px_white]"></div>
                       </div>
                    </div>
                 </div>
              </div>
              
              <div className="p-8 bg-white dark:bg-white/[0.03] rounded-[2.5rem] border border-slate-200 dark:border-white/10">
                 <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6">Macro Exports</h4>
                 <button className="w-full py-4 mb-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:bg-slate-100 transition-all flex items-center justify-center gap-3">
                    <Download size={14} /> Full Student Registry
                 </button>
                 <button className="w-full py-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:bg-slate-100 transition-all flex items-center justify-center gap-3">
                    <Download size={14} /> Semester Analytics
                 </button>
              </div>
           </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {[
             { t: 'Average Grade Integrity', v: '91.4%', c: 'text-indigo-500' },
             { t: 'Teacher Engagement Rate', v: '98.0%', c: 'text-emerald-500' },
             { t: 'Study Quest XP Velocity', v: '+240%', c: 'text-yellow-500' }
           ].map((report, i) => (
              <div key={i} className="p-10 bg-white dark:bg-white/[0.03] rounded-[3rem] border border-slate-200 dark:border-white/10 flex flex-col items-center text-center shadow-sm">
                 <LayoutGrid className="text-slate-200 dark:text-white/10 mb-8" size={48} />
                 <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{report.t}</h3>
                 <p className={`text-5xl font-[900] tracking-tighter ${report.c}`}>{report.v}</p>
                 <button className="mt-8 px-6 py-2 border border-slate-100 dark:border-white/10 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-pink-500 transition-all">Download Report</button>
              </div>
           ))}
        </div>
      )}
    </div>
  );
};

export default SchoolAdmin;
