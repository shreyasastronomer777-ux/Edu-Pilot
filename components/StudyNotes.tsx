
import React, { useState, useEffect, useRef } from 'react';
import { PenTool, Search, Plus, Tag, X, Save, Sparkles, Loader2, FileUp, FileText, Image as ImageIcon, Wand2, Trash2, Pin, PinOff } from 'lucide-react';
import { generateRevisionInsights } from '../services/geminiService';
import { auth } from '../firebaseConfig';

interface Note {
  id: string;
  title: string;
  subject: string;
  content: string;
  color: string;
  date: string;
  isPinned?: boolean;
}

const StudyNotes: React.FC = () => {
  const userId = auth.currentUser?.uid || 'guest';
  const storageKey = `svgpt_notes_${userId}`;

  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem(storageKey);
    const parsed = saved ? JSON.parse(saved) : [];
    
    // Create a default welcome note if the archive is empty
    if (parsed.length === 0) {
      return [{
        id: 'welcome-node-001',
        title: 'Neural Node: Getting Started',
        subject: 'Synthesis Archive',
        content: 'Welcome to your Isolated Note repository. This high-performance archive is designed for scholarly persistence.\n\nKey Capabilities:\n1. Manual Synthesis: Click "New Note" to record raw academic data.\n2. Asset Deconstruction: Use "Synthesize Asset" to upload PDFs or images for immediate neural extraction.\n3. Search Optimization: Use the semantic search bar to locate specific academic vectors.\n4. Persistence: All nodes are automatically cached in your local environment.',
        color: 'bg-indigo-100 dark:bg-indigo-900/30',
        date: new Date().toLocaleDateString(),
        isPinned: true
      }];
    }
    return parsed;
  });

  const [search, setSearch] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState('General');
  const [newContent, setNewContent] = useState('');
  const [newColor, setNewColor] = useState('bg-slate-100 dark:bg-slate-800');

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(notes));
  }, [notes, storageKey]);

  const subjects = ['Math', 'Science', 'English', 'History', 'General', 'Synthesis Archive'];
  const colors = [
    { label: 'Blue', val: 'bg-blue-100 dark:bg-blue-900/30' },
    { label: 'Green', val: 'bg-emerald-100 dark:bg-emerald-900/30' },
    { label: 'Red', val: 'bg-rose-100 dark:bg-rose-900/30' },
    { label: 'Yellow', val: 'bg-amber-100 dark:bg-amber-900/30' },
    { label: 'Purple', val: 'bg-purple-100 dark:bg-purple-900/30' },
  ];

  const handleSave = () => {
    if (newTitle && newContent) {
      const note: Note = {
        id: Date.now().toString(),
        title: newTitle,
        subject: newSubject,
        content: newContent,
        color: newColor,
        date: new Date().toLocaleDateString(),
        isPinned: false
      };
      setNotes([note, ...notes]);
      setIsAdding(false);
      setNewTitle('');
      setNewContent('');
      setNewSubject('General');
    }
  };

  const handleAssetUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsSynthesizing(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const base64 = event.target?.result as string;
        const result = await generateRevisionInsights(base64, file.type);
        setNewTitle(`Synthesized: ${file.name.split('.')[0]}`);
        setNewContent(result);
        setNewSubject('Synthesis Archive');
        setNewColor('bg-violet-100 dark:bg-violet-900/30');
        setIsAdding(true);
      } catch (err) {
        alert("Neural synthesis failed.");
      } finally {
        setIsSynthesizing(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsDataURL(file);
  };

  const togglePin = (id: string) => {
    setNotes(notes.map(n => n.id === id ? { ...n, isPinned: !n.isPinned } : n));
  };

  const filteredNotes = notes
    .filter(n => 
      n.title.toLowerCase().includes(search.toLowerCase()) || 
      n.subject.toLowerCase().includes(search.toLowerCase()) ||
      n.content.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => (a.isPinned === b.isPinned ? 0 : a.isPinned ? -1 : 1));

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-6rem)] flex flex-col animate-in fade-in duration-700">
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
         <div className="flex items-center gap-4">
           <div className="p-3 bg-teal-500/10 rounded-2xl">
             <PenTool className="text-teal-600 dark:text-teal-400" size={28} />
           </div>
           <div>
             <h2 className="text-3xl font-black tracking-tighter uppercase text-slate-800 dark:text-white">Isolated Notes</h2>
             <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Personal Archive</p>
           </div>
         </div>

         <div className="flex flex-wrap gap-3">
            <div className="relative group flex-1 md:flex-none min-w-[240px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" placeholder="Search my archive..." value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-800 dark:text-slate-200 outline-none focus:ring-4 focus:ring-teal-500/10 transition-all font-bold text-sm"
              />
            </div>
            
            <button onClick={() => fileInputRef.current?.click()} disabled={isSynthesizing} className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 shadow-xl hover:scale-105 active:scale-95 transition-all">
              {isSynthesizing ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} className="text-indigo-400" />}
              Synthesize Asset
            </button>
            <input ref={fileInputRef} type="file" className="hidden" accept="image/*,application/pdf" onChange={handleAssetUpload} />

            <button onClick={() => setIsAdding(true)} className="px-6 py-3 premium-gradient text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 shadow-xl hover:scale-105 active:scale-95 transition-all">
              <Plus size={16} /> New Note
            </button>
         </div>
       </div>

       <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-10">
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNotes.map(note => (
              <div key={note.id} className={`group relative bg-white dark:bg-white/[0.03] p-8 rounded-[2.5rem] border border-slate-200 dark:border-white/10 shadow-sm hover:shadow-2xl transition-all duration-500 ${note.color}`}>
                 <div className="flex justify-between items-start mb-6">
                    <span className="px-3 py-1 bg-white/60 dark:bg-black/20 rounded-full text-[9px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-300 border border-black/5 dark:border-white/5">
                      {note.subject}
                    </span>
                    <div className="flex items-center gap-2">
                      <button onClick={() => togglePin(note.id)} className={`p-1.5 rounded-lg transition-colors ${note.isPinned ? 'text-indigo-600 bg-indigo-50' : 'text-slate-300 hover:text-indigo-500'}`}>
                        {note.isPinned ? <Pin size={14} /> : <PinOff size={14} />}
                      </button>
                      <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{note.date}</span>
                    </div>
                 </div>
                 <h3 className="text-xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">{note.title}</h3>
                 <p className="text-slate-600 dark:text-slate-300 text-sm font-medium leading-relaxed whitespace-pre-wrap line-clamp-[6]">{note.content}</p>
                 
                 <div className="absolute top-4 right-12 opacity-0 group-hover:opacity-100 transition-all flex gap-2">
                    <button onClick={(e) => { e.stopPropagation(); if(confirm('Delete permanently?')) setNotes(notes.filter(n => n.id !== note.id)); }} className="p-2.5 bg-red-500 text-white rounded-xl shadow-lg hover:scale-110 active:scale-90 transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                 </div>
              </div>
            ))}
         </div>
         {filteredNotes.length === 0 && (
           <div className="h-full flex flex-col items-center justify-center text-slate-300 dark:text-slate-700 opacity-60 mt-20">
             <FileText size={80} strokeWidth={1} className="mb-6" />
             <p className="font-black uppercase tracking-[0.4em] text-sm">Isolated Archive Vacant</p>
           </div>
         )}
       </div>

       {isAdding && (
         <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#0B1221] w-full max-w-3xl rounded-[3rem] shadow-2xl border border-white/10 overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95">
               <div className="px-10 py-8 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-slate-50/50 dark:bg-black/20">
                 <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Isolated Synthesis</h3>
                 <button onClick={() => setIsAdding(false)} className="p-3 bg-white dark:bg-slate-800 rounded-2xl text-slate-400 hover:text-red-500 transition-all">
                   <X size={20}/>
                 </button>
               </div>
               <div className="p-10 flex-1 overflow-y-auto space-y-8 custom-scrollbar">
                  <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
                    {colors.map(c => (
                      <button 
                        key={c.val} 
                        onClick={() => setNewColor(c.val)}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${newColor === c.val ? 'border-indigo-600 scale-110 shadow-lg' : 'border-transparent'} ${c.val.split(' ')[0]}`}
                      />
                    ))}
                  </div>
                  <input type="text" placeholder="Title..." value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="w-full text-3xl font-[900] bg-transparent border-none outline-none text-slate-900 dark:text-white tracking-tighter" />
                  <div className="flex items-center gap-3">
                    <Tag size={16} className="text-indigo-500" />
                    <select value={newSubject} onChange={e => setNewSubject(e.target.value)} className="bg-transparent text-xs font-black uppercase tracking-widest text-slate-400 outline-none">
                      {subjects.map(s => <option key={s} value={s} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">{s}</option>)}
                    </select>
                  </div>
                  <textarea placeholder="Synthesize notes..." value={newContent} onChange={(e) => setNewContent(e.target.value)} className="w-full h-80 resize-none bg-transparent border-none outline-none text-slate-700 dark:text-slate-300 text-lg font-medium leading-relaxed" />
               </div>
               <div className="p-8 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-black/40 flex justify-end gap-4">
                 <button onClick={() => setIsAdding(false)} className="px-8 py-4 text-slate-500 font-black uppercase tracking-widest text-[10px]">Cancel</button>
                 <button onClick={handleSave} disabled={!newTitle || !newContent} className="px-12 py-4 premium-gradient text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-2xl active:scale-95 transition-all">Archive Node</button>
               </div>
            </div>
         </div>
       )}
    </div>
  );
};

export default StudyNotes;
