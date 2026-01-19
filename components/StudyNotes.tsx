import React, { useState, useEffect, useRef } from 'react';
import { PenTool, Search, Plus, Tag, X, Save, Sparkles, Loader2, FileUp, FileText, Image as ImageIcon, Wand2 } from 'lucide-react';
import { generateRevisionInsights } from '../services/geminiService';

interface Note {
  id: string;
  title: string;
  subject: string;
  content: string;
  color: string;
  date: string;
}

const StudyNotes: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem('svgpt_notes');
    return saved ? JSON.parse(saved) : [
      { id: '1', title: 'Calculus Formulas', subject: 'Math', content: 'Derivative of x^2 is 2x...', color: 'bg-blue-100 dark:bg-blue-900/30', date: '2023-10-01' },
      { id: '2', title: 'Romeo & Juliet Themes', subject: 'English', content: 'Love vs Hate, Fate vs Free Will...', color: 'bg-rose-100 dark:bg-rose-900/30', date: '2023-10-05' },
      { id: '3', title: 'Newton Laws', subject: 'Physics', content: '1. Inertia\n2. F=ma\n3. Action/Reaction', color: 'bg-emerald-100 dark:bg-emerald-900/30', date: '2023-10-10' },
    ];
  });

  const [search, setSearch] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // New Note State
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState('General');
  const [newContent, setNewContent] = useState('');
  const [newColor, setNewColor] = useState('bg-slate-100 dark:bg-slate-800');

  useEffect(() => {
    localStorage.setItem('svgpt_notes', JSON.stringify(notes));
  }, [notes]);

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
        date: new Date().toLocaleDateString()
      };
      setNotes([note, ...notes]);
      setIsAdding(false);
      // Reset form
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
        
        // Open the modal and pre-fill with synthesized content
        setNewTitle(`Synthesized: ${file.name.split('.')[0]}`);
        setNewContent(result);
        setNewSubject('Synthesis Archive');
        setNewColor('bg-violet-100 dark:bg-violet-900/30');
        setIsAdding(true);
      } catch (err) {
        alert("Neural synthesis failed. Please ensure the asset is a clear PDF or image.");
      } finally {
        setIsSynthesizing(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsDataURL(file);
  };

  const filteredNotes = notes.filter(n => 
    n.title.toLowerCase().includes(search.toLowerCase()) || 
    n.subject.toLowerCase().includes(search.toLowerCase()) ||
    n.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-6rem)] flex flex-col animate-in fade-in duration-700">
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
         <div className="flex items-center gap-4">
           <div className="p-3 bg-teal-500/10 rounded-2xl">
             <PenTool className="text-teal-600 dark:text-teal-400" size={28} />
           </div>
           <div>
             <h2 className="text-3xl font-black tracking-tighter uppercase text-slate-800 dark:text-white">Notes Studio</h2>
             <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Personal Knowledge Archive</p>
           </div>
         </div>

         <div className="flex flex-wrap gap-3">
            <div className="relative group flex-1 md:flex-none min-w-[240px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Search Archive..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-800 dark:text-slate-200 outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all font-bold text-sm"
              />
            </div>
            
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isSynthesizing}
              className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
            >
              {isSynthesizing ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} className="text-indigo-400" />}
              {isSynthesizing ? 'Synthesizing...' : 'Synthesize Asset'}
            </button>
            <input ref={fileInputRef} type="file" className="hidden" accept="image/*,application/pdf" onChange={handleAssetUpload} />

            <button 
              onClick={() => setIsAdding(true)}
              className="px-6 py-3 premium-gradient text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 shadow-xl hover:scale-105 active:scale-95 transition-all"
            >
              <Plus size={16} /> New Note
            </button>
         </div>
       </div>

       <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-10">
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNotes.map(note => (
              <div key={note.id} className={`group relative bg-white dark:bg-white/[0.03] p-8 rounded-[2.5rem] border border-slate-200 dark:border-white/10 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 cursor-pointer ${note.color}`}>
                 <div className="flex justify-between items-start mb-6">
                    <span className="px-3 py-1 bg-white/60 dark:bg-black/20 rounded-full text-[9px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-300 border border-black/5 dark:border-white/5">
                      {note.subject}
                    </span>
                    <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{note.date}</span>
                 </div>
                 <h3 className="text-xl font-black text-slate-900 dark:text-white mb-4 tracking-tight group-hover:text-teal-600 transition-colors">{note.title}</h3>
                 <p className="text-slate-600 dark:text-slate-300 text-sm font-medium leading-relaxed whitespace-pre-wrap line-clamp-[8]">{note.content}</p>
                 
                 <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all">
                    <button 
                      onClick={(e) => { e.stopPropagation(); if(confirm('Delete note permanently?')) setNotes(notes.filter(n => n.id !== note.id)); }}
                      className="p-2.5 bg-red-500 text-white rounded-xl shadow-lg hover:scale-110 active:scale-90 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                 </div>
              </div>
            ))}
         </div>
         {filteredNotes.length === 0 && (
           <div className="h-full flex flex-col items-center justify-center text-slate-300 dark:text-slate-700 opacity-60 mt-20">
             <FileText size={80} strokeWidth={1} className="mb-6" />
             <p className="font-black uppercase tracking-[0.4em] text-sm">Vacant Archive</p>
           </div>
         )}
       </div>

       {/* Add/Edit Note Modal */}
       {isAdding && (
         <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="bg-white dark:bg-[#0B1221] w-full max-w-3xl rounded-[3rem] shadow-2xl border border-white/10 overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95">
               <div className="px-10 py-8 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-slate-50/50 dark:bg-black/20">
                 <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-600">
                     <Wand2 size={20} />
                   </div>
                   <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Note Synthesis Studio</h3>
                 </div>
                 <button onClick={() => setIsAdding(false)} className="p-3 bg-white dark:bg-slate-800 rounded-2xl text-slate-400 hover:text-red-500 transition-all shadow-sm">
                   <X size={20}/>
                 </button>
               </div>
               
               <div className="p-10 flex-1 overflow-y-auto space-y-8 custom-scrollbar">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Note Heading</label>
                    <input 
                      type="text" 
                      placeholder="Enter specific title..." 
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="w-full text-3xl font-[900] bg-transparent border-none outline-none placeholder:text-slate-200 dark:placeholder:text-slate-800 text-slate-900 dark:text-white tracking-tighter"
                    />
                  </div>
                  
                  <div className="flex flex-wrap gap-8 items-center">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Classification</label>
                      <select 
                        value={newSubject} 
                        onChange={(e) => setNewSubject(e.target.value)}
                        className="block px-6 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 border-none outline-none text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-200 focus:ring-4 focus:ring-teal-500/10"
                      >
                        {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Visual Theme</label>
                       <div className="flex gap-3 items-center p-2 bg-slate-100 dark:bg-slate-800 rounded-2xl">
                          {colors.map(c => (
                            <button 
                              key={c.label}
                              onClick={() => setNewColor(c.val)}
                              className={`w-6 h-6 rounded-full border-2 border-white dark:border-slate-900 transition-all ${c.val.split(' ')[0]} ${newColor === c.val ? 'scale-125 shadow-lg ring-2 ring-teal-500' : 'opacity-60 hover:opacity-100'}`}
                              title={c.label}
                            />
                          ))}
                       </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Core Synthesis</label>
                    <textarea 
                      placeholder="Begin typing instructional nodes or review findings..." 
                      value={newContent}
                      onChange={(e) => setNewContent(e.target.value)}
                      className="w-full h-80 resize-none bg-transparent border-none outline-none text-slate-700 dark:text-slate-300 text-lg font-medium leading-relaxed placeholder:text-slate-200 dark:placeholder:text-slate-800"
                    />
                  </div>
               </div>

               <div className="p-8 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-black/40 flex justify-end gap-4">
                 <button onClick={() => setIsAdding(false)} className="px-8 py-4 text-slate-500 font-black uppercase tracking-widest text-[10px] hover:bg-white dark:hover:bg-slate-800 rounded-2xl transition-all">Cancel</button>
                 <button 
                   onClick={handleSave} 
                   disabled={!newTitle || !newContent} 
                   className="px-12 py-4 premium-gradient text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-2xl hover:scale-105 active:scale-95 transition-all disabled:opacity-30 flex items-center gap-3"
                 >
                   <Save size={16} /> Archive Note
                 </button>
               </div>
            </div>
         </div>
       )}

       <style>{`
          .line-clamp-8 {
            display: -webkit-box;
            -webkit-line-clamp: 8;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
       `}</style>
    </div>
  );
};

// Add missing icon for delete
const Trash2 = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
);

export default StudyNotes;
