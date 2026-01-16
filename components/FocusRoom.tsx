
import React, { useState, useEffect } from 'react';
import { Play, Pause, RefreshCw, Brain, Plus, Minus, Volume2, Moon, Sparkles } from 'lucide-react';

const FocusRoom: React.FC = () => {
  const [duration, setDuration] = useState(25);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [sessionType, setSessionType] = useState<'focus' | 'break'>('focus');
  
  const durations = [25, 30, 40, 60];
  const totalSeconds = sessionType === 'focus' ? duration * 60 : 5 * 60;
  const progress = ((totalSeconds - timeLeft) / totalSeconds) * 100;

  useEffect(() => {
    let interval: number;
    if (isActive && timeLeft > 0) {
      interval = window.setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0) {
      if (sessionType === 'focus') {
        setSessionType('break');
        setTimeLeft(5 * 60);
      } else {
        setSessionType('focus');
        setTimeLeft(duration * 60);
      }
      setIsActive(false);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, sessionType, duration]);

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(sessionType === 'focus' ? duration * 60 : 5 * 60);
  };

  const adjustTime = (amount: number) => {
    setTimeLeft(prev => Math.max(0, prev + amount));
  };

  const changeDuration = (mins: number) => {
    if (isActive) return;
    setDuration(mins);
    if (sessionType === 'focus') setTimeLeft(mins * 60);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="max-w-4xl mx-auto min-h-full flex flex-col items-center justify-center py-4 px-4 overflow-hidden">
      
      {/* Mode Switcher Tabs */}
      <div className="flex gap-2 mb-8 bg-slate-100 dark:bg-white/5 p-1 rounded-2xl">
        {durations.map(m => (
          <button 
            key={m}
            onClick={() => changeDuration(m)}
            className={`px-4 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all ${
              duration === m 
                ? 'bg-white dark:bg-slate-700 text-[#14D9B5] shadow-sm' 
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
          >
            {m}M
          </button>
        ))}
      </div>

      {/* Main Square Timer Card - Matching the reference image layout */}
      <div className="relative w-full max-w-[400px] aspect-square bg-white dark:bg-[#0B1221] rounded-[2.5rem] md:rounded-[3.5rem] shadow-2xl dark:border dark:border-white/5 p-8 flex flex-col items-center justify-between transition-all duration-700">
        
        {/* Top Label */}
        <div className="w-full flex justify-center pt-2">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-slate-50 dark:bg-white/5 rounded-full border border-slate-100 dark:border-white/10">
            <Brain className="text-[#14D9B5]" size={14} />
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 whitespace-nowrap">
              {sessionType === 'focus' ? 'Deep Work Synthesis' : 'Recovery Phase'}
            </span>
          </div>
        </div>

        {/* Center Timer Section */}
        <div className="relative flex-1 w-full flex flex-col items-center justify-center">
          
          {/* Circular Progress Ring */}
          <div className="absolute inset-0 flex items-center justify-center p-4">
             <svg className="w-full h-full -rotate-90 drop-shadow-sm opacity-90">
                <circle
                  cx="50%"
                  cy="50%"
                  r="42%"
                  fill="transparent"
                  stroke="currentColor"
                  strokeWidth="4"
                  className="text-slate-50 dark:text-white/5"
                />
                <circle
                  cx="50%"
                  cy="50%"
                  r="42%"
                  fill="transparent"
                  stroke="#14D9B5"
                  strokeWidth="10"
                  strokeDasharray="100 100"
                  style={{ strokeDashoffset: 100 - progress }}
                  pathLength="100"
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-linear"
                />
             </svg>
          </div>

          {/* Controls inside the circle to prevent overlap */}
          <div className="z-20 flex flex-col items-center gap-2">
            <button 
              onClick={() => adjustTime(60)}
              className="p-1 text-slate-300 dark:text-slate-700 hover:text-[#14D9B5] transition-colors"
            >
              <Plus size={24} strokeWidth={3} />
            </button>

            <div className="flex items-center justify-center font-black text-[#0B1221] dark:text-white tabular-nums tracking-tighter">
              <span className="text-[72px] md:text-[88px] leading-none">
                {String(minutes).padStart(2, '0')}
              </span>
              <span className="text-[54px] md:text-[64px] leading-none px-1 -mt-2">
                ·
              </span>
              <span className="text-[72px] md:text-[88px] leading-none">
                {String(seconds).padStart(2, '0')}
              </span>
            </div>

            <button 
              onClick={() => adjustTime(-60)}
              className="p-1 text-slate-300 dark:text-slate-700 hover:text-[#14D9B5] transition-colors"
            >
              <Minus size={24} strokeWidth={3} />
            </button>
          </div>
        </div>

        {/* Bottom Corner Controls */}
        <div className="w-full flex items-center justify-between pb-2">
          <button 
            onClick={toggleTimer}
            className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-lg ${
              isActive 
                ? 'bg-indigo-600 text-white shadow-indigo-500/30' 
                : 'bg-[#14D9B5] text-white shadow-[#14D9B5]/30'
            }`}
          >
            {isActive ? <Pause size={24} fill="currentColor" /> : <Play size={24} className="ml-1" fill="currentColor" />}
          </button>

          <button 
            onClick={resetTimer}
            className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 flex items-center justify-center text-slate-300 hover:text-red-400 transition-all shadow-sm"
          >
            <RefreshCw size={24} />
          </button>
        </div>
      </div>

      {/* Decorative Badges / External Audio Controls */}
      <div className="mt-10 flex gap-6 opacity-30 hover:opacity-100 transition-all">
         <div className="flex flex-col items-center gap-2 cursor-pointer group">
            <div className="w-10 h-10 rounded-xl bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 flex items-center justify-center group-hover:border-[#14D9B5] transition-colors shadow-sm">
               <Volume2 size={18} className="text-slate-400 group-hover:text-[#14D9B5]" />
            </div>
            <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Environment</span>
         </div>
         <div className="flex flex-col items-center gap-2 cursor-pointer group">
            <div className="w-10 h-10 rounded-xl bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 flex items-center justify-center group-hover:border-[#14D9B5] transition-colors shadow-sm">
               <Sparkles size={18} className="text-slate-400 group-hover:text-[#14D9B5]" />
            </div>
            <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Zen Mode</span>
         </div>
      </div>

    </div>
  );
};

export default FocusRoom;
