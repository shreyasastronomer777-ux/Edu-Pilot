
import React, { useState, useRef, useEffect } from 'react';
import { LessonPlanConfig, SlideDeck, Quiz, BrainBreak } from '../types';
import { streamLessonPlan, generateSlidesFromLesson, generateQuizFromSource, generateBrainBreak, generateVisualAid, synthesizeSVGSlides } from '../services/geminiService';
import { Send, Loader2, Download, Copy, FileText, ChevronDown, Printer, Wand2, ArrowLeft, Search, Save, Trash2, History, Sparkles, Sliders, GraduationCap, Presentation, Gamepad2, X, ChevronLeft, ChevronRight, Zap, LayoutTemplate, Layers } from 'lucide-react';
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

const TEMPLATES = [
  { 
    id: 'inquiry', 
    name: 'Inquiry-Based', 
    focus: 'Student Discovery & Questioning', 
    desc: 'Focuses on investigation and problem-solving.' 
  },
  { 
    id: 'lecture', 
    name: 'Lecture-Style', 
    focus: 'Teacher-Led Direct Instruction', 
    desc: 'Structured knowledge transfer and note-taking.' 
  },
  { 
    id: 'flipped', 
    name: 'Flipped Classroom', 
    focus: 'Active Application & Group Work', 
    desc: 'Pre-class study followed by in-depth practice.' 
  },
  { 
    id: 'socratic', 
    name: 'Socratic Seminar', 
    focus: 'Critical Dialogue & Debate', 
    desc: 'Discussion-based exploration of complex texts.' 
  },
  { 
    id: 'project', 
    name: 'Project-Based', 
    focus: 'Real-world Application & Creation', 
    desc: 'Learning through the design of a tangible output.' 
  }
];

const LessonPlanner: React.FC<LessonPlannerProps> = ({ onBack }) => {
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  
  // Multi-modal state
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const [exportData, setExportData] = useState<{ type: 'slides' | 'quiz' | 'break' | 'svg_slides', data: any } | null>(null);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [slideImages, setSlideImages] = useState<Record<number, string>>({});

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

  const applyTemplate = (templateId: string) => {
    const template = TEMPLATES.find(t => t.id === templateId);
    if (template) {
      setConfig(prev => ({
        ...prev,
        focus: template.focus
      }));
      setSelectedTemplate(templateId);
    }
  };

  const handleGenerate = async () => {
    if (!config.topic) return;
    setLoading(true);
    setContent('');
    setExportData(null);
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
    setExportData(null);
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

  const exportSlides = async () => {
    if (!content) return;
    setIsExporting('slides');
    try {
      const deck = await generateSlidesFromLesson(content);
      setExportData({ type: 'slides', data: deck });
      setActiveSlideIndex(0);
      setSlideImages({});
    } catch (e) {
      alert("Slide synthesis failed.");
    } finally {
      setIsExporting(null);
    }
  };

  const exportSVGSlides = async () => {
    if (!content) return;
    setIsExporting('svg_slides');
    try {
      const svgs = await synthesizeSVGSlides(content);
      setExportData({ type: 'svg_slides', data: svgs });
      setActiveSlideIndex(0);
    } catch (e) {
      alert("SVG Slide synthesis failed.");
    } finally {
      setIsExporting(null);
    }
  };

  const exportQuiz = async () => {
    if (!content) return;
    setIsExporting('quiz');
    try {
      const quiz = await generateQuizFromSource({ type: 'text', data: content }, 10);
      setExportData({ type: 'quiz', data: quiz });
    } catch (e) {
      alert("Quiz synthesis failed.");
    } finally {
      setIsExporting(null);
    }
  };

  const exportBrainBreak = async () => {
    if (!content) return;
    setIsExporting('break');
    try {
      const activity = await generateBrainBreak(content);
      setExportData({ type: 'break', data: activity });
    } catch (e) {
      alert("Brain break synthesis failed.");
    } finally {
      setIsExporting(null);
    }
  };

  const generateSlideImage = async (index: number, prompt: string) => {
    if (slideImages[index]) return;
    try {
      const img = await generateVisualAid(prompt);
      setSlideImages(prev => ({ ...prev, [index]: img }));
    } catch (e) {
      console.error("Slide image failed");
    }
  };

  useEffect(() => {
    if (exportData?.type === 'slides' && exportData.data.slides[activeSlideIndex]) {
      generateSlideImage(activeSlideIndex, exportData.data.slides[activeSlideIndex].visualPrompt);
    }
  }, [activeSlideIndex, exportData]);

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
        {/* Left Sidebar: Controls & History */}
        <div className="w-80 flex flex-col gap-4 overflow-y-auto pr-1">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm transition-colors">
            <h2 className="text-lg font-black text-slate-800 dark:text-white mb-6 uppercase tracking-tight flex items-center gap-2">
              <Sliders size={18} className="text-indigo-500" /> Plan Architect
            </h2>
            
            <div className="space-y-5">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Pedagogical Template</label>
                <div className="relative">
                  <LayoutTemplate className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-500/50" size={16} />
                  <select 
                    value={selectedTemplate}
                    onChange={(e) => applyTemplate(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-indigo-50/30 dark:bg-indigo-900/10 text-slate-900 dark:text-white font-bold text-xs outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="">Manual Synthesis</option>
                    {TEMPLATES.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
              </div>

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

        {/* Main Output Area */}
        <div className="flex-1 flex flex-col gap-6 overflow-hidden">
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

           {/* Multi-modal Export Bar */}
           {content && (
             <div className="p-6 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-lg flex flex-col md:flex-row items-center justify-between gap-6 animate-in slide-in-from-bottom-4">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600">
                      <Zap size={20} />
                   </div>
                   <div>
                      <h4 className="text-sm font-black uppercase tracking-tight text-slate-900 dark:text-white">Multi-Modal Export</h4>
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Synthesize secondary instructional assets with one tap</p>
                   </div>
                </div>

                <div className="flex items-center gap-3">
                   <button 
                     onClick={exportSlides}
                     disabled={!!isExporting}
                     className="px-5 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-xl disabled:opacity-50"
                   >
                     {isExporting === 'slides' ? <Loader2 className="animate-spin" size={14} /> : <Presentation size={14} />}
                     Interactive Slides
                   </button>
                   <button 
                     onClick={exportSVGSlides}
                     disabled={!!isExporting}
                     className="px-5 py-3 bg-indigo-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-xl disabled:opacity-50"
                   >
                     {isExporting === 'svg_slides' ? <Loader2 className="animate-spin" size={14} /> : <Layers size={14} />}
                     Architectural (SVG) Slides
                   </button>
                   <button 
                     onClick={exportQuiz}
                     disabled={!!isExporting}
                     className="px-5 py-3 bg-white dark:bg-slate-700 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-600 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-sm disabled:opacity-50"
                   >
                     {isExporting === 'quiz' ? <Loader2 className="animate-spin" size={14} /> : <GraduationCap size={14} />}
                     10-Question Quiz
                   </button>
                   <button 
                     onClick={exportBrainBreak}
                     disabled={!!isExporting}
                     className="px-5 py-3 bg-white dark:bg-slate-700 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-600 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-sm disabled:opacity-50"
                   >
                     {isExporting === 'break' ? <Loader2 className="animate-spin" size={14} /> : <Gamepad2 size={14} />}
                     Brain Break
                   </button>
                </div>
             </div>
           )}
        </div>
      </div>

      {/* Export Preview Modal */}
      {exportData && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xl flex items-center justify-center p-4 md:p-10 animate-in fade-in duration-500">
           <div className="bg-white dark:bg-slate-900 w-full max-w-5xl h-full max-h-[85vh] rounded-[3rem] shadow-2xl border border-white/10 flex flex-col overflow-hidden">
              <div className="p-8 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600">
                       {exportData.type === 'slides' && <Presentation size={20} />}
                       {exportData.type === 'svg_slides' && <Layers size={20} />}
                       {exportData.type === 'quiz' && <GraduationCap size={20} />}
                       {exportData.type === 'break' && <Gamepad2 size={20} />}
                    </div>
                    <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white">
                       {exportData.type === 'slides' ? 'Interactive Slide Deck' : exportData.type === 'svg_slides' ? 'Architectural SVG Decks' : exportData.type === 'quiz' ? 'Evaluation Module' : 'Activity Script'}
                    </h3>
                 </div>
                 <button onClick={() => setExportData(null)} className="p-3 bg-slate-100 dark:bg-white/5 rounded-2xl text-slate-400 hover:text-red-500 transition-all">
                    <X size={20} />
                 </button>
              </div>

              <div className="flex-1 overflow-y-auto p-10 bg-slate-50/50 dark:bg-black/20 flex flex-col items-center">
                 {exportData.type === 'slides' && (
                    <div className="w-full max-w-4xl flex flex-col gap-8 h-full">
                       <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-2xl aspect-[16/9] flex overflow-hidden border border-slate-200 dark:border-slate-700 transition-all relative">
                          <div className="flex-1 p-12 flex flex-col justify-center">
                             <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500 mb-4">Slide {activeSlideIndex + 1} / {exportData.data.slides.length}</span>
                             <h4 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white mb-6 uppercase">{exportData.data.slides[activeSlideIndex].title}</h4>
                             <ul className="space-y-4">
                                {exportData.data.slides[activeSlideIndex].content.map((bullet: string, i: number) => (
                                   <li key={i} className="flex items-start gap-3 text-lg font-medium text-slate-600 dark:text-slate-300">
                                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2.5 flex-shrink-0"></div>
                                      {bullet}
                                   </li>
                                ))}
                             </ul>
                          </div>
                          <div className="w-2/5 bg-slate-50 dark:bg-black/40 flex items-center justify-center p-2">
                             {slideImages[activeSlideIndex] ? (
                                <img src={slideImages[activeSlideIndex]} className="w-full h-full object-cover rounded-2xl shadow-lg animate-in zoom-in-95" />
                             ) : (
                                <div className="flex flex-col items-center gap-3 opacity-30">
                                   <Loader2 className="animate-spin" size={32} />
                                   <span className="text-[10px] font-black uppercase tracking-widest text-center">Synthesizing<br/>Visual Asset</span>
                                </div>
                             )}
                          </div>
                       </div>

                       <div className="flex items-center justify-center gap-6">
                          <button 
                            disabled={activeSlideIndex === 0}
                            onClick={() => setActiveSlideIndex(prev => prev - 1)}
                            className="p-4 bg-white dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 text-slate-500 disabled:opacity-30 hover:scale-110 transition-all shadow-md"
                          >
                             <ChevronLeft size={24} />
                          </button>
                          <div className="flex gap-2">
                             {exportData.data.slides.map((_: any, i: number) => (
                                <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${activeSlideIndex === i ? 'w-8 bg-indigo-500' : 'w-2 bg-slate-300 dark:bg-slate-700'}`}></div>
                             ))}
                          </div>
                          <button 
                            disabled={activeSlideIndex === exportData.data.slides.length - 1}
                            onClick={() => setActiveSlideIndex(prev => prev + 1)}
                            className="p-4 bg-white dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 text-slate-500 disabled:opacity-30 hover:scale-110 transition-all shadow-md"
                          >
                             <ChevronRight size={24} />
                          </button>
                       </div>
                    </div>
                 )}

                 {exportData.type === 'svg_slides' && (
                    <div className="w-full max-w-4xl flex flex-col gap-8 h-full">
                       <div className="bg-white rounded-[2.5rem] shadow-2xl aspect-[16/9] flex items-center justify-center overflow-hidden border border-slate-200 transition-all relative p-12">
                          <div dangerouslySetInnerHTML={{ __html: exportData.data[activeSlideIndex] }} className="w-full h-full flex items-center justify-center" />
                          <div className="absolute top-8 left-8 flex gap-1.5">
                             <div className="w-2.5 h-2.5 rounded-full bg-red-500/50"></div>
                             <div className="w-2.5 h-2.5 rounded-full bg-amber-500/50"></div>
                             <div className="w-2.5 h-2.5 rounded-full bg-green-500/50"></div>
                          </div>
                          <span className="absolute bottom-8 right-8 text-[10px] font-black uppercase text-indigo-500 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100 shadow-sm">Slide {activeSlideIndex + 1} / {exportData.data.length}</span>
                       </div>

                       <div className="flex items-center justify-center gap-6">
                          <button 
                            disabled={activeSlideIndex === 0}
                            onClick={() => setActiveSlideIndex(prev => prev - 1)}
                            className="p-4 bg-white dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 text-slate-500 disabled:opacity-30 hover:scale-110 transition-all shadow-md"
                          >
                             <ChevronLeft size={24} />
                          </button>
                          <div className="flex gap-2">
                             {exportData.data.map((_: any, i: number) => (
                                <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${activeSlideIndex === i ? 'w-8 bg-indigo-500' : 'w-2 bg-slate-300 dark:bg-slate-700'}`}></div>
                             ))}
                          </div>
                          <button 
                            disabled={activeSlideIndex === exportData.data.length - 1}
                            onClick={() => setActiveSlideIndex(prev => prev + 1)}
                            className="p-4 bg-white dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 text-slate-500 disabled:opacity-30 hover:scale-110 transition-all shadow-md"
                          >
                             <ChevronRight size={24} />
                          </button>
                       </div>
                    </div>
                 )}

                 {exportData.type === 'quiz' && (
                    <div className="w-full max-w-3xl space-y-6">
                       <h4 className="text-2xl font-black text-center text-slate-900 dark:text-white mb-10 tracking-tighter uppercase">{exportData.data.title}</h4>
                       {exportData.data.questions.map((q: any, i: number) => (
                          <div key={i} className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-700 shadow-sm animate-in slide-in-from-bottom-4" style={{ animationDelay: `${i * 0.1}s` }}>
                             <p className="font-bold text-slate-900 dark:text-white mb-6 flex items-start gap-4">
                                <span className="w-8 h-8 rounded-lg bg-indigo-500 text-white flex items-center justify-center text-xs flex-shrink-0">Q{i+1}</span>
                                {q.question}
                             </p>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-12">
                                {q.options.map((opt: string, oi: number) => (
                                   <div key={oi} className={`p-4 rounded-xl border text-sm font-bold ${opt === q.correctAnswer ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300' : 'bg-slate-50 dark:bg-black/20 border-slate-100 dark:border-white/5 text-slate-500'}`}>
                                      {opt}
                                   </div>
                                ))}
                             </div>
                          </div>
                       ))}
                    </div>
                 )}

                 {exportData.type === 'break' && (
                    <div className="w-full max-w-2xl bg-white dark:bg-slate-800 p-12 rounded-[3.5rem] border border-slate-200 dark:border-slate-700 shadow-2xl animate-in zoom-in-95">
                       <div className="flex flex-col items-center text-center mb-10">
                          <div className="w-20 h-20 bg-emerald-500/10 rounded-3xl flex items-center justify-center text-emerald-600 mb-6">
                             <Gamepad2 size={40} />
                          </div>
                          <h4 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white uppercase mb-2">{exportData.data.activityName}</h4>
                          <span className="px-4 py-1.5 bg-slate-100 dark:bg-slate-900 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-400 border border-slate-200 dark:border-white/10">Estimated Duration: {exportData.data.duration}</span>
                       </div>

                       <div className="space-y-8">
                          <div>
                             <h5 className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-4">Neural Instructions</h5>
                             <div className="space-y-4">
                                {exportData.data.instructions.map((step: string, i: number) => (
                                   <div key={i} className="flex items-start gap-4 p-5 bg-slate-50 dark:bg-black/20 rounded-2xl border border-slate-100 dark:border-white/5">
                                      <span className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-black flex-shrink-0">{i + 1}</span>
                                      <p className="text-sm font-bold text-slate-700 dark:text-slate-200 leading-relaxed">{step}</p>
                                   </div>
                                ))}
                             </div>
                          </div>
                          
                          <div className="p-6 bg-indigo-500/5 rounded-3xl border border-indigo-500/10">
                             <h5 className="text-[10px] font-black uppercase tracking-widest text-indigo-500 mb-2">Pedagogical Benefit</h5>
                             <p className="text-xs font-bold text-slate-500 dark:text-slate-400 italic">"{exportData.data.pedagogicalBenefit}"</p>
                          </div>
                       </div>
                    </div>
                 )}
              </div>

              <div className="p-8 border-t border-slate-100 dark:border-white/5 bg-white dark:bg-slate-900 flex justify-center gap-4">
                 <button 
                   onClick={() => window.print()}
                   className="px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl flex items-center gap-3 hover:scale-105 active:scale-95 transition-all"
                 >
                    <Printer size={18} /> Print Asset
                 </button>
                 <button 
                   onClick={() => setExportData(null)}
                   className="px-8 py-4 bg-white dark:bg-slate-800 text-slate-500 rounded-2xl font-black uppercase tracking-widest text-xs border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
                 >
                    Close Workspace
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default LessonPlanner;
