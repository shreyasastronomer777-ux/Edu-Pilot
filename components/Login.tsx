import React, { useState } from 'react';
import { Mail, Lock, Loader2, AlertCircle, ShieldCheck, UserPlus, LogIn, Sparkles } from 'lucide-react';
import { auth, googleProvider } from '../firebaseConfig';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup } from 'firebase/auth';

interface LoginProps {
  onLogin: () => void;
}

const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError("Please provide all required credentials.");
      return;
    }
    setLoading(true);

    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      onLogin();
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/invalid-credential') {
        setError("Invalid login. Try 'Sign Up' if you are new.");
      } else if (err.code === 'auth/email-already-in-use') {
        setError("Email already registered. Please Sign In.");
      } else if (err.code === 'auth/weak-password') {
        setError("Password must be at least 6 characters.");
      } else {
        setError("Authentication error. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
      onLogin();
    } catch (err: any) {
      setError("Google access failed.");
    } finally {
      setIsGoogleLoading(false);
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
            
            <h2 className="text-3xl font-black text-center text-slate-900 dark:text-white mb-2 tracking-tighter">
              {isSignUp ? 'Create Scholar Profile' : 'Access Your Studio'}
            </h2>
            <p className="text-center text-slate-500 dark:text-slate-400 mb-10 text-xs font-black uppercase tracking-widest opacity-70">
              SVGPT Neural Workspace
            </p>

            <div className="space-y-4">
              <button
                onClick={handleGoogleLogin}
                disabled={isGoogleLoading || loading}
                className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-white/10 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 font-black text-xs uppercase tracking-widest transition-all shadow-sm"
              >
                {isGoogleLoading ? <Loader2 className="animate-spin" size={20} /> : <GoogleIcon />}
                <span>{isSignUp ? 'Continue with Google' : 'Google Authentication'}</span>
              </button>

              <div className="relative flex items-center py-4">
                <div className="flex-grow border-t border-slate-100 dark:border-white/5"></div>
                <span className="flex-shrink-0 mx-4 text-slate-400 dark:text-slate-600 text-[10px] uppercase font-black tracking-widest">Or credentials</span>
                <div className="flex-grow border-t border-slate-100 dark:border-white/5"></div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
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
                  <div className="p-4 bg-red-500/5 border border-red-500/20 text-red-500 rounded-2xl text-xs font-bold flex gap-3 animate-in fade-in">
                    <AlertCircle size={16} className="shrink-0" />
                    <p>{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || isGoogleLoading}
                  className="w-full flex items-center justify-center py-4 px-6 rounded-2xl text-white bg-slate-900 dark:bg-white dark:text-slate-900 hover:scale-[1.02] active:scale-[0.98] font-black uppercase tracking-widest text-xs transition-all disabled:opacity-50 shadow-xl"
                >
                  {loading ? <Loader2 className="animate-spin" /> : (isSignUp ? 'Finalize Registration' : 'Authenticate')}
                </button>
              </form>
            </div>

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