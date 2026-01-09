
import React, { useState } from 'react';
import { Calendar, Plus, CheckCircle2, Circle, Clock, Trash2 } from 'lucide-react';

interface Assignment {
  id: string;
  title: string;
  subject: string;
  dueDate: string;
  completed: boolean;
}

const HomeworkPlanner: React.FC = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([
    { id: '1', title: 'Calculus Problem Set 4', subject: 'Math', dueDate: '2023-10-25', completed: false },
    { id: '2', title: 'Read Chapter 5', subject: 'English', dueDate: '2023-10-26', completed: true },
    { id: '3', title: 'History Essay Draft', subject: 'History', dueDate: '2023-10-28', completed: false },
  ]);

  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState('Math');
  const [newDate, setNewDate] = useState('');

  const addAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTitle && newDate) {
      const task: Assignment = {
        id: Date.now().toString(),
        title: newTitle,
        subject: newSubject,
        dueDate: newDate,
        completed: false
      };
      setAssignments([...assignments, task].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()));
      setNewTitle('');
      setNewDate('');
    }
  };

  const toggleComplete = (id: string) => {
    setAssignments(assignments.map(a => a.id === id ? { ...a, completed: !a.completed } : a));
  };

  const deleteAssignment = (id: string) => {
    setAssignments(assignments.filter(a => a.id !== id));
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-6rem)] flex gap-8">
       {/* List Section */}
       <div className="flex-1 flex flex-col">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
            <Calendar className="text-indigo-600 dark:text-indigo-400" /> Homework Planner
          </h2>

          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
             {assignments.map(task => {
               const isOverdue = new Date(task.dueDate) < new Date() && !task.completed;
               return (
                 <div key={task.id} className={`p-4 rounded-xl border flex items-center gap-4 transition-all group ${task.completed ? 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-70' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm'}`}>
                    <button onClick={() => toggleComplete(task.id)} className={`flex-shrink-0 ${task.completed ? 'text-green-500' : 'text-slate-300 hover:text-indigo-500'}`}>
                       {task.completed ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                    </button>
                    
                    <div className="flex-1">
                       <h4 className={`font-semibold text-lg ${task.completed ? 'text-slate-500 line-through' : 'text-slate-800 dark:text-white'}`}>{task.title}</h4>
                       <div className="flex gap-3 text-xs font-medium">
                          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">{task.subject}</span>
                          <span className={`flex items-center gap-1 ${isOverdue ? 'text-red-500' : 'text-slate-500 dark:text-slate-400'}`}>
                            <Clock size={12} /> {task.dueDate} {isOverdue && '(Overdue)'}
                          </span>
                       </div>
                    </div>

                    <button onClick={() => deleteAssignment(task.id)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 size={18} />
                    </button>
                 </div>
               );
             })}
             
             {assignments.length === 0 && (
               <div className="text-center py-10 text-slate-400">
                 <p>No assignments tracked. Enjoy your free time!</p>
               </div>
             )}
          </div>
       </div>

       {/* Add Form Section */}
       <div className="w-80 flex flex-col">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm sticky top-0">
             <h3 className="font-bold text-slate-800 dark:text-white mb-4">Add Assignment</h3>
             <form onSubmit={addAssignment} className="space-y-4">
               <div>
                 <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Title</label>
                 <input 
                   type="text" 
                   value={newTitle} 
                   onChange={(e) => setNewTitle(e.target.value)} 
                   className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                   placeholder="e.g. Math Worksheet"
                   required
                 />
               </div>
               
               <div>
                 <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Subject</label>
                 <select 
                   value={newSubject} 
                   onChange={(e) => setNewSubject(e.target.value)} 
                   className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                 >
                   {['Math', 'Science', 'English', 'History', 'Art', 'Coding', 'Other'].map(s => <option key={s} value={s}>{s}</option>)}
                 </select>
               </div>

               <div>
                 <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Due Date</label>
                 <input 
                   type="date" 
                   value={newDate} 
                   onChange={(e) => setNewDate(e.target.value)} 
                   className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                   required
                 />
               </div>

               <button type="submit" className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium flex items-center justify-center gap-2">
                 <Plus size={18} /> Add Task
               </button>
             </form>
          </div>
          
          <div className="mt-6 bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/50">
             <h4 className="font-bold text-indigo-900 dark:text-indigo-300 text-sm mb-2">Upcoming Deadlines</h4>
             <p className="text-xs text-indigo-700 dark:text-indigo-400">
               You have {assignments.filter(a => !a.completed).length} pending assignments. Stay focused!
             </p>
          </div>
       </div>
    </div>
  );
};

export default HomeworkPlanner;
