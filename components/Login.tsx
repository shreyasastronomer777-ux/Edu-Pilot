import React, { useState } from 'react';
import { Mail, Lock, Loader2, AlertCircle, User, ArrowRight, ShieldCheck, Chrome, WifiOff, GraduationCap, ServerCrash, Key, Info } from 'lucide-react';
import { auth, googleProvider } from '../firebaseConfig';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, signInWithPopup } from 'firebase/auth';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<{ code: string; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password || (isSignUp && !name)) {
      setError({ code: 'missing-fields', message: "Please provide all required credentials." });
      return;
    }
    setLoading(true);
    try {
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      onLogin();
    } catch (err: any) {
      handleAuthError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
      onLogin();
    } catch (err: any) {
      console.error("Auth Handshake Failed:", err);
      handleAuthError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAccess = () => {
    setLoading(true);
    // Persist a flag to bypass Firebase checks in App.tsx
    localStorage.setItem('sv-demo-mode', 'true');
    // Set a dummy user name if none exists
    if (!localStorage.getItem('sv-user-name')) {
      localStorage.setItem('sv-user-name', 'Guest Scholar');
    }
    setTimeout(() => {
      onLogin();
      setLoading(false);
    }, 800);
  };

  const handleAuthError = (err: any) => {
    const errorCode = err.code || '';
    const errorMessage = err.message || '';

    if (errorCode === 'auth/unauthorized-domain' || errorMessage.includes('unauthorized-domain')) {
      setError({ 
        code: 'domain', 
        message: "Neural Link Restricted: This domain is not authorized in Firebase settings. Use Neural Bypass to continue." 
      });
    } else if (errorCode === 'auth/popup-closed-by-user') {
      return;
    } else if (errorCode === 'auth/invalid-credential' || errorCode === 'auth/user-not-found' || errorCode === 'auth/wrong-password') {
      setError({ code: errorCode, message: "Credential mismatch. Verify identity markers." });
    } else {
      setError({ code: 'unknown', message: errorMessage || "An unexpected neural handshake error occurred." });
    }
  };

  return (
    <div className="min-h-screen bg-[#6366F1] flex items-center justify-center p-0 md:p-10 font-sans">
      <div className="max-w-6xl w-full bg-white rounded-none md:rounded-[2.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col md:flex-row min-h-[650px]">
        
        {/* Left Pane: Branding & Graphics */}
        <div className="w-full md:w-1/2 relative overflow-hidden bg-gradient-to-br from-[#6366F1] via-[#A855F7] to-[#F43F5E] p-12 md:p-20 flex flex-col justify-center text-white">
          {/* Abstract Shapes (Ref Image Style) */}
          <div className="absolute top-20 right-[-10%] w-64 h-64 bg-white/10 blur-[80px] rounded-full pointer-events-none"></div>
          <div className="absolute bottom-10 left-[-5%] w-32 h-12 bg-gradient-to-r from-orange-400 to-pink-500 rounded-full rotate-[-45deg] opacity-60"></div>
          <div className="absolute bottom-20 left-[15%] w-48 h-12 bg-gradient-to-r from-orange-400 to-pink-500 rounded-full rotate-[-45deg] opacity-80"></div>
          <div className="absolute bottom-40 left-[35%] w-40 h-10 bg-gradient-to-r from-orange-400 to-pink-500 rounded-full rotate-[-45deg] opacity-40 shadow-2xl"></div>
          <div className="absolute bottom-[10%] left-[50%] w-24 h-8 bg-gradient-to-r from-orange-400 to-pink-500 rounded-full rotate-[-45deg] opacity-50"></div>

          <div className="relative z-10">
            <div className="bg-white/20 w-16 h-16 rounded-2xl flex items-center justify-center mb-10 backdrop-blur-md">
              <GraduationCap size={40} />
            </div>
            <h1 className="text-5xl md:text-6xl font-black mb-6 tracking-tighter leading-none uppercase">
              Welcome to <br /> SVGPT
            </h1>
            <p className="text-indigo-50 text-lg md:text-xl font-medium max-w-sm leading-relaxed opacity-90">
              The intelligent academic operating system for the next generation of scholars and educators.
            </p>
          </div>
        </div>

        {/* Right Pane: Login Console */}
        <div className="w-full md:w-1/2 bg-white flex flex-col items-center justify-center p-12 md:p-20">
          <div className="w-full max-w-sm">
            <h2 className="text-center text-sm font-black text-slate-400 uppercase tracking-[0.4em] mb-12">
              {isSignUp ? 'Initialize Profile' : 'User Login'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {isSignUp && (
                <div className="relative">
                  <User className="absolute left-6 top-1/2 -translate-y-1/2 text-indigo-500/50" size={18} />
                  <input
                    type="text" required value={name} onChange={(e) => setName(e.target.value)}
                    className="w-full pl-14 pr-6 py-4 bg-indigo-50/50 border-none rounded-full text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-slate-300"
                    placeholder="Full Academic Name"
                  />
                </div>
              )}

              <div className="relative">
                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-indigo-500/50" size={18} />
                <input
                  type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-14 pr-6 py-4 bg-indigo-50/50 border-none rounded-full text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-slate-300"
                  placeholder="Email Address"
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-indigo-500/50" size={18} />
                <input
                  type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-14 pr-6 py-4 bg-indigo-50/50 border-none rounded-full text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-slate-300"
                  placeholder="Password"
                />
              </div>

              <div className="flex items-center justify-between px-2">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className="w-4 h-4 rounded border-2 border-indigo-500/20 flex items-center justify-center transition-all group-hover:border-indigo-500 overflow-hidden">
                    <input type="checkbox" className="hidden peer" defaultChecked />
                    <div className="w-2.5 h-2.5 bg-indigo-500 rounded-[2px] opacity-0 peer-checked:opacity-100 transition-opacity"></div>
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Remember Me</span>
                </label>
                <button type="button" className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-indigo-500 transition-colors">Forgot Password?</button>
              </div>

              {error && (
                <div className={`p-5 rounded-2xl text-[10px] font-black uppercase tracking-widest flex flex-col gap-4 animate-in fade-in slide-in-from-top-2 border ${error.code === 'domain' ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-red-50 border-red-100 text-red-500'}`}>
                  <div className="flex items-start gap-3">
                    <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                    <span>{error.message}</span>
                  </div>
                  {(error.code === 'domain' || error.code === 'unknown') && (
                    <button 
                      type="button" 
                      onClick={handleDemoAccess} 
                      className="w-full py-3 bg-indigo-600 text-white rounded-xl font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                      <ShieldCheck size={14} /> Initialize Neural Bypass
                    </button>
                  )}
                </div>
              )}

              <button
                type="submit" disabled={loading}
                className="w-full py-4 premium-gradient text-white rounded-full font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-indigo-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : (isSignUp ? 'Sign Up' : 'Login')}
              </button>
            </form>

            <div className="mt-12 space-y-6">
              <div className="relative flex items-center justify-center">
                <div className="w-full border-t border-slate-100"></div>
                <span className="absolute px-4 bg-white text-[9px] font-black text-slate-300 uppercase tracking-widest">Secondary Methods</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={handleGoogleSignIn}
                  className="flex items-center justify-center gap-3 py-3 rounded-full border border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-colors"
                >
                  <Chrome size={14} /> Google
                </button>
                <button 
                  onClick={handleDemoAccess}
                  className="flex items-center justify-center gap-3 py-3 rounded-full border border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-colors"
                >
                  <WifiOff size={14} /> Demo Mode
                </button>
              </div>

              <div className="text-center pt-4">
                <button 
                  onClick={() => { setIsSignUp(!isSignUp); setError(null); }}
                  className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] hover:opacity-70 transition-opacity"
                >
                  {isSignUp ? 'Existing Identity? Sign In' : 'New to SVGPT? Create Profile'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer Branding */}
      <div className="fixed bottom-10 text-center w-full hidden md:block">
        <p className="text-[10px] font-black text-indigo-200/50 uppercase tracking-[0.6em]">
          Powered by SVGPT Intelligence Core
        </p>
      </div>
    </div>
  );
};

export default Login;