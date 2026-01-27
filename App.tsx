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
import AISummarizer from './components/AISummarizer';
import StudentQuiz from './components/StudentQuiz';
import FocusRoom from './components/FocusRoom';
import DoubtSolver from './components/DoubtSolver';
import QuickRevision from './components/QuickRevision';
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import RoleSelection from './components/RoleSelection';
import SVChatbot from './components/SVChatbot';
import ParentPortal from './components/ParentPortal';
import SchoolAdmin from './components/SchoolAdmin';
import InstantLessonGenerator from './components/InstantLessonGenerator';
import { View, Role } from './types';
import { LogOut, Search, Loader2 } from 'lucide-react';
import { auth } from './firebaseConfig';
import { onAuthStateChanged, signOut } from 'firebase/auth';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [currentView, setCurrentView] = useState<View>(View.LANDING);
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('sv-theme') === 'dark');
  const [userRole, setUserRole] = useState<Role | null>(() => localStorage.getItem('sv-role') as Role);

  useEffect(() => {
    const root = window.document.documentElement;
    isDarkMode ? root.classList.add('dark') : root.classList.remove('dark');
    localStorage.setItem('sv-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user || localStorage.getItem('sv-demo-mode') === 'true') {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
      setAuthChecking(false);
    });
    return unsubscribe;
  }, []);

  const handleLogout = async () => {
    try { 
      await signOut(auth); 
    } catch (e) {}
    localStorage.removeItem('sv-role');
    localStorage.removeItem('sv-demo-mode');
    setIsLoggedIn(false);
    setUserRole(null);
    setCurrentView(View.LANDING);
  };

  const handleRoleSelect = (role: Role) => {
    setUserRole(role);
    localStorage.setItem('sv-role', role);
    setCurrentView(role === 'parent' ? View.PARENT_PORTAL : role === 'admin' ? View.SCHOOL_ADMIN : View.DASHBOARD);
  };

  const handleGetStartedFromLanding = () => {
    // If already logged in and role set, go to dashboard
    if (isLoggedIn && userRole) {
      setCurrentView(userRole === 'parent' ? View.PARENT_PORTAL : userRole === 'admin' ? View.SCHOOL_ADMIN : View.DASHBOARD);
    } else {
      // Trigger Login flow
      setCurrentView(View.DASHBOARD); // This will fall through to Login if !isLoggedIn
    }
  };

  const renderContent = () => {
    const backToRoot = () => setCurrentView(userRole === 'parent' ? View.PARENT_PORTAL : userRole === 'admin' ? View.SCHOOL_ADMIN : View.DASHBOARD);
    
    switch (currentView) {
      case View.LESSON_PLANNER: return <LessonPlanner onBack={backToRoot} />;
      case View.QUIZ_MAKER: return <QuizMaker onBack={backToRoot} />;
      case View.VISUAL_STUDIO: return <VisualStudio onBack={backToRoot} />;
      case View.HOMEWORK_CHECKER: return <HomeworkChecker />;
      case View.ATTENDANCE: return <Attendance onBack={backToRoot} />;
      case View.PLAGIARISM_CHECKER: return <PlagiarismChecker onBack={backToRoot} />;
      case View.FLASHCARDS: return <Flashcards />;
      case View.STUDY_NOTES: return <StudyNotes />;
      case View.AI_SUMMARIZER: return <AISummarizer />;
      case View.STUDENT_QUIZ: return <StudentQuiz />;
      case View.FOCUS_ROOM: return <FocusRoom />;
      case View.DOUBT_SOLVER: return <DoubtSolver onBack={backToRoot} />;
      case View.QUICK_REVISION: return <QuickRevision onBack={backToRoot} />;
      case View.SV_CHATBOT: return <SVChatbot onBack={backToRoot} userRole={userRole === 'teacher' ? 'teacher' : 'student'} />;
      case View.INSTANT_LESSON: return <InstantLessonGenerator onBack={backToRoot} />;
      case View.PARENT_PORTAL: return <ParentPortal />;
      case View.SCHOOL_ADMIN: return <SchoolAdmin />;
      default: return <Dashboard onChangeView={setCurrentView} userRole={userRole === 'teacher' ? 'teacher' : 'student'} />;
    }
  };

  if (authChecking) {
    return (
      <div className="h-screen w-full bg-slate-50 dark:bg-[#050505] flex flex-col items-center justify-center gap-6">
        <Loader2 className="animate-spin text-indigo-500" size={48} strokeWidth={1} />
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400">Synchronizing Neural Workspace</p>
      </div>
    );
  }

  // Handle Unauthenticated State
  if (currentView !== View.LANDING && !isLoggedIn) {
     return <Login onLogin={() => setIsLoggedIn(true)} />;
  }

  // Handle Unassigned Role
  if (currentView !== View.LANDING && isLoggedIn && !userRole) {
    return <RoleSelection onSelect={handleRoleSelect} />;
  }

  if (currentView === View.LANDING) {
     return <LandingPage onGetStarted={handleGetStartedFromLanding} />;
  }

  return (
    <div className={`h-full min-h-screen flex flex-col md:flex-row ${isDarkMode ? 'dark bg-[#050505]' : 'bg-slate-50'}`}>
      <Sidebar 
        currentView={currentView} onViewChange={setCurrentView} 
        isDarkMode={isDarkMode} toggleTheme={() => setIsDarkMode(!isDarkMode)} userRole={userRole} 
      />
      <main className="flex-1 flex flex-col md:ml-72 relative min-h-screen">
        <div className="hidden md:flex fixed top-8 right-12 gap-3 z-50 p-2 rounded-2xl bg-white/10 dark:bg-black/10 backdrop-blur-md border border-white/5">
          <button onClick={handleLogout} className="p-3 text-slate-400 hover:text-red-500 transition-all bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-white/10 shadow-sm active:scale-90">
            <LogOut size={20} />
          </button>
        </div>
        
        <div className="p-8 pt-24 md:pt-32 animate-in fade-in duration-700 flex-grow overflow-x-hidden">
          {renderContent()}
        </div>
      </main>
      <EduAssistant />
    </div>
  );
};

export default App;