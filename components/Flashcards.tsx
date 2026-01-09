
import React, { useState } from 'react';
import { Layers, Plus, RotateCcw, ChevronLeft, ChevronRight, Trash2, Edit2, Check, PlayCircle, BarChart3 } from 'lucide-react';

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

  const addCard = () => {
    if (activeDeck && newCardFront && newCardBack) {
      const updatedDeck = {
        ...activeDeck,
        cards: [...activeDeck.cards, { id: Date.now().toString(), front: newCardFront, back: newCardBack }]
      };
      setDecks(decks.map(d => d.id === activeDeck.id ? updatedDeck : d));
      setActiveDeck(updatedDeck);
      setNewCardFront('');
      setNewCardBack('');
    }
  };

  const startStudy = () => {
    if(activeDeck && activeDeck.cards.length > 0) {
      // Shuffle cards for the session
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
    
    // Simple Spaced Repetition Simulation:
    // If 'Again' or 'Hard', re-queue the card at the end of the session.
    // If 'Good' or 'Easy', mark as done (remove from effective queue).
    
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
       {/* Header */}
       <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Layers className="text-orange-600 dark:text-orange-400" /> Flashcards
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
              className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
            >
              Back to Decks
            </button>
          )}
          {studyMode && (
             <button 
              onClick={() => { setStudyMode(false); setIsFlipped(false); setCurrentCardIndex(0); }}
              className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
            >
              Exit Study Mode
            </button>
          )}
       </div>

       {/* Create Deck Input */}
       {showCreateDeck && !activeDeck && (
         <div className="mb-6 p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex gap-2 animate-in slide-in-from-top-2">
            <input 
              type="text" 
              value={newDeckName}
              onChange={(e) => setNewDeckName(e.target.value)}
              placeholder="Deck Name (e.g. History Final)"
              className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && createDeck()}
            />
            <button onClick={createDeck} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Create</button>
            <button onClick={() => setShowCreateDeck(false)} className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600">Cancel</button>
         </div>
       )}

       {/* Main Content Area */}
       <div className="flex-1 overflow-y-auto">
         {/* Decks Grid */}
         {!activeDeck && (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {decks.map(deck => (
                <div 
                  key={deck.id} 
                  onClick={() => setActiveDeck(deck)}
                  className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-indigo-400 dark:hover:border-indigo-500 cursor-pointer transition-all group relative"
                >
                   <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">{deck.title}</h3>
                   <p className="text-slate-500 dark:text-slate-400">{deck.cards.length} cards</p>
                   <button 
                     onClick={(e) => deleteDeck(deck.id, e)}
                     className="absolute top-4 right-4 text-slate-300 hover:text-red-500 dark:text-slate-600 opacity-0 group-hover:opacity-100 transition-all p-2"
                   >
                     <Trash2 size={18} />
                   </button>
                </div>
              ))}
              {decks.length === 0 && (
                <div className="col-span-full text-center py-20 text-slate-400 dark:text-slate-500">
                   <Layers size={48} className="mx-auto mb-4 opacity-50" />
                   <p>No decks yet. Create one to start studying!</p>
                </div>
              )}
           </div>
         )}

         {/* Deck View (Edit) */}
         {activeDeck && !studyMode && (
           <div className="flex flex-col h-full gap-6">
              <div className="flex items-center justify-between">
                 <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{activeDeck.title}</h3>
                 <button 
                   onClick={startStudy}
                   disabled={activeDeck.cards.length === 0}
                   className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-colors flex items-center gap-2"
                 >
                   <PlayCircle size={20} /> Start Studying
                 </button>
              </div>

              {/* Add Card Form */}
              <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row gap-4 items-end">
                 <div className="flex-1 w-full">
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Front</label>
                    <input 
                      type="text" 
                      value={newCardFront} 
                      onChange={(e) => setNewCardFront(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Term or Question"
                    />
                 </div>
                 <div className="flex-1 w-full">
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Back</label>
                    <input 
                      type="text" 
                      value={newCardBack} 
                      onChange={(e) => setNewCardBack(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Definition or Answer"
                      onKeyDown={(e) => e.key === 'Enter' && addCard()}
                    />
                 </div>
                 <button onClick={addCard} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium h-10 w-full md:w-auto">
                   Add
                 </button>
              </div>

              {/* Card List */}
              <div className="flex-1 overflow-y-auto space-y-3">
                 {activeDeck.cards.map((card, idx) => (
                   <div key={card.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex justify-between items-center group">
                      <div className="grid grid-cols-2 gap-4 flex-1">
                        <div className="font-medium text-slate-800 dark:text-white border-r border-slate-100 dark:border-slate-700 pr-4">{card.front}</div>
                        <div className="text-slate-600 dark:text-slate-300">{card.back}</div>
                      </div>
                      <button 
                        onClick={() => {
                          const updatedDeck = { ...activeDeck, cards: activeDeck.cards.filter(c => c.id !== card.id) };
                          setDecks(decks.map(d => d.id === activeDeck.id ? updatedDeck : d));
                          setActiveDeck(updatedDeck);
                        }}
                        className="p-2 text-slate-300 hover:text-red-500 dark:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={16} />
                      </button>
                   </div>
                 ))}
                 {activeDeck.cards.length === 0 && (
                   <div className="text-center py-10 text-slate-400 dark:text-slate-500 italic">
                     No cards added yet.
                   </div>
                 )}
              </div>
           </div>
         )}

         {/* Study View */}
         {activeDeck && studyMode && !finishedSession && studyQueue.length > 0 && (
           <div className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto">
              <div className="mb-4 text-slate-500 dark:text-slate-400 font-medium">
                Card {currentCardIndex + 1} / {studyQueue.length}
              </div>

              <div 
                className="w-full aspect-[3/2] perspective cursor-pointer group"
                onClick={() => setIsFlipped(!isFlipped)}
              >
                <div className={`relative w-full h-full duration-500 preserve-3d transition-transform ${isFlipped ? 'rotate-y-180' : ''}`}>
                   {/* Front */}
                   <div className="absolute inset-0 backface-hidden bg-white dark:bg-slate-800 rounded-3xl border-2 border-slate-200 dark:border-slate-700 shadow-lg flex items-center justify-center p-8 text-center">
                      <h3 className="text-3xl font-bold text-slate-800 dark:text-white">{studyQueue[currentCardIndex].front}</h3>
                      <p className="absolute bottom-6 text-xs text-slate-400 uppercase tracking-widest font-bold">Tap to flip</p>
                   </div>

                   {/* Back */}
                   <div className="absolute inset-0 backface-hidden rotate-y-180 bg-indigo-600 dark:bg-indigo-900 rounded-3xl shadow-lg flex items-center justify-center p-8 text-center text-white">
                      <h3 className="text-2xl font-medium">{studyQueue[currentCardIndex].back}</h3>
                      <p className="absolute bottom-6 text-xs text-indigo-200 uppercase tracking-widest font-bold">Answer</p>
                   </div>
                </div>
              </div>

              {/* Spaced Repetition Buttons */}
              {isFlipped ? (
                <div className="flex gap-3 mt-8 animate-in slide-in-from-bottom-2">
                   <button onClick={() => handleRating('again')} className="flex flex-col items-center gap-1 px-6 py-3 rounded-xl bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors">
                      <span className="font-bold">Again</span>
                      <span className="text-xs opacity-70">&lt; 1 min</span>
                   </button>
                   <button onClick={() => handleRating('hard')} className="flex flex-col items-center gap-1 px-6 py-3 rounded-xl bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 hover:bg-orange-200 dark:hover:bg-orange-900/50 transition-colors">
                      <span className="font-bold">Hard</span>
                      <span className="text-xs opacity-70">2 days</span>
                   </button>
                   <button onClick={() => handleRating('good')} className="flex flex-col items-center gap-1 px-6 py-3 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors">
                      <span className="font-bold">Good</span>
                      <span className="text-xs opacity-70">4 days</span>
                   </button>
                   <button onClick={() => handleRating('easy')} className="flex flex-col items-center gap-1 px-6 py-3 rounded-xl bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors">
                      <span className="font-bold">Easy</span>
                      <span className="text-xs opacity-70">7 days</span>
                   </button>
                </div>
              ) : (
                <div className="mt-8">
                   <button 
                     onClick={() => setIsFlipped(true)}
                     className="px-10 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold hover:scale-105 transition-transform flex items-center gap-2"
                   >
                     <RotateCcw size={18} /> Show Answer
                   </button>
                </div>
              )}
           </div>
         )}
         
         {/* Session Finished */}
         {activeDeck && studyMode && finishedSession && (
            <div className="flex flex-col items-center justify-center h-full text-center animate-in zoom-in-95">
               <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6 text-green-600 dark:text-green-400">
                  <Check size={48} />
               </div>
               <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">Session Complete!</h2>
               <p className="text-slate-500 dark:text-slate-400 mb-8">You've reviewed all cards in this deck.</p>
               <button 
                 onClick={() => setStudyMode(false)}
                 className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors"
               >
                 Back to Deck
               </button>
            </div>
         )}
       </div>
    </div>
  );
};

export default Flashcards;
