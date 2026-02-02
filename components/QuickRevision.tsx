import React, { useState, useRef } from 'react';
import { BookOpenCheck, Upload, Loader2, Sparkles, Wand2, X, ArrowLeft, Zap, Save, Trash2, FileText, CheckCircle2, AlertCircle, Type } from 'lucide-react';
import { generateRevisionInsights, summarizeText } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

const QuickRevision: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const [inputMode, setInputMode] = useState<'file' | 'text'>('file');
  const [asset, setAsset] = useState<string | null>(null);
  const [pastedText, setPastedText] = useState('');
  const [mimeType, setMimeType] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    setError(null);
    if (file) {
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        setError("Unsupported file format. Please upload a PDF, JPG, or PNG asset.");
        setAsset(null);
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        setAsset(event.target?.result as string);
        setMimeType(file.type);
        setResult(null);
        setIsSaved(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const startSynthesis = async () => {
    setError(null);
    setResult(null);
    setIsSaved(false);
    setLoading(true);

    try {
      let output;
      if (inputMode === 'file') {
        if (!asset) throw new Error("No asset loaded.");
        output = await generateRevisionInsights(asset, mimeType);
      } else {
        if (!pastedText.trim()) throw new Error("Please input text for analysis.");
        // Use summarizeText but with a prompt tailored for 'Autopsy' (Definitions/Points)
        output = await summarizeText(`Perform a revision autopsy on the following content. 
        Extract core definitions, essential points, and critical academic takeaways.
        Format with high readability using headers and bullet points.
        
        Content: ${pastedText}`);
      }
      
      setResult(output);
      
      const currentPoints = Number(localStorage.getItem('svgpt_xp')) || 0;
      localStorage.setItem('svgpt_xp', (currentPoints + 25).toString());
    } catch (e: any) {
      setError(e.message || "Neural synthesis failed. Ensure input is valid.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (!result) return;
    const storageKey = `svgpt_notes_${localStorage.getItem('sv-user-id') || 'guest'}`;
    const existingNotes = JSON.parse(localStorage.getItem(storageKey) || '[]');
    const newNote = {
      id: Date.now().toString(),
      title: `Revision Autopsy: ${new Date().toLocaleDateString()}`,
      subject: 'Quick Revision Archive',
      content: result,
      color: 'bg-violet-100 dark:bg-violet-900/30',
      date: new Date().toLocaleDateString()
    };
    localStorage.setItem(storageKey, JSON.stringify([newNote, ...existingNotes]));
    setIsSaved(true);
  };

  return (
    <div className="max-w-6xl mx-auto pb-20 animate-in fade-in duration-700">
      <div className="mb-8 flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors group">
          <div className="p-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 group-hover:border-indigo-200 shadow-sm">
            <ArrowLeft size={16} />
          </div>
          Back to Hub
        </button>
        <div className="flex items-center gap-3">
           <div className="px-4 py-1.5 bg-violet-500/10 text-violet-500 rounded-full border border-violet-500/20 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
             <Zap size={12} /> Neural Synthesis Active
           </div>
        </div>
      </div>

      <div className="relative group mb-12">
        <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-[3.5rem] blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
        <div className="relative px-8 md:px-12 py-12 bg-white dark:bg-[#050505] rounded-[3.5rem] border border-slate-200 dark:border-white/5 flex flex-col items-center gap-8">
          
          <div className="flex flex-col items-center text-center space-y-4 max-w-2xl">
            <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center text-emerald-500 mb-2 shadow-inner">
               <FileText size={32} />
            </div>
            <h2 className="text-3xl md:text-4xl font-[900] text-slate-900 dark:text-white tracking-tighter uppercase leading-none">
              REVISION AUTOPSY
            </h2>
            <p className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">
              Extract Definitions & Points from Photos/PDFs/Text
            </p>
          </div>

          <div className="w-full max-w-3xl flex flex-col gap-6">
            {/* Mode Switcher */}
            <div className="flex p-1 bg-slate-100 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 w-fit mx-auto">
              <button 
                onClick={() => setInputMode('file')}
                className={`px-8 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${inputMode === 'file' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Neural Asset
              </button>
              <button 
                onClick={() => setInputMode('text')}
                className={`px-8 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${inputMode === 'text' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Manual Script
              </button>
            </div>

            <div className="relative">
              {inputMode === 'file' ? (
                !asset ? (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-64 border-4 border-dashed border-slate-100 dark:border-white/5 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 transition-all group"
                  >
                    <Upload size={40} className="text-slate-200 group-hover:text-violet-500 transition-colors" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">UPLOAD IMAGE (JPG/PNG) OR PDF DOCUMENT</span>
                    <input ref={fileInputRef} type="file" className="hidden" accept=".pdf,image/jpeg,image/png" onChange={handleUpload} />
                  </div>
                ) : (
                  <div className="relative w-full h-64 rounded-[2.5rem] overflow-hidden border border-slate-200 dark:border-white/10 group bg-slate-50 dark:bg-black/20 flex items-center justify-center">
                    {mimeType === 'application/pdf' ? (
                      <div className="flex flex-col items-center gap-4 text-slate-400">
                        <FileText size={64} className="animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest">PDF Ready for Analysis</span>
                      </div>
                    ) : (
                      <img src={asset} className="w-full h-full object-contain" />
                    )}
                    <button 
                      onClick={() => setAsset(null)} 
                      className="absolute top-6 right-6 p-3 bg-white/90 dark:bg-slate-800/90 text-red-500 rounded-2xl shadow-xl hover:scale-110 transition-transform backdrop-blur-md"
                    >
                      <X size={20} />
                    </button>
                  </div>
                )
              ) : (
                <div className="w-full">
                  <textarea 
                    value={pastedText}
                    onChange={(e) => setPastedText(e.target.value)}
                    placeholder="Paste your study notes or content here for neural deconstruction..."
                    className="w-full h-64 p-8 bg-slate-50 dark:bg-black/40 rounded-[2.5rem] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-medium text-sm outline-none focus:ring-8 focus:ring-violet-500/10 transition-all resize-none shadow-inner"
                  />
                </div>
              )}
            </div>

            <button 
              onClick={startSynthesis}
              disabled={loading || (inputMode === 'file' ? !asset : !pastedText.trim())}
              className="w-full py-5 premium-gradient text-white rounded-[1.8rem] font-black uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <Wand2 size={20} />}
              {loading ? 'Performing Neural Autopsy...' : 'Synthesize Revision Findings'}
            </button>

            {error && (
              <div className="flex items-center gap-3 p-5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl animate-in slide-in-from-top-2">
                 <AlertCircle size={20} className="text-red-500 flex-shrink-0" />
                 <p className="text-xs font-bold text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-white/[0.02] backdrop-blur-3xl rounded-[3.5rem] border border-slate-200 dark:border-white/10 shadow-sm min-h-[400px] flex flex-col overflow-hidden">
        <div className="px-10 py-6 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-black/20 flex justify-between items-center">
           <div className="flex items-center gap-3">
             <div className="w-2 h-6 bg-violet-500 rounded-full"></div>
             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Autopsy Findings</span>
           </div>
           {result && (
             <button 
              onClick={handleSave}
              disabled={isSaved}
              className={`flex items-center gap-2 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isSaved ? 'bg-green-500/10 text-green-500' : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg'}`}
             >
               {isSaved ? <CheckCircle2 size={14} /> : <Save size={14} />}
               {isSaved ? 'Archived to Notes' : 'Archive Findings'}
             </button>
           )}
        </div>

        <div className="flex-1 p-12 overflow-y-auto custom-scrollbar">
          {loading ? (
             <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <div className="relative mb-6">
                   <Loader2 size={64} className="animate-spin text-violet-500" />
                   <Sparkles size={24} className="absolute inset-0 m-auto text-violet-500/50 animate-pulse" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] animate-pulse">Scanning Data Structures...</p>
             </div>
          ) : result ? (
            <div className="prose prose-slate dark:prose-invert max-w-none animate-in slide-in-from-bottom-6 duration-1000">
               <ReactMarkdown
                 components={{
                   h1: ({node, ...props}) => <h1 className="text-3xl font-black tracking-tighter uppercase mb-8 pb-4 border-b border-violet-500/10" {...props} />,
                   h2: ({node, ...props}) => <h2 className="text-xl font-black tracking-tight text-violet-500 mt-12 mb-6" {...props} />,
                   strong: ({node, ...props}) => <strong className="text-slate-900 dark:text-white font-black bg-violet-500/5 px-1 rounded" {...props} />,
                   li: ({node, ...props}) => <li className="text-sm md:text-base font-medium mb-3 list-none flex items-start gap-3"><div className="w-1.5 h-1.5 rounded-full bg-violet-500 mt-2 flex-shrink-0"></div> <span {...props}/></li>
                 }}
               >
                 {result}
               </ReactMarkdown>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center opacity-10">
               <BookOpenCheck size={100} strokeWidth={1} />
               <p className="text-[12px] font-black uppercase tracking-[0.6em] mt-10">Awaiting Neural Data</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuickRevision;