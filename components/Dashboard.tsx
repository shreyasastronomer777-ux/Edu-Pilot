import React, { useState } from 'react';
import { View } from '../types';
import { Sparkles, Clock, FileText, ArrowRight, Search, CheckSquare, Users, ChevronRight, GraduationCap, Timer, Zap, BookOpenCheck, Camera, Bot, BrainCircuit, MessageSquare, Image as ImageIcon, Layout, FileDown, Compass, FileQuestion, ScrollText, Presentation, Layers, PenTool } from 'lucide-react';
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
    { id: View.PPT_GENERATOR, title: 'PPT Studio', desc: 'Synthesize complex lesson outlines and automated VBA scripts for PowerPoint.', icon: Presentation, color: 'blue' },
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
    { id: View.FLASHCARDS, title: 'Flash-Recall', desc: 'Synthesize study cards and use spaced repetition.', icon: Layers, color: 'orange' },
    { id: View.STUDY_NOTES, title: 'Study Notes', desc: 'Maintain an archive of your academic findings.', icon: PenTool, color: 'teal' },
  ];

  const filteredTools = tools.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none mb-4">
            Hello, <span className="text-indigo-600">{localStorage.getItem('sv-user-name') || 'Scholar'}</span>
          </h1>
          <p className="text-lg text-slate-500 font-medium">Your academic neural grid is synchronized.</p>
        </div>
        
        <div className="bg-white dark:bg-white/5 p-4 rounded-[2rem] shadow-xl flex items-center gap-6 border border-slate-100 dark:border-white/10">
           <div className="flex flex-col items-end">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mastery Rank</span>
              <span className="text-xl font-black text-indigo-600">{xp} XP</span>
           </div>
           <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
              <Zap size={24} fill="currentColor" />
           </div>
        </div>
      </div>

      <div className="relative group max-w-2xl">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search tools or concepts..."
          className="w-full pl-16 pr-8 py-5 bg-white dark:bg-white/[0.03] rounded-[2rem] border border-slate-200 dark:border-white/10 shadow-sm outline-none focus:ring-8 focus:ring-indigo-500/5 transition-all font-bold"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => onChangeView(tool.id)}
            className="group bg-white dark:bg-white/[0.03] p-8 rounded-[3rem] border border-slate-200 dark:border-white/10 text-left hover:border-indigo-500 transition-all hover:shadow-2xl hover:-translate-y-1 flex flex-col h-full"
          >
            <div className={`w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform`}>
               <tool.icon className={`text-indigo-600 dark:text-indigo-400`} size={28} />
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight">{tool.title}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed flex-1">{tool.desc}</p>
            <div className="mt-8 flex items-center justify-between">
               <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Launch Module</span>
               <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                  <ArrowRight size={18} />
               </div>
            </div>
          </button>
        ))}
      </div>
      <Credits className="mt-20 opacity-40" />
    </div>
  );
};

// Fix: Added default export for Dashboard component
export default Dashboard;