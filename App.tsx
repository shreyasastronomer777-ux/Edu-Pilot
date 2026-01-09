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
import { LogOut, Search, X, Sparkles, BrainCircuit } from 'lucide-react';
import { auth } from './firebaseConfig';
import { onAuthStateChanged, signOut } from 'firebase/auth';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('sv-theme') === 'dark');
  const [userRole, setUserRole] = useState<'teacher' | 'student' | null>(() => localStorage.getItem('sv-role') as any);

  useEffect(() => {
    const root = window.document.documentElement;
    isDarkMode ? root.classList.add('dark') : root.classList.remove('dark');
    localStorage.setItem('sv-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
      setAuthChecking(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setIsCommandPaletteOpen(v => !v); }
      if (e.key === 'Escape') setIsCommandPaletteOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    localStorage.removeItem('sv-role');
    setIsLoggedIn(false);
    setUserRole(null);
  };

  const handleRoleSelect = (role: 'teacher' | 'student') => {
    setUserRole(role);
    localStorage.setItem('sv-role', role);
  };

  if (authChecking) return (
    <div className="min-h-screen bg-slate-50 dark:bg-black flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 premium-gradient rounded-2xl animate-pulse flex items-center justify-center">
          <Sparkles className="text-white" size={32} />
        </div>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading SVGPT...</p>
      </div>
    </div>
  );

  if (!isLoggedIn) return <Login onLogin={() => setIsLoggedIn(true)} />;
  if (!userRole) return <RoleSelection onSelect={handleRoleSelect} />;

  const renderContent = () => {
    const back = () => setCurrentView(View.DASHBOARD);
    switch (currentView) {
      case View.LESSON_PLANNER: return <LessonPlanner onBack={back} />;
      case View.QUIZ_MAKER: return <QuizMaker onBack={back} />;
      case View.VISUAL_STUDIO: return <VisualStudio onBack={back} />;
      case View.HOMEWORK_CHECKER: return <HomeworkChecker />;
      case View.ATTENDANCE: return <Attendance onBack={back} />;
      case View.PLAGIARISM_CHECKER: return <PlagiarismChecker onBack={back} />;
      case View.FLASHCARDS: return <Flashcards />;
      case View.STUDY_NOTES: return <StudyNotes />;
      case View.HOMEWORK_PLANNER: return <HomeworkPlanner />;
      case View.AI_SUMMARIZER: return <AISummarizer />;
      case View.STUDENT_QUIZ: return <StudentQuiz />;
      default: return <Dashboard onChangeView={setCurrentView} userRole={userRole} />;
    }
  };

  return (
    <div className={`min-h-screen flex ${isDarkMode ? 'dark bg-black' : 'bg-slate-50'}`}>
      <Sidebar 
        currentView={currentView} onViewChange={setCurrentView} 
        isDarkMode={isDarkMode} toggleTheme={() => setIsDarkMode(!isDarkMode)} userRole={userRole} 
      />
      <main className="flex-1 md:ml-72 p-8 pt-24 md:pt-12 relative min-h-screen">
        <div className="hidden md:flex absolute top-12 right-12 gap-4 z-40">
          <button onClick={() => setIsCommandPaletteOpen(true)} className="flex items-center gap-3 px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest">
            <Search size={14} /> Spotlight
          </button>
          <button onClick={handleLogout} className="p-2.5 text-slate-400 hover:text-red-500 transition-colors"><LogOut size={18} /></button>
        </div>
        <div className="animate-in fade-in duration-700">{renderContent()}</div>
      </main>
      {isCommandPaletteOpen && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-start justify-center pt-[15vh] px-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-3xl shadow-2xl border border-white/10 overflow-hidden">
            <div className="p-6 flex items-center gap-4">
              <BrainCircuit className="text-indigo-500" size={24} />
              <input autoFocus placeholder="Search modules..." className="flex-1 bg-transparent border-none outline-none text-lg font-bold" />
              <button onClick={() => setIsCommandPaletteOpen(false)}><X size={20} /></button>
            </div>
          </div>
        </div>
      )}
      <EduAssistant />
    </div>
  );
};

export default App;