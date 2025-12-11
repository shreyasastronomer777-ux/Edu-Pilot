import React, { useState } from 'react';
import { generateVisualAid } from '../services/geminiService';
import { Image as ImageIcon, Loader2, Download, AlertCircle, Sparkles, X } from 'lucide-react';

const VisualStudio: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt) return;
    setLoading(true);
    setError(null);
    setImageUrl(null);

    try {
      const url = await generateVisualAid(prompt);
      setImageUrl(url);
    } catch (err: any) {
      console.error("Visual Studio Error:", err);
      let errorMessage = "Unable to generate image. Please try again later.";

      if (err instanceof Error || (typeof err === 'object' && err?.message)) {
        const msg = (err.message || '').toLowerCase();
        
        if (msg.includes('safety') || msg.includes('blocked') || msg.includes('policy')) {
          errorMessage = "This prompt was flagged by safety filters. Please try a different, less explicit description.";
        } else if (msg.includes('quota') || msg.includes('429')) {
          errorMessage = "You have reached the usage limit. Please wait a minute before trying again.";
        } else if (msg.includes('network') || msg.includes('offline') || msg.includes('fetch')) {
          errorMessage = "Network connection issue. Please check your internet connection.";
        } else {
           errorMessage = `Generation failed: ${err.message}`;
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
       <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl p-8 text-white mb-8 shadow-lg">
        <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <ImageIcon />
          Visual Studio
        </h2>
        <p className="text-purple-100 text-lg opacity-90">
          Turn your ideas into custom visual aids for your slides, worksheets, or classroom decorations.
        </p>
       </div>

       <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm mb-8 transition-colors">
         <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Describe the image you need</label>
         <div className="flex gap-4">
           <input 
              type="text" 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
              placeholder="e.g. A colorful diagram of a plant cell with labels, cartoon style"
              className="flex-1 px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
           />
           <button 
             onClick={handleGenerate}
             disabled={loading || !prompt}
             className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px] flex justify-center items-center"
           >
             {loading ? <Loader2 className="animate-spin" /> : 'Create'}
           </button>
         </div>
         <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">Powered by Gemini 2.5 Flash Image</p>
       </div>

       {error && (
         <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-900 dark:text-red-200 rounded-xl flex items-start gap-3 border border-red-200 dark:border-red-800 mb-6 animate-in slide-in-from-top-2">
           <AlertCircle size={20} className="mt-0.5 flex-shrink-0 text-red-600 dark:text-red-400" />
           <div className="flex-1">
             <h4 className="font-semibold text-sm text-red-800 dark:text-red-200 mb-0.5">Generation Failed</h4>
             <p className="text-sm text-red-700 dark:text-red-300 leading-relaxed">{error}</p>
           </div>
           <button 
             onClick={() => setError(null)} 
             className="text-red-400 dark:text-red-500 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/50 p-1 rounded-md transition-colors"
             title="Dismiss"
           >
             <X size={16} />
           </button>
         </div>
       )}

       {/* Loading State */}
       {loading && (
         <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-md transition-colors">
           <div className="aspect-square w-full max-w-lg mx-auto bg-slate-50 dark:bg-slate-900 rounded-xl overflow-hidden relative flex flex-col items-center justify-center">
             <div className="absolute inset-0 bg-gradient-to-r from-slate-50 via-purple-50 to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 animate-pulse"></div>
             
             <div className="relative z-10 flex flex-col items-center p-6 text-center">
                <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-full shadow-md flex items-center justify-center mb-6 relative">
                  <div className="absolute inset-0 rounded-full border-4 border-purple-100 dark:border-purple-900 border-t-purple-600 animate-spin"></div>
                  <Sparkles className="text-purple-600 dark:text-purple-400" size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200 mb-2">Creating Visual Aid...</h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-md">
                  Translating "{prompt}" into an image. This usually takes about 5-10 seconds.
                </p>
             </div>
           </div>
         </div>
       )}

       {imageUrl && (
         <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-md animate-in zoom-in-95 duration-300 transition-colors">
           <div className="aspect-square w-full max-w-lg mx-auto bg-slate-100 dark:bg-slate-900 rounded-xl overflow-hidden relative group">
             <img src={imageUrl} alt="Generated visual aid" className="w-full h-full object-cover" />
             
             <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
               <a 
                 href={imageUrl} 
                 download={`edupilot-visual-${Date.now()}.png`}
                 className="bg-white text-slate-900 px-6 py-3 rounded-full font-bold flex items-center gap-2 hover:scale-105 transition-transform"
               >
                 <Download size={20} /> Download Image
               </a>
             </div>
           </div>
           <p className="text-center text-slate-500 dark:text-slate-400 text-sm mt-4 italic">"{prompt}"</p>
         </div>
       )}
    </div>
  );
};

export default VisualStudio;