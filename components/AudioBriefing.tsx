
import React, { useState, useRef, useEffect } from 'react';
import { Headphones, Play, Pause, RefreshCw, Loader2, Sparkles, Wand2, ArrowLeft, Volume2, SkipBack, SkipForward, FileText, Upload, Zap } from 'lucide-react';
import { generateAudioBriefing } from '../services/geminiService';

const AudioBriefing: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [script, setScript] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const startTimeRef = useRef<number>(0);
  const pauseTimeRef = useRef<number>(0);

  const decodeBase64 = (base64: string) => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);
    return bytes;
  };

  const decodeAudioData = async (data: Uint8Array, ctx: AudioContext): Promise<AudioBuffer> => {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length;
    const buffer = ctx.createBuffer(1, frameCount, 24000);
    const channelData = buffer.getChannelData(0);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i] / 32768.0;
    }
    return buffer;
  };

  const handleSynthesize = async () => {
    if (!content.trim()) return;
    setLoading(true);
    setScript(null);
    setAudioBuffer(null);
    stopPlayback();

    try {
      const { audioBase64, script: generatedScript } = await generateAudioBriefing(content);
      setScript(generatedScript);

      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      
      const audioBytes = decodeBase64(audioBase64);
      const buffer = await decodeAudioData(audioBytes, audioCtxRef.current);
      setAudioBuffer(buffer);
    } catch (e) {
      alert("Neural audio synthesis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const startPlayback = () => {
    if (!audioBuffer || !audioCtxRef.current) return;
    
    stopPlayback();
    
    const source = audioCtxRef.current.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioCtxRef.current.destination);
    
    const offset = pauseTimeRef.current % audioBuffer.duration;
    startTimeRef.current = audioCtxRef.current.currentTime - offset;
    
    source.start(0, offset);
    source.onended = () => {
      if (audioCtxRef.current && audioCtxRef.current.currentTime - startTimeRef.current >= audioBuffer.duration) {
        setIsPlaying(false);
        pauseTimeRef.current = 0;
      }
    };
    
    sourceNodeRef.current = source;
    setIsPlaying(true);
  };

  const stopPlayback = () => {
    if (sourceNodeRef.current) {
      sourceNodeRef.current.stop();
      sourceNodeRef.current = null;
    }
    if (audioCtxRef.current && isPlaying) {
      pauseTimeRef.current = audioCtxRef.current.currentTime - startTimeRef.current;
    }
    setIsPlaying(false);
  };

  useEffect(() => {
    let interval: number;
    if (isPlaying && audioBuffer && audioCtxRef.current) {
      interval = window.setInterval(() => {
        const current = audioCtxRef.current!.currentTime - startTimeRef.current;
        setCurrentTime(Math.min(current, audioBuffer.duration));
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying, audioBuffer]);

  const progress = audioBuffer ? (currentTime / audioBuffer.duration) * 100 : 0;

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
         <button onClick={onBack} className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors group">
           <div className="p-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 group-hover:border-indigo-200">
              <ArrowLeft size={16} />
           </div>
           Back to My Hub
         </button>
         
         <div className="flex items-center gap-3 px-6 py-2 bg-indigo-500/10 rounded-full border border-indigo-500/20">
            <Zap className="text-indigo-600 dark:text-indigo-400" size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-700 dark:text-indigo-500">
               Neural Briefing Engine v2.5
            </span>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="space-y-8">
          <div className="bg-white/70 dark:bg-white/[0.03] p-10 rounded-[3rem] border border-slate-200 dark:border-white/10 shadow-sm">
             <div className="w-16 h-16 bg-sky-500/10 rounded-2xl flex items-center justify-center mb-8">
                <FileText className="text-sky-500" size={32} />
             </div>
             <h2 className="text-3xl font-[900] tracking-tighter uppercase text-slate-900 dark:text-white mb-2">Briefing Assets</h2>
             <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-8">Input study notes for synthesis</p>
             
             <textarea 
               value={content}
               onChange={(e) => setContent(e.target.value)}
               placeholder="Paste complex academic notes or lecture scripts here..."
               className="w-full h-64 p-6 bg-slate-50 dark:bg-black/20 rounded-3xl border border-slate-200 dark:border-white/10 text-sm font-medium outline-none focus:ring-4 focus:ring-sky-500/10 transition-all resize-none mb-8 shadow-inner"
             />

             <button 
               onClick={handleSynthesize}
               disabled={loading || !content.trim()}
               className="w-full py-5 premium-gradient text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-xl hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-50"
             >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <Wand2 size={20} />}
                {loading ? 'Synthesizing Neural Brief...' : 'Synthesize Audio Briefing'}
             </button>
          </div>
        </div>

        <div className="flex flex-col gap-8">
           <div className="bg-slate-900 dark:bg-white p-10 rounded-[3.5rem] text-white dark:text-slate-900 shadow-2xl relative overflow-hidden flex flex-col items-center justify-center text-center">
              <div className="absolute inset-0 opacity-10 pointer-events-none">
                 <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
              </div>
              
              <div className="relative z-10 w-full">
                 <div className="w-20 h-20 bg-white/10 dark:bg-slate-900/10 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse">
                    <Headphones size={32} />
                 </div>
                 <h3 className="text-2xl font-black tracking-tighter uppercase mb-2">Neural Playback</h3>
                 <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-10">High-Fidelity Master</p>

                 <div className="w-full h-1 bg-white/10 dark:bg-slate-900/10 rounded-full mb-6 overflow-hidden">
                    <div className="h-full bg-sky-400 transition-all duration-100" style={{ width: `${progress}%` }}></div>
                 </div>

                 <div className="flex items-center justify-center gap-8">
                    <button className="p-3 opacity-40 hover:opacity-100 transition-opacity"><SkipBack size={24} /></button>
                    <button 
                      onClick={isPlaying ? stopPlayback : startPlayback}
                      disabled={!audioBuffer}
                      className="w-20 h-20 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-full flex items-center justify-center shadow-2xl transform hover:scale-110 active:scale-90 transition-all disabled:opacity-30"
                    >
                       {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
                    </button>
                    <button className="p-3 opacity-40 hover:opacity-100 transition-opacity"><SkipForward size={24} /></button>
                 </div>
              </div>
           </div>

           <div className="bg-white/70 dark:bg-white/[0.03] p-10 rounded-[3rem] border border-slate-200 dark:border-white/10 shadow-sm flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-8">
                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Synthesis Script</span>
                 <Volume2 size={16} className="text-sky-500" />
              </div>
              <div className="flex-1 overflow-y-auto max-h-64 custom-scrollbar">
                 {script ? (
                   <p className="text-sm font-bold leading-relaxed text-slate-700 dark:text-slate-200 whitespace-pre-wrap italic">
                      "{script}"
                   </p>
                 ) : (
                   <div className="h-full flex flex-col items-center justify-center opacity-20 text-center">
                      <Headphones size={48} className="mb-4" />
                      <p className="text-[10px] font-black uppercase tracking-widest">Awaiting Neural Link</p>
                   </div>
                 )}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AudioBriefing;
