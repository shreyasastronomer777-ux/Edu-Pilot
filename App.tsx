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
import SVGStudyCard from './components/SVGStudyCard';
import WorksheetGenerator from './components/WorksheetGenerator';
import PathfinderMaker from './components/PathfinderMaker';
import ExamPrep from './components/ExamPrep';
import RoleSelection from './components/RoleSelection';
import SVChatbot from './components/SVChatbot';
import ParentPortal from './components/ParentPortal';
import SchoolAdmin from './components/SchoolAdmin';
import InstantLessonGenerator from './components/InstantLessonGenerator';
import LandingPage from './components/LandingPage';
import { View, Role } from './types';
import { LogOut, Loader2, Sparkles, ArrowRight, Globe, Key, ShieldCheck, ExternalLink, Cpu } from 'lucide-react';
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
      const isDemo = localStorage.getItem('sv-demo-mode') === 'true';
      if (user || isDemo) {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
      setAuthChecking(false);
    });
    return unsubscribe;
  }, []);

  const handleLogout = async () => {
    try { await signOut(auth); } catch (e) {}
    localStorage.removeItem('sv-role');
    localStorage.removeItem('sv-demo-mode');
    localStorage.removeItem('sv-user-name');
    setIsLoggedIn(false);
    setUserRole(null);
    setCurrentView(View.LANDING);
  };

  const handleRoleSelect = (role: Role) => {
    setUserRole(role);
    localStorage.setItem('sv-role', role);
    setCurrentView(role === 'parent' ? View.PARENT_PORTAL : role === 'admin' ? View.SCHOOL_ADMIN : View.DASHBOARD);
  };

  const handleGetStarted = () => {
    const isDemo = localStorage.getItem('sv-demo-mode') === 'true';
    if ((auth.currentUser || isDemo) && userRole) {
      setCurrentView(userRole === 'parent' ? View.PARENT_PORTAL : userRole === 'admin' ? View.SCHOOL_ADMIN : View.DASHBOARD);
    } else if (auth.currentUser || isDemo) {
      setCurrentView(View.DASHBOARD); 
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
      case View.SVG_STUDY_CARD: return <SVGStudyCard onBack={backToRoot} />;
      case View.WORKSHEET_GENERATOR: return <WorksheetGenerator onBack={backToRoot} />;
      case View.PATHFINDER_MAKER: return <PathfinderMaker onBack={backToRoot} />;
      case View.EXAM_PREP: return <ExamPrep onBack={backToRoot} />;
      case View.SV_CHATBOT: return <SVChatbot onBack={backToRoot} userRole={userRole === 'teacher' ? 'teacher' : 'student'} />;
      case View.INSTANT_LESSON: return <InstantLessonGenerator onBack={backToRoot} />;
      case View.PARENT_PORTAL: return <ParentPortal />;
      case View.SCHOOL_ADMIN: return <SchoolAdmin />;
      default: return <Dashboard onChangeView={setCurrentView} userRole={userRole === 'teacher' ? 'teacher' : 'student'} />;
    }
  };

  if (authChecking) {
    return (
      <div className="h-screen w-full bg-[#050505] flex flex-col items-center justify-center gap-6">
        <div className="relative">
          <Loader2 className="animate-spin text-white opacity-20" size={64} />
          <Cpu className="absolute inset-0 m-auto text-indigo-500 animate-pulse" size={24} />
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Initializing Neural OS</p>
      </div>
    );
  }

  if (currentView === View.LANDING && !isLoggedIn) {
    return <LandingPage onGetStarted={handleGetStarted} />;
  }

  if (!isLoggedIn) {
    return <LandingPage onGetStarted={handleGetStarted} />;
  }

  if (!userRole) {
    return <RoleSelection onSelect={handleRoleSelect} />;
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
          {/* HIGH-VISIBILITY SPONSORSHIP SLOT */}
          <div className="mb-10 max-w-[1200px] mx-auto w-full">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[2.5rem] blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
              <div className="relative bg-white/50 dark:bg-white/[0.02] backdrop-blur-3xl border border-slate-200/50 dark:border-white/10 rounded-[2.5rem] p-4 md:p-6 flex flex-col items-center justify-center text-center overflow-hidden transition-all">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></div>
                  <span className="text-[8px] font-black uppercase tracking-[0.4em] text-slate-400">Institutional Partner Network</span>
                </div>
                <div id="svgpt-institutional-ad-container" className="flex flex-col md:flex-row items-center gap-4">
                   <a 
                     href="https://shiny-fortune.com/dbm.FpzCd/GRNWviZtGNUT/JeMm_9ku/ZNU/lvkiPUT/Ya3bNKT/k/5rNNTzYGtcNKjpck1AO/Tdkp1KNvwo" 
                     target="_blank" 
                     rel="noopener noreferrer"
                     className="group/link flex items-center gap-3 px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
                   >
                     <Globe size={14} className="text-indigo-200 group-hover/link:animate-spin" />
                     Initialize Neural Resource
                     <ArrowRight size={14} />
                   </a>
                   <a 
                     href="https://vigorousescape.com/b.3zVm0DPS3bpHvvbem/V_JoZfDF0O2ANmzhUY5NOjTOUe0KLHTpYT3-NrTVk_5xNYTwUV" 
                     target="_blank" 
                     rel="noopener noreferrer"
                     className="group/link flex items-center gap-3 px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:scale-[1.02] active:scale-95 transition-all border border-white/10"
                   >
                     <Sparkles size={14} className="text-indigo-400 group-hover/link:animate-spin" />
                     Partner Workspace
                     <ArrowRight size={14} />
                   </a>
                </div>
                <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 max-w-md italic mt-4">
                   Optimized for high-performance academic trajectories and neural workload management.
                </p>
              </div>
            </div>
          </div>

          {renderContent()}
        </div>
      </main>
      <EduAssistant />
    </div>
  );
};

export default App;