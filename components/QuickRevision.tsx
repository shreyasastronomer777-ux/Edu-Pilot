
import React, { useState, useRef, useEffect } from 'react';
import { BookOpenCheck, Upload, Loader2, Sparkles, Wand2, X, ArrowLeft, Zap, Save, Trash2, FileText, CheckCircle2, AlertCircle, Type, Mic, Square, Volume2 } from 'lucide-react';
import { generateRevisionInsights, summarizeText } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

const QuickRevision: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const [inputMode, setInputMode] = useState<'file' | 'text' | 'audio'>('file');
  const [asset, setAsset] = useState<string | null>(null);
  const [assetName, setAssetName] = useState('');
  const [pastedText, setPastedText] = useState('');
  const [mimeType, setMimeType] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  
  // Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const processFile = (file: File) => {
    setError(null);
    if (file) {
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        setError("Invalid format. Use PDF/JPG/PNG.");
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

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const supportedMime = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4';
      const mediaRecorder = new MediaRecorder(stream, { mimeType: supportedMime });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      const audioCtx = new AudioContext();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyzer = audioCtx.createAnalyser();
      analyzer.fftSize = 256;
      source.connect(analyzer);
      analyzerRef.current = analyzer;

      mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: supportedMime });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          setAsset(reader.result as string);
          setMimeType(supportedMime);
          setAssetName(`Audio Recap ${new Date().toLocaleTimeString()}`);
          setResult(null);
        };
        stream.getTracks().forEach(t => t.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = window.setInterval(() => setRecordingTime(prev => prev + 1), 1000);

      const updateLevel = () => {
        if (!mediaRecorderRef.current) return;
        const data = new Uint8Array(analyzer.frequencyBinCount);
        analyzer.getByteFrequencyData(data);
        setAudioLevel(data.reduce((a, b) => a + b) / data.length);
        if (mediaRecorder.state === 'recording') requestAnimationFrame(updateLevel);
      };
      updateLevel();
    } catch (err) { setError("Mic access denied."); }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const startSynthesis = async () => {
    setError(null);
    setLoading(true);
    try {
      let output;
      if (inputMode === 'file' || inputMode === 'audio') {
        if (!asset) throw new Error("No asset loaded.");
        output = await generateRevisionInsights(asset, mimeType);
      } else {
        if (!pastedText.trim()) throw new Error("Input required.");
        output = await summarizeText(`Revision autopsy for: ${pastedText}. Focus on definitions and points.`);
      }
      setResult(output);
      const currentPoints = Number(localStorage.getItem('svgpt_xp')) || 0;
      localStorage.setItem('svgpt_xp', (currentPoints + 25).toString());
    } catch (e: any) { setError(e.message || "Synthesis failed."); }
    finally { setLoading(false); }
  };

  const formatTime = (s: number) => `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;

  return (
    <div className="max-w-6xl mx-auto pb-20 animate-in fade-in duration-700">
      <div className="mb-8 flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors group">
          <div className="p-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 shadow-sm"><ArrowLeft size={16} /></div>
          Back to Hub
        </button>
      </div>

      <div className="bg-white dark:bg-[#050505] rounded-[3.5rem] border border-slate-200 dark:border-white/5 p-12 flex flex-col items-center gap-10 mb-12 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5"><BookOpenCheck size={180} /></div>
        
        <div className="text-center space-y-4 relative z-10">
          <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center text-emerald-500 mx-auto shadow-inner"><FileText size={32} /></div>
          <h2 className="text-4xl font-black uppercase tracking-tighter">REVISION AUTOPSY</h2>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Extract Essential Mastery Points</p>
        </div>

        <div className="w-full max-w-2xl flex flex-col gap-8 relative z-10">
          <div className="flex p-1 bg-slate-100 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 w-fit mx-auto">
            {['file', 'text', 'audio'].map(m => (
              <button key={m} onClick={() => {setInputMode(m as any); setAsset(null);}} className={`px-8 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${inputMode === m ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-lg' : 'text-slate-400'}`}>
                {m === 'file' ? 'Asset' : m === 'text' ? 'Script' : 'Voice'}
              </button>
            ))}
          </div>

          <div className="min-h-[256px]">
            {!asset ? (
              inputMode === 'file' ? (
                <div onClick={() => fileInputRef.current?.click()} className="w-full h-64 border-4 border-dashed rounded-[3rem] flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-slate-50 transition-all">
                  <Upload size={40} className="text-slate-200" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Deploy Image or PDF</span>
                  <input ref={fileInputRef} type="file" className="hidden" accept=".pdf,image/*" onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])} />
                </div>
              ) : inputMode === 'audio' ? (
                <div className="w-full h-64 bg-slate-50 dark:bg-black/20 rounded-[3rem] border border-slate-100 dark:border-white/5 flex flex-col items-center justify-center gap-6">
                  {isRecording ? (
                    <>
                      <div className="flex gap-1 h-8 items-center">
                        {[...Array(6)].map((_, i) => <div key={i} className="w-1 bg-indigo-500 rounded-full" style={{ height: `${20 + (audioLevel * Math.random())}%` }}></div>)}
                      </div>
                      <span className="text-4xl font-black tabular-nums text-indigo-500">{formatTime(recordingTime)}</span>
                      <button onClick={stopRecording} className="p-5 bg-red-600 text-white rounded-full"><Square size={20} fill="currentColor" /></button>
                    </>
                  ) : (
                    <button onClick={startRecording} className="p-8 bg-indigo-600 text-white rounded-[2rem] shadow-xl hover:scale-105 transition-all flex flex-col items-center gap-3">
                      <Mic size={32} />
                      <span className="text-[9px] font-black uppercase tracking-widest">Start Voice Recap</span>
                    </button>
                  )}
                </div>
              ) : (
                <textarea value={pastedText} onChange={(e) => setPastedText(e.target.value)} placeholder="Paste session content..." className="w-full h-64 p-8 bg-slate-50 dark:bg-black/40 rounded-[2.5rem] border border-slate-200 dark:border-white/10 text-sm font-medium outline-none focus:ring-8 focus:ring-violet-500/10 transition-all" />
              )
            ) : (
              <div className="relative w-full h-64 rounded-[2.5rem] overflow-hidden border border-slate-200 bg-slate-50 dark:bg-black/20 flex flex-col items-center justify-center shadow-xl">
                 {mimeType.startsWith('audio') ? <Volume2 size={64} className="text-indigo-400 animate-pulse" /> : mimeType === 'application/pdf' ? <FileText size={64} className="text-slate-300" /> : <img src={asset} className="w-full h-full object-contain" />}
                 <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-4 px-10 truncate w-full text-center">{assetName}</span>
                 <button onClick={() => setAsset(null)} className="absolute top-4 right-4 p-2 bg-white rounded-xl text-red-500 shadow-lg hover:scale-110 transition-all"><X size={16} /></button>
              </div>
            )}
          </div>

          <button onClick={startSynthesis} disabled={loading || (!asset && !pastedText.trim())} className="w-full py-5 premium-gradient text-white rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-2xl active:scale-95 transition-all disabled:opacity-30 flex items-center justify-center gap-3">
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Wand2 size={20} />}
            {loading ? 'Performing Autopsy...' : 'Synthesize Insights'}
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-white/[0.02] backdrop-blur-3xl rounded-[3.5rem] border border-slate-200 p-12 min-h-[400px]">
        {loading ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-4">
            <Loader2 className="animate-spin text-violet-500" size={48} />
            <p className="text-[10px] font-black uppercase tracking-[0.4em]">Extracting Semantic Data...</p>
          </div>
        ) : result ? (
          <div className="prose prose-slate dark:prose-invert max-w-none animate-in slide-in-from-bottom-6">
            <ReactMarkdown>{result}</ReactMarkdown>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center opacity-10">
            <BookOpenCheck size={100} />
            <p className="text-[12px] font-black uppercase tracking-[0.6em] mt-10">Awaiting Inputs</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuickRevision;
