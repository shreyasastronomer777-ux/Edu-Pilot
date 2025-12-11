import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import LessonPlanner from './components/LessonPlanner';
import QuizMaker from './components/QuizMaker';
import VisualStudio from './components/VisualStudio';
import HomeworkChecker from './components/HomeworkChecker';
import Attendance from './components/Attendance';
import PlagiarismChecker from './components/PlagiarismChecker';
import Login from './components/Login';
import { View } from './types';
import { Menu, Moon, Sun, LogOut } from 'lucide-react';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Theme State
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('edupilot-theme');
      return saved === 'dark';
    }
    return false;
  });

  // Apply theme to HTML element
  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('edupilot-theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('edupilot-theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentView(View.DASHBOARD);
  };

  const renderContent = () => {
    switch (currentView) {
      case View.LESSON_PLANNER:
        return <LessonPlanner />;
      case View.QUIZ_MAKER:
        return <QuizMaker />;
      case View.VISUAL_STUDIO:
        return <VisualStudio />;
      case View.HOMEWORK_CHECKER:
        return <HomeworkChecker />;
      case View.ATTENDANCE:
        return <Attendance />;
      case View.PLAGIARISM_CHECKER:
        return <PlagiarismChecker />;
      case View.DASHBOARD:
      default:
        return <Dashboard onChangeView={setCurrentView} />;
    }
  };

  if (!isLoggedIn) {
    return <Login onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} flex`}>
      {/* Mobile Header */}
      <div className="md:hidden fixed w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 z-20 px-4 py-3 flex items-center justify-between transition-colors">
         <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">E</span>
            </div>
            <span className="font-bold text-slate-800 dark:text-white">EduPilot</span>
         </div>
         <div className="flex items-center gap-3">
           <button onClick={toggleTheme} className="p-2 text-slate-600 dark:text-slate-300">
             {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
           </button>
           <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-slate-600 dark:text-slate-300">
             <Menu />
           </button>
         </div>
      </div>

      {/* Sidebar */}
      <Sidebar 
        currentView={currentView} 
        onViewChange={setCurrentView} 
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
      />
      
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-10 bg-white dark:bg-slate-900 pt-20 px-6 md:hidden">
          <div className="space-y-4">
             {Object.values(View).map((view) => (
               <button 
                key={view}
                onClick={() => { setCurrentView(view); setIsMobileMenuOpen(false); }} 
                className="block w-full text-left py-3 border-b border-slate-100 dark:border-slate-800 text-lg font-medium text-slate-800 dark:text-slate-200 capitalize"
               >
                 {view.replace('_', ' ').toLowerCase()}
               </button>
             ))}
             <button 
               onClick={handleLogout}
               className="block w-full text-left py-3 text-lg font-medium text-red-600 dark:text-red-400 flex items-center gap-2"
             >
               <LogOut size={20} /> Sign Out
             </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 p-6 pt-20 md:pt-6 overflow-x-hidden relative">
        {/* Desktop Logout Button */}
        <div className="hidden md:flex absolute top-6 right-6 gap-3">
           {/* You can add User Profile here later */}
           <button 
             onClick={handleLogout}
             className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
           >
             <LogOut size={16} /> Sign Out
           </button>
        </div>

        {renderContent()}
      </main>
    </div>
  );
};

export default App;