
import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, Loader2, Sparkles, Wand2, X, ArrowLeft, BrainCircuit, Zap, CheckCircle2, FileText, BookOpenCheck, Save, Trash2, AlertCircle, Atom, FlaskConical, Printer, Mic, Square, Volume2 } from 'lucide-react';
import { solveDoubt, generateRevisionInsights } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

type SolverMode = 'solve' | 'revision';
type InputSource = 'file' | 'audio';

const DoubtSolver: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const [mode, setMode] = useState<SolverMode>('solve');
  const [inputSource, setInputSource] = useState<InputSource>('file');
  const [asset, setAsset] = useState<string | null>(null);
  const [assetName, setAssetName] = useState<string>('');
  const [mimeType, setMimeType] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  // Audio Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const processFile = (file: File) => {
    setError(null);
    if (file) {
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setError("Unsupported format. Use PDF/JPG/PNG/WEBP.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        setAsset(e.target?.result as string);
        setMimeType(file.type);
        setAssetName(file.name);
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  // Added handleUpload to fix the "Cannot find name 'handleUpload'" error
  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const supportedMime = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4';
      const mediaRecorder = new MediaRecorder(stream, { mimeType: supportedMime });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyzer = audioContext.createAnalyser();
      analyzer.fftSize = 256;
      source.connect(analyzer);
      analyzerRef.current = analyzer;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: supportedMime });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          setAsset(reader.result as string);
          setMimeType(supportedMime);
          setAssetName(`Voice Query ${new Date().toLocaleTimeString()}`);
          setResult(null);
        };
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = window.setInterval(() => setRecordingTime(prev => prev + 1), 1000);
      
      const updateLevel = () => {
        if (!mediaRecorderRef.current) return;
        const dataArray = new Uint8Array(analyzer.frequencyBinCount);
        analyzer.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        setAudioLevel(average);
        if (mediaRecorder.state === 'recording') requestAnimationFrame(updateLevel);
      };
      updateLevel();

    } catch (err) {
      setError("Microphone access denied.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const processAnalysis = async () => {
    if (!asset) return;
    setLoading(true);
    setError(null);
    try {
      let output;
      if (mode === 'solve') {
        output = await solveDoubt(asset, mimeType);
      } else {
        output = await generateRevisionInsights(asset, mimeType);
      }
      setResult(output);
      const currentPoints = Number(localStorage.getItem('svgpt_xp')) || 0;
      localStorage.setItem('svgpt_xp', (currentPoints + 50).toString());
    } catch (e: any) {
      setError(e.message || "Synthesis failed.");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (s: number) => `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-8 pb-20 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
         <button onClick={onBack} className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors group">
           <div className="p-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 group-hover:border-indigo-200 shadow-sm">
              <ArrowLeft size={16} />
           </div>
           Back to Dashboard
         </button>
         
         <div className="flex p-1 bg-slate-100 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
            <button onClick={() => setMode('solve')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${mode === 'solve' ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl' : 'text-slate-500 hover:text-slate-800'}`}>
              <BrainCircuit size={14} /> Instant Solver
            </button>
            <button onClick={() => setMode('revision')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${mode === 'revision' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/20' : 'text-slate-500 hover:text-indigo-600'}`}>
              <BookOpenCheck size={14} /> Quick Revision
            </button>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1">
        <div className="bg-white/70 dark:bg-white/[0.03] backdrop-blur-3xl p-10 rounded-[3.5rem] border border-slate-200 dark:border-white/10 shadow-sm flex flex-col items-center">
           <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-8 ${mode === 'solve' ? 'bg-indigo-500/10' : 'bg-emerald-500/10'}`}>
              {isRecording ? <Mic className="text-red-500 animate-pulse" size={32} /> : mode === 'solve' ? <BrainCircuit className="text-indigo-500" size={32} /> : <FileText className="text-emerald-500" size={32} />}
           </div>
           
           <h2 className="text-3xl font-black tracking-tighter uppercase text-slate-900 dark:text-white mb-2">Neural Input Hub</h2>
           <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-10 text-center">Deploy Asset or Start Voice Synthesis</p>

           <div className="flex p-1 bg-slate-100 dark:bg-white/5 rounded-2xl mb-8 border border-slate-200 dark:border-white/10">
              <button onClick={() => {setInputSource('file'); setAsset(null);}} className={`px-8 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${inputSource === 'file' ? 'bg-white dark:bg-slate-700 text-indigo-600' : 'text-slate-400'}`}>Neural Asset</button>
              <button onClick={() => {setInputSource('audio'); setAsset(null);}} className={`px-8 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${inputSource === 'audio' ? 'bg-white dark:bg-slate-700 text-indigo-600' : 'text-slate-400'}`}>Voice Query</button>
           </div>

           {!asset ? (
             inputSource === 'file' ? (
               <div 
                 onClick={() => fileInputRef.current?.click()}
                 className={`w-full aspect-[4/3] border-4 border-dashed rounded-[3rem] flex flex-col items-center justify-center cursor-pointer transition-all duration-300 hover:bg-slate-50 dark:hover:bg-white/5 ${isDragging ? 'border-indigo-500' : 'border-slate-100 dark:border-white/5'}`}
               >
                  <Upload size={48} className="text-slate-200 mb-4" />
                  <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Deploy Image or PDF</span>
                  <input ref={fileInputRef} type="file" className="hidden" onChange={handleUpload} />
               </div>
             ) : (
               <div className="w-full aspect-[4/3] bg-slate-50 dark:bg-black/20 rounded-[3rem] border border-slate-100 dark:border-white/5 flex flex-col items-center justify-center gap-8">
                  {isRecording ? (
                    <div className="flex flex-col items-center gap-6">
                      <div className="flex gap-1 h-12 items-center">
                        {[...Array(8)].map((_, i) => (
                          <div key={i} className="w-1.5 bg-red-500 rounded-full transition-all duration-75" style={{ height: `${20 + (audioLevel * Math.random())}%` }}></div>
                        ))}
                      </div>
                      <span className="text-3xl font-black tabular-nums text-red-500">{formatTime(recordingTime)}</span>
                      <button onClick={stopRecording} className="p-6 bg-red-600 text-white rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all"><Square size={24} fill="currentColor" /></button>
                    </div>
                  ) : (
                    <button onClick={startRecording} className="p-10 bg-indigo-600 text-white rounded-[2.5rem] shadow-2xl hover:scale-105 active:scale-95 transition-all flex flex-col items-center gap-4">
                      <Mic size={48} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Start Neural Voice Link</span>
                    </button>
                  )}
               </div>
             )
           ) : (
             <div className="w-full flex flex-col items-center">
                <div className="relative w-full aspect-[4/3] rounded-[3rem] overflow-hidden border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 flex flex-col items-center justify-center shadow-2xl">
                   {mimeType.startsWith('audio') ? <Volume2 size={80} className="text-indigo-400 animate-pulse" /> : mimeType === 'application/pdf' ? <FileText size={80} className="text-slate-300" /> : <img src={asset} className="w-full h-full object-contain" />}
                   <div className="mt-4 px-10 text-center">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 truncate block w-full">{assetName}</span>
                   </div>
                   <button onClick={() => { setAsset(null); setAssetName(''); }} className="absolute top-6 right-6 p-3 bg-white/90 rounded-2xl text-red-500 shadow-xl hover:scale-110 transition-transform"><X size={20} /></button>
                </div>
                <button onClick={processAnalysis} disabled={loading} className="w-full mt-8 py-5 premium-gradient text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3">
                  {loading ? <Loader2 className="animate-spin" size={20} /> : <Wand2 size={20} />}
                  {loading ? 'Synthesizing...' : 'Analyze Neural Data'}
                </button>
             </div>
           )}
        </div>

        <div className="bg-white/70 dark:bg-white/[0.03] backdrop-blur-3xl rounded-[3.5rem] border border-slate-200 dark:border-white/10 shadow-sm flex flex-col overflow-hidden min-h-[500px]">
           <div className="p-6 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-black/20 flex justify-between items-center px-10">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                 <Zap size={16} className="text-indigo-500" /> Neural Resolution
              </h3>
              {result && !loading && (
                 <button onClick={() => window.print()} className="p-2.5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-400 rounded-xl hover:text-indigo-500"><Printer size={16} /></button>
              )}
           </div>
           <div className="flex-1 p-10 overflow-y-auto custom-scrollbar prose prose-slate dark:prose-invert max-w-none">
              {loading ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                   <Loader2 size={48} className="animate-spin text-indigo-500 mb-6" />
                   <p className="text-[10px] font-black uppercase tracking-[0.4em]">Deconstructing Logic...</p>
                </div>
              ) : result ? (
                <div className="animate-in fade-in duration-700">
                   <ReactMarkdown>{result}</ReactMarkdown>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center opacity-10">
                   <BrainCircuit size={100} strokeWidth={1} />
                   <p className="text-[12px] font-black uppercase tracking-[0.6em] mt-10">Awaiting Data</p>
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default DoubtSolver;
