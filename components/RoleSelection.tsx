
import React from 'react';
import { GraduationCap, User, ArrowRight, ShieldCheck, Globe } from 'lucide-react';
import { Role } from '../types';

interface RoleSelectionProps {
  onSelect: (role: Role) => void;
}

const RoleSelection: React.FC<RoleSelectionProps> = ({ onSelect }) => {
  const roles = [
    { id: 'teacher', label: 'Educator', icon: GraduationCap, desc: 'Lesson architecture, neural evaluation, and classroom synthesis.', color: 'indigo' },
    { id: 'student', label: 'Scholar', icon: User, desc: 'Concept mastery, neural focus study, and academic trajectory.', color: 'emerald' },
    { id: 'parent', label: 'Parent/Guardian', icon: ShieldCheck, desc: 'Monitor scholar heartbeats, analytics, and institutional sync.', color: 'purple' },
    { id: 'admin', label: 'School Admin', icon: Globe, desc: 'Institutional governance, report generation, and neural link management.', color: 'pink' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#050505] flex items-center justify-center p-8 transition-colors duration-500">
      <div className="max-w-6xl w-full">
        <div className="text-center mb-20 animate-in fade-in slide-in-from-top-4 duration-1000">
           <div className="w-24 h-24 bg-white dark:bg-slate-900 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-2xl overflow-hidden border border-slate-200 dark:border-white/10">
              <img src="https://iili.io/feG2UBt.md.png" alt="SVGPT Logo" className="w-full h-full object-cover p-2" />
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-slate-900 dark:text-white mb-6 tracking-tighter uppercase leading-[0.9]">
              Define Your <span className="text-indigo-600">Identity.</span>
            </h1>
            <p className="text-xl text-slate-500 dark:text-slate-400 max-w-xl mx-auto font-medium">
              Initialize your high-performance workspace based on your strategic role in the academic ecosystem.
            </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {roles.map((role, idx) => (
            <button 
              key={role.id}
              onClick={() => onSelect(role.id as Role)}
              style={{ animationDelay: `${idx * 100}ms` }}
              className="bg-white dark:bg-white/[0.03] p-10 rounded-[3rem] border border-slate-200 dark:border-white/10 hover:border-indigo-500 dark:hover:border-indigo-500 hover:shadow-3xl transition-all group text-left relative overflow-hidden flex flex-col h-full animate-in fade-in slide-in-from-bottom-8 duration-700 shadow-sm"
            >
              <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-indigo-600 text-white p-2.5 rounded-full shadow-xl">
                  <ArrowRight size={20} />
                </div>
              </div>
              
              <div className={`w-16 h-16 bg-${role.color}-100 dark:bg-white/5 text-${role.color}-600 dark:text-white rounded-[1.5rem] flex items-center justify-center mb-10 group-hover:scale-110 transition-transform duration-500`}>
                <role.icon size={36} />
              </div>
              
              <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-4 tracking-tight uppercase leading-none">{role.label}</h3>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm font-medium flex-1 opacity-80 group-hover:opacity-100 transition-opacity">
                {role.desc}
              </p>
            </button>
          ))}
        </div>
        
        <div className="mt-20 text-center animate-in fade-in duration-1000 delay-500">
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.4em]">
              Workspaces are sandboxed for specialized peak performance.
            </p>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;
