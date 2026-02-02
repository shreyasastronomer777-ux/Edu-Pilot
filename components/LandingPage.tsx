import React, { useState } from 'react';
import { auth, googleProvider } from '../firebaseConfig';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, signInWithPopup, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { Globe, Sparkles, ArrowRight, Loader2, PlayCircle, ShieldCheck, Zap, Info, AlertTriangle } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  const [authView, setAuthView] = useState<'none' | 'login' | 'signup'>('none');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<{code?: string, message: string} | null>(null);

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
      if (errorCode === 'auth/unauthorized-domain') {
        setError({
          code: 'domain',
          message: "Neural Link Restricted: This domain is not whitelisted in the Firebase configuration. Use 'Neural Bypass' to continue."
        });
      } else {
        setError({ message: `Authentication handshake failed: ${err.message || "Try again or use Guest Mode."}` });
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
      setError({ message: "Identity verification failed. Please verify your credentials." });
    } finally {
      setIsLoggingIn(false);
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
            background: radial-gradient(circle at top right, rgba(99, 102, 241, 0.1), transparent 50%),
                        radial-gradient(circle at bottom left, rgba(168, 85, 247, 0.08), transparent 50%);
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
          25% { transform: translate(2%, 4%) scale(1.05); }
          50% { transform: translate(-3%, 2%) scale(0.95); }
          75% { transform: translate(1%, -3%) scale(1.02); }
        }
        .drifting-blob {
          animation: drift 25s ease-in-out infinite;
          will-change: transform;
        }
      `}</style>

      {/* NAVIGATION */}
      <nav className="glass-nav fixed top-0 w-full z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setAuthView('none')}>
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
              <i className="fas fa-brain"></i>
            </div>
            <span className="font-outfit font-bold text-2xl tracking-tight text-slate-900">
              SVGPT<span className="text-indigo-600">AI</span>
            </span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-500 uppercase tracking-widest">
            <a href="#partner-hub" className="hover:text-indigo-600 transition-colors">Institutional Spotlight</a>
            <a href="#workspace" className="hover:text-indigo-600 transition-colors">Workspace Tools</a>
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
          <section className="relative hero-gradient pt-48 pb-10 px-6 overflow-hidden">
            {/* Animating Background Blobs */}
            <div className="absolute inset-0 pointer-events-none z-0">
               <div className="absolute top-[-10%] right-[-5%] w-[50%] h-[60%] bg-indigo-200/20 blur-[120px] rounded-full drifting-blob" style={{ animationDelay: '0s' }}></div>
               <div className="absolute bottom-[-20%] left-[-10%] w-[45%] h-[55%] bg-purple-200/20 blur-[100px] rounded-full drifting-blob" style={{ animationDelay: '-5s' }}></div>
               <div className="absolute top-[20%] left-[10%] w-[30%] h-[40%] bg-blue-100/10 blur-[90px] rounded-full drifting-blob" style={{ animationDelay: '-12s' }}></div>
            </div>

            <div className="max-w-7xl mx-auto text-center flex flex-col items-center relative z-10">
              <span className="inline-block py-1.5 px-5 bg-white/60 backdrop-blur-md shadow-sm border border-slate-100 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-8 animate-in fade-in slide-in-from-bottom-2">
                Engineered for Academic Peak Performance
              </span>
              
              <h1 className="text-6xl md:text-[7.5rem] font-[900] font-outfit text-slate-900 mb-8 leading-[0.85] tracking-tighter uppercase max-w-5xl">
                The Future of <br/><span className="text-indigo-600">Learning AI.</span>
              </h1>
              
              <p className="text-xl text-slate-500 max-w-2xl mb-12 leading-relaxed font-medium">
                Unlock precision tools for lesson synthesis, neural evaluation, and deep focus. Join the elite academic network today.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center gap-5 mb-24">
                <button onClick={() => setAuthView('signup')} className="btn-primary text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl shadow-indigo-200 active:scale-95">Initialize Profile</button>
                <button onClick={handleGuestAccess} className="bg-white/80 backdrop-blur-md border border-slate-200 text-slate-700 px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-50 transition-all shadow-sm active:scale-95">Guest Access</button>
              </div>

              {/* AD FEATURE: PHOTO OF AN AD / SPONSORED SPOTLIGHT */}
              <div className="w-full max-w-5xl mb-32 group">
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

              {/* PARTNER HUB: FULL WORKSPACE PREVIEW */}
              <div id="partner-hub" className="w-full bg-white border-y border-slate-100 py-32 px-6">
                 <div className="max-w-7xl mx-auto flex flex-col items-center gap-16">
                    <div className="text-center space-y-4">
                       <div className="flex items-center justify-center gap-3 mb-6">
                          <div className="w-2.5 h-2.5 bg-[#7C3AED] rounded-full shadow-[0_0_12px_rgba(124,58,237,0.6)] animate-pulse"></div>
                          <span className="text-[11px] font-black uppercase tracking-[0.5em] text-slate-400">Institutional Partner Network</span>
                       </div>
                       <h2 className="text-5xl font-[900] tracking-tighter uppercase text-slate-900">Partner Workspace Hub</h2>
                       <p className="text-slate-500 font-medium text-lg max-w-xl mx-auto">
                          Synchronized gateways to institutional resources and specialized academic synthesis environments.
                       </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full max-w-6xl">
                        {/* Purple Resource Section */}
                        <div className="bg-slate-50 rounded-[4rem] p-10 border border-slate-100 flex flex-col items-center text-center group hover:bg-white hover:shadow-3xl transition-all duration-700">
                           <div className="w-20 h-20 bg-[#4B49AC]/10 rounded-[2rem] flex items-center justify-center text-[#4B49AC] mb-10 group-hover:scale-110 transition-transform duration-500">
                              <Globe size={42} strokeWidth={1.5} />
                           </div>
                           <h4 className="text-2xl font-black uppercase tracking-tight mb-4">Neural Resource Portal</h4>
                           <p className="text-slate-500 text-sm font-medium leading-relaxed mb-10 max-w-xs">
                              Access localized knowledge buffers and standard-aligned lesson archetypes.
                           </p>
                           <a 
                             href="https://shiny-fortune.com/dbm.FpzCd/GRNWviZtGNUT/JeMm_9ku/ZNU/lvkiPUT/Ya3bNKT/k/5rNNTzYGtcNKjpck1AO/Tdkp1KNvwo" 
                             target="_blank"
                             className="w-full py-5 bg-[#4B49AC] hover:bg-[#3f3d91] text-white rounded-[2rem] text-[11px] font-black uppercase tracking-widest shadow-2xl shadow-indigo-500/20 active:scale-95 transition-all flex items-center justify-center gap-3"
                           >
                              INITIALIZE NEURAL RESOURCE <ArrowRight size={18} />
                           </a>
                        </div>

                        {/* Black Workspace Section */}
                        <div className="bg-[#0B1221] rounded-[4rem] p-10 flex flex-col items-center text-center group hover:bg-slate-900 hover:shadow-3xl transition-all duration-700">
                           <div className="w-20 h-20 bg-white/10 rounded-[2rem] flex items-center justify-center text-indigo-400 mb-10 group-hover:scale-110 transition-transform duration-500">
                              <Sparkles size={42} strokeWidth={1.5} />
                           </div>
                           <h4 className="text-2xl font-black uppercase tracking-tight mb-4 text-white">Full Partner Workspace</h4>
                           <p className="text-white/50 text-sm font-medium leading-relaxed mb-10 max-w-xs">
                              Precision-engineered for high-volume instructional deconstruction and academic output.
                           </p>
                           <a 
                             href="https://vigorousescape.com/b.3zVm0DPS3bpHvvbem/V_JoZfDF0O2ANmzhUY5NOjTOUe0KLHTpYT3-NrTVk_5xNYTwUV" 
                             target="_blank"
                             className="w-full py-5 bg-white text-[#0B1221] rounded-[2rem] text-[11px] font-black uppercase tracking-widest shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3"
                           >
                              PARTNER WORKSPACE <ArrowRight size={18} />
                           </a>
                        </div>
                    </div>

                    <div className="flex flex-col items-center gap-4">
                       <ShieldCheck className="text-indigo-500" size={24} />
                       <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 text-center">
                          Institutional Encryption Handshake: Verified
                       </p>
                    </div>
                 </div>
              </div>
          </section>

          {/* MAIN TOOLS SECTION */}
          <section id="workspace" className="py-32 px-6 bg-white">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-24">
                   <h2 className="text-4xl font-black tracking-tighter uppercase mb-4">Neural Infrastructure</h2>
                   <p className="text-slate-500 font-medium">Modular components for optimized educational flows.</p>
                </div>
                <div className="grid md:grid-cols-3 gap-10">
                    <div className="p-12 bg-slate-50 rounded-[3.5rem] border border-slate-100 hover:border-indigo-200 hover:bg-white hover:shadow-2xl transition-all group">
                        <div className="w-16 h-16 bg-indigo-600 text-white rounded-2xl flex items-center justify-center mb-10 shadow-xl group-hover:scale-110 transition-transform duration-500"><i className="fas fa-wand-sparkles text-2xl"></i></div>
                        <h3 className="text-2xl font-black mb-4 tracking-tight uppercase">Lesson Studio</h3>
                        <p className="text-slate-500 text-sm leading-relaxed font-medium">Synthesize high-rigor instructional assets from raw data streams in milliseconds.</p>
                    </div>
                    <div className="p-12 bg-slate-50 rounded-[3.5rem] border border-slate-100 hover:border-emerald-200 hover:bg-white hover:shadow-2xl transition-all group">
                        <div className="w-16 h-16 bg-emerald-600 text-white rounded-2xl flex items-center justify-center mb-10 shadow-xl group-hover:scale-110 transition-transform duration-500"><i className="fas fa-check-double text-2xl"></i></div>
                        <h3 className="text-2xl font-black mb-4 tracking-tight uppercase">Evaluation Engine</h3>
                        <p className="text-slate-500 text-sm leading-relaxed font-medium">Precision-grade student submissions with neural feedback loops and criteria matching.</p>
                    </div>
                    <div className="p-12 bg-slate-50 rounded-[3.5rem] border border-slate-100 hover:border-orange-200 hover:bg-white hover:shadow-2xl transition-all group">
                        <div className="w-16 h-16 bg-orange-600 text-white rounded-2xl flex items-center justify-center mb-10 shadow-xl group-hover:scale-110 transition-transform duration-500"><i className="fas fa-brain-circuit text-2xl"></i></div>
                        <h3 className="text-2xl font-black mb-4 tracking-tight uppercase">Isolated Archive</h3>
                        <p className="text-slate-500 text-sm leading-relaxed font-medium">A high-performance repository for scholarly notes and deconstructed academic nodes.</p>
                    </div>
                </div>
            </div>
          </section>
        </main>
      ) : (
        /* AUTH SECTION */
        <main className="min-h-screen flex items-center justify-center px-6 py-24 bg-[#F8FAFF] animate-in fade-in duration-500">
          <div className="max-w-md w-full relative z-10">
            <div className="text-center mb-12">
              <div className="w-20 h-20 bg-indigo-600 rounded-[1.8rem] flex items-center justify-center text-white mx-auto mb-8 shadow-2xl shadow-indigo-200 animate-pulse">
                <i className="fas fa-fingerprint text-3xl"></i>
              </div>
              <h2 className="text-4xl font-black text-slate-900 mb-2 tracking-tighter uppercase">
                {authView === 'login' ? 'Authorization' : 'Registration'}
              </h2>
              <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                {authView === 'login' ? 'Sync existing profile node' : 'Initialize new scholar identity'}
              </p>
            </div>

            <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-2xl shadow-indigo-100/50">
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
                    {error.code === 'domain' && (
                      <button 
                        type="button"
                        onClick={handleGuestAccess}
                        className="w-full py-2 bg-indigo-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest shadow-md hover:bg-indigo-700 transition-all"
                      >
                        Initialize Neural Bypass (Guest Mode)
                      </button>
                    )}
                  </div>
                )}

                <button type="submit" disabled={isLoggingIn} className="w-full btn-primary text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-xl flex items-center justify-center gap-3 mt-4 disabled:opacity-50">
                  {isLoggingIn ? <Loader2 className="animate-spin" size={18} /> : <span>{authView === 'login' ? 'Initialize Link' : 'Initialize Profile'}</span>}
                </button>
              </form>

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
                  {authView === 'login' ? "Synthesize New Profile" : "Access Existing Identity"}
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
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white"><i className="fas fa-brain"></i></div>
            <span className="font-outfit font-bold text-2xl text-slate-900 tracking-tight">SVGPT<span className="text-indigo-600">AI</span></span>
          </div>
          <p className="text-slate-400 text-[11px] font-black uppercase tracking-widest text-center md:text-left">
            © 2026 SVGPT Intelligence Hub. <br className="md:hidden" /> Developed by Shreyas Gunjal & Vaibhav V Chiniwar.
          </p>
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