
import React, { useState } from 'react';
import { Users, Zap, Search, Globe, Share2, ArrowRight, CheckCircle2, MessageSquare, BookOpen, Key, Trash2, ShieldCheck, Heart, UserPlus, FileText } from 'lucide-react';
import { View } from '../types';

const NeuralNetwork: React.FC<{ onBack?: () => void, onChangeView: (view: View) => void }> = ({ onBack, onChangeView }) => {
  const [neuralKey, setNeuralKey] = useState('');
  const [syncStatus, setSyncStatus] = useState<'idle' | 'linking' | 'synced'>('idle');
  const [activeTab, setActiveTab] = useState<'hub' | 'circles' | 'global'>('hub');

  const handleSync = () => {
    if (!neuralKey) return;
    setSyncStatus('linking');
    setTimeout(() => {
      setSyncStatus('synced');
      // In a real app, this would fetch data based on the code
      // and inject it into localStorage or state
    }, 1500);
  };

  const trendingCircles = [
    { title: "Quantum Physics Study Group", topic: "Theoretical Physics", members: 42, active: true },
    { title: "MCAT Biology Prep", topic: "Medicine", members: 128, active: true },
    { title: "Philosophy 101", topic: "Ethics", members: 15, active: false }
  ];

  const sharedAssets = [
    { title: "Neuroscience Roadmap", author: "Sarah K.", type: "Pathway", likes: 84 },
    { title: "Calculus III Notes", author: "Marcus L.", type: "Node", likes: 231 },
    { title: "French Revolution Quiz", author: "Julian X.", type: "Assessment", likes: 45 }
  ];

  return (
    <div className="max-w-6xl mx-auto pb-20 animate-in fade-in duration-700">
      <header className="mb-16 flex flex-col lg:flex-row justify-between items-end gap-8">
        <div className="space-y-4">
           <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-indigo-500/20">
              <Globe size={12} /> Global Academic Mesh Active
           </div>
           <h1 className="text-6xl font-black tracking-tighter uppercase leading-[0.9]">Neural Network</h1>
           <p className="text-slate-500 dark:text-slate-400 font-medium text-xl max-w-xl">
             Broadcast your mastery. Connect with scholars. Synchronize academic trajectories.
           </p>
        </div>
        <div className="flex p-1 bg-slate-100 dark:bg-white/5 rounded-[1.8rem] border border-slate-200 dark:border-white/10 shadow-inner">
           <button onClick={() => setActiveTab('hub')} className={`px-8 py-3.5 rounded-[1.4rem] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'hub' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-xl' : 'text-slate-400'}`}>The Hub</button>
           <button onClick={() => setActiveTab('circles')} className={`px-8 py-3.5 rounded-[1.4rem] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'circles' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-xl' : 'text-slate-400'}`}>Study Circles</button>
        </div>
      </header>

      {activeTab === 'hub' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Sync Terminal */}
          <div className="lg:col-span-2 space-y-10">
             <div className="bg-white dark:bg-[#0B1221] p-12 rounded-[4rem] border border-slate-200 dark:border-white/10 shadow-3xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                   <Zap size={200} />
                </div>
                <div className="relative z-10">
                   <h3 className="text-3xl font-black tracking-tighter uppercase mb-6 flex items-center gap-3">
                      <ShieldCheck className="text-indigo-500" /> Sync Terminal
                   </h3>
                   <p className="text-slate-500 dark:text-slate-400 font-medium mb-10 max-w-md leading-relaxed">
                      Enter a 6-digit Neural Link code to pull shared study protocols, notes, or project blueprints into your workspace.
                   </p>
                   
                   <div className="flex flex-col md:flex-row gap-4 mb-8">
                      <input 
                        type="text" 
                        value={neuralKey}
                        onChange={(e) => setNeuralKey(e.target.value.toUpperCase())}
                        placeholder="NK-XXXXXX"
                        maxLength={9}
                        className="flex-1 px-8 py-6 rounded-[2rem] bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-center text-2xl font-mono font-black text-indigo-500 outline-none focus:ring-8 focus:ring-indigo-500/5 transition-all"
                      />
                      <button 
                        onClick={handleSync}
                        disabled={syncStatus === 'linking' || !neuralKey}
                        className="px-10 py-6 premium-gradient text-white rounded-[2rem] font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-2xl active:scale-95 disabled:opacity-50"
                      >
                         {syncStatus === 'linking' ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Zap size={18} />}
                         Link Protocol
                      </button>
                   </div>

                   {syncStatus === 'synced' && (
                     <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-[2rem] animate-in zoom-in-95 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 bg-emerald-500 text-white rounded-xl flex items-center justify-center shadow-lg"><CheckCircle2 /></div>
                           <div>
                              <p className="text-xs font-black uppercase text-emerald-600 dark:text-emerald-400">Sync Successful</p>
                              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Neural Node "Astrophysics Master Plan" merged.</p>
                           </div>
                        </div>
                        <button onClick={() => onChangeView(View.STUDY_PATH)} className="text-[10px] font-black uppercase text-indigo-600 hover:underline">View Roadmap</button>
                     </div>
                   )}
                </div>
             </div>

             <div className="space-y-6">
                <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 ml-4">Recently Broadcast Assets</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {sharedAssets.map((asset, i) => (
                      <div key={i} className="p-8 bg-white dark:bg-white/[0.03] rounded-[3rem] border border-slate-200 dark:border-white/10 group hover:border-indigo-500/30 transition-all cursor-pointer shadow-sm flex flex-col justify-between">
                         <div>
                            <div className="flex justify-between items-start mb-6">
                               <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-500"><Share2 size={18} /></div>
                               <div className="flex items-center gap-1.5 text-[10px] font-black text-rose-500 uppercase"><Heart size={12} fill="currentColor" /> {asset.likes}</div>
                            </div>
                            <h4 className="text-xl font-black text-slate-900 dark:text-white uppercase leading-tight mb-2">{asset.title}</h4>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Author: <span className="text-indigo-500">{asset.author}</span></p>
                         </div>
                         <div className="flex justify-between items-center">
                            <span className="px-3 py-1 bg-slate-100 dark:bg-white/5 rounded-full text-[9px] font-black text-slate-500 uppercase">{asset.type}</span>
                            <div className="p-2 bg-slate-50 dark:bg-white/10 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-all"><ArrowRight size={16} /></div>
                         </div>
                      </div>
                   ))}
                </div>
             </div>
          </div>

          {/* Leaderboard/Activity Sidebar */}
          <div className="space-y-10">
             <div className="bg-indigo-600 rounded-[3.5rem] p-10 text-white shadow-3xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-10"><Users size={120} /></div>
                <h4 className="text-2xl font-black uppercase tracking-tight mb-8">Circle Members</h4>
                <div className="space-y-6">
                   {[
                     { n: 'Vamshi', r: 'Lead Architect', xp: '12,500' },
                     { n: 'Vaibhav', r: 'Evaluation Expert', xp: '11,200' },
                     { n: 'Shreyas', r: 'Logic Scribe', xp: '9,800' }
                   ].map((u, i) => (
                     <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center font-black text-xs">{u.n[0]}</div>
                           <div>
                              <p className="text-xs font-black uppercase">{u.n}</p>
                              <p className="text-[8px] font-bold opacity-60 uppercase">{u.r}</p>
                           </div>
                        </div>
                        <span className="text-[10px] font-black">{u.xp} XP</span>
                     </div>
                   ))}
                </div>
                <button className="w-full mt-10 py-4 bg-white text-indigo-600 rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all">Invite Scholar</button>
             </div>

             <div className="p-10 bg-white dark:bg-white/[0.03] rounded-[3.5rem] border border-slate-200 dark:border-white/10 shadow-sm text-center">
                <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 mb-8">My Collaborative Reach</h4>
                <div className="grid grid-cols-2 gap-4">
                   <div className="p-6 bg-slate-50 dark:bg-black/20 rounded-3xl">
                      <p className="text-2xl font-black text-indigo-600">12</p>
                      <p className="text-[8px] font-black text-slate-400 uppercase mt-1">Synced Paths</p>
                   </div>
                   <div className="p-6 bg-slate-50 dark:bg-black/20 rounded-3xl">
                      <p className="text-2xl font-black text-rose-500">432</p>
                      <p className="text-[8px] font-black text-slate-400 uppercase mt-1">Neural Likes</p>
                   </div>
                </div>
             </div>
          </div>
        </div>
      )}

      {activeTab === 'circles' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in slide-in-from-bottom-6">
           <div className="p-10 bg-indigo-500/5 dark:bg-indigo-500/10 border-2 border-dashed border-indigo-500/20 rounded-[3.5rem] flex flex-col items-center justify-center text-center gap-6 group hover:border-indigo-500 transition-all cursor-pointer">
              <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center text-indigo-600 shadow-xl group-hover:scale-110 transition-transform"><UserPlus size={32} /></div>
              <h3 className="text-xl font-black uppercase tracking-tight">Create New Circle</h3>
              <p className="text-xs font-medium text-slate-500 max-w-[200px]">Initialize an invite-only neural study group.</p>
           </div>
           
           {trendingCircles.map((circle, i) => (
             <div key={i} className="bg-white dark:bg-[#0B1221] p-10 rounded-[3.5rem] border border-slate-200 dark:border-white/10 shadow-sm hover:shadow-2xl transition-all group">
                <div className="flex justify-between items-start mb-8">
                   <div className="p-4 bg-slate-100 dark:bg-white/5 rounded-2xl text-slate-400 group-hover:text-indigo-500 group-hover:bg-indigo-500/10 transition-all"><Users size={28} /></div>
                   {circle.active && <div className="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-[8px] font-black uppercase tracking-widest rounded-full border border-emerald-500/20 flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div> Live</div>}
                </div>
                <h3 className="text-2xl font-black uppercase tracking-tighter text-slate-900 dark:text-white leading-tight mb-2">{circle.title}</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-10">{circle.topic}</p>
                <div className="flex items-center justify-between border-t border-slate-100 dark:border-white/5 pt-8">
                   <div className="flex flex-col">
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Scholars</span>
                      <span className="text-lg font-black">{circle.members}</span>
                   </div>
                   <button className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all">Join Circle</button>
                </div>
             </div>
           ))}
        </div>
      )}
    </div>
  );
};

export default NeuralNetwork;
