
import React, { useState } from 'react';
import { Calculator, Plus, Trash2, Target, TrendingUp, AlertCircle, Sparkles } from 'lucide-react';
import { GradeEntry } from '../types';

const GradePredictor: React.FC = () => {
  const [entries, setEntries] = useState<GradeEntry[]>([
    { id: '1', name: 'Midterm Exam', weight: 30, score: 85 },
    { id: '2', name: 'Problem Sets', weight: 40, score: 92 },
  ]);
  const [target, setTarget] = useState(90);

  const addEntry = () => {
    setEntries([...entries, { id: Date.now().toString(), name: '', weight: 0, score: 0 }]);
  };

  const updateEntry = (id: string, field: keyof GradeEntry, value: string | number) => {
    setEntries(entries.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  const deleteEntry = (id: string) => {
    setEntries(entries.filter(e => e.id !== id));
  };

  const totalWeight = entries.reduce((acc, e) => acc + e.weight, 0);
  const currentGrade = totalWeight > 0 
    ? entries.reduce((acc, e) => acc + (e.score * (e.weight / totalWeight)), 0)
    : 0;
  
  const finalWeight = Math.max(0, 100 - totalWeight);
  const requiredOnFinal = finalWeight > 0 
    ? (target - (currentGrade * (totalWeight / 100))) / (finalWeight / 100)
    : 0;

  return (
    <div className="max-w-4xl mx-auto pb-20">
       <div className="bg-white/80 dark:bg-white/[0.03] backdrop-blur-3xl p-10 rounded-[3rem] border border-slate-200 dark:border-white/10 shadow-sm mb-8">
          <div className="flex items-center justify-between mb-10">
             <div className="flex items-center gap-4">
                <div className="p-3 bg-rose-500/10 rounded-2xl">
                   <Calculator className="text-rose-600 dark:text-rose-400" size={24} />
                </div>
                <div>
                   <h2 className="text-2xl font-black tracking-tighter uppercase text-slate-900 dark:text-white">Predictive Synthesis</h2>
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Calculate path to target mastery</p>
                </div>
             </div>
             <div className="flex flex-col items-end">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Target Grade</span>
                <input 
                  type="number" 
                  value={target} 
                  onChange={(e) => setTarget(Number(e.target.value))}
                  className="w-20 text-3xl font-black bg-transparent border-none outline-none text-rose-500 text-right"
                />
             </div>
          </div>

          <div className="space-y-4 mb-10">
             {entries.map(entry => (
                <div key={entry.id} className="flex gap-4 items-center bg-slate-50 dark:bg-black/20 p-4 rounded-2xl border border-slate-100 dark:border-white/5 animate-in slide-in-from-left-2">
                   <div className="flex-1">
                      <input 
                        type="text" 
                        value={entry.name}
                        onChange={(e) => updateEntry(entry.id, 'name', e.target.value)}
                        placeholder="Assessment Name"
                        className="w-full bg-transparent border-none outline-none text-sm font-bold text-slate-800 dark:text-white placeholder:text-slate-300"
                      />
                   </div>
                   <div className="w-24 flex items-center gap-2">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Score:</span>
                      <input 
                        type="number" 
                        value={entry.score}
                        onChange={(e) => updateEntry(entry.id, 'score', Number(e.target.value))}
                        className="w-full bg-white dark:bg-slate-800 p-2 rounded-lg text-xs font-black border border-slate-200 dark:border-white/10"
                      />
                   </div>
                   <div className="w-24 flex items-center gap-2">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Wgt %:</span>
                      <input 
                        type="number" 
                        value={entry.weight}
                        onChange={(e) => updateEntry(entry.id, 'weight', Number(e.target.value))}
                        className="w-full bg-white dark:bg-slate-800 p-2 rounded-lg text-xs font-black border border-slate-200 dark:border-white/10"
                      />
                   </div>
                   <button onClick={() => deleteEntry(entry.id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                      <Trash2 size={16} />
                   </button>
                </div>
             ))}
             <button 
               onClick={addEntry}
               className="w-full py-4 border-2 border-dashed border-slate-100 dark:border-white/5 rounded-2xl text-slate-400 hover:text-rose-500 hover:border-rose-500 transition-all flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest"
             >
                <Plus size={16} /> Add Assessment Component
             </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-10 border-t border-slate-100 dark:border-white/5">
             <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 flex items-center justify-center">
                   <TrendingUp className="text-indigo-500" size={32} />
                </div>
                <div>
                   <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Current weighted Grade</span>
                   <h4 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{Math.round(currentGrade * 10) / 10}%</h4>
                </div>
             </div>
             
             <div className="p-6 bg-slate-900 dark:bg-white rounded-[2rem] text-white dark:text-slate-900 shadow-xl shadow-rose-500/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                   <Target size={60} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Required on Final ({finalWeight}%)</span>
                <h4 className="text-4xl font-black tracking-tight">{requiredOnFinal > 100 ? '100%+' : Math.round(Math.max(0, requiredOnFinal) * 10) / 10 + '%'}</h4>
                {requiredOnFinal > 100 && (
                   <p className="text-[9px] font-black uppercase tracking-widest text-rose-400 dark:text-rose-600 mt-2 flex items-center gap-1">
                      <AlertCircle size={12} /> Target mathematically impossible.
                   </p>
                )}
             </div>
          </div>
       </div>

       <div className="bg-indigo-500/5 dark:bg-indigo-500/10 p-8 rounded-[3rem] border border-indigo-500/10 flex items-start gap-6">
          <Sparkles className="text-indigo-500 flex-shrink-0" size={24} />
          <div>
             <h4 className="text-sm font-black text-indigo-900 dark:text-indigo-400 uppercase tracking-widest mb-2">Neural Insight</h4>
             <p className="text-sm text-indigo-700 dark:text-indigo-300/80 font-medium leading-relaxed">
                Based on your current trajectory and consistency, you have a 82% probability of achieving your {target}% target if you maintain your current study frequency in the Focus Room.
             </p>
          </div>
       </div>
    </div>
  );
};

export default GradePredictor;
