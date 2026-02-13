import React, { useState, useEffect } from 'react';
import { generateVisualAid } from '../services/geminiService';
import { Image as ImageIcon, Loader2, Download, AlertCircle, Sparkles, X, Palette, Wand2, ArrowLeft, Cpu, Activity, Zap, History, Trash2, RotateCcw } from 'lucide-react';

interface VisualStudioProps {
  onBack?: () => void;
}

interface VisualAsset {
  id: string;
  prompt: string;
  url: string;
  date: string;
}

const synthesisSteps = [
  "Initializing Neural Core...",
  "Mapping Semantic Vectors...",
  "Synthesizing Primary Forms...",
  "Calculating Chromatic Balance...",
  "Refining Textural Micro-details...",
  "Optimizing Visual Hierarchy...",
  "Finalizing Neural Rendering..."
];

const VisualStudio: React.FC<VisualStudioProps> = ({ onBack }) => {
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusIndex, setStatusIndex] = useState(0);
  const [gallery, setGallery] = useState<VisualAsset[]>(() => {
    const saved = localStorage.getItem('svgpt_visual_gallery');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('svgpt_visual_gallery', JSON.stringify(gallery));
  }, [gallery]);

  useEffect(() => {
    let interval: number;
    if (loading) {
      setStatusIndex(0);
      interval = window.setInterval(() => {
        setStatusIndex((prev) => (prev + 1) % synthesisSteps.length);
      }, 1800);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleGenerate = async () => {
    if (!prompt) return;
    setLoading(true);
    setError(null);
    setImageUrl(null);
    try {
      const url = await generateVisualAid(prompt);
      setImageUrl(url);
      const newAsset: VisualAsset = {
        id: Date.now().toString(),
        prompt,
        url,
        date: new Date().toLocaleString()
      };
      setGallery([newAsset, ...gallery]);
    } catch (err: any) {
      setError("Unable to generate image. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const deleteFromGallery = (id: string) => {
    setGallery(gallery.filter(a => a.id !== id));
  };

  const clearGallery = () => {
    if (confirm('Clear entire visual history?')) {
      setGallery([]);
    }
  };

  const restoreAsset = (asset: VisualAsset) => {
    setImageUrl(asset.url);
    setPrompt(asset.prompt);
  };

  return (
    <div className="max-w-6xl mx-auto pb-20">
       <div className="mb-6 flex items-center justify-between">
         <button 
           onClick={onBack}
           className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors group"
         >
           <div className="p-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 group-hover:border-indigo-200">
              <ArrowLeft size={16} />
           </div>
           Back to Dashboard
         </button>
         <div className="flex items-center gap-3 px-4 py-1.5 bg-purple-500/10 text-purple-500 rounded-full border border-purple-500/20 text-[10px] font-black uppercase tracking-widest">
           <Activity size={14} className="mr-2" /> Gallery Auto-Indexing Active
         </div>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 space-y-8">
            <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-indigo-700 rounded-3xl p-10 text-white shadow-xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[100px] -mr-32 -mt-32 rounded-full"></div>
             <div className="relative z-10">
               <h2 className="text-4xl font-black mb-2 flex items-center gap-3 tracking-tighter uppercase">
                 <div className="p-2 bg-white/20 rounded-2xl backdrop-blur-md">
                   <Palette size={32} />
                 </div>
                 Visual Studio
               </h2>
               <p className="text-purple-100 text-lg font-medium opacity-90 max-w-xl">
                 Synthesize high-fidelity diagrams and classroom illustrations using the SVGPT Neural Core.
               </p>
             </div>
            </div>

            <div className="bg-white/70 dark:bg-white/[0.03] backdrop-blur-3xl p-8 rounded-[2.5rem] border border-slate-200 dark:border-white/10 shadow-sm transition-all hover:shadow-md">
              <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 mb-4 uppercase tracking-[0.2em] ml-2">Creative Directive</label>
              <div className="flex flex-col md:flex-row gap-4">
                <input 
                   type="text" 
                   value={prompt}
                   onChange={(e) => setPrompt(e.target.value)}
                   onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                   placeholder="e.g. A detailed anatomical diagram of the human heart"
                   className="flex-1 px-6 py-5 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-black/20 text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all font-bold text-sm"
                />
                <button 
                  onClick={handleGenerate} 
                  disabled={loading || !prompt} 
                  className="px-10 py-5 premium-gradient text-white font-black uppercase tracking-widest text-xs rounded-2xl transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
                  Synthesize Asset
                </button>
              </div>
            </div>

            {loading && (
              <div className="bg-white dark:bg-slate-900/40 p-1 rounded-[3rem] border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 backdrop-blur-md">
                <div className="relative aspect-square w-full rounded-[2.8rem] overflow-hidden bg-slate-100 dark:bg-black flex flex-col items-center justify-center border border-slate-200 dark:border-white/5">
                   <div className="absolute inset-0 opacity-30">
                     <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#6366F1 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
                   </div>
                   <div className="relative z-10 flex flex-col items-center gap-10">
                     <Wand2 className="text-indigo-500 animate-[bounce_2s_infinite]" size={48} />
                     <p className="text-[11px] font-black text-indigo-500 uppercase tracking-widest">{synthesisSteps[statusIndex]}</p>
                   </div>
                   <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent top-0 animate-[scan_3s_infinite] shadow-[0_0_20px_rgba(99,102,241,0.8)] z-20"></div>
                </div>
              </div>
            )}

            {imageUrl && !loading && (
              <div className="bg-white/70 dark:bg-white/[0.03] p-4 rounded-[2.5rem] border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-700 group">
                 <div className="relative rounded-[2rem] overflow-hidden shadow-inner bg-slate-50 dark:bg-black/20 border border-slate-100 dark:border-white/5">
                    <img src={imageUrl} alt="Generated visual aid" className="w-full h-auto transition-transform duration-1000 group-hover:scale-[1.02]" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col items-center justify-center gap-6 backdrop-blur-sm">
                       <button 
                         onClick={() => {
                           const link = document.createElement('a');
                           link.href = imageUrl!;
                           link.download = `svgpt-asset-${Date.now()}.png`;
                           link.click();
                         }} 
                         className="px-8 py-4 bg-white text-slate-900 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-3 hover:scale-110 active:scale-95 transition-all shadow-2xl"
                       >
                          <Download size={18} /> Download High-Res
                       </button>
                    </div>
                 </div>
                 <div className="mt-6 px-4 pb-2 flex justify-between items-center">
                   <div className="flex flex-col">
                     <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] mb-1">Current Active Asset</span>
                     <span className="text-xs font-bold text-slate-500 dark:text-slate-400 truncate max-w-sm">"{prompt}"</span>
                   </div>
                   <button onClick={() => setImageUrl(null)} className="p-3 bg-slate-100 dark:bg-white/5 text-slate-400 hover:text-red-500 rounded-xl transition-colors"><X size={18} /></button>
                 </div>
              </div>
            )}
         </div>

         {/* History Sidebar */}
         <div className="space-y-6">
            <div className="flex items-center justify-between mb-4 px-2">
               <div className="flex items-center gap-2">
                  <History size={18} className="text-purple-500" />
                  <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">Neural Gallery</h3>
               </div>
               {gallery.length > 0 && (
                 <button onClick={clearGallery} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-red-500 transition-colors">Clear All</button>
               )}
            </div>
            <div className="space-y-4 max-h-[800px] overflow-y-auto custom-scrollbar pr-2">
               {gallery.length > 0 ? gallery.map((asset) => (
                  <div key={asset.id} className="bg-white dark:bg-white/[0.03] p-4 rounded-[2rem] border border-slate-200 dark:border-white/10 shadow-sm group hover:border-purple-500/30 transition-all relative overflow-hidden">
                     <div className="aspect-square rounded-2xl overflow-hidden mb-4 bg-slate-100 dark:bg-black/40">
                        <img src={asset.url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                     </div>
                     <p className="text-[10px] font-bold text-slate-700 dark:text-slate-300 line-clamp-2 mb-2">"{asset.prompt}"</p>
                     <div className="flex items-center justify-between">
                        <span className="text-[8px] font-black uppercase text-slate-400">{asset.date.split(',')[0]}</span>
                        <div className="flex gap-2">
                           <button onClick={() => restoreAsset(asset)} className="p-1.5 bg-purple-500/10 text-purple-600 rounded-lg hover:bg-purple-600 hover:text-white transition-all" title="Restore Prompt & Image"><RotateCcw size={12}/></button>
                           <button onClick={() => deleteFromGallery(asset.id)} className="p-1.5 text-slate-300 hover:text-red-500 transition-all" title="Delete Asset"><Trash2 size={12}/></button>
                        </div>
                     </div>
                  </div>
               )) : (
                  <div className="text-center py-20 bg-slate-50 dark:bg-white/5 border-2 border-dashed border-slate-100 dark:border-white/5 rounded-[2.5rem] opacity-40">
                     <ImageIcon size={48} className="mx-auto mb-4 opacity-20" />
                     <p className="text-[10px] font-black uppercase tracking-widest px-4 leading-relaxed">No previously archived visual assets detected.</p>
                  </div>
               )}
            </div>
         </div>
       </div>

       <style>{`
          @keyframes scan { 0% { transform: translateY(0); opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { transform: translateY(100vh); opacity: 0; } }
       `}</style>
    </div>
  );
};

export default VisualStudio;