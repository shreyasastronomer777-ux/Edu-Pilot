
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import LessonPlanner from './components/LessonPlanner';
import QuizMaker from './components/QuizMaker';
import VisualStudio from './components/VisualStudio';
import HomeworkChecker from './components/HomeworkChecker';
import Attendance from './components/Attendance';
import PlagiarismChecker from './components/PlagiarismChecker';
import EduAssistant from './components/EduAssistant';
import Flashcards from './components/Flashcards';
import StudyNotes from './components/StudyNotes';
import HomeworkPlanner from './components/HomeworkPlanner';
import AISummarizer from './components/AISummarizer';
import StudentQuiz from './components/StudentQuiz';

import Login from './components/Login';
import RoleSelection from './components/RoleSelection';
import { View } from './types';
import { LogOut, Loader2, Search, Rocket, X, Sparkles, User } from 'lucide-react';
import { auth } from './firebaseConfig';
import { onAuthStateChanged, signOut } from 'firebase/auth';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('edupilot-theme') : null;
    return saved === 'dark';
  });

  const [userRole, setUserRole] = useState<'teacher' | 'student' | null>(() => {
    return typeof window !== 'undefined' ? localStorage.getItem('edupilot_role') as 'teacher' | 'student' | null : null;
  });

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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsLoggedIn(true);
      } else {
        const demoUser = localStorage.getItem('edupilot_user');
        setIsLoggedIn(!!demoUser);
      }
      setAuthChecking(false);
    });
    return () => unsubscribe();
  }, []);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setIsCommandPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const handleLogout = async () => {
    try { await signOut(auth); } catch (e) {}
    localStorage.removeItem('edupilot_user');
    localStorage.removeItem('edupilot_role');
    setIsLoggedIn(false);
    setUserRole(null);
    setCurrentView(View.DASHBOARD);
  };

  const handleRoleSelect = (role: 'teacher' | 'student') => {
    setUserRole(role);
    localStorage.setItem('edupilot_role', role);
  };

  const backToDashboard = () => setCurrentView(View.DASHBOARD);

  const renderContent = () => {
    return (
      <div key={currentView} className="animate-in fade-in zoom-in-95 duration-700 ease-[cubic-bezier(0.22, 1, 0.36, 1)]">
        {(() => {
          switch (currentView) {
            case View.LESSON_PLANNER: return <LessonPlanner onBack={backToDashboard} />;
            case View.QUIZ_MAKER: return <QuizMaker onBack={backToDashboard} />;
            case View.VISUAL_STUDIO: return <VisualStudio onBack={backToDashboard} />;
            case View.HOMEWORK_CHECKER: return <HomeworkChecker onBack={backToDashboard} />;
            case View.ATTENDANCE: return <Attendance onBack={backToDashboard} />;
            case View.PLAGIARISM_CHECKER: return <PlagiarismChecker onBack={backToDashboard} />;
            case View.FLASHCARDS: return <Flashcards onBack={backToDashboard} />;
            case View.STUDY_NOTES: return <StudyNotes onBack={backToDashboard} />;
            case View.HOMEWORK_PLANNER: return <HomeworkPlanner onBack={backToDashboard} />;
            case View.AI_SUMMARIZER: return <AISummarizer onBack={backToDashboard} />;
            case View.STUDENT_QUIZ: return <StudentQuiz onBack={backToDashboard} />;
            case View.DASHBOARD:
            default: return <Dashboard onChangeView={setCurrentView} userRole={userRole || 'teacher'} />;
          }
        })()}
      </div>
    );
  };

  if (authChecking) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#050505] flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
           <div className="w-20 h-20 premium-gradient rounded-[2rem] flex items-center justify-center animate-pulse">
              <Sparkles className="text-white" size={40} />
           </div>
           <div className="flex gap-1.5">
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce delay-100"></div>
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce delay-200"></div>
           </div>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) return <Login onLogin={() => setIsLoggedIn(true)} />;
  if (!userRole) return <RoleSelection onSelect={handleRoleSelect} />;

  return (
    <div className={`min-h-screen transition-colors duration-700 ${isDarkMode ? 'bg-[#050505] text-slate-100' : 'bg-[#F8FAFC] text-slate-900'} flex`}>
      <Sidebar 
        currentView={currentView} 
        onViewChange={setCurrentView} 
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        userRole={userRole}
      />

      <main className="flex-1 md:ml-72 p-8 pt-24 md:pt-12 overflow-x-hidden relative min-h-screen">
        {/* Global Toolbar */}
        <div className="hidden md:flex absolute top-12 right-12 gap-4 z-40">
           <div className="flex items-center gap-3 p-1.5 glass-card rounded-2xl border border-slate-200/50 dark:border-white/5">
              <button 
                onClick={() => setIsCommandPaletteOpen(true)}
                className="flex items-center gap-3 px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-indigo-500/10"
              >
                <Search size={14} /> Spotlight <span className="opacity-50 ml-2">⌘K</span>
              </button>
              <button 
                onClick={handleLogout}
                className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                title="Log Out"
              >
                <LogOut size={18} />
              </button>
           </div>
        </div>

        <div className="animate-in fade-in duration-1000">
           {renderContent()}
        </div>
      </main>

      {/* Command Palette Spotlight */}
      {isCommandPaletteOpen && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-3xl flex items-start justify-center pt-[15vh] px-4 animate-in fade-in duration-500">
           <div className="bg-white/80 dark:bg-black/60 w-full max-w-2xl rounded-[3rem] shadow-[0_50px_100px_rgba(0,0,0,0.5)] border border-white/20 overflow-hidden">
              <div className="p-8 border-b border-white/5 flex items-center gap-6">
                 <Rocket className="text-indigo-500 animate-pulse-slow" size={32} />
                 <input 
                   autoFocus
                   type="text"
                   placeholder="Direct search modules..."
                   className="flex-1 bg-transparent border-none outline-none text-2xl font-black tracking-tighter text-slate-900 dark:text-white placeholder-slate-400/50"
                   onKeyDown={(e) => {
                     if (e.key === 'Enter') setIsCommandPaletteOpen(false);
                   }}
                 />
                 <button onClick={() => setIsCommandPaletteOpen(false)} className="bg-white/5 p-3 rounded-2xl text-slate-400 hover:text-white transition-all">
                   <X size={24} />
                 </button>
              </div>
              <div className="p-4 bg-black/10 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center border-t border-white/5">
                Elite Precision Search Active
              </div>
           </div>
        </div>
      )}

      {/* Persistent Elite AI */}
      <EduAssistant />
    </div>
  );
};

export default App;
