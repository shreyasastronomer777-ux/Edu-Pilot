
import React, { useState, useEffect } from 'react';
import { Route, Search, Loader2, Sparkles, Wand2, ArrowLeft, Zap, CheckCircle2, Circle, Clock, ChevronRight, BookOpen, Target, Lightbulb, Trash2, Layout, Award, Share2, Check } from 'lucide-react';
import { generateStudyRoadmap } from '../services/geminiService';
import { StudyPathData } from '../types';

const StudyPath: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const [topic, setTopic] = useState('');
  const [duration, setDuration] = useState('2 weeks');
  const [loading, setLoading] = useState(false);
  const [roadmap, setRoadmap] = useState<StudyPathData | null>(() => {
    const saved = localStorage.getItem('svgpt_study_path_active');
    return saved ? JSON.parse(saved) : null;
  });
  const [completedMilestones, setCompletedMilestones] = useState<string[]>(() => {
    const saved = localStorage.getItem('svgpt_study_path_progress');
    return saved ? JSON.parse(saved) : [];
  });
  const [activeMilestoneId, setActiveMilestoneId] = useState<string | null>(null);
  const [showShareCode, setShowShareCode] = useState<string | null>(null);

  useEffect(() => {
    if (roadmap) localStorage.setItem('svgpt_study_path_active', JSON.stringify(roadmap));
    else localStorage.removeItem('svgpt_study_path_active');
  }, [roadmap]);

  useEffect(() => {
    localStorage.setItem('svgpt_study_path_progress', JSON.stringify(completedMilestones));
  }, [completedMilestones]);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setRoadmap(null);
    setCompletedMilestones([]);
    setActiveMilestoneId(null);
    try {
      const data = await generateStudyRoadmap(topic, duration);
      setRoadmap(data);
      setActiveMilestoneId(data.milestones[0].id);
      
      const currentXP = Number(localStorage.getItem('svgpt_xp')) || 0;
      localStorage.setItem('svgpt_xp', (currentXP + 50).toString());
    } catch (e) {
      alert("Neural synthesis interrupted. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleMilestone = (id: string) => {
    setCompletedMilestones(prev => 
      prev.includes(id) ? prev.filter(mid => mid !== id) : [...prev, id]
    );
  };

  const broadcastProtocol = () => {
    const code = `NK-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    setShowShareCode(code);
    // Simulated broadcast
    setTimeout(() => setShowShareCode(null), 10000);
  };

  const progress = roadmap ? Math.round((completedMilestones.length / roadmap.milestones.length) * 100) : 0;

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-8 pb-20 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <button onClick={onBack} className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors group">
          <div className="p-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 group-hover:border-indigo-200 shadow-sm">
            <ArrowLeft size={16} />
          </div>
          Back to Workspace
        </button>
        <div className="flex items-center gap-3">
          {roadmap && (
            <button 
              onClick={broadcastProtocol}
              className={`px-6 py-2 rounded-full border text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${showShareCode ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-indigo-500/5 border-indigo-500/20 text-indigo-600 hover:bg-indigo-500 hover:text-white'}`}
            >
              {showShareCode ? <Check size={14}/> : <Share2 size={14} />}
              {showShareCode ? showShareCode : 'Broadcast Protocol'}
            </button>
          )}
          <div className="flex items-center gap-3 px-6 py-2 bg-indigo-500/10 rounded-full border border-indigo-500/20">
            <Route className="text-indigo-600 dark:text-indigo-400" size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-700 dark:text-indigo-500">
              Roadmap Synthesis Core
            </span>
          </div>
        </div>
      </div>

      {!roadmap && !loading ? (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center max-w-2xl mx-auto animate-in zoom-in-95 duration-700">
          <div className="w-20 h-20 bg-indigo-500/10 rounded-3xl flex items-center justify-center mb-8">
            <Route className="text-indigo-500" size={40} />
          </div>
          <h2 className="text-4xl font-[900] tracking-tighter uppercase text-slate-900 dark:text-white mb-4">Neural Study Path</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium mb-12 text-lg">Enter any academic topic and your time constraints to synthesize a milestone-based learning journey.</p>
          
          <div className="w-full space-y-6">
            <div className="relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500" size={20} />
              <input 
                type="text" 
                value={topic}
                onChange={e => setTopic(e.target.value)}
                placeholder="What do you want to learn? (e.g. Modern Architecture)"
                className="w-full pl-16 pr-8 py-6 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[2.5rem] shadow-xl outline-none focus:ring-8 focus:ring-indigo-500/5 transition-all font-bold text-lg"
              />
            </div>
            
            <div className="flex flex-wrap justify-center gap-3">
              {['3 days', '1 week', '2 weeks', '1 month'].map(d => (
                <button 
                  key={d}
                  onClick={() => setDuration(d)}
                  className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${duration === d ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl' : 'bg-white dark:bg-white/5 text-slate-400 border-slate-100 dark:border-white/5 hover:border-indigo-500'}`}
                >
                  {d}
                </button>
              ))}
            </div>

            <button 
              onClick={handleGenerate}
              disabled={!topic.trim()}
              className="w-full py-6 premium-gradient text-white rounded-[2.5rem] font-black uppercase tracking-[0.2em] text-xs shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-30"
            >
              <Wand2 size={20} /> Synthesize Roadmap
            </button>
          </div>
        </div>
      ) : loading ? (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-10">
          <div className="relative">
            <Loader2 className="animate-spin text-indigo-500" size={80} strokeWidth={1.5} />
            <Sparkles className="absolute inset-0 m-auto text-indigo-400 animate-pulse" size={32} />
          </div>
          <div className="text-center">
            <h3 className="text-2xl font-black uppercase tracking-[0.5em] text-slate-900 dark:text-white mb-2">Mapping Neural Nodes</h3>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Balancing Pedagogical Load for: {topic}</p>
          </div>
        </div>
      ) : roadmap && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in slide-in-from-bottom-6 duration-700">
          {/* Roadmap Info & Progress */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white dark:bg-[#0B1221] p-10 rounded-[3.5rem] border border-slate-200 dark:border-white/10 shadow-sm flex flex-col items-center text-center">
               <div className="w-20 h-20 bg-indigo-500/10 rounded-3xl flex items-center justify-center text-indigo-500 mb-8 shadow-inner"><Target size={32} /></div>
               <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white mb-2">{roadmap.topic}</h3>
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-10">{roadmap.duration} Study Protocol</p>
               
               <div className="w-full space-y-4">
                  <div className="flex justify-between items-end mb-2 px-2">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Synthesis Progress</span>
                    <span className="text-xl font-[900] text-indigo-500">{progress}%</span>
                  </div>
                  <div className="w-full h-4 bg-slate-100 dark:bg-black/20 rounded-full overflow-hidden shadow-inner p-1">
                    <div className="h-full bg-indigo-500 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.5)] transition-all duration-1000" style={{ width: `${progress}%` }}></div>
                  </div>
               </div>

               {progress === 100 && (
                 <div className="mt-8 p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl animate-in zoom-in-95">
                    <Award className="text-emerald-500 mx-auto mb-3" size={32} />
                    <p className="text-xs font-black uppercase text-emerald-600">Mastery Achievement Confirmed</p>
                 </div>
               )}

               <button 
                 onClick={() => { if(confirm("Terminate current study protocol?")) setRoadmap(null); }}
                 className="mt-12 text-[10px] font-black uppercase tracking-widest text-slate-300 hover:text-red-500 transition-colors flex items-center gap-2"
               >
                 <Trash2 size={14} /> Clear Neural Protocol
               </button>
            </div>
          </div>

          {/* Milestone Timeline */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <div className="bg-white dark:bg-[#0B1221] rounded-[4rem] border border-slate-200 dark:border-white/10 shadow-sm p-10 md:p-16 relative overflow-hidden">
               <div className="absolute left-[3.5rem] md:left-[5rem] top-20 bottom-20 w-1 bg-slate-100 dark:bg-white/5 rounded-full z-0"></div>
               
               <div className="space-y-12 relative z-10">
                  {roadmap.milestones.map((m, i) => {
                    const isCompleted = completedMilestones.includes(m.id);
                    const isActive = activeMilestoneId === m.id;
                    
                    return (
                      <div key={m.id} className="flex gap-8 group">
                         <div className="flex flex-col items-center">
                            <button 
                              onClick={() => toggleMilestone(m.id)}
                              className={`w-12 h-12 md:w-16 md:h-16 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-xl z-10 ${isCompleted ? 'bg-emerald-500 text-white scale-110' : isActive ? 'bg-indigo-600 text-white ring-8 ring-indigo-500/10 scale-105' : 'bg-white dark:bg-slate-800 text-slate-300 border border-slate-100 dark:border-slate-700 hover:border-indigo-400'}`}
                            >
                               {isCompleted ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                            </button>
                         </div>

                         <div className={`flex-1 p-8 rounded-[2.5rem] border transition-all duration-500 ${isActive ? 'bg-indigo-500/5 border-indigo-500/20 shadow-lg' : 'bg-white dark:bg-black/20 border-slate-100 dark:border-white/5'}`}>
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                               <div>
                                  <span className="text-[9px] font-black uppercase text-indigo-500 tracking-widest mb-1 block">Milestone 0{i+1}</span>
                                  <h4 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white leading-none">{m.title}</h4>
                                </div>
                                <button 
                                  onClick={() => setActiveMilestoneId(isActive ? null : m.id)}
                                  className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${isActive ? 'bg-indigo-500 text-white' : 'text-slate-400 hover:bg-slate-50'}`}
                                >
                                  {isActive ? 'Hide Node' : 'Expand Node'}
                                </button>
                            </div>

                            {isActive && (
                              <div className="animate-in slide-in-from-top-4 duration-500 mt-6 space-y-8 pt-6 border-t border-indigo-500/10">
                                 <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-[10px] font-black uppercase text-indigo-500 tracking-widest"><Target size={14} /> Objective</div>
                                    <p className="text-sm font-medium text-slate-600 dark:text-slate-300 leading-relaxed italic">"{m.objective}"</p>
                                 </div>

                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                       <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 tracking-widest"><Zap size={14} className="text-yellow-500" /> Key Concepts</div>
                                       <ul className="space-y-2">
                                          {m.keyConcepts.map((c, ci) => <li key={ci} className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-2"><div className="w-1 h-1 bg-indigo-400 rounded-full" /> {c}</li>)}
                                       </ul>
                                    </div>
                                    <div className="space-y-4">
                                       <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 tracking-widest"><BookOpen size={14} className="text-blue-500" /> Curated Resources</div>
                                       <ul className="space-y-2">
                                          {m.resources.map((r, ri) => <li key={ri} className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-2"><div className="w-1 h-1 bg-blue-400 rounded-full" /> {r}</li>)}
                                       </ul>
                                    </div>
                                 </div>

                                 <div className="p-6 bg-slate-900 rounded-[2rem] text-white">
                                    <div className="flex items-center gap-2 text-[10px] font-black uppercase text-indigo-400 tracking-widest mb-4"><Lightbulb size={14} /> Mastery Self-Check</div>
                                    <p className="text-sm font-bold leading-relaxed">{m.masteryCheck}</p>
                                 </div>
                              </div>
                            )}
                         </div>
                      </div>
                    );
                  })}
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyPath;
