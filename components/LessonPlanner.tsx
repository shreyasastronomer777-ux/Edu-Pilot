
import React, { useState, useRef, useEffect } from 'react';
import { LessonPlanConfig } from '../types';
import { streamLessonPlan } from '../services/geminiService';
import { Send, Loader2, Download, Copy, FileText, ChevronDown, Printer, Wand2, ArrowLeft } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface LessonPlannerProps {
  onBack?: () => void;
}

const LessonPlanner: React.FC<LessonPlannerProps> = ({ onBack }) => {
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState('');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  const [config, setConfig] = useState<LessonPlanConfig>({
    topic: '',
    gradeLevel: '5th Grade',
    subject: 'Science',
    duration: '45 mins',
    focus: 'Interactive Learning'
  });

  const templates = [
    { label: 'Inquiry-Based', duration: '60 mins', focus: 'Student-led exploration, questioning, and discovery.' },
    { label: 'Lecture & Practice', duration: '45 mins', focus: 'Direct instruction followed by guided application.' },
    { label: 'Project-Based', duration: '90 mins', focus: 'Collaborative, hands-on creation of a tangible product.' },
    { label: 'Gamified Review', duration: '45 mins', focus: 'Interactive games, competition, and rewards.' },
  ];

  const applyTemplate = (t: typeof templates[0]) => {
      setConfig(prev => ({ ...prev, duration: t.duration, focus: t.focus }));
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleGenerate = async () => {
    if (!config.topic) return;
    setLoading(true);
    setContent('');
    try {
      await streamLessonPlan(config, (chunk) => {
        setContent(prev => prev + chunk);
      });
    } catch (err) {
      console.error(err);
      setContent("**Error generating plan.** Please check your connection or try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    alert("Lesson plan copied to clipboard!");
  };

  const handleExportTxt = () => {
    if (!content) return;
    const element = document.createElement("a");
    const file = new Blob([content], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${config.topic.replace(/\s+/g, '-').toLowerCase()}-lesson-plan.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    setShowExportMenu(false);
  };

  const handlePrint = () => {
    if (!content) return;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>${config.topic} - Lesson Plan</title>
              <style>
                body { font-family: sans-serif; line-height: 1.6; padding: 40px; max-width: 800px; margin: 0 auto; color: #1a1a1a; background: #fff; }
                h1 { color: #333; border-bottom: 2px solid #eee; padding-bottom: 10px; }
                h2 { color: #555; margin-top: 20px; }
                ul { padding-left: 20px; }
              </style>
            </head>
            <body>
              <div style="margin-bottom: 20px; color: #666;">
                <p><strong>Topic:</strong> ${config.topic}</p>
                <p><strong>Grade:</strong> ${config.gradeLevel} | <strong>Subject:</strong> ${config.subject}</p>
              </div>
              <hr/>
              <div>${content.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/# (.*?)(<br\/>|$)/g, '<h1>$1</h1>').replace(/## (.*?)(<br\/>|$)/g, '<h2>$1</h2>')}</div>
            </body>
          </html>
        `);
        printWindow.document.close();
        setTimeout(() => printWindow.print(), 500);
    }
    setShowExportMenu(false);
  };

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-4rem)] flex flex-col">
      {/* Module Navigation */}
      <div className="mb-6">
         <button 
           onClick={onBack}
           className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors group"
         >
           <div className="p-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 group-hover:border-indigo-200">
              <ArrowLeft size={16} />
           </div>
           Back to Dashboard
         </button>
      </div>

      <div className="flex gap-6 flex-1 overflow-hidden">
        {/* Input Section */}
        <div className="w-1/3 flex flex-col gap-4 overflow-y-auto pr-2">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm transition-colors">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6">Plan Parameters</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                  <Wand2 size={14} className="text-indigo-500" /> Quick Templates
                </label>
                <div className="flex flex-wrap gap-2">
                  {templates.map(t => (
                    <button 
                      key={t.label} 
                      onClick={() => applyTemplate(t)}
                      className="px-3 py-1.5 text-xs rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-300 border border-slate-200 dark:border-slate-600 transition-all text-left"
                      title={`Focus: ${t.focus}`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-700 pt-2"></div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Topic</label>
                <input 
                  type="text" 
                  value={config.topic}
                  onChange={(e) => setConfig({...config, topic: e.target.value})}
                  placeholder="e.g. The Water Cycle"
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                />
              </div>

              {/* Rest of inputs... */}
              <button 
                onClick={handleGenerate}
                disabled={loading || !config.topic}
                className={`w-full py-3 rounded-lg flex items-center justify-center gap-2 font-semibold text-white transition-all ${
                  loading || !config.topic 
                    ? 'bg-slate-400 dark:bg-slate-600 cursor-not-allowed' 
                    : 'bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg'
                }`}
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                {loading ? 'Planning...' : 'Generate Plan'}
              </button>
            </div>
          </div>
        </div>

        {/* Output Section */}
        <div className="w-2/3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col overflow-hidden transition-colors">
          <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
            <h3 className="font-semibold text-slate-700 dark:text-slate-200">Lesson Plan Preview</h3>
            <div className="flex gap-2">
              <button onClick={handleCopy} className="p-2 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors" title="Copy to Clipboard">
                <Copy size={18} />
              </button>
              <div className="h-6 w-px bg-slate-300 dark:bg-slate-600 my-auto mx-1"></div>
              
              <div className="relative" ref={exportMenuRef}>
                 <button 
                   onClick={() => setShowExportMenu(!showExportMenu)} 
                   className={`px-3 py-1.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-200 dark:hover:border-indigo-500 rounded-lg transition-all flex items-center gap-2 text-sm font-medium shadow-sm`}
                 >
                   <Download size={16} /> Export <ChevronDown size={14} />
                 </button>
                 
                 {showExportMenu && (
                   <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                      <div className="p-1">
                        <button onClick={handleExportTxt} className="w-full text-left px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg flex items-center gap-2">
                          <FileText size={16} className="text-slate-400" /> Export as Text
                        </button>
                        <button onClick={handlePrint} className="w-full text-left px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg flex items-center gap-2">
                          <Printer size={16} className="text-slate-400" /> Print / PDF
                        </button>
                      </div>
                   </div>
                 )}
              </div>
            </div>
          </div>
          
          <div className="flex-1 p-8 overflow-y-auto prose prose-slate dark:prose-invert max-w-none">
            {content ? (
               <ReactMarkdown>{content}</ReactMarkdown>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 opacity-60">
                <FileText size={48} className="mb-4" />
                <p className="text-lg">Enter details and hit generate to see the magic.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonPlanner;
