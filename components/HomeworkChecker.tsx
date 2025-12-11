import React, { useState } from 'react';
import { checkHomework, gradeAnswerSheet } from '../services/geminiService';
import { CheckSquare, Loader2, RefreshCw, Upload, Image as ImageIcon, Type, X, FileText, FileCheck } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

type Mode = 'text' | 'scan';

const HomeworkChecker: React.FC = () => {
  const [mode, setMode] = useState<Mode>('text');
  const [assignment, setAssignment] = useState('');
  
  // Text Mode State
  const [studentWork, setStudentWork] = useState('');
  
  // Scan Mode State
  const [studentImageFile, setStudentImageFile] = useState<string | null>(null);
  const [studentImageType, setStudentImageType] = useState<string>('');
  
  // Answer Key State (PDF or Image)
  const [answerKeyFile, setAnswerKeyFile] = useState<string | null>(null);
  const [answerKeyType, setAnswerKeyType] = useState<string>('');
  const [answerKeyName, setAnswerKeyName] = useState<string>('');

  const [feedback, setFeedback] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleStudentImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        if (file.size > 5 * 1024 * 1024) {
            alert("File is too large. Please upload an image under 5MB.");
            return;
        }
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
        if (file.size > 5 * 1024 * 1024) {
            alert("File is too large. Please upload under 5MB.");
            return;
        }
        const reader = new FileReader();
        reader.onload = (event) => {
            setAnswerKeyFile(event.target?.result as string);
            setAnswerKeyType(file.type);
            setAnswerKeyName(file.name);
            setFeedback(null);
        };
        reader.readAsDataURL(file);
    }
  };

  const clearStudentImage = () => {
      setStudentImageFile(null);
      setStudentImageType('');
      setFeedback(null);
  };

  const clearAnswerKey = () => {
      setAnswerKeyFile(null);
      setAnswerKeyType('');
      setAnswerKeyName('');
      setFeedback(null);
  };

  const handleCheck = async () => {
    setLoading(true);
    setFeedback(null);

    try {
      let result;
      if (mode === 'text') {
        if (!assignment || !studentWork) return;
        result = await checkHomework(assignment, studentWork);
      } else {
        if (!studentImageFile) return;
        
        result = await gradeAnswerSheet(
          { dataUri: studentImageFile, mimeType: studentImageType },
          assignment,
          answerKeyFile ? { dataUri: answerKeyFile, mimeType: answerKeyType } : undefined
        );
      }
      setFeedback(result);
    } catch (err) {
      console.error(err);
      setFeedback("Error processing submission. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isButtonDisabled = mode === 'text' 
    ? (loading || !assignment || !studentWork)
    : (loading || !studentImageFile);

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-4rem)] flex gap-6">
      {/* Left Input Panel */}
      <div className="w-1/3 flex flex-col gap-4 overflow-y-auto pr-1">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm transition-colors">
          <div className="flex items-center gap-2 mb-6">
             <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <CheckSquare className="text-orange-600 dark:text-orange-400" size={24} />
             </div>
             <h2 className="text-xl font-bold text-slate-800 dark:text-white">Smart Grader</h2>
          </div>

          {/* Mode Toggle */}
          <div className="flex p-1 bg-slate-100 dark:bg-slate-700 rounded-xl mb-6">
            <button 
              onClick={() => { setMode('text'); setFeedback(null); }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all ${mode === 'text' ? 'bg-white dark:bg-slate-600 text-orange-600 dark:text-orange-300 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
            >
              <Type size={16} /> Text Input
            </button>
            <button 
              onClick={() => { setMode('scan'); setFeedback(null); }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all ${mode === 'scan' ? 'bg-white dark:bg-slate-600 text-orange-600 dark:text-orange-300 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
            >
              <ImageIcon size={16} /> Scan Sheet
            </button>
          </div>
          
          <div className="space-y-4">
            {/* Context / Answer Key Section */}
            <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
               <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                 1. Grading Context (Optional)
               </label>
               
               <textarea 
                  value={assignment}
                  onChange={(e) => setAssignment(e.target.value)}
                  placeholder={mode === 'scan' ? "Type quick notes or key terms here..." : "e.g. Write a 5-sentence paragraph about the main cause of the Civil War."}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-orange-500 outline-none h-20 resize-none text-sm mb-3 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />

               {mode === 'scan' && (
                 <div>
                    {!answerKeyFile ? (
                      <label className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-dashed border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 cursor-pointer hover:border-orange-400 dark:hover:border-orange-500 hover:text-orange-600 dark:hover:text-orange-400 transition-colors text-slate-500 dark:text-slate-400 text-xs font-medium">
                          <Upload size={14} /> Upload Answer Key (PDF/Image)
                          <input type="file" accept="image/*,application/pdf" className="hidden" onChange={handleAnswerKeyUpload} />
                      </label>
                    ) : (
                      <div className="flex items-center justify-between bg-white dark:bg-slate-800 px-3 py-2 rounded-lg border border-orange-200 dark:border-orange-900">
                         <div className="flex items-center gap-2 overflow-hidden">
                            <FileCheck size={16} className="text-green-600 dark:text-green-400 flex-shrink-0" />
                            <span className="text-xs text-slate-700 dark:text-slate-300 truncate font-medium">{answerKeyName}</span>
                         </div>
                         <button onClick={clearAnswerKey} className="text-slate-400 hover:text-red-500 p-1"><X size={14} /></button>
                      </div>
                    )}
                 </div>
               )}
            </div>

            {/* Student Submission Section */}
            <div>
               <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                 2. Student Submission (Required)
               </label>

               {mode === 'text' ? (
                <textarea 
                  value={studentWork}
                  onChange={(e) => setStudentWork(e.target.value)}
                  placeholder="Paste student text here..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-orange-500 outline-none h-40 resize-none text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
               ) : (
                 <>
                   {!studentImageFile ? (
                     <label className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-orange-400 dark:hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/10 transition-all group h-40">
                        <Upload className="text-slate-400 dark:text-slate-500 group-hover:text-orange-500 mb-2" size={24} />
                        <span className="text-sm text-slate-500 dark:text-slate-400 group-hover:text-orange-600 dark:group-hover:text-orange-400 font-medium">Upload Student Answer Sheet</span>
                        <input type="file" accept="image/*" className="hidden" onChange={handleStudentImageUpload} />
                     </label>
                   ) : (
                     <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 group">
                        <img src={studentImageFile} alt="Uploaded student work" className="w-full h-40 object-cover" />
                        <button 
                          onClick={clearStudentImage}
                          className="absolute top-2 right-2 p-1 bg-white/90 rounded-full text-slate-600 hover:text-red-600 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={16} />
                        </button>
                        <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs py-1 px-2">
                          Student Work
                        </div>
                     </div>
                   )}
                 </>
               )}
            </div>

            <button 
              onClick={handleCheck}
              disabled={isButtonDisabled}
              className={`w-full py-3 rounded-xl flex items-center justify-center gap-2 font-semibold text-white transition-all shadow-md ${
                isButtonDisabled
                  ? 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed shadow-none' 
                  : 'bg-orange-600 hover:bg-orange-700 hover:shadow-lg hover:-translate-y-0.5'
              }`}
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : (mode === 'scan' ? 'Analyze & Grade' : 'Grade Submission')}
            </button>
          </div>
        </div>
      </div>

      {/* Right Result Panel */}
      <div className="w-2/3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col overflow-hidden transition-colors">
        <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center">
          <h3 className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
            AI Feedback & Grading
            {feedback && <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs rounded-full font-bold">Complete</span>}
          </h3>
          {feedback && <button onClick={handleCheck} className="text-xs flex items-center gap-1 text-slate-500 dark:text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 px-3 py-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 transition-colors"><RefreshCw size={12}/> Regenerate</button>}
        </div>
        
        <div className="flex-1 p-8 overflow-y-auto prose prose-slate dark:prose-invert max-w-none prose-headings:text-orange-900 dark:prose-headings:text-orange-300 prose-a:text-orange-600 dark:prose-a:text-orange-400">
          {feedback ? (
             <ReactMarkdown 
               components={{
                 h1: ({node, ...props}) => <h1 className="text-2xl font-bold border-b border-orange-100 dark:border-orange-900 pb-2 mb-4" {...props} />,
                 h2: ({node, ...props}) => <h2 className="text-xl font-bold mt-6 mb-3" {...props} />,
                 strong: ({node, ...props}) => <strong className="font-semibold text-slate-900 dark:text-white" {...props} />,
                 li: ({node, ...props}) => <li className="my-1" {...props} />
               }}
             >
               {feedback}
             </ReactMarkdown>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 opacity-60">
              <div className="w-20 h-20 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-6">
                {mode === 'scan' ? <ImageIcon size={32} /> : <Type size={32} />}
              </div>
              <h4 className="text-lg font-semibold text-slate-600 dark:text-slate-300 mb-2">Ready to Grade</h4>
              <p className="max-w-xs text-center text-sm">
                {mode === 'scan' 
                  ? "Upload the Student's Answer Sheet (Image). Optional: Upload an Answer Key (PDF) or type notes." 
                  : "Enter the assignment details and paste the student's text submission."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomeworkChecker;