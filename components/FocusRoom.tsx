import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RefreshCw, Brain, Plus, Minus, Volume2, VolumeX, Sparkles, Mic, MicOff, Wind, Loader2, Waves, Trees, AlertCircle, Key, Activity, X, MessageCircle, CloudRain, Moon, Music, Bell } from 'lucide-react';
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

const ambientTracks = [
  { id: 'rain', name: 'Rain', icon: CloudRain, url: 'https://www.soundjay.com/nature/rain-07.mp3' },
  { id: 'forest', name: 'Forest', icon: Trees, url: 'https://www.soundjay.com/nature/forest-1.mp3' },
  { id: 'waves', name: 'Waves', icon: Waves, url: 'https://www.soundjay.com/nature/ocean-wave-1.mp3' },
  { id: 'space', name: 'Deep Space', icon: Moon, url: 'https://www.soundjay.com/mechanical/fan-1.mp3' }
];

const FocusRoom: React.FC = () => {
  const [duration, setDuration] = useState(25);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [sessionType, setSessionType] = useState<'focus' | 'break'>('focus');
  const [isAiConnected, setIsAiConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFinishedOverlay, setShowFinishedOverlay] = useState(false);
  
  // Ambient Sound State
  const [activeAmbient, setActiveAmbient] = useState<string | null>(null);
  const [ambientVolume, setAmbientVolume] = useState(0.5);
  const ambientAudioRef = useRef<HTMLAudioElement | null>(null);

  // Polite Assistant Mockup Integration
  const [showAssistantBubble, setShowAssistantBubble] = useState(false);
  const [assistantMessage, setAssistantMessage] = useState("");

  const liveSessionRef = useRef<any>(null);
  const audioContextsRef = useRef<{ input: AudioContext; output: AudioContext } | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef(new Set<AudioBufferSourceNode>());
  const videoRef = useRef<HTMLVideoElement>(null);
  const masterAudioContextRef = useRef<AudioContext | null>(null);

  const totalSeconds = sessionType === 'focus' ? duration * 60 : 5 * 60;
  const progress = ((totalSeconds - timeLeft) / totalSeconds) * 100;

  // Handle Ambient Audio
  useEffect(() => {
    if (activeAmbient) {
      const track = ambientTracks.find(t => t.id === activeAmbient);
      if (track) {
        if (!ambientAudioRef.current) {
          ambientAudioRef.current = new Audio(track.url);
          ambientAudioRef.current.loop = true;
        } else {
          ambientAudioRef.current.src = track.url;
        }
        ambientAudioRef.current.volume = ambientVolume;
        ambientAudioRef.current.play().catch(() => {});
      }
    } else {
      if (ambientAudioRef.current) {
        ambientAudioRef.current.pause();
      }
    }
  }, [activeAmbient]);

  useEffect(() => {
    if (ambientAudioRef.current) {
      ambientAudioRef.current.volume = ambientVolume;
    }
  }, [ambientVolume]);

  useEffect(() => {
    let interval: number;
    if (isActive && timeLeft > 0) {
      interval = window.setInterval(() => {
        setTimeLeft(prev => {
          const next = prev - 1;
          // Trigger polite bubble every few minutes
          if (next > 0 && next % 300 === 0 && !showAssistantBubble) {
             triggerPoliteNudge();
          }
          return next;
        });
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      handleSessionEnd();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, showAssistantBubble]);

  const triggerPoliteNudge = () => {
    const nudges = [
      "Pardon the interruption, but I noticed you've been focused for a while. Would you like me to clarify any core concepts from your session?",
      "Deep work detected. Remember to maintain proper posture and hydrate as you deconstruct these theories.",
      "Shall I prepare a 2-minute summary of your study objectives once this cycle completes?",
      "Excellent neural focus. I am here if you require an architectural resolution to any complex formula."
    ];
    setAssistantMessage(nudges[Math.floor(Math.random() * nudges.length)]);
    setShowAssistantBubble(true);
  };

  const ensureAudioContext = async () => {
    if (!masterAudioContextRef.current) {
      masterAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    if (masterAudioContextRef.current.state === 'suspended') {
      await masterAudioContextRef.current.resume();
    }
    return masterAudioContextRef.current;
  };

  const handleSessionEnd = () => {
    setIsActive(false);
    stopLiveSession();
    setShowFinishedOverlay(true);
    if (videoRef.current) videoRef.current.pause();
  };

  const handleSessionSwitch = () => {
    if (sessionType === 'focus') {
      setSessionType('break');
      setTimeLeft(5 * 60);
    } else {
      setSessionType('focus');
      setTimeLeft(duration * 60);
    }
    setShowFinishedOverlay(false);
    setIsActive(false);
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

  const adjustDuration = (amount: number) => {
    if (isActive) return;
    const newDuration = Math.max(5, Math.min(120, duration + amount));
    setDuration(newDuration);
    setTimeLeft(newDuration * 60);
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

      {/* Polite Assistant Bubble Overlay */}
      {showAssistantBubble && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-[100] w-full max-w-md animate-in slide-in-from-top-8 duration-700 px-6">
           <div className="bg-indigo-600/20 backdrop-blur-[40px] border border-indigo-500/30 p-8 rounded-[2.5rem] rounded-tl-none shadow-3xl flex flex-col gap-6 assistant-bubble relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4">
                 <button onClick={() => setShowAssistantBubble(false)} className="text-indigo-300/50 hover:text-indigo-300 transition-colors">
                    <X size={18} />
                 </button>
              </div>
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 bg-indigo-500 rounded-xl flex items-center justify-center text-white shadow-lg">
                    <Brain size={16} />
                 </div>
                 <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-300">Neural Support Active</span>
              </div>
              <p className="text-indigo-50 text-sm leading-relaxed font-medium italic">
                "{assistantMessage}"
              </p>
              <div className="flex gap-3">
                 <button onClick={() => setShowAssistantBubble(false)} className="flex-1 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-[9px] font-black uppercase tracking-widest text-indigo-100 transition-all">Understood</button>
                 <button className="flex-1 py-3 bg-indigo-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-xl shadow-indigo-500/20 transition-all hover:scale-105 active:scale-95">Clarify Concepts</button>
              </div>
           </div>
        </div>
      )}

      {/* Session Finished Overlay */}
      {showFinishedOverlay && (
        <div className="fixed inset-0 z-[110] bg-indigo-600/20 backdrop-blur-[100px] flex items-center justify-center p-6 animate-in zoom-in-95 duration-700">
           <div className="bg-white dark:bg-[#0B1221] p-16 rounded-[5rem] shadow-4xl border border-white/10 text-center max-w-lg w-full flex flex-col items-center">
              <div className="w-24 h-24 bg-indigo-500/10 rounded-[2.5rem] flex items-center justify-center text-indigo-500 mb-10 animate-bounce">
                 <Bell size={48} />
              </div>
              <h2 className="text-4xl font-[900] tracking-tighter uppercase text-slate-900 dark:text-white mb-4">Focus Terminated</h2>
              <p className="text-slate-500 dark:text-slate-400 font-medium text-lg mb-12">
                Your neural study cycle is complete. Take a breather or synthesize another module.
              </p>
              <div className="flex flex-col w-full gap-4">
                 <button 
                   onClick={handleSessionSwitch}
                   className="w-full py-5 premium-gradient text-white rounded-3xl font-black uppercase tracking-widest text-xs shadow-2xl shadow-indigo-500/20 active:scale-95 transition-all"
                 >
                    Initialize {sessionType === 'focus' ? 'Break Cycle' : 'Focus Cycle'}
                 </button>
                 <button 
                   onClick={() => { setShowFinishedOverlay(false); setTimeLeft(duration * 60); }}
                   className="w-full py-5 bg-slate-100 dark:bg-white/5 text-slate-500 rounded-3xl font-black uppercase tracking-widest text-xs active:scale-95 transition-all"
                 >
                    Reset Grid
                 </button>
              </div>
           </div>
        </div>
      )}

      <div className="relative z-10 w-full max-w-4xl px-6 flex flex-col items-center gap-10">
        {/* Main Focus Card */}
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
              <span className="text-[9px] font-black uppercase tracking-widest">{isAiConnected ? 'Neural Link Online' : 'Deep Work Mode'}</span>
            </div>
          </div>

          <div className="relative flex-1 w-full flex flex-col items-center justify-center">
            <svg className="absolute inset-0 w-full h-full -rotate-90">
               <circle cx="50%" cy="50%" r="42%" fill="transparent" stroke="currentColor" strokeWidth="2" className={`${isActive ? 'text-white/5' : 'text-slate-100 dark:text-white/5'}`} />
               <circle cx="50%" cy="50%" r="42%" fill="transparent" stroke={isActive ? '#6366F1' : '#4B49AC'} strokeWidth={isActive ? '16' : '10'} strokeDasharray="100 100" style={{ strokeDashoffset: 100 - progress }} pathLength="100" strokeLinecap="round" className="transition-all duration-1000 ease-linear" />
            </svg>
            
            {/* Adjustment Controls */}
            {!isActive && (
              <div className="absolute inset-x-0 top-[20%] flex justify-center gap-12 text-slate-300">
                 <button onClick={() => adjustDuration(-5)} className="p-3 hover:text-indigo-500 transition-colors"><Minus size={24} /></button>
                 <button onClick={() => adjustDuration(5)} className="p-3 hover:text-indigo-500 transition-colors"><Plus size={24} /></button>
              </div>
            )}

            <div className={`z-20 flex font-[900] tabular-nums tracking-[-0.05em] transition-colors duration-1000 ${isActive ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
              <span className="text-[110px] leading-none">{String(minutes).padStart(2, '0')}</span>
              <span className="text-[90px] leading-none px-2 animate-pulse opacity-40">:</span>
              <span className="text-[110px] leading-none">{String(seconds).padStart(2, '0')}</span>
            </div>

            {!isActive && (
              <div className="absolute inset-x-0 bottom-[20%] flex justify-center">
                 <span className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400">Adjust Duration</span>
              </div>
            )}
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

        {/* Ambient Soundscapes Cluster */}
        <div className={`w-full max-w-lg transition-all duration-1000 delay-300 ${isActive ? 'opacity-100 translate-y-0' : 'opacity-40 translate-y-4'}`}>
           <div className="bg-white/5 backdrop-blur-2xl rounded-[3rem] border border-white/10 p-6 md:p-8 flex flex-col items-center gap-8 shadow-2xl">
              <div className="flex items-center gap-3">
                 <Music className="text-indigo-400" size={16} />
                 <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Neural Ambient Engine</span>
              </div>
              
              <div className="flex flex-wrap justify-center gap-4">
                 {ambientTracks.map((track) => (
                    <button
                      key={track.id}
                      onClick={() => setActiveAmbient(activeAmbient === track.id ? null : track.id)}
                      className={`flex flex-col items-center gap-3 p-5 rounded-[2rem] border transition-all duration-500 w-24 md:w-28 ${
                        activeAmbient === track.id 
                          ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-400 shadow-[0_0_40px_rgba(99,102,241,0.2)]' 
                          : 'bg-white/5 border-white/5 text-slate-500 hover:bg-white/10 hover:text-slate-300'
                      }`}
                    >
                       <track.icon size={24} className={activeAmbient === track.id ? 'animate-pulse' : ''} />
                       <span className="text-[9px] font-black uppercase tracking-widest">{track.name}</span>
                    </button>
                 ))}
              </div>

              <div className="w-full flex items-center gap-6 px-6">
                 <VolumeX size={16} className="text-slate-500" />
                 <input 
                   type="range" 
                   min="0" max="1" step="0.01" 
                   value={ambientVolume}
                   onChange={(e) => setAmbientVolume(parseFloat(e.target.value))}
                   className="flex-1 accent-indigo-500 h-1 bg-white/10 rounded-full appearance-none cursor-pointer"
                 />
                 <Volume2 size={16} className="text-indigo-400" />
              </div>
           </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 p-5 rounded-3xl backdrop-blur-xl animate-in fade-in slide-in-from-top-4 flex items-center gap-4">
             <AlertCircle className="text-red-500" size={20} />
             <p className="text-[10px] font-black uppercase tracking-widest text-red-500">{error}</p>
          </div>
        )}
      </div>

      <style>{`
        .assistant-bubble { animation: float 4s ease-in-out infinite; }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        
        input[type='range']::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 12px;
          height: 12px;
          background: #6366F1;
          cursor: pointer;
          border-radius: 50%;
          box-shadow: 0 0 10px rgba(99, 102, 241, 0.5);
        }
      `}</style>

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