
import React, { useState } from 'react';
import { FileDown, Printer, Loader2, Wand2, ArrowLeft, FileText, Layout, CheckCircle2, Download, Zap, AlertCircle, Sparkles } from 'lucide-react';
import { synthesizeSVGWorksheet } from '../services/geminiService';

const WorksheetGenerator: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const [topic, setTopic] = useState('');
  const [grade, setGrade] = useState('8th Grade');
  const [loading, setLoading] = useState(false);
  const [svgCode, setSvgCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setError(null);
    setSvgCode(null);
    try {
      const output = await synthesizeSVGWorksheet(topic, grade);
      setSvgCode(output);
      
      const currentPoints = Number(localStorage.getItem('svgpt_xp')) || 0;
      localStorage.setItem('svgpt_xp', (currentPoints + 75).toString());
    } catch (e) {
      setError("Neural blueprint failed. Please verify your connection.");
    } finally {
      setLoading(false);
    }
  };

  const downloadWorksheet = () => {
    if (!svgCode) return;
    const blob = new Blob([svgCode], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `svgpt-worksheet-${topic.replace(/\s+/g, '-').toLowerCase()}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const printWorksheet = () => {
    if (!svgCode) return;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head><title>SVGPT Worksheet: ${topic}</title><style>body { margin: 0; display: flex; justify-content: center; align-items: flex-start; padding-top: 40px; } svg { max-width: 100%; height: auto; }</style></head>
          <body>${svgCode}</body>
          <script>window.onload = () => { window.print(); window.close(); }</script>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-8 pb-20 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <button onClick={onBack} className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors group">
          <div className="p-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 group-hover:border-indigo-200 shadow-sm">
            <ArrowLeft size={16} />
          </div>
          Back to My Dashboard
        </button>
        <div className="flex items-center gap-3 px-6 py-2 bg-indigo-500/10 rounded-full border border-indigo-500/20">
          <FileText className="text-indigo-600 dark:text-indigo-400" size={16} />
          <span className="text-[10px] font-black uppercase tracking-widest text-indigo-700 dark:text-indigo-500">
            Architectural Worksheet v1.0
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white/70 dark:bg-white/[0.03] backdrop-blur-3xl p-10 rounded-[3.5rem] border border-slate-200 dark:border-white/10 shadow-sm flex flex-col">
          <div className="w-20 h-20 bg-indigo-500/10 rounded-3xl flex items-center justify-center mb-8">
            <Layout className="text-indigo-500" size={32} />
          </div>
          <h2 className="text-3xl font-black tracking-tighter uppercase text-slate-900 dark:text-white mb-2">Worksheet Generator</h2>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-10">Synthesize printable academic assets in seconds</p>

          <div className="space-y-6 flex-1">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Topic of Inquiry</label>
              <input 
                type="text" 
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Kinetic Energy in Rollercoasters"
                className="w-full px-6 py-5 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 text-slate-900 dark:text-white font-bold outline-none focus:ring-8 focus:ring-indigo-500/10 transition-all"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Grade Level Alignment</label>
              <select 
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full px-6 py-5 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 text-slate-900 dark:text-white font-bold outline-none focus:ring-8 focus:ring-indigo-500/10 transition-all"
              >
                {['6th Grade', '7th Grade', '8th Grade', 'Freshman', 'Sophomore', 'Junior', 'Senior', 'University'].map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            <div className="p-6 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-3xl border border-indigo-100 dark:border-indigo-900/30 flex gap-4">
              <Sparkles className="text-indigo-500 flex-shrink-0" size={20} />
              <p className="text-xs font-medium text-slate-600 dark:text-slate-400 leading-relaxed">
                Our synthesis engine will create a professional SVG layout with instructional diagrams, analytical problems, and a rubric.
              </p>
            </div>
          </div>

          <button 
            onClick={handleGenerate}
            disabled={loading || !topic.trim()}
            className="w-full mt-10 py-5 premium-gradient text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Wand2 size={20} />}
            Synthesize Worksheet
          </button>

          {error && (
            <div className="mt-8 flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl animate-in slide-in-from-bottom-2">
              <AlertCircle size={18} className="text-red-500 flex-shrink-0" />
              <p className="text-xs font-bold text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}
        </div>

        <div className="bg-white/70 dark:bg-white/[0.03] backdrop-blur-3xl rounded-[3.5rem] border border-slate-200 dark:border-white/10 shadow-sm flex flex-col overflow-hidden min-h-[500px]">
          <div className="p-6 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-black/20 flex justify-between items-center px-10">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Zap size={16} className="text-indigo-500" /> Blueprint Preview
            </h3>
            {svgCode && (
              <div className="flex gap-2">
                <button onClick={downloadWorksheet} className="p-2 bg-indigo-500/10 text-indigo-600 rounded-xl hover:bg-indigo-500 hover:text-white transition-all shadow-sm" title="Download SVG">
                  <Download size={16} />
                </button>
                <button onClick={printWorksheet} className="p-2 bg-emerald-500/10 text-emerald-600 rounded-xl hover:bg-emerald-500 hover:text-white transition-all shadow-sm" title="Print Asset">
                  <Printer size={16} />
                </button>
              </div>
            )}
          </div>

          <div className="flex-1 p-8 overflow-y-auto custom-scrollbar flex flex-col items-center justify-center">
            {loading ? (
              <div className="flex flex-col items-center gap-6">
                <div className="relative">
                  <div className="w-20 h-20 border-4 border-t-transparent border-indigo-500 rounded-full animate-spin"></div>
                  <Sparkles className="absolute inset-0 m-auto animate-pulse text-indigo-500" size={28} />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Mapping Pedagogical Vectors...</p>
              </div>
            ) : svgCode ? (
              <div className="w-full h-full bg-white dark:bg-white rounded-2xl p-6 shadow-inner border border-slate-100 flex items-start justify-center animate-in zoom-in-95 duration-700">
                <div dangerouslySetInnerHTML={{ __html: svgCode }} className="max-w-full overflow-hidden" />
              </div>
            ) : (
              <div className="opacity-10 flex flex-col items-center">
                <FileDown size={100} strokeWidth={1} />
                <p className="text-[12px] font-black uppercase tracking-[0.6em] mt-10">Awaiting Synthesis</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorksheetGenerator;
