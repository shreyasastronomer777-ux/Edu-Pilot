
import React, { useState, useEffect } from 'react';
import { ExamPaper, ExamQuestion } from '../types';
import { Clock, ShieldCheck, ChevronRight, ChevronLeft, CheckCircle2, Award, Zap, LogOut, ArrowRight, BrainCircuit } from 'lucide-react';

interface GuestAssessmentProps {
  paper: ExamPaper;
  onFinish: () => void;
}

const GuestAssessment: React.FC<GuestAssessmentProps> = ({ paper, onFinish }) => {
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isFinished, setIsFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    // Parse duration string e.g. "120 mins"
    const mins = parseInt(paper.duration) || 60;
    setTimeLeft(mins * 60);
  }, [paper.duration]);

  useEffect(() => {
    if (timeLeft > 0 && !isFinished) {
      const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && !isFinished) {
      handleFinalSubmit();
    }
  }, [timeLeft, isFinished]);

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleFinalSubmit = () => {
    setIsFinished(true);
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs > 0 ? hrs + ':' : ''}${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const currentSection = paper.sections[currentSectionIndex];

  if (isFinished) {
    return (
      <div className="max-w-3xl mx-auto flex flex-col items-center justify-center min-h-[70vh] text-center animate-in zoom-in-95 duration-700">
        <div className="w-24 h-24 bg-emerald-500/10 rounded-[2.5rem] flex items-center justify-center text-emerald-500 mb-10 shadow-inner">
          <Award size={48} />
        </div>
        <h2 className="text-5xl font-[900] tracking-tighter uppercase mb-4">Submission Verified</h2>
        <p className="text-slate-500 dark:text-slate-400 font-medium text-xl mb-12 max-w-md">
          Your neural assessment for <span className="text-indigo-500 font-bold">{paper.subject}</span> has been archived and staged for educator review.
        </p>
        <div className="p-8 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[3rem] shadow-sm mb-12 w-full">
           <div className="flex justify-between items-center px-6">
              <div className="text-left">
                 <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-1">Attempt Quality</span>
                 <span className="text-xl font-black uppercase text-emerald-500">EXCELLENT</span>
              </div>
              <div className="w-px h-10 bg-slate-100 dark:bg-white/5"></div>
              <div className="text-right">
                 <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-1">Time Logged</span>
                 <span className="text-xl font-black uppercase text-indigo-500">{paper.duration}</span>
              </div>
           </div>
        </div>
        <button 
          onClick={onFinish}
          className="px-12 py-6 premium-gradient text-white rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-2xl active:scale-95 transition-all flex items-center gap-3"
        >
          Exit Assessment Core <LogOut size={18} />
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-10 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row justify-between items-end md:items-center gap-6 pb-10 border-b border-slate-200 dark:border-white/10">
        <div className="flex items-center gap-5">
           <div className="p-4 bg-indigo-600 text-white rounded-[1.8rem] shadow-xl">
              <BrainCircuit size={32} />
           </div>
           <div>
              <h1 className="text-4xl font-[900] tracking-tighter uppercase leading-none">{paper.title}</h1>
              <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.3em] mt-2">Institutional Exam Mode Active</p>
           </div>
        </div>
        <div className="flex items-center gap-4 bg-slate-900 text-white px-8 py-4 rounded-[1.8rem] shadow-2xl">
           <Clock size={24} className="text-rose-400 animate-pulse" />
           <span className="text-3xl font-mono font-black tabular-nums">{formatTime(timeLeft)}</span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        <div className="lg:col-span-1 space-y-4">
           <div className="p-6 bg-white dark:bg-white/[0.03] rounded-[2.5rem] border border-slate-200 dark:border-white/10 shadow-sm">
              <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest block mb-6">Assessment Grid</span>
              <div className="space-y-2">
                 {paper.sections.map((s, i) => (
                    <button 
                      key={i}
                      onClick={() => setCurrentSectionIndex(i)}
                      className={`w-full text-left p-4 rounded-2xl border transition-all text-xs font-black uppercase tracking-tight flex justify-between items-center ${currentSectionIndex === i ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl' : 'bg-slate-50 dark:bg-black/20 border-slate-100 dark:border-white/5 text-slate-500 hover:border-indigo-300'}`}
                    >
                       {s.name}
                       {currentSectionIndex === i && <ChevronRight size={14} />}
                    </button>
                 ))}
              </div>
           </div>
           <button 
             onClick={handleFinalSubmit}
             className="w-full py-5 bg-rose-600 text-white rounded-[2rem] font-black uppercase tracking-widest text-[10px] shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3"
           >
              Final Submit <CheckCircle2 size={16} />
           </button>
        </div>

        <div className="lg:col-span-3">
           <div className="bg-white dark:bg-[#0B1221] rounded-[4rem] border border-slate-200 dark:border-white/10 shadow-sm p-12 md:p-16 min-h-[600px] flex flex-col">
              <div className="mb-12">
                 <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 text-indigo-500 text-[9px] font-black uppercase rounded-full mb-4">
                    <Zap size={10} /> Section {currentSectionIndex + 1}
                 </div>
                 <h2 className="text-3xl font-black uppercase tracking-tight mb-2">{currentSection.name}</h2>
                 <p className="text-slate-400 font-medium text-lg italic">{currentSection.description}</p>
              </div>

              <div className="space-y-16 flex-1">
                 {currentSection.questions.map((q, qi) => (
                    <div key={qi} className="group">
                       <div className="flex items-start gap-8">
                          <div className="w-12 h-12 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-2xl flex items-center justify-center text-lg font-black shadow-lg flex-shrink-0">
                             {qi + 1}
                          </div>
                          <div className="flex-1 space-y-8">
                             <div className="flex justify-between items-start gap-4">
                                <p className="text-2xl font-bold leading-tight">{q.question}</p>
                                <span className="text-xs font-black text-slate-400 bg-slate-100 dark:bg-white/5 px-3 py-1 rounded">[{q.marks}M]</span>
                             </div>

                             {q.options ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                   {q.options.map((opt, oi) => (
                                      <button 
                                        key={oi}
                                        onClick={() => handleAnswerChange(`${currentSectionIndex}-${qi}`, opt)}
                                        className={`w-full text-left p-6 rounded-3xl border-2 transition-all font-bold text-sm ${answers[`${currentSectionIndex}-${qi}`] === opt ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl scale-[1.02]' : 'bg-white dark:bg-black/20 border-slate-100 dark:border-white/5 text-slate-700 dark:text-slate-300 hover:border-indigo-400'}`}
                                      >
                                         {opt}
                                      </button>
                                   ))}
                                </div>
                             ) : (
                                <textarea 
                                  value={answers[`${currentSectionIndex}-${qi}`] || ''}
                                  onChange={(e) => handleAnswerChange(`${currentSectionIndex}-${qi}`, e.target.value)}
                                  placeholder="Formulate your logical response here..."
                                  className="w-full h-48 p-8 rounded-[2.5rem] bg-slate-50 dark:bg-black/40 border border-slate-100 dark:border-white/5 outline-none focus:ring-8 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium text-lg shadow-inner resize-none"
                                />
                             )}
                          </div>
                       </div>
                    </div>
                 ))}
              </div>

              <div className="mt-20 pt-10 border-t border-slate-100 dark:border-white/5 flex justify-between">
                 <button 
                   disabled={currentSectionIndex === 0}
                   onClick={() => setCurrentSectionIndex(prev => prev - 1)}
                   className="flex items-center gap-3 px-8 py-4 bg-slate-100 dark:bg-white/5 text-slate-500 rounded-2xl font-black uppercase text-[10px] hover:bg-slate-200 transition-all disabled:opacity-20"
                 >
                    <ChevronLeft size={18} /> Previous Section
                 </button>
                 <button 
                   disabled={currentSectionIndex === paper.sections.length - 1}
                   onClick={() => setCurrentSectionIndex(prev => prev + 1)}
                   className="flex items-center gap-3 px-10 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black uppercase text-[10px] shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-20"
                 >
                    Next Segment <ChevronRight size={18} />
                 </button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default GuestAssessment;
