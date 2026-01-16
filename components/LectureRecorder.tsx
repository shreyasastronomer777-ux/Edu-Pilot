
import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Loader2, FileText, Sparkles, Wand2, ArrowLeft, Activity, Volume2 } from 'lucide-react';
import { summarizeAudioLecture } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

const LectureRecorder: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [activeMimeType, setActiveMimeType] = useState('audio/wav');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);

  // Smart Pause State
  const [countdown, setCountdown] = useState<number | null>(null);
  const wasRecordingBeforeHide = useRef(false);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (isRecording) {
          wasRecordingBeforeHide.current = true;
          // Note: Real hardware recording usually continues, but we pause the UI timer
          if (timerRef.current) clearInterval(timerRef.current);
        }
      } else {
        if (wasRecordingBeforeHide.current) {
          wasRecordingBeforeHide.current = false;
          setCountdown(3);
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isRecording]);

  useEffect(() => {
    if (countdown === null) return;
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(t);
    } else {
      if (isRecording) {
        timerRef.current = window.setInterval(() => setRecordingTime(prev => prev + 1), 1000);
      }
      setCountdown(null);
    }
  }, [countdown, isRecording]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Better Mime Type Detection
      const supportedMime = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4';
      setActiveMimeType(supportedMime);

      const mediaRecorder = new MediaRecorder(stream, { mimeType: supportedMime });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      // Audio Level Analysis
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
        reader.onloadend = async () => {
          const base64Audio = reader.result as string;
          processAudio(base64Audio, supportedMime);
        };
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = window.setInterval(() => setRecordingTime(prev => prev + 1), 1000);
      
      const updateLevel = () => {
        if (!isRecording && !mediaRecorderRef.current) return;
        const dataArray = new Uint8Array(analyzer.frequencyBinCount);
        analyzer.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        setAudioLevel(average);
        requestAnimationFrame(updateLevel);
      };
      updateLevel();

    } catch (err) {
      alert("Microphone access denied.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const processAudio = async (base64: string, mime: string) => {
    setLoading(true);
    try {
      const synthesizedNotes = await summarizeAudioLecture(base64, mime);
      setNotes(synthesizedNotes);
    } catch (e) {
      alert("Neural synthesis failed. Ensure recording is clear.");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="max-w-4xl mx-auto pb-20 relative">
       {/* Countdown Overlay */}
       {countdown !== null && (
         <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-xl flex flex-col items-center justify-center animate-in fade-in duration-300">
            <div className="text-white text-center">
              <p className="text-xs font-black uppercase tracking-[0.5em] mb-4 opacity-50">Resuming Session In</p>
              <h2 className="text-[12rem] font-black leading-none animate-pulse">{countdown}</h2>
            </div>
         </div>
       )}

       <div className="bg-white/70 dark:bg-white/[0.03] backdrop-blur-3xl p-12 rounded-[3.5rem] border border-slate-200 dark:border-white/10 shadow-sm mb-10 flex flex-col items-center">
          <div className="w-20 h-20 bg-sky-500/10 rounded-3xl flex items-center justify-center mb-8">
             <Mic className={`${isRecording ? 'text-red-500 animate-pulse' : 'text-sky-500'}`} size={32} />
          </div>
          
          <h2 className="text-3xl font-black tracking-tighter uppercase text-slate-900 dark:text-white mb-2">Audio Scribe</h2>
          <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-10 text-center">Neural Recording & Academic Synthesis</p>

          <div className="relative w-full max-w-sm h-1 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden mb-12">
             <div 
               className="h-full bg-sky-500 transition-all duration-150" 
               style={{ width: `${Math.min(100, (audioLevel / 128) * 100)}%` }}
             ></div>
          </div>

          <div className="flex flex-col items-center gap-6">
             <span className="text-4xl font-black text-slate-900 dark:text-white tabular-nums tracking-tighter">
                {formatTime(recordingTime)}
             </span>
             
             {!isRecording ? (
                <button 
                  onClick={startRecording}
                  disabled={loading}
                  className="px-12 py-5 premium-gradient text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-indigo-500/20 active:scale-95 transition-all flex items-center gap-3"
                >
                   <Mic size={20} /> Start Recording
                </button>
             ) : (
                <button 
                  onClick={stopRecording}
                  className="px-12 py-5 bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-red-500/20 active:scale-95 transition-all flex items-center gap-3 animate-pulse"
                >
                   <Square size={20} /> Stop & Synthesize
                </button>
             )}
          </div>
       </div>

       {loading && (
         <div className="bg-white/50 dark:bg-white/5 p-12 rounded-[3.5rem] flex flex-col items-center border border-slate-200 dark:border-white/10 animate-in fade-in zoom-in-95">
            <div className="relative mb-6">
               <Loader2 className="animate-spin text-sky-500" size={64} />
               <Wand2 className="absolute inset-0 m-auto text-sky-500/50 animate-pulse" size={24} />
            </div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Synthesizing Neural Notes...</h4>
         </div>
       )}

       {notes && !loading && (
         <div className="bg-white/70 dark:bg-white/[0.03] backdrop-blur-3xl p-10 rounded-[3rem] border border-slate-200 dark:border-white/10 shadow-2xl animate-in slide-in-from-bottom-6">
            <div className="flex justify-between items-center mb-10 pb-6 border-b border-slate-100 dark:border-white/5">
               <div className="flex items-center gap-3">
                  <FileText className="text-sky-500" size={24} />
                  <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white">Synthesized Lecture Notes</span>
               </div>
               <button 
                  onClick={() => navigator.clipboard.writeText(notes)}
                  className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105"
               >
                  Copy Assets
               </button>
            </div>
            <div className="prose prose-slate dark:prose-invert max-w-none">
               <ReactMarkdown>{notes}</ReactMarkdown>
            </div>
         </div>
       )}
    </div>
  );
};

export default LectureRecorder;
