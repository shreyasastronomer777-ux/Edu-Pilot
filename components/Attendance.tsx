import React, { useState } from 'react';
import { Users, CheckCircle, XCircle, Clock, Calendar, Edit2, Save, X, Plus } from 'lucide-react';

interface Student {
  id: number;
  name: string;
  status: 'present' | 'absent' | 'late';
}

const Attendance: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([
    { id: 1, name: "Alice Johnson", status: 'present' },
    { id: 2, name: "Bob Smith", status: 'present' },
    { id: 3, name: "Charlie Brown", status: 'absent' },
    { id: 4, name: "Diana Prince", status: 'present' },
    { id: 5, name: "Ethan Hunt", status: 'late' },
    { id: 6, name: "Fiona Apple", status: 'present' },
    { id: 7, name: "George Martin", status: 'present' },
    { id: 8, name: "Hannah Montana", status: 'present' },
    { id: 9, name: "Ian Malcolm", status: 'absent' },
    { id: 10, name: "Julia Roberts", status: 'present' },
  ]);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  
  // Add Student State
  const [isAdding, setIsAdding] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');

  const startEditing = (student: Student) => {
    setEditingId(student.id);
    setEditName(student.name);
  };

  const saveEdit = () => {
    if (editingId !== null && editName.trim()) {
      setStudents(students.map(s => 
        s.id === editingId ? { ...s, name: editName.trim() } : s
      ));
      setEditingId(null);
      setEditName('');
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
  };

  const addStudent = () => {
    if (newStudentName.trim()) {
      const newId = students.length > 0 ? Math.max(...students.map(s => s.id)) + 1 : 1;
      const newStudent: Student = {
        id: newId,
        name: newStudentName.trim(),
        status: 'present'
      };
      // Add to top of list for visibility
      setStudents([newStudent, ...students]);
      setNewStudentName('');
      setIsAdding(false);
    }
  };

  const removeStudent = (id: number) => {
    if (confirm('Are you sure you want to remove this student?')) {
      setStudents(students.filter(s => s.id !== id));
    }
  };

  const getStats = () => {
    const present = students.filter(s => s.status === 'present').length;
    const absent = students.filter(s => s.status === 'absent').length;
    const late = students.filter(s => s.status === 'late').length;
    return { present, absent, late };
  };

  const stats = getStats();
  const date = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="max-w-4xl mx-auto relative">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
            <Users className="text-pink-600 dark:text-pink-400" />
            Attendance Tracker
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
            <Calendar size={16}/> {date}
          </p>
        </div>
        
        <div className="flex gap-4">
          <div className="bg-white dark:bg-slate-800 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col items-center min-w-[80px]">
            <span className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.present}</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">Present</span>
          </div>
          <div className="bg-white dark:bg-slate-800 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col items-center min-w-[80px]">
            <span className="text-2xl font-bold text-red-500 dark:text-red-400">{stats.absent}</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">Absent</span>
          </div>
          <div className="bg-white dark:bg-slate-800 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col items-center min-w-[80px]">
            <span className="text-2xl font-bold text-amber-500 dark:text-amber-400">{stats.late}</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">Late</span>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">Class List ({students.length})</h3>
        <button 
          onClick={() => setIsAdding(true)} 
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-medium shadow-sm"
        >
          <Plus size={18} /> Add Student
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden transition-colors">
        <div className="grid grid-cols-1 divide-y divide-slate-100 dark:divide-slate-700">
          {students.length === 0 ? (
            <div className="p-8 text-center text-slate-500 dark:text-slate-400">
              No students in the list. Add one to get started!
            </div>
          ) : (
            students.map((student) => (
              <div key={student.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-500 dark:text-slate-300 flex-shrink-0">
                    {student.name.charAt(0)}
                  </div>
                  
                  {editingId === student.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="px-3 py-1.5 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none text-sm font-medium text-slate-800 dark:text-slate-200"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveEdit();
                          if (e.key === 'Escape') cancelEdit();
                        }}
                      />
                      <button onClick={saveEdit} className="p-1.5 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-md transition-colors" title="Save">
                        <Save size={18} />
                      </button>
                      <button onClick={cancelEdit} className="p-1.5 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md transition-colors" title="Cancel">
                        <X size={18} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-slate-800 dark:text-slate-200 text-lg">{student.name}</span>
                      <button 
                        onClick={() => startEditing(student)}
                        className="opacity-0 group-hover:opacity-100 text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all p-1.5 rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
                        title="Edit Name"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => removeStudent(student.id)}
                        className="opacity-0 group-hover:opacity-100 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 transition-all p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-900/30"
                        title="Remove Student"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <button 
                    onClick={() => setStudents(students.map(s => s.id === student.id ? { ...s, status: 'present' } : s))}
                    className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${student.status === 'present' ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 font-semibold ring-2 ring-green-500 ring-offset-1 dark:ring-offset-slate-800' : 'text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                  >
                    <CheckCircle size={18} /> Present
                  </button>
                  <button 
                    onClick={() => setStudents(students.map(s => s.id === student.id ? { ...s, status: 'absent' } : s))}
                    className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${student.status === 'absent' ? 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 font-semibold ring-2 ring-red-500 ring-offset-1 dark:ring-offset-slate-800' : 'text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                  >
                    <XCircle size={18} /> Absent
                  </button>
                   <button 
                    onClick={() => setStudents(students.map(s => s.id === student.id ? { ...s, status: 'late' } : s))}
                    className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${student.status === 'late' ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 font-semibold ring-2 ring-amber-500 ring-offset-1 dark:ring-offset-slate-800' : 'text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                  >
                    <Clock size={18} /> Late
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Student Modal */}
      {isAdding && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md p-6 border border-slate-200 dark:border-slate-700 transform animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Add New Student</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Enter the student's full name below.</p>
            
            <input
              type="text"
              value={newStudentName}
              onChange={(e) => setNewStudentName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addStudent()}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none mb-6"
              placeholder="e.g. John Doe"
              autoFocus
            />
            
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors font-medium"
              >
                Cancel
              </button>
              <button 
                onClick={addStudent}
                disabled={!newStudentName.trim()}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-medium shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Student
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Attendance;