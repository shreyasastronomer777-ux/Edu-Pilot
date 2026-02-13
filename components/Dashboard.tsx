
import React, { useState } from 'react';
import { View } from '../types';
import { Sparkles, FileText, ArrowRight, Search, CheckSquare, GraduationCap, Zap, BookOpenCheck, Camera, BrainCircuit, MessageSquare, Image as ImageIcon, Layout, FileDown, Compass, ScrollText, Presentation, Layers, PenTool, Route } from 'lucide-react';
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
    { id: View.SV_CHATBOT, title: 'AI Assistant', desc: 'Get help with any teaching question instantly.', icon: MessageSquare },
    { id: View.PPT_GENERATOR, title: 'Slide Maker', desc: 'Create slide outlines and PowerPoint scripts fast.', icon: Presentation },
    { id: View.EXAM_GENERATOR, title: 'Exam Maker', desc: 'Make fair and balanced test papers for your students.', icon: ScrollText },
    { id: View.INSTANT_LESSON, title: 'Quick Lesson Plan', desc: 'Make a full lesson plan from any file or link.', icon: Sparkles },
    { id: View.LESSON_PLANNER, title: 'Lesson Builder', desc: 'Create detailed plans and study slides.', icon: FileText },
    { id: View.PATHFINDER_MAKER, title: 'Study Maps', desc: 'Make easy maps for student research projects.', icon: Compass },
    { id: View.WORKSHEET_GENERATOR, title: 'Worksheet Builder', desc: 'Make printable worksheets with simple diagrams.', icon: FileDown },
    { id: View.QUIZ_MAKER, title: 'Quiz Maker', desc: 'Make tests for your students without the stress.', icon: GraduationCap },
    { id: View.VISUAL_STUDIO, title: 'Image Maker', desc: 'Turn ideas into pictures and clear diagrams.', icon: ImageIcon },
    { id: View.HOMEWORK_CHECKER, title: 'Homework Checker', desc: 'Grade work and give students helpful tips.', icon: CheckSquare },
  ] : [
    { id: View.STUDY_PATH, title: 'Study Roadmap', desc: 'Synthesize a milestone-based learning journey for any topic.', icon: Route },
    { id: View.EXAM_PREP, title: 'Lesson to Quiz', desc: 'Scan your notes to make practice test questions.', icon: BrainCircuit },
    { id: View.QUICK_REVISION, title: 'Easy Review', desc: 'Turn long files into simple, short notes.', icon: BookOpenCheck },
    { id: View.DOUBT_SOLVER, title: 'Answer Finder', desc: 'Get help with hard questions using a photo.', icon: Camera },
    { id: View.SVG_STUDY_CARD, title: 'Diagram Builder', desc: 'Turn your drawings into clean digital diagrams.', icon: Layout },
    { id: View.FLASHCARDS, title: 'Flashcards', desc: 'Make study cards to help you remember everything.', icon: Layers },
    { id: View.STUDY_NOTES, title: 'My Notes', desc: 'Keep all your school notes in one safe place.', icon: PenTool },
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
          <p className="text-lg text-slate-500 font-medium">Your AI school tools are ready to go.</p>
        </div>
        
        <div className="bg-white dark:bg-white/5 p-4 rounded-[2rem] shadow-xl flex items-center gap-6 border border-slate-100 dark:border-white/10">
           <div className="flex flex-col items-end">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Points</span>
              <span className="text-xl font-black text-indigo-600">{xp} XP</span>
           </div>
           <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white">
              <Zap size={24} fill="currentColor" />
           </div>
        </div>
      </div>

      <div className="relative group max-w-2xl">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for a tool..."
          className="w-full pl-16 pr-8 py-5 bg-white dark:bg-white/[0.03] rounded-[2rem] border border-slate-200 dark:border-white/10 outline-none focus:ring-8 focus:ring-indigo-50/5 transition-all font-bold"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => onChangeView(tool.id)}
            className="group bg-white dark:bg-white/[0.03] p-8 rounded-[3rem] border border-slate-200 dark:border-white/10 text-left hover:border-indigo-500 transition-all hover:shadow-2xl hover:-translate-y-1 flex flex-col h-full"
          >
            <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-8">
               <tool.icon className="text-indigo-600 dark:text-indigo-400" size={28} />
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight">{tool.title}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed flex-1">{tool.desc}</p>
            <div className="mt-8 flex items-center justify-between">
               <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Open Tool</span>
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

export default Dashboard;
