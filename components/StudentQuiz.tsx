
import React, { useState } from 'react';
import { generateQuiz } from '../services/geminiService';
import { Quiz } from '../types';
import { BrainCircuit, Loader2, Play, CheckCircle2, XCircle, ArrowRight, RotateCcw } from 'lucide-react';

const StudentQuiz: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  
  // Quiz Taking State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [quizComplete, setQuizComplete] = useState(false);

  const handleGenerate = async () => {
    if (!topic) return;
    setLoading(true);
    setQuiz(null);
    setQuizComplete(false);
    setCurrentQuestionIndex(0);
    setScore(0);
    setIsAnswered(false);
    setSelectedAnswer(null);
    
    try {
      const result = await generateQuiz(topic, 'Student', 5);
      setQuiz(result);
    } catch (e) {
      alert("Failed to generate quiz. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (option: string) => {
    if (isAnswered) return;
    setSelectedAnswer(option);
    setIsAnswered(true);
    
    if (option === quiz?.questions[currentQuestionIndex].correctAnswer) {
      setScore(prev => prev + 1);
    }
  };

  const nextQuestion = () => {
    if (!quiz) return;
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setIsAnswered(false);
      setSelectedAnswer(null);
    } else {
      setQuizComplete(true);
    }
  };

  const resetQuiz = () => {
    setQuiz(null);
    setTopic('');
    setQuizComplete(false);
    setScore(0);
  };

  return (
    <div className="max-w-3xl mx-auto pb-10">
      {!quiz ? (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
           <div className="w-20 h-20 bg-rose-100 dark:bg-rose-900/30 rounded-full flex items-center justify-center mb-6">
              <BrainCircuit size={40} className="text-rose-600 dark:text-rose-400" />
           </div>
           <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-4">Subject Quiz Generator</h2>
           <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md">
             Enter any subject or topic, and AI will generate a practice quiz to test your knowledge immediately.
           </p>

           <div className="flex gap-2 w-full max-w-md">
             <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. World War II, Calculus Derivatives, Biology Cells"
                className="flex-1 px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 outline-none"
                onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
              />
              <button
                onClick={handleGenerate}
                disabled={loading || !topic}
                className="px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold flex items-center gap-2 transition-all disabled:opacity-50 shadow-md"
              >
                {loading ? <Loader2 className="animate-spin" /> : 'Start'}
              </button>
           </div>
        </div>
      ) : quizComplete ? (
        <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-lg text-center animate-in zoom-in-95 duration-300">
           <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Quiz Complete!</h2>
           <p className="text-slate-500 dark:text-slate-400 mb-8">You finished {quiz.title}</p>
           
           <div className="w-40 h-40 rounded-full border-8 border-rose-100 dark:border-rose-900/30 flex items-center justify-center mx-auto mb-8 relative">
              <span className="text-5xl font-bold text-rose-600 dark:text-rose-400">{Math.round((score / quiz.questions.length) * 100)}%</span>
              <span className="absolute -bottom-8 text-sm text-slate-400">{score} out of {quiz.questions.length} correct</span>
           </div>

           <button 
             onClick={resetQuiz}
             className="px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold hover:scale-105 transition-transform flex items-center gap-2 mx-auto"
           >
             <RotateCcw size={18} /> Take Another Quiz
           </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-lg min-h-[400px] flex flex-col animate-in slide-in-from-right-4 duration-300">
           {/* Progress Bar */}
           <div className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full mb-6 overflow-hidden">
              <div 
                className="h-full bg-rose-500 transition-all duration-300"
                style={{ width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%` }}
              ></div>
           </div>

           <div className="flex justify-between items-center mb-6">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">Question {currentQuestionIndex + 1} of {quiz.questions.length}</span>
              <span className="text-xs text-slate-400">{quiz.title}</span>
           </div>

           <h3 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-8">
             {quiz.questions[currentQuestionIndex].question}
           </h3>

           <div className="space-y-3 flex-1">
              {quiz.questions[currentQuestionIndex].options.map((option, idx) => {
                const isCorrect = option === quiz.questions[currentQuestionIndex].correctAnswer;
                const isSelected = selectedAnswer === option;
                
                let btnClass = "w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between font-medium ";
                
                if (isAnswered) {
                   if (isCorrect) btnClass += "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300";
                   else if (isSelected) btnClass += "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300";
                   else btnClass += "border-slate-100 dark:border-slate-700 text-slate-400 opacity-50";
                } else {
                   btnClass += "border-slate-100 dark:border-slate-700 hover:border-rose-400 dark:hover:border-rose-500 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-200";
                }

                return (
                  <button 
                    key={idx}
                    onClick={() => handleAnswer(option)}
                    disabled={isAnswered}
                    className={btnClass}
                  >
                    <span>{option}</span>
                    {isAnswered && isCorrect && <CheckCircle2 className="text-green-600" size={20} />}
                    {isAnswered && isSelected && !isCorrect && <XCircle className="text-red-600" size={20} />}
                  </button>
                );
              })}
           </div>
           
           {isAnswered && (
             <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700 animate-in fade-in slide-in-from-bottom-2">
                <div className="mb-4 bg-slate-50 dark:bg-slate-900 p-4 rounded-xl text-sm text-slate-600 dark:text-slate-300">
                   <span className="font-bold block mb-1">Explanation:</span>
                   {quiz.questions[currentQuestionIndex].explanation}
                </div>
                <div className="flex justify-end">
                  <button 
                    onClick={nextQuestion}
                    className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold hover:scale-105 transition-transform flex items-center gap-2"
                  >
                    {currentQuestionIndex < quiz.questions.length - 1 ? 'Next Question' : 'Finish Quiz'} <ArrowRight size={18} />
                  </button>
                </div>
             </div>
           )}
        </div>
      )}
    </div>
  );
};

export default StudentQuiz;
