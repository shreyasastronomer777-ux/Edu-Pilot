
import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RefreshCw, Brain, Plus, Minus, Volume2, VolumeX, Sparkles, Mic, MicOff, Wind, Loader2, Waves, Trees, AlertCircle, Key, Activity } from 'lucide-react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob as GenAIBlob } from '@google/genai';

// Guidelines Compliant Helpers
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const FocusRoom: React.FC = () => {
  const [duration, setDuration] = useState(25);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [sessionType, setSessionType] = useState<'focus' | 'break'>('focus');
  const [isAiConnected, setIsAiConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const liveSessionRef = useRef<any>(null);
  const audioContextsRef = useRef<{ input: AudioContext; output: AudioContext } | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef(new Set<AudioBufferSourceNode>());
  const videoRef = useRef<HTMLVideoElement>(null);
  const masterAudioContextRef = useRef<AudioContext | null>(null);

  const totalSeconds = sessionType === 'focus' ? duration * 60 : 5 * 60;
  const progress = ((totalSeconds - timeLeft) / totalSeconds) * 100;

  const ensureAudioContext = async () => {
    if (!masterAudioContextRef.current) {
      masterAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    if (masterAudioContextRef.current.state === 'suspended') {
      await masterAudioContextRef.current.resume();
    }
    return masterAudioContextRef.current;
  };

  useEffect(() => {
    let interval: number;
    if (isActive && timeLeft > 0) {
      interval = window.setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && isActive) {
      handleSessionSwitch();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const handleSessionSwitch = () => {
    if (sessionType === 'focus') {
      setSessionType('break');
      setTimeLeft(5 * 60);
    } else {
      setSessionType('focus');
      setTimeLeft(duration * 60);
    }
    setIsActive(false);
    stopLiveSession();
  };

  const startLiveSession = async () => {
    setError(null);
    try {
      const apiKey = process.env.API_KEY;
      if (!apiKey) throw new Error("Neural link offline: No API Key provided.");

      const ai = new GoogleGenAI({ apiKey });
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextsRef.current = { input: inputCtx, output: outputCtx };

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setIsAiConnected(true);
            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const int16 = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) int16[i] = inputData[i] * 32768;
              const pcmBlob: GenAIBlob = {
                data: encode(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };
              sessionPromise.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
              }).catch(() => {});
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioData) {
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
              const audioBuffer = await decodeAudioData(decode(audioData), outputCtx, 24000, 1);
              const source = outputCtx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(outputCtx.destination);
              source.addEventListener('ended', () => sourcesRef.current.delete(source));
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
            }
          },
          onerror: (e: any) => {
            console.error('Focus AI Error:', e);
            setError("Neural link interrupted. Running in ambient mode.");
            setIsAiConnected(false);
          },
          onclose: () => setIsAiConnected(false)
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
          systemInstruction: 'You are a calm focus coach. Provide short, motivational cues every few minutes.',
        }
      });

      liveSessionRef.current = await sessionPromise;
    } catch (e: any) {
      console.error('Focus Room Connection Error:', e);
      setError("Unable to sync neural coach. Check network connectivity.");
      setIsAiConnected(false);
    }
  };

  const stopLiveSession = () => {
    if (liveSessionRef.current) {
      try { liveSessionRef.current.close(); } catch(e){}
      liveSessionRef.current = null;
    }
    if (audioContextsRef.current) {
      try { audioContextsRef.current.input.close(); audioContextsRef.current.output.close(); } catch(e){}
      audioContextsRef.current = null;
    }
    setIsAiConnected(false);
  };

  const toggleTimer = async () => {
    const nextActive = !isActive;
    setIsActive(nextActive);
    setError(null);
    await ensureAudioContext();

    if (nextActive) {
      if (sessionType === 'focus') startLiveSession();
      if (videoRef.current) videoRef.current.play().catch(() => {});
    } else {
      stopLiveSession();
      if (videoRef.current) videoRef.current.pause();
    }
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden transition-all duration-1000">
      <div className={`absolute inset-0 transition-opacity duration-1000 z-0 ${isActive ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <video ref={videoRef} autoPlay muted loop playsInline className="w-full h-full object-cover brightness-[0.3]">
          <source src="https://assets.mixkit.co/videos/preview/mixkit-waterfall-in-a-forest-in-vertical-shot-43257-large.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/50"></div>
      </div>

      <div className="relative z-10 w-full max-w-4xl px-6 flex flex-col items-center gap-10">
        <div className={`relative w-full max-w-[460px] aspect-square transition-all duration-1000 ${
          isActive 
            ? 'bg-white/[0.03] backdrop-blur-[60px] border-white/20 shadow-[0_0_120px_rgba(99,102,241,0.2)] rounded-[6rem] scale-110' 
            : 'bg-white dark:bg-[#0B1221] rounded-[5rem] shadow-2xl border border-slate-200 dark:border-white/5 scale-100'
        } p-12 flex flex-col items-center justify-between`}>
          
          <div className="absolute top-10 flex flex-col items-center gap-2">
            <div className={`flex items-center gap-3 px-5 py-2 rounded-full border transition-all duration-700 ${
              isActive ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400' : 'bg-slate-500/5 border-slate-500/10 text-slate-500'
            }`}>
              {isAiConnected ? <Sparkles className="animate-pulse" size={14} /> : <Brain size={14} />}
              <span className="text-[9px] font-black uppercase tracking-widest">{isAiConnected ? 'Neural Link Online' : 'Ambient Mode'}</span>
            </div>
          </div>

          <div className="relative flex-1 w-full flex flex-col items-center justify-center">
            <svg className="absolute inset-0 w-full h-full -rotate-90">
               <circle cx="50%" cy="50%" r="42%" fill="transparent" stroke="currentColor" strokeWidth="2" className={`${isActive ? 'text-white/5' : 'text-slate-100 dark:text-white/5'}`} />
               <circle cx="50%" cy="50%" r="42%" fill="transparent" stroke={isActive ? '#6366F1' : '#4B49AC'} strokeWidth="16" strokeDasharray="100 100" style={{ strokeDashoffset: 100 - progress }} pathLength="100" strokeLinecap="round" className="transition-all duration-1000 ease-linear" />
            </svg>
            <div className={`z-20 flex font-[900] tabular-nums tracking-[-0.05em] transition-colors duration-1000 ${isActive ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
              <span className="text-[110px] leading-none">{String(minutes).padStart(2, '0')}</span>
              <span className="text-[90px] leading-none px-2 animate-pulse opacity-40">:</span>
              <span className="text-[110px] leading-none">{String(seconds).padStart(2, '0')}</span>
            </div>
          </div>

          <div className="w-full flex items-center justify-center gap-8 mt-4">
            <button 
              onClick={toggleTimer}
              className={`w-24 h-24 rounded-[2.5rem] flex items-center justify-center transition-all duration-500 shadow-2xl hover:scale-105 active:scale-95 ${
                isActive ? 'bg-red-500 text-white shadow-red-500/40' : 'bg-indigo-600 text-white shadow-indigo-500/40'
              }`}
            >
              {isActive ? <Pause size={40} fill="currentColor" /> : <Play size={40} className="ml-2" fill="currentColor" />}
            </button>
            <button onClick={() => { setIsActive(false); setTimeLeft(duration * 60); stopLiveSession(); }} className="w-16 h-16 rounded-[1.8rem] border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400 hover:text-red-500 transition-all">
               <RefreshCw size={24} />
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 p-5 rounded-3xl backdrop-blur-xl animate-in fade-in slide-in-from-top-4 flex items-center gap-4">
             <AlertCircle className="text-red-500" size={20} />
             <p className="text-[10px] font-black uppercase tracking-widest text-red-500">{error}</p>
          </div>
        )}
      </div>

      {isActive && !isAiConnected && !error && sessionType === 'focus' && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-3xl flex items-center justify-center animate-in fade-in duration-700">
           <div className="flex flex-col items-center gap-8">
              <Loader2 className="animate-spin text-indigo-500" size={80} strokeWidth={1} />
              <div className="text-center space-y-2">
                 <h4 className="text-lg font-black text-white uppercase tracking-[0.8em]">Initializing Link</h4>
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Optimizing Neural Buffers</p>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default FocusRoom;
