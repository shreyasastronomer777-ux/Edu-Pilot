
import React, { useState, useRef } from 'react';
import { Layers, Plus, RotateCcw, ChevronLeft, ChevronRight, Trash2, Edit2, Check, PlayCircle, BarChart3, Wand2, Loader2, Sparkles, Upload, FileUp, X, FileText, Image as ImageIcon } from 'lucide-react';
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
  const [decks, setDecks] = useState<Deck[]>([
    {
      id: '1',
      title: 'Biology 101',
      cards: [
        { id: 'c1', front: 'Mitochondria', back: 'The powerhouse of the cell.' },
        { id: 'c2', front: 'Photosynthesis', back: 'Process by which plants use sunlight to synthesize foods.' },
        { id: 'c3', front: 'Mitosis', back: 'Type of cell division that results in two daughter cells.' }
      ]
    },
    {
      id: '2',
      title: 'Spanish Vocab',
      cards: [
        { id: 's1', front: 'Hola', back: 'Hello' },
        { id: 's2', front: 'Adios', back: 'Goodbye' }
      ]
    }
  ]);

  const [activeDeck, setActiveDeck] = useState<Deck | null>(null);
  const [studyMode, setStudyMode] = useState(false);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  
  // File Upload State
  const [stagedFile, setStagedFile] = useState<{data: string, type: string, name: string} | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Study Session State
  const [studyQueue, setStudyQueue] = useState<Card[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [finishedSession, setFinishedSession] = useState(false);

  // Creation State
  const [newDeckName, setNewDeckName] = useState('');
  const [showCreateDeck, setShowCreateDeck] = useState(false);
  const [newCardFront, setNewCardFront] = useState('');
  const [newCardBack, setNewCardBack] = useState('');

  const createDeck = () => {
    if (newDeckName.trim()) {
      setDecks([...decks, { id: Date.now().toString(), title: newDeckName, cards: [] }]);
      setNewDeckName('');
      setShowCreateDeck(false);
    }
  };

  const deleteDeck = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if(confirm("Delete this deck?")) {
      setDecks(decks.filter(d => d.id !== id));
      if (activeDeck?.id === id) setActiveDeck(null);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processStagedFile(file);
  };

  const processStagedFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      setStagedFile({
        data: event.target?.result as string,
        type: file.type,
        name: file.name
      });
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
      alert(`Neural engine synthesized ${newCards.length} new cards.`);
    } catch (e) {
      alert("Synthesis failed. Ensure the content is academic and clearly readable.");
    } finally {
      setIsSynthesizing(false);
    }
  };

  const startStudy = () => {
    if(activeDeck && activeDeck.cards.length > 0) {
      const shuffled = [...activeDeck.cards].sort(() => Math.random() - 0.5);
      setStudyQueue(shuffled);
      setCurrentCardIndex(0);
      setIsFlipped(false);
      setFinishedSession(false);
      setStudyMode(true);
    }
  };

  const handleRating = (difficulty: 'easy' | 'good' | 'hard' | 'again') => {
    setIsFlipped(false);
    setTimeout(() => {
        if (difficulty === 'again' || difficulty === 'hard') {
           const currentCard = studyQueue[currentCardIndex];
           setStudyQueue(prev => [...prev, currentCard]);
        }
        if (currentCardIndex < studyQueue.length - 1) {
            setCurrentCardIndex(prev => prev + 1);
        } else {
            setFinishedSession(true);
        }
    }, 200);
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-6rem)] flex flex-col">
       <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Layers className="text-orange-600 dark:text-orange-400" /> Flash-Recall
          </h2>
          {!studyMode && !activeDeck && (
            <button 
              onClick={() => setShowCreateDeck(!showCreateDeck)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus size={18} /> New Deck
            </button>
          )}
          {activeDeck && !studyMode && (
            <button 
              onClick={() => setActiveDeck(null)}
              className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white font-bold text-sm"
            >
              Back to Archive
            </button>
          )}
          {studyMode && (
             <button 
              onClick={() => { setStudyMode(false); setIsFlipped(false); setCurrentCardIndex(0); }}
              className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white font-bold text-sm"
            >
              Terminate Session
            </button>
          )}
       </div>

       {showCreateDeck && !activeDeck && (
         <div className="mb-6 p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex gap-2 animate-in slide-in-from-top-2">
            <input 
              type="text" 
              value={newDeckName}
              onChange={(e) => setNewDeckName(e.target.value)}
              placeholder="Deck Title (e.g. Molecular Biology)"
              className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && createDeck()}
            />
            <button onClick={createDeck} className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg font-black uppercase tracking-widest text-[10px]">Create</button>
         </div>
       )}

       <div className="flex-1 overflow-y-auto">
         {!activeDeck && (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {decks.map(deck => (
                <div 
                  key={deck.id} 
                  onClick={() => setActiveDeck(deck)}
                  className="bg-white/50 dark:bg-white/5 backdrop-blur-3xl p-8 rounded-[2.5rem] border border-slate-200 dark:border-white/10 shadow-sm hover:shadow-xl hover:-translate-y-1 cursor-pointer transition-all group relative overflow-hidden"
                >
                   <div className="absolute -inset-24 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 blur-3xl transition-opacity"></div>
                   <h3 className="text-xl font-black text-slate-800 dark:text-white mb-2 tracking-tight group-hover:text-indigo-500 transition-colors">{deck.title}</h3>
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{deck.cards.length} Mastery Cards</p>
                   <button 
                     onClick={(e) => deleteDeck(deck.id, e)}
                     className="absolute top-6 right-6 text-slate-300 hover:text-red-500 transition-all p-2 opacity-0 group-hover:opacity-100"
                   >
                     <Trash2 size={16} />
                   </button>
                </div>
              ))}
           </div>
         )}

         {activeDeck && !studyMode && (
           <div className="flex flex-col h-full gap-8">
              <div className="bg-slate-900 dark:bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] text-white dark:text-slate-900 flex flex-col md:flex-row justify-between items-center shadow-xl gap-4">
                 <div className="text-center md:text-left">
                   <h3 className="text-2xl md:text-3xl font-black tracking-tighter uppercase">{activeDeck.title}</h3>
                   <span className="text-[10px] font-black tracking-widest uppercase opacity-70">Archive Repository</span>
                 </div>
                 <button 
                   onClick={startStudy}
                   disabled={activeDeck.cards.length === 0}
                   className="w-full md:w-auto px-10 py-5 bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 shadow-2xl active:scale-95 transition-all"
                 >
                   <Sparkles size={16} /> Begin Recall Session
                 </button>
              </div>

              {/* Neural Synthesis Section */}
              <div className="bg-white/70 dark:bg-white/5 p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-slate-200 dark:border-white/10 shadow-sm">
                 <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-500 mb-6 flex items-center gap-2">
                   <Wand2 size={14} /> Neural Synthesis Engine
                 </h4>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-4">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Paste Study Material</label>
                      <textarea 
                        value={noteContent}
                        onChange={(e) => { setNoteContent(e.target.value); if(e.target.value) setStagedFile(null); }}
                        placeholder="Paste notes here..."
                        className="w-full h-40 p-5 bg-slate-50 dark:bg-black/20 rounded-2xl border border-slate-200 dark:border-white/10 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none shadow-inner"
                      />
                    </div>

                    <div className="flex flex-col gap-4">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Upload Note Asset (PDF/Image)</label>
                      <div 
                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={(e) => { e.preventDefault(); setIsDragging(false); const file = e.dataTransfer.files[0]; if(file) { processStagedFile(file); setNoteContent(''); } }}
                        onClick={() => fileInputRef.current?.click()}
                        className={`relative w-full h-40 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${stagedFile ? 'border-indigo-500 bg-indigo-500/5' : isDragging ? 'border-indigo-500 bg-indigo-500/5 ring-8 ring-indigo-500/10' : 'border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5'}`}
                      >
                        {stagedFile ? (
                          <div className="flex flex-col items-center gap-2 p-4 text-center">
                            {stagedFile.type.includes('image') ? <ImageIcon className="text-indigo-500" size={32} /> : <FileText className="text-indigo-500" size={32} />}
                            <span className="text-xs font-bold text-slate-700 dark:text-white truncate max-w-[200px]">{stagedFile.name}</span>
                            <button 
                              onClick={(e) => { e.stopPropagation(); setStagedFile(null); }}
                              className="absolute top-2 right-2 p-1.5 bg-white dark:bg-slate-800 rounded-lg text-red-500 shadow-sm border border-slate-100 dark:border-white/5"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <>
                            <Upload size={32} className={`mb-3 ${isDragging ? 'text-indigo-500 scale-110' : 'text-slate-300'}`} />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-6 text-center leading-relaxed">
                              {isDragging ? 'Drop to Stage Asset' : 'Drop notes here or click to browse'}
                            </span>
                          </>
                        )}
                        <input ref={fileInputRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={handleFileUpload} />
                      </div>
                    </div>
                 </div>

                 <button 
                   onClick={handleNeuralSynthesis}
                   disabled={isSynthesizing || (!noteContent && !stagedFile)}
                   className="w-full mt-6 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:scale-[1.01] transition-all flex items-center justify-center gap-3 shadow-xl disabled:opacity-30 disabled:hover:scale-100"
                 >
                   {isSynthesizing ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                   {isSynthesizing ? 'Neural Engine Working...' : 'Synthesize Mastery Cards'}
                 </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                 {activeDeck.cards.length === 0 ? (
                   <div className="h-40 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 dark:border-white/5 rounded-[2rem] opacity-30">
                      <Layers size={48} className="mb-4" />
                      <p className="text-xs font-black uppercase tracking-widest">Deck is currently vacant</p>
                   </div>
                 ) : (
                   activeDeck.cards.map((card) => (
                    <div key={card.id} className="bg-white/50 dark:bg-white/5 p-6 rounded-2xl border border-slate-200 dark:border-white/10 flex justify-between items-center group hover:border-indigo-500 transition-all shadow-sm">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 flex-1 pr-6">
                         <div className="font-bold text-slate-800 dark:text-white border-b md:border-b-0 md:border-r border-slate-100 dark:border-white/5 pb-2 md:pb-0 md:pr-4">{card.front}</div>
                         <div className="text-slate-500 dark:text-slate-400 font-medium">{card.back}</div>
                       </div>
                       <button 
                         onClick={() => {
                           const updatedDeck = { ...activeDeck, cards: activeDeck.cards.filter(c => c.id !== card.id) };
                           setDecks(decks.map(d => d.id === activeDeck.id ? updatedDeck : d));
                           setActiveDeck(updatedDeck);
                         }}
                         className="p-3 text-slate-300 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                       >
                         <Trash2 size={18} />
                       </button>
                    </div>
                   ))
                 )}
              </div>
           </div>
         )}

         {activeDeck && studyMode && !finishedSession && studyQueue.length > 0 && (
           <div className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto px-4">
              <div className="mb-6 px-4 py-1.5 bg-slate-900/5 dark:bg-white/5 rounded-full border border-slate-100 dark:border-white/10 text-[10px] font-black uppercase tracking-widest text-slate-400">
                Recall Progress: {currentCardIndex + 1} / {studyQueue.length}
              </div>

              <div 
                className="w-full aspect-[3/2] cursor-pointer group [perspective:1000px]"
                onClick={() => setIsFlipped(!isFlipped)}
              >
                <div className={`relative w-full h-full duration-700 [transform-style:preserve-3d] transition-transform ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}>
                   {/* Front */}
                   <div className="absolute inset-0 [backface-visibility:hidden] bg-white dark:bg-slate-800 rounded-[2rem] md:rounded-[3rem] border-2 border-slate-200 dark:border-slate-700 shadow-2xl flex items-center justify-center p-8 md:p-12 text-center">
                      <h3 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">{studyQueue[currentCardIndex].front}</h3>
                      <div className="absolute bottom-6 md:bottom-10 flex items-center gap-2 opacity-30">
                         <RotateCcw size={14} />
                         <span className="text-[10px] font-black uppercase tracking-widest">Flip Card</span>
                      </div>
                   </div>

                   {/* Back */}
                   <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] bg-indigo-600 dark:bg-indigo-900 rounded-[2rem] md:rounded-[3rem] shadow-2xl flex items-center justify-center p-8 md:p-12 text-center text-white">
                      <h3 className="text-xl md:text-3xl font-bold tracking-tight leading-relaxed">{studyQueue[currentCardIndex].back}</h3>
                      <div className="absolute bottom-6 md:bottom-10 flex items-center gap-2 opacity-30">
                         <Check size={16} />
                         <span className="text-[10px] font-black uppercase tracking-widest">Evaluation Node</span>
                      </div>
                   </div>
                </div>
              </div>

              {isFlipped ? (
                <div className="flex flex-wrap justify-center gap-3 md:gap-4 mt-8 md:mt-12 animate-in slide-in-from-bottom-4">
                   <button onClick={() => handleRating('again')} className="flex flex-col items-center gap-1 md:gap-2 px-4 md:px-8 py-3 md:py-4 rounded-2xl bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 transition-all active:scale-95 shadow-lg shadow-red-500/10">
                      <span className="text-xs md:text-sm font-black uppercase tracking-widest">Again</span>
                      <span className="text-[8px] md:text-[9px] font-bold opacity-70">Neural Refresh</span>
                   </button>
                   <button onClick={() => handleRating('hard')} className="flex flex-col items-center gap-1 md:gap-2 px-4 md:px-8 py-3 md:py-4 rounded-2xl bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 hover:bg-orange-200 transition-all active:scale-95 shadow-lg shadow-orange-500/10">
                      <span className="text-xs md:text-sm font-black uppercase tracking-widest">Hard</span>
                      <span className="text-[8px] md:text-[9px] font-bold opacity-70">Deep Process</span>
                   </button>
                   <button onClick={() => handleRating('good')} className="flex flex-col items-center gap-1 md:gap-2 px-4 md:px-8 py-3 md:py-4 rounded-2xl bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 transition-all active:scale-95 shadow-lg shadow-blue-500/10">
                      <span className="text-xs md:text-sm font-black uppercase tracking-widest">Good</span>
                      <span className="text-[8px] md:text-[9px] font-bold opacity-70">Synthesized</span>
                   </button>
                   <button onClick={() => handleRating('easy')} className="flex flex-col items-center gap-1 md:gap-2 px-4 md:px-8 py-3 md:py-4 rounded-2xl bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-200 transition-all active:scale-95 shadow-lg shadow-green-500/10">
                      <span className="text-xs md:text-sm font-black uppercase tracking-widest">Easy</span>
                      <span className="text-[8px] md:text-[9px] font-bold opacity-70">Mastered</span>
                   </button>
                </div>
              ) : (
                <div className="mt-8 md:mt-12">
                   <button 
                     onClick={() => setIsFlipped(true)}
                     className="px-10 md:px-14 py-4 md:py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[1.2rem] md:rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] md:text-xs hover:scale-105 active:scale-95 transition-all shadow-2xl"
                   >
                     Reveal Synthesis
                   </button>
                </div>
              )}
           </div>
         )}
         
         {activeDeck && studyMode && finishedSession && (
            <div className="flex flex-col items-center justify-center h-full text-center animate-in zoom-in-95 duration-500 px-4">
               <div className="w-20 h-20 md:w-24 md:h-24 bg-indigo-100 dark:bg-indigo-900/30 rounded-3xl flex items-center justify-center mb-6 md:mb-8 text-indigo-600 dark:text-indigo-400">
                  <Sparkles size={40} className="md:w-12 md:h-12" />
               </div>
               <h2 className="text-3xl md:text-4xl font-black text-slate-800 dark:text-white mb-2 uppercase tracking-tighter">Session Optimized</h2>
               <p className="text-slate-500 dark:text-slate-400 mb-8 md:mb-10 text-base md:text-lg font-medium">Neural pathways reinforced for {activeDeck.title}.</p>
               <button 
                 onClick={() => setStudyMode(false)}
                 className="px-10 md:px-12 py-4 md:py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black uppercase tracking-widest text-[10px] md:text-xs hover:scale-105 active:scale-95 transition-all shadow-xl"
               >
                 Return to Archive
               </button>
            </div>
         )}
       </div>
    </div>
  );
};

export default Flashcards;
