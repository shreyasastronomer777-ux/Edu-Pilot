
import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, Loader2, Sparkles, MessageSquare, ChevronDown } from 'lucide-react';
import { chatWithEduAssistant } from '../services/geminiService';

const EduAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [userRole, setUserRole] = useState<'teacher' | 'student' | null>(null);
  const [messages, setMessages] = useState<{role: 'user' | 'bot', text: string}[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const role = localStorage.getItem('edupilot_role') as 'teacher' | 'student' | null;
    setUserRole(role);

    const initialMsg = role === 'teacher' 
      ? "Greetings, Professor. How may I assist in synthesizing your instructional materials today?"
      : "Welcome back, Scholar. Are we preparing for an examination or refining study insights?";
    
    setMessages([{ role: 'bot', text: initialMsg }]);
  }, [isOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

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
      setMessages(prev => [...prev, { role: 'bot', text: "Apologies, the neural link is momentarily unstable. Please re-initiate." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-10 right-10 z-[100]">
      {/* Premium Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-20 h-20 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[2.5rem] shadow-[0_20px_50px_rgba(99,102,241,0.2)] flex items-center justify-center transition-all duration-700 hover:scale-110 hover:-translate-y-2 group relative overflow-hidden"
        >
          <div className="absolute inset-0 premium-gradient opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
          <MessageSquare className="relative z-10 transition-transform duration-700 group-hover:rotate-12" size={32} />
          <div className="absolute -inset-2 bg-white/20 blur-xl opacity-0 group-hover:opacity-40 animate-pulse-slow"></div>
        </button>
      )}

      {/* Luxury Chat Console */}
      {isOpen && (
        <div className="bg-white/80 dark:bg-black/80 backdrop-blur-[60px] w-[450px] h-[700px] rounded-[3.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.2)] border border-slate-200/50 dark:border-white/10 flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-700">
          {/* Elegant Header */}
          <div className="p-8 pb-4 flex justify-between items-center z-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 premium-gradient rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Sparkles className="text-white" size={24} />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">EduPilot Assistant</span>
                <span className="text-[10px] text-indigo-500 flex items-center gap-1.5 uppercase tracking-widest font-black mt-1">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Neural Engine Active
                </span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-slate-100 dark:hover:bg-white/5 p-3 rounded-2xl transition-all hover:scale-110">
              <ChevronDown className="text-slate-400" size={24} />
            </button>
          </div>

          {/* Messages Console */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-8 py-4 space-y-6">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-700 delay-${i % 5}`}>
                <div className={`max-w-[90%] p-6 rounded-[2.5rem] text-sm leading-relaxed font-medium transition-all ${
                  m.role === 'user' 
                    ? 'bg-slate-900 text-white rounded-tr-none shadow-xl' 
                    : 'bg-white/50 dark:bg-white/5 text-slate-800 dark:text-slate-200 border border-slate-200/50 dark:border-white/10 rounded-tl-none'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white/50 dark:bg-white/5 p-6 rounded-[2.5rem] rounded-tl-none border border-slate-200/50 dark:border-white/10">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Luxury Input Console */}
          <div className="p-8 pt-4">
            <div className="flex items-center gap-3 p-3 bg-slate-100 dark:bg-white/5 rounded-[2.5rem] border border-slate-200/50 dark:border-white/10 focus-within:ring-4 focus-within:ring-indigo-500/10 focus-within:bg-white dark:focus-within:bg-black/40 transition-all duration-700">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Direct the Neural Engine..."
                className="flex-1 bg-transparent text-slate-900 dark:text-white px-5 py-3 text-sm outline-none font-bold"
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="w-12 h-12 premium-gradient text-white rounded-[1.5rem] hover:scale-105 disabled:opacity-50 transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center active:scale-95"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EduAssistant;
