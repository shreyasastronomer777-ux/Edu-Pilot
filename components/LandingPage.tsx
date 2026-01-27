
import React, { useState } from 'react';

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  const [isLoginPage, setIsLoginPage] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    // Simulate login delay as in original snippet
    setTimeout(() => {
      setIsLoggingIn(false);
      onGetStarted();
    }, 1500);
  };

  return (
    <div className="bg-slate-50 text-slate-900 font-urbanist min-h-screen flex flex-col">
      <style>{`
        :root {
            --brand-primary: #4f46e5;
            --brand-secondary: #6366f1;
            --bg-dark: #020617;
        }
        .glass-nav {
            background: rgba(255, 255, 255, 0.8);
            backdrop-filter: blur(12px);
            border-bottom: 1px solid rgba(226, 232, 240, 0.8);
        }
        .hero-gradient {
            background: radial-gradient(circle at top right, rgba(99, 102, 241, 0.1), transparent),
                        radial-gradient(circle at bottom left, rgba(168, 85, 247, 0.05), transparent);
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
        .module-card {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .module-card:hover {
            transform: translateY(-5px);
            border-color: var(--brand-primary);
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
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setIsLoginPage(false)}>
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
              <i className="fas fa-brain"></i>
            </div>
            <span className="font-outfit font-bold text-2xl tracking-tight text-slate-900">
              SVGPT<span className="text-indigo-600">AI</span>
            </span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <a href="#features" className="hover:text-indigo-600 transition-colors">Features</a>
            <a href="#modules" className="hover:text-indigo-600 transition-colors">Workspace</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Scholar Hub</a>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={() => setIsLoginPage(true)} className="text-sm font-bold text-slate-700 hover:text-indigo-600">Login</button>
            <button onClick={() => setIsLoginPage(true)} className="btn-primary text-white px-6 py-2.5 rounded-full text-sm font-bold">Get Started</button>
          </div>
        </div>
      </nav>

      {/* LANDING PAGE CONTENT */}
      {!isLoginPage ? (
        <main id="landing-page" className="fade-in flex-1">
          {/* HERO SECTION */}
          <section className="hero-gradient pt-40 pb-24 px-6">
            <div className="max-w-7xl mx-auto text-center">
              <span className="inline-block py-1 px-4 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold uppercase tracking-widest mb-6">The Educator Suite</span>
              <h1 className="text-5xl md:text-7xl font-bold font-outfit text-slate-900 mb-8 leading-[1.1]">
                RECLAIM <span className="text-indigo-600">10+ HOURS</span><br />EVERY SINGLE WEEK.
              </h1>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
                SVGPT handles the repetitive logistics. From standard-aligned planning to multimodal quiz generation, we help you refocus on the art of teaching.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button onClick={() => setIsLoginPage(true)} className="btn-primary text-white px-8 py-4 rounded-xl font-bold w-full sm:w-auto shadow-lg shadow-indigo-200">Launch Control Center</button>
                <button className="bg-white border border-slate-200 text-slate-700 px-8 py-4 rounded-xl font-bold w-full sm:w-auto hover:bg-slate-50 transition-all">Explore Neural Lab</button>
              </div>
            </div>
          </section>

          {/* CORE TOOLS */}
          <section id="features" className="py-24 bg-white border-y border-slate-100">
            <div className="max-w-7xl mx-auto px-6">
              <div className="grid md:grid-cols-2 gap-12">
                <div className="p-10 bg-indigo-50 rounded-3xl group">
                  <div className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-200">
                    <i className="fas fa-wand-magic-sparkles text-xl"></i>
                  </div>
                  <h3 className="text-3xl font-outfit font-bold mb-4">Lesson Architect</h3>
                  <p className="text-lg text-slate-600 mb-6">Generate deep curriculum blueprints from a single prompt. Seamlessly integrated with global standards.</p>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3 text-slate-700 font-medium"><i className="fas fa-check text-indigo-500"></i> Standard-aligned planning</li>
                    <li className="flex items-center gap-3 text-slate-700 font-medium"><i className="fas fa-check text-indigo-500"></i> Multimodal resource generation</li>
                  </ul>
                </div>

                <div className="p-10 bg-emerald-50 rounded-3xl">
                  <div className="w-14 h-14 bg-emerald-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-emerald-200">
                    <i className="fas fa-microscope text-xl"></i>
                  </div>
                  <h3 className="text-3xl font-outfit font-bold mb-4">Evaluator AI</h3>
                  <p className="text-lg text-slate-600 mb-6">Instant, high-rigor grading and feedback for text and scans. Personalized insights for every student.</p>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3 text-slate-700 font-medium"><i className="fas fa-check text-emerald-500"></i> Handwriting recognition</li>
                    <li className="flex items-center gap-3 text-slate-700 font-medium"><i className="fas fa-check text-emerald-500"></i> Real-time feedback synthesis</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* MODULES SECTION */}
          <section id="modules" className="py-24 px-6 bg-slate-50">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-4xl font-outfit font-bold mb-4">Workspace Modules</h2>
                <p className="text-slate-500">Your entire teaching ecosystem, centralized in one neural interface.</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { icon: 'th-large', label: 'Control Center' },
                  { icon: 'robot', label: 'Neural Lab' },
                  { icon: 'bolt', label: 'Instant Synthesis' },
                  { icon: 'book', label: 'Lesson Studio' },
                  { icon: 'vial', label: 'Quiz Engine' },
                  { icon: 'palette', label: 'Creative Suite' },
                  { icon: 'graduation-cap', label: 'Scholar Hub' },
                  { icon: 'dna', label: 'Recall Node' },
                ].map((mod, i) => (
                  <div key={i} className="module-card bg-white p-6 rounded-2xl border border-slate-200 flex flex-col items-center text-center cursor-pointer">
                    <i className={`fas fa-${mod.icon} text-2xl text-indigo-600 mb-4`}></i>
                    <span className="font-bold text-sm">{mod.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA SECTION */}
          <section className="py-24 px-6">
            <div className="max-w-5xl mx-auto bg-indigo-600 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden">
              <div className="relative z-10">
                <h2 className="text-4xl md:text-5xl font-outfit font-bold text-white mb-6">Ready to refocus on the art of teaching?</h2>
                <p className="text-indigo-100 text-lg mb-10 max-w-xl mx-auto">Join thousands of educators reclaiming their time and enhancing student outcomes with SVGPT AI.</p>
                <button onClick={() => setIsLoginPage(true)} className="bg-white text-indigo-600 px-10 py-4 rounded-xl font-bold text-lg hover:bg-indigo-50 transition-all shadow-xl">Get Started for Free</button>
              </div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-400/20 rounded-full blur-3xl -ml-20 -mb-20"></div>
            </div>
          </section>
        </main>
      ) : (
        /* LOGIN PAGE CONTENT */
        <main id="login-page" className="fade-in min-h-screen flex items-center justify-center px-6 py-24 bg-slate-50 flex-1">
          <div className="max-w-md w-full">
            <div className="text-center mb-10">
              <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-xl shadow-indigo-100">
                <i className="fas fa-brain text-2xl"></i>
              </div>
              <h2 className="text-3xl font-outfit font-bold text-slate-900 mb-2">Welcome Back</h2>
              <p className="text-slate-500">Access your Educator Suite Control Center</p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50">
              <form onSubmit={handleLoginSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Registry Email</label>
                  <div className="relative">
                    <i className="fas fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                    <input type="email" required placeholder="name@school.edu" className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none transition-all" />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-bold text-slate-700">Security Key</label>
                    <a href="#" className="text-xs font-bold text-indigo-600 hover:underline">Forgot?</a>
                  </div>
                  <div className="relative">
                    <i className="fas fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                    <input type="password" required placeholder="••••••••" className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none transition-all" />
                  </div>
                </div>

                <div className="flex items-center gap-2 py-2">
                  <input type="checkbox" id="remember" className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                  <label htmlFor="remember" className="text-sm text-slate-600 font-medium cursor-pointer">Stay logged in to Scholar Hub</label>
                </div>

                <button type="submit" disabled={isLoggingIn} className="w-full btn-primary text-white py-4 rounded-xl font-bold shadow-lg shadow-indigo-100 flex items-center justify-center gap-2">
                  {isLoggingIn ? (
                    <>
                      <i className="fas fa-circle-notch fa-spin"></i>
                      <span>Initializing Neural Lab...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <i className="fas fa-arrow-right text-xs"></i>
                    </>
                  )}
                </button>
              </form>

              <div className="mt-8 pt-6 border-t border-slate-100">
                <p className="text-center text-sm text-slate-500">
                  New to the suite? <a href="#" className="text-indigo-600 font-bold hover:underline">Request Registry Access</a>
                </p>
              </div>
            </div>

            <button onClick={() => setIsLoginPage(false)} className="mt-8 w-full flex items-center justify-center gap-2 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors">
              <i className="fas fa-chevron-left text-[10px]"></i>
              Back to Landing
            </button>
          </div>
        </main>
      )}

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-100 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-xs">
              <i className="fas fa-brain"></i>
            </div>
            <span className="font-outfit font-bold text-xl text-slate-900">SVGPT<span className="text-indigo-600">AI</span></span>
          </div>
          <p className="text-slate-400 text-sm">© 2026 SVGPT AI. Designed for educators worldwide.</p>
          <div className="flex gap-6 text-slate-400">
            <a href="#" className="hover:text-indigo-600 transition-colors"><i className="fab fa-twitter"></i></a>
            <a href="#" className="hover:text-indigo-600 transition-colors"><i className="fab fa-linkedin"></i></a>
            <a href="#" className="hover:text-indigo-600 transition-colors"><i className="fas fa-envelope"></i></a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
