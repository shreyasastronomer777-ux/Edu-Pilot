import React, { useState } from 'react';
import { Presentation, Loader2, Sparkles, Wand2, ArrowLeft, Download, Copy, Layout, ChevronRight, ChevronLeft, Check, Terminal, Code, Cpu, Zap, GraduationCap, Image as ImageIcon, MessageSquare } from 'lucide-react';
import { synthesizePPTProject } from '../services/geminiService';
import { PPTProject } from '../types';

const PPTGenerator: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const [topic, setTopic] = useState('');
  const [grade, setGrade] = useState('8th Grade');
  const [slideCount, setSlideCount] = useState(8);
  const [loading, setLoading] = useState(false);
  const [project, setProject] = useState<PPTProject | null>(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const [activeTab, setActiveTab] = useState<'outline' | 'vba'>('outline');
  const [copied, setCopied] = useState(false);

  const handleSynthesize = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setProject(null);
    try {
      const result = await synthesizePPTProject(topic, grade, slideCount);
      setProject(result);
      setActiveSlide(0);
    } catch (e) {
      alert("Neural presentation architecture failed. Check your data link.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-8 pb-20 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <button onClick={onBack} className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors group">
          <div className="p-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 group-hover:border-indigo-200 shadow-sm">
            <ArrowLeft size={16} />
          </div>
          Back to Dashboard
        </button>
        <div className="flex items-center gap-3 px-6 py-2 bg-indigo-500/10 rounded-full border border-indigo-500/20">
          <Presentation className="text-indigo-600 dark:text-indigo-400" size={16} />
          <span className="text-[10px] font-black uppercase tracking-widest text-indigo-700 dark:text-indigo-500">
            PPT ARCHITECT v4.0 (VBA-ENABLED)
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Control Panel */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white dark:bg-[#0B1221] p-10 rounded-[3.5rem] border border-slate-200 dark:border-white/10 shadow-3xl flex flex-col gap-8">
            <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-500">
              <Layout size={32} />
            </div>
            <h2 className="text-3xl font-[900] tracking-tighter uppercase text-slate-900 dark:text-white leading-none">PPT Studio</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">Lesson Topic</label>
                <input 
                  type="text" 
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Plate Tectonics & Seismic Activity"
                  className="w-full px-6 py-5 rounded-2xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 outline-none focus:ring-8 focus:ring-indigo-500/5 transition-all font-bold text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">Target Grade</label>
                  <select 
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="w-full px-4 py-4 rounded-xl bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 text-xs font-bold"
                  >
                    {['Elementary', 'Middle School', 'High School', 'University'].map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">Slide Count</label>
                  <input 
                    type="number" 
                    min="1" max="25"
                    value={slideCount}
                    onChange={(e) => setSlideCount(Number(e.target.value))}
                    className="w-full px-4 py-4 rounded-xl bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 text-xs font-bold text-center"
                  />
                </div>
              </div>

              <button 
                onClick={handleSynthesize}
                disabled={loading || !topic.trim()}
                className="w-full py-6 premium-gradient text-white rounded-[2.5rem] font-black uppercase tracking-widest text-sm flex items-center justify-center gap-4 shadow-2xl active:scale-95 disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" size={24} /> : <Wand2 size={24} />}
                Synthesize PPT Project
              </button>
            </div>
          </div>
        </div>

        {/* Workspace */}
        <div className="lg:col-span-8">
          <div className="bg-white dark:bg-[#0B1221] min-h-[700px] rounded-[4rem] border border-slate-200 dark:border-white/10 shadow-sm flex flex-col overflow-hidden relative">
            <div className="p-8 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-black/20 flex flex-wrap items-center justify-between gap-6 px-12">
              <div className="flex items-center gap-8">
                <button 
                  onClick={() => setActiveTab('outline')}
                  className={`text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'outline' ? 'text-indigo-600 border-b-2 border-indigo-600 pb-1' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  Pedagogical Outline
                </button>
                <button 
                  onClick={() => setActiveTab('vba')}
                  className={`text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'vba' ? 'text-indigo-600 border-b-2 border-indigo-600 pb-1' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  VBA Automation Script
                </button>
              </div>
              
              {project && (
                <div className="flex gap-2">
                  <button 
                    onClick={() => copyToClipboard(activeTab === 'outline' ? JSON.stringify(project.outline, null, 2) : project.vbaScript)}
                    className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-white/10 text-slate-500 hover:text-indigo-600 transition-all shadow-sm flex items-center gap-2"
                  >
                    {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                    <span className="text-[9px] font-black uppercase tracking-widest">{copied ? 'Copied' : 'Copy All'}</span>
                  </button>
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-12 md:p-16">
              {loading ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-10">
                  <div className="relative">
                    <Loader2 size={120} className="animate-spin text-indigo-500/10" strokeWidth={1} />
                    <Cpu size={48} className="absolute inset-0 m-auto text-indigo-500 animate-pulse" />
                  </div>
                  <div className="text-center space-y-3">
                    <h4 className="text-xl font-black tracking-[0.4em] uppercase text-indigo-500">Architecting Slides</h4>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Mapping Content Nodes & Visual Trajectories</p>
                  </div>
                </div>
              ) : project ? (
                activeTab === 'outline' ? (
                  <div className="animate-in fade-in duration-700 space-y-12">
                    <div className="flex items-center justify-between">
                       <h3 className="text-4xl font-[900] tracking-tighter uppercase leading-none">{project.outline.title}</h3>
                       <div className="flex gap-2">
                          <button 
                            disabled={activeSlide === 0}
                            onClick={() => setActiveSlide(prev => prev - 1)}
                            className="p-3 bg-slate-100 dark:bg-white/5 rounded-xl text-slate-400 hover:text-indigo-600 disabled:opacity-20 transition-all"
                          >
                             <ChevronLeft size={20} />
                          </button>
                          <div className="px-6 py-3 bg-indigo-500/5 text-indigo-500 rounded-xl text-[10px] font-black flex items-center">{activeSlide + 1} / {project.outline.slides.length}</div>
                          <button 
                            disabled={activeSlide === project.outline.slides.length - 1}
                            onClick={() => setActiveSlide(prev => prev + 1)}
                            className="p-3 bg-slate-100 dark:bg-white/5 rounded-xl text-slate-400 hover:text-indigo-600 disabled:opacity-20 transition-all"
                          >
                             <ChevronRight size={20} />
                          </button>
                       </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                       <div className="bg-slate-900 rounded-[3rem] p-12 text-white shadow-3xl relative overflow-hidden aspect-[4/3] flex flex-col justify-center">
                          <div className="absolute top-0 right-0 p-8 opacity-10"><Presentation size={180} /></div>
                          <div className="relative z-10">
                             <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 mb-6 block">Structural Slide {activeSlide + 1}</span>
                             <h4 className="text-3xl md:text-4xl font-black tracking-tighter uppercase mb-10 leading-[1.1]">{project.outline.slides[activeSlide].title}</h4>
                             <ul className="space-y-4">
                                {project.outline.slides[activeSlide].content.map((bullet, idx) => (
                                   <li key={idx} className="flex items-start gap-4 text-lg font-medium opacity-80 leading-snug">
                                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2.5 flex-shrink-0"></div>
                                      {bullet}
                                   </li>
                                ))}
                             </ul>
                          </div>
                       </div>

                       <div className="space-y-6">
                          <div className="p-8 bg-indigo-500/5 border border-indigo-500/10 rounded-[2.5rem]">
                             <h5 className="text-[10px] font-black uppercase tracking-widest text-indigo-500 mb-4 flex items-center gap-2">
                                <ImageIcon size={14} /> Visual Directive
                             </h5>
                             <p className="text-sm font-bold text-slate-600 dark:text-slate-400 leading-relaxed italic">
                                "{project.outline.slides[activeSlide].visualPrompt}"
                             </p>
                          </div>
                          <div className="p-8 bg-emerald-500/5 border border-emerald-500/10 rounded-[2.5rem]">
                             <h5 className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-4 flex items-center gap-2">
                                <MessageSquare size={14} /> Check for Understanding
                             </h5>
                             <p className="text-sm font-black text-slate-800 dark:text-slate-200 leading-relaxed">
                                {project.outline.slides[activeSlide].check || "Drafting pedagogical query..."}
                             </p>
                          </div>
                       </div>
                    </div>
                  </div>
                ) : (
                  <div className="animate-in fade-in duration-700 h-full flex flex-col">
                    <div className="mb-8 flex items-center justify-between">
                       <div>
                          <h3 className="text-2xl font-black uppercase tracking-tighter">Automated PowerPoint Generation</h3>
                          <p className="text-xs text-slate-400 font-bold mt-1">Copy the VBA script below and run it in PowerPoint (Alt+F11) to auto-build your deck.</p>
                       </div>
                       <button 
                         onClick={() => copyToClipboard(project.vbaScript)}
                         className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl hover:bg-indigo-700 transition-all flex items-center gap-2"
                       >
                          <Terminal size={16} /> Copy VBA Logic
                       </button>
                    </div>
                    <div className="flex-1 bg-slate-900 rounded-[2.5rem] p-10 font-mono text-sm text-indigo-300 overflow-x-auto border border-white/5 shadow-inner">
                       <pre className="whitespace-pre-wrap">{project.vbaScript}</pre>
                    </div>
                    <div className="mt-8 p-6 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-3xl flex items-start gap-4">
                       <div className="p-2 bg-indigo-500/10 text-indigo-500 rounded-lg flex-shrink-0">
                          <Zap size={18} />
                       </div>
                       <div className="text-xs font-bold text-slate-500 leading-relaxed">
                          <strong>How to use:</strong> Open PowerPoint → Alt + F11 → Insert Module → Paste Script → F5 to Run. 
                          <br/>Your slides will be synthesized instantly based on the neural outline.
                       </div>
                    </div>
                  </div>
                )
              ) : (
                <div className="h-full flex flex-col items-center justify-center opacity-10 py-10">
                  <Presentation size={160} strokeWidth={0.5} />
                  <p className="text-2xl font-black uppercase mt-10 tracking-[0.5em] text-center">Architect Awaiting Orders</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PPTGenerator;