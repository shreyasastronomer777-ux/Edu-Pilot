
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
import ExamGenerator from './components/ExamGenerator';
import PPTGenerator from './components/PPTGenerator';
import StudyPath from './components/StudyPath';
import NeuralNetwork from './components/NeuralNetwork';
import GuestAssessment from './components/GuestAssessment';
import RoleSelection from './components/RoleSelection';
import SVChatbot from './components/SVChatbot';
import ParentPortal from './components/ParentPortal';
import SchoolAdmin from './components/SchoolAdmin';
import InstantLessonGenerator from './components/InstantLessonGenerator';
import LandingPage from './components/LandingPage';
import { View, Role, ExamPaper } from './types';
import { LogOut, Loader2, Cpu } from 'lucide-react';
import { auth } from './firebaseConfig';
import { onAuthStateChanged, signOut } from 'firebase/auth';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [currentView, setCurrentView] = useState<View>(View.LANDING);
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('sv-theme') === 'dark');
  const [userRole, setUserRole] = useState<Role | null>(() => localStorage.getItem('sv-role') as Role);
  const [activeGuestExam, setActiveGuestExam] = useState<ExamPaper | null>(null);

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

  const handleEnterAssessment = (code: string) => {
    const examData = localStorage.getItem(`guest_exam_${code}`);
    if (examData) {
      setActiveGuestExam(JSON.parse(examData));
      setCurrentView(View.GUEST_ASSESSMENT);
    } else {
      alert("Invalid Neural Key. Access Denied.");
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
      case View.EXAM_GENERATOR: return <ExamGenerator onBack={backToRoot} />;
      case View.PPT_GENERATOR: return <PPTGenerator onBack={backToRoot} />;
      case View.STUDY_PATH: return <StudyPath onBack={backToRoot} />;
      case View.NEURAL_NETWORK: return <NeuralNetwork onBack={backToRoot} onChangeView={setCurrentView} />;
      case View.GUEST_ASSESSMENT: return activeGuestExam ? <GuestAssessment paper={activeGuestExam} onFinish={() => setCurrentView(View.LANDING)} /> : null;
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

  if (currentView === View.GUEST_ASSESSMENT) {
    return (
      <div className={`h-full min-h-screen ${isDarkMode ? 'dark bg-[#050505]' : 'bg-slate-50'}`}>
        <main className="flex-1 flex flex-col p-8 md:p-20">
          {renderContent()}
        </main>
      </div>
    );
  }

  if (currentView === View.LANDING && !isLoggedIn) {
    return <LandingPage onGetStarted={handleGetStarted} onEnterAssessment={handleEnterAssessment} />;
  }

  if (!isLoggedIn) {
    return <LandingPage onGetStarted={handleGetStarted} onEnterAssessment={handleEnterAssessment} />;
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
          {renderContent()}
        </div>
      </main>
      <EduAssistant />
    </div>
  );
};

export default App;
