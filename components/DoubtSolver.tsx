import React, { useState, useRef } from 'react';
import { Camera, Upload, Loader2, Sparkles, Wand2, X, ArrowLeft, BrainCircuit, Zap, CheckCircle2, FileText, BookOpenCheck, Save, Trash2, AlertCircle, Atom, FlaskConical } from 'lucide-react';
import { solveDoubt, generateRevisionInsights } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

type SolverMode = 'solve' | 'revision';

const DoubtSolver: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const [mode, setMode] = useState<SolverMode>('solve');
  const [asset, setAsset] = useState<string | null>(null);
  const [assetName, setAssetName] = useState<string>('');
  const [mimeType, setMimeType] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pointsAwarded, setPointsAwarded] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    setError(null);
    if (file) {
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setError("Unsupported file format. Please upload a PDF, JPG, PNG, or WEBP document.");
        setAsset(null);
        setAssetName('');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        setAsset(event.target?.result as string);
        setMimeType(file.type);
        setAssetName(file.name);
        setResult(null);
        setPointsAwarded(false);
        setIsSaved(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const processAnalysis = async () => {
    if (!asset) return;
    setLoading(true);
    setError(null);
    try {
      let output;
      if (mode === 'solve') {
        output = await solveDoubt(asset, mimeType);
      } else {
        output = await generateRevisionInsights(asset, mimeType);
      }
      
      setResult(output);
      
      const currentPoints = Number(localStorage.getItem('svgpt_xp')) || 0;
      localStorage.setItem('svgpt_xp', (currentPoints + 50).toString());
      setPointsAwarded(true);
      
    } catch (e: any) {
      setError(e.message || "Neural synthesis failed. Ensure the asset is clear and academic in nature.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToNotes = () => {
    if (!result) return;
    const existingNotes = JSON.parse(localStorage.getItem('svgpt_notes') || '[]');
    const newNote = {
      id: Date.now().toString(),
      title: `${mode === 'solve' ? 'Resolution' : 'Insights'}: ${assetName || 'Neural Scan'}`,
      subject: 'Synthesis Archive',
      content: result,
      color: mode === 'solve' ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-emerald-100 dark:bg-emerald-900/30',
      date: new Date().toLocaleDateString()
    };
    localStorage.setItem('svgpt_notes', JSON.stringify([newNote, ...existingNotes]));
    setIsSaved(true);
  };

  const clearInterface = () => {
    setAsset(null);
    setAssetName('');
    setMimeType('');
    setResult(null);
    setError(null);
    setPointsAwarded(false);
    setIsSaved(false);
  };

  const isPdf = mimeType === 'application/pdf';

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-8 pb-20 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
         <button onClick={onBack} className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors group">
           <div className="p-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 group-hover:border-indigo-200 shadow-sm">
              <ArrowLeft size={16} />
           </div>
           Back to Dashboard
         </button>
         
         <div className="flex p-1 bg-slate-100 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
            <button 
              onClick={() => { setMode('solve'); setResult(null); setError(null); }}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${mode === 'solve' ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl' : 'text-slate-500 hover:text-slate-800'}`}
            >
              <BrainCircuit size={14} /> Instant Solver
            </button>
            <button 
              onClick={() => { setMode('revision'); setResult(null); setError(null); }}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${mode === 'revision' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/20' : 'text-slate-500 hover:text-indigo-600'}`}
            >
              <BookOpenCheck size={14} /> Quick Revision
            </button>
         </div>

         <div className="flex items-center gap-3 px-6 py-2 bg-yellow-500/10 rounded-full border border-yellow-500/20">
            <Zap className="text-yellow-600 dark:text-yellow-400" size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest text-yellow-700 dark:text-yellow-500">
               Mastery Bonus: +50 MP / Synthesis
            </span>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1">
        {/* Input Card */}
        <div className="bg-white/70 dark:bg-white/[0.03] backdrop-blur-3xl p-10 rounded-[3.5rem] border border-slate-200 dark:border-white/10 shadow-sm flex flex-col items-center">
           <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-8 ${mode === 'solve' ? 'bg-indigo-500/10' : 'bg-emerald-500/10'}`}>
              {mode === 'solve' ? <BrainCircuit className="text-indigo-500" size={32} /> : <FileText className="text-emerald-500" size={32} />}
           </div>
           
           <h2 className="text-3xl font-black tracking-tighter uppercase text-slate-900 dark:text-white mb-2">
             {mode === 'solve' ? 'Neural Scanner' : 'Revision Autopsy'}
           </h2>
           <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-10 text-center">
             {mode === 'solve' ? 'Instant Doubt Resolution Engine' : 'Extract Definitions & Points from Photos/PDFs'}
           </p>

           {!asset ? (
             <div 
               onClick={() => fileInputRef.current?.click()}
               onDragOver={handleDragOver}
               onDragLeave={handleDragLeave}
               onDrop={handleDrop}
               className={`w-full aspect-[4/3] border-4 border-dashed rounded-[3rem] flex flex-col items-center justify-center cursor-pointer transition-all duration-300 group relative ${isDragging ? 'border-indigo-500 bg-indigo-500/5 ring-8 ring-indigo-500/10' : 'border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5'}`}
             >
                <div className={`absolute inset-0 bg-indigo-500/5 rounded-[2.8rem] opacity-0 transition-opacity duration-300 ${isDragging ? 'opacity-100' : ''}`}></div>
                <Upload size={48} className={`transition-colors mb-4 ${isDragging ? 'text-indigo-500 scale-110' : 'text-slate-200 group-hover:text-indigo-500'}`} />
                <span className={`text-xs font-black uppercase tracking-[0.2em] px-8 text-center transition-colors ${isDragging ? 'text-indigo-600' : 'text-slate-400'}`}>
                  {isDragging ? 'Drop Asset to Synthesize' : 'Upload Image (JPG/PNG) or PDF Document'}
                </span>
                <input ref={fileInputRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={handleUpload} />
             </div>
           ) : (
             <div className="w-full flex flex-col items-center">
                <div className="relative w-full aspect-[4/3] rounded-[3rem] overflow-hidden border border-slate-200 dark:border-white/10 group mb-8 shadow-2xl bg-slate-50 dark:bg-black/20 flex items-center justify-center">
                   {isPdf ? (
                     <div className="flex flex-col items-center gap-4 text-slate-400">
                       <FileText size={80} className="animate-pulse" />
                       <span className="text-[10px] font-black uppercase tracking-widest px-10 text-center truncate w-full">{assetName || 'Document Loaded'}</span>
                     </div>
                   ) : (
                     <img src={asset} className="w-full h-full object-contain" />
                   )}
                   <button 
                     onClick={() => { setAsset(null); setAssetName(''); }}
                     className="absolute top-6 right-6 p-3 bg-white/90 rounded-2xl text-red-500 shadow-xl hover:scale-110 transition-transform backdrop-blur-md"
                   >
                     <X size={20} />
                   </button>
                </div>
                
                <div className="flex gap-4 w-full">
                  <button 
                    onClick={clearInterface}
                    className="p-5 bg-slate-100 dark:bg-white/5 text-slate-400 hover:text-red-500 rounded-2xl transition-all shadow-sm"
                  >
                    <Trash2 size={20} />
                  </button>
                  <button 
                     onClick={processAnalysis}
                     disabled={loading}
                     className={`flex-1 py-5 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3 ${mode === 'solve' ? 'premium-gradient' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'}`}
                  >
                     {loading ? <Loader2 className="animate-spin" size={20} /> : <Wand2 size={20} />}
                     {loading ? 'Synthesizing Neural Insights...' : mode === 'solve' ? 'Synthesize Solution' : 'Extract Revision Points'}
                  </button>
                </div>
             </div>
           )}
        </div>

        {/* Output Card */}
        <div className="bg-white/70 dark:bg-white/[0.03] backdrop-blur-3xl rounded-[3.5rem] border border-slate-200 dark:border-white/10 shadow-sm flex flex-col overflow-hidden min-h-[500px]">
           <div className="p-6 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-black/20 flex justify-between items-center px-10">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                 {mode === 'solve' ? <Atom size={16} className="text-indigo-500" /> : <BookOpenCheck size={16} className="text-emerald-500" />}
                 {mode === 'solve' ? 'Neural Pathway Resolution' : 'Synthesized Mastery Points'}
              </h3>
              <div className="flex items-center gap-4">
                {result && !loading && (
                   <button 
                    onClick={handleSaveToNotes}
                    disabled={isSaved}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shadow-sm ${isSaved ? 'text-green-500 bg-green-500/10' : 'text-slate-400 hover:text-indigo-500 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10'}`}
                   >
                     {isSaved ? <CheckCircle2 size={14} /> : <Save size={14} />} {isSaved ? 'Archived' : 'Archive Node'}
                   </button>
                )}
              </div>
           </div>

           <div className="flex-1 p-10 overflow-y-auto custom-scrollbar prose prose-slate dark:prose-invert max-w-none">
              {loading ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                   <div className="relative mb-6">
                      <div className={`w-16 h-16 border-4 border-t-transparent rounded-full animate-spin ${mode === 'solve' ? 'border-indigo-500' : 'border-emerald-500'}`}></div>
                      <Sparkles className={`absolute inset-0 m-auto animate-pulse ${mode === 'solve' ? 'text-indigo-500' : 'text-emerald-500'}`} size={24} />
                   </div>
                   <p className="text-[10px] font-black uppercase tracking-[0.4em]">Deconstructing Scientific Logic...</p>
                </div>
              ) : result ? (
                <div className="animate-in fade-in duration-700">
                   <ReactMarkdown 
                     components={{
                       h1: ({node, ...props}) => <h1 className="text-2xl font-black tracking-tighter uppercase text-slate-900 dark:text-white border-b-2 border-indigo-500/10 pb-4 mb-8" {...props} />,
                       h2: ({node, ...props}) => (
                         <h2 className="group text-lg font-black uppercase tracking-tight text-indigo-500 mt-12 mb-6 flex items-center gap-3" {...props}>
                            <div className="w-2 h-6 bg-indigo-500 rounded-full"></div>
                            {props.children}
                         </h2>
                       ),
                       h3: ({node, ...props}) => <h3 className="text-base font-black text-slate-800 dark:text-slate-100 mt-8 mb-4 uppercase" {...props} />,
                       p: ({node, ...props}) => {
                         const content = String(props.children);
                         // Highlight scientific components
                         if (content.includes('->') || content.includes('→') || content.includes('$')) {
                            return (
                              <div className="bg-slate-50 dark:bg-black/30 p-8 rounded-[2.5rem] border border-slate-100 dark:border-white/5 my-8 shadow-inner text-center font-mono text-lg font-black text-indigo-600 dark:text-indigo-400">
                                 {props.children}
                              </div>
                            );
                         }
                         return <p className="text-sm md:text-base font-medium text-slate-600 dark:text-slate-300 leading-relaxed mb-6" {...props} />;
                       },
                       li: ({node, ...props}) => (
                         <li className="flex items-start gap-4 group animate-in slide-in-from-left-2 duration-300 mb-4">
                           <div className="w-8 h-8 rounded-xl bg-indigo-500/5 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-500 group-hover:text-white transition-all text-indigo-500">
                              <FlaskConical size={14} />
                           </div>
                           <span className="text-sm md:text-base font-medium text-slate-700 dark:text-slate-200 pt-1" {...props} />
                         </li>
                       ),
                       strong: ({node, ...props}) => <strong className="font-black text-indigo-600 dark:text-indigo-400 bg-indigo-500/5 px-2 py-0.5 rounded-lg border border-indigo-500/10" {...props} />,
                       blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-indigo-500 bg-indigo-50/30 dark:bg-indigo-900/10 p-8 rounded-r-[2.5rem] my-10 italic text-slate-800 dark:text-slate-200 font-bold" {...props} />,
                     }}
                   >
                     {result}
                   </ReactMarkdown>
                   <div className="mt-12 pt-8 border-t border-slate-100 dark:border-white/5 flex items-center gap-4 text-emerald-500 bg-emerald-500/5 p-6 rounded-3xl border border-emerald-500/10">
                      <CheckCircle2 size={24} className="flex-shrink-0" />
                      <p className="text-xs font-black uppercase tracking-widest leading-relaxed">
                        Synthesis Complete: Scholarly trajectory validated against global scientific standard.
                      </p>
                   </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center opacity-10">
                   <div className="p-10 border-2 border-dashed border-current rounded-full mb-8">
                     {mode === 'solve' ? <Atom size={80} /> : <BookOpenCheck size={80} />}
                   </div>
                   <p className="text-[12px] font-black uppercase tracking-[0.6em] mt-2 text-center leading-relaxed">Awaiting Academic Snapshot</p>
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default DoubtSolver;