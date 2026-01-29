
import React, { useState, useRef } from 'react';
// Fix: Added missing AlertCircle import from lucide-react
import { Camera, Upload, Loader2, Sparkles, Wand2, X, ArrowLeft, BrainCircuit, Zap, CheckCircle2, FileText, Layout, Download, Copy, Trash2, Layers, AlertCircle } from 'lucide-react';
import { synthesizeSVGDiagramAndCards } from '../services/geminiService';

const SVGStudyCard: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const [asset, setAsset] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ svgCode: string, cards: { front: string, back: string }[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    setError(null);
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setError("Invalid format. Please upload a high-contrast drawing or diagram (JPG/PNG).");
        setAsset(null);
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        setAsset(event.target?.result as string);
        setMimeType(file.type);
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleSynthesize = async () => {
    if (!asset) return;
    setLoading(true);
    setError(null);
    try {
      const output = await synthesizeSVGDiagramAndCards(asset, mimeType);
      setResult(output);
      
      const currentPoints = Number(localStorage.getItem('svgpt_xp')) || 0;
      localStorage.setItem('svgpt_xp', (currentPoints + 100).toString());
    } catch (e) {
      setError("Neural rendering failed. Ensure your drawing is clear and legible.");
    } finally {
      setLoading(false);
    }
  };

  const downloadSVG = () => {
    if (!result) return;
    const blob = new Blob([result.svgCode], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `svgpt-blueprint-${Date.now()}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportToAnki = () => {
    if (!result) return;
    const csvRows = result.cards.map(c => `"${c.front.replace(/"/g, '""')}","${c.back.replace(/"/g, '""')}"`);
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `svgpt-anki-deck-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-8 pb-20 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <button onClick={onBack} className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors group">
          <div className="p-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 group-hover:border-indigo-200 shadow-sm">
            <ArrowLeft size={16} />
          </div>
          Back to Dashboard
        </button>
        <div className="flex items-center gap-3 px-6 py-2 bg-indigo-500/10 rounded-full border border-indigo-500/20">
          <Layers className="text-indigo-600 dark:text-indigo-400" size={16} />
          <span className="text-[10px] font-black uppercase tracking-widest text-indigo-700 dark:text-indigo-500">
            Blueprint Synthesis v1.0
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white/70 dark:bg-white/[0.03] backdrop-blur-3xl p-10 rounded-[3.5rem] border border-slate-200 dark:border-white/10 shadow-sm flex flex-col items-center">
          <div className="w-20 h-20 bg-indigo-500/10 rounded-3xl flex items-center justify-center mb-8">
            <Layout className="text-indigo-500" size={32} />
          </div>
          <h2 className="text-3xl font-black tracking-tighter uppercase text-slate-900 dark:text-white mb-2">Diagram Ink-to-Vector</h2>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-10 text-center">Convert sketches into clean SVGs and Anki Cards</p>

          {!asset ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={e => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files[0]; if(f) processFile(f); }}
              className={`w-full aspect-[4/3] border-4 border-dashed rounded-[3rem] flex flex-col items-center justify-center cursor-pointer transition-all duration-300 group relative ${isDragging ? 'border-indigo-500 bg-indigo-500/5 ring-8 ring-indigo-500/10' : 'border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5'}`}
            >
              <Upload size={48} className={`transition-colors mb-4 ${isDragging ? 'text-indigo-500 scale-110' : 'text-slate-200 group-hover:text-indigo-500'}`} />
              <span className="text-xs font-black uppercase tracking-[0.2em] px-8 text-center text-slate-400">
                {isDragging ? 'Drop Diagram Now' : 'Click or Drop Your Sketch (PNG/JPG)'}
              </span>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
            </div>
          ) : (
            <div className="w-full flex flex-col items-center">
              <div className="relative w-full aspect-[4/3] rounded-[3rem] overflow-hidden border border-slate-200 dark:border-white/10 group mb-8 shadow-2xl bg-slate-50 dark:bg-black/20 flex items-center justify-center">
                <img src={asset} className="w-full h-full object-contain" />
                <button onClick={() => setAsset(null)} className="absolute top-6 right-6 p-3 bg-white/90 rounded-2xl text-red-500 shadow-xl hover:scale-110 transition-transform">
                  <X size={20} />
                </button>
              </div>
              <button 
                onClick={handleSynthesize}
                disabled={loading}
                className="w-full py-5 premium-gradient text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <Wand2 size={20} />}
                Synthesize Blueprint
              </button>
            </div>
          )}

          {error && (
            <div className="mt-8 flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl w-full animate-in slide-in-from-bottom-2">
              <AlertCircle size={18} className="text-red-500 flex-shrink-0" />
              <p className="text-xs font-bold text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}
        </div>

        <div className="bg-white/70 dark:bg-white/[0.03] backdrop-blur-3xl rounded-[3.5rem] border border-slate-200 dark:border-white/10 shadow-sm flex flex-col overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-black/20 flex justify-between items-center px-10">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Sparkles size={16} className="text-indigo-500" /> Synthesized Neural Logic
            </h3>
            {result && (
              <div className="flex gap-2">
                <button onClick={downloadSVG} className="p-2 bg-indigo-500/10 text-indigo-600 rounded-xl hover:bg-indigo-500 hover:text-white transition-all shadow-sm" title="Download SVG">
                  <Download size={16} />
                </button>
                <button onClick={exportToAnki} className="p-2 bg-emerald-500/10 text-emerald-600 rounded-xl hover:bg-emerald-500 hover:text-white transition-all shadow-sm" title="Export to Anki">
                  <CheckCircle2 size={16} />
                </button>
              </div>
            )}
          </div>

          <div className="flex-1 p-10 overflow-y-auto custom-scrollbar flex flex-col gap-10">
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <div className="relative mb-6">
                  <div className="w-16 h-16 border-4 border-t-transparent border-indigo-500 rounded-full animate-spin"></div>
                  <BrainCircuit className="absolute inset-0 m-auto animate-pulse text-indigo-500" size={24} />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.4em]">Vectorizing Semantic Geometry...</p>
              </div>
            ) : result ? (
              <div className="space-y-12 animate-in fade-in duration-1000">
                <section>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div> Simplified Blueprint
                  </h4>
                  <div className="bg-slate-50 dark:bg-black/40 rounded-[2.5rem] p-8 border border-slate-100 dark:border-white/5 flex items-center justify-center min-h-[300px] shadow-inner">
                    <div dangerouslySetInnerHTML={{ __html: result.svgCode }} className="w-full h-full max-w-full flex justify-center text-indigo-500" />
                  </div>
                </section>

                <section>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Active Recall Nodes
                  </h4>
                  <div className="grid grid-cols-1 gap-4">
                    {result.cards.map((card, i) => (
                      <div key={i} className="p-6 bg-white dark:bg-white/[0.02] rounded-3xl border border-slate-100 dark:border-white/5 hover:border-indigo-500/30 transition-all group">
                        <div className="flex items-start gap-4">
                          <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-[10px] font-black text-slate-500 flex-shrink-0">
                            {i + 1}
                          </div>
                          <div className="flex-1 space-y-2">
                            <p className="text-sm font-black text-slate-900 dark:text-white">{card.front}</p>
                            <p className="text-xs font-medium text-slate-400 leading-relaxed">{card.back}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center opacity-10">
                <BrainCircuit size={100} strokeWidth={1} />
                <p className="text-[12px] font-black uppercase tracking-[0.6em] mt-10">Awaiting Blueprint</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SVGStudyCard;
