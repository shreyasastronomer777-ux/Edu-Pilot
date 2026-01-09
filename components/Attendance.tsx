
import React, { useState, useEffect } from 'react';
import { Users, CheckCircle, XCircle, Clock, Calendar, Edit2, Save, X, Plus, Download, History, Trash2, Search, ArrowLeft } from 'lucide-react';

interface Student {
  id: number;
  name: string;
  status: 'present' | 'absent' | 'late';
}

interface AttendanceLog {
  id: string;
  date: string;
  stats: { present: number, absent: number, late: number };
}

interface AttendanceProps {
  onBack?: () => void;
}

const Attendance: React.FC<AttendanceProps> = ({ onBack }) => {
  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('edupilot_students');
    return saved ? JSON.parse(saved) : [
      { id: 1, name: "Alice Johnson", status: 'present' },
      { id: 2, name: "Bob Smith", status: 'present' },
      { id: 3, name: "Charlie Brown", status: 'absent' },
      { id: 4, name: "Diana Prince", status: 'present' },
      { id: 5, name: "Ethan Hunt", status: 'late' }
    ];
  });

  const [logs, setLogs] = useState<AttendanceLog[]>(() => {
    const saved = localStorage.getItem('edupilot_attendance_logs');
    return saved ? JSON.parse(saved) : [];
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    localStorage.setItem('edupilot_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('edupilot_attendance_logs', JSON.stringify(logs));
  }, [logs]);

  const startEditing = (student: Student) => {
    setEditingId(student.id);
    setEditName(student.name);
  };

  const saveEdit = () => {
    if (editingId !== null && editName.trim()) {
      setStudents(students.map(s => s.id === editingId ? { ...s, name: editName.trim() } : s));
      setEditingId(null);
      setEditName('');
    }
  };

  const addStudent = () => {
    if (newStudentName.trim()) {
      const newId = Date.now();
      setStudents([{ id: newId, name: newStudentName.trim(), status: 'present' }, ...students]);
      setNewStudentName('');
      setIsAdding(false);
      setSuccessMessage('Student added successfully!');
    }
  };

  const removeStudent = (id: number) => {
    if (confirm('Permanently remove this student from your roster?')) {
      setStudents(students.filter(s => s.id !== id));
    }
  };

  const saveSession = () => {
    const stats = getStats();
    const newLog: AttendanceLog = {
      id: Date.now().toString(),
      date: new Date().toLocaleString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      stats
    };
    setLogs([newLog, ...logs.slice(0, 19)]);
    setSuccessMessage('Attendance session saved to history!');
  };

  const deleteLog = (id: string) => {
    setLogs(logs.filter(l => l.id !== id));
  };

  const getStats = () => {
    const present = students.filter(s => s.status === 'present').length;
    const absent = students.filter(s => s.status === 'absent').length;
    const late = students.filter(s => s.status === 'late').length;
    return { present, absent, late };
  };

  const stats = getStats();
  const dateStr = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const filteredStudents = students.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="max-w-5xl mx-auto pb-12 animate-in fade-in duration-500">
      {/* Module Navigation */}
      <div className="mb-6 flex items-center justify-between">
         <button 
           onClick={onBack}
           className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors group"
         >
           <div className="p-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 group-hover:border-indigo-200">
              <ArrowLeft size={16} />
           </div>
           Back to Dashboard
         </button>
      </div>

      {/* Header & Stats Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-10">
        <div className="lg:col-span-2 flex flex-col justify-center">
          <h2 className="text-3xl font-black text-slate-800 dark:text-white flex items-center gap-3 tracking-tight">
            <div className="p-2 bg-pink-100 dark:bg-pink-900/30 rounded-xl">
              <Users className="text-pink-600 dark:text-pink-400" size={28} />
            </div>
            Attendance Tracker
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-2 font-medium">
            <Calendar size={18} className="text-pink-500" /> {dateStr}
          </p>
        </div>
        
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col items-center justify-center transition-all hover:shadow-md">
          <div className="w-10 h-10 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-2">
            <CheckCircle className="text-green-500" size={20} />
          </div>
          <span className="text-3xl font-black text-slate-800 dark:text-white leading-none">{stats.present}</span>
          <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-1">Present</span>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col items-center justify-center transition-all hover:shadow-md">
          <div className="w-10 h-10 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-2">
            <XCircle className="text-red-500" size={20} />
          </div>
          <span className="text-3xl font-black text-slate-800 dark:text-white leading-none">{stats.absent}</span>
          <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-1">Absent</span>
        </div>
      </div>

      {/* Rest of component... */}
      {successMessage && (
        <div className="mb-6 p-4 bg-green-500 text-white rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-2 font-bold shadow-lg shadow-green-500/20">
          <CheckCircle size={20} />
          {successMessage}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-[32px] border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col transition-all">
            <div className="p-6 border-b border-slate-50 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-800/50">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search student..."
                  className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-pink-500 outline-none transition-all"
                />
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={saveSession}
                  className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all font-bold text-xs flex items-center gap-2 shadow-sm"
                >
                  <Save size={16} className="text-pink-500" /> Log Session
                </button>
                <button 
                  onClick={() => setIsAdding(true)} 
                  className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl transition-all font-black text-xs flex items-center gap-2 shadow-lg active:scale-95"
                >
                  <Plus size={16} /> New Student
                </button>
              </div>
            </div>

            <div className="divide-y divide-slate-50 dark:divide-slate-700 max-h-[500px] overflow-y-auto">
              {filteredStudents.length > 0 ? filteredStudents.map((student) => (
                <div key={student.id} className="p-5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group">
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`w-2 h-10 rounded-full ${student.status === 'present' ? 'bg-green-500' : student.status === 'absent' ? 'bg-red-500' : 'bg-amber-500'}`}></div>
                    <div className="flex-1 min-w-0">
                      {editingId === student.id ? (
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full max-w-xs px-3 py-1.5 border border-pink-300 bg-white dark:bg-slate-900 rounded-lg text-sm font-bold focus:ring-2 focus:ring-pink-500 outline-none"
                          autoFocus
                          onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                        />
                      ) : (
                        <span className="font-bold text-slate-800 dark:text-slate-200 block truncate text-lg tracking-tight">{student.name}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-1.5 p-1.5 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                    {(['present', 'absent', 'late'] as const).map(s => (
                      <button 
                        key={s}
                        onClick={() => setStudents(students.map(std => std.id === student.id ? { ...std, status: s } : std))}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-sm ${
                          student.status === s 
                            ? (s === 'present' ? 'bg-green-500 text-white shadow-green-500/20 scale-105' : s === 'absent' ? 'bg-red-500 text-white shadow-red-500/20 scale-105' : 'bg-amber-500 text-white shadow-amber-500/20 scale-105')
                            : 'bg-white dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                        }`}
                      >
                        {s === 'present' ? <CheckCircle size={20}/> : s === 'absent' ? <XCircle size={20}/> : <Clock size={20}/>}
                      </button>
                    ))}
                  </div>
                </div>
              )) : null}
            </div>
          </div>
        </div>

        <div className="space-y-6">
           <h3 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2 tracking-tight">
             <History size={20} className="text-pink-500" /> Log History
           </h3>
           <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
              {logs.length > 0 ? logs.map((log) => (
                <div key={log.id} className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm relative group animate-in slide-in-from-right-2">
                   <div className="flex justify-between items-start mb-4">
                      <div className="bg-slate-50 dark:bg-slate-900 px-3 py-1 rounded-full text-[10px] font-black text-slate-500 uppercase tracking-widest border border-slate-100 dark:border-slate-800">
                        {log.date}
                      </div>
                      <button onClick={() => deleteLog(log.id)} className="p-1 text-slate-300 hover:text-red-500 transition-colors">
                        <Trash2 size={14} />
                      </button>
                   </div>
                   <div className="flex gap-4">
                      <div className="flex-1 flex flex-col">
                        <span className="text-xl font-black text-green-500 leading-none">{log.stats.present}</span>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Present</span>
                      </div>
                      <div className="flex-1 flex flex-col border-l border-slate-50 dark:border-slate-700 pl-4">
                        <span className="text-xl font-black text-red-500 leading-none">{log.stats.absent}</span>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Absent</span>
                      </div>
                      <div className="flex-1 flex flex-col border-l border-slate-50 dark:border-slate-700 pl-4">
                        <span className="text-xl font-black text-amber-500 leading-none">{log.stats.late}</span>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Late</span>
                      </div>
                   </div>
                </div>
              )) : (
                <div className="text-center py-12 bg-slate-50/50 dark:bg-slate-900/50 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
                  <Clock size={32} className="mx-auto mb-2 text-slate-300" />
                  <p className="text-xs font-bold text-slate-400 uppercase">No history logged yet</p>
                </div>
              )}
           </div>
        </div>
      </div>

      {isAdding && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-800 rounded-[32px] shadow-2xl w-full max-w-md p-8 border border-slate-100 dark:border-slate-700">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-6 tracking-tight">Register New Student</h3>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Student Name</label>
                <input
                  type="text"
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  className="w-full px-5 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-bold outline-none focus:ring-4 focus:ring-pink-500/10 focus:border-pink-500 transition-all"
                  placeholder="e.g. Marcus Aurelius"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && addStudent()}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-8">
              <button onClick={() => setIsAdding(false)} className="px-5 py-3 text-slate-500 font-bold hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-colors">Cancel</button>
              <button onClick={addStudent} className="px-8 py-3 bg-pink-600 text-white rounded-xl font-black shadow-lg shadow-pink-500/20 active:scale-95 transition-all">Add Student</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Attendance;
