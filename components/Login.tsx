
import React, { useState } from 'react';
import { Mail, Lock, Loader2, AlertCircle, User, ArrowRight, ShieldCheck, Chrome, WifiOff } from 'lucide-react';
import { auth, googleProvider } from '../firebaseConfig';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, signInAnonymously, signInWithPopup } from 'firebase/auth';

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
      console.error("Google Auth Error:", err);
      if (err.code !== 'auth/popup-closed-by-user') {
        handleAuthError(err);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAccess = () => {
    setLoading(true);
    localStorage.setItem('sv-demo-mode', 'true');
    // Ensure we clear any previous login state that might be stuck
    setTimeout(() => {
      onLogin();
      setLoading(false);
    }, 500);
  };

  const handleAuthError = (err: any) => {
    if (err.code === 'auth/unauthorized-domain') {
      setError({ 
        code: 'domain', 
        message: "This domain isn't authorized in Firebase. Use Demo Mode to bypass authentication." 
      });
    } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
      setError({ code: err.code, message: "Invalid credentials. Please verify your details." });
    } else {
      setError({ code: 'unknown', message: err.message || "An unexpected neural link error occurred." });
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#050505] flex items-center justify-center p-6">
      <div className="max-w-md w-full animate-in fade-in zoom-in-95 duration-700">
        <div className="bg-white/80 dark:bg-white/[0.02] backdrop-blur-[40px] rounded-[3rem] shadow-2xl border border-slate-200/50 dark:border-white/10 overflow-hidden">
          <div className="p-10">
            <div className="flex justify-center mb-8">
              <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-3xl flex items-center justify-center shadow-lg overflow-hidden border border-slate-200 dark:border-white/10">
                <img src="https://iili.io/feG2UBt.md.png" alt="SVGPT Logo" className="w-full h-full object-cover" />
              </div>
            </div>
            
            <h2 className="text-3xl font-black text-center text-slate-900 dark:text-white mb-2 tracking-tighter uppercase">
              {isSignUp ? 'New Identity' : 'Nexus Access'}
            </h2>
            <p className="text-center text-slate-500 dark:text-slate-400 mb-10 text-[9px] font-black uppercase tracking-[0.3em] opacity-70">
              Professional Academic Intelligence
            </p>

            <div className="space-y-4 mb-8">
              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-white/10 transition-all font-black uppercase text-[10px] tracking-widest shadow-sm disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" size={16} /> : <Chrome size={16} className="text-indigo-500" />}
                Sign in with Google
              </button>
              
              <div className="relative flex items-center justify-center">
                <div className="w-full border-t border-slate-100 dark:border-white/5"></div>
                <span className="absolute px-4 bg-white dark:bg-[#0B1221] text-[8px] font-black text-slate-400 uppercase tracking-widest">or use email</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {isSignUp && (
                <div className="relative group animate-in slide-in-from-top-2">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                    <User size={14} />
                  </div>
                  <input
                    type="text" required value={name} onChange={(e) => setName(e.target.value)}
                    className="block w-full pl-12 pr-5 py-4 border border-slate-200 dark:border-white/10 rounded-2xl bg-slate-50/50 dark:bg-black/20 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold text-xs"
                    placeholder="Full Academic Name"
                  />
                </div>
              )}

              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                  <Mail size={14} />
                </div>
                <input
                  type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-12 pr-5 py-4 border border-slate-200 dark:border-white/10 rounded-2xl bg-slate-50/50 dark:bg-black/20 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold text-xs"
                  placeholder="Academic Email"
                />
              </div>

              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                  <Lock size={14} />
                </div>
                <input
                  type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-12 pr-5 py-4 border border-slate-200 dark:border-white/10 rounded-2xl bg-slate-50/50 dark:bg-black/20 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold text-xs"
                  placeholder="Security Key"
                />
              </div>

              {error && (
                <div className="p-4 bg-red-500/5 border border-red-500/20 text-red-500 rounded-2xl text-[10px] font-bold flex flex-col gap-3 animate-in fade-in">
                  <div className="flex gap-2.5">
                    <AlertCircle size={14} className="shrink-0" />
                    <p>{error.message}</p>
                  </div>
                  {(error.code === 'domain' || error.code === 'auth/unauthorized-domain') && (
                    <button 
                      type="button" onClick={handleDemoAccess}
                      className="w-full flex items-center justify-between px-4 py-2.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 rounded-xl transition-all group/err"
                    >
                      <span className="flex items-center gap-2"><ShieldCheck size={12} /> Bypass to Demo Mode</span>
                      <ArrowRight size={12} className="group-hover/err:translate-x-1 transition-transform" />
                    </button>
                  )}
                </div>
              )}

              <div className="flex flex-col gap-3">
                <button
                  type="submit" disabled={loading}
                  className="w-full flex items-center justify-center py-4.5 px-6 rounded-2xl text-white bg-slate-900 dark:bg-white dark:text-slate-900 hover:scale-[1.02] active:scale-[0.98] font-black uppercase tracking-widest text-[10px] transition-all disabled:opacity-50 shadow-xl"
                >
                  {loading ? <Loader2 className="animate-spin" size={18} /> : (isSignUp ? 'Initialize Profile' : 'Authenticate Nexus')}
                </button>
                
                <button
                  type="button" onClick={handleDemoAccess}
                  className="w-full py-3.5 rounded-2xl border border-slate-200 dark:border-white/10 text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5 font-black uppercase tracking-widest text-[9px] transition-all"
                >
                  Local Demo Mode
                </button>
              </div>
            </form>

            <div className="mt-8 pt-8 border-t border-slate-100 dark:border-white/5 text-center">
              <button 
                onClick={() => { setIsSignUp(!isSignUp); setError(null); }}
                className="text-[10px] font-black text-indigo-500 uppercase tracking-widest hover:text-indigo-400 transition-colors"
              >
                {isSignUp ? 'Returning User? Sign In' : 'New to Nexus? Initialize Here'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
