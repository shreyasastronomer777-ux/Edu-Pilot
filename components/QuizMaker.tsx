import React, { useState, useEffect } from 'react';
import { generateQuizFromSource } from '../services/geminiService';
import { Quiz } from '../types';
import { HelpCircle, Loader2, Play, Download, Printer, CheckCircle2, ArrowLeft, Youtube, FileUp, Type, Wand2, History, Trash2, Activity, AlertCircle, Search, Filter } from 'lucide-react';

interface QuizMakerProps {
  onBack?: () => void;
}

const QuizMaker: React.FC<QuizMakerProps> = ({ onBack }) => {
  const [sourceType, setSourceType] = useState<'text' | 'file' | 'url'>('text');
  const [inputValue, setInputValue] = useState('');
  const [fileData, setFileData] = useState<{data: string, type: string} | null>(null);
  const [loading, setLoading] = useState(false);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [historySearchQuery, setHistorySearchQuery] = useState('');
  const [history, setHistory] = useState<Quiz[]>(() => {
    const saved = localStorage.getItem('svgpt_quiz_history');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('svgpt_quiz_history', JSON.stringify(history));
  }, [history]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setError(null);
    
    if (file) {
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        setError("Unsupported file format. Please upload a PDF, JPG, or PNG asset.");
        setFileData(null);
        return;
      }

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
    setError(null);
    try {
      const result = await generateQuizFromSource({
        type: sourceType,
        data: sourceType === 'file' ? fileData?.data || '' : inputValue,
        mimeType: sourceType === 'file' ? fileData?.type : undefined
      }, 10);
      setQuiz(result);
      // Check if a quiz with this title already exists to avoid duplicates
      if (!history.find(h => h.title === result.title)) {
        setHistory([result, ...history]);
      }
    } catch (e) {
      setError("Multimodal synthesis failed. Ensure link or document is valid.");
    } finally {
      setLoading(false);
    }
  };

  const deleteFromHistory = (title: string) => {
    setHistory(history.filter(q => q.title !== title));
  };

  const handlePrint = (quizToPrint: Quiz) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
        printWindow.document.write(`
          <html>
            <head><title>${quizToPrint.title}</title><style>body { font-family: sans-serif; padding: 40px; } .q { margin-bottom: 25px; }</style></head>
            <body>
              <h1>${quizToPrint.title}</h1>
              ${quizToPrint.questions.map((q, i) => `<div class="q"><strong>Q${i+1}: ${q.question}</strong><br/>${q.options.map(o => `○ ${o}<br/>`).join('')}</div>`).join('')}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
    }
  };

  const filteredHistory = history.filter(q => 
    q.title.toLowerCase().includes(historySearchQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto pb-10">
      <div className="mb-6 flex items-center justify-between">
         <button onClick={onBack} className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors group">
           <div className="p-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 group-hover:border-indigo-200">
              <ArrowLeft size={16} />
           </div>
           Back to Dashboard
         </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white/80 dark:bg-white/[0.03] backdrop-blur-3xl p-8 rounded-[2.5rem] border border-slate-200 dark:border-white/10 shadow-sm">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-3 tracking-tighter uppercase">
              <div className="p-2 bg-indigo-500/10 rounded-2xl"><Wand2 className="text-indigo-500" size={24} /></div>
              Evaluation Engine
            </h2>
            <div className="flex p-1 bg-slate-100 dark:bg-slate-900 rounded-2xl mb-8">
               {[{ id: 'text', label: 'Topic', icon: Type }, { id: 'file', label: 'PDF/Asset', icon: FileUp }, { id: 'url', label: 'Link', icon: Youtube }].map(tab => (
                 <button key={tab.id} onClick={() => setSourceType(tab.id as any)} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${sourceType === tab.id ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                   <tab.icon size={16} /> {tab.label}
                 </button>
               ))}
            </div>
            <div className="space-y-6">
               {sourceType !== 'file' ? (
                 <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder="Enter topic or URL..." className="w-full px-6 py-5 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-black/20 text-slate-900 dark:text-white outline-none font-bold text-sm" />
               ) : (
                 <label className="w-full border-2 border-dashed border-slate-200 dark:border-white/10 rounded-2xl p-12 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-all">
                    <FileUp size={40} className="text-slate-300 mb-4" />
                    <span className="text-xs font-black uppercase tracking-widest text-slate-500">{fileData ? 'Asset Staged' : 'Deploy Document'}</span>
                    <input type="file" className="hidden" accept=".pdf,image/jpeg,image/png" onChange={handleFileChange} />
                 </label>
               )}

               {error && (
                 <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl animate-in slide-in-from-top-2">
                    <AlertCircle size={18} className="text-red-500 flex-shrink-0" />
                    <p className="text-xs font-bold text-red-600 dark:text-red-400">{error}</p>
                 </div>
               )}

               <button onClick={handleGenerate} disabled={loading || (sourceType === 'file' ? !fileData : !inputValue)} className="w-full py-5 premium-gradient text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-lg active:scale-95 disabled:opacity-50">
                {loading ? <Loader2 className="animate-spin" size={20} /> : <Play size={20} />}
                Synthesize 10-Question Assessment
              </button>
            </div>
          </div>

          {quiz && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="flex flex-wrap items-center justify-between gap-4 bg-white/70 dark:bg-white/[0.03] p-6 rounded-[2rem] border border-slate-200 dark:border-white/10">
                <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{quiz.title}</h3>
                <button onClick={() => handlePrint(quiz)} className="px-5 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm hover:scale-105 transition-all">
                  <Printer size={16} className="inline mr-2" /> Print Evaluation
                </button>
              </div>
              <div className="space-y-4">
                {quiz.questions.map((q, i) => (
                  <div key={i} className="bg-white/50 dark:bg-white/[0.03] p-6 rounded-3xl border border-slate-100 dark:border-white/5">
                     <p className="font-bold text-slate-900 dark:text-white mb-4 flex items-start gap-4">
                       <span className="w-8 h-8 rounded-lg bg-indigo-500 text-white flex items-center justify-center text-xs flex-shrink-0">Q{i+1}</span>
                       {q.question}
                     </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
           <div className="flex items-center justify-between mb-4 px-2">
              <div className="flex items-center gap-2">
                <History size={18} className="text-indigo-500" />
                <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">Recent Evaluations</h3>
              </div>
              {history.length > 0 && (
                <div className="text-[8px] font-black uppercase tracking-widest text-slate-400">
                  {filteredHistory.length} Items
                </div>
              )}
           </div>

           <div className="px-2 mb-6">
              <div className="relative group">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={14} />
                 <input 
                   type="text" 
                   placeholder="Filter history..."
                   value={historySearchQuery}
                   onChange={(e) => setHistorySearchQuery(e.target.value)}
                   className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-[10px] font-bold outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
                 />
                 <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-30 group-focus-within:opacity-100 transition-opacity">
                    <Filter size={12} className="text-indigo-500" />
                 </div>
              </div>
           </div>

           <div className="space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
              {filteredHistory.length > 0 ? filteredHistory.map((q, i) => (
                 <div key={i} className="bg-white dark:bg-white/[0.03] p-5 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm hover:border-indigo-500/30 transition-all group animate-in slide-in-from-right-4 duration-300">
                    <div className="flex justify-between items-start mb-2">
                       <h4 className="text-xs font-black text-slate-900 dark:text-white truncate pr-4">{q.title}</h4>
                       <button onClick={() => deleteFromHistory(q.title)} className="text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={14}/></button>
                    </div>
                    <div className="flex items-center justify-between">
                       <span className="text-[8px] font-black uppercase text-slate-400">{q.questions.length} Questions</span>
                       <button onClick={() => setQuiz(q)} className="text-[8px] font-black uppercase text-indigo-500 hover:underline">Restore Workspace</button>
                    </div>
                 </div>
              )) : (
                 <div className="text-center py-20 bg-slate-50 dark:bg-white/5 rounded-[2.5rem] opacity-30 border-2 border-dashed border-slate-200 dark:border-white/10">
                    {historySearchQuery ? <Search size={48} className="mx-auto mb-4 opacity-20" /> : <HelpCircle size={48} className="mx-auto mb-4 opacity-20" />}
                    <p className="text-[10px] font-black uppercase tracking-widest px-4">
                      {historySearchQuery ? `No matching records for "${historySearchQuery}"` : 'Archive Empty'}
                    </p>
                 </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default QuizMaker;