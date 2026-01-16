
import React, { useState } from 'react';
import { View } from '../types';
import { LayoutDashboard, BookOpen, GraduationCap, Image as ImageIcon, CheckSquare, Users, ShieldAlert, Moon, Sun, Layers, PenTool, Calendar, FileText, BrainCircuit, X, Swords, Timer, Calculator, Mic, Headphones } from 'lucide-react';
import { auth } from '../firebaseConfig';

interface SidebarProps {
  currentView: View;
  onViewChange: (view: View) => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
  userRole?: 'teacher' | 'student' | null;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange, isDarkMode, toggleTheme, userRole }) => {
  const isTeacher = userRole === 'teacher';
  const user = auth.currentUser;

  const menuItems = isTeacher ? [
    { id: View.DASHBOARD, label: 'Control Center', icon: LayoutDashboard },
    { id: View.LESSON_PLANNER, label: 'Lesson Studio', icon: BookOpen },
    { id: View.QUIZ_MAKER, label: 'Quiz Engine', icon: GraduationCap },
    { id: View.VISUAL_STUDIO, label: 'Creative Suite', icon: ImageIcon },
    { id: View.HOMEWORK_CHECKER, label: 'Evaluator', icon: CheckSquare },
    { id: View.ATTENDANCE, label: 'Registry', icon: Users },
    { id: View.PLAGIARISM_CHECKER, label: 'Guard Rail', icon: ShieldAlert },
  ] : [
    { id: View.DASHBOARD, label: 'My Hub', icon: LayoutDashboard },
    { id: View.FOCUS_ROOM, label: 'Focus Mode', icon: Timer },
    { id: View.AUDIO_BRIEFING, label: 'Audio Brief', icon: Headphones },
    { id: View.DOUBT_SOLVER, label: 'Doubt Solver', icon: Mic },
    { id: View.FLASHCARDS, label: 'Flash-Recall', icon: Layers },
    { id: View.STUDY_NOTES, label: 'Notes Studio', icon: PenTool },
  ];

  return (
    <div className="w-72 bg-white/70 dark:bg-black/40 backdrop-blur-3xl border-r border-slate-200/50 dark:border-white/5 h-screen fixed left-0 top-0 flex flex-col z-30 hidden md:flex transition-all duration-700">
      <div className="p-8">
        <div className="flex items-center gap-4 group cursor-pointer" onClick={() => onViewChange(View.DASHBOARD)}>
          <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500 overflow-hidden border border-slate-200 dark:border-white/10">
            <img src="https://iili.io/feG2UBt.md.png" alt="SVGPT Logo" className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">SVGPT</span>
            <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mt-1">Professional</span>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
        <div className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.2em] px-4 mb-4 mt-2">Navigation</div>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-500 relative group overflow-hidden ${
                isActive 
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 shadow-xl' 
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon size={18} className={`transition-transform duration-500 group-hover:scale-110 ${isActive ? '' : 'opacity-70 group-hover:opacity-100'}`} />
              <span className="text-sm font-bold tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-6 mt-auto space-y-4">
        <div className="p-4 rounded-3xl bg-slate-50 dark:bg-white/5 border border-slate-200/50 dark:border-white/5">
           <button 
             onClick={toggleTheme}
             className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-white dark:bg-black/40 border border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 transition-all group"
           >
             <span className="text-xs font-bold flex items-center gap-2">
               {isDarkMode ? <Moon size={14} /> : <Sun size={14} />}
               {isDarkMode ? 'Midnight' : 'Daylight'}
             </span>
             <div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${isDarkMode ? 'bg-indigo-600' : 'bg-slate-300'}`}>
                <div className={`w-3 h-3 rounded-full bg-white shadow-sm transform transition-transform duration-500 ${isDarkMode ? 'translate-x-4' : 'translate-x-0'}`} />
             </div>
           </button>
        </div>

        <div className="flex items-center gap-3 px-2">
           <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/10 flex items-center justify-center font-black text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/10">
              {user?.displayName?.[0]?.toUpperCase() || 'U'}
           </div>
           <div className="flex flex-col overflow-hidden">
              <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tighter truncate">
                {user?.displayName || 'Scholar'}
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold truncate">
                {isTeacher ? 'Elite Educator' : 'Scholar'}
              </span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
