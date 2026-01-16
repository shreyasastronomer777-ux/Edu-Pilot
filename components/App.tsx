
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
import AudioBriefing from './components/AudioBriefing';
import Login from './components/Login';
import RoleSelection from './components/RoleSelection';
import { View } from './types';
import { LogOut, Search, X, Sparkles, BrainCircuit, Mic, Loader2 } from 'lucide-react';
import { auth } from './firebaseConfig';
import { onAuthStateChanged, signOut } from 'firebase/auth';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('sv-theme') === 'dark');
  const [userRole, setUserRole] = useState<'teacher' | 'student' | null>(() => localStorage.getItem('sv-role') as any);
  const [searchQuery, setSearchQuery] = useState('');
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    const root = window.document.documentElement;
    isDarkMode ? root.classList.add('dark') : root.classList.remove('dark');
    localStorage.setItem('sv-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  useEffect(() => {
    try {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        setIsLoggedIn(!!user || localStorage.getItem('sv-demo-mode') === 'true');
        setAuthChecking(false);
      }, (error) => {
        console.error("Auth Listener Error:", error);
        if (localStorage.getItem('sv-demo-mode') === 'true') {
          setIsLoggedIn(true);
        }
        setAuthChecking(false);
      });
      return unsubscribe;
    } catch (e) {
      console.error("Auth Initialization Failure:", e);
      if (localStorage.getItem('sv-demo-mode') === 'true') {
        setIsLoggedIn(true);
      }
      setAuthChecking(false);
    }
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
    try {
      await signOut(auth);
    } catch (e) {
      console.warn("Firebase sign out failed, clearing local state.");
    }
    localStorage.removeItem('sv-role');
    localStorage.removeItem('sv-demo-mode');
    setIsLoggedIn(false);
    setUserRole(null);
  };

  const handleRoleSelect = (role: 'teacher' | 'student') => {
    setUserRole(role);
    localStorage.setItem('sv-role', role);
  };

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    if (!auth.currentUser) {
      localStorage.setItem('sv-demo-mode', 'true');
    }
  };

  const handleVoiceCommand = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice synthesis is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setSearchQuery(transcript);
      setIsCommandPaletteOpen(true);
    };

    recognition.start();
  };

  if (authChecking) return (
    <div className="h-screen w-full bg-slate-50 dark:bg-black flex items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        <div className="w-20 h-20 premium-gradient rounded-3xl animate-bounce flex items-center justify-center shadow-2xl">
          <Sparkles className="text-white" size={40} />
        </div>
        <div className="flex flex-col items-center">
          <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-1">SVGPT Workspace</h2>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 animate-pulse">Initializing pedalogical core...</p>
        </div>
      </div>
    </div>
  );

  if (!isLoggedIn) return <Login onLogin={handleLoginSuccess} />;
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
      case View.AI_SUMMARIZER: return <AISummarizer />;
      case View.STUDENT_QUIZ: return <StudentQuiz />;
      case View.FOCUS_ROOM: return <FocusRoom />;
      case View.DOUBT_SOLVER: return <DoubtSolver onBack={back} />;
      case View.AUDIO_BRIEFING: return <AudioBriefing onBack={back} />;
      default: return <Dashboard onChangeView={setCurrentView} userRole={userRole} />;
    }
  };

  return (
    <div className={`h-full min-h-screen flex flex-col md:flex-row ${isDarkMode ? 'dark bg-black' : 'bg-slate-50'}`}>
      <Sidebar 
        currentView={currentView} onViewChange={setCurrentView} 
        isDarkMode={isDarkMode} toggleTheme={() => setIsDarkMode(!isDarkMode)} userRole={userRole} 
      />
      <main className="flex-1 flex flex-col md:ml-72 relative min-h-screen">
        {/* Fixed Header Buttons */}
        <div className="hidden md:flex fixed top-8 right-12 gap-3 z-50 p-2 rounded-2xl bg-white/10 dark:bg-black/10 backdrop-blur-md">
          <button 
            onClick={handleVoiceCommand}
            className={`p-2.5 rounded-xl border transition-all duration-300 relative overflow-hidden ${
              isListening 
                ? 'bg-red-500 text-white border-red-400 ring-4 ring-red-500/20' 
                : 'bg-white dark:bg-slate-800 text-slate-400 hover:text-indigo-500 border-slate-200 dark:border-slate-700 shadow-sm'
            }`}
            title="Voice Spotlight"
          >
            {isListening ? <Loader2 className="animate-spin" size={18} /> : <Mic size={18} />}
          </button>
          <button 
            onClick={() => setIsCommandPaletteOpen(true)} 
            className="flex items-center gap-3 px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl transition-transform hover:scale-105 active:scale-95"
          >
            <Search size={14} /> Spotlight
          </button>
          <button onClick={handleLogout} className="p-2.5 text-slate-400 hover:text-red-500 transition-colors bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <LogOut size={18} />
          </button>
        </div>
        
        <div className="p-8 pt-24 md:pt-32 animate-in fade-in duration-700 flex-grow">
          {renderContent()}
        </div>
      </main>
      
      {isCommandPaletteOpen && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-start justify-center pt-[15vh] px-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-[2.5rem] shadow-2xl border border-white/10 overflow-hidden">
            <div className="p-8 flex items-center gap-6">
              <BrainCircuit className="text-indigo-500" size={32} />
              <input 
                autoFocus 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="What should we synthesize today?" 
                className="flex-1 bg-transparent border-none outline-none text-2xl font-bold tracking-tighter placeholder:text-slate-300 dark:placeholder:text-slate-700" 
              />
              <button onClick={() => setIsCommandPaletteOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full"><X size={24} /></button>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-white/5 border-t border-slate-100 dark:border-white/5">
               <div className="flex gap-2">
                  <span className="px-3 py-1 bg-white dark:bg-slate-800 text-[9px] font-black text-slate-400 rounded-lg">ESC to Close</span>
                  <span className="px-3 py-1 bg-white dark:bg-slate-800 text-[9px] font-black text-indigo-500 rounded-lg">ENTER to Search</span>
               </div>
            </div>
          </div>
        </div>
      )}
      <EduAssistant />
    </div>
  );
};

export default App;
