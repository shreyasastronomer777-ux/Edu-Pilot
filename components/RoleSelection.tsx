import React from 'react';
import { GraduationCap, User, ArrowRight } from 'lucide-react';

interface RoleSelectionProps {
  onSelect: (role: 'teacher' | 'student') => void;
}

const RoleSelection: React.FC<RoleSelectionProps> = ({ onSelect }) => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 transition-colors duration-300">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
           <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg overflow-hidden border border-slate-200 dark:border-white/10">
              <img src="https://iili.io/feG2UBt.md.png" alt="SVGPT Logo" className="w-full h-full object-cover" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              How will you use SVGPT?
            </h1>
            <p className="text-lg text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
              Choose your role to customize your high-performance workspace experience.
            </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Teacher Card */}
          <button 
            onClick={() => onSelect('teacher')}
            className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 hover:shadow-xl transition-all group text-left relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="bg-indigo-600 text-white p-2 rounded-full">
                <ArrowRight size={20} />
              </div>
            </div>
            
            <div className="w-14 h-14 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <GraduationCap size={32} />
            </div>
            
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Teacher</h3>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              I want to create lesson plans, generate quizzes, grade homework, and manage my classroom with AI precision.
            </p>
          </button>

          {/* Student Card */}
          <button 
            onClick={() => onSelect('student')}
            className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 hover:shadow-xl transition-all group text-left relative overflow-hidden"
          >
             <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="bg-emerald-600 text-white p-2 rounded-full">
                <ArrowRight size={20} />
              </div>
            </div>

            <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <User size={32} />
            </div>
            
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Student</h3>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              I want to check my assignments, use study tools, review feedback, and track my performance.
            </p>
          </button>
        </div>
        
        <div className="mt-12 text-center">
            <p className="text-sm text-slate-400 dark:text-slate-500">
              You can change this later in your profile settings.
            </p>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;