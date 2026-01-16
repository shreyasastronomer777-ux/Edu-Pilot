
import React, { useState } from 'react';
import { checkPlagiarism, compareAssignments } from '../services/geminiService';
import { ShieldAlert, Globe, Users, Loader2, FileText, ExternalLink, AlertTriangle, CheckCircle, Info, ArrowLeft } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

type Mode = 'internet' | 'peer';

interface PlagiarismCheckerProps {
  onBack?: () => void;
}

const PlagiarismChecker: React.FC<PlagiarismCheckerProps> = ({ onBack }) => {
  const [mode, setMode] = useState<Mode>('internet');
  
  // Internet Mode
  const [textToScan, setTextToScan] = useState('');
  const [internetResult, setInternetResult] = useState<{ analysis: string, sources: {uri: string, title: string}[] } | null>(null);
  
  // Peer Mode
  const [studentTextA, setStudentTextA] = useState('');
  const [studentTextB, setStudentTextB] = useState('');
  const [peerResult, setPeerResult] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInternetScan = async () => {
    if (!textToScan) return;
    setLoading(true);
    setInternetResult(null);
    setError(null);
    
    try {
      const result = await checkPlagiarism(textToScan);
      setInternetResult(result);
    } catch (err) {
      setError("Failed to complete the scan. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePeerCompare = async () => {
    if (!studentTextA || !studentTextB) return;
    setLoading(true);
    setPeerResult(null);
    setError(null);

    try {
      const result = await compareAssignments(studentTextA, studentTextB);
      setPeerResult(result);
    } catch (err) {
      setError("Failed to compare texts. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-col h-[calc(100vh-6rem)]">
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
         <div className="flex items-center gap-4">
           {onBack && (
             <button 
               onClick={onBack}
               className="p-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-indigo-500 transition-colors shadow-sm"
             >
               <ArrowLeft size={20} className="text-slate-500" />
             </button>
           )}
           <h2 className="text-3xl font-black text-slate-800 dark:text-white flex items-center gap-3 tracking-tighter">
             <ShieldAlert className="text-red-600 dark:text-red-400" />
             Guard Rail
           </h2>
         </div>
         <div className="bg-white/50 dark:bg-white/5 backdrop-blur-3xl rounded-2xl p-1.5 flex border border-slate-200 dark:border-white/10 shadow-sm transition-colors">
           <button 
             onClick={() => setMode('internet')}
             className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all ${mode === 'internet' ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'}`}
           >
             <Globe size={16} /> Internet Check
           </button>
           <button 
             onClick={() => setMode('peer')}
             className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all ${mode === 'peer' ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'}`}
           >
             <Users size={16} /> Peer Comparison
           </button>
         </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* Input Area */}
        <div className="w-1/2 flex flex-col gap-4 overflow-y-auto pr-2">
           <div className="bg-white/50 dark:bg-white/[0.03] backdrop-blur-3xl p-8 rounded-[2.5rem] border border-slate-200 dark:border-white/10 shadow-sm flex-1 flex flex-col transition-colors">
              {mode === 'internet' ? (
                <>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Text to Scan</label>
                  <textarea 
                    value={textToScan}
                    onChange={(e) => setTextToScan(e.target.value)}
                    placeholder="Paste student submission here to check against online sources..."
                    className="w-full flex-1 p-6 rounded-[2rem] border border-slate-200 dark:border-white/10 bg-white dark:bg-black/20 text-slate-900 dark:text-white focus:ring-4 focus:ring-red-500/10 focus:border-red-500 outline-none resize-none text-sm mb-6 font-medium leading-relaxed shadow-inner"
                  />
                  <div className="bg-blue-500/5 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 p-5 rounded-2xl text-xs flex gap-3 mb-6 border border-blue-500/20 leading-relaxed">
                     <Globe size={18} className="flex-shrink-0" />
                     <span>Uses precision neural search to identify potential sources from across the academic web.</span>
                  </div>
                  <button 
                    onClick={handleInternetScan}
                    disabled={loading || !textToScan}
                    className="w-full py-5 bg-red-600 hover:bg-red-700 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 transition-all disabled:opacity-50 shadow-lg shadow-red-500/20 active:scale-[0.98]"
                  >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : <ShieldAlert size={20} />}
                    Initiate Neural Scan
                  </button>
                </>
              ) : (
                <>
                  <div className="flex-1 flex flex-col gap-6 mb-6">
                    <div className="flex-1 flex flex-col">
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-2">Student A Submission</label>
                      <textarea 
                        value={studentTextA}
                        onChange={(e) => setStudentTextA(e.target.value)}
                        placeholder="Paste first student's text..."
                        className="w-full flex-1 p-5 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-black/20 text-slate-900 dark:text-white focus:ring-4 focus:ring-indigo-500/10 outline-none resize-none text-sm font-medium"
                      />
                    </div>
                    <div className="flex-1 flex flex-col">
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-2">Student B Submission</label>
                      <textarea 
                        value={studentTextB}
                        onChange={(e) => setStudentTextB(e.target.value)}
                        placeholder="Paste second student's text..."
                        className="w-full flex-1 p-5 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-black/20 text-slate-900 dark:text-white focus:ring-4 focus:ring-indigo-500/10 outline-none resize-none text-sm font-medium"
                      />
                    </div>
                  </div>
                  <button 
                    onClick={handlePeerCompare}
                    disabled={loading || !studentTextA || !studentTextB}
                    className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 transition-all disabled:opacity-50 shadow-lg shadow-indigo-500/20 active:scale-[0.98]"
                  >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : <Users size={20} />}
                    Compare Submissions
                  </button>
                </>
              )}
           </div>
        </div>

        {/* Results Area */}
        <div className="w-1/2 bg-white/50 dark:bg-white/[0.03] backdrop-blur-3xl rounded-[2.5rem] border border-slate-200 dark:border-white/10 shadow-sm flex flex-col overflow-hidden transition-colors">
          <div className="p-6 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-black/20 flex items-center gap-3">
            <FileText size={18} className="text-indigo-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Analysis Report</span>
          </div>
          
          <div className="flex-1 p-8 overflow-y-auto">
             {loading && (
               <div className="h-full flex flex-col items-center justify-center text-slate-400">
                 <div className="relative w-16 h-16 mb-6">
                    <Loader2 size={64} className="animate-spin text-red-500 absolute inset-0" />
                    <ShieldAlert size={32} className="absolute inset-0 m-auto animate-pulse text-red-500/50" />
                 </div>
                 <p className="font-black uppercase tracking-widest text-[10px]">Analyzing Neural Patterns...</p>
               </div>
             )}

             {error && (
               <div className="p-6 bg-red-500/5 border border-red-500/20 text-red-600 dark:text-red-400 rounded-2xl flex items-center gap-4">
                 <AlertTriangle size={24} /> 
                 <span className="font-bold">{error}</span>
               </div>
             )}

             {!loading && !error && !internetResult && !peerResult && (
               <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 opacity-60">
                 <ShieldAlert size={64} className="mb-6 opacity-20" />
                 <p className="text-[10px] font-black uppercase tracking-widest text-center">Neural findings will appear here<br/>following initialization</p>
               </div>
             )}

             {/* Internet Scan Results */}
             {!loading && mode === 'internet' && internetResult && (
               <div className="space-y-8 animate-in fade-in duration-700">
                 {internetResult.sources.length > 0 ? (
                    <div className="p-6 bg-slate-900/5 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[2rem]">
                      <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-3 mb-6">
                        <Globe size={18} className="text-blue-500" /> Top Identified Sources
                      </h4>
                      <ul className="space-y-3">
                        {internetResult.sources.slice(0, 3).map((source, idx) => (
                          <li key={idx} className="bg-white dark:bg-black/40 p-4 rounded-2xl border border-slate-100 dark:border-white/5 flex items-center justify-between text-sm hover:shadow-lg transition-all group">
                             <div className="flex items-center gap-4 overflow-hidden">
                               <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0 text-xs font-black text-blue-600">
                                 {idx + 1}
                               </div>
                               <span className="truncate text-slate-700 dark:text-slate-200 font-bold">{source.title}</span>
                             </div>
                             <a href={source.uri} target="_blank" rel="noopener noreferrer" className="p-2 bg-blue-500/5 text-blue-600 hover:bg-blue-500 hover:text-white rounded-xl transition-all ml-4">
                               <ExternalLink size={16} />
                             </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                 ) : (
                    <div className="p-8 bg-green-500/5 border border-green-500/20 rounded-[2rem] text-green-700 dark:text-green-400 flex items-center gap-6">
                      <CheckCircle size={40} className="flex-shrink-0" />
                      <div>
                        <p className="font-black uppercase tracking-widest text-[10px] mb-1">Status: Verified</p>
                        <p className="text-xl font-bold tracking-tight leading-tight">Zero matching neural markers identified in current global index.</p>
                      </div>
                    </div>
                 )}

                 <div className="prose prose-slate dark:prose-invert max-w-none prose-sm leading-relaxed">
                   <h4 className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-4">Neural Analysis Summary</h4>
                   <ReactMarkdown>{internetResult.analysis}</ReactMarkdown>
                 </div>
               </div>
             )}

             {/* Peer Compare Results */}
             {!loading && mode === 'peer' && peerResult && (
               <div className="prose prose-slate dark:prose-invert max-w-none animate-in fade-in duration-700">
                  <ReactMarkdown 
                    components={{
                      h1: ({node, ...props}) => <h1 className="text-2xl font-black tracking-tighter border-b border-indigo-500/10 pb-4 mb-6" {...props} />,
                      h2: ({node, ...props}) => <h2 className="text-lg font-bold mt-8 mb-4 flex items-center gap-2" {...props} />,
                      p: ({node, ...props}) => <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed mb-4" {...props} />,
                      strong: ({node, ...props}) => <strong className="font-black text-slate-900 dark:text-white" {...props} />,
                    }}
                  >
                    {peerResult}
                  </ReactMarkdown>
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlagiarismChecker;
