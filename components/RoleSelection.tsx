
import React from 'react';
import { GraduationCap, User, ArrowRight } from 'lucide-react';
import { Role } from '../types';

interface RoleSelectionProps {
  onSelect: (role: Role) => void;
}

const RoleSelection: React.FC<RoleSelectionProps> = ({ onSelect }) => {
  const roles = [
    { id: 'teacher', label: 'Educator', icon: GraduationCap, desc: 'Lesson synthesis, neural evaluations, and classroom management.', color: 'indigo' },
    { id: 'student', label: 'Scholar', icon: User, desc: 'Concept mastery, neural study modes, and performance tracking.', color: 'emerald' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6 transition-colors duration-300">
      <div className="max-w-5xl w-full">
        <div className="text-center mb-16">
           <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg overflow-hidden border border-slate-200 dark:border-white/10">
              <img src="https://iili.io/feG2UBt.md.png" alt="SVGPT Logo" className="w-full h-full object-cover" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4 tracking-tighter uppercase">
              Choose Your Identity
            </h1>
            <p className="text-lg text-slate-500 dark:text-slate-400 max-w-lg mx-auto font-medium">
              Initialize your high-performance workspace based on your role in the ecosystem.
            </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {roles.map((role) => (
            <button 
              key={role.id}
              onClick={() => onSelect(role.id as Role)}
              className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 hover:shadow-2xl transition-all group text-left relative overflow-hidden flex flex-col h-full"
            >
              <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-indigo-600 text-white p-2 rounded-full">
                  <ArrowRight size={16} />
                </div>
              </div>
              
              <div className={`w-14 h-14 bg-${role.color}-100 dark:bg-white/5 text-${role.color}-600 dark:text-white rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300`}>
                <role.icon size={32} />
              </div>
              
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight uppercase">{role.label}</h3>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm font-medium flex-1">
                {role.desc}
              </p>
            </button>
          ))}
        </div>
        
        <div className="mt-16 text-center">
            <p className="text-xs font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">
              Identities can be toggled in settings after initialization.
            </p>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;
