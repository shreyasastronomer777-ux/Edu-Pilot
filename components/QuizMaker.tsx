
import React, { useState } from 'react';
import { generateQuiz } from '../services/geminiService';
import { Quiz } from '../types';
import { HelpCircle, Loader2, Play, Download, Printer, CheckCircle2, ArrowLeft } from 'lucide-react';

interface QuizMakerProps {
  onBack?: () => void;
}

const QuizMaker: React.FC<QuizMakerProps> = ({ onBack }) => {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [quiz, setQuiz] = useState<Quiz | null>(null);

  const handleGenerate = async () => {
    if (!topic) return;
    setLoading(true);
    setQuiz(null);
    try {
      const result = await generateQuiz(topic, 'General', 5);
      setQuiz(result);
    } catch (e) {
      alert("Failed to generate quiz. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    if (!quiz) return;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
        const styles = `<style>body { font-family: sans-serif; line-height: 1.6; padding: 20px; }</style>`;
        printWindow.document.write(`<html><head>${styles}</head><body><h1>${quiz.title}</h1></body></html>`);
        printWindow.document.close();
        setTimeout(() => printWindow.print(), 500);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-10">
      {/* Module Navigation */}
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
      </div>

      <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 mb-8 transition-colors">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
          <HelpCircle className="text-indigo-600 dark:text-indigo-400" />
          AI Quiz Generator
        </h2>
        
        <div className="flex gap-4">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Enter a topic..."
            className="flex-1 px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none text-lg transition-all"
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
          />
          <button
            onClick={handleGenerate}
            disabled={loading || !topic}
            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold flex items-center gap-2 transition-all disabled:opacity-50 shadow-md"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Play size={20} />}
            Generate
          </button>
        </div>
      </div>

      {quiz && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">{quiz.title}</h3>
            <div className="flex items-center gap-2">
               <button onClick={handlePrint} className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 border rounded-lg text-sm font-medium"><Download size={18} /> PDF</button>
               <button onClick={handlePrint} className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 border rounded-lg text-sm font-medium"><Printer size={18} /> Print</button>
            </div>
          </div>
          {/* Questions list... */}
        </div>
      )}
    </div>
  );
};

export default QuizMaker;
