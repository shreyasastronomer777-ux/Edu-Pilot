import React, { useState, useRef, useEffect } from 'react';
import { FileQuestion, Upload, Loader2, Sparkles, Wand2, X, ArrowLeft, BrainCircuit, Zap, CheckCircle2, FileText, Layout, Download, Eye, EyeOff, AlertCircle, Type, ClipboardPaste, Bolt } from 'lucide-react';
import { streamExamQuestions } from '../services/geminiService';

const ExamPrep: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const [inputMode, setInputMode] = useState<'file' | 'text'>('file');
  const [asset, setAsset] = useState<string | null>(null);
  const [pastedText, setPastedText] = useState('');
  const [mimeType, setMimeType] = useState('');
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<{ question: string, answer: string }[]>([]);
  const [streamBuffer, setStreamBuffer] = useState('');
  const [showAnswers, setShowAnswers] = useState<Record<number, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Parse partial JSON from stream buffer
  useEffect(() => {
    if (streamBuffer) {
      try {
        // Attempt to extract array content from the partial JSON stream
        const text = streamBuffer.trim();
        const start = text.indexOf('[');
        const end = text.lastIndexOf(']');
        
        if (start !== -1) {
          let jsonCandidate = text.substring(start, end !== -1 ? end + 1 : text.length);
          // If the array isn't closed, try to close it for parsing
          if (end === -1) jsonCandidate += ']';
          
          // Basic cleanup to handle trailing commas in partial streams
          jsonCandidate = jsonCandidate.replace(/,\s*\]$/, ']');
          
          try {
            const parsed = JSON.parse(jsonCandidate);
            if (Array.isArray(parsed)) {
              setQuestions(parsed.filter(q => q && q.question));
            }
          } catch (e) {
            // Silently wait for more valid JSON chunks
          }
        }
      } catch (e) {
        // Partial chunk not yet valid
      }
    }
  }, [streamBuffer]);

  const processFile = (file: File) => {
    setError(null);
    if (file) {
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setError("Invalid format. Use JPG/PNG/PDF.");
        setAsset(null);
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setAsset(event.target?.result as string);
        setMimeType(file.type);
        setQuestions([]);
        setStreamBuffer('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSynthesize = async () => {
    setError(null);
    if (inputMode === 'file' && !asset) return;
    if (inputMode === 'text' && !pastedText.trim()) return;

    setLoading(true);
    setQuestions([]);
    setStreamBuffer('');
    try {
      await streamExamQuestions({
        type: inputMode,
        data: inputMode === 'file' ? asset! : pastedText,
        mimeType: inputMode === 'file' ? mimeType : undefined
      }, (chunk) => {
        setStreamBuffer(prev => prev + chunk);
      });
      
      const currentPoints = Number(localStorage.getItem('svgpt_xp')) || 0;
      localStorage.setItem('svgpt_xp', (currentPoints + 120).toString());
    } catch (e: any) {
      setError("High-velocity synthesis failed. Verify input connectivity.");
    } finally {
      setLoading(false);
    }
  };

  const toggleAnswer = (idx: number) => {
    setShowAnswers(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-8 pb-20 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <button onClick={onBack} className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-rose-600 transition-colors group">
          <div className="p-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-white/10 group-hover:border-rose-200 shadow-sm">
            <ArrowLeft size={16} />
          </div>
          Back to Workspace
        </button>
        <div className="flex items-center gap-3 px-6 py-2 bg-rose-500/10 rounded-full border border-rose-500/20">
          <Bolt className="text-rose-600 dark:text-rose-400 animate-pulse" size={16} />
          <span className="text-[10px] font-black uppercase tracking-widest text-rose-700 dark:text-rose-500">
            STREAMING SYNTHESIS ACTIVE
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white/90 dark:bg-[#0B1221]/90 backdrop-blur-3xl p-10 rounded-[3.5rem] border border-slate-200 dark:border-white/5 shadow-2xl flex flex-col items-center">
          <div className="w-16 h-16 bg-rose-500/10 rounded-2xl flex items-center justify-center text-rose-500 mb-6 shadow-inner animate-[bounce_3s_infinite]">
            <BrainCircuit size={32} />
          </div>
          <h2 className="text-4xl font-[900] tracking-tighter uppercase text-slate-900 dark:text-white mb-2 text-center leading-none">Flash-Track Exam</h2>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-10 text-center uppercase">Write text or scan materials for instant questions</p>

          <div className="w-full max-w-lg flex flex-col gap-6">
            <div className="flex p-1 bg-slate-100 dark:bg-black/20 rounded-2xl border border-slate-200 dark:border-white/10 w-fit mx-auto">
              <button 
                onClick={() => { setInputMode('file'); setQuestions([]); setStreamBuffer(''); }}
                className={`px-10 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${inputMode === 'file' ? 'bg-white dark:bg-slate-700 text-rose-600 shadow-xl' : 'text-slate-400'}`}
              >
                Neural Scan
              </button>
              <button 
                onClick={() => { setInputMode('text'); setQuestions([]); setStreamBuffer(''); }}
                className={`px-10 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${inputMode === 'text' ? 'bg-white dark:bg-slate-700 text-rose-600 shadow-xl' : 'text-slate-400'}`}
              >
                Write Text
              </button>
            </div>

            <div className="relative group">
              {inputMode === 'file' ? (
                !asset ? (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full aspect-[4/3] border-4 border-dashed border-slate-100 dark:border-white/5 rounded-[3rem] flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 transition-all"
                  >
                    <Upload size={48} className="text-slate-200 group-hover:text-rose-500 transition-colors" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">DEPLOY ASSET (PDF/IMG)</span>
                    <input ref={fileInputRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={e => e.target.files?.[0] && processFile(e.target.files[0])} />
                  </div>
                ) : (
                  <div className="relative w-full aspect-[4/3] rounded-[3rem] overflow-hidden border border-slate-200 dark:border-white/10 group bg-slate-50 dark:bg-black/20 flex items-center justify-center">
                    {mimeType === 'application/pdf' ? <FileText size={80} className="text-slate-300 animate-pulse" /> : <img src={asset} className="w-full h-full object-contain" alt="Scan" />}
                    <button onClick={() => setAsset(null)} className="absolute top-6 right-6 p-3 bg-white/90 dark:bg-slate-800/90 text-red-500 rounded-2xl shadow-xl hover:scale-110 transition-transform"><X size={20} /></button>
                  </div>
                )
              ) : (
                <textarea 
                  autoFocus
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  placeholder="Paste lesson data or notes here for high-speed question synthesis..."
                  className="w-full h-64 p-8 bg-slate-50 dark:bg-black/40 rounded-[2.5rem] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-medium text-sm outline-none focus:ring-8 focus:ring-rose-500/10 transition-all resize-none shadow-inner"
                />
              )}
            </div>

            <button 
              onClick={handleSynthesize}
              disabled={loading || (inputMode === 'file' ? !asset : !pastedText.trim())}
              className="w-full py-6 bg-rose-600 hover:bg-rose-700 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs shadow-[0_20px_40px_-10px_rgba(225,29,72,0.4)] active:scale-95 transition-all disabled:opacity-30 flex items-center justify-center gap-3 group"
            >
              {loading ? <Loader2 className="animate-spin" size={22} /> : <Bolt className="group-hover:animate-ping" size={22} />}
              {loading ? 'SYNERGIZING...' : 'FLASH SYNTHESIS'}
            </button>
          </div>
        </div>

        <div className="bg-white/90 dark:bg-[#0B1221]/90 backdrop-blur-3xl rounded-[3.5rem] border border-slate-200 dark:border-white/5 shadow-2xl flex flex-col overflow-hidden min-h-[500px]">
          <div className="p-8 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-black/20 flex justify-between items-center px-12">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Zap size={16} className="text-rose-500" /> VELOCITY POOL
            </h3>
            {questions.length > 0 && (
              <button onClick={() => window.print()} className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-500 rounded-xl hover:scale-110 transition-all">
                <Download size={18} />
              </button>
            )}
          </div>

          <div className="flex-1 p-10 overflow-y-auto custom-scrollbar">
            {loading && questions.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <div className="relative mb-8">
                  <div className="w-20 h-20 border-4 border-rose-500/20 border-t-rose-500 rounded-full animate-spin"></div>
                  <Bolt className="absolute inset-0 m-auto text-rose-500 animate-pulse" size={32} />
                </div>
                <p className="text-[11px] font-black uppercase tracking-[0.5em] text-center">TURBO-MAPPING ASSETS...</p>
              </div>
            ) : questions.length > 0 ? (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                {questions.map((q, i) => (
                  <div key={i} className="p-8 bg-slate-50 dark:bg-black/20 rounded-[2.5rem] border border-slate-100 dark:border-white/5 hover:border-rose-500/30 transition-all group">
                    <div className="flex items-start gap-6">
                      <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center text-xs font-black shadow-lg">
                        {i + 1}
                      </div>
                      <div className="flex-1 space-y-4">
                        <p className="text-lg font-black text-slate-900 dark:text-white leading-tight uppercase tracking-tight">{q.question}</p>
                        <div className="flex items-center justify-between">
                          <button 
                            onClick={() => toggleAnswer(i)}
                            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-rose-500 transition-colors"
                          >
                            {showAnswers[i] ? <EyeOff size={16} /> : <Eye size={16} />}
                            {showAnswers[i] ? 'Hide Answer' : 'Reveal Solution'}
                          </button>
                          {loading && i === questions.length - 1 && (
                            <div className="flex items-center gap-2 text-[9px] font-black uppercase text-indigo-500">
                              <Loader2 size={12} className="animate-spin" /> Stream Active
                            </div>
                          )}
                        </div>
                        {showAnswers[i] && (
                          <div className="p-6 bg-emerald-500/10 rounded-[1.8rem] border border-emerald-500/20 animate-in zoom-in-95">
                            <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 leading-relaxed italic">
                              {q.answer}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="p-6 border-2 border-dashed border-slate-100 dark:border-white/5 rounded-[2.5rem] flex items-center justify-center text-slate-400 animate-pulse">
                     <span className="text-[10px] font-black uppercase tracking-[0.3em]">Synthesizing next node...</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center opacity-10 grayscale">
                <Bolt size={120} strokeWidth={1} />
                <p className="text-[12px] font-black uppercase tracking-[0.8em] mt-10">AWAITING INPUT</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamPrep;