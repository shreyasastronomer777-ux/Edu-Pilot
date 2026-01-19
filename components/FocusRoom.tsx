
import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RefreshCw, Brain, Plus, Minus, Volume2, VolumeX, Sparkles, Mic, MicOff, Wind, Loader2, Waves, Trees, AlertCircle, Key } from 'lucide-react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob as GenAIBlob } from '@google/genai';

// Audio Helpers as per Guidelines
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
  
  // Audio/Live Refs
  const audioContextsRef = useRef<{ input: AudioContext; output: AudioContext } | null>(null);
  const liveSessionRef = useRef<any>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef(new Set<AudioBufferSourceNode>());
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Persistent Audio Context for SFX and Synth
  const masterAudioContextRef = useRef<AudioContext | null>(null);
  const concentrationSynthRef = useRef<{ oscillator1: OscillatorNode, oscillator2: OscillatorNode, gain: GainNode } | null>(null);

  const durations = [25, 30, 40, 60];
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

  const toggleConcentrationPulse = async (on: boolean) => {
    const ctx = await ensureAudioContext();
    if (on) {
      if (concentrationSynthRef.current) return;
      
      const g = ctx.createGain();
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      
      osc1.type = 'sine';
      osc1.frequency.value = 100;
      osc2.type = 'sine';
      osc2.frequency.value = 104;
      
      g.gain.value = 0;
      osc1.connect(g);
      osc2.connect(g);
      g.connect(ctx.destination);
      
      osc1.start();
      osc2.start();
      g.gain.exponentialRampToValueAtTime(0.05, ctx.currentTime + 2);
      concentrationSynthRef.current = { oscillator1: osc1, oscillator2: osc2, gain: g };
    } else if (concentrationSynthRef.current) {
      const { oscillator1, oscillator2, gain } = concentrationSynthRef.current;
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1);
      setTimeout(() => {
        try {
          oscillator1.stop();
          oscillator2.stop();
          oscillator1.disconnect();
          oscillator2.disconnect();
          gain.disconnect();
        } catch(e) {}
      }, 1100);
      concentrationSynthRef.current = null;
    }
  };

  const playSfx = async (type: 'start' | 'end') => {
    const ctx = await ensureAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    if (type === 'start') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(330, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4);
    } else {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(660, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(330, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.6);
    }
    
    osc.start();
    osc.stop(ctx.currentTime + 0.6);
  };

  useEffect(() => {
    let interval: number;
    if (isActive && timeLeft > 0) {
      interval = window.setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && isActive) {
      playSfx('end');
      toggleConcentrationPulse(false);
      handleSessionSwitch();
    }
    const handleVisibility = () => {
      if (document.hidden && isActive) toggleTimer(false);
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
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
      if (!apiKey) throw new Error("API Key configuration missing.");

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
            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e: any) => {
            console.error('Live AI Error:', e);
            const errMsg = e?.message || e?.error?.message || "Network link failure";
            setError(errMsg);
            setIsAiConnected(false);
            if (errMsg.includes("Requested entity was not found")) {
              setError("Session authentication expired. Please re-select API Key.");
            }
          },
          onclose: () => setIsAiConnected(false)
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
          systemInstruction: 'You are a calm, minimalist focus coach. Occasionally provide brief 5-second motivational cues to keep the user productive.',
        }
      });

      liveSessionRef.current = await sessionPromise;
    } catch (e: any) {
      console.error('Failed to init focus coach:', e);
      setError(e.message || "Could not establish neural link.");
      setIsActive(false);
    }
  };

  const handleApiKeySelection = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      // Assume success and retry
      setError(null);
      toggleTimer(true);
    }
  };

  const stopLiveSession = () => {
    if (liveSessionRef.current) {
      liveSessionRef.current.close();
      liveSessionRef.current = null;
    }
    if (audioContextsRef.current) {
      audioContextsRef.current.input.close();
      audioContextsRef.current.output.close();
      audioContextsRef.current = null;
    }
    setIsAiConnected(false);
  };

  const toggleTimer = async (forcedState?: boolean) => {
    const newActive = typeof forcedState === 'boolean' ? forcedState : !isActive;
    setIsActive(newActive);
    setError(null);
    
    await ensureAudioContext();

    if (newActive) {
      await playSfx('start');
      if (sessionType === 'focus') {
        startLiveSession();
        toggleConcentrationPulse(true);
      }
      if (videoRef.current) {
        videoRef.current.volume = 0.4;
        videoRef.current.play().catch(() => {});
      }
    } else {
      stopLiveSession();
      toggleConcentrationPulse(false);
      if (videoRef.current) videoRef.current.pause();
    }
  };

  const resetTimer = () => {
    setIsActive(false);
    setError(null);
    stopLiveSession();
    toggleConcentrationPulse(false);
    setTimeLeft(sessionType === 'focus' ? duration * 60 : 5 * 60);
  };

  const changeDuration = (mins: number) => {
    if (isActive) return;
    setDuration(mins);
    if (sessionType === 'focus') setTimeLeft(mins * 60);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden transition-all duration-1000">
      
      {/* Background Layer: Waterfall Video when Active */}
      <div className={`absolute inset-0 transition-opacity duration-1000 z-0 ${isActive ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <video ref={videoRef} autoPlay muted={isMuted} loop playsInline className="w-full h-full object-cover brightness-[0.3]">
          <source src="https://assets.mixkit.co/videos/preview/mixkit-waterfall-in-a-forest-in-vertical-shot-43257-large.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/50"></div>
      </div>

      <div className="relative z-10 w-full max-w-4xl px-6 flex flex-col items-center gap-10">
        
        <div className={`transition-all duration-700 ${isActive ? 'scale-90 opacity-20 translate-y-[-40px]' : 'opacity-100'}`}>
          {!isActive && (
            <div className="flex gap-2 mb-8 bg-white/5 backdrop-blur-xl p-1.5 rounded-2xl border border-white/10 shadow-2xl">
              {durations.map(m => (
                <button 
                  key={m} onClick={() => changeDuration(m)}
                  className={`px-8 py-3 rounded-xl text-[10px] font-black tracking-[0.2em] transition-all ${duration === m ? 'bg-white text-[#4B49AC] shadow-2xl' : 'text-slate-400 hover:text-white'}`}
                >
                  {m} MINS
                </button>
              ))}
            </div>
          )}
        </div>

        {/* The Square Timer Card */}
        <div className={`relative w-full max-w-[460px] aspect-square transition-all duration-1000 ${
          isActive 
            ? 'bg-white/[0.03] backdrop-blur-[60px] border-white/20 shadow-[0_0_120px_rgba(99,102,241,0.2)] rounded-[6rem] scale-110' 
            : 'bg-white dark:bg-[#0B1221] rounded-[5rem] shadow-2xl border border-slate-200 dark:border-white/5 scale-100'
        } p-12 flex flex-col items-center justify-between group`}>
          
          <div className="absolute top-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
            <div className={`flex items-center gap-3 px-5 py-2 rounded-full border transition-all duration-700 ${
              isActive 
                ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.3)]' 
                : 'bg-slate-500/5 border-slate-500/10 text-slate-500'
            }`}>
              {isAiConnected ? <Sparkles className="animate-pulse" size={14} /> : <Brain size={14} />}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="absolute inset-x-10 top-24 z-30 p-5 bg-red-500/10 border border-red-500/20 rounded-3xl backdrop-blur-xl animate-in fade-in slide-in-from-top-4">
              <div className="flex flex-col items-center text-center gap-4">
                <AlertCircle className="text-red-500" size={24} />
                <p className="text-[10px] font-black uppercase tracking-widest text-red-500 leading-relaxed">{error}</p>
                {error.includes("API Key") && (
                  <button 
                    onClick={handleApiKeySelection}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-red-600 transition-colors"
                  >
                    <Key size={12} /> Resolve Neural Link
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="relative flex-1 w-full flex flex-col items-center justify-center">
            <div className="absolute inset-0 flex items-center justify-center p-4">
               <svg className="w-full h-full -rotate-90">
                  <circle cx="50%" cy="50%" r="42%" fill="transparent" stroke="currentColor" strokeWidth="2" className={`${isActive ? 'text-white/5' : 'text-slate-100 dark:text-white/5'}`} />
                  <circle cx="50%" cy="50%" r="42%" fill="transparent" stroke={isActive ? '#6366F1' : '#4B49AC'} strokeWidth="16" strokeDasharray="100 100" style={{ strokeDashoffset: 100 - progress }} pathLength="100" strokeLinecap="round" className="transition-all duration-1000 ease-linear" />
               </svg>
            </div>
            <div className="z-20 flex flex-col items-center">
              <div className={`flex items-center justify-center font-[900] tabular-nums tracking-[-0.05em] transition-colors duration-1000 ${isActive ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                <span className="text-[110px] leading-none">{String(minutes).padStart(2, '0')}</span>
                <span className="text-[90px] leading-none px-2 animate-pulse opacity-40">:</span>
                <span className="text-[110px] leading-none">{String(seconds).padStart(2, '0')}</span>
              </div>
            </div>
          </div>

          <div className="w-full flex items-center justify-between mt-4">
            <button 
              onClick={() => toggleTimer()}
              className={`w-24 h-24 rounded-[2.5rem] flex items-center justify-center transition-all duration-500 shadow-2xl hover:scale-105 active:scale-90 ${
                isActive ? 'bg-red-500 text-white shadow-red-500/40' : 'bg-indigo-600 text-white shadow-indigo-500/40'
              }`}
            >
              {isActive ? <Pause size={40} fill="currentColor" /> : <Play size={40} className="ml-2" fill="currentColor" />}
            </button>
            <button onClick={resetTimer} className={`w-16 h-16 rounded-[1.8rem] border transition-all shadow-sm flex items-center justify-center hover:scale-110 active:scale-90 ${isActive ? 'bg-white/10 border-white/20 text-white hover:text-red-400' : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-400 hover:text-red-500'}`}>
              <RefreshCw size={24} />
            </button>
          </div>
        </div>

        <div className={`flex gap-12 transition-all duration-1000 ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20 pointer-events-none'}`}>
           <div onClick={() => setIsMuted(!isMuted)} className="flex flex-col items-center gap-3 group cursor-pointer">
              <div className={`w-16 h-16 rounded-3xl border flex items-center justify-center transition-all shadow-xl backdrop-blur-xl ${!isMuted ? 'bg-indigo-500/20 border-indigo-500' : 'bg-white/5 border-white/10'}`}>
                 {isMuted ? <VolumeX size={26} className="text-white" /> : <Volume2 size={26} className="text-white" />}
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 group-hover:text-white transition-colors">Nature Audio</span>
           </div>
           <div className="flex flex-col items-center gap-3 group cursor-pointer">
              <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center transition-all hover:bg-white/10 shadow-xl backdrop-blur-xl">
                 <Trees size={26} className="text-white" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 group-hover:text-white transition-colors">Cascading Flow</span>
           </div>
           <div onClick={() => toggleConcentrationPulse(true)} className="flex flex-col items-center gap-3 group cursor-pointer">
              <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center transition-all hover:bg-white/10 shadow-xl backdrop-blur-xl">
                 <Waves size={26} className="text-white" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 group-hover:text-white transition-colors">Neural Pulse</span>
           </div>
        </div>

      </div>

      {/* Startup Sync Overlay */}
      {isActive && !isAiConnected && !error && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-3xl flex items-center justify-center animate-in fade-in duration-700 pointer-events-none">
           <div className="flex flex-col items-center gap-8">
              <div className="relative">
                 <Loader2 className="animate-spin text-white opacity-20" size={80} strokeWidth={1} />
                 <Brain className="absolute inset-0 m-auto text-indigo-500 animate-pulse" size={32} />
              </div>
              <div className="text-center space-y-2">
                 <h4 className="text-lg font-black text-white uppercase tracking-[0.8em]">Initializing Focus</h4>
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Syncing Neural Coach Engine</p>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default FocusRoom;
