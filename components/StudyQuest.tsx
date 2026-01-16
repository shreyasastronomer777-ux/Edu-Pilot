
import React, { useState, useEffect } from 'react';
import { Swords, Trophy, Star, Shield, Zap, Target, ArrowRight, CheckCircle2, Circle, Clock } from 'lucide-react';
import { Quest } from '../types';

const StudyQuest: React.FC = () => {
  const [xp, setXp] = useState(() => Number(localStorage.getItem('svgpt_xp')) || 0);
  const [quests, setQuests] = useState<Quest[]>([
    { id: '1', title: 'Calculus Mastery', xp: 500, status: 'available', deadline: '2023-11-20', category: 'Math' },
    { id: '2', title: 'Scribe of Literature', xp: 300, status: 'completed', deadline: '2023-11-18', category: 'English' },
    { id: '3', title: 'Biology Deep Dive', xp: 450, status: 'available', deadline: '2023-11-25', category: 'Science' },
  ]);

  useEffect(() => {
    localStorage.setItem('svgpt_xp', xp.toString());
  }, [xp]);

  const completeQuest = (id: string, questXp: number) => {
    setQuests(prev => prev.map(q => q.id === id ? { ...q, status: 'completed' } : q));
    setXp(prev => prev + questXp);
  };

  const level = Math.floor(xp / 1000) + 1;
  const progress = (xp % 1000) / 10;

  return (
    <div className="max-w-4xl mx-auto pb-20">
       <div className="bg-slate-900 dark:bg-white rounded-[3rem] p-10 text-white dark:text-slate-900 mb-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-10 opacity-10">
             <Swords size={200} />
          </div>
          <div className="relative z-10">
             <div className="flex items-center gap-4 mb-8">
                <div className="w-20 h-20 rounded-3xl bg-indigo-500 flex items-center justify-center shadow-xl">
                   <Trophy size={40} className="text-white" />
                </div>
                <div>
                   <h2 className="text-4xl font-black tracking-tighter uppercase">Scholar Level {level}</h2>
                   <div className="flex items-center gap-2 mt-2">
                      <Zap size={16} className="text-yellow-400" />
                      <span className="text-xs font-black uppercase tracking-widest opacity-70">{xp} Total XP Gathered</span>
                   </div>
                </div>
             </div>
             
             <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                   <span>Progress to Level {level + 1}</span>
                   <span>{Math.round(progress)}%</span>
                </div>
                <div className="w-full h-3 bg-white/10 dark:bg-slate-200 rounded-full overflow-hidden">
                   <div className="h-full bg-indigo-500 transition-all duration-1000" style={{ width: `${progress}%` }}></div>
                </div>
             </div>
          </div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white dark:bg-white/5 p-6 rounded-3xl border border-slate-200 dark:border-white/10 flex flex-col items-center gap-3">
             <Star className="text-yellow-500" size={32} />
             <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Daily Streak</span>
             <span className="text-2xl font-black text-slate-900 dark:text-white">12 Days</span>
          </div>
          <div className="bg-white dark:bg-white/5 p-6 rounded-3xl border border-slate-200 dark:border-white/10 flex flex-col items-center gap-3">
             <Shield className="text-indigo-500" size={32} />
             <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Focus Rank</span>
             <span className="text-2xl font-black text-slate-900 dark:text-white">Diamond</span>
          </div>
          <div className="bg-white dark:bg-white/5 p-6 rounded-3xl border border-slate-200 dark:border-white/10 flex flex-col items-center gap-3">
             <Target className="text-rose-500" size={32} />
             <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Quests Done</span>
             <span className="text-2xl font-black text-slate-900 dark:text-white">{quests.filter(q => q.status === 'completed').length}</span>
          </div>
       </div>

       <div className="space-y-6">
          <div className="flex items-center justify-between px-4">
             <h3 className="text-xl font-black tracking-tighter uppercase flex items-center gap-2">
                <Zap className="text-indigo-500" size={20} /> Active Quests
             </h3>
             <button className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-500 transition-colors">View Completed</button>
          </div>

          <div className="space-y-4">
             {quests.filter(q => q.status !== 'completed').map(quest => (
                <div key={quest.id} className="bg-white dark:bg-white/5 p-8 rounded-[2.5rem] border border-slate-200 dark:border-white/10 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group flex items-center justify-between">
                   <div className="flex items-center gap-6">
                      <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-black/20 flex items-center justify-center">
                         <Swords size={28} className="text-indigo-500" />
                      </div>
                      <div>
                         <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-500 text-[8px] font-black uppercase tracking-widest rounded">{quest.category}</span>
                            <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1">
                               <Clock size={10} /> {quest.deadline}
                            </span>
                         </div>
                         <h4 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{quest.title}</h4>
                         <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500/60 mt-1">Reward: {quest.xp} XP</p>
                      </div>
                   </div>
                   <button 
                     onClick={() => completeQuest(quest.id, quest.xp)}
                     className="px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-3 shadow-lg active:scale-95 transition-all"
                   >
                      Turn In Quest <ArrowRight size={14} />
                   </button>
                </div>
             ))}
             {quests.filter(q => q.status !== 'completed').length === 0 && (
                <div className="text-center py-20 opacity-30">
                   <Target size={64} className="mx-auto mb-4" />
                   <p className="text-sm font-black uppercase tracking-widest">All current quests vanquished.</p>
                </div>
             )}
          </div>
       </div>
    </div>
  );
};

export default StudyQuest;
