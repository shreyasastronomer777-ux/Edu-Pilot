
import React, { useState, useEffect, useRef } from 'react';
import { generateQuiz } from '../services/geminiService';
import { Quiz, QuizQuestion } from '../types';
import { BrainCircuit, Loader2, Play, CheckCircle2, XCircle, ArrowRight, ArrowLeft, RotateCcw, ChevronLeft, ChevronRight, Zap, Trophy, MessageSquare } from 'lucide-react';

const StudentQuiz: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  
  // Carousel & Quiz State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<(string | null)[]>([]);
  const [quizComplete, setQuizComplete] = useState(false);
  const [finalScore, setFinalScore] = useState(0);

  const handleGenerate = async () => {
    if (!topic) return;
    setLoading(true);
    setQuiz(null);
    setQuizComplete(false);
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setFinalScore(0);
    
    try {
      const result = await generateQuiz(topic, 'Student', 5);
      setQuiz(result);
      setUserAnswers(new Array(result.questions.length).fill(null));
    } catch (e) {
      alert("Failed to generate quiz. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (option: string) => {
    if (userAnswers[currentQuestionIndex] !== null) return;
    
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestionIndex] = option;
    setUserAnswers(newAnswers);
  };

  const nextQuestion = () => {
    if (!quiz) return;
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Calculate final score
      const score = userAnswers.reduce((acc, ans, idx) => {
        return ans === quiz.questions[idx].correctAnswer ? acc + 1 : acc;
      }, 0);
      setFinalScore(score);
      setQuizComplete(true);
      
      // Update global XP
      const currentXP = Number(localStorage.getItem('svgpt_xp')) || 0;
      localStorage.setItem('svgpt_xp', (currentXP + (score * 20)).toString());
    }
  };

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const resetQuiz = () => {
    setQuiz(null);
    setTopic('');
    setQuizComplete(false);
    setFinalScore(0);
    setCurrentQuestionIndex(0);
  };

  return (
    <div className="max-w-4xl mx-auto pb-10">
      {!quiz ? (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-in fade-in zoom-in-95 duration-700">
           <div className="w-24 h-24 bg-rose-500/10 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-inner group transition-all">
              <BrainCircuit size={48} className="text-rose-600 dark:text-rose-400 group-hover:scale-110 transition-transform duration-500" />
           </div>
           <h2 className="text-5xl font-[900] text-slate-900 dark:text-white mb-6 tracking-tighter uppercase leading-none">
             Neural Knowledge <br/> <span className="text-rose-500">Validator.</span>
           </h2>
           <p className="text-slate-500 dark:text-slate-400 mb-10 max-w-md text-lg font-medium leading-relaxed">
             Initialize an adaptive evaluation for any academic topic. We'll synthesize a rigorous carousel of inquiry for you.
           </p>

           <div className="flex flex-col md:flex-row gap-4 w-full max-w-xl">
             <div className="flex-1 relative group">
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Thermodynamics, World War I, Cell Biology"
                  className="w-full pl-6 pr-6 py-5 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-bold text-sm outline-none focus:ring-8 focus:ring-rose-500/10 focus:border-rose-500 transition-all placeholder:text-slate-300"
                  onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                />
             </div>
              <button
                onClick={handleGenerate}
                disabled={loading || !topic}
                className="px-10 py-5 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all disabled:opacity-50 shadow-xl shadow-rose-500/20 active:scale-95"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : <Zap size={18} />}
                Synthesize
              </button>
           </div>
        </div>
      ) : quizComplete ? (
        <div className="bg-white dark:bg-[#0B1221] p-12 md:p-20 rounded-[4rem] border border-slate-200 dark:border-white/5 shadow-3xl text-center animate-in zoom-in-95 duration-700 max-w-2xl mx-auto">
           <div className="w-24 h-24 bg-rose-500/10 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 shadow-inner">
              <Trophy size={48} className="text-rose-500" />
           </div>
           <h2 className="text-4xl font-[900] text-slate-900 dark:text-white mb-4 tracking-tighter uppercase leading-none">Evaluation Terminated</h2>
           <p className="text-slate-500 dark:text-slate-400 mb-12 text-lg font-medium leading-relaxed italic">
             Neural mapping of <span className="text-rose-500 font-black">{quiz.title}</span> successfully recorded.
           </p>
           
           <div className="w-48 h-48 rounded-full border-8 border-slate-50 dark:border-white/5 flex flex-col items-center justify-center mx-auto mb-12 relative shadow-2xl bg-white dark:bg-black/20">
              <span className="text-6xl font-[900] text-rose-500 tracking-tighter">{Math.round((finalScore / quiz.questions.length) * 100)}%</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-2">Accuracy Matrix</span>
              <div className="absolute -bottom-4 bg-indigo-600 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl">
                 +{finalScore * 20} Mastery Points
              </div>
           </div>

           <div className="grid grid-cols-2 gap-4">
             <button 
               onClick={resetQuiz}
               className="py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 shadow-2xl"
             >
               <RotateCcw size={16} /> New Assessment
             </button>
             <button 
               onClick={() => { setQuizComplete(false); setCurrentQuestionIndex(0); }}
               className="py-5 bg-white dark:bg-white/5 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/10 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-50 active:scale-95 transition-all shadow-sm"
             >
               Review Cycle
             </button>
           </div>
        </div>
      ) : (
        <div className="relative flex flex-col h-full animate-in fade-in slide-in-from-bottom-6 duration-700">
           {/* Global Quiz Header */}
           <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10 px-4">
              <div className="flex items-center gap-6">
                 <div className="p-3.5 bg-rose-500/10 rounded-2xl text-rose-500 shadow-inner">
                    <BrainCircuit size={28} />
                 </div>
                 <div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none">{quiz.title}</h3>
                    <div className="flex items-center gap-3 mt-2">
                       <span className="text-[10px] font-black uppercase tracking-widest text-rose-500 bg-rose-500/5 px-2 py-0.5 rounded">Adaptive Mode</span>
                       <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Node {currentQuestionIndex + 1} / {quiz.questions.length}</span>
                    </div>
                 </div>
              </div>
              
              <div className="w-full md:w-64">
                 <div className="flex justify-between items-end mb-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Progress Vector</span>
                    <span className="text-xs font-black text-rose-500">{Math.round(((currentQuestionIndex + 1) / quiz.questions.length) * 100)}%</span>
                 </div>
                 <div className="w-full h-1.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-rose-500 transition-all duration-700 ease-out shadow-[0_0_10px_rgba(244,63,94,0.5)]"
                      style={{ width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%` }}
                    ></div>
                 </div>
              </div>
           </div>

           {/* Carousel Container */}
           <div className="relative overflow-hidden w-full">
              <div 
                className="flex transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
                style={{ transform: `translateX(-${currentQuestionIndex * 100}%)` }}
              >
                {quiz.questions.map((q, idx) => (
                  <div key={idx} className="w-full flex-shrink-0 px-2 md:px-4">
                    <div className="bg-white dark:bg-[#0B1221] p-10 md:p-16 rounded-[4rem] border border-slate-200 dark:border-white/10 shadow-sm relative min-h-[550px] flex flex-col">
                       {/* Question Content */}
                       <div className="flex-1 space-y-10">
                          <div className="flex items-center gap-4">
                             <div className="w-10 h-10 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 flex items-center justify-center text-xs font-black shadow-lg">
                                {idx + 1}
                             </div>
                             <div className="h-px flex-1 bg-slate-100 dark:bg-white/5"></div>
                          </div>

                          <h3 className="text-2xl md:text-3xl font-[900] text-slate-900 dark:text-white leading-tight uppercase tracking-tight">
                            {q.question}
                          </h3>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {q.options.map((option, optIdx) => {
                               const isAnswered = userAnswers[idx] !== null;
                               const isSelected = userAnswers[idx] === option;
                               const isCorrect = option === q.correctAnswer;
                               
                               let btnClass = "w-full text-left p-6 rounded-[2rem] border-2 transition-all duration-500 font-bold text-sm relative group overflow-hidden ";
                               
                               if (isAnswered) {
                                  if (isCorrect) btnClass += "border-green-500 bg-green-50/50 dark:bg-green-900/10 text-green-700 dark:text-green-400";
                                  else if (isSelected) btnClass += "border-red-500 bg-red-50/50 dark:bg-red-900/10 text-red-700 dark:text-red-400";
                                  else btnClass += "border-slate-100 dark:border-white/5 opacity-40 grayscale";
                               } else {
                                  btnClass += "border-slate-100 dark:border-white/5 hover:border-rose-400 dark:hover:border-rose-500/50 bg-slate-50/50 dark:bg-white/[0.02] text-slate-700 dark:text-slate-300 hover:shadow-xl active:scale-95";
                               }

                               return (
                                 <button 
                                   key={optIdx}
                                   onClick={() => handleAnswer(option)}
                                   disabled={isAnswered}
                                   className={btnClass}
                                 >
                                   <div className="flex items-center justify-between gap-4 relative z-10">
                                      <span className="flex-1">{option}</span>
                                      {isAnswered && isCorrect && <CheckCircle2 size={24} className="text-green-500 flex-shrink-0" />}
                                      {isAnswered && isSelected && !isCorrect && <XCircle size={24} className="text-red-500 flex-shrink-0" />}
                                   </div>
                                 </button>
                               );
                            })}
                          </div>

                          {/* Explanation Block */}
                          {userAnswers[idx] !== null && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                               <div className="p-8 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-[2.5rem] border border-indigo-100 dark:border-indigo-900/20 relative overflow-hidden group">
                                  <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                                     <MessageSquare size={80} />
                                  </div>
                                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-500 mb-3 flex items-center gap-2">
                                     <Zap size={14} className="fill-current" /> Neural Context
                                  </h4>
                                  <p className="text-sm font-bold text-slate-600 dark:text-slate-400 leading-relaxed italic">
                                     {q.explanation}
                                  </p>
                               </div>
                            </div>
                          )}
                       </div>
                    </div>
                  </div>
                ))}
              </div>
           </div>

           {/* Carousel Controls */}
           <div className="mt-10 flex flex-col items-center gap-8">
              <div className="flex items-center gap-4 bg-white/50 dark:bg-black/20 p-2 rounded-[2rem] border border-slate-200 dark:border-white/10 shadow-sm backdrop-blur-md">
                 <button 
                   onClick={prevQuestion}
                   disabled={currentQuestionIndex === 0}
                   className="p-5 rounded-[1.5rem] bg-white dark:bg-slate-800 text-slate-400 hover:text-rose-500 disabled:opacity-20 transition-all active:scale-90"
                 >
                    <ChevronLeft size={24} />
                 </button>
                 
                 <div className="flex gap-2 px-4">
                    {quiz.questions.map((_, i) => (
                       <button
                         key={i}
                         onClick={() => setCurrentQuestionIndex(i)}
                         className={`w-3 h-3 rounded-full transition-all duration-500 ${
                           i === currentQuestionIndex 
                             ? 'w-10 bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.5)]' 
                             : userAnswers[i] !== null 
                               ? 'bg-emerald-500 opacity-60' 
                               : 'bg-slate-300 dark:bg-slate-700'
                         }`}
                       />
                    ))}
                 </div>

                 <button 
                   onClick={nextQuestion}
                   disabled={userAnswers[currentQuestionIndex] === null}
                   className={`p-5 rounded-[1.5rem] transition-all active:scale-90 ${
                     userAnswers[currentQuestionIndex] !== null 
                       ? 'bg-rose-600 text-white shadow-xl shadow-rose-500/20' 
                       : 'bg-slate-100 dark:bg-slate-800 text-slate-300'
                   }`}
                 >
                    {currentQuestionIndex === quiz.questions.length - 1 ? <CheckCircle2 size={24} /> : <ChevronRight size={24} />}
                 </button>
              </div>

              {userAnswers[currentQuestionIndex] === null && (
                 <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 animate-pulse">
                    Awaiting User Input for Next Synthesis
                 </p>
              )}
           </div>
        </div>
      )}
    </div>
  );
};

export default StudentQuiz;
