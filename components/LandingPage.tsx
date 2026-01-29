
import React, { useState } from 'react';
import { auth, googleProvider } from '../firebaseConfig';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, signInWithPopup, setPersistence, browserLocalPersistence } from 'firebase/auth';

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  const [authView, setAuthView] = useState<'none' | 'login' | 'signup'>('none');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleGoogleAuth = async () => {
    setIsLoggingIn(true);
    setError(null);
    try {
      // Ensure local persistence for a better user experience
      await setPersistence(auth, browserLocalPersistence);
      await signInWithPopup(auth, googleProvider);
      onGetStarted();
    } catch (err: any) {
      console.error("Google Auth Error Details:", err);
      if (err.code === 'auth/unauthorized-domain') {
        setError("Security Restriction: This domain is not whitelisted in Firebase. Please use 'Guest Mode' or notify the administrators: Shreyas Gunjal & Vaibhav V Chiniwar.");
      } else if (err.code === 'auth/popup-closed-by-user') {
        setError("Sign-in cancelled. Please complete the popup to continue.");
      } else {
        setError(`Authentication handshake failed: ${err.message || "Try again or use Guest Mode."}`);
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
      console.error("Email Auth Error:", err);
      setError("Identity verification failed. Please verify your credentials.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="bg-slate-50 text-slate-900 font-urbanist min-h-screen flex flex-col">
      <style>{`
        :root {
            --brand-primary: #4f46e5;
            --brand-secondary: #6366f1;
        }
        .glass-nav {
            background: rgba(255, 255, 255, 0.8);
            backdrop-filter: blur(12px);
            border-bottom: 1px solid rgba(226, 232, 240, 0.8);
        }
        .hero-gradient {
            background: radial-gradient(circle at top right, rgba(99, 102, 241, 0.05), transparent),
                        radial-gradient(circle at bottom left, rgba(168, 85, 247, 0.03), transparent);
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
        .fade-in {
            animation: fadeIn 0.5s ease forwards;
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
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
          
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <a href="#features" className="hover:text-indigo-600 transition-colors">Our Tools</a>
            <a href="#how-it-works" className="hover:text-indigo-600 transition-colors">How it works</a>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={() => setAuthView('login')} className="text-sm font-bold text-slate-700 hover:text-indigo-600">Sign In</button>
            <button onClick={() => setAuthView('signup')} className="btn-primary text-white px-6 py-2.5 rounded-full text-sm font-bold">Try for Free</button>
          </div>
        </div>
      </nav>

      {authView === 'none' ? (
        <main className="fade-in flex-1">
          {/* HERO SECTION */}
          <section className="hero-gradient pt-40 pb-24 px-6">
            <div className="max-w-7xl mx-auto text-center">
              <span className="inline-block py-1 px-4 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold uppercase tracking-widest mb-6">Designed by Shreyas Gunjal & Vaibhav V Chiniwar</span>
              <h1 className="text-5xl md:text-7xl font-bold font-outfit text-slate-900 mb-8 leading-[1.1]">
                LEARN FAST. <br/><span className="text-indigo-600">TEACH WELL.</span>
              </h1>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
                Our simple tools help you create lesson plans, quizzes, and notes in just one click. Save time and focus on what matters.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button onClick={() => setAuthView('signup')} className="btn-primary text-white px-8 py-4 rounded-xl font-bold w-full sm:w-auto shadow-lg shadow-indigo-200">Start Today</button>
                <button onClick={handleGuestAccess} className="bg-white border border-slate-200 text-slate-700 px-8 py-4 rounded-xl font-bold w-full sm:w-auto hover:bg-slate-50 transition-all">Use as Guest</button>
              </div>
            </div>
          </section>

          {/* FEATURES SECTION */}
          <section id="features" className="py-24 bg-white border-y border-slate-100 px-6">
            <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-10">
                <div className="p-8 bg-indigo-50/50 rounded-3xl border border-indigo-100">
                    <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-md"><i className="fas fa-magic"></i></div>
                    <h3 className="text-xl font-bold mb-3 font-outfit">Quick Plans</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">Make a full teaching plan in seconds. Just type your topic and let AI do the work.</p>
                </div>
                <div className="p-8 bg-emerald-50/50 rounded-3xl border border-emerald-100">
                    <div className="w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-md"><i className="fas fa-check"></i></div>
                    <h3 className="text-xl font-bold mb-3 font-outfit">Simple Quizzes</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">Turn any text into a fun quiz. Test yourself or your students immediately.</p>
                </div>
                <div className="p-8 bg-orange-50/50 rounded-3xl border border-orange-100">
                    <div className="w-12 h-12 bg-orange-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-md"><i className="fas fa-question"></i></div>
                    <h3 className="text-xl font-bold mb-3 font-outfit">Easy Answers</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">Got a hard question? Take a photo and get a clear explanation right away.</p>
                </div>
            </div>
          </section>
        </main>
      ) : (
        /* AUTH SECTION */
        <main className="fade-in min-h-screen flex items-center justify-center px-6 py-24 bg-slate-50 flex-1">
          <div className="max-w-md w-full">
            <div className="text-center mb-10">
              <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-xl shadow-indigo-100">
                <i className="fas fa-user text-2xl"></i>
              </div>
              <h2 className="text-3xl font-outfit font-bold text-slate-900 mb-2">
                {authView === 'login' ? 'Welcome Back!' : 'Join SVGPT'}
              </h2>
              <p className="text-slate-500 font-medium">
                {authView === 'login' ? 'Please sign in to continue' : 'Create your free account today'}
              </p>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-2xl shadow-slate-200/40">
              <form onSubmit={handleEmailAuth} className="space-y-4">
                {authView === 'signup' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Your Name</label>
                    <input type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="Full Name" className="w-full px-5 py-3.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none transition-all font-medium" />
                  </div>
                )}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Email</label>
                  <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="email@example.com" className="w-full px-5 py-3.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none transition-all font-medium" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Password</label>
                  <input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" className="w-full px-5 py-3.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none transition-all font-medium" />
                </div>

                {error && <p className="text-xs text-red-500 font-bold text-center py-2 px-4 bg-red-50 rounded-lg">{error}</p>}

                <button type="submit" disabled={isLoggingIn} className="w-full btn-primary text-white py-4 rounded-xl font-bold shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 mt-2">
                  {isLoggingIn ? <i className="fas fa-spinner fa-spin"></i> : <span>{authView === 'login' ? 'Sign In' : 'Join Now'}</span>}
                </button>
              </form>

              <div className="relative flex items-center justify-center my-8">
                <div className="w-full border-t border-slate-100"></div>
                <span className="absolute bg-white px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Or try this</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button onClick={handleGoogleAuth} disabled={isLoggingIn} className="py-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 font-bold text-slate-700 flex items-center justify-center gap-2 transition-all shadow-sm text-sm">
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-4 h-4" alt="Google" />
                  Google
                </button>
                <button onClick={handleGuestAccess} className="py-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 font-bold text-slate-700 flex items-center justify-center gap-2 transition-all shadow-sm text-sm">
                  <i className="fas fa-user-secret opacity-40"></i>
                  Guest Mode
                </button>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                <p className="text-sm text-slate-500 font-medium">
                  {authView === 'login' ? "New here?" : "Already joined?"}
                  <button 
                    onClick={() => {setAuthView(authView === 'login' ? 'signup' : 'login'); setError(null);}}
                    className="text-indigo-600 font-bold hover:underline ml-2"
                  >
                    {authView === 'login' ? 'Sign up here' : 'Sign in here'}
                  </button>
                </p>
              </div>
            </div>

            <button onClick={() => setAuthView('none')} className="mt-8 w-full flex items-center justify-center gap-2 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors">
              <i className="fas fa-arrow-left text-[10px]"></i>
              Back to Home
            </button>
          </div>
        </main>
      )}

      <footer className="bg-white border-t border-slate-100 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-xs"><i className="fas fa-brain"></i></div>
            <span className="font-outfit font-bold text-xl text-slate-900">SVGPT<span className="text-indigo-600">AI</span></span>
          </div>
          <p className="text-slate-400 text-sm font-medium">© 2026 SVGPT AI. Developed by Shreyas Gunjal & Vaibhav V Chiniwar.</p>
          <div className="flex gap-6 text-slate-400">
            <a href="#" className="hover:text-indigo-600 transition-colors"><i className="fab fa-twitter"></i></a>
            <a href="#" className="hover:text-indigo-600 transition-colors"><i className="fab fa-google"></i></a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
