import React, { useState } from 'react';
import { generateQuiz } from '../services/geminiService';
import { Quiz } from '../types';
import { HelpCircle, Loader2, Play, Download, Printer, CheckCircle2 } from 'lucide-react';

const QuizMaker: React.FC = () => {
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
        // Force light mode styles for print to save ink
        const styles = `
          <style>
            @media print {
              @page { margin: 2cm; }
              body { -webkit-print-color-adjust: exact; }
            }
            body { font-family: sans-serif; line-height: 1.6; padding: 20px; color: #1a1a1a; max-width: 100%; margin: 0 auto; background: white; }
            h1 { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; font-size: 24px; color: #111; }
            h2 { margin-top: 0; color: #555; }
            .quiz-header { margin-bottom: 40px; text-align: center; color: #666; font-size: 14px; }
            .question-box { margin-bottom: 30px; page-break-inside: avoid; }
            .question-text { font-weight: bold; font-size: 16px; margin-bottom: 12px; color: #000; }
            .options-list { list-style-type: none; padding-left: 0; }
            .options-list li { margin-bottom: 10px; padding-left: 30px; position: relative; color: #333; }
            .options-list li:before { content: '☐'; position: absolute; left: 5px; color: #666; font-size: 18px; }
            
            .page-break { page-break-before: always; display: block; height: 1px; margin: 50px 0; border-top: 1px dashed #ddd; }
            @media print {
               .page-break { border-top: none; }
            }
            
            .answer-key .question-box { border-bottom: 1px solid #eee; padding-bottom: 20px; }
            .answer-row { display: flex; justify-content: space-between; margin-bottom: 5px; font-weight: 500; }
            .correct-answer { color: #166534; font-weight: bold; }
            .explanation { background: #f0fdf4; padding: 12px; border-radius: 6px; font-size: 14px; color: #166534; margin-top: 10px; border: 1px solid #dcfce7; }
          </style>
        `;

        const studentContent = quiz.questions.map((q, i) => `
          <div class="question-box">
            <div class="question-text">${i + 1}. ${q.question}</div>
            <ul class="options-list">
              ${q.options.map(opt => `<li>${opt}</li>`).join('')}
            </ul>
          </div>
        `).join('');

        const teacherContent = quiz.questions.map((q, i) => `
          <div class="question-box">
            <div class="question-text">${i + 1}. ${q.question}</div>
            <div class="answer-row">
              <span>Correct Answer: <span class="correct-answer">${q.correctAnswer}</span></span>
            </div>
            <div class="explanation">
              <strong>Why?</strong> ${q.explanation}
            </div>
          </div>
        `).join('');

        printWindow.document.write(`
          <html>
            <head>
              <title>${topic} - Quiz Export</title>
              ${styles}
            </head>
            <body>
              <!-- Student Copy -->
              <h1>${quiz.title}</h1>
              <div class="quiz-header">
                <p><strong>Topic:</strong> ${topic} &nbsp;|&nbsp; <strong>Date:</strong> ________________</p>
                <p><strong>Name:</strong> _________________________________ &nbsp;|&nbsp; <strong>Score:</strong> _______ / ${quiz.questions.length}</p>
              </div>
              ${studentContent}

              <div class="page-break"></div>

              <!-- Teacher Copy -->
              <h1>Teacher Answer Key</h1>
              <div class="quiz-header">
                <p><strong>Topic:</strong> ${topic} - Reference Material</p>
              </div>
              <div class="answer-key">
                ${teacherContent}
              </div>
            </body>
          </html>
        `);
        printWindow.document.close();
        setTimeout(() => printWindow.print(), 500);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-10">
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
            placeholder="Enter a topic (e.g., 'Photosynthesis' or 'The Civil War')"
            className="flex-1 px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none text-lg transition-all"
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
          />
          <button
            onClick={handleGenerate}
            disabled={loading || !topic}
            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
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
               <button 
                 onClick={handlePrint}
                 className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors shadow-sm"
                 title="Download as PDF"
               >
                 <Download size={18} /> Download PDF
               </button>
               <button 
                 onClick={handlePrint}
                 className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors shadow-sm"
                 title="Print Quiz"
               >
                 <Printer size={18} /> Print
               </button>
            </div>
          </div>

          <div className="grid gap-6">
            {quiz.questions.map((q, idx) => (
              <div key={idx} className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-indigo-100 dark:border-indigo-900/50 ring-1 ring-indigo-50 dark:ring-indigo-900/20 shadow-sm transition-colors">
                <p className="text-lg font-medium text-slate-800 dark:text-slate-100 mb-4 flex gap-2">
                  <span className="text-indigo-600 dark:text-indigo-400 font-bold">{idx + 1}.</span>
                  {q.question}
                </p>
                <div className="space-y-3 pl-8">
                  {q.options.map((opt) => {
                    const isCorrect = opt === q.correctAnswer;
                    let btnClass = "w-full text-left p-3 rounded-lg border-2 transition-all flex items-center justify-between ";
                    
                    if (isCorrect) {
                      btnClass += "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-900 dark:text-green-300 font-medium";
                    } else {
                      btnClass += "border-slate-50 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400";
                    }

                    return (
                      <div key={opt} className={btnClass}>
                        <span>{opt}</span>
                        {isCorrect && (
                          <span className="flex items-center gap-1 text-xs font-bold text-green-700 dark:text-green-300 uppercase tracking-wider bg-white dark:bg-green-900/40 px-2 py-1 rounded border border-green-200 dark:border-green-800">
                            <CheckCircle2 size={12} /> Correct
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4 ml-8 p-4 text-sm rounded-lg flex gap-3 items-start bg-indigo-50 dark:bg-indigo-900/20 text-indigo-900 dark:text-indigo-200 border border-indigo-100 dark:border-indigo-900/30">
                  <HelpCircle size={18} className="mt-0.5 flex-shrink-0 text-indigo-600 dark:text-indigo-400" />
                  <div>
                    <span className="font-bold block mb-1 text-indigo-700 dark:text-indigo-300">Explanation:</span>
                    {q.explanation}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex justify-center pt-4">
             <button
                onClick={handleGenerate}
                className="px-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-200 dark:hover:border-indigo-500 transition-colors shadow-sm flex items-center gap-2"
              >
                <Play size={16} /> Generate Another Quiz
              </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizMaker;