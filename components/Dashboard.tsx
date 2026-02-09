
import React, { useState } from 'react';
import { View } from '../types';
import { Sparkles, Clock, FileText, ArrowRight, Search, CheckSquare, Users, ChevronRight, GraduationCap, Timer, Zap, BookOpenCheck, Camera, Bot, BrainCircuit, MessageSquare, Image as ImageIcon, Layout, FileDown, Compass, FileQuestion, ScrollText } from 'lucide-react';
import { Credits } from './Branding';

interface DashboardProps {
  onChangeView: (view: View) => void;
  userRole: 'teacher' | 'student';
}

const Dashboard: React.FC<DashboardProps> = ({ onChangeView, userRole }) => {
  const isTeacher = userRole === 'teacher';
  const [searchQuery, setSearchQuery] = useState('');
  const [xp] = useState(() => Number(localStorage.getItem('svgpt_xp')) || 0);

  const tools = isTeacher ? [
    { id: View.SV_CHATBOT, title: 'AI Assistant', desc: 'Ask any teaching question and get helpful answers right away.', icon: MessageSquare, color: 'indigo' },
    { id: View.EXAM_GENERATOR, title: 'Exam Studio', desc: 'Synthesize rigorous, balanced exam papers with Bloom\'s alignment.', icon: ScrollText, color: 'rose' },
    { id: View.INSTANT_LESSON, title: 'Quick Plan Generator', desc: 'Make a full lesson plan and slides from any file or link.', icon: Sparkles, color: 'violet' },
    { id: View.LESSON_PLANNER, title: 'Lesson Creator', icon: FileText, desc: 'Create plans and SVG architectural slides for your classes.', color: 'blue' },
    { id: View.PATHFINDER_MAKER, title: 'Pathfinder Maker', desc: 'Synthesize guided inquiry roadmaps for student research projects.', icon: Compass, color: 'emerald' },
    { id: View.WORKSHEET_GENERATOR, title: 'Worksheet Architect', desc: 'Synthesize high-quality, printable SVG worksheets with diagrams.', icon: FileDown, color: 'teal' },
    { id: View.QUIZ_MAKER, title: 'Quiz Maker', desc: 'Make great tests for your students without any stress.', icon: GraduationCap, color: 'orange' },
    { id: View.VISUAL_STUDIO, title: 'Image Generator', desc: 'Turn your ideas into beautiful pictures and diagrams.', icon: ImageIcon, color: 'purple' },
    { id: View.HOMEWORK_CHECKER, title: 'Homework Checker', desc: 'Grade student work and give them helpful feedback easily.', icon: CheckSquare, color: 'pink' },
  ] : [
    { id: View.EXAM_PREP, title: 'LESSON-TO-EXAM', desc: 'SCAN YOUR MATERIALS TO GENERATE RIGOROUS TEST QUESTIONS', icon: BrainCircuit, color: 'rose' },
    { id: View.QUICK_REVISION, title: 'Easy Review', desc: 'Turn long files into simple notes that are easy to read.', icon: BookOpenCheck, color: 'violet' },
    { id: View.DOUBT_SOLVER, title: 'Answer Finder', desc: 'Got a hard question? Upload a file or photo for help.', icon: Camera, color: 'indigo' },
    { id: View.SVG_STUDY_CARD, title: 'SVG Blueprint', desc: 'Convert your drawings and sketches into clean diagrams and cards.', icon: Layout, color: 'blue' },
    { id: View.FOCUS_ROOM, title: 'Study Space', desc: 'A quiet place to study with music and a simple timer.', icon: Timer, color: 'teal' },
  ];

  const filteredTools = tools.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-8 animate-in fade-in duration-1000">
      <header className="mb-20 flex flex-col md:flex-row md:items-end justify-between gap-12">
        <div className="space-y-6">
           <div className="flex flex-wrap items-center gap-3">
              <span className="px-4 py-1.5 bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-indigo-500/20 backdrop-blur-md">
                Founding Architects: Vamshi, Vaibhav & Shreyas
              </span>
              {!isTeacher && (
                <span className="px-4 py-1.5 bg-yellow-500/10 text-yellow-500 text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-yellow-500/20 flex items-center gap-2">
                   <Zap size={10} className="fill-current" /> {xp} Points Earned
                </span>
              )}
           </div>
          <h1 className="text-6xl md:text-7xl font-[900] text-slate-900 dark:text-white leading-[0.85] tracking-tighter uppercase">
            ENTRANCE <br />
            <span className="inline text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Workspace.</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xl font-medium max-w-xl">
            Welcome back to ENTRANCE. Pick a tool below to start {isTeacher ? 'planning your class' : 'your study time'}.
          </p>
        </div>

        <div className="flex flex-col gap-6 items-end">
          <Credits className="items-end text-right hidden md:flex" />
          <div className="relative group w-full md:w-[350px]">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Search for a tool..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-16 pr-6 py-6 bg-white dark:bg-white/5 backdrop-blur-3xl border border-slate-200 dark:border-white/10 rounded-[2.5rem] shadow-2xl focus:ring-8 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold text-sm text-slate-800 dark:text-white"
            />
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24 staggered-fade-in">
        {filteredTools.map((tool) => {
          const Icon = tool.icon || Sparkles;
          const colorMap: Record<string, string> = {
            blue: 'border-blue-500/20 bg-blue-500/5 text-blue-400',
            emerald: 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400',
            purple: 'border-purple-500/20 bg-purple-500/5 text-purple-400',
            violet: 'border-violet-600/20 bg-violet-600/5 text-violet-400',
            orange: 'border-orange-500/20 bg-orange-500/5 text-orange-400',
            pink: 'border-pink-500/20 bg-pink-500/5 text-pink-400',
            indigo: 'border-indigo-500/20 bg-indigo-500/5 text-indigo-400',
            teal: 'border-teal-500/20 bg-teal-500/5 text-teal-400',
            rose: 'border-rose-500/20 bg-rose-500/5 text-rose-400',
          };

          return (
            <div 
              key={tool.id} 
              className={`group relative p-10 rounded-[3.5rem] border transition-all duration-700 cursor-pointer flex flex-col h-full overflow-hidden ${colorMap[tool.color] || 'border-white/10 bg-white/5 text-white'}`} 
              onClick={() => onChangeView(tool.id)}
            >
              <div className="absolute -inset-24 bg-current opacity-0 group-hover:opacity-[0.03] blur-3xl transition-opacity duration-1000 -z-10"></div>
              
              <div className="flex items-center justify-between mb-10">
                 <div className="w-16 h-16 rounded-[1.5rem] flex items-center justify-center bg-white dark:bg-black/40 border border-slate-200 dark:border-white/5 shadow-inner group-hover:scale-110 transition-transform duration-700">
                    <Icon size={32} />
                 </div>
                 <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 translate-x-4 group-hover:translate-x-0 transition-transform">
                   <span className="text-[9px] font-black uppercase tracking-widest opacity-60">Open</span>
                   <ChevronRight size={14} className="opacity-60" />
                 </div>
              </div>

              <h3 className="text-3xl font-black mb-4 tracking-tighter uppercase leading-none">
                {tool.title}
              </h3>
              <p className="text-sm font-medium leading-relaxed flex-1 opacity-60 group-hover:opacity-100 transition-opacity">
                {tool.desc}
              </p>
              
              <div className="mt-10 pt-8 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                <div className="flex -space-x-2">
                   {[1,2,3].map(i => (
                     <div key={i} className="w-7 h-7 rounded-full border-2 border-slate-200 dark:border-[#050505] bg-slate-100 dark:bg-slate-800"></div>
                   ))}
                </div>
                <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400 dark:text-white/20 scale-0 group-hover:scale-100 transition-transform duration-500">
                   <Zap size={16} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Dashboard;