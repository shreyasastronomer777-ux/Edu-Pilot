
import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, User, Bot, Trash2, ArrowLeft, Loader2, Zap, BrainCircuit, Globe, MessageSquare, ChevronDown } from 'lucide-react';
import { chatWithEduAssistant } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

interface SVChatbotProps {
  onBack?: () => void;
  userRole: 'teacher' | 'student';
}

const SVChatbot: React.FC<SVChatbotProps> = ({ onBack, userRole }) => {
  const [messages, setMessages] = useState<{role: 'user' | 'bot', text: string}[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initialMsg = userRole === 'teacher' 
      ? "Neural Lab initialized. I am your specialized pedagogical co-pilot engineered by Shreyas & Vaibhav. How shall we refine your curriculum today?"
      : "SVGPT Neural Core active. I am here to assist in concept deconstruction and mastery tracking. What academic objective shall we initialize?";
    setMessages([{ role: 'bot', text: initialMsg }]);
  }, [userRole]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role === 'bot' ? 'model' : 'user',
        parts: [{ text: m.text }]
      }));
      
      const botResponse = await chatWithEduAssistant(userMsg, history, userRole);
      setMessages(prev => [...prev, { role: 'bot', text: botResponse }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'bot', text: "Neural link interrupted. Please attempt re-transmission." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-6rem)] flex flex-col gap-8 animate-in fade-in duration-700">
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-6">
        <div className="flex items-center gap-6">
          <button 
            onClick={onBack}
            className="p-4 bg-white/5 rounded-2xl border border-white/10 hover:border-indigo-500/50 transition-all group hover:scale-105 active:scale-95"
          >
            <ArrowLeft size={22} className="text-slate-400 group-hover:text-indigo-400" />
          </button>
          <div className="flex flex-col">
            <h2 className="text-4xl font-[900] tracking-tighter uppercase flex items-center gap-4">
              SVGPT <span className="text-indigo-400">NEURAL CORE</span>
            </h2>
            <div className="flex items-center gap-2 mt-1">
               <div className={`w-2 h-2 rounded-full animate-pulse ${userRole === 'teacher' ? 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.8)]' : 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]'}`}></div>
               <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
                 Devs: Shreyas G. & Vaibhav C.
               </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
           <button 
             onClick={() => setMessages([messages[0]])}
             className="px-6 py-3 bg-white/5 text-slate-500 hover:text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/10 transition-all flex items-center gap-3"
           >
             <Trash2 size={16} /> Reset Core
           </button>
           <div className="px-6 py-3 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20 text-[10px] font-black uppercase tracking-widest flex items-center gap-3">
             <Zap size={16} className="animate-pulse fill-current" /> Sync: Stable
           </div>
        </div>
      </div>

      {/* Main Experience Panel */}
      <div className="flex-1 bg-white/[0.02] backdrop-blur-[100px] rounded-[4rem] border border-white/5 shadow-2xl flex flex-col overflow-hidden">
        
        {/* Workspace Area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-12 md:p-20 space-y-16 custom-scrollbar">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-6 duration-700 ease-out`}>
              <div className={`flex gap-8 max-w-[90%] md:max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-14 h-14 rounded-[1.5rem] flex items-center justify-center flex-shrink-0 border shadow-2xl transition-all duration-500 ${
                  m.role === 'user' 
                    ? 'bg-white text-black border-white' 
                    : 'bg-indigo-600 text-white border-indigo-500 shadow-indigo-500/20'
                }`}>
                  {m.role === 'user' ? <User size={28} /> : <Bot size={28} />}
                </div>
                <div className={`p-10 rounded-[3rem] text-sm md:text-base font-medium leading-[1.8] shadow-2xl transition-all duration-500 ${
                  m.role === 'user' 
                    ? 'bg-white text-black rounded-tr-none' 
                    : 'bg-white/5 text-slate-100 border border-white/10 rounded-tl-none prose prose-invert max-w-none'
                }`}>
                  {m.role === 'bot' ? <ReactMarkdown>{m.text}</ReactMarkdown> : m.text}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start animate-in fade-in duration-500">
              <div className="flex gap-8">
                <div className="w-14 h-14 rounded-[1.5rem] bg-indigo-600 text-white border border-indigo-500 flex items-center justify-center shadow-2xl">
                  <Loader2 size={28} className="animate-spin" />
                </div>
                <div className="bg-white/5 p-10 rounded-[3rem] rounded-tl-none border border-white/10 flex gap-3 items-center">
                  <div className="w-2.5 h-2.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-2.5 h-2.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-2.5 h-2.5 bg-indigo-400 rounded-full animate-bounce"></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Console Input */}
        <div className="p-12 border-t border-white/5 bg-black/40 backdrop-blur-3xl">
          <div className="max-w-4xl mx-auto relative group">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={userRole === 'teacher' ? "Synthesize instructional blueprint, evaluate pedagogy..." : "Deconstruct theory, initialize study session, clarify complex logic..."}
              className="w-full pl-12 pr-28 py-8 bg-white/5 border border-white/10 rounded-[3rem] shadow-2xl outline-none focus:ring-8 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all font-bold text-sm md:text-lg text-white placeholder:text-slate-600"
            />
            <button 
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-16 h-16 bg-white text-black rounded-[2rem] flex items-center justify-center shadow-2xl hover:bg-indigo-500 hover:text-white hover:scale-110 active:scale-95 transition-all disabled:opacity-20 disabled:hover:scale-100"
            >
              <Send size={28} />
            </button>
          </div>
          <div className="mt-10 flex items-center justify-center gap-12 opacity-20">
             <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.4em]">
               <BrainCircuit size={18} /> Logic Gates Active
             </div>
             <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.4em]">
               <Globe size={18} /> Global Sync
             </div>
             <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.4em]">
               <MessageSquare size={18} /> Secure Tunnel
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SVChatbot;
