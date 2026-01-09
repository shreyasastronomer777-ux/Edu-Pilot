
import React, { useState } from 'react';
import { Mail, Lock, Loader2, ArrowRight, AlertCircle, Info, ShieldCheck } from 'lucide-react';
import { auth, googleProvider } from '../firebaseConfig';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';

interface LoginProps {
  onLogin: () => void;
}

const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<{message: string, isDomainError?: boolean} | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError({ message: "Please enter your email and password." });
      return;
    }

    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      console.error(err);
      let msg = "Check your email and password.";
      if (err.code === 'auth/too-many-requests') {
        msg = "Account locked temporarily. Try again in a few minutes.";
      }
      setError({ message: msg });
    } finally {
      setLoading(false);
    }
  };

  const startDemo = () => {
    localStorage.setItem('edupilot_user', 'demo_user');
    onLogin();
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setError(null);
    
    try {
        await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
        if (err.code === 'auth/unauthorized-domain') {
          setError({ 
            message: "Domain not authorized for Firebase Auth. This typically happens in preview environments.", 
            isDomainError: true 
          });
          return;
        }

        let msg = "Google sign-in failed.";
        if (err.code === 'auth/popup-closed-by-user') {
          msg = "Sign-in popup closed.";
        }
        setError({ message: msg });
    } finally {
        setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6 transition-colors duration-300">
      <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-[32px] shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden transition-all duration-300">
        <div className="p-10">
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200 dark:shadow-none animate-in zoom-in duration-500">
              <span className="text-white font-black text-3xl">E</span>
            </div>
          </div>
          
          <h2 className="text-3xl font-black text-center text-slate-900 dark:text-white mb-2 tracking-tight">Welcome to EduPilot</h2>
          <p className="text-center text-slate-500 dark:text-slate-400 mb-10 text-sm font-medium">Your AI-powered educational companion</p>

          <div className="space-y-4">
            <button
              onClick={handleGoogleLogin}
              disabled={isGoogleLoading || loading}
              className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-2xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-4 focus:ring-slate-100 dark:focus:ring-slate-700 font-bold transition-all shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isGoogleLoading ? <Loader2 className="animate-spin" size={20} /> : <GoogleIcon />}
              <span>Continue with Google</span>
            </button>

            <div className="relative flex items-center py-4">
              <div className="flex-grow border-t border-slate-100 dark:border-slate-700"></div>
              <span className="flex-shrink-0 mx-4 text-slate-400 dark:text-slate-500 text-[10px] uppercase font-black tracking-widest">Or email access</span>
              <div className="flex-grow border-t border-slate-100 dark:border-slate-700"></div>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Email</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail size={18} className="text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-12 pr-4 py-4 border border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium"
                    placeholder="name@school.edu"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock size={18} className="text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-12 pr-4 py-4 border border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {error && (
                <div className={`p-4 rounded-2xl text-sm flex items-start gap-3 animate-in fade-in slide-in-from-top-2 shadow-sm border ${
                  error.isDomainError 
                    ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border-amber-100 dark:border-amber-900/30' 
                    : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-100 dark:border-red-900/30'
                }`}>
                  <AlertCircle size={20} className="mt-0.5 flex-shrink-0" />
                  <div className="space-y-2">
                    <p className="font-bold leading-tight">{error.message}</p>
                    {error.isDomainError && (
                      <button 
                        type="button" 
                        onClick={startDemo}
                        className="bg-amber-100 dark:bg-amber-800/40 px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-2 hover:bg-amber-200 transition-colors"
                      >
                        Enter via Demo Mode <ArrowRight size={14} />
                      </button>
                    )}
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || isGoogleLoading}
                className="w-full flex items-center justify-center py-4 px-6 rounded-2xl text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-200 font-black shadow-xl shadow-indigo-100 dark:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
              >
                {loading ? <Loader2 className="animate-spin" /> : 'Log In'}
              </button>
            </form>
          </div>
        </div>
        
        <div className="bg-slate-50 dark:bg-slate-900/50 p-6 text-center border-t border-slate-100 dark:border-slate-700 flex flex-col items-center gap-3">
            <button 
               onClick={startDemo}
               className="text-sm text-indigo-600 dark:text-indigo-400 font-bold hover:underline flex items-center justify-center gap-2 px-4 py-2 rounded-xl hover:bg-white dark:hover:bg-slate-800 transition-all"
            >
              Skip and Enter Demo Mode <ArrowRight size={14} />
            </button>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 uppercase font-black tracking-widest">
              <ShieldCheck size={12} /> Secure Classroom AI
            </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
