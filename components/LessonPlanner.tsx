
import React, { useState, useRef, useEffect } from 'react';
import { LessonPlanConfig, SlideDeck, Quiz, BrainBreak } from '../types';
import { streamLessonPlan, generateSlidesFromLesson, generateQuizFromSource, generateBrainBreak, generateVisualAid, synthesizeSVGSlides } from '../services/geminiService';
import { Send, Loader2, Download, Copy, FileText, ChevronDown, Printer, Wand2, ArrowLeft, Search, Save, Trash2, History, Sparkles, Sliders, GraduationCap, Presentation, Gamepad2, X, ChevronLeft, ChevronRight, Zap, LayoutTemplate, Layers, Link as LinkIcon, FileEdit, Check, Share2, FileType, CheckCircle2, Layout, Filter, FileDown } from 'lucide-react';
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

const SUBJECT_CHIPS = ['All', 'Science', 'Math', 'English', 'History', 'Other'];

const LessonPlanner: React.FC<LessonPlannerProps> = ({ onBack }) => {
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSubjectFilter, setActiveSubjectFilter] = useState('All');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [linkCopied, setLinkCopied] = useState(false);
  
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

  // Handle URL shared data
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sharedData = params.get('plan_data');
    if (sharedData) {
      try {
        const decoded = JSON.parse(decodeURIComponent(escape(atob(sharedData))));
        if (decoded.config && decoded.content) {
          setConfig(decoded.config);
          setContent(decoded.content);
          // Clear URL parameter to prevent re-parsing on refresh if needed
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      } catch (e) {
        console.error("Neural data corruption: Failed to decode shared plan link.");
      }
    }
  }, []);

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

  const loadPlan = (plan: SavedPlan) => {
    setConfig(plan.config);
    setContent(plan.content);
    setExportData(null);
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

  /**
   * HIGH FIDELITY PDF EXPORT FOR QUIZZES
   * Ensures standardized formatting for academic distribution
   */
  const exportQuizPDF = () => {
    if (!exportData || exportData.type !== 'quiz') return;
    const quiz = exportData.data;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>${quiz?.title || "Assessment"} - PDF Assessment</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;700;800&display=swap');
            body { font-family: 'Plus Jakarta Sans', sans-serif; padding: 60px; color: #1e293b; max-width: 800px; margin: 0 auto; line-height: 1.5; }
            .header { border-bottom: 3px solid #6366f1; padding-bottom: 25px; margin-bottom: 40px; display: flex; justify-content: space-between; align-items: flex-end; }
            .header h1 { margin: 0; font-size: 24px; font-weight: 800; text-transform: uppercase; letter-spacing: -0.5px; }
            .badge { background: #6366f1; color: white; padding: 4px 12px; border-radius: 4px; font-size: 10px; font-weight: 800; text-transform: uppercase; margin-bottom: 10px; display: inline-block; }
            .q { margin-bottom: 35px; page-break-inside: avoid; }
            .q-num { background: #1e293b; color: white; width: 28px; height: 28px; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 800; margin-bottom: 12px; }
            .q-text { font-weight: 700; font-size: 15px; color: #0f172a; margin-bottom: 12px; }
            .opt { border: 1.5px solid #e2e8f0; padding: 10px 15px; border-radius: 8px; font-size: 13px; margin-top: 8px; font-weight: 500; }
            .footer { margin-top: 60px; border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center; font-size: 10px; color: #94a3b8; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; }
          </style>
        </head>
        <body>
          <div class="badge">Official Assessment</div>
          <div class="header"><h1>${quiz?.title || "Assessment"}</h1></div>
          <div style="border: 1px solid #e2e8f0; padding: 20px; border-radius: 12px; margin-bottom: 40px; font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase;">
             Student Name: ____________________________________ <span style="float:right">Date: ________________</span>
          </div>
          ${quiz?.questions?.map((q: any, i: number) => `
            <div class="q">
              <div class="q-num">${i + 1}</div>
              <div class="q-text">${q?.question || "Question"}</div>
              <div style="padding-left: 10px;">
                ${q?.options?.map((opt: string) => `<div class="opt">□ ${opt}</div>`).join('') || ""}
              </div>
            </div>
          `).join('') || ""}
          <div class="footer">Synthesized via SVGPT AI Architect Core</div>
          <script>window.onload = () => { window.print(); window.close(); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const exportBrainBreak = async () => {
    if (!content) return;
    setIsExporting('break');
    try {
      const br = await generateBrainBreak(content);
      setExportData({ type: 'break', data: br });
    } catch (e) {
      alert("Brain break synthesis failed.");
    } finally {
      setIsExporting(null);
    }
  };

  const generateShareLink = () => {
    if (!content) return;
    try {
      const data = btoa(unescape(encodeURIComponent(JSON.stringify({ config, content }))));
      const shareUrl = `${window.location.origin}${window.location.pathname}?plan_data=${data}`;
      navigator.clipboard.writeText(shareUrl);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 3000);
    } catch (e) {
      alert("Link generation failed.");
    }
  };

  const exportToDocx = () => {
    if (!content) return;
    const header = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head><meta charset='utf-8'><title>${config.topic}</title><style>body { font-family: 'Arial', sans-serif; line-height: 1.5; }</style></head><body>`;
    const footer = "</body></html>";
    
    const formattedContent = content
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^\* (.*$)/gim, '<li>$1</li>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br/>');

    const sourceHTML = header + formattedContent + footer;
    const blob = new Blob(['\ufeff', sourceHTML], {
      type: 'application/msword'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${config.topic.replace(/\s+/g, '_')}_LessonPlan.doc`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const generateSlideImage = async (index: number) => {
    if (!exportData || exportData.type !== 'slides') return;
    setSlideImages(prev => ({ ...prev, [index]: 'loading' }));
    try {
      const slide = exportData.data.slides[index];
      const url = await generateVisualAid(slide.visualPrompt || slide.title);
      setSlideImages(prev => ({ ...prev, [index]: url }));
    } catch (e) {
      setSlideImages(prev => ({ ...prev, [index]: 'error' }));
    }
  };

  const filteredHistory = savedPlans.filter(p => {
    const matchesSearch = p.config.topic.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.config.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = activeSubjectFilter === 'All' || p.config.subject === activeSubjectFilter;
    return matchesSearch && matchesSubject;
  });

  return (
    <div className="max-w-[1400px] mx-auto h-[calc(100vh-6rem)] flex flex-col animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-500/10 rounded-2xl">
            <LayoutTemplate className="text-indigo-600 dark:text-indigo-400" size={28} />
          </div>
          <div>
            <h2 className="text-3xl font-[900] tracking-tighter uppercase text-slate-800 dark:text-white">Lesson Architect</h2>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">High-Rigor Synthesis Hub</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-black uppercase tracking-widest text-slate-500 hover:text-indigo-600 transition-all shadow-sm"
          >
            <ArrowLeft size={16} /> Exit
          </button>
          <div className="px-5 py-2.5 bg-indigo-500/10 text-indigo-500 rounded-xl border border-indigo-500/20 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
            <Zap size={14} className="animate-pulse" /> Neural Ready
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-8 overflow-hidden pb-10">
        {/* Left Control Panel */}
        <div className="w-full lg:w-[400px] flex flex-col gap-6 overflow-y-auto custom-scrollbar pr-2">
          <div className="bg-white dark:bg-[#0B1221] p-8 rounded-[2.5rem] border border-slate-200 dark:border-white/10 shadow-sm space-y-8">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Inquiry Topic</label>
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={18} />
                <input 
                  type="text" 
                  value={config.topic}
                  onChange={(e) => setConfig({ ...config, topic: e.target.value })}
                  placeholder="e.g. Thermodynamics in Jet Engines"
                  className="w-full pl-12 pr-6 py-4 bg-slate-50 dark:bg-black/20 rounded-2xl border border-slate-200 dark:border-white/10 font-bold text-sm outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Grade</label>
                <select 
                  value={config.gradeLevel} 
                  onChange={(e) => setConfig({ ...config, gradeLevel: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-black/20 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-bold"
                >
                  {['1st Grade', '5th Grade', '8th Grade', 'High School', 'University'].map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Duration</label>
                <select 
                  value={config.duration} 
                  onChange={(e) => setConfig({ ...config, duration: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-black/20 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-bold"
                >
                  {['20 mins', '40 mins', '60 mins', '90 mins'].map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Architectural Template</label>
              <div className="space-y-2">
                {TEMPLATES.map(t => (
                  <button
                    key={t.id}
                    onClick={() => applyTemplate(t.id)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between group ${selectedTemplate === t.id ? 'bg-indigo-500 border-indigo-500 text-white shadow-lg' : 'bg-slate-50 dark:bg-white/5 border-slate-100 dark:border-white/5 hover:border-indigo-300'}`}
                  >
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-tight">{t.name}</h4>
                      <p className={`text-[9px] font-medium opacity-60 ${selectedTemplate === t.id ? 'text-white' : 'text-slate-500'}`}>{t.desc}</p>
                    </div>
                    {selectedTemplate === t.id && <CheckCircle2 size={16} />}
                  </button>
                ))}
              </div>
            </div>

            <button 
              onClick={handleGenerate}
              disabled={loading || !config.topic}
              className="w-full py-5 premium-gradient text-white rounded-[1.8rem] font-black uppercase tracking-[0.2em] text-xs shadow-xl active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <Wand2 size={20} />}
              {loading ? 'Synthesizing...' : 'Architect Plan'}
            </button>
          </div>

          {/* Local Archive */}
          <div className="bg-white/50 dark:bg-white/[0.03] p-8 rounded-[2.5rem] border border-slate-200 dark:border-white/10 flex-1 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <History size={14} /> My Repository
              </h3>
            </div>
            
            <div className="space-y-4 mb-6">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={16} />
                <input 
                  type="text" 
                  placeholder="Search repository..." 
                  value={searchQuery} 
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-10 py-3 bg-slate-50 dark:bg-black/20 border border-slate-100 dark:border-white/5 rounded-xl text-[11px] font-bold text-slate-700 dark:text-slate-200 outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all placeholder:text-slate-300"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-red-500 transition-colors">
                    <X size={14} />
                  </button>
                )}
              </div>
              
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {SUBJECT_CHIPS.map(chip => (
                  <button
                    key={chip}
                    onClick={() => setActiveSubjectFilter(chip)}
                    className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-tight whitespace-nowrap transition-all border ${activeSubjectFilter === chip ? 'premium-gradient text-white border-transparent shadow-lg' : 'bg-white dark:bg-white/5 text-slate-400 border-slate-100 dark:border-white/5 hover:border-indigo-300'}`}
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
              {filteredHistory.map(p => (
                <div key={p?.id || Math.random()} onClick={() => loadPlan(p)} className="p-4 bg-white dark:bg-black/20 rounded-2xl border border-slate-100 dark:border-white/5 hover:border-indigo-500/30 cursor-pointer group transition-all">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-xs font-black text-slate-900 dark:text-white truncate pr-4">{p?.config?.topic || "Untitled"}</h4>
                    <button onClick={(e) => { e.stopPropagation(); setSavedPlans(savedPlans.filter(sp => sp.id !== p.id)); }} className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-300 hover:text-red-500"><Trash2 size={12}/></button>
                  </div>
                  <div className="flex justify-between items-center text-[8px] font-black uppercase text-slate-400">
                    <span>{p?.config?.subject}</span>
                    <span>{p?.date}</span>
                  </div>
                </div>
              ))}
              {filteredHistory.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center opacity-20 text-center py-10">
                  <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-full mb-4">
                    <Filter size={32} className="text-slate-400" />
                  </div>
                  <p className="text-[9px] font-black uppercase tracking-widest leading-relaxed">
                    {searchQuery || activeSubjectFilter !== 'All' 
                      ? 'No archives match your current filter' 
                      : 'Repository is currently vacant'}
                  </p>
                  {(searchQuery || activeSubjectFilter !== 'All') && (
                    <button onClick={() => { setSearchQuery(''); setActiveSubjectFilter('All'); }} className="mt-4 text-[9px] font-black uppercase text-indigo-500 hover:underline">Reset Filters</button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Workspace Display */}
        <div className="flex-1 flex flex-col gap-6 overflow-hidden">
          <div className="bg-white dark:bg-[#0B1221] rounded-[3.5rem] border border-slate-200 dark:border-white/10 shadow-sm flex flex-col flex-1 overflow-hidden relative">
            <div className="px-10 py-6 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-black/20 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-6">
                 <button onClick={() => setExportData(null)} className={`text-[10px] font-black uppercase tracking-widest transition-colors ${!exportData ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400'}`}>Blueprint</button>
                 {exportData && (
                   <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-500 bg-indigo-500/5 px-3 py-1 rounded-full">
                     <Layers size={12} /> {exportData.type.replace('_', ' ')} Module
                   </span>
                 )}
              </div>
              
              <div className="flex items-center gap-2">
                {content && !exportData && (
                  <div className="flex items-center gap-2 mr-4 border-r border-slate-200 dark:border-white/10 pr-4">
                    <button onClick={handleSave} className="p-2.5 text-slate-400 hover:text-indigo-600 transition-all" title="Save to Repository"><Save size={18}/></button>
                    <button onClick={exportToDocx} className="p-2.5 text-slate-400 hover:text-indigo-600 transition-all" title="Export to Word (.doc)"><FileType size={18}/></button>
                    <button onClick={generateShareLink} className={`p-2.5 transition-all ${linkCopied ? 'text-green-500' : 'text-slate-400 hover:text-indigo-600'}`} title="Copy Share Link">
                      {linkCopied ? <Check size={18} /> : <Share2 size={18}/>}
                    </button>
                    <button onClick={() => window.print()} className="p-2.5 text-slate-400 hover:text-indigo-600 transition-all" title="Print"><Printer size={18}/></button>
                  </div>
                )}
                
                {content && !exportData && (
                  <div className="flex items-center gap-1 bg-slate-100 dark:bg-white/5 p-1 rounded-2xl border border-slate-200 dark:border-white/10">
                    <button onClick={exportSlides} disabled={!!isExporting} className="p-2.5 text-slate-500 hover:text-indigo-600 transition-all" title="Synthesize Slides">{isExporting === 'slides' ? <Loader2 size={18} className="animate-spin"/> : <Presentation size={18}/>}</button>
                    <button onClick={exportSVGSlides} disabled={!!isExporting} className="p-2.5 text-slate-500 hover:text-indigo-600 transition-all" title="Synthesize SVG Slides">{isExporting === 'svg_slides' ? <Loader2 size={18} className="animate-spin"/> : <Layout size={18}/>}</button>
                    <button onClick={exportQuiz} disabled={!!isExporting} className="p-2.5 text-slate-500 hover:text-indigo-600 transition-all" title="Synthesize Quiz">{isExporting === 'quiz' ? <Loader2 size={18} className="animate-spin"/> : <GraduationCap size={18}/>}</button>
                    <button onClick={exportBrainBreak} disabled={!!isExporting} className="p-2.5 text-slate-500 hover:text-indigo-600 transition-all" title="Synthesize Brain Break">{isExporting === 'break' ? <Loader2 size={18} className="animate-spin"/> : <Gamepad2 size={18}/>}</button>
                  </div>
                )}
                {exportData && (
                  <button onClick={() => setExportData(null)} className="p-2.5 bg-slate-100 dark:bg-white/5 text-slate-400 hover:text-red-500 rounded-xl transition-all"><X size={18}/></button>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-12 md:p-16 custom-scrollbar prose prose-slate dark:prose-invert max-w-none">
               {loading && !content ? (
                 <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-8">
                    <div className="relative">
                      <Loader2 className="animate-spin text-indigo-500" size={64} strokeWidth={1.5} />
                      <Wand2 className="absolute inset-0 m-auto text-indigo-500/40 animate-pulse" size={24} />
                    </div>
                    <div className="text-center">
                       <p className="text-[10px] font-black uppercase tracking-[0.4em] mb-2">Synthesizing Pedagogical Node</p>
                       <p className="text-[9px] font-bold text-slate-400 max-w-xs uppercase tracking-widest">Mapping Topic: {config.topic}</p>
                    </div>
                 </div>
               ) : exportData ? (
                 <div className="animate-in fade-in zoom-in-95 duration-700">
                    {exportData.type === 'slides' && (
                       <div className="space-y-12">
                          <div className="bg-slate-900 rounded-[3rem] p-12 text-white relative overflow-hidden aspect-video flex flex-col justify-center shadow-3xl">
                             <div className="absolute top-0 right-0 p-8 opacity-20"><Presentation size={180} /></div>
                             <div className="relative z-10">
                                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400 mb-6 block">Module Slide {activeSlideIndex + 1} / {exportData.data?.slides?.length || 0}</span>
                                <h3 className="text-5xl font-[900] tracking-tighter uppercase mb-10 leading-[0.9]">{exportData.data?.slides?.[activeSlideIndex]?.title || "Untitled"}</h3>
                                <ul className="space-y-5">
                                   {exportData.data?.slides?.[activeSlideIndex]?.content?.map((c: string, idx: number) => (
                                     <li key={idx} className="flex items-start gap-4 text-xl font-medium opacity-80">
                                        <div className="w-2 h-2 rounded-full bg-indigo-500 mt-3 flex-shrink-0"></div>
                                        {c}
                                     </li>
                                   ))}
                                </ul>
                             </div>
                             
                             {slideImages[activeSlideIndex] ? (
                               <div className="mt-12 rounded-3xl overflow-hidden border border-white/10 shadow-2xl relative h-64 group">
                                  {slideImages[activeSlideIndex] === 'loading' ? (
                                    <div className="h-full flex items-center justify-center bg-white/5 animate-pulse"><Loader2 size={24} className="animate-spin"/></div>
                                  ) : slideImages[activeSlideIndex] === 'error' ? (
                                    <div className="h-full flex items-center justify-center bg-red-500/10 text-red-400 text-xs">Visual generation offline.</div>
                                  ) : (
                                    <img src={slideImages[activeSlideIndex]} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                                  )}
                               </div>
                             ) : (
                               <button onClick={() => generateSlideImage(activeSlideIndex)} className="mt-12 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest transition-all">
                                  <Sparkles size={14} className="text-indigo-400" /> Synthesize Visual Context
                               </button>
                             )}
                          </div>
                          <div className="flex justify-center gap-4">
                             <button disabled={activeSlideIndex === 0} onClick={() => setActiveSlideIndex(prev => prev - 1)} className="p-4 bg-slate-100 dark:bg-white/5 rounded-2xl text-slate-500 hover:text-indigo-600 disabled:opacity-30"><ChevronLeft size={24}/></button>
                             <div className="flex items-center gap-2 px-8 bg-slate-50 dark:bg-black/20 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400">Node {activeSlideIndex + 1}</div>
                             <button disabled={activeSlideIndex === (exportData.data?.slides?.length || 1) - 1} onClick={() => setActiveSlideIndex(prev => prev + 1)} className="p-4 bg-slate-100 dark:bg-white/5 rounded-2xl text-slate-500 hover:text-indigo-600 disabled:opacity-30"><ChevronRight size={24}/></button>
                          </div>
                       </div>
                    )}
                    {exportData.type === 'svg_slides' && (
                       <div className="space-y-12">
                          <div className="bg-white dark:bg-white p-12 rounded-[3rem] shadow-inner flex items-center justify-center aspect-[4/3] border border-slate-100 animate-in zoom-in-95">
                             <div dangerouslySetInnerHTML={{ __html: exportData.data[activeSlideIndex] }} className="w-full h-full flex items-center justify-center" />
                          </div>
                          <div className="flex justify-center gap-4">
                             <button disabled={activeSlideIndex === 0} onClick={() => setActiveSlideIndex(prev => prev - 1)} className="p-4 bg-slate-100 dark:bg-white/5 rounded-2xl text-slate-500 hover:text-indigo-600 disabled:opacity-30"><ChevronLeft size={24}/></button>
                             <div className="flex items-center gap-2 px-8 bg-slate-50 dark:bg-black/20 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400">Asset {activeSlideIndex + 1}</div>
                             <button disabled={activeSlideIndex === (exportData.data?.length || 1) - 1} onClick={() => setActiveSlideIndex(prev => prev + 1)} className="p-4 bg-slate-100 dark:bg-white/5 rounded-2xl text-slate-500 hover:text-indigo-600 disabled:opacity-30"><ChevronRight size={24}/></button>
                          </div>
                       </div>
                    )}
                    {exportData.type === 'quiz' && (
                       <div className="space-y-10">
                          <div className="flex items-center justify-between">
                            <h3 className="text-3xl font-[900] tracking-tighter uppercase">{exportData.data?.title || "Assessment"}</h3>
                            <div className="flex gap-3">
                               <button onClick={exportQuizPDF} className="px-6 py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2 hover:bg-indigo-700 transition-all">
                                  <FileDown size={16} /> Export to PDF
                               </button>
                               <button onClick={() => window.print()} className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2">
                                  <Printer size={16} /> Print Evaluation
                               </button>
                            </div>
                          </div>
                          <div className="space-y-6">
                             {exportData.data?.questions?.map((q: any, i: number) => (
                               <div key={i} className="p-8 bg-slate-50 dark:bg-black/40 rounded-[2.5rem] border border-slate-100 dark:border-white/5">
                                  <p className="text-lg font-bold mb-6">Q{i+1}: {q?.question || "Question data missing"}</p>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                     {q?.options?.map((o: string, idx: number) => <div key={idx} className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-white/5 text-sm font-medium">□ {o}</div>)}
                                  </div>
                               </div>
                             ))}
                          </div>
                       </div>
                    )}
                    {exportData.type === 'break' && (
                       <div className="max-w-2xl mx-auto p-12 bg-indigo-500 rounded-[4rem] text-white text-center shadow-3xl relative overflow-hidden">
                          <div className="absolute top-0 left-0 p-8 opacity-10"><Gamepad2 size={140} /></div>
                          <h3 className="text-4xl font-[900] tracking-tighter uppercase mb-4">{exportData.data?.activityName || "Activity"}</h3>
                          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-200 mb-10">Neural Recalibration Phase</p>
                          <div className="space-y-4 text-left mb-10">
                             {exportData.data?.instructions?.map((ins: string, idx: number) => <p key={idx} className="text-lg font-medium opacity-90 leading-relaxed">• {ins}</p>)}
                          </div>
                          <div className="p-6 bg-white/10 rounded-3xl border border-white/20 text-xs font-bold italic">Benefit: {exportData.data?.pedagogicalBenefit}</div>
                       </div>
                    )}
                 </div>
               ) : content ? (
                 <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
                    <ReactMarkdown>{content}</ReactMarkdown>
                 </div>
               ) : (
                 <div className="h-full flex flex-col items-center justify-center opacity-10">
                    <FileText size={120} strokeWidth={1} />
                    <p className="text-[12px] font-black uppercase tracking-[0.6em] mt-10">Awaiting Architectural Input</p>
                 </div>
               )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonPlanner;
