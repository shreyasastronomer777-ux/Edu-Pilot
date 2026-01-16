
import React, { useState, useRef, useEffect } from 'react';
import { LessonPlanConfig } from '../types';
import { streamLessonPlan } from '../services/geminiService';
import { Send, Loader2, Download, Copy, FileText, ChevronDown, Printer, Wand2, ArrowLeft, Search, Save, Trash2, History, Sparkles, Sliders, GraduationCap } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface SavedPlan {
  id: string;
  config: LessonPlanConfig;
  content: string;
  date: string;
}

interface LessonPlannerProps {
  onBack?: () => void;
}

const LessonPlanner: React.FC<LessonPlannerProps> = ({ onBack }) => {
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState('');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const exportMenuRef = useRef<HTMLDivElement>(null);

  const [config, setConfig] = useState<LessonPlanConfig>({
    topic: '',
    gradeLevel: '5th Grade',
    subject: 'Science',
    duration: '40 mins',
    focus: 'Interactive Learning',
    standard: 'Common Core',
    proficiencyLevel: 'Mid-Level'
  });

  const [savedPlans, setSavedPlans] = useState<SavedPlan[]>(() => {
    const saved = localStorage.getItem('svgpt_lesson_plans');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('svgpt_lesson_plans', JSON.stringify(savedPlans));
  }, [savedPlans]);

  const handleGenerate = async () => {
    if (!config.topic) return;
    setLoading(true);
    setContent('');
    try {
      await streamLessonPlan(config, (chunk) => {
        setContent(prev => prev + chunk);
      });
    } catch (err) {
      console.error(err);
      setContent("**Error generating plan.** Please check your connection or try again.");
    } finally {
      setLoading(false);
    }
  };

  const loadPlan = (plan: SavedPlan) => {
    setConfig(plan.config);
    setContent(plan.content);
  };

  const handleSave = () => {
    if (!content || !config.topic) return;
    const newPlan: SavedPlan = {
      id: Date.now().toString(),
      config: { ...config },
      content,
      date: new Date().toLocaleDateString()
    };
    setSavedPlans([newPlan, ...savedPlans]);
    alert("Architectural asset archived.");
  };

  const filteredPlans = savedPlans.filter(p => 
    p.config.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.config.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-4rem)] flex flex-col">
      <div className="mb-6 flex items-center justify-between">
         <button onClick={onBack} className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors group">
           <div className="p-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 group-hover:border-indigo-200">
              <ArrowLeft size={16} />
           </div>
           Back to Dashboard
         </button>
         <div className="relative group w-full max-w-xs">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
           <input 
             type="text" 
             placeholder="Search Plan Archive..."
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
             className="w-full pl-11 pr-4 py-2.5 bg-white/50 dark:bg-white/5 backdrop-blur-3xl border border-slate-200 dark:border-white/10 rounded-2xl outline-none font-bold text-xs"
           />
         </div>
      </div>

      <div className="flex gap-6 flex-1 overflow-hidden">
        <div className="w-80 flex flex-col gap-4 overflow-y-auto pr-1">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm transition-colors">
            <h2 className="text-lg font-black text-slate-800 dark:text-white mb-6 uppercase tracking-tight flex items-center gap-2">
              <Sliders size={18} className="text-indigo-500" /> Plan Architect
            </h2>
            
            <div className="space-y-5">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Primary Topic</label>
                <input 
                  type="text" 
                  value={config.topic}
                  onChange={(e) => setConfig({...config, topic: e.target.value})}
                  placeholder="e.g. Plate Tectonics"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none font-bold text-sm"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Curriculum Standard</label>
                <select 
                  value={config.standard}
                  onChange={(e) => setConfig({...config, standard: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold text-sm"
                >
                  <option>Common Core</option>
                  <option>IB Curriculum</option>
                  <option>Next Gen Science (NGSS)</option>
                  <option>TEKS (Texas)</option>
                  <option>General Excellence</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Proficiency Level</label>
                <select 
                  value={config.proficiencyLevel}
                  onChange={(e) => setConfig({...config, proficiencyLevel: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold text-sm"
                >
                  <option>Beginner (Foundational)</option>
                  <option>Mid-Level (Intermediate)</option>
                  <option>Advanced (College Ready)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                 <div>
                   <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Grade</label>
                   <input 
                    type="text" 
                    value={config.gradeLevel}
                    onChange={(e) => setConfig({...config, gradeLevel: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold text-xs"
                   />
                 </div>
                 <div>
                   <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Duration</label>
                   <input 
                    type="text" 
                    value={config.duration}
                    onChange={(e) => setConfig({...config, duration: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold text-xs"
                   />
                 </div>
              </div>

              <button 
                onClick={handleGenerate}
                disabled={loading || !config.topic}
                className={`w-full py-4 rounded-xl flex items-center justify-center gap-3 font-black uppercase tracking-widest text-xs text-white transition-all ${loading || !config.topic ? 'bg-slate-400 opacity-50' : 'premium-gradient shadow-lg'}`}
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : <Wand2 size={18} />}
                Synthesize Plan
              </button>
            </div>
          </div>

          <div className="flex-1 flex flex-col min-h-0">
             <div className="flex items-center gap-2 mb-4 px-2">
                <History size={14} className="text-indigo-500" />
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Saved Archive</h3>
             </div>
             <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                {filteredPlans.map(plan => (
                  <div key={plan.id} onClick={() => loadPlan(plan)} className="p-4 bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-indigo-500/50 cursor-pointer transition-all">
                     <p className="text-xs font-black text-slate-900 dark:text-white truncate mb-1">{plan.config.topic}</p>
                     <div className="flex justify-between text-[8px] font-bold text-slate-400 uppercase">
                        <span>{plan.config.standard}</span>
                        <span>{plan.date}</span>
                     </div>
                  </div>
                ))}
             </div>
          </div>
        </div>

        <div className="flex-1 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-slate-50/50 dark:bg-black/20">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
               <FileText size={14} className="text-indigo-500" /> Standard-Aligned Output
            </h3>
            <div className="flex gap-2">
              <button onClick={handleSave} disabled={!content || loading} className="p-2 text-slate-500 hover:text-indigo-600"><Save size={18} /></button>
              <button onClick={() => { navigator.clipboard.writeText(content); alert("Copied."); }} disabled={!content} className="p-2 text-slate-500 hover:text-indigo-600"><Copy size={18} /></button>
            </div>
          </div>
          <div className="flex-1 p-10 overflow-y-auto custom-scrollbar prose prose-slate dark:prose-invert max-w-none">
            {content ? <ReactMarkdown>{content}</ReactMarkdown> : <div className="h-full flex flex-col items-center justify-center opacity-40"><GraduationCap size={64} /><p className="text-xs font-black uppercase mt-4">Awaiting Architect Blueprint</p></div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonPlanner;
