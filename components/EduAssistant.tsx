import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageSquare, ChevronDown, Trash2, Bot, Sparkles } from 'lucide-react';
import { chatWithEduAssistant } from '../services/geminiService';
import { Role } from '../types';
import ReactMarkdown from 'react-markdown';

const EduAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'bot', text: string}[]>(() => {
    const saved = localStorage.getItem('svgpt_assistant_history');
    return saved ? JSON.parse(saved) : [];
  });
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages.length === 0 && isOpen) {
      const role = localStorage.getItem('sv-role') as Role | null;
      let initialMsg = "Welcome back, Scholar. Are we preparing for an examination or refining study insights with SVGPT? I'm here to simplify complex topics for you.";
      
      if (role === 'teacher') {
        initialMsg = "Greetings, Professor. How may I assist in synthesizing high-rigor instructional materials or providing lesson planning tips today? I can also suggest creative assessment strategies.";
      } else if (role === 'parent') {
        initialMsg = "Guardian Interface Active. How may I assist in analyzing student academic trajectories and performance today?";
      } else if (role === 'admin') {
        initialMsg = "Institutional Oversight Active. How can I assist in school governance and academic analytics today?";
      }
      setMessages([{ role: 'bot', text: initialMsg }]);
    }
  }, [isOpen, messages.length]);

  // Persist messages
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('svgpt_assistant_history', JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isLoading, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg = input.trim();
    setInput('');
    const newMessages = [...messages, { role: 'user', text: userMsg }];
    setMessages(newMessages as any);
    setIsLoading(true);

    try {
      const history = newMessages.map(m => ({
        role: m.role === 'bot' ? 'model' : 'user',
        parts: [{ text: m.text }]
      }));
      const userRole = localStorage.getItem('sv-role') as Role | null;
      const botResponse = await chatWithEduAssistant(userMsg, history, userRole);
      setMessages(prev => [...prev, { role: 'bot', text: botResponse }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'bot', text: "Neural link interrupted. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const resetAssistant = () => {
    if (confirm("Reset assistant session history?")) {
      setMessages([]);
      localStorage.removeItem('svgpt_assistant_history');
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
        <div className="bg-white/90 dark:bg-[#0B1221]/95 backdrop-blur-3xl w-[400px] h-[600px] rounded-[2.5rem] shadow-2xl border border-slate-200/50 dark:border-white/10 flex flex-col overflow-hidden animate-in">
          <div className="p-6 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-slate-50/50 dark:bg-black/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 p-1.5 bg-white dark:bg-slate-800">
                <img src="https://iili.io/feG2UBt.md.png" alt="SVGPT" className="w-full h-full object-cover" />
              </div>
              <span className="font-black text-slate-900 dark:text-white uppercase text-sm tracking-tighter">SVGPT Assistant</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={resetAssistant} className="p-2 hover:bg-red-500/10 text-slate-400 hover:text-red-500 rounded-xl transition-all" title="Reset History">
                <Trash2 size={16} />
              </button>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-all">
                <ChevronDown size={20} className="text-slate-400" />
              </button>
            </div>
          </div>
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in`}>
                <div className={`max-w-[85%] p-4 rounded-2xl text-xs font-bold leading-relaxed ${
                  m.role === 'user' ? 'bg-slate-900 text-white rounded-tr-none' : 'bg-slate-100 dark:bg-white/5 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-200 dark:border-white/5 shadow-sm'
                }`}>
                  {m.role === 'bot' ? (
                    <div className="prose prose-xs dark:prose-invert max-w-none">
                      <ReactMarkdown>{m.text}</ReactMarkdown>
                    </div>
                  ) : m.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start animate-in fade-in">
                <div className="bg-slate-100 dark:bg-white/5 p-4 rounded-2xl rounded-tl-none border border-slate-200 dark:border-white/5 flex gap-2.5 items-center">
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"></div>
                </div>
              </div>
            )}
          </div>
          <div className="p-6 pt-0 bg-white/50 dark:bg-black/20">
            <div className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10">
              <input
                type="text" value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Message assistant..."
                className="flex-1 bg-transparent px-3 text-xs font-bold outline-none dark:text-white"
              />
              <button onClick={handleSend} disabled={!input.trim() || isLoading} className="w-10 h-10 premium-gradient text-white rounded-xl flex items-center justify-center disabled:opacity-50 transition-all hover:scale-105 active:scale-95">
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
