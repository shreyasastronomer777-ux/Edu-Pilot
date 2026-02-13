
import React, { useState, useEffect } from 'react';
import { generateQuizFromSource } from '../services/geminiService';
import { Quiz } from '../types';
import { HelpCircle, Loader2, Play, Download, Printer, CheckCircle2, ArrowLeft, Youtube, FileUp, Type, Wand2, History, Trash2, Activity, AlertCircle, Search, Filter, FileJson, FileText, Check, ChevronDown, FileType, GraduationCap, User, Edit3, Upload, FileDown } from 'lucide-react';

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
  
  // Customization States
  const [customTitle, setCustomTitle] = useState('');
  const [studentName, setStudentName] = useState('');

  const [history, setHistory] = useState<Quiz[]>(() => {
    const saved = localStorage.getItem('svgpt_quiz_history');
    return saved ? (JSON.parse(saved) as Quiz[]).filter(q => q && q.title) : [];
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
    setCustomTitle('');
    try {
      const result = await generateQuizFromSource({
        type: sourceType,
        data: sourceType === 'file' ? fileData?.data || '' : inputValue,
        mimeType: sourceType === 'file' ? fileData?.type : undefined
      }, 10);
      setQuiz(result);
      setCustomTitle(result?.title || 'Synthesized Quiz'); 
      if (result && result.title && !history.find(h => h.title === result.title)) {
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

  const [showDeploymentHub, setShowDeploymentHub] = useState(false);
  const [copied, setCopied] = useState(false);

  const exportPDF = (type: 'assessment' | 'answer-key') => {
    if (!quiz) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const isAnswerKey = type === 'answer-key';
    const activeTitle = customTitle || quiz.title || 'Academic Assessment';

    printWindow.document.write(`
      <html>
        <head>
          <title>${activeTitle} - ${isAnswerKey ? 'Answer Key' : 'Assessment'}</title>
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
            <h1>${activeTitle}</h1>
            <div style="font-size: 10px; font-weight: 800; color: #6366f1;">REF: SV-${Math.random().toString(36).substr(2, 6).toUpperCase()}</div>
          </div>
          <div class="info-box">
            <div>Student Name: ${studentName || '____________________________________'}</div>
            <div>Date: ____________________</div>
          </div>
          ${quiz.questions?.map((q, i) => `
            <div class="q">
              <div class="q-header">
                <div class="q-num">${i + 1}</div>
                <div class="q-text">${q.question}</div>
              </div>
              <div class="options">
                ${q.options?.map(opt => `
                  <div class="opt ${isAnswerKey && opt === q.correctAnswer ? 'correct' : ''}">
                    ${isAnswerKey && opt === q.correctAnswer ? '✓ ' : '□ '} ${opt}
                  </div>
                `).join('')}
              </div>
              ${isAnswerKey ? `<div class="explanation"><strong>Rationale:</strong> ${q.explanation}</div>` : ''}
            </div>
          `).join('') || '<div class="italic">No question data available.</div>'}
          <div class="footer">Synthesized by SVGPT Neural Engine • Verified Academic Output</div>
          <script>window.onload = () => { window.print(); window.close(); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const downloadJSON = () => {
    if (!quiz) return;
    const activeTitle = customTitle || quiz.title || 'Synthesized Quiz';
    const exportData = { ...quiz, title: activeTitle, studentIdentity: studentName };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quiz-${activeTitle.toLowerCase().replace(/\s+/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto pb-20 animate-in fade-in duration-700">
      <div className="mb-8 flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors group">
          <div className="p-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 group-hover:border-indigo-200 shadow-sm">
            <ArrowLeft size={16} />
          </div>
          Back to Dashboard
        </button>
        <div className="flex items-center gap-3">
           <div className="px-4 py-1.5 bg-indigo-500/10 text-indigo-500 rounded-full border border-indigo-500/20 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
             <Activity size={12} /> Neural Synthesis Active
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white dark:bg-[#0B1221] p-10 rounded-[3.5rem] border border-slate-200 dark:border-white/10 shadow-sm">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 bg-orange-500/10 rounded-2xl flex items-center justify-center text-orange-500 shadow-inner">
                <GraduationCap size={32} />
              </div>
              <div>
                <h2 className="text-3xl font-black tracking-tighter uppercase text-slate-900 dark:text-white">Quiz Architect</h2>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Standardized Assessment Synthesis</p>
              </div>
            </div>

            <div className="flex p-1 bg-slate-100 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 w-fit mb-8">
              <button onClick={() => setSourceType('text')} className={`px-8 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${sourceType === 'text' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-lg' : 'text-slate-400'}`}>Text Content</button>
              <button onClick={() => setSourceType('file')} className={`px-8 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${sourceType === 'file' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-lg' : 'text-slate-400'}`}>Neural Asset</button>
            </div>

            <div className="space-y-6">
              {sourceType === 'text' ? (
                <textarea 
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Paste lecture notes or topic details..."
                  className="w-full h-48 p-6 bg-slate-50 dark:bg-black/20 rounded-3xl border border-slate-200 dark:border-white/10 text-sm font-medium outline-none focus:ring-4 focus:ring-orange-500/10 transition-all resize-none shadow-inner"
                />
              ) : (
                <div onClick={() => document.getElementById('quiz-file-upload')?.click()} className="w-full h-48 border-4 border-dashed border-slate-100 dark:border-white/5 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-slate-50 transition-all">
                  {fileData ? <FileText size={48} className="text-indigo-500" /> : <Upload size={40} className="text-slate-200" />}
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{fileData ? 'Asset Loaded' : 'Upload PDF/IMG'}</span>
                  <input id="quiz-file-upload" type="file" className="hidden" accept=".pdf,image/*" onChange={handleFileChange} />
                </div>
              )}

              <button 
                onClick={handleGenerate}
                disabled={loading || (sourceType === 'text' ? !inputValue : !fileData)}
                className="w-full py-5 premium-gradient text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <Wand2 size={20} />}
                Synthesize Assessment
              </button>
            </div>
          </div>

          {quiz && (
            <div className="bg-white dark:bg-[#0B1221] p-10 rounded-[3.5rem] border border-slate-200 dark:border-white/10 shadow-2xl animate-in slide-in-from-bottom-6">
               <div className="flex flex-wrap items-center justify-between gap-6 mb-10 pb-6 border-b border-slate-100 dark:border-white/5">
                  <div className="flex items-center gap-4">
                    <CheckCircle2 className="text-green-500" size={24} />
                    <h3 className="text-xl font-black tracking-tight uppercase text-slate-900 dark:text-white">{quiz.title || "Synthesized Result"}</h3>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => exportPDF('assessment')} className="p-3 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl hover:bg-indigo-600 hover:text-white transition-all" title="Export PDF"><FileDown size={18}/></button>
                    <button onClick={() => exportPDF('assessment')} className="p-3 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-indigo-500 hover:text-white transition-all" title="Print Assessment"><Printer size={18}/></button>
                    <button onClick={downloadJSON} className="p-3 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-indigo-500 hover:text-white transition-all" title="Download JSON"><Download size={18}/></button>
                  </div>
               </div>

               <div className="space-y-8">
                  {quiz.questions?.map((q, i) => (
                    <div key={i} className="p-6 bg-slate-50 dark:bg-black/20 rounded-2xl border border-slate-100 dark:border-white/5">
                       <p className="font-bold text-slate-900 dark:text-white mb-4">Q{i+1}: {q.question}</p>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {q.options?.map((opt, oi) => (
                            <div key={oi} className={`p-3 rounded-lg border text-xs font-bold ${opt === q.correctAnswer ? 'bg-green-50 dark:bg-green-900/20 border-green-200 text-green-700' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-white/5 text-slate-500'}`}>
                               {opt}
                            </div>
                          ))}
                       </div>
                    </div>
                  )) || <div className="italic text-slate-400">No question modules synthesized.</div>}
               </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
           <div className="flex items-center gap-2 mb-4 px-2">
              <History size={18} className="text-orange-500" />
              <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">Quiz Archive</h3>
           </div>
           <div className="space-y-4 max-h-[800px] overflow-y-auto custom-scrollbar pr-2">
              {history.map((item, idx) => (
                 <div key={idx} onClick={() => setQuiz(item)} className="bg-white dark:bg-white/[0.03] p-5 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm hover:border-orange-500/30 transition-all cursor-pointer group">
                    <div className="flex justify-between items-start mb-2">
                       <h4 className="text-xs font-black text-slate-900 dark:text-white truncate pr-4">{item.title || "Untitled Quiz"}</h4>
                       <button onClick={(e) => { e.stopPropagation(); deleteFromHistory(item.title); }} className="text-slate-300 hover:text-red-500"><Trash2 size={14}/></button>
                    </div>
                    <span className="text-[8px] font-black uppercase text-slate-400">{item.questions?.length || 0} Questions Synthesized</span>
                 </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};

export default QuizMaker;
