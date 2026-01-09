
import React, { useState } from 'react';
import { summarizeText } from '../services/geminiService';
import { FileText, Loader2, Sparkles, Copy, RefreshCw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const AISummarizer: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSummarize = async () => {
    if (!inputText) return;
    setLoading(true);
    setSummary('');
    try {
      const result = await summarizeText(inputText);
      setSummary(result);
    } catch (error) {
      console.error(error);
      setSummary("**Error generating summary.** Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto h-[calc(100vh-6rem)] flex flex-col md:flex-row gap-6">
       <div className="w-full md:w-1/2 flex flex-col">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <FileText className="text-sky-600 dark:text-sky-400" /> Source Text
          </h2>
          <div className="flex-1 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-4 flex flex-col">
             <textarea 
               value={inputText}
               onChange={(e) => setInputText(e.target.value)}
               placeholder="Paste your lecture notes, essay draft, or article text here..."
               className="flex-1 w-full resize-none bg-transparent border-none outline-none text-slate-800 dark:text-slate-200 placeholder-slate-400 p-2"
             />
             <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                <span className="text-xs text-slate-400">{inputText.length} characters</span>
                <button 
                  onClick={handleSummarize}
                  disabled={!inputText || loading}
                  className="px-6 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-medium flex items-center gap-2 disabled:opacity-50 transition-colors shadow-sm"
                >
                  {loading ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
                  Summarize
                </button>
             </div>
          </div>
       </div>

       <div className="w-full md:w-1/2 flex flex-col">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <Sparkles className="text-amber-500" /> AI Summary
          </h2>
          <div className="flex-1 bg-sky-50 dark:bg-slate-800/50 rounded-2xl border border-sky-100 dark:border-slate-700 p-6 overflow-y-auto relative">
             {loading ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-sky-600 dark:text-sky-400 opacity-70">
                   <Loader2 size={40} className="animate-spin mb-4" />
                   <p className="animate-pulse font-medium">Analyzing text & extracting key points...</p>
                </div>
             ) : summary ? (
               <div className="prose prose-slate dark:prose-invert max-w-none">
                  <ReactMarkdown>{summary}</ReactMarkdown>
                  <div className="flex gap-2 mt-6 pt-4 border-t border-sky-200 dark:border-slate-700">
                     <button onClick={() => navigator.clipboard.writeText(summary)} className="text-xs flex items-center gap-1 text-slate-500 hover:text-sky-600 dark:text-slate-400 dark:hover:text-sky-400 transition-colors">
                        <Copy size={14} /> Copy
                     </button>
                     <button onClick={handleSummarize} className="text-xs flex items-center gap-1 text-slate-500 hover:text-sky-600 dark:text-slate-400 dark:hover:text-sky-400 transition-colors">
                        <RefreshCw size={14} /> Regenerate
                     </button>
                  </div>
               </div>
             ) : (
               <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 opacity-60">
                  <FileText size={48} className="mb-4" />
                  <p>Summary will appear here.</p>
               </div>
             )}
          </div>
       </div>
    </div>
  );
};

export default AISummarizer;
