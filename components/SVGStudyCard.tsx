
import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, Loader2, Sparkles, Wand2, X, ArrowLeft, BrainCircuit, Zap, CheckCircle2, FileText, Layout, Download, Copy, Trash2, Layers, AlertCircle, Image as ImageIcon, Palette, GraduationCap, ChevronRight, RotateCcw, FileDown, Printer, FileType, FileJson, Check, Info } from 'lucide-react';
import { synthesizeSVGDiagramAndCards, generateVisualAid } from '../services/geminiService';
import { Quiz } from '../types';

const SVGStudyCard: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const [asset, setAsset] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState('');
  const [loading, setLoading] = useState(false);
  const [renderingImage, setRenderingImage] = useState(false);
  const [result, setResult] = useState<{ svgCode: string, cards: { front: string, back: string }[], quiz: Quiz } | null>(null);
  const [renderedImage, setRenderedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [activeTab, setActiveTab] = useState<'blueprint' | 'illustration' | 'cards' | 'quiz'>('blueprint');
  
  // Interactive Node State
  const [selectedNode, setSelectedNode] = useState<{ label: string, description: string } | null>(null);

  // Quiz Interaction State
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  // PDF & Export Hub State
  const [showExportHub, setShowExportHub] = useState(false);
  const [copied, setCopied] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const svgContainerRef = useRef<HTMLDivElement>(null);

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
        setSelectedNode(null);
        setQuizFinished(false);
        setQuizScore(0);
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
    setSelectedNode(null);
    try {
      const output = await synthesizeSVGDiagramAndCards(asset, mimeType);
      let enrichedSvg = output.svgCode;
      if (enrichedSvg.includes('<svg')) {
        // Enhance SVG for accessibility and styles
        enrichedSvg = enrichedSvg.replace('<svg', `<svg role="img" aria-labelledby="blueprint-title" style="max-height: 100%; max-width: 100%;" `);
        enrichedSvg = enrichedSvg.replace('>', `><title id="blueprint-title">Synthesized academic diagram blueprint of ${output.quiz?.title || 'Diagram'}</title><style>[data-node-label] { cursor: pointer; transition: all 0.3s ease; } [data-node-label]:hover { filter: drop-shadow(0 0 5px rgba(99, 102, 241, 0.5)); transform: scale(1.02); transform-origin: center; }</style>`);
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

  // Interaction Handler for SVG Elements
  const handleSVGInteraction = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const group = target.closest('[data-node-label]');
    
    if (group) {
      const label = group.getAttribute('data-node-label');
      const description = group.getAttribute('data-node-description');
      if (label) {
        setSelectedNode({ label, description: description || "No additional neural data available for this node." });
      }
    } else {
        setSelectedNode(null);
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

  const handleQuizAnswer = (opt: string) => {
    if (showExplanation) return;
    setSelectedOption(opt);
    setShowExplanation(true);
    if (opt === result?.quiz?.questions[currentQuizIndex]?.correctAnswer) {
      setQuizScore(prev => prev + 1);
    }
  };

  const nextQuizQuestion = () => {
    if (currentQuizIndex < (result?.quiz?.questions?.length || 0) - 1) {
      setCurrentQuizIndex(prev => prev + 1);
      setSelectedOption(null);
      setShowExplanation(false);
    } else {
      setQuizFinished(true);
    }
  };

  const restartQuiz = () => {
    setCurrentQuizIndex(0);
    setSelectedOption(null);
    setShowExplanation(false);
    setQuizScore(0);
    setQuizFinished(false);
  };

  const downloadSVG = () => {
    if (!result) return;
    const blob = new Blob([result.svgCode], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `blueprint-${Date.now()}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadJSON = () => {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `synthesis-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copySemanticData = () => {
    if (!result) return;
    const text = `Title: ${result.quiz?.title || 'Synthesis'}\n\nFlashcards:\n${result.cards?.map(c => `- ${c.front}: ${c.back}`).join('\n')}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const exportPDF = (type: 'study-guide' | 'diagram-only' | 'assessment-only') => {
    if (!result) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const title = result.quiz?.title || "Academic Study Guide";
    
    let content = '';
    
    if (type === 'study-guide' || type === 'diagram-only') {
      content += `
        <div class="page">
          <div class="badge">Academic Blueprint</div>
          <h1>${title}</h1>
          <div class="diagram-container">${result.svgCode}</div>
          <div class="notes-box">
            <h3>Visual Synthesis Notes</h3>
            <p>This diagram has been architected by the SVGPT Neural Core based on primary scholarly sketches. Reference the labeled nodes for structural mastery.</p>
          </div>
        </div>
      `;
    }

    if (type === 'study-guide') {
      content += `
        <div class="page" style="page-break-before: always;">
          <div class="badge">Recall Nodes</div>
          <h2>Active Recall Library</h2>
          <div class="card-grid">
            ${result.cards?.map(c => `
              <div class="p-card">
                <div class="p-card-f"><strong>Front:</strong> ${c.front}</div>
                <div class="p-card-b"><strong>Back:</strong> ${c.back}</div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    if (type === 'study-guide' || type === 'assessment-only') {
      content += `
        <div class="page" style="page-break-before: always;">
          <div class="badge">Assessment</div>
          <h2>Concept Evaluation: ${title}</h2>
          <div class="quiz-block">
            ${result.quiz?.questions?.map((q, i) => `
              <div class="q-row">
                <p><strong>Q${i + 1}:</strong> ${q.question}</p>
                <div class="opts">
                  ${q.options?.map(o => `<span>□ ${o}</span>`).join('')}
                </div>
              </div>
            `).join('')}
          </div>
          <div class="footer-note">Generated by SVGPT Intelligence Hub • Verified Academic Output</div>
        </div>
      `;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>${title} | PDF Export</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;700;800&display=swap');
            body { font-family: 'Plus Jakarta Sans', sans-serif; margin: 0; color: #1e293b; background: #fff; }
            .page { padding: 40px; max-width: 800px; margin: 0 auto; box-sizing: border-box; }
            h1 { font-weight: 800; font-size: 32px; text-transform: uppercase; margin-bottom: 30px; letter-spacing: -1px; }
            h2 { font-weight: 800; font-size: 20px; text-transform: uppercase; border-bottom: 2px solid #6366f1; padding-bottom: 10px; margin: 40px 0 20px; }
            .badge { display: inline-block; padding: 4px 12px; background: #6366f1; color: #fff; font-size: 10px; font-weight: 800; text-transform: uppercase; border-radius: 4px; margin-bottom: 10px; }
            .diagram-container { padding: 40px; border: 1px solid #e2e8f0; border-radius: 20px; text-align: center; background: #f8fafc; margin-bottom: 30px; }
            svg { max-width: 100%; height: auto; display: block; margin: 0 auto; color: #6366f1; }
            .notes-box { padding: 25px; background: #f1f5f9; border-radius: 16px; font-size: 14px; line-height: 1.6; }
            .notes-box h3 { margin-top: 0; font-size: 12px; text-transform: uppercase; color: #64748b; }
            .card-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
            .p-card { border: 1px solid #cbd5e1; padding: 15px; border-radius: 12px; page-break-inside: avoid; }
            .p-card-f { border-bottom: 1px dashed #e2e8f0; padding-bottom: 10px; margin-bottom: 10px; font-size: 14px; }
            .p-card-b { font-size: 13px; color: #64748b; font-style: italic; }
            .q-row { margin-bottom: 30px; page-break-inside: avoid; }
            .opts { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 10px; padding-left: 20px; }
            .opts span { font-size: 12px; color: #475569; }
            .footer-note { margin-top: 60px; font-size: 10px; font-weight: 700; text-align: center; color: #94a3b8; text-transform: uppercase; letter-spacing: 2px; }
            @media print { .page { width: 210mm; min-height: 297mm; padding: 20mm; } }
          </style>
        </head>
        <body>
          ${content}
          <script>window.onload = () => { window.print(); window.close(); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-8 pb-20 animate-in fade-in duration-700" role="main">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <button onClick={onBack} aria-label="Back to dashboard" className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors group focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-xl">
          <div className="p-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 group-hover:border-indigo-200 shadow-sm">
            <ArrowLeft size={16} aria-hidden="true" />
          </div>
          Back to Dashboard
        </button>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 px-6 py-2 bg-indigo-500/10 rounded-full border border-indigo-500/20">
            <Layers className="text-indigo-600 dark:text-indigo-400" size={16} aria-hidden="true" />
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-700 dark:text-indigo-500">
              Blueprint Synthesis v1.2
            </span>
          </div>
          {result && (
            <div className="relative">
              <button 
                onClick={() => setShowExportHub(!showExportHub)}
                className="px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-2xl hover:scale-105 transition-all"
              >
                <Download size={14} /> Deployment Hub
              </button>
              {showExportHub && (
                <div className="absolute top-full right-0 mt-3 w-72 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-[2rem] shadow-[0_30px_60px_-12px_rgba(0,0,0,0.25)] z-50 p-4 animate-in slide-in-from-top-2 duration-300">
                  <div className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 px-3">Export Assets</div>
                  <div className="space-y-1">
                    <button onClick={() => { exportPDF('study-guide'); setShowExportHub(false); }} className="w-full text-left p-3 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-3">
                      <FileText size={16} className="text-indigo-500" /> Full Study Guide (PDF)
                    </button>
                    <button onClick={() => { exportPDF('assessment-only'); setShowExportHub(false); }} className="w-full text-left p-3 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-3">
                      <GraduationCap size={16} className="text-indigo-500" /> Assessment Only (PDF)
                    </button>
                    <button onClick={() => { downloadSVG(); setShowExportHub(false); }} className="w-full text-left p-3 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-3">
                      <FileType size={16} className="text-indigo-500" /> Vector Blueprint (SVG)
                    </button>
                    <button onClick={() => { downloadJSON(); setShowExportHub(false); }} className="w-full text-left p-3 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-3">
                      <FileJson size={16} className="text-indigo-500" /> Neural JSON Data
                    </button>
                    <button onClick={() => { copySemanticData(); setShowExportHub(false); }} className="w-full text-left p-3 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-3">
                      {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} className="text-indigo-500" />} Copy Study Data
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Side: Input & Asset Handling */}
        <div className="bg-white/70 dark:bg-white/[0.03] backdrop-blur-3xl p-10 rounded-[3.5rem] border border-slate-200 dark:border-white/10 shadow-sm flex flex-col items-center">
          <div className="w-20 h-20 bg-indigo-500/10 rounded-3xl flex items-center justify-center mb-8" aria-hidden="true">
            <Layout className="text-indigo-500" size={32} />
          </div>
          <h2 className="text-3xl font-black tracking-tighter uppercase text-slate-900 dark:text-white mb-2">Diagram Ink-to-Vector</h2>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-10 text-center">Convert sketches into interactive SVGs, Cards & Assessment</p>

          {!asset ? (
            <div 
              role="button" aria-label="Upload sketch" tabIndex={0}
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
                {loading ? 'Vectorizing Semantic Data...' : 'Synthesize Full Package'}
              </button>
            </div>
          )}
        </div>

        {/* Right Side: Tabbed Result Interface */}
        <div className="bg-white/70 dark:bg-white/[0.03] backdrop-blur-3xl rounded-[3.5rem] border border-slate-200 dark:border-white/10 shadow-sm flex flex-col overflow-hidden min-h-[600px]">
          <div className="p-6 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-black/20 flex justify-between items-center px-10">
            <div className="flex gap-6" role="tablist">
              {(['blueprint', 'illustration', 'cards', 'quiz'] as const).map(tab => (
                <button 
                  key={tab} role="tab"
                  aria-selected={activeTab === tab}
                  tabIndex={0}
                  onClick={() => setActiveTab(tab)}
                  className={`text-[10px] font-black uppercase tracking-widest transition-colors focus:outline-none focus:underline border-b-2 py-1 ${activeTab === tab ? 'text-indigo-600 border-indigo-600' : 'text-slate-400 border-transparent'}`}
                >
                  {tab === 'blueprint' ? 'Blueprint' : tab === 'illustration' ? 'Illustration' : tab === 'cards' ? 'Cards' : 'Assessment'}
                </button>
              ))}
            </div>

            {result && activeTab !== 'quiz' && (
              <div className="flex gap-2">
                <button onClick={handleNeuralRender} className="p-2 bg-purple-500/10 text-purple-600 rounded-xl hover:bg-purple-500 hover:text-white transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500" title="Synthesize AI Illustration">
                  <Palette size={16} />
                </button>
                <button onClick={() => exportPDF('diagram-only')} className="p-2 bg-indigo-500/10 text-indigo-600 rounded-xl hover:bg-indigo-500 hover:text-white transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" title="PDF Export">
                  <Printer size={16} />
                </button>
              </div>
            )}
          </div>

          <div className="flex-1 p-10 overflow-y-auto custom-scrollbar flex flex-col gap-10">
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <div className="relative mb-6">
                  <div className="w-16 h-16 border-4 border-t-transparent border-indigo-500 rounded-full animate-spin"></div>
                  <Sparkles className="absolute inset-0 m-auto animate-pulse text-indigo-500" size={24} />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.4em]">Synthesizing Multimodal Nodes...</p>
              </div>
            ) : result ? (
              <div className="h-full animate-in fade-in duration-700">
                {activeTab === 'blueprint' && (
                  <div className="space-y-8 h-full flex flex-col">
                    <div className="bg-indigo-500/5 border border-indigo-500/10 p-4 rounded-2xl flex items-center gap-3">
                       <Info size={16} className="text-indigo-500" />
                       <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Interactive: Click on any labeled component to inspect neural data.</span>
                    </div>

                    <div 
                        ref={svgContainerRef} 
                        onClick={handleSVGInteraction}
                        className="bg-slate-50 dark:bg-black/40 rounded-[2.5rem] p-8 border border-slate-100 dark:border-white/5 flex items-center justify-center min-h-[400px] shadow-inner relative"
                    >
                      <div dangerouslySetInnerHTML={{ __html: result.svgCode }} className="w-full h-full max-w-full flex justify-center text-indigo-500" />
                    </div>

                    {selectedNode && (
                       <div className="animate-in slide-in-from-bottom-4 duration-500">
                          <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border-l-8 border-indigo-500 shadow-2xl relative overflow-hidden">
                             <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                                <Zap size={100} />
                             </div>
                             <div className="flex justify-between items-start mb-4">
                                <div>
                                   <span className="text-[8px] font-black uppercase text-indigo-500 tracking-[0.3em] mb-1 block">Neural Node Inspector</span>
                                   <h4 className="text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white">{selectedNode.label}</h4>
                                </div>
                                <button onClick={() => setSelectedNode(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-colors">
                                   <X size={18} />
                                </button>
                             </div>
                             <p className="text-sm font-medium text-slate-600 dark:text-slate-300 leading-relaxed italic">
                                {selectedNode.description}
                             </p>
                          </div>
                       </div>
                    )}
                  </div>
                )}

                {activeTab === 'illustration' && (
                  <div className="relative bg-slate-50 dark:bg-black/40 rounded-[2.5rem] overflow-hidden border border-slate-100 dark:border-white/5 min-h-[400px] flex items-center justify-center shadow-inner">
                    {renderingImage ? (
                      <div className="flex flex-col items-center gap-4 text-slate-400 animate-pulse">
                        <Loader2 className="animate-spin text-indigo-500" size={48} />
                        <span className="text-[9px] font-black uppercase tracking-widest text-center">Synthesizing Textures & Lighting...</span>
                      </div>
                    ) : renderedImage ? (
                      <div className="w-full h-full group relative">
                        <img src={renderedImage} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]" alt="Neural Illustration" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button onClick={() => { const a = document.createElement('a'); a.href = renderedImage; a.download = 'render.png'; a.click(); }} className="px-8 py-4 bg-white text-slate-900 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-2xl">
                            <Download size={14} /> Download Illustration
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-6 text-center p-12">
                        <ImageIcon size={64} className="text-slate-200" />
                        <p className="text-xs font-bold text-slate-400 max-w-xs leading-relaxed uppercase tracking-widest">Architect High-Fidelity Render from Blueprint</p>
                        <button onClick={handleNeuralRender} className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl active:scale-95 transition-all">Generate Render</button>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'cards' && (
                  <div className="grid grid-cols-1 gap-4">
                    {result.cards?.map((card, i) => (
                      <div key={i} className="p-6 bg-slate-50 dark:bg-white/[0.02] rounded-3xl border border-slate-100 dark:border-white/5 hover:border-indigo-500/30 transition-all flex items-start gap-4 group">
                        <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center text-[10px] font-black text-indigo-500 shadow-sm">{i + 1}</div>
                        <div className="flex-1">
                          <p className="text-sm font-black text-slate-900 dark:text-white mb-1 uppercase tracking-tight">{card.front}</p>
                          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed italic">"{card.back}"</p>
                        </div>
                      </div>
                    )) || <div className="text-center text-slate-400 italic py-10">No cards synthesized.</div>}
                  </div>
                )}

                {activeTab === 'quiz' && (
                  <div className="h-full flex flex-col">
                    {/* Header matching user's "Artificial Intelligence Fundamentals" reference */}
                    <div className="bg-white dark:bg-white/[0.04] p-8 md:p-10 rounded-[2.5rem] border border-slate-200 dark:border-white/10 shadow-2xl backdrop-blur-xl mb-10 flex flex-wrap items-center justify-between gap-6">
                        <h3 className="text-2xl md:text-3xl font-[900] text-slate-900 dark:text-white tracking-tighter uppercase leading-none">
                            {result.quiz?.title || "Concept Assessment"}
                        </h3>
                        <button 
                            onClick={() => exportPDF('assessment-only')}
                            className="px-8 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
                        >
                            <Printer size={18} className="text-indigo-50" /> PRINT EVALUATION
                        </button>
                    </div>

                    {!quizFinished && result.quiz?.questions ? (
                      <div className="flex-1 flex flex-col animate-in slide-in-from-right-4">
                         <div className="mb-8 flex justify-between items-center bg-indigo-500/5 p-4 rounded-2xl border border-indigo-500/10">
                            <div className="flex flex-col">
                               <span className="text-[8px] font-black uppercase text-indigo-500 mb-1">Assessment Phase</span>
                               <h4 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">Question {currentQuizIndex + 1} / {result.quiz.questions.length}</h4>
                            </div>
                            <div className="text-xs font-black text-slate-400">Score: {quizScore}</div>
                         </div>

                         <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white mb-10 leading-relaxed">
                            {result.quiz.questions[currentQuizIndex]?.question}
                         </h3>

                         <div className="space-y-3 flex-1">
                            {result.quiz.questions[currentQuizIndex]?.options?.map((opt, idx) => {
                               const isCorrect = opt === result.quiz.questions[currentQuizIndex].correctAnswer;
                               const isSelected = selectedOption === opt;
                               let btnClass = "w-full text-left p-5 rounded-2xl border-2 transition-all font-bold text-sm ";
                               
                               if (showExplanation) {
                                  if (isCorrect) btnClass += "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300";
                                  else if (isSelected) btnClass += "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300";
                                  else btnClass += "border-slate-100 dark:border-white/5 opacity-50";
                               } else {
                                  btnClass += "border-slate-100 dark:border-white/5 hover:border-indigo-400 bg-white dark:bg-black/20 text-slate-700 dark:text-slate-300";
                               }

                               return (
                                  <button key={idx} onClick={() => handleQuizAnswer(opt)} className={btnClass}>
                                     {opt}
                                  </button>
                               );
                            }) || <div className="italic text-slate-400">Question options unavailable.</div>}
                         </div>

                         {showExplanation && (
                            <div className="mt-8 animate-in fade-in slide-in-from-bottom-2">
                               <div className="p-6 bg-slate-50 dark:bg-black/40 rounded-2xl border border-slate-200 dark:border-white/5 mb-6">
                                  <p className="text-xs font-bold text-slate-600 dark:text-slate-400 leading-relaxed italic">
                                     <strong>Feedback:</strong> {result.quiz.questions[currentQuizIndex]?.explanation || "Neural node explanation missing."}
                                  </p>
                               </div>
                               <button onClick={nextQuizQuestion} className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3 shadow-xl">
                                  Next Step <ChevronRight size={18} />
                               </button>
                            </div>
                         )}
                      </div>
                    ) : quizFinished ? (
                      <div className="h-full flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-700">
                         <div className="w-24 h-24 bg-indigo-500/10 rounded-[2.5rem] flex items-center justify-center text-indigo-500 mb-8 animate-bounce shadow-inner">
                            <GraduationCap size={48} />
                         </div>
                         <h2 className="text-4xl font-black tracking-tighter uppercase mb-2">Mastery Confirmed</h2>
                         <p className="text-slate-500 dark:text-slate-400 mb-10 text-lg font-medium">Final Score: <span className="text-indigo-500 font-black">{quizScore} / {result.quiz?.questions?.length || 0}</span></p>
                         <div className="flex gap-4">
                            <button onClick={restartQuiz} className="px-10 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black uppercase text-xs tracking-widest shadow-2xl active:scale-95 transition-all">Repeat Cycle</button>
                            <button onClick={() => setActiveTab('blueprint')} className="px-10 py-4 bg-white dark:bg-slate-800 text-slate-500 rounded-2xl font-black uppercase text-xs tracking-widest border border-slate-200 dark:border-white/10 hover:bg-slate-50 transition-all">Study Blueprint</button>
                         </div>
                      </div>
                    ) : (
                      <div className="text-center text-slate-400 italic py-10">Quiz data unavailable for this blueprint.</div>
                    )}
                  </div>
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
