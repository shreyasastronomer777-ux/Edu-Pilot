import React, { useState, useRef, useEffect } from 'react';
import { FileUp, Link as LinkIcon, Loader2, Sparkles, Wand2, ArrowLeft, Presentation, FileText, Layout, CheckCircle2, Download, Copy, X, BrainCircuit, Globe, Zap, Upload, History, Trash2 } from 'lucide-react';
import { synthesizeInstantLessonAssets } from '../services/geminiService';
import { SlideDeck } from '../types';
import ReactMarkdown from 'react-markdown';

interface InstantLessonGeneratorProps {
  onBack?: () => void;
}

interface SynthesisResult {
  id: string;
  title: string;
  plan: string;
  slides: SlideDeck;
  summary: string;
  date: string;
}

const InstantLessonGenerator: React.FC<InstantLessonGeneratorProps> = ({ onBack }) => {
  const [sourceType, setSourceType] = useState<'file' | 'url'>('file');
  const [url, setUrl] = useState('');
  const [fileData, setFileData] = useState<{ data: string, type: string, name: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SynthesisResult | null>(null);
  const [activeResultTab, setActiveResultTab] = useState<'plan' | 'slides' | 'summary'>('plan');
  const [history, setHistory] = useState<SynthesisResult[]>(() => {
    const saved = localStorage.getItem('svgpt_synthesis_history');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('svgpt_synthesis_history', JSON.stringify(history));
  }, [history]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFileData({ data: event.target?.result as string, type: file.type, name: file.name });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSynthesize = async () => {
    if ((sourceType === 'url' && !url) || (sourceType === 'file' && !fileData)) return;
    setLoading(true);
    setResults(null);
    try {
      const output = await synthesizeInstantLessonAssets({
        type: sourceType,
        data: sourceType === 'file' ? fileData!.data : url,
        mimeType: sourceType === 'file' ? fileData!.type : undefined
      });
      const finalResult: SynthesisResult = {
        ...output,
        id: Date.now().toString(),
        title: sourceType === 'file' ? fileData!.name : (url.length > 30 ? url.substring(0,30) + '...' : url),
        date: new Date().toLocaleString()
      };
      setResults(finalResult);
      setHistory([finalResult, ...history]);
      setActiveResultTab('plan');
    } catch (error) {
      alert("Neural synthesis failed. Please verify re-transmission.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-20 animate-in fade-in duration-1000 px-4">
      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <button onClick={onBack} className="flex items-center gap-3 text-sm font-black text-slate-500 hover:text-indigo-400 transition-all group uppercase tracking-widest">
          <div className="p-3 bg-white dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 group-hover:border-indigo-500/50 shadow-sm"><ArrowLeft size={18} /></div>
          Back to Dashboard
        </button>
        <div className="flex items-center gap-4">
           {results && (
             <button onClick={() => setResults(null)} className="px-6 py-2 bg-slate-100 dark:bg-white/5 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-red-500 hover:text-white transition-all">New Synthesis</button>
           )}
           <div className="px-6 py-2 bg-indigo-500/10 text-indigo-400 rounded-full border border-indigo-500/20 text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-3"><Zap size={14} className="animate-pulse" /> Synthesis Engine v3.0</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          {!results && !loading ? (
            <div className="grid grid-cols-1 gap-12 items-center">
              <div className="bg-white dark:bg-[#0B1221] p-10 rounded-[4rem] border border-slate-200 dark:border-white/10 shadow-3xl flex flex-col gap-8">
                <div className="flex p-1.5 bg-slate-100 dark:bg-white/5 rounded-[2rem] border border-slate-200 dark:border-white/10 w-fit mx-auto">
                  <button onClick={() => setSourceType('file')} className={`px-12 py-3.5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${sourceType === 'file' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-xl' : 'text-slate-400'}`}>Document</button>
                  <button onClick={() => setSourceType('url')} className={`px-12 py-3.5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${sourceType === 'url' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-xl' : 'text-slate-400'}`}>Digital Link</button>
                </div>
                {sourceType === 'file' ? (
                  <div onClick={() => fileInputRef.current?.click()} className="w-full aspect-video border-4 border-dashed border-slate-100 dark:border-white/5 rounded-[3rem] flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-all">
                    {fileData ? <FileText size={64} className="text-indigo-500 animate-pulse" /> : <Upload size={48} className="text-slate-200 mb-4" />}
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{fileData ? fileData.name : 'Deploy Instructional Asset'}</span>
                    <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} />
                  </div>
                ) : (
                  <input type="text" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://youtube.com/..." className="w-full px-10 py-7 rounded-[2.5rem] bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-bold outline-none focus:ring-8 focus:ring-indigo-500/10 transition-all" />
                )}
                <button onClick={handleSynthesize} disabled={loading} className="w-full py-6 premium-gradient text-white rounded-[2.5rem] font-black uppercase tracking-widest text-sm flex items-center justify-center gap-4 shadow-2xl active:scale-95 disabled:opacity-50">Initialize Synthesis</button>
              </div>
            </div>
          ) : loading ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-10">
              <Loader2 className="animate-spin text-indigo-500" size={64} />
              <h3 className="text-2xl font-black uppercase tracking-[0.5em] text-slate-900 dark:text-white">Synthesizing Neural Grid</h3>
            </div>
          ) : results ? (
            <div className="flex flex-col gap-8">
              <div className="bg-white dark:bg-white/[0.03] p-6 rounded-[3rem] border border-slate-200 dark:border-white/10 flex flex-wrap items-center justify-between gap-6 shadow-sm">
                <div className="flex items-center gap-3">
                   {['plan', 'slides', 'summary'].map(tab => (
                     <button key={tab} onClick={() => setActiveResultTab(tab as any)} className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeResultTab === tab ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl' : 'text-slate-500'}`}>{tab}</button>
                   ))}
                </div>
              </div>
              <div className="bg-white dark:bg-[#0B1221] rounded-[4rem] border border-slate-200 dark:border-white/10 p-12 overflow-y-auto custom-scrollbar min-h-[600px]">
                 {activeResultTab === 'plan' && <ReactMarkdown className="prose prose-slate dark:prose-invert max-w-none">{results.plan}</ReactMarkdown>}
                 {activeResultTab === 'slides' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       {results.slides.slides.map((s, i) => (
                          <div key={i} className="bg-slate-50 dark:bg-black/40 p-10 rounded-[3rem] border border-slate-100 dark:border-white/5">
                             <span className="text-[10px] font-black text-indigo-500 uppercase mb-8 block">Slide {i+1}</span>
                             <h4 className="text-xl font-black mb-6">{s.title}</h4>
                             <ul className="space-y-3">{s.content.map((p, idx) => <li key={idx} className="text-sm text-slate-500">• {p}</li>)}</ul>
                          </div>
                       ))}
                    </div>
                 )}
                 {activeResultTab === 'summary' && <p className="text-lg italic text-slate-600 dark:text-slate-300">"{results.summary}"</p>}
              </div>
            </div>
          ) : null}
        </div>

        <div className="space-y-6">
           <div className="flex items-center gap-2 mb-4 px-2">
              <History size={18} className="text-indigo-500" />
              <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">Synthesis Hub</h3>
           </div>
           <div className="space-y-4 max-h-[800px] overflow-y-auto custom-scrollbar pr-2">
              {history.length > 0 ? history.map((h) => (
                 <div key={h.id} className="bg-white dark:bg-white/[0.03] p-5 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm hover:border-indigo-500/30 transition-all group">
                    <div className="flex justify-between items-start mb-2">
                       <h4 className="text-xs font-black text-slate-900 dark:text-white truncate pr-4">{h.title}</h4>
                       <button onClick={() => setHistory(history.filter(i => i.id !== h.id))} className="text-slate-300 hover:text-red-500"><Trash2 size={14}/></button>
                    </div>
                    <div className="flex items-center justify-between">
                       <span className="text-[8px] font-black uppercase text-slate-400">{h.date.split(',')[0]}</span>
                       <button onClick={() => setResults(h)} className="text-[8px] font-black uppercase text-indigo-500 hover:underline">Deploy Asset</button>
                    </div>
                 </div>
              )) : (
                 <div className="text-center py-20 bg-slate-50 dark:bg-white/5 rounded-[2.5rem] opacity-30">
                    <BrainCircuit size={48} className="mx-auto mb-4 opacity-20" />
                    <p className="text-[10px] font-black uppercase tracking-widest">History Vacant</p>
                 </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default InstantLessonGenerator;