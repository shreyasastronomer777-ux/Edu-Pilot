
import React, { useState, useEffect } from 'react';
import { Swords, Trophy, Star, Shield, Zap, Target, ArrowRight, CheckCircle2, Circle, Clock, Flame, Crown, Medal } from 'lucide-react';
import { Quest, DailyChallenge } from '../types';

const StudyQuest: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const [xp, setXp] = useState(() => Number(localStorage.getItem('svgpt_xp')) || 0);
  const [quests, setQuests] = useState<Quest[]>([
    { id: 'q1', title: 'Calculus Mastery', xp: 500, status: 'available', deadline: '2023-11-20', category: 'Math' },
    { id: 'q2', title: 'Neural Synthesis', xp: 450, status: 'available', deadline: '2023-11-25', category: 'Science' },
    { id: 'q3', title: 'Historical Archive', xp: 200, status: 'available', deadline: '2023-11-22', category: 'History' },
  ]);

  const [dailyChallenges, setDailyChallenges] = useState<DailyChallenge[]>([
    { id: 'd1', task: 'Complete 1 Focus Session', xp: 100, completed: false },
    { id: 'd2', task: 'Synthesize 1 Revision Brief', xp: 150, completed: false },
    { id: 'd3', task: 'Ace a Biology Quiz', xp: 200, completed: false },
  ]);

  const leaderboard = [
    { name: 'Alex V.', xp: 12540, level: 13, avatar: 'AV' },
    { name: 'Sarah K.', xp: 11200, level: 12, avatar: 'SK' },
    { name: 'Marcus L.', xp: 9800, level: 10, avatar: 'ML' },
    { name: 'Elena R.', xp: 8450, level: 9, avatar: 'ER' },
    { name: 'Jason T.', xp: 7100, level: 8, avatar: 'JT' },
  ];

  useEffect(() => {
    localStorage.setItem('svgpt_xp', xp.toString());
  }, [xp]);

  const completeQuest = (id: string, questXp: number) => {
    setQuests(prev => prev.map(q => q.id === id ? { ...q, status: 'completed' } : q));
    setXp(prev => prev + questXp);
  };

  const completeChallenge = (id: string, challengeXp: number) => {
    setDailyChallenges(prev => prev.map(d => d.id === id ? { ...d, completed: true } : d));
    setXp(prev => prev + challengeXp);
  };

  const level = Math.floor(xp / 1000) + 1;
  const progress = (xp % 1000) / 10;

  return (
    <div className="max-w-6xl mx-auto pb-20 animate-in fade-in duration-700">
       {/* Hero Header */}
       <div className="relative overflow-hidden bg-slate-900 dark:bg-white rounded-[3.5rem] p-12 text-white dark:text-slate-900 shadow-2xl mb-12">
          <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
             <Trophy size={240} strokeWidth={1} />
          </div>
          <div className="relative z-10">
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-10">
                <div className="flex items-center gap-8">
                   <div className="relative">
                      <div className="w-24 h-24 rounded-[2rem] bg-indigo-500 flex items-center justify-center shadow-2xl border-4 border-white/20">
                         <Crown size={48} className="text-white" />
                      </div>
                      <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center text-slate-900 font-black text-xs shadow-lg">
                         Lvl {level}
                      </div>
                   </div>
                   <div>
                      <h2 className="text-5xl font-[900] tracking-tighter uppercase leading-none mb-2">Scholar Status</h2>
                      <div className="flex items-center gap-4">
                         <div className="flex items-center gap-1.5 px-3 py-1 bg-white/10 dark:bg-black/10 rounded-full border border-white/10">
                            <Zap size={14} className="text-yellow-400" />
                            <span className="text-[10px] font-black uppercase tracking-widest">{xp} Total XP</span>
                         </div>
                         <div className="flex items-center gap-1.5 px-3 py-1 bg-white/10 dark:bg-black/10 rounded-full border border-white/10">
                            <Flame size={14} className="text-orange-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest">12 Day Streak</span>
                         </div>
                      </div>
                   </div>
                </div>
                
                <div className="flex-1 max-w-sm space-y-3">
                   <div className="flex justify-between items-end">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Path to Level {level + 1}</span>
                      <span className="text-xl font-black">{Math.round(progress)}%</span>
                   </div>
                   <div className="w-full h-4 bg-white/10 dark:bg-slate-200 rounded-full overflow-hidden shadow-inner p-1">
                      <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(99,102,241,0.5)]" style={{ width: `${progress}%` }}></div>
                   </div>
                </div>
             </div>
          </div>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Quest List */}
          <div className="lg:col-span-2 space-y-10">
             <section>
                <div className="flex items-center justify-between mb-8 px-4">
                   <h3 className="text-2xl font-black tracking-tighter uppercase flex items-center gap-3">
                      <Target className="text-indigo-500" /> Active Quests
                   </h3>
                </div>
                <div className="space-y-4">
                   {quests.filter(q => q.status !== 'completed').map(quest => (
                      <div key={quest.id} className="group bg-white/50 dark:bg-white/[0.03] p-8 rounded-[2.5rem] border border-slate-200 dark:border-white/10 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center justify-between">
                         <div className="flex items-center gap-6">
                            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform">
                               <Swords size={28} />
                            </div>
                            <div>
                               <div className="flex items-center gap-2 mb-1">
                                  <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-500 text-[8px] font-black uppercase tracking-widest rounded">{quest.category}</span>
                                  <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1">
                                     <Clock size={10} /> {quest.deadline}
                                  </span>
                               </div>
                               <h4 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{quest.title}</h4>
                               <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500/60 mt-1">Reward: {quest.xp} XP</p>
                            </div>
                         </div>
                         <button 
                           onClick={() => completeQuest(quest.id, quest.xp)}
                           className="px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-3 shadow-lg active:scale-95 transition-all"
                         >
                            Turn In <ArrowRight size={14} />
                         </button>
                      </div>
                   ))}
                </div>
             </section>

             <section>
                <div className="flex items-center justify-between mb-8 px-4">
                   <h3 className="text-2xl font-black tracking-tighter uppercase flex items-center gap-3">
                      <Zap className="text-yellow-500" /> Daily Challenges
                   </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {dailyChallenges.map(challenge => (
                      <div 
                        key={challenge.id} 
                        onClick={() => !challenge.completed && completeChallenge(challenge.id, challenge.xp)}
                        className={`p-6 rounded-3xl border transition-all cursor-pointer flex items-center justify-between group ${challenge.completed ? 'bg-green-500/5 border-green-500/20 opacity-60' : 'bg-white/50 dark:bg-white/5 border-slate-200 dark:border-white/10 hover:border-yellow-500/50 shadow-sm'}`}
                      >
                         <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-xl ${challenge.completed ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/10 text-yellow-500 group-hover:scale-110 transition-transform'}`}>
                               {challenge.completed ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                            </div>
                            <div>
                               <p className={`text-sm font-black tracking-tight ${challenge.completed ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'}`}>{challenge.task}</p>
                               <p className="text-[9px] font-black text-yellow-600 dark:text-yellow-400 uppercase tracking-widest">+{challenge.xp} XP</p>
                            </div>
                         </div>
                         {!challenge.completed && <ArrowRight size={14} className="text-slate-300 group-hover:translate-x-1 transition-transform" />}
                      </div>
                   ))}
                </div>
             </section>
          </div>

          {/* Leaderboard Sidebar */}
          <div className="space-y-10">
             <section className="bg-white/50 dark:bg-white/[0.03] p-10 rounded-[3.5rem] border border-slate-200 dark:border-white/10 shadow-sm">
                <div className="flex items-center gap-3 mb-10">
                   <Crown className="text-yellow-500" size={24} />
                   <h3 className="text-xl font-black tracking-tighter uppercase">Scholar Ranks</h3>
                </div>
                <div className="space-y-6">
                   {leaderboard.map((user, idx) => (
                      <div key={idx} className="flex items-center justify-between group">
                         <div className="flex items-center gap-4">
                            <div className="relative">
                               <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center font-black text-slate-500 dark:text-slate-400 group-hover:scale-110 transition-transform">
                                  {user.avatar}
                               </div>
                               {idx === 0 && <Medal size={16} className="absolute -top-2 -right-2 text-yellow-500" />}
                            </div>
                            <div>
                               <p className="text-sm font-black text-slate-900 dark:text-white tracking-tight">{user.name}</p>
                               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Level {user.level}</p>
                            </div>
                         </div>
                         <div className="text-right">
                            <p className="text-xs font-black text-indigo-500">{user.xp}</p>
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Points</p>
                         </div>
                      </div>
                   ))}
                </div>
                <button className="w-full mt-12 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all">
                   View Full Hall of Fame
                </button>
             </section>

             <div className="bg-indigo-500/5 dark:bg-indigo-500/10 p-8 rounded-[3rem] border border-indigo-500/10">
                <div className="flex items-center gap-3 mb-4">
                   <Shield className="text-indigo-500" size={20} />
                   <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Seasonal Rank</span>
                </div>
                <p className="text-2xl font-black text-slate-900 dark:text-white mb-2">DIAMOND II</p>
                <div className="w-full h-1 bg-indigo-500/20 rounded-full">
                   <div className="h-full bg-indigo-500 w-[75%] rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
                </div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-3">250 XP to DIAMOND I</p>
             </div>
          </div>
       </div>
    </div>
  );
};

export default StudyQuest;
