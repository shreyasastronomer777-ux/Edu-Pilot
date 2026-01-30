import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, Loader2, Sparkles, Wand2, X, ArrowLeft, BrainCircuit, Zap, CheckCircle2, FileText, Layout, Download, Copy, Trash2, Layers, AlertCircle, Image as ImageIcon, Palette } from 'lucide-react';
import { synthesizeSVGDiagramAndCards, generateVisualAid } from '../services/geminiService';

const SVGStudyCard: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const [asset, setAsset] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState('');
  const [loading, setLoading] = useState(false);
  const [renderingImage, setRenderingImage] = useState(false);
  const [result, setResult] = useState<{ svgCode: string, cards: { front: string, back: string }[] } | null>(null);
  const [renderedImage, setRenderedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [activeTab, setActiveTab] = useState<'blueprint' | 'illustration' | 'cards'>('blueprint');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const svgContainerRef = useRef<HTMLDivElement>(null);

  // Keyboard navigation for tabs
  const handleTabKeyDown = (e: React.KeyboardEvent, tab: 'blueprint' | 'illustration' | 'cards') => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setActiveTab(tab);
    }
  };

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
        setRenderedImage(null);
        setActiveTab('blueprint');
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
      
      // Inject ARIA attributes into raw SVG code
      let enrichedSvg = output.svgCode;
      if (enrichedSvg.includes('<svg')) {
        enrichedSvg = enrichedSvg.replace('<svg', `<svg role="img" aria-label="Synthesized academic diagram blueprint" `);
      }
      
      setResult({ ...output, svgCode: enrichedSvg });
      
      const currentPoints = Number(localStorage.getItem('svgpt_xp')) || 0;
      localStorage.setItem('svgpt_xp', (currentPoints + 100).toString());
    } catch (e) {
      setError("Neural rendering failed. Ensure your drawing is clear and legible.");
    } finally {
      setLoading(false);
    }
  };

  const handleNeuralRender = async () => {
    if (!result?.svgCode) return;
    setRenderingImage(true);
    setActiveTab('illustration');
    try {
      const prompt = `A professional, realistic, and detailed academic illustration based on this diagram structure. The image should be clear, educational, and suitable for a textbook. Structure details: ${result.svgCode.substring(0, 500)}`;
      const imageUrl = await generateVisualAid(prompt);
      setRenderedImage(imageUrl);
    } catch (e) {
      setError("Neural illustration synthesis failed.");
    } finally {
      setRenderingImage(false);
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

  const exportAsPNG = () => {
    if (!result?.svgCode) return;
    
    const svg = svgContainerRef.current?.querySelector('svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    const svgSize = svg.getBoundingClientRect();
    canvas.width = (svgSize.width || 800) * 2;
    canvas.height = (svgSize.height || 600) * 2;
    
    img.onload = () => {
      if (ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const pngUrl = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = pngUrl;
        a.download = `svgpt-image-${Date.now()}.png`;
        a.click();
      }
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
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
    <div className="max-w-6xl mx-auto flex flex-col gap-8 pb-20 animate-in fade-in duration-700" role="main">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <button 
          onClick={onBack} 
          aria-label="Back to dashboard"
          className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors group focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-xl"
        >
          <div className="p-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 group-hover:border-indigo-200 shadow-sm">
            <ArrowLeft size={16} aria-hidden="true" />
          </div>
          Back to Dashboard
        </button>
        <div className="flex items-center gap-3 px-6 py-2 bg-indigo-500/10 rounded-full border border-indigo-500/20">
          <Layers className="text-indigo-600 dark:text-indigo-400" size={16} aria-hidden="true" />
          <span className="text-[10px] font-black uppercase tracking-widest text-indigo-700 dark:text-indigo-500">
            Blueprint Synthesis v1.1
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white/70 dark:bg-white/[0.03] backdrop-blur-3xl p-10 rounded-[3.5rem] border border-slate-200 dark:border-white/10 shadow-sm flex flex-col items-center">
          <div className="w-20 h-20 bg-indigo-500/10 rounded-3xl flex items-center justify-center mb-8" aria-hidden="true">
            <Layout className="text-indigo-500" size={32} />
          </div>
          <h2 className="text-3xl font-black tracking-tighter uppercase text-slate-900 dark:text-white mb-2">Diagram Ink-to-Vector</h2>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-10 text-center">Convert sketches into clean SVGs and Anki Cards</p>

          {!asset ? (
            <div 
              role="button"
              aria-label="Upload sketch"
              tabIndex={0}
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && fileInputRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={e => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files[0]; if(f) processFile(f); }}
              className={`w-full aspect-[4/3] border-4 border-dashed rounded-[3rem] flex flex-col items-center justify-center cursor-pointer transition-all duration-300 group relative focus:outline-none focus:ring-4 focus:ring-indigo-500/50 ${isDragging ? 'border-indigo-500 bg-indigo-500/5 ring-8 ring-indigo-500/10' : 'border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5'}`}
            >
              <div className={`absolute inset-0 bg-indigo-500/5 rounded-[2.8rem] opacity-0 transition-opacity duration-300 ${isDragging ? 'opacity-100' : ''}`}></div>
              <Upload size={48} className={`transition-colors mb-4 ${isDragging ? 'text-indigo-500 scale-110' : 'text-slate-200 group-hover:text-indigo-500'}`} aria-hidden="true" />
              <span className="text-xs font-black uppercase tracking-[0.2em] px-8 text-center text-slate-400">
                {isDragging ? 'Drop Diagram Now' : 'Click or Drop Your Sketch (PNG/JPG)'}
              </span>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} aria-hidden="true" />
            </div>
          ) : (
            <div className="w-full flex flex-col items-center">
              <div className="relative w-full aspect-[4/3] rounded-[3rem] overflow-hidden border border-slate-200 dark:border-white/10 group mb-8 shadow-2xl bg-slate-50 dark:bg-black/20 flex items-center justify-center">
                <img src={asset} className="w-full h-full object-contain" alt="Uploaded sketch preview" />
                <button 
                  onClick={() => { setAsset(null); setResult(null); setRenderedImage(null); }} 
                  aria-label="Clear uploaded asset"
                  className="absolute top-6 right-6 p-3 bg-white/90 rounded-2xl text-red-500 shadow-xl hover:scale-110 transition-transform focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <X size={20} aria-hidden="true" />
                </button>
              </div>
              <button 
                onClick={handleSynthesize}
                disabled={loading}
                aria-busy={loading}
                className="w-full py-5 premium-gradient text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 focus:outline-none focus:ring-4 focus:ring-indigo-500/50"
              >
                {loading ? <Loader2 className="animate-spin" size={20} aria-hidden="true" /> : <Wand2 size={20} aria-hidden="true" />}
                {loading ? 'Vectorizing...' : 'Synthesize Blueprint'}
              </button>
            </div>
          )}

          {error && (
            <div className="mt-8 flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl w-full animate-in slide-in-from-bottom-2" role="alert">
              <AlertCircle size={18} className="text-red-500 flex-shrink-0" aria-hidden="true" />
              <p className="text-xs font-bold text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}
        </div>

        <div className="bg-white/70 dark:bg-white/[0.03] backdrop-blur-3xl rounded-[3.5rem] border border-slate-200 dark:border-white/10 shadow-sm flex flex-col overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-black/20 flex justify-between items-center px-10">
            <div className="flex gap-4" role="tablist" aria-label="Synthesis output tabs">
              <button 
                role="tab"
                aria-selected={activeTab === 'blueprint'}
                aria-controls="blueprint-panel"
                tabIndex={0}
                onClick={() => setActiveTab('blueprint')}
                onKeyDown={(e) => handleTabKeyDown(e, 'blueprint')}
                className={`text-[10px] font-black uppercase tracking-widest transition-colors focus:outline-none focus:underline ${activeTab === 'blueprint' ? 'text-indigo-600' : 'text-slate-400'}`}
              >
                Vector
              </button>
              {result && (
                <button 
                  role="tab"
                  aria-selected={activeTab === 'illustration'}
                  aria-controls="illustration-panel"
                  tabIndex={0}
                  onClick={() => setActiveTab('illustration')}
                  onKeyDown={(e) => handleTabKeyDown(e, 'illustration')}
                  className={`text-[10px] font-black uppercase tracking-widest transition-colors focus:outline-none focus:underline ${activeTab === 'illustration' ? 'text-indigo-600' : 'text-slate-400'}`}
                >
                  Neural Render
                </button>
              )}
              <button 
                role="tab"
                aria-selected={activeTab === 'cards'}
                aria-controls="cards-panel"
                tabIndex={0}
                onClick={() => setActiveTab('cards')}
                onKeyDown={(e) => handleTabKeyDown(e, 'cards')}
                className={`text-[10px] font-black uppercase tracking-widest transition-colors focus:outline-none focus:underline ${activeTab === 'cards' ? 'text-indigo-600' : 'text-slate-400'}`}
              >
                Recall Cards
              </button>
            </div>

            {result && (
              <div className="flex gap-2" role="toolbar" aria-label="Diagram actions">
                <button onClick={handleNeuralRender} className="p-2 bg-purple-500/10 text-purple-600 rounded-xl hover:bg-purple-500 hover:text-white transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500" title="Synthesize AI Image" aria-label="Synthesize AI Image">
                  <Palette size={16} aria-hidden="true" />
                </button>
                <button onClick={exportAsPNG} className="p-2 bg-indigo-500/10 text-indigo-600 rounded-xl hover:bg-indigo-500 hover:text-white transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" title="Export as PNG" aria-label="Export as PNG">
                  <ImageIcon size={16} aria-hidden="true" />
                </button>
                <button onClick={downloadSVG} className="p-2 bg-indigo-500/10 text-indigo-600 rounded-xl hover:bg-indigo-500 hover:text-white transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" title="Download SVG" aria-label="Download SVG">
                  <Download size={16} aria-hidden="true" />
                </button>
                <button onClick={exportToAnki} className="p-2 bg-emerald-500/10 text-emerald-600 rounded-xl hover:bg-emerald-500 hover:text-white transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" title="Export to Anki" aria-label="Export to Anki">
                  <CheckCircle2 size={16} aria-hidden="true" />
                </button>
              </div>
            )}
          </div>

          <div className="flex-1 p-10 overflow-y-auto custom-scrollbar flex flex-col gap-10" aria-live="polite">
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <div className="relative mb-6">
                  <div className="w-16 h-16 border-4 border-t-transparent border-indigo-500 rounded-full animate-spin"></div>
                  <BrainCircuit className="absolute inset-0 m-auto animate-pulse text-indigo-500" size={24} aria-hidden="true" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.4em]">Vectorizing Semantic Geometry...</p>
              </div>
            ) : result ? (
              <div className="space-y-12 animate-in fade-in duration-1000">
                {activeTab === 'blueprint' && (
                  <section id="blueprint-panel" role="tabpanel" aria-labelledby="blueprint-tab">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" aria-hidden="true"></div> Architectural Blueprint (SVG)
                    </h4>
                    <div 
                      ref={svgContainerRef} 
                      tabIndex={0}
                      aria-label="Interactive SVG diagram"
                      className="bg-slate-50 dark:bg-black/40 rounded-[2.5rem] p-8 border border-slate-100 dark:border-white/5 flex items-center justify-center min-h-[300px] shadow-inner focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <div dangerouslySetInnerHTML={{ __html: result.svgCode }} className="w-full h-full max-w-full flex justify-center text-indigo-500" />
                    </div>
                  </section>
                )}

                {activeTab === 'illustration' && (
                  <section id="illustration-panel" role="tabpanel" aria-labelledby="illustration-tab">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-500" aria-hidden="true"></div> Neural Rendered Illustration
                    </h4>
                    <div className="relative bg-slate-50 dark:bg-black/40 rounded-[2.5rem] overflow-hidden border border-slate-100 dark:border-white/5 min-h-[300px] flex items-center justify-center shadow-inner">
                       {renderingImage ? (
                         <div className="flex flex-col items-center gap-4 text-slate-400 animate-pulse">
                            <ImageIcon size={48} aria-hidden="true" />
                            <span className="text-[9px] font-black uppercase tracking-widest">Synthesizing High-Res Asset...</span>
                         </div>
                       ) : renderedImage ? (
                         <div className="w-full h-full group relative">
                            <img src={renderedImage} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]" alt="Neural high-fidelity render of the diagram" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                               <button 
                                 onClick={() => {
                                   const a = document.createElement('a');
                                   a.href = renderedImage;
                                   a.download = `svgpt-render-${Date.now()}.png`;
                                   a.click();
                                 }}
                                 aria-label="Save illustration to device"
                                 className="px-6 py-3 bg-white text-slate-900 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-2xl focus:outline-none focus:ring-2 focus:ring-white"
                               >
                                  <Download size={14} aria-hidden="true" /> Save Illustration
                               </button>
                            </div>
                         </div>
                       ) : (
                         <div className="flex flex-col items-center gap-6 p-10 text-center">
                            <ImageIcon size={48} className="text-slate-200" aria-hidden="true" />
                            <p className="text-xs font-medium text-slate-400 max-w-xs leading-relaxed">Transform your vector blueprint into a high-fidelity academic illustration using the SVGPT Visual Core.</p>
                            <button 
                              onClick={handleNeuralRender}
                              className="px-8 py-3 bg-indigo-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                              Initialize Rendering
                            </button>
                         </div>
                       )}
                    </div>
                  </section>
                )}

                {activeTab === 'cards' && (
                  <section id="cards-panel" role="tabpanel" aria-labelledby="cards-tab">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" aria-hidden="true"></div> Active Recall Nodes
                    </h4>
                    <div className="grid grid-cols-1 gap-4" role="list">
                      {result.cards.map((card, i) => (
                        <div key={i} role="listitem" className="p-6 bg-white dark:bg-white/[0.02] rounded-3xl border border-slate-100 dark:border-white/5 hover:border-indigo-500/30 transition-all group focus-within:ring-2 focus-within:ring-indigo-500">
                          <div className="flex items-start gap-4">
                            <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-[10px] font-black text-slate-500 flex-shrink-0" aria-hidden="true">
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
                )}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center opacity-10" aria-hidden="true">
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