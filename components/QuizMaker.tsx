import React, { useState, useEffect } from 'react';
import { generateQuizFromSource } from '../services/geminiService';
import { Quiz } from '../types';
import { HelpCircle, Loader2, Play, Download, Printer, CheckCircle2, ArrowLeft, Youtube, FileUp, Type, Wand2, History, Trash2, Activity, AlertCircle, Search, Filter, FileJson, FileText, Check, ChevronDown, FileType, GraduationCap } from 'lucide-react';

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

  // Export State
  const [showDeploymentHub, setShowDeploymentHub] = useState(false);
  const [copied, setCopied] = useState(false);

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

  const exportPDF = (type: 'assessment' | 'answer-key') => {
    if (!quiz) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const isAnswerKey = type === 'answer-key';

    printWindow.document.write(`
      <html>
        <head>
          <title>${quiz.title} - ${isAnswerKey ? 'Answer Key' : 'Assessment'}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;700;800&display=swap');
            body { font-family: 'Plus Jakarta Sans', sans-serif; padding: 60px; color: #1e293b; max-width: 800px; margin: 0 auto; line-height: 1.5; }
            .header { border-bottom: 3px solid #6366f1; padding-bottom: 25px; margin-bottom: 40px; display: flex; justify-content: space-between; align-items: flex-end; }
            .header h1 { margin: 0; font-size: 24px; font-weight: 800; text-transform: uppercase; letter-spacing: -0.5px; }
            .badge { background: #6366f1; color: white; padding: 4px 12px; border-radius: 4px; font-size: 10px; font-weight: 800; text-transform: uppercase; margin-bottom: 10px; display: inline-block; }
            .info-box { border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 40px; display: grid; grid-template-columns: 1.5fr 1fr; gap: 20px; font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; }
            .q { margin-bottom: 35px; page-break-inside: avoid; }
            .q-header { display: flex; gap: 15px; margin-bottom: 15px; }
            .q-num { background: #1e293b; color: white; width: 28px; height: 28px; border-radius: 6px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 12px; font-weight: 800; }
            .q-text { font-weight: 700; font-size: 15px; color: #0f172a; padding-top: 3px; }
            .options { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; padding-left: 43px; }
            .opt { border: 1.5px solid #e2e8f0; padding: 10px 15px; border-radius: 8px; font-size: 13px; font-weight: 500; }
            .opt.correct { border-color: #10b981; background: #f0fdf4; color: #065f46; font-weight: 700; }
            .explanation { margin-top: 10px; padding: 12px 15px; background: #f8fafc; border-radius: 8px; border-left: 4px solid #6366f1; font-size: 12px; color: #475569; font-style: italic; }
            .footer { margin-top: 60px; border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center; font-size: 10px; color: #94a3b8; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; }
            @media print { .options { grid-template-columns: 1fr; } }
          </style>
        </head>
        <body>
          <div class="badge">${isAnswerKey ? 'Master Key' : 'Formal Assessment'}</div>
          <div class="header">
            <h1>${quiz.title}</h1>
            <div style="font-size: 10px; font-weight: 800; color: #6366f1;">REF: SV-${Math.random().toString(36).substr(2, 6).toUpperCase()}</div>
          </div>
          <div class="info-box">
            <div>Student Name: ____________________________________</div>
            <div>Date: ____________________</div>
          </div>
          ${quiz.questions.map((q, i) => `
            <div class="q">
              <div class="q-header">
                <div class="q-num">${i + 1}</div>
                <div class="q-text">${q.question}</div>
              </div>
              <div class="options">
                ${q.options.map(opt => `
                  <div class="opt ${isAnswerKey && opt === q.correctAnswer ? 'correct' : ''}">
                    ${isAnswerKey && opt === q.correctAnswer ? '✓ ' : '□ '} ${opt}
                  </div>
                `).join('')}
              </div>
              ${isAnswerKey ? `<div class="explanation"><strong>Rationale:</strong> ${q.explanation}</div>` : ''}
            </div>
          `).join('')}
          <div class="footer">Synthesized by SVGPT Neural Engine • Verified Academic Output</div>
          <script>window.onload = () => { window.print(); window.close(); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const downloadJSON = () => {
    if (!quiz) return;
    const blob = new Blob([JSON.stringify(quiz, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quiz-${quiz.title.toLowerCase().replace(/\s+/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = () => {
    if (!quiz) return;
    const text = `Quiz: ${quiz.title}\n\n` + quiz.questions.map((q, i) => 
      `${i+1}. ${q.question}\n` + q.options.map((o, idx) => `   ${String.fromCharCode(65+idx)}) ${o}`).join('\n')
    ).join('\n\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
              <div className="flex flex-wrap items-center justify-between gap-6 bg-white dark:bg-white/[0.04] p-6 md:p-8 rounded-[2.5rem] border border-slate-200 dark:border-white/10 shadow-xl backdrop-blur-xl">
                <div className="flex flex-col">
                  <span className="text-[9px] font-black uppercase tracking-[0.4em] text-indigo-500 mb-2">Neural Resolution</span>
                  <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase leading-tight">{quiz.title}</h3>
                </div>
                
                <div className="relative">
                  <button 
                    onClick={() => setShowDeploymentHub(!showDeploymentHub)}
                    className="px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 shadow-xl hover:scale-105 transition-all"
                  >
                    <Download size={18} /> DEPLOYMENT HUB
                  </button>
                  
                  {showDeploymentHub && (
                    <div className="absolute top-full right-0 mt-3 w-72 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-[2rem] shadow-[0_30px_60px_-12px_rgba(0,0,0,0.25)] z-50 p-4 animate-in slide-in-from-top-2">
                       <div className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 px-3">Asset Distribution</div>
                       <div className="space-y-1">
                          <button onClick={() => { exportPDF('assessment'); setShowDeploymentHub(false); }} className="w-full text-left p-3 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-3">
                             <Printer size={16} className="text-indigo-500" /> Assessment PDF
                          </button>
                          <button onClick={() => { exportPDF('answer-key'); setShowDeploymentHub(false); }} className="w-full text-left p-3 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-3">
                             <GraduationCap size={16} className="text-emerald-500" /> Answer Key PDF
                          </button>
                          <button onClick={() => { downloadJSON(); setShowDeploymentHub(false); }} className="w-full text-left p-3 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-3">
                             <FileJson size={16} className="text-indigo-500" /> Neural JSON Data
                          </button>
                          <button onClick={() => { copyToClipboard(); setShowDeploymentHub(false); }} className="w-full text-left p-3 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-3">
                             {copied ? <Check size={16} className="text-green-500" /> : <CheckCircle2 size={16} className="text-indigo-500" />} Copy Text Content
                          </button>
                       </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                {quiz.questions.map((q, i) => (
                  <div key={i} className="bg-white/50 dark:bg-white/[0.03] p-8 rounded-[2.5rem] border border-slate-100 dark:border-white/5 hover:border-indigo-500/20 transition-colors shadow-sm group">
                     <div className="flex items-start gap-4 mb-6">
                       <span className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center text-sm font-black flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform">Q{i+1}</span>
                       <p className="text-lg font-bold text-slate-900 dark:text-white leading-relaxed pt-1">{q.question}</p>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-14">
                        {q.options.map((opt, idx) => (
                          <div key={idx} className={`p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 text-sm font-bold transition-all ${opt === q.correctAnswer ? 'text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900/50 bg-indigo-50/50 dark:bg-indigo-900/10' : 'text-slate-600 dark:text-slate-300'}`}>
                             {opt}
                          </div>
                        ))}
                     </div>
                     <div className="mt-6 pl-14 pt-4 border-t border-slate-100 dark:border-white/5">
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 italic">
                          <span className="font-black uppercase tracking-widest text-[9px] text-indigo-500 not-italic mr-2">Rationale:</span> 
                          {q.explanation}
                        </p>
                     </div>
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