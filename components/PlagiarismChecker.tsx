import React, { useState } from 'react';
import { checkPlagiarism, compareAssignments } from '../services/geminiService';
import { ShieldAlert, Globe, Users, Loader2, FileText, ExternalLink, AlertTriangle, CheckCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

type Mode = 'internet' | 'peer';

const PlagiarismChecker: React.FC = () => {
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
      <div className="mb-6 flex items-center justify-between">
         <h2 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
           <ShieldAlert className="text-red-600 dark:text-red-400" />
           Plagiarism Checker
         </h2>
         <div className="bg-white dark:bg-slate-800 rounded-lg p-1 flex border border-slate-200 dark:border-slate-700 shadow-sm transition-colors">
           <button 
             onClick={() => setMode('internet')}
             className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-all ${mode === 'internet' ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}
           >
             <Globe size={16} /> Internet Check
           </button>
           <button 
             onClick={() => setMode('peer')}
             className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-all ${mode === 'peer' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}
           >
             <Users size={16} /> Peer Comparison
           </button>
         </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* Input Area */}
        <div className="w-1/2 flex flex-col gap-4 overflow-y-auto pr-2">
           <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex-1 flex flex-col transition-colors">
              {mode === 'internet' ? (
                <>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Text to Scan</label>
                  <textarea 
                    value={textToScan}
                    onChange={(e) => setTextToScan(e.target.value)}
                    placeholder="Paste student submission here to check against online sources..."
                    className="w-full flex-1 p-4 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none resize-none text-sm mb-4"
                  />
                  <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 p-3 rounded-lg text-xs flex gap-2 mb-4">
                     <Globe size={14} className="mt-0.5 flex-shrink-0" />
                     Uses Google Search to identify matching phrases and potential sources from across the web.
                  </div>
                  <button 
                    onClick={handleInternetScan}
                    disabled={loading || !textToScan}
                    className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="animate-spin" /> : <ShieldAlert size={20} />}
                    Scan for Plagiarism
                  </button>
                </>
              ) : (
                <>
                  <div className="flex-1 flex flex-col gap-4 mb-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Student A Submission</label>
                      <textarea 
                        value={studentTextA}
                        onChange={(e) => setStudentTextA(e.target.value)}
                        placeholder="Paste first student's text..."
                        className="w-full h-32 p-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none resize-none text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Student B Submission</label>
                      <textarea 
                        value={studentTextB}
                        onChange={(e) => setStudentTextB(e.target.value)}
                        placeholder="Paste second student's text..."
                        className="w-full h-32 p-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none resize-none text-sm"
                      />
                    </div>
                  </div>
                  <button 
                    onClick={handlePeerCompare}
                    disabled={loading || !studentTextA || !studentTextB}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="animate-spin" /> : <Users size={20} />}
                    Compare Submissions
                  </button>
                </>
              )}
           </div>
        </div>

        {/* Results Area */}
        <div className="w-1/2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col overflow-hidden transition-colors">
          <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex items-center gap-2">
            <FileText size={18} className="text-slate-500 dark:text-slate-400" />
            <span className="font-semibold text-slate-700 dark:text-slate-200">Analysis Report</span>
          </div>
          
          <div className="flex-1 p-8 overflow-y-auto">
             {loading && (
               <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                 <Loader2 size={40} className="animate-spin mb-4 text-slate-300 dark:text-slate-600" />
                 <p>Analyzing text patterns...</p>
               </div>
             )}

             {error && (
               <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg flex items-center gap-2">
                 <AlertTriangle size={20} /> {error}
               </div>
             )}

             {!loading && !error && !internetResult && !peerResult && (
               <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 opacity-60">
                 <ShieldAlert size={64} className="mb-4" />
                 <p className="text-center">Results will appear here after scanning.</p>
               </div>
             )}

             {/* Internet Scan Results */}
             {!loading && mode === 'internet' && internetResult && (
               <div className="space-y-6">
                 {internetResult.sources.length > 0 ? (
                    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-xl">
                      <h4 className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-2 mb-3">
                        <AlertTriangle size={18} /> Potential Matches Found
                      </h4>
                      <ul className="space-y-2">
                        {internetResult.sources.map((source, idx) => (
                          <li key={idx} className="bg-white dark:bg-slate-900 p-2 rounded border border-amber-100 dark:border-amber-900/50 flex items-center justify-between text-sm hover:shadow-sm transition-shadow">
                             <div className="flex items-center gap-2 overflow-hidden">
                               <Globe size={14} className="text-slate-400 flex-shrink-0" />
                               <span className="truncate text-slate-700 dark:text-slate-300 font-medium">{source.title}</span>
                             </div>
                             <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 text-xs whitespace-nowrap ml-2">
                               Visit <ExternalLink size={10} />
                             </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                 ) : (
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-xl text-green-800 dark:text-green-300 flex items-center gap-3">
                      <CheckCircle size={24} />
                      <div>
                        <p className="font-bold">No direct online matches found.</p>
                        <p className="text-xs">The text appears unique compared to search results.</p>
                      </div>
                    </div>
                 )}

                 <div className="prose prose-slate dark:prose-invert max-w-none prose-sm">
                   <h4 className="text-slate-800 dark:text-slate-200 font-bold mb-2">Detailed Analysis</h4>
                   <ReactMarkdown>{internetResult.analysis}</ReactMarkdown>
                 </div>
               </div>
             )}

             {/* Peer Compare Results */}
             {!loading && mode === 'peer' && peerResult && (
               <div className="prose prose-slate dark:prose-invert max-w-none prose-headings:text-indigo-900 dark:prose-headings:text-indigo-300 prose-a:text-indigo-600 dark:prose-a:text-indigo-400">
                  <ReactMarkdown 
                    components={{
                      h1: ({node, ...props}) => <h1 className="text-xl font-bold border-b border-indigo-100 dark:border-indigo-900 pb-2 mb-4" {...props} />,
                      h2: ({node, ...props}) => <h2 className="text-lg font-bold mt-4 mb-2" {...props} />,
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