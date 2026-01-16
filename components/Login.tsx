import React, { useState } from 'react';
import { Mail, Lock, Loader2, AlertCircle, User, ArrowRight, ShieldCheck } from 'lucide-react';
import { auth } from '../firebaseConfig';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, signInAnonymously } from 'firebase/auth';

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
        await updateProfile(userCredential.user, {
          displayName: name
        });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      onLogin();
    } catch (err: any) {
      console.error("Auth Error:", err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError({ code: err.code, message: "Invalid credentials. If you don't have an account, please Sign Up or use Demo Access." });
      } else if (err.code === 'auth/email-already-in-use') {
        setError({ code: err.code, message: "This email is already registered." });
      } else if (err.code === 'auth/weak-password') {
        setError({ code: err.code, message: "Password must be at least 6 characters." });
      } else if (err.code === 'auth/configuration-not-found' || err.code === 'auth/internal-error') {
        setError({ code: 'config', message: "Firebase connection issue. Please use 'Demo Access' to enter the app." });
      } else {
        setError({ code: 'unknown', message: `System error: ${err.message}` });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAccess = async () => {
    setLoading(true);
    try {
      await signInAnonymously(auth);
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: name || 'Guest Scholar'
        });
      }
      onLogin();
    } catch (err) {
      console.warn("Firebase unavailable, proceeding with Guest Mode UI");
      onLogin(); 
    } finally {
      setLoading(false);
    }
  };

  const switchToLogin = () => {
    setIsSignUp(false);
    setError(null);
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
            
            <h2 className="text-3xl font-black text-center text-slate-900 dark:text-white mb-2 tracking-tighter">
              {isSignUp ? 'Identity Synthesis' : 'Access Your Studio'}
            </h2>
            <p className="text-center text-slate-500 dark:text-slate-400 mb-10 text-xs font-black uppercase tracking-widest opacity-70">
              SVGPT Neural Workspace
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {isSignUp && (
                <div className="space-y-6 animate-in slide-in-from-top-4 duration-500">
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                      <User size={16} />
                    </div>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="block w-full pl-14 pr-5 py-4 border border-slate-200 dark:border-white/10 rounded-2xl bg-slate-50/50 dark:bg-black/20 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-sm"
                      placeholder="Full Name"
                    />
                  </div>
                </div>
              )}

              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                  <Mail size={16} />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-14 pr-5 py-4 border border-slate-200 dark:border-white/10 rounded-2xl bg-slate-50/50 dark:bg-black/20 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-sm"
                  placeholder="Email Address"
                />
              </div>

              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                  <Lock size={16} />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-14 pr-5 py-4 border border-slate-200 dark:border-white/10 rounded-2xl bg-slate-50/50 dark:bg-black/20 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-sm"
                  placeholder="Password"
                />
              </div>

              {error && (
                <div className="p-4 bg-red-500/5 border border-red-500/20 text-red-500 rounded-2xl text-xs font-bold flex flex-col gap-3 animate-in fade-in">
                  <div className="flex gap-3">
                    <AlertCircle size={16} className="shrink-0" />
                    <p>{error.message}</p>
                  </div>
                  {error.code !== 'missing-fields' && (
                    <button 
                      type="button"
                      onClick={handleDemoAccess}
                      className="w-full flex items-center justify-between px-4 py-3 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 rounded-xl transition-all group/err"
                    >
                      <span className="flex items-center gap-2"><ShieldCheck size={14} /> Use Guest / Demo Mode</span>
                      <ArrowRight size={14} className="group-hover/err:translate-x-1 transition-transform" />
                    </button>
                  )}
                </div>
              )}

              <div className="flex flex-col gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center py-5 px-6 rounded-2xl text-white bg-slate-900 dark:bg-white dark:text-slate-900 hover:scale-[1.02] active:scale-[0.98] font-black uppercase tracking-widest text-xs transition-all disabled:opacity-50 shadow-xl"
                >
                  {loading ? <Loader2 className="animate-spin" /> : (isSignUp ? 'Complete Registration' : 'Authenticate')}
                </button>
                
                {!error && !isSignUp && (
                  <button
                    type="button"
                    onClick={handleDemoAccess}
                    className="w-full py-4 rounded-2xl border border-slate-200 dark:border-white/10 text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5 font-black uppercase tracking-widest text-[10px] transition-all"
                  >
                    Guest / Demo Access
                  </button>
                )}
              </div>
            </form>

            <div className="mt-8 pt-8 border-t border-slate-100 dark:border-white/5 text-center">
              <button 
                onClick={() => { setIsSignUp(!isSignUp); setError(null); }}
                className="text-xs font-black text-indigo-500 uppercase tracking-widest hover:text-indigo-400 transition-colors"
              >
                {isSignUp ? 'Already registered? Sign In' : 'New to SVGPT? Create Account'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;