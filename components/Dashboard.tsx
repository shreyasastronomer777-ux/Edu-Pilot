
import React, { useState } from 'react';
import { View } from '../types';
import { Sparkles, Clock, FileText, ArrowRight, Search, CheckSquare, Users, ShieldAlert, Layers, PenTool, BrainCircuit, ChevronRight, GraduationCap, Swords, Timer, Calculator, Mic, Camera, Zap } from 'lucide-react';

interface DashboardProps {
  onChangeView: (view: View) => void;
  userRole: 'teacher' | 'student';
}

const Dashboard: React.FC<DashboardProps> = ({ onChangeView, userRole }) => {
  const isTeacher = userRole === 'teacher';
  const [searchQuery, setSearchQuery] = useState('');
  const [xp] = useState(() => Number(localStorage.getItem('svgpt_xp')) || 0);

  const tools = isTeacher ? [
    { id: View.LESSON_PLANNER, title: 'Lesson Studio', desc: 'Craft high-performance curriculums with elite AI reasoning.', icon: FileText, color: 'blue' },
    { id: View.QUIZ_MAKER, title: 'Quiz Engine', desc: 'Generate sophisticated evaluations with instant explanatory depth.', icon: GraduationCap, color: 'emerald' },
    { id: View.VISUAL_STUDIO, title: 'Creative Suite', desc: 'Synthesize professional classroom imagery in ultra-high resolution.', icon: Sparkles, color: 'purple' },
    { id: View.HOMEWORK_CHECKER, title: 'Evaluation AI', desc: 'Precision grading and feedback tailored to academic standards.', icon: CheckSquare, color: 'orange' },
    { id: View.ATTENDANCE, title: 'Registry', desc: 'High-speed student tracking and class management analytics.', icon: Users, color: 'pink' },
    { id: View.PLAGIARISM_CHECKER, title: 'Guard Rail', desc: 'Advanced originality scanning and web-grounded validation.', icon: ShieldAlert, color: 'red' },
  ] : [
    { id: View.DOUBT_SOLVER, title: 'Neural Scanner', desc: 'Snap photos of homework and complex problems for instant AI resolution.', icon: Camera, color: 'indigo' },
    { id: View.FOCUS_ROOM, title: 'Focus Room', desc: 'Deep work environment with custom Pomodoro durations.', icon: Timer, color: 'teal' },
    { id: View.FLASHCARDS, title: 'Flash-Recall', icon: Layers, desc: 'Optimized memory retention through neural study modes.', color: 'orange' },
    { id: View.STUDY_NOTES, title: 'Notes Studio', desc: 'Keep and organize your synthesized homework and study insights.', icon: PenTool, color: 'rose' },
  ];

  const filteredTools = tools.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-8">
      <header className="mb-20 flex flex-col md:flex-row md:items-end justify-between gap-12 staggered-fade-in">
        <div className="space-y-4">
           <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-indigo-500/10 text-indigo-500 text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-indigo-500/20">System Status: Active</span>
              {!isTeacher && (
                <span className="px-3 py-1 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-yellow-500/20 flex items-center gap-1">
                   <Zap size={10} /> {xp} Mastery Points
                </span>
              )}
           </div>
          <h1 className="text-5xl md:text-6xl font-[900] text-slate-900 dark:text-white leading-[0.9] tracking-tighter">
            Elegance in <span className="inline text-transparent bg-clip-text premium-gradient">Education.</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg font-medium max-w-xl opacity-80">
            Welcome back, {isTeacher ? 'Professor' : 'Scholar'}. Your refined toolkit is prepared for peak academic performance.
          </p>
        </div>

        <div className="relative group w-full md:w-[320px]">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Search Modules..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-14 pr-6 py-5 bg-white/50 dark:bg-white/5 backdrop-blur-3xl border border-slate-200 dark:border-white/10 rounded-[2rem] shadow-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold text-sm"
          />
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20 staggered-fade-in">
        {filteredTools.map((tool) => {
          const Icon = tool.icon || Sparkles;
          const colorMap: Record<string, string> = {
            blue: 'from-blue-500/20 to-indigo-500/20 text-blue-500 border-blue-500/10',
            emerald: 'from-emerald-500/20 to-teal-500/20 text-emerald-500 border-emerald-500/10',
            purple: 'from-purple-500/20 to-pink-500/20 text-purple-500 border-purple-500/10',
            orange: 'from-orange-500/20 to-red-500/20 text-orange-500 border-orange-500/10',
            pink: 'from-pink-500/20 to-rose-500/20 text-pink-500 border-pink-500/10',
            red: 'from-red-500/20 to-orange-500/20 text-red-500 border-red-500/10',
            indigo: 'from-indigo-500/20 to-violet-500/20 text-indigo-500 border-indigo-500/10',
            teal: 'from-teal-500/20 to-cyan-500/20 text-teal-500 border-teal-500/10',
            sky: 'from-sky-500/20 to-blue-500/20 text-sky-500 border-sky-500/10',
            rose: 'from-rose-500/20 to-pink-500/20 text-rose-500 border-rose-500/10',
          };

          return (
            <div 
              key={tool.id} 
              className="group relative bg-white/50 dark:bg-white/[0.03] backdrop-blur-3xl p-8 rounded-[2.5rem] border border-slate-200 dark:border-white/10 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/5 hover:-translate-y-2 transition-all duration-700 cursor-pointer flex flex-col h-full overflow-hidden" 
              onClick={() => onChangeView(tool.id)}
            >
              <div className={`absolute -inset-24 bg-gradient-to-br ${colorMap[tool.color]} opacity-0 group-hover:opacity-40 blur-3xl transition-opacity duration-1000 -z-10`}></div>
              
              <div className="flex items-center justify-between mb-8">
                 <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 shadow-inner group-hover:scale-110 transition-transform duration-700`}>
                    <Icon size={26} className={colorMap[tool.color].split(' ')[2]} />
                 </div>
                 <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500 translate-x-4 group-hover:translate-x-0 transition-transform">
                   <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Launch Module</span>
                   <ChevronRight size={14} className="text-slate-400" />
                 </div>
              </div>

              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3 tracking-tighter transition-colors group-hover:text-indigo-500">
                {tool.title}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed flex-1 opacity-80 group-hover:opacity-100 transition-opacity">
                {tool.desc}
              </p>
              
              <div className="mt-8 pt-6 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                <div className="flex -space-x-2">
                   {[1,2,3].map(i => (
                     <div key={i} className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-900 bg-slate-200 dark:bg-slate-800"></div>
                   ))}
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 dark:text-white/20 scale-0 group-hover:scale-100 transition-transform duration-500">
                   <Sparkles size={14} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <section className="staggered-fade-in mb-20">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
             <div className="w-2 h-8 premium-gradient rounded-full"></div>
             <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">Academic Feed</h2>
          </div>
          <button className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-500 transition-colors flex items-center gap-2 group">
            Personal Records <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="bg-white/50 dark:bg-white/[0.03] backdrop-blur-3xl rounded-[3rem] border border-slate-200 dark:border-white/10 overflow-hidden shadow-sm">
          {[1, 2].map((_, i) => (
             <div key={i} className={`p-8 border-b border-slate-100 dark:border-white/5 last:border-0 flex items-center gap-6 hover:bg-white/40 dark:hover:bg-white/5 transition-all duration-500 group`}>
               <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/10 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                 <Clock size={24} className="text-indigo-500" />
               </div>
               <div className="flex-1">
                 <p className="text-lg font-black text-slate-900 dark:text-white leading-none tracking-tight mb-1">
                    {isTeacher ? 'Curriculum Synthesis Complete' : 'Study Insight Synthesized'}
                 </p>
                 <p className="text-sm text-slate-500 dark:text-slate-400 font-medium opacity-70">
                    {isTeacher ? 'Neural engine utilized for advanced concept mapping.' : 'New flashcard deck generated from recent biology notes.'}
                 </p>
               </div>
               <div className="text-right flex flex-col items-end">
                  <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1">Sync: 100%</span>
                  <span className="text-xs font-bold text-slate-400">2h ago</span>
               </div>
             </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
