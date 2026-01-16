
import React, { useState } from 'react';
import { checkHomework, gradeAnswerSheet } from '../services/geminiService';
import { CheckSquare, Loader2, RefreshCw, Upload, Image as ImageIcon, Type, X, FileText, FileCheck, BrainCircuit, Activity, Wand2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

type Mode = 'text' | 'scan';

const HomeworkChecker: React.FC = () => {
  const [mode, setMode] = useState<Mode>('text');
  const [assignment, setAssignment] = useState('');
  const [studentWork, setStudentWork] = useState('');
  const [studentImageFile, setStudentImageFile] = useState<string | null>(null);
  const [studentImageType, setStudentImageType] = useState<string>('');
  const [answerKeyFile, setAnswerKeyFile] = useState<string | null>(null);
  const [answerKeyType, setAnswerKeyType] = useState<string>('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleStudentImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            setStudentImageFile(event.target?.result as string);
            setStudentImageType(file.type);
            setFeedback(null);
        };
        reader.readAsDataURL(file);
    }
  };

  const handleAnswerKeyUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            setAnswerKeyFile(event.target?.result as string);
            setAnswerKeyType(file.type);
        };
        reader.readAsDataURL(file);
    }
  };

  const handleCheck = async () => {
    setLoading(true);
    setFeedback(null);
    try {
      let result;
      if (mode === 'text') {
        result = await checkHomework(assignment, studentWork);
      } else {
        result = await gradeAnswerSheet(
          { dataUri: studentImageFile!, mimeType: studentImageType },
          assignment,
          answerKeyFile ? { dataUri: answerKeyFile, mimeType: answerKeyType } : undefined
        );
      }
      setFeedback(result);
    } catch (err) {
      setFeedback("Error processing neural analysis.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto min-h-[calc(100vh-8rem)] flex flex-col md:flex-row gap-6 md:gap-8 animate-in fade-in duration-700 px-2 md:px-0">
      
      {/* Configuration Sidebar - Stacks on mobile */}
      <div className="w-full md:w-1/3 flex flex-col gap-6 md:overflow-y-auto md:pr-1 min-w-0 md:min-w-[320px]">
        <div className="bg-white dark:bg-[#0B1221] p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] border border-slate-200 dark:border-white/10 shadow-sm transition-all flex flex-col h-full">
          
          <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-10">
             <div className="p-2.5 md:p-3 bg-indigo-500/10 rounded-xl md:rounded-2xl">
                <BrainCircuit className="text-indigo-600 dark:text-indigo-400 w-6 h-6 md:w-7 md:h-7" />
             </div>
             <div>
                <h2 className="text-xl md:text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">Evaluator AI</h2>
                <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-slate-400">Professional Grading</p>
             </div>
          </div>

          <div className="flex p-1 bg-slate-50 dark:bg-white/5 rounded-xl md:rounded-2xl mb-6 md:mb-10 border border-slate-100 dark:border-white/5">
            <button 
              onClick={() => { setMode('text'); setFeedback(null); }}
              className={`flex-1 py-2.5 md:py-3.5 px-1 md:px-2 rounded-lg md:rounded-xl text-[8px] md:text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 md:gap-2 transition-all duration-300 ${mode === 'text' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-md md:shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <Type size={14} /> <span className="truncate">Digital</span>
            </button>
            <button 
              onClick={() => { setMode('scan'); setFeedback(null); }}
              className={`flex-1 py-2.5 md:py-3.5 px-1 md:px-2 rounded-lg md:rounded-xl text-[8px] md:text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 md:gap-2 transition-all duration-300 ${mode === 'scan' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-md md:shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <ImageIcon size={14} /> <span className="truncate">OCR Scan</span>
            </button>
          </div>
          
          <div className="space-y-6 md:space-y-8 flex-1">
            <div className="bg-slate-50/50 dark:bg-black/20 p-4 md:p-5 rounded-[1.5rem] md:rounded-[2rem] border border-slate-100 dark:border-white/5">
               <label className="block text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 md:mb-4 ml-1">Curriculum Criteria</label>
               <textarea 
                  value={assignment}
                  onChange={(e) => setAssignment(e.target.value)}
                  placeholder="Criteria or key notes..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B1221] text-slate-900 dark:text-white outline-none font-bold text-xs md:text-sm h-28 md:h-36 focus:ring-4 focus:ring-indigo-500/10 transition-all"
               />
            </div>

            {mode === 'text' ? (
              <div className="bg-slate-50/50 dark:bg-black/20 p-4 md:p-5 rounded-[1.5rem] md:rounded-[2rem] border border-slate-100 dark:border-white/5">
                 <label className="block text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 md:mb-4 ml-1">Student Work</label>
                 <textarea 
                    value={studentWork}
                    onChange={(e) => setStudentWork(e.target.value)}
                    placeholder="Submission text..."
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B1221] text-slate-900 dark:text-white outline-none font-bold text-xs md:text-sm h-40 md:h-52 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                 />
              </div>
            ) : (
              <div className="space-y-4 md:space-y-6">
                <div className="bg-slate-50/50 dark:bg-black/20 p-4 md:p-5 rounded-[1.5rem] md:rounded-[2rem] border border-slate-100 dark:border-white/5">
                  <label className="block text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 md:mb-4 ml-1">Student Answer Sheet</label>
                  <label className="flex flex-col items-center justify-center w-full h-32 md:h-40 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-[1.5rem] md:rounded-[2rem] cursor-pointer hover:bg-white dark:hover:bg-white/5 transition-all group overflow-hidden">
                    {studentImageFile ? (
                      <img src={studentImageFile} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center text-slate-400">
                        <Upload size={24} className="md:w-8 md:h-8 group-hover:text-indigo-500 transition-colors" />
                        <span className="text-[8px] md:text-[10px] mt-2 md:mt-3 uppercase font-black tracking-widest">Upload Asset</span>
                      </div>
                    )}
                    <input type="file" className="hidden" accept="image/*" onChange={handleStudentImageUpload} />
                  </label>
                </div>
                
                <div className="bg-slate-50/50 dark:bg-black/20 p-4 md:p-5 rounded-[1.5rem] md:rounded-[2rem] border border-slate-100 dark:border-white/5">
                  <label className="block text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 md:mb-4 ml-1">Reference Key (Opt.)</label>
                  <label className="flex flex-col items-center justify-center w-full h-20 md:h-24 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-xl md:rounded-2xl cursor-pointer hover:bg-white dark:hover:bg-white/5 transition-all group overflow-hidden">
                    {answerKeyFile ? (
                      <div className="flex items-center gap-2 text-green-500 font-bold text-[9px] md:text-xs uppercase">
                        <CheckSquare size={14} /> Asset Staged
                      </div>
                    ) : (
                      <div className="flex flex-col items-center text-slate-400">
                        <Upload size={16} className="md:w-5 md:h-5 group-hover:text-indigo-500 transition-colors" />
                        <span className="text-[7px] md:text-[9px] mt-1 md:mt-2 uppercase font-black tracking-widest">Upload Key</span>
                      </div>
                    )}
                    <input type="file" className="hidden" accept="image/*,application/pdf" onChange={handleAnswerKeyUpload} />
                  </label>
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 md:mt-10">
            <button 
              onClick={handleCheck}
              disabled={loading || (mode === 'text' ? !studentWork : !studentImageFile)}
              className="w-full py-4 md:py-5 bg-slate-900 dark:bg-white text-white dark:text-[#0B1221] rounded-2xl md:rounded-[1.8rem] font-black uppercase tracking-[0.2em] text-[10px] md:text-xs flex items-center justify-center gap-3 shadow-xl transition-all duration-500 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-30"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <Wand2 size={18} />}
              Synthesize Grade
            </button>
          </div>
        </div>
      </div>

      {/* Results Workspace - Expandable */}
      <div className="flex-1 bg-white dark:bg-[#0B1221] rounded-[2rem] md:rounded-[3.5rem] border border-slate-200 dark:border-white/10 shadow-sm flex flex-col overflow-hidden transition-all duration-700 min-h-[400px]">
        <div className="p-6 md:p-8 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/30 dark:bg-black/20">
          <div className="flex items-center gap-3 md:gap-4">
             <div className="w-1.5 md:w-2 h-5 md:h-6 premium-gradient rounded-full"></div>
             <span className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Evaluative Findings</span>
          </div>
          {feedback && (
            <button 
              onClick={() => setFeedback(null)} 
              className="p-2 md:p-3 bg-slate-100 dark:bg-white/5 hover:bg-red-500/10 hover:text-red-500 rounded-xl md:rounded-2xl transition-all text-slate-400"
            >
              <X size={16} />
            </button>
          )}
        </div>
        
        <div className="flex-1 p-6 md:p-12 overflow-y-auto custom-scrollbar prose prose-slate dark:prose-invert max-w-none">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center opacity-50 p-4 text-center">
              <div className="relative mb-6 md:mb-8">
                <Loader2 className="animate-spin text-indigo-500 w-12 h-12 md:w-16 md:h-16" />
                <BrainCircuit className="absolute inset-0 m-auto text-indigo-500/40 animate-pulse w-6 h-6 md:w-8 md:h-8" />
              </div>
              <p className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.4em] max-w-[200px] leading-relaxed">
                Analyzing Neural Patterns & Alignment...
              </p>
            </div>
          ) : feedback ? (
            <div className="animate-in fade-in slide-in-from-bottom-6 duration-1000">
               <ReactMarkdown 
                 components={{
                   h2: ({node, ...props}) => <h2 className="text-xl md:text-2xl font-black tracking-tighter uppercase border-b border-indigo-500/10 pb-3 md:pb-4 mb-6 md:mb-8" {...props} />,
                   strong: ({node, ...props}) => <strong className="font-black text-slate-900 dark:text-white" {...props} />,
                   li: ({node, ...props}) => <li className="text-sm md:text-base font-medium mb-2 md:mb-3" {...props} />
                 }}
               >
                 {feedback}
               </ReactMarkdown>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center opacity-10 py-10">
              <CheckSquare className="w-20 h-20 md:w-32 md:h-32" strokeWidth={1} />
              <p className="text-[10px] md:text-[12px] font-black uppercase mt-6 md:mt-8 tracking-[0.4em] md:tracking-[0.6em] text-center">Awaiting Analysis</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomeworkChecker;
