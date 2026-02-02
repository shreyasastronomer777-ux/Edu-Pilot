import React, { useState, useRef, useEffect } from 'react';
import { Layers, Plus, RotateCcw, ChevronLeft, ChevronRight, Trash2, Check, PlayCircle, Wand2, Loader2, Sparkles, Upload, FileUp, X, FileText, Image as ImageIcon, ClipboardPaste } from 'lucide-react';
import { convertNotesToFlashcards, convertAssetToFlashcards } from '../services/geminiService';

interface Card {
  id: string;
  front: string;
  back: string;
}

interface Deck {
  id: string;
  title: string;
  cards: Card[];
}

const Flashcards: React.FC = () => {
  const [decks, setDecks] = useState<Deck[]>(() => {
    const saved = localStorage.getItem('svgpt_flashcard_decks');
    return saved ? JSON.parse(saved) : [
      {
        id: '1',
        title: 'Biology 101',
        cards: [
          { id: 'c1', front: 'Mitochondria', back: 'The powerhouse of the cell.' },
          { id: 'c2', front: 'Photosynthesis', back: 'Process by which plants use sunlight to synthesize foods.' }
        ]
      }
    ];
  });

  const [activeDeck, setActiveDeck] = useState<Deck | null>(null);
  const [studyMode, setStudyMode] = useState(false);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  
  // File & Paste State
  const [stagedFile, setStagedFile] = useState<{data: string, type: string, name: string} | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Study Session State
  const [studyQueue, setStudyQueue] = useState<Card[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [finishedSession, setFinishedSession] = useState(false);

  // UI State
  const [newDeckName, setNewDeckName] = useState('');
  const [showCreateDeck, setShowCreateDeck] = useState(false);

  useEffect(() => {
    localStorage.setItem('svgpt_flashcard_decks', JSON.stringify(decks));
  }, [decks]);

  // Clipboard Paste Support
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1 || items[i].type === 'application/pdf') {
          const file = items[i].getAsFile();
          if (file) processStagedFile(file);
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  const createDeck = () => {
    if (newDeckName.trim()) {
      const newD = { id: Date.now().toString(), title: newDeckName, cards: [] };
      setDecks([...decks, newD]);
      setNewDeckName('');
      setShowCreateDeck(false);
      setActiveDeck(newD);
    }
  };

  const processStagedFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      setStagedFile({
        data: event.target?.result as string,
        type: file.type,
        name: file.name || `Pasted Asset ${new Date().toLocaleTimeString()}`
      });
      setNoteContent('');
    };
    reader.readAsDataURL(file);
  };

  const handleNeuralSynthesis = async () => {
    if ((!noteContent && !stagedFile) || !activeDeck) return;
    setIsSynthesizing(true);
    try {
      let newCards;
      if (stagedFile) {
        newCards = await convertAssetToFlashcards(stagedFile.data, stagedFile.type);
      } else {
        newCards = await convertNotesToFlashcards(noteContent);
      }
      
      const formattedCards = newCards.map(c => ({ ...c, id: Math.random().toString(36).substr(2, 9) }));
      const updatedDeck = {
        ...activeDeck,
        cards: [...activeDeck.cards, ...formattedCards]
      };
      setDecks(decks.map(d => d.id === activeDeck.id ? updatedDeck : d));
      setActiveDeck(updatedDeck);
      setNoteContent('');
      setStagedFile(null);
    } catch (e) {
      alert("Neural synthesis interrupted. Please ensure the content is legible.");
    } finally {
      setIsSynthesizing(false);
    }
  };

  const startStudy = () => {
    if(activeDeck && activeDeck.cards.length > 0) {
      setStudyQueue([...activeDeck.cards].sort(() => Math.random() - 0.5));
      setCurrentCardIndex(0);
      setIsFlipped(false);
      setFinishedSession(false);
      setStudyMode(true);
    }
  };

  const handleRating = (difficulty: 'again' | 'hard' | 'good' | 'easy') => {
    setIsFlipped(false);
    setTimeout(() => {
      if (difficulty === 'again') {
        setStudyQueue(prev => [...prev, prev[currentCardIndex]]);
      }
      if (currentCardIndex < studyQueue.length - 1) {
        setCurrentCardIndex(prev => prev + 1);
      } else {
        setFinishedSession(true);
      }
    }, 300);
  };

  return (
    <div className="max-w-5xl mx-auto h-[calc(100vh-6rem)] flex flex-col">
       <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-600">
                <Layers size={24} />
             </div>
             <div>
                <h2 className="text-3xl font-black tracking-tighter uppercase text-slate-900 dark:text-white">Flash-Recall</h2>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Neural Spaced Repetition</p>
             </div>
          </div>
          <div className="flex gap-3">
             {activeDeck && !studyMode && (
               <button onClick={() => setActiveDeck(null)} className="px-6 py-2.5 bg-slate-100 dark:bg-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-indigo-600 transition-all">Archive</button>
             )}
             {!studyMode && (
               <button onClick={() => setShowCreateDeck(true)} className="px-6 py-2.5 premium-gradient text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20 active:scale-95 transition-all flex items-center gap-2">
                 <Plus size={14} /> New Deck
               </button>
             )}
          </div>
       </div>

       {showCreateDeck && (
          <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
             <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-white/10 shadow-2xl w-full max-w-md animate-in zoom-in-95">
                <h3 className="text-xl font-black uppercase mb-6 text-slate-900 dark:text-white">Initialize New Archive</h3>
                <input 
                  autoFocus value={newDeckName} onChange={e => setNewDeckName(e.target.value)}
                  placeholder="e.g. Molecular Chemistry"
                  className="w-full px-6 py-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 font-bold mb-6 outline-none focus:ring-4 focus:ring-indigo-500/10"
                />
                <div className="flex gap-3">
                   <button onClick={() => setShowCreateDeck(false)} className="flex-1 py-4 bg-slate-100 dark:bg-white/5 rounded-2xl font-black uppercase text-[10px] text-slate-500">Cancel</button>
                   <button onClick={createDeck} className="flex-1 py-4 premium-gradient text-white rounded-2xl font-black uppercase text-[10px] shadow-xl">Synthesize Deck</button>
                </div>
             </div>
          </div>
       )}

       <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
          {!activeDeck && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {decks.map(deck => (
                 <div key={deck.id} onClick={() => setActiveDeck(deck)} className="group bg-white/70 dark:bg-white/[0.03] p-8 rounded-[2.5rem] border border-slate-200 dark:border-white/10 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all cursor-pointer relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity">
                       <button onClick={(e) => { e.stopPropagation(); setDecks(decks.filter(d => d.id !== deck.id)); }} className="p-2 text-slate-300 hover:text-red-500"><Trash2 size={16} /></button>
                    </div>
                    <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl shadow-inner flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                       <Layers size={20} className="text-orange-500" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2 truncate group-hover:text-indigo-500 transition-colors">{deck.title}</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{deck.cards.length} Synthesis Nodes</p>
                 </div>
               ))}
            </div>
          )}

          {activeDeck && !studyMode && (
            <div className="flex flex-col h-full gap-8 animate-in fade-in slide-in-from-bottom-4">
               <div className="bg-slate-900 dark:bg-white p-8 rounded-[3rem] text-white dark:text-slate-900 flex flex-col md:flex-row justify-between items-center gap-6 shadow-2xl relative overflow-hidden">
                  <div className="absolute inset-0 opacity-10 pointer-events-none">
                     <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
                  </div>
                  <div className="relative z-10 text-center md:text-left">
                     <h3 className="text-3xl font-black tracking-tighter uppercase mb-1">{activeDeck.title}</h3>
                     <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-60">Archive Ready for Recall</p>
                  </div>
                  <button onClick={startStudy} disabled={activeDeck.cards.length === 0} className="relative z-10 px-10 py-5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-[1.5rem] font-black uppercase text-[11px] tracking-widest flex items-center gap-3 shadow-2xl active:scale-95 transition-all disabled:opacity-30">
                     <PlayCircle size={20} /> Initialize Session
                  </button>
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-white/70 dark:bg-white/[0.03] p-10 rounded-[3rem] border border-slate-200 dark:border-white/10 shadow-sm flex flex-col items-center">
                     <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 mb-8">
                        <Wand2 size={32} />
                     </div>
                     <h4 className="text-2xl font-black uppercase tracking-tighter text-slate-900 dark:text-white mb-2">Neural Scribe</h4>
                     <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-8 text-center">Paste text, images, or PDFs to synthesize cards</p>

                     <div 
                       onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                       onDragLeave={() => setIsDragging(false)}
                       onDrop={e => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files[0]; if(f) processStagedFile(f); }}
                       className={`w-full min-h-[250px] rounded-[2rem] border-4 border-dashed p-6 flex flex-col transition-all duration-500 ${stagedFile ? 'border-indigo-500 bg-indigo-500/5' : isDragging ? 'border-indigo-500 bg-indigo-500/5 scale-[1.02]' : 'border-slate-100 dark:border-white/5 hover:bg-slate-50'}`}
                     >
                        {!stagedFile ? (
                           <textarea 
                             value={noteContent} onChange={e => setNoteContent(e.target.value)}
                             placeholder="Paste notes here or hit Ctrl+V to paste an image..."
                             className="flex-1 bg-transparent border-none outline-none resize-none font-medium text-sm text-slate-600 dark:text-slate-300 placeholder:text-slate-300"
                           />
                        ) : (
                           <div className="flex-1 flex flex-col items-center justify-center gap-4 relative">
                              <button onClick={() => setStagedFile(null)} className="absolute top-0 right-0 p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"><X size={20}/></button>
                              {stagedFile.type.includes('image') ? <div className="w-full h-40 rounded-xl overflow-hidden border border-white/10 shadow-lg"><img src={stagedFile.data} className="w-full h-full object-cover"/></div> : <FileText size={64} className="text-indigo-500 animate-pulse"/>}
                              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 truncate max-w-full px-4">{stagedFile.name}</span>
                           </div>
                        )}
                        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-white/5 flex justify-between items-center">
                           <button onClick={() => fileInputRef.current?.click()} className="text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-500 flex items-center gap-2"><ClipboardPaste size={14}/> Paste/Attach</button>
                           <input ref={fileInputRef} type="file" className="hidden" accept="image/*,application/pdf" onChange={e => e.target.files?.[0] && processStagedFile(e.target.files[0])} />
                           <button onClick={handleNeuralSynthesis} disabled={isSynthesizing || (!noteContent && !stagedFile)} className="px-6 py-3 premium-gradient text-white rounded-xl text-[10px] font-black uppercase shadow-xl disabled:opacity-50">
                              {isSynthesizing ? <Loader2 size={14} className="animate-spin mr-2 inline"/> : <Sparkles size={14} className="mr-2 inline"/>}
                              Synthesize
                           </button>
                        </div>
                     </div>
                  </div>

                  <div className="bg-white/70 dark:bg-white/[0.03] p-10 rounded-[3rem] border border-slate-200 dark:border-white/10 shadow-sm flex flex-col overflow-hidden">
                     <div className="flex items-center justify-between mb-8">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Synthesis Archive</h4>
                        <span className="px-3 py-1 bg-slate-100 dark:bg-white/5 rounded-full text-[9px] font-black text-slate-500 uppercase">{activeDeck.cards.length} Nodes</span>
                     </div>
                     <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-2">
                        {activeDeck.cards.length === 0 ? (
                           <div className="h-full flex flex-col items-center justify-center opacity-10">
                              <Layers size={64} />
                              <p className="font-black uppercase tracking-widest mt-4">Vacant Repository</p>
                           </div>
                        ) : (
                           activeDeck.cards.map((card, i) => (
                              <div key={card.id} className="p-5 bg-white dark:bg-black/20 rounded-2xl border border-slate-100 dark:border-white/5 hover:border-indigo-500/30 transition-all group">
                                 <div className="flex justify-between items-start mb-2">
                                    <span className="text-[9px] font-black uppercase text-indigo-500">Node {i+1}</span>
                                    <button onClick={() => {
                                       const updated = { ...activeDeck, cards: activeDeck.cards.filter(c => c.id !== card.id) };
                                       setDecks(decks.map(d => d.id === activeDeck.id ? updated : d));
                                       setActiveDeck(updated);
                                    }} className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-300 hover:text-red-500"><X size={14}/></button>
                                 </div>
                                 <p className="text-sm font-bold text-slate-800 dark:text-white mb-1">{card.front}</p>
                                 <p className="text-xs font-medium text-slate-400 leading-relaxed">{card.back}</p>
                              </div>
                           ))
                        )}
                     </div>
                  </div>
               </div>
            </div>
          )}

          {activeDeck && studyMode && !finishedSession && (
             <div className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto px-4 animate-in fade-in zoom-in-95">
                <div className="w-full mb-8 flex justify-between items-center">
                   <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500">Recall Progress</span>
                      <h4 className="text-xl font-black text-slate-900 dark:text-white">{currentCardIndex + 1} / {studyQueue.length}</h4>
                   </div>
                   <div className="w-32 h-2 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden shadow-inner">
                      <div className="h-full bg-indigo-500 transition-all duration-500" style={{ width: `${((currentCardIndex+1)/studyQueue.length)*100}%` }}></div>
                   </div>
                </div>

                <div 
                  className="w-full aspect-[3/2] cursor-pointer group [perspective:1200px]"
                  onClick={() => setIsFlipped(!isFlipped)}
                >
                   <div className={`relative w-full h-full duration-700 [transform-style:preserve-3d] transition-transform ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}>
                      <div className="absolute inset-0 [backface-visibility:hidden] bg-white dark:bg-slate-800 rounded-[3rem] border-2 border-slate-200 dark:border-slate-700 shadow-2xl flex flex-col items-center justify-center p-8 md:p-12 text-center group-hover:border-indigo-500 transition-colors">
                         <div className="absolute top-10 w-10 h-1 text-slate-100 dark:text-slate-700 rounded-full"></div>
                         <div className="flex-1 w-full flex items-center justify-center overflow-y-auto custom-scrollbar pt-10 pb-16 px-4">
                            <h3 className="text-xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                              {studyQueue[currentCardIndex].front}
                            </h3>
                         </div>
                         <div className="absolute bottom-6 flex items-center gap-2 opacity-20 group-hover:opacity-40 transition-opacity">
                            <RotateCcw size={16} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Neural Flip</span>
                         </div>
                      </div>
                      <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] bg-indigo-600 dark:bg-indigo-900 rounded-[3rem] shadow-2xl flex flex-col items-center justify-center p-8 md:p-12 text-center text-white">
                         <div className="flex-1 w-full flex items-center justify-center overflow-y-auto custom-scrollbar py-10 px-4">
                            <p className="text-lg md:text-2xl font-bold leading-relaxed tracking-tight">
                              {studyQueue[currentCardIndex].back}
                            </p>
                         </div>
                      </div>
                   </div>
                </div>

                <div className="h-32 flex items-center justify-center w-full mt-10">
                   {isFlipped ? (
                      <div className="flex gap-4 animate-in slide-in-from-bottom-4 w-full justify-center">
                         <button onClick={() => handleRating('again')} className="group flex flex-col items-center gap-2 px-6 py-4 rounded-3xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-lg active:scale-95">
                            <span className="text-xs font-black uppercase">Again</span>
                            <span className="text-[8px] font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Neural Reset</span>
                         </button>
                         <button onClick={() => handleRating('hard')} className="group flex flex-col items-center gap-2 px-6 py-4 rounded-3xl bg-orange-500/10 text-orange-500 hover:bg-orange-500 hover:text-white transition-all shadow-lg active:scale-95">
                            <span className="text-xs font-black uppercase">Hard</span>
                            <span className="text-[8px] font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Deep Synthesis</span>
                         </button>
                         <button onClick={() => handleRating('good')} className="group flex flex-col items-center gap-2 px-6 py-4 rounded-3xl bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500 hover:text-white transition-all shadow-lg active:scale-95">
                            <span className="text-xs font-black uppercase">Good</span>
                            <span className="text-[8px] font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Confirmed</span>
                         </button>
                         <button onClick={() => handleRating('easy')} className="group flex flex-col items-center gap-2 px-6 py-4 rounded-3xl bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all shadow-lg active:scale-95">
                            <span className="text-xs font-black uppercase">Easy</span>
                            <span className="text-[8px] font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Mastered</span>
                         </button>
                      </div>
                   ) : (
                      <button onClick={() => setIsFlipped(true)} className="px-14 py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black uppercase text-xs tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all">Reveal Synthesis</button>
                   )}
                </div>
             </div>
          )}

          {finishedSession && (
             <div className="flex flex-col items-center justify-center h-full text-center animate-in zoom-in-95 duration-700">
                <div className="w-24 h-24 bg-indigo-500/10 rounded-[2.5rem] flex items-center justify-center text-indigo-500 mb-8 animate-bounce shadow-inner">
                   <Sparkles size={48} />
                </div>
                <h2 className="text-4xl font-black tracking-tighter uppercase text-slate-900 dark:text-white mb-2">Recall Optimized</h2>
                <p className="text-slate-500 dark:text-slate-400 mb-12 text-lg font-medium">Neural pathways for {activeDeck?.title} successfully reinforced.</p>
                <div className="flex gap-4">
                   <button onClick={() => { setStudyMode(false); setFinishedSession(false); }} className="px-10 py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black uppercase text-xs tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all">Archive Repository</button>
                   <button onClick={startStudy} className="px-10 py-5 bg-white dark:bg-slate-800 text-slate-500 rounded-2xl font-black uppercase text-xs tracking-widest border border-slate-200 dark:border-white/10 hover:bg-slate-50 transition-all">Repeat Cycle</button>
                </div>
             </div>
          )}
       </div>
    </div>
  );
};

export default Flashcards;