
import React, { useState, useRef } from 'react';
import { FileQuestion, Upload, Loader2, Sparkles, Wand2, X, ArrowLeft, BrainCircuit, Zap, CheckCircle2, FileText, Layout, Download, Eye, EyeOff } from 'lucide-react';
import { synthesizeExamQuestions } from '../services/geminiService';

const ExamPrep: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const [asset, setAsset] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState('');
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<{ question: string, answer: string }[] | null>(null);
  const [showAnswers, setShowAnswers] = useState<Record<number, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    setError(null);
    if (file) {
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setError("Unsupported format. Please upload a clear photo of your lesson or a PDF.");
        setAsset(null);
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setAsset(event.target?.result as string);
        setMimeType(file.type);
        setQuestions(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSynthesize = async () => {
    if (!asset) return;
    setLoading(true);
    setError(null);
    try {
      const output = await synthesizeExamQuestions(asset, mimeType);
      setQuestions(output);
      
      const currentPoints = Number(localStorage.getItem('svgpt_xp')) || 0;
      localStorage.setItem('svgpt_xp', (currentPoints + 120).toString());
    } catch (e) {
      setError("Analysis failed. Please ensure the text in the image is legible.");
    } finally {
      setLoading(false);
    }
  };

  const toggleAnswer = (idx: number) => {
    setShowAnswers(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-8 pb-20 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <button onClick={onBack} className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors group">
          <div className="p-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 group-hover:border-indigo-200 shadow-sm">
            <ArrowLeft size={16} />
          </div>
          Back to Dashboard
        </button>
        <div className="flex items-center gap-3 px-6 py-2 bg-rose-500/10 rounded-full border border-rose-500/20">
          <FileQuestion className="text-rose-600 dark:text-rose-400" size={16} />
          <span className="text-[10px] font-black uppercase tracking-widest text-rose-700 dark:text-rose-500">
            Exam Intel Synthesis v1.0
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white/70 dark:bg-white/[0.03] backdrop-blur-3xl p-10 rounded-[3.5rem] border border-slate-200 dark:border-white/10 shadow-sm flex flex-col items-center">
          <div className="w-20 h-20 bg-rose-500/10 rounded-3xl flex items-center justify-center mb-8">
            <BrainCircuit className="text-rose-500" size={32} />
          </div>
          <h2 className="text-3xl font-black tracking-tighter uppercase text-slate-900 dark:text-white mb-2">Lesson-to-Exam</h2>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-10 text-center">Scan your materials to generate rigorous test questions</p>

          {!asset ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="w-full aspect-[4/3] border-4 border-dashed border-slate-100 dark:border-white/5 rounded-[3rem] flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 transition-all group"
            >
              <Upload size={48} className="text-slate-200 group-hover:text-rose-500 transition-colors mb-4" />
              <span className="text-xs font-black uppercase tracking-[0.2em] px-8 text-center text-slate-400">
                Drop Lesson Photo or PDF
              </span>
              <input ref={fileInputRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={e => e.target.files?.[0] && processFile(e.target.files[0])} />
            </div>
          ) : (
            <div className="w-full flex flex-col items-center">
              <div className="relative w-full aspect-[4/3] rounded-[3rem] overflow-hidden border border-slate-200 dark:border-white/10 group mb-8 shadow-2xl bg-slate-50 dark:bg-black/20 flex items-center justify-center">
                {mimeType === 'application/pdf' ? (
                  <div className="flex flex-col items-center gap-4 text-slate-400">
                    <FileText size={80} className="animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest">PDF Node Loaded</span>
                  </div>
                ) : (
                  <img src={asset} className="w-full h-full object-contain" />
                )}
                <button onClick={() => setAsset(null)} className="absolute top-6 right-6 p-3 bg-white/90 rounded-2xl text-red-500 shadow-xl hover:scale-110 transition-transform">
                  <X size={20} />
                </button>
              </div>
              <button 
                onClick={handleSynthesize}
                disabled={loading}
                className="w-full py-5 bg-rose-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <Wand2 size={20} />}
                Synthesize Exam Questions
              </button>
            </div>
          )}

          {error && (
            <div className="mt-8 flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl w-full animate-in slide-in-from-bottom-2">
              <Zap size={18} className="text-red-500" />
              <p className="text-xs font-bold text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}
        </div>

        <div className="bg-white/70 dark:bg-white/[0.03] backdrop-blur-3xl rounded-[3.5rem] border border-slate-200 dark:border-white/10 shadow-sm flex flex-col overflow-hidden min-h-[500px]">
          <div className="p-6 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-black/20 flex justify-between items-center px-10">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Sparkles size={16} className="text-rose-500" /> Neural Question Pool
            </h3>
            {questions && (
              <button onClick={() => window.print()} className="p-2 bg-slate-100 dark:bg-white/5 text-slate-500 rounded-xl hover:bg-slate-200 transition-all shadow-sm">
                <Download size={16} />
              </button>
            )}
          </div>

          <div className="flex-1 p-10 overflow-y-auto custom-scrollbar">
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <Loader2 className="animate-spin text-rose-500 mb-6" size={48} />
                <p className="text-[10px] font-black uppercase tracking-[0.4em]">Deconstructing Lesson Geometry...</p>
              </div>
            ) : questions ? (
              <div className="space-y-6 animate-in fade-in duration-1000">
                {questions.map((q, i) => (
                  <div key={i} className="p-6 bg-white dark:bg-white/[0.02] rounded-3xl border border-slate-100 dark:border-white/5 hover:border-rose-500/30 transition-all group">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-xl bg-rose-500/10 flex items-center justify-center text-[10px] font-black text-rose-500 flex-shrink-0">
                        {i + 1}
                      </div>
                      <div className="flex-1 space-y-4">
                        <p className="text-sm font-black text-slate-900 dark:text-white leading-relaxed">{q.question}</p>
                        <button 
                          onClick={() => toggleAnswer(i)}
                          className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-rose-500 transition-colors"
                        >
                          {showAnswers[i] ? <EyeOff size={14} /> : <Eye size={14} />}
                          {showAnswers[i] ? 'Hide Answer' : 'Reveal Solution'}
                        </button>
                        {showAnswers[i] && (
                          <div className="p-5 bg-emerald-500/5 rounded-2xl border border-emerald-500/10 animate-in slide-in-from-top-2">
                            <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 leading-relaxed italic">
                              {q.answer}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center opacity-10">
                <FileQuestion size={100} strokeWidth={1} />
                <p className="text-[12px] font-black uppercase tracking-[0.6em] mt-10 text-center leading-relaxed">Awaiting Academic Node Input</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamPrep;
