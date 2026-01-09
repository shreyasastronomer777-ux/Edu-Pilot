import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageSquare, ChevronDown, Loader2 } from 'lucide-react';
import { chatWithEduAssistant } from '../services/geminiService';

const EduAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'bot', text: string}[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Key must match App.tsx: 'sv-role'
    const role = localStorage.getItem('sv-role') as 'teacher' | 'student' | null;
    const initialMsg = role === 'teacher' 
      ? "Greetings, Professor. How may I assist in synthesizing instructional materials today with SVGPT?"
      : "Welcome back, Scholar. Are we preparing for an examination or refining study insights with SVGPT?";
    setMessages([{ role: 'bot', text: initialMsg }]);
  }, [isOpen]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
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
      const userRole = localStorage.getItem('sv-role') as 'teacher' | 'student' | null;
      const botResponse = await chatWithEduAssistant(userMsg, history, userRole);
      setMessages(prev => [...prev, { role: 'bot', text: botResponse }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'bot', text: "Neural link interrupted. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-10 right-10 z-[100]">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 group overflow-hidden"
        >
          <div className="absolute inset-0 premium-gradient opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <MessageSquare className="relative z-10" size={28} />
        </button>
      ) : (
        <div className="bg-white/90 dark:bg-black/80 backdrop-blur-3xl w-[400px] h-[600px] rounded-[2.5rem] shadow-2xl border border-slate-200/50 dark:border-white/10 flex flex-col overflow-hidden animate-in">
          <div className="p-6 border-b border-slate-100 dark:border-white/5 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-200 dark:border-white/10">
                <img src="https://iili.io/feG2UBt.md.png" alt="SVGPT" className="w-full h-full object-cover" />
              </div>
              <span className="font-black text-slate-900 dark:text-white uppercase text-sm tracking-tighter">SVGPT Assistant</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-all">
              <ChevronDown size={20} className="text-slate-400" />
            </button>
          </div>
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in`}>
                <div className={`max-w-[85%] p-4 rounded-2xl text-xs font-bold leading-relaxed ${
                  m.role === 'user' ? 'bg-slate-900 text-white rounded-tr-none' : 'bg-slate-100 dark:bg-white/5 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-200 dark:border-white/5'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {isLoading && <Loader2 className="animate-spin text-indigo-500 mx-auto" size={20} />}
          </div>
          <div className="p-6 pt-0">
            <div className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10">
              <input
                type="text" value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask SVGPT..."
                className="flex-1 bg-transparent px-3 text-xs font-bold outline-none"
              />
              <button onClick={handleSend} disabled={!input.trim() || isLoading} className="w-10 h-10 premium-gradient text-white rounded-xl flex items-center justify-center disabled:opacity-50">
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EduAssistant;