
import React, { useState } from 'react';
import { generateVisualAid } from '../services/geminiService';
import { Image as ImageIcon, Loader2, Download, AlertCircle, Sparkles, X, Palette, Wand2, ArrowLeft } from 'lucide-react';

interface VisualStudioProps {
  onBack?: () => void;
}

const VisualStudio: React.FC<VisualStudioProps> = ({ onBack }) => {
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
      setError("Unable to generate image. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
       {/* Module Navigation */}
       <div className="mb-6">
         <button 
           onClick={onBack}
           className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors group"
         >
           <div className="p-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 group-hover:border-indigo-200">
              <ArrowLeft size={16} />
           </div>
           Back to Dashboard
         </button>
       </div>

       <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-indigo-700 rounded-3xl p-8 text-white mb-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <Palette size={28} />
            </div>
            Visual Studio
          </h2>
          <p className="text-purple-100 text-lg opacity-90 max-w-xl">
            Create stunning, copyright-free diagrams and classroom illustrations in seconds using AI.
          </p>
        </div>
       </div>

       <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm mb-8 transition-all hover:shadow-md">
         <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 uppercase tracking-wider">What visual should I create?</label>
         <div className="flex gap-4">
           <input 
              type="text" 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
              placeholder="e.g. A diagram of the water cycle"
              className="flex-1 px-5 py-4 rounded-2xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-purple-500 transition-all font-medium"
           />
           <button onClick={handleGenerate} disabled={loading || !prompt} className="px-10 py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 active:scale-95">
             {loading ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
             Synthesize
           </button>
         </div>
       </div>
       
       {error && (
         <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl flex items-center gap-3 animate-in fade-in">
           <AlertCircle size={20} /> {error}
         </div>
       )}

       {imageUrl && (
         <div className="bg-white dark:bg-slate-800 p-4 rounded-[2.5rem] border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden animate-in zoom-in-95 duration-700 group">
            <div className="relative rounded-[2rem] overflow-hidden">
               <img src={imageUrl} alt="Generated visual aid" className="w-full h-auto" />
               <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button onClick={() => window.open(imageUrl, '_blank')} className="px-6 py-3 bg-white text-slate-900 rounded-xl font-bold flex items-center gap-2 hover:scale-105 transition-transform">
                     <Download size={20} /> Download Asset
                  </button>
               </div>
            </div>
         </div>
       )}
    </div>
  );
};

export default VisualStudio;
