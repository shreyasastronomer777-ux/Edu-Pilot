
import React, { useState, useEffect } from 'react';
import { PenTool, Search, Plus, Tag, X, Save } from 'lucide-react';

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

  const filteredNotes = notes.filter(n => 
    n.title.toLowerCase().includes(search.toLowerCase()) || 
    n.subject.toLowerCase().includes(search.toLowerCase()) ||
    n.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-6rem)] flex flex-col">
       <div className="flex items-center justify-between mb-8">
         <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
           <PenTool className="text-teal-600 dark:text-teal-400" /> Study Notes
         </h2>
         <div className="flex gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search notes..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-teal-500 w-64"
              />
            </div>
            <button 
              onClick={() => setIsAdding(true)}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm"
            >
              <Plus size={18} /> New Note
            </button>
         </div>
       </div>

       <div className="flex-1 overflow-y-auto">
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNotes.map(note => (
              <div key={note.id} className={`p-6 rounded-2xl border border-transparent hover:border-slate-200 dark:hover:border-slate-600 shadow-sm hover:shadow-md transition-all ${note.color} relative group`}>
                 <div className="flex justify-between items-start mb-3">
                    <span className="px-2 py-1 bg-white/50 dark:bg-black/20 rounded text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      {note.subject}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">{note.date}</span>
                 </div>
                 <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">{note.title}</h3>
                 <p className="text-slate-600 dark:text-slate-300 text-sm whitespace-pre-wrap line-clamp-6">{note.content}</p>
                 
                 <button 
                   onClick={() => setNotes(notes.filter(n => n.id !== note.id))}
                   className="absolute bottom-4 right-4 p-2 bg-white/80 dark:bg-black/30 rounded-full text-slate-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                 >
                   <X size={16} />
                 </button>
              </div>
            ))}
         </div>
         {filteredNotes.length === 0 && (
           <div className="text-center py-20 text-slate-400">
             <p>No notes found. Create a new one to get started.</p>
           </div>
         )}
       </div>

       {/* Add Note Modal */}
       {isAdding && (
         <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col max-h-[90vh]">
               <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                 <h3 className="text-lg font-bold text-slate-800 dark:text-white">Create New Note</h3>
                 <button onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-slate-800 dark:hover:text-white"><X size={20}/></button>
               </div>
               
               <div className="p-6 flex-1 overflow-y-auto space-y-4">
                  <input 
                    type="text" 
                    placeholder="Note Title" 
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full text-2xl font-bold bg-transparent border-none outline-none placeholder-slate-300 dark:placeholder-slate-600 text-slate-900 dark:text-white"
                  />
                  
                  <div className="flex gap-4">
                    <select 
                      value={newSubject} 
                      onChange={(e) => setNewSubject(e.target.value)}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 border-none outline-none text-sm font-medium text-slate-700 dark:text-slate-300"
                    >
                      {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    
                    <div className="flex gap-2 items-center">
                       {colors.map(c => (
                         <button 
                           key={c.label}
                           onClick={() => setNewColor(c.val)}
                           className={`w-6 h-6 rounded-full border border-slate-200 dark:border-slate-600 ${c.val.split(' ')[0]} ${newColor === c.val ? 'ring-2 ring-offset-2 ring-teal-500' : ''}`}
                           title={c.label}
                         />
                       ))}
                    </div>
                  </div>

                  <textarea 
                    placeholder="Start typing your notes here..." 
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    className="w-full h-64 resize-none bg-transparent border-none outline-none text-slate-700 dark:text-slate-300 text-lg leading-relaxed"
                  />
               </div>

               <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex justify-end gap-3">
                 <button onClick={() => setIsAdding(false)} className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg font-medium">Cancel</button>
                 <button onClick={handleSave} disabled={!newTitle || !newContent} className="px-6 py-2 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 shadow-sm disabled:opacity-50">Save Note</button>
               </div>
            </div>
         </div>
       )}
    </div>
  );
};

export default StudyNotes;
