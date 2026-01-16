
import React, { useState } from 'react';
import { generateQuizFromSource } from '../services/geminiService';
import { Quiz } from '../types';
import { HelpCircle, Loader2, Play, Download, Printer, CheckCircle2, ArrowLeft, Youtube, FileUp, Type, Wand2 } from 'lucide-react';

interface QuizMakerProps {
  onBack?: () => void;
}

const QuizMaker: React.FC<QuizMakerProps> = ({ onBack }) => {
  const [sourceType, setSourceType] = useState<'text' | 'file' | 'url'>('text');
  const [inputValue, setInputValue] = useState('');
  const [fileData, setFileData] = useState<{data: string, type: string} | null>(null);
  const [loading, setLoading] = useState(false);
  const [quiz, setQuiz] = useState<Quiz | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFileData({ data: event.target?.result as string, type: file.type });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    setQuiz(null);
    try {
      const result = await generateQuizFromSource({
        type: sourceType,
        data: sourceType === 'file' ? fileData?.data || '' : inputValue,
        mimeType: sourceType === 'file' ? fileData?.type : undefined
      }, 10);
      setQuiz(result);
    } catch (e) {
      alert("Multimodal synthesis failed. Ensure link or document is valid.");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    if (!quiz) return;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>${quiz.title}</title>
              <style>
                body { font-family: Inter, sans-serif; padding: 50px; line-height: 1.6; }
                .q { margin-bottom: 30px; }
                .o { margin-left: 20px; }
              </style>
            </head>
            <body>
              <h1>${quiz.title}</h1>
              ${quiz.questions.map((q, i) => `
                <div class="q">
                  <p><strong>Q${i+1}: ${q.question}</strong></p>
                  ${q.options.map(o => `<div class="o">○ ${o}</div>`).join('')}
                </div>
              `).join('')}
            </body>
          </html>
        `);
        printWindow.document.close();
        setTimeout(() => printWindow.print(), 500);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-10">
      <div className="mb-6 flex items-center justify-between">
         <button onClick={onBack} className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors group">
           <div className="p-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 group-hover:border-indigo-200">
              <ArrowLeft size={16} />
           </div>
           Back to Dashboard
         </button>
      </div>

      <div className="bg-white/80 dark:bg-white/[0.03] backdrop-blur-3xl p-8 rounded-[2.5rem] border border-slate-200 dark:border-white/10 shadow-sm mb-8 transition-all">
        <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-3 tracking-tighter uppercase">
          <div className="p-2 bg-indigo-500/10 rounded-2xl">
            <Wand2 className="text-indigo-500" size={24} />
          </div>
          Multimodal Quiz Engine
        </h2>
        
        <div className="flex p-1 bg-slate-100 dark:bg-slate-900 rounded-2xl mb-8">
           {[
             { id: 'text', label: 'Conceptual Topic', icon: Type },
             { id: 'file', label: 'Document/PDF', icon: FileUp },
             { id: 'url', label: 'YouTube/Link', icon: Youtube }
           ].map(tab => (
             <button 
               key={tab.id}
               onClick={() => { setSourceType(tab.id as any); setQuiz(null); }}
               className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${sourceType === tab.id ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
             >
               <tab.icon size={16} /> {tab.label}
             </button>
           ))}
        </div>

        <div className="space-y-6">
           {sourceType === 'text' && (
             <input
               type="text"
               value={inputValue}
               onChange={(e) => setInputValue(e.target.value)}
               placeholder="Enter an academic topic (e.g. Plate Tectonics)..."
               className="w-full px-6 py-5 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-black/20 text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-sm"
             />
           )}
           {sourceType === 'url' && (
             <input
               type="text"
               value={inputValue}
               onChange={(e) => setInputValue(e.target.value)}
               placeholder="Paste YouTube or academic article URL..."
               className="w-full px-6 py-5 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-black/20 text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-sm"
             />
           )}
           {sourceType === 'file' && (
             <label className="w-full border-2 border-dashed border-slate-200 dark:border-white/10 rounded-2xl p-12 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 transition-all group">
                <FileUp size={40} className="text-slate-300 group-hover:text-indigo-500 mb-4 transition-colors" />
                <span className="text-xs font-black uppercase tracking-widest text-slate-500">{fileData ? 'File Loaded' : 'Upload Asset (PDF/Image)'}</span>
                <input type="file" accept="image/*,application/pdf" className="hidden" onChange={handleFileChange} />
             </label>
           )}

           <button
            onClick={handleGenerate}
            disabled={loading || (sourceType === 'file' ? !fileData : !inputValue)}
            className="w-full py-5 premium-gradient text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all shadow-lg active:scale-95 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Play size={20} />}
            {loading ? 'Synthesizing Multimodal Quiz...' : 'Generate 10-Question Evaluation'}
          </button>
        </div>
      </div>

      {quiz && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex flex-wrap items-center justify-between gap-4 bg-white/70 dark:bg-white/[0.03] p-6 rounded-[2rem] border border-slate-200 dark:border-white/10">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1">Synthesized Assessment</span>
              <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{quiz.title}</h3>
            </div>
            <div className="flex items-center gap-3">
               <button onClick={handlePrint} className="px-5 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm hover:scale-105 transition-all">
                 <Printer size={16} className="inline mr-2" /> Print Evaluation
               </button>
            </div>
          </div>
          
          <div className="space-y-4">
            {quiz.questions.map((q, i) => (
              <div key={i} className="bg-white/50 dark:bg-white/[0.03] p-6 rounded-3xl border border-slate-100 dark:border-white/5">
                 <p className="font-bold text-slate-900 dark:text-white mb-4 flex items-start gap-4">
                   <span className="w-8 h-8 rounded-lg bg-indigo-500 text-white flex items-center justify-center text-xs flex-shrink-0">Q{i+1}</span>
                   {q.question}
                 </p>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-12">
                   {q.options.map((opt, oi) => (
                     <div key={oi} className={`p-3 rounded-xl border text-sm font-medium ${opt === q.correctAnswer ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300' : 'bg-slate-50 dark:bg-black/20 border-slate-100 dark:border-white/5 text-slate-500'}`}>
                        {opt}
                     </div>
                   ))}
                 </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizMaker;
