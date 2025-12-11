import React from 'react';
import { View } from '../types';
import { LayoutDashboard, BookOpen, GraduationCap, Image as ImageIcon, CheckSquare, Users, ShieldAlert, Moon, Sun } from 'lucide-react';

interface SidebarProps {
  currentView: View;
  onViewChange: (view: View) => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange, isDarkMode, toggleTheme }) => {
  const menuItems = [
    { id: View.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
    { id: View.LESSON_PLANNER, label: 'Lesson Planner', icon: BookOpen },
    { id: View.QUIZ_MAKER, label: 'Quiz Maker', icon: GraduationCap },
    { id: View.VISUAL_STUDIO, label: 'Visual Studio', icon: ImageIcon },
    { id: View.HOMEWORK_CHECKER, label: 'Homework Checker', icon: CheckSquare },
    { id: View.ATTENDANCE, label: 'Attendance', icon: Users },
    { id: View.PLAGIARISM_CHECKER, label: 'Plagiarism Checker', icon: ShieldAlert },
  ];

  return (
    <div className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 h-screen fixed left-0 top-0 flex flex-col z-10 hidden md:flex transition-colors duration-300">
      <div className="p-6 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">E</span>
          </div>
          <span className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">EduPilot</span>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
                isActive 
                  ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 shadow-sm' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Icon size={20} className={isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
        <button 
          onClick={toggleTheme}
          className="w-full flex items-center justify-between px-4 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        >
          <span className="text-sm font-medium flex items-center gap-2">
            {isDarkMode ? <Moon size={16} /> : <Sun size={16} />}
            {isDarkMode ? 'Dark Mode' : 'Light Mode'}
          </span>
          <div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${isDarkMode ? 'bg-indigo-600' : 'bg-slate-300'}`}>
            <div className={`w-3 h-3 rounded-full bg-white shadow-sm transform transition-transform ${isDarkMode ? 'translate-x-4' : 'translate-x-0'}`} />
          </div>
        </button>

        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-4 text-white">
          <p className="text-xs font-medium opacity-80 mb-1">EduPilot Pro</p>
          <p className="text-sm font-semibold">Your AI Teaching Assistant</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;