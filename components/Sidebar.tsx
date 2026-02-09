
import React from 'react';
import { View, Role } from '../types';
import { LayoutDashboard, BookOpen, GraduationCap, Image as ImageIcon, CheckSquare, Users, Moon, Sun, Layers, PenTool, Timer, Mic, Bot, BrainCircuit, Sparkles, MessageSquare, Layout, FileDown, Compass, FileQuestion, ScrollText } from 'lucide-react';
import { auth } from '../firebaseConfig';
import { AIHeadIcon } from './Branding';

interface SidebarProps {
  currentView: View;
  onViewChange: (view: View) => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
  userRole?: Role | null;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange, isDarkMode, toggleTheme, userRole }) => {
  const user = auth.currentUser;

  const getMenuItems = () => {
    switch (userRole) {
      case 'teacher':
        return [
          { id: View.DASHBOARD, label: 'Main Menu', icon: LayoutDashboard },
          { id: View.SV_CHATBOT, label: 'Chat Help', icon: MessageSquare },
          { id: View.EXAM_GENERATOR, label: 'Exam Studio', icon: ScrollText },
          { id: View.INSTANT_LESSON, label: 'Fast Planner', icon: Sparkles },
          { id: View.LESSON_PLANNER, label: 'Make Lessons', icon: BookOpen },
          { id: View.PATHFINDER_MAKER, label: 'Pathfinder', icon: Compass },
          { id: View.WORKSHEET_GENERATOR, label: 'Worksheets', icon: FileDown },
          { id: View.QUIZ_MAKER, label: 'Make Quizzes', icon: GraduationCap },
          { id: View.VISUAL_STUDIO, label: 'Make Images', icon: ImageIcon },
          { id: View.HOMEWORK_CHECKER, label: 'Check Work', icon: CheckSquare },
        ];
      case 'student':
        return [
          { id: View.DASHBOARD, label: 'My Study', icon: LayoutDashboard },
          { id: View.EXAM_PREP, label: 'LESSON-TO-EXAM', icon: BrainCircuit },
          { id: View.FOCUS_ROOM, label: 'Focus Time', icon: Timer },
          { id: View.DOUBT_SOLVER, label: 'Find Answers', icon: Mic },
          { id: View.SVG_STUDY_CARD, label: 'SVG Blueprint', icon: Layout },
          { id: View.FLASHCARDS, label: 'Flashcards', icon: Layers },
          { id: View.STUDY_NOTES, label: 'Study Notes', icon: PenTool },
        ];
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();

  return (
    <div className="w-72 bg-white/70 dark:bg-black/40 backdrop-blur-[60px] border-r border-slate-200/50 dark:border-white/5 h-screen fixed left-0 top-0 flex flex-col z-30 hidden md:flex transition-all duration-700">
      <div className="p-10">
        <div className="flex items-center gap-4 group cursor-pointer" onClick={() => onViewChange(View.DASHBOARD)}>
          <div className="w-14 h-14 bg-indigo-600 dark:bg-indigo-900 rounded-[1.25rem] flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-500 overflow-hidden border border-white/10 p-1.5 text-white">
            <AIHeadIcon size={32} />
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">ENTRANCE</span>
            <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mt-2">AI Assistant</span>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 px-5 space-y-1.5 overflow-y-auto custom-scrollbar">
        <div className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.3em] px-5 mb-6 mt-4">All Tools</div>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-[1.25rem] transition-all duration-500 relative group overflow-hidden ${
                isActive 
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 shadow-2xl scale-[1.02]' 
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon size={20} className={`transition-transform duration-500 group-hover:scale-110 ${isActive ? '' : 'opacity-70 group-hover:opacity-100'}`} />
              <span className="text-sm font-black tracking-tight uppercase">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-8 mt-auto space-y-6">
        <div className="p-5 rounded-[2rem] bg-slate-50 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 shadow-inner">
           <button 
             onClick={toggleTheme}
             className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-white dark:bg-black/40 border border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 transition-all group shadow-sm"
           >
             <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
               {isDarkMode ? <Moon size={14} className="text-indigo-400" /> : <Sun size={14} className="text-yellow-500" />}
               {isDarkMode ? 'Dark' : 'Light'}
             </span>
             <div className={`w-9 h-4.5 rounded-full p-0.5 transition-colors ${isDarkMode ? 'bg-indigo-600' : 'bg-slate-300'}`}>
                <div className={`w-3.5 h-3.5 rounded-full bg-white shadow-sm transform transition-transform duration-500 ${isDarkMode ? 'translate-x-4' : 'translate-x-0'}`} />
             </div>
           </button>
        </div>

        <div className="flex items-center gap-4 px-2">
           <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/10 flex items-center justify-center font-black text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/10 shadow-sm">
              {user?.displayName?.[0]?.toUpperCase() || 'U'}
           </div>
           <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tighter truncate leading-none">
                {user?.displayName || 'Hello User'}
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold truncate capitalize mt-1 tracking-widest">
                {userRole} Mode
              </span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;