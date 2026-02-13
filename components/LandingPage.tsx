
import React, { useState } from 'react';
import { auth, googleProvider } from '../firebaseConfig';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, signInWithPopup, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { Globe, Sparkles, ArrowRight, Loader2, PlayCircle, ShieldCheck, Zap, Info, AlertTriangle, Key, ChevronRight, X } from 'lucide-react';
import { AIHeadIcon, Credits } from './Branding';

interface LandingPageProps {
  onGetStarted: () => void;
  onEnterAssessment: (code: string) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onEnterAssessment }) => {
  const [authView, setAuthView] = useState<'none' | 'login' | 'signup' | 'assessment'>('none');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<{code?: string, message: string} | null>(null);
  const [assessmentKey, setAssessmentKey] = useState('');

  const handleGoogleAuth = async () => {
    setIsLoggingIn(true);
    setError(null);
    try {
      await setPersistence(auth, browserLocalPersistence);
      await signInWithPopup(auth, googleProvider);
      onGetStarted();
    } catch (err: any) {
      console.error("Auth Handshake Error:", err);
      const errorCode = err.code || "";
      if (errorCode === 'auth/unauthorized-domain' || (err.message && err.message.includes('unauthorized-domain'))) {
        setError({
          code: 'domain',
          message: "Neural Link Restricted: This domain is not whitelisted in Firebase. Use 'Neural Bypass' to initialize your workspace."
        });
      } else if (errorCode === 'auth/popup-closed-by-user') {
        setError(null);
      } else {
        setError({ message: `Handshake Failed: ${err.message || "Please use Guest Mode."}` });
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleGuestAccess = () => {
    localStorage.setItem('sv-demo-mode', 'true');
    localStorage.setItem('sv-user-name', 'Guest Explorer');
    onGetStarted();
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setError(null);
    try {
      await setPersistence(auth, browserLocalPersistence);
      if (authView === 'signup') {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      onGetStarted();
    } catch (err: any) {
      const errorCode = err.code || "";
      if (errorCode === 'auth/unauthorized-domain') {
        setError({
          code: 'domain',
          message: "Neural Link Restricted: Firebase domain whitelist error. Use bypass below."
        });
      } else {
        setError({ message: "Identity verification failed. Verify credentials or use Guest Mode." });
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleKeyEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (assessmentKey.length === 6) {
      onEnterAssessment(assessmentKey.toUpperCase());
    } else {
      setError({ message: "Neural keys must be exactly 6 characters." });
    }
  };

  return (
    <div className="bg-[#F8FAFF] text-slate-900 font-urbanist min-h-screen flex flex-col overflow-x-hidden">
      <style>{`
        :root {
            --brand-primary: #4f46e5;
            --brand-secondary: #6366f1;
            --partner-purple: #4B49AC;
            --partner-dark: #0B1221;
        }
        .glass-nav {
            background: rgba(255, 255, 255, 0.85);
            backdrop-filter: blur(20px);
            border-bottom: 1px solid rgba(79, 70, 229, 0.05);
        }
        .hero-gradient {
            background: radial-gradient(circle at 50% 0%, rgba(99, 102, 241, 0.08), transparent 70%),
                        radial-gradient(circle at 100% 100%, rgba(168, 85, 247, 0.05), transparent 70%);
        }
        .btn-primary {
            background: var(--brand-primary);
            transition: all 0.3s ease;
        }
        .btn-primary:hover {
            background: var(--brand-secondary);
            transform: translateY(-2px);
            box-shadow: 0 10px 20px -5px rgba(79, 70, 229, 0.4);
        }
        .ad-container {
            background: linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%);
            border: 1px solid rgba(0,0,0,0.05);
        }
        .shimmer {
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
          background-size: 200% 100%;
          animation: shimmer 2s infinite;
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes drift {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(5%, 8%) scale(1.1); }
          66% { transform: translate(-4%, 4%) scale(0.9); }
        }
        .drifting-blob {
          animation: drift 35s ease-in-out infinite;
          will-change: transform;
        }
        .grid-bg {
          background-image: linear-gradient(rgba(79, 70, 229, 0.05) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(79, 70, 229, 0.05) 1px, transparent 1px);
          background-size: 60px 60px;
          animation: grid-move 40s linear infinite;
        }
        @keyframes grid-move {
          0% { background-position: 0 0; }
          100% { background-position: 60px 60px; }
        }
      `}</style>

      {/* NAVIGATION */}
      <nav className="glass-nav fixed top-0 w-full z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setAuthView('none')}>
            <AIHeadIcon size={32} className="text-indigo-600" />
            <span className="font-outfit font-bold text-2xl tracking-tight text-slate-900">
              ENTRANCE<span className="text-indigo-600">AI</span>
            </span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-500 uppercase tracking-widest">
            <a href="#partner-hub" className="hover:text-indigo-600 transition-colors">Spotlight</a>
            <a href="#workspace" className="hover:text-indigo-600 transition-colors">Workspace</a>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={() => setAuthView('login')} className="text-xs font-black uppercase tracking-[0.2em] text-slate-700 hover:text-indigo-600 transition-colors">Login</button>
            <button onClick={() => setAuthView('signup')} className="btn-primary text-white px-7 py-3 rounded-full text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-100">Initialize</button>
          </div>
        </div>
      </nav>

      {authView === 'none' ? (
        <main className="flex-1 flex flex-col">
          {/* HERO SECTION */}
          <section className="relative hero-gradient pt-48 pb-10 px-6 overflow-hidden min-h-[90vh] flex flex-col">
            {/* Animating Background Components */}
            <div className="absolute inset-0 pointer-events-none z-0">
               {/* Moving Grid */}
               <div className="absolute inset-0 grid-bg opacity-40"></div>
               
               {/* Organic Drifting Blobs */}
               <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[70%] bg-indigo-300/10 blur-[140px] rounded-full drifting-blob" style={{ animationDelay: '0s' }}></div>
               <div className="absolute bottom-[-30%] left-[-15%] w-[55%] h-[65%] bg-purple-300/10 blur-[120px] rounded-full drifting-blob" style={{ animationDelay: '-10s' }}></div>
               <div className="absolute top-[30%] left-[-5%] w-[30%] h-[40%] bg-rose-200/5 blur-[100px] rounded-full drifting-blob" style={{ animationDelay: '-20s' }}></div>
               
               {/* Subtle Radial Overlay */}
               <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#F8FAFF]/50 to-[#F8FAFF]"></div>
            </div>

            <div className="max-w-7xl mx-auto text-center flex flex-col items-center relative z-10">
              <span className="inline-block py-1.5 px-5 bg-white/80 backdrop-blur-md shadow-sm border border-slate-100 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-8 animate-in fade-in slide-in-from-bottom-2 duration-1000">
                Engineered for Academic Peak Performance
              </span>
              
              <h1 className="text-6xl md:text-[7.5rem] font-[900] font-outfit text-slate-900 mb-8 leading-[0.85] tracking-tighter uppercase max-w-5xl animate-in fade-in slide-in-from-bottom-4 duration-1000">
                The Future of <br/><span className="text-indigo-600">Learning AI.</span>
              </h1>
              
              <p className="text-xl text-slate-500 max-w-2xl mb-12 leading-relaxed font-medium animate-in fade-in slide-in-from-bottom-6 duration-1000">
                Unlock precision tools for lesson synthesis, neural evaluation, and deep focus with ENTRANCE. Join the elite academic network today.
              </p>

              <Credits className="mb-12 animate-in fade-in slide-in-from-bottom-8 duration-1000" />
              
              <div className="flex flex-col sm:flex-row items-center gap-5 mb-24 animate-in fade-in slide-in-from-bottom-10 duration-1000">
                <button onClick={() => setAuthView('signup')} className="btn-primary text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl shadow-indigo-200 active:scale-95">Initialize Profile</button>
                <div className="flex gap-2">
                  <button onClick={handleGuestAccess} className="bg-white/80 backdrop-blur-md border border-slate-200 text-slate-700 px-8 py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-50 transition-all shadow-sm active:scale-95">Guest Explorer</button>
                  <button onClick={() => setAuthView('assessment')} className="bg-indigo-600 text-white px-8 py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 active:scale-95 flex items-center gap-3">
                    <Key size={16} /> Guest Assessment
                  </button>
                </div>
              </div>

              {/* AD FEATURE */}
              <div className="w-full max-w-5xl mb-32 group animate-in fade-in slide-in-from-bottom-12 duration-1000">
                 <div className="relative ad-container rounded-[3.5rem] p-1 overflow-hidden shadow-2xl transition-all duration-700 group-hover:scale-[1.01]">
                    <div className="absolute inset-0 shimmer opacity-20"></div>
                    <div className="relative bg-white dark:bg-slate-900 rounded-[3.4rem] overflow-hidden flex flex-col md:flex-row items-center">
                       <div className="w-full md:w-1/2 aspect-video md:aspect-auto md:h-[400px] relative">
                          <img 
                            src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=1000" 
                            className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700" 
                            alt="Neural OS Promotion" 
                          />
                          <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/40 to-transparent"></div>
                          <div className="absolute inset-0 flex items-center justify-center">
                             <div className="w-20 h-20 bg-white/20 backdrop-blur-xl rounded-full border border-white/30 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                                <PlayCircle size={48} />
                             </div>
                          </div>
                       </div>
                       <div className="w-full md:w-1/2 p-12 text-left space-y-6">
                          <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-500/10 text-rose-500 text-[9px] font-black uppercase tracking-widest rounded-full border border-rose-500/20">
                             <Zap size={10} fill="currentColor" /> Sponsored Node
                          </div>
                          <h3 className="text-3xl font-[900] tracking-tighter uppercase leading-tight text-slate-900 dark:text-white">
                             Initialize Your Neural <br/>Academic Infrastructure
                          </h3>
                          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed italic">
                             "Optimized for high-performance academic trajectories and neural workload management."
                          </p>
                          <a 
                            href="https://shiny-fortune.com/dbm.FpzCd/GRNWviZtGNUT/JeMm_9ku/ZNU/lvkiPUT/Ya3bNKT/k/5rNNTzYGtcNKjpck1AO/Tdkp1KNvwo"
                            target="_blank"
                            className="inline-flex items-center gap-3 px-8 py-4 bg-[#4B49AC] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/20 active:scale-95"
                          >
                             Explore Resource <ArrowRight size={16} />
                          </a>
                       </div>
                    </div>
                 </div>
              </div>
            </div>
          </section>
        </main>
      ) : (
        /* AUTH & ASSESSMENT SECTION */
        <main className="min-h-screen flex items-center justify-center px-6 py-24 bg-[#F8FAFF] animate-in fade-in duration-500">
          <div className="max-w-md w-full relative z-10">
            <div className="text-center mb-12">
              <div className="w-20 h-20 bg-indigo-600 rounded-[1.8rem] flex items-center justify-center text-white mx-auto mb-8 shadow-2xl shadow-indigo-200">
                {authView === 'assessment' ? <Key size={48} /> : <AIHeadIcon size={48} />}
              </div>
              <h2 className="text-4xl font-black text-slate-900 mb-2 tracking-tighter uppercase">
                {authView === 'login' ? 'Authorization' : authView === 'signup' ? 'Registration' : 'Neural Entry'}
              </h2>
              <Credits />
            </div>

            <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-2xl shadow-indigo-100/50">
              {authView === 'assessment' ? (
                <form onSubmit={handleKeyEntry} className="space-y-8">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2 text-center">Enter 6-Digit Assessment Key</label>
                    <input 
                      type="text" 
                      maxLength={6}
                      required 
                      value={assessmentKey} 
                      onChange={e => setAssessmentKey(e.target.value.toUpperCase())} 
                      placeholder="XXXXXX" 
                      className="w-full px-6 py-6 rounded-2xl border border-slate-200 focus:border-indigo-500 focus:ring-8 focus:ring-indigo-50 outline-none transition-all font-mono font-black text-4xl text-center bg-slate-50/50 text-indigo-600 tracking-[0.2em]" 
                    />
                  </div>
                  
                  {error && (
                    <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 flex items-center gap-3">
                      <X size={16} />
                      <p className="text-[10px] font-black uppercase tracking-widest">{error.message}</p>
                    </div>
                  )}

                  <button type="submit" className="w-full btn-primary text-white py-6 rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-xl flex items-center justify-center gap-3 active:scale-95">
                    Synthesize Assessment <ChevronRight size={18} />
                  </button>
                </form>
              ) : (
                <form onSubmit={handleEmailAuth} className="space-y-5">
                  {authView === 'signup' && (
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">Academic Alias</label>
                      <input type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="Full Scholarly Name" className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:border-indigo-500 focus:ring-8 focus:ring-indigo-50 outline-none transition-all font-bold text-sm bg-slate-50/50" />
                    </div>
                  )}
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">Neural Link (Email)</label>
                    <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="identity@domain.edu" className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:border-indigo-500 focus:ring-8 focus:ring-indigo-50 outline-none transition-all font-bold text-sm bg-slate-50/50" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">Access Key (Password)</label>
                    <input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••••••" className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:border-indigo-500 focus:ring-8 focus:ring-indigo-50 outline-none transition-all font-bold text-sm bg-slate-50/50" />
                  </div>

                  {error && (
                    <div className={`p-4 rounded-xl flex flex-col gap-3 animate-in shake duration-300 border ${error.code === 'domain' ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-red-50 border-red-100 text-red-600'}`}>
                      <div className="flex items-start gap-3">
                         {error.code === 'domain' ? <AlertTriangle size={16} className="mt-0.5" /> : <Info size={16} className="mt-0.5" />}
                         <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed">{error.message}</p>
                      </div>
                      {(error.code === 'domain' || error.message.includes('Handshake Failed')) && (
                        <button 
                          type="button"
                          onClick={handleGuestAccess}
                          className="w-full py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                        >
                          <ShieldCheck size={14} /> Initialize Neural Bypass
                        </button>
                      )}
                    </div>
                  )}

                  <button type="submit" disabled={isLoggingIn} className="w-full btn-primary text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-xl flex items-center justify-center gap-3 mt-4 disabled:opacity-50">
                    {isLoggingIn ? <Loader2 className="animate-spin" size={18} /> : <span>{authView === 'login' ? 'Initialize Link' : 'Initialize Profile'}</span>}
                  </button>
                </form>
              )}

              <div className="relative flex items-center justify-center my-10">
                <div className="w-full border-t border-slate-100"></div>
                <span className="absolute bg-white px-6 text-[9px] font-black text-slate-300 uppercase tracking-widest">Secondary Handshake</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button onClick={handleGoogleAuth} disabled={isLoggingIn} className="py-4 rounded-2xl border border-slate-200 hover:bg-slate-50 font-black uppercase tracking-widest text-[9px] text-slate-600 flex items-center justify-center gap-3 transition-all shadow-sm">
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-4 h-4" alt="Google" />
                  Google
                </button>
                <button onClick={handleGuestAccess} className="py-4 rounded-2xl border border-slate-200 hover:bg-slate-50 font-black uppercase tracking-widest text-[9px] text-slate-600 flex items-center justify-center gap-3 transition-all shadow-sm">
                  <i className="fas fa-user-secret opacity-40"></i>
                  Guest mode
                </button>
              </div>

              <div className="mt-10 pt-8 border-t border-slate-100 text-center">
                <button 
                  onClick={() => {setAuthView(authView === 'login' ? 'signup' : 'login'); setError(null);}}
                  className="text-indigo-600 text-[10px] font-black uppercase tracking-widest hover:underline"
                >
                  {authView === 'login' ? "Synthesize New Profile" : authView === 'signup' ? "Access Existing Identity" : "Return to Credentials"}
                </button>
              </div>
            </div>

            <button onClick={() => setAuthView('none')} className="mt-12 w-full flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-all">
              <i className="fas fa-chevron-left text-[8px]"></i>
              Return to Grid
            </button>
          </div>
        </main>
      )}

      <footer className="bg-white border-t border-slate-100 py-20 px-6 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex items-center gap-3">
            <AIHeadIcon size={32} className="text-indigo-600" />
            <span className="font-outfit font-bold text-2xl text-slate-900 tracking-tight">ENTRANCE<span className="text-indigo-600">AI</span></span>
          </div>
          <Credits />
          <div className="flex gap-8 text-slate-300">
            <a href="#" className="hover:text-indigo-600 transition-all"><i className="fab fa-twitter text-lg"></i></a>
            <a href="#" className="hover:text-indigo-600 transition-all"><i className="fab fa-linkedin text-lg"></i></a>
            <a href="#" className="hover:text-indigo-600 transition-all"><i className="fab fa-github text-lg"></i></a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
