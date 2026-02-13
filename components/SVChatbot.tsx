
import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Trash2, ArrowLeft, Loader2, Zap } from 'lucide-react';
import { chatWithEduAssistant } from '../services/geminiService';
import { auth } from '../firebaseConfig';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

interface SVChatbotProps {
  onBack?: () => void;
  userRole: 'teacher' | 'student';
}

const SVChatbot: React.FC<SVChatbotProps> = ({ onBack, userRole }) => {
  const userId = auth.currentUser?.uid || 'guest';
  const storageKey = `svgpt_chat_${userId}_${userRole}`;

  const [messages, setMessages] = useState<{role: 'user' | 'bot', text: string}[]>(() => {
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : [];
  });
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages.length === 0) {
      const initialMsg = userRole === 'teacher' 
        ? "Hello! I am your AI Teaching Assistant. How can I help you with your classes today?"
        : "Hi! I'm your AI Tutor. What would you like to learn about today?";
      setMessages([{ role: 'bot', text: initialMsg }]);
    }
  }, [userRole, messages.length]);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(storageKey, JSON.stringify(messages));
    }
  }, [messages, storageKey]);

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
    const updatedMessages = [...messages, { role: 'user' as const, text: userMsg }];
    setMessages(updatedMessages);
    setIsLoading(true);
    try {
      const historyForAI = messages.map(m => ({
        role: m.role === 'bot' ? 'model' : 'user',
        parts: [{ text: m.text }]
      }));
      const botResponse = await chatWithEduAssistant(userMsg, historyForAI, userRole);
      setMessages(prev => [...prev, { role: 'bot', text: botResponse }]);
    } catch (error: any) {
      setMessages(prev => [...prev, { role: 'bot', text: "Sorry, I lost the connection. Try again!" }]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearHistory = () => {
    if (confirm("Clear all messages?")) {
      localStorage.removeItem(storageKey);
      setMessages([]);
    }
  };

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-6rem)] flex flex-col gap-6 animate-in fade-in duration-700 relative z-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-6">
        <div className="flex items-center gap-5">
          <button onClick={onBack} className="p-3.5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-white/10 hover:border-indigo-500 transition-all shadow-sm">
            <ArrowLeft size={20} className="text-slate-500" />
          </button>
          <div className="flex flex-col">
            <h2 className="text-3xl font-[900] tracking-tight text-slate-900 dark:text-white uppercase flex items-center gap-3">
              AI <span className="text-indigo-600 dark:text-indigo-400">BRAIN</span>
            </h2>
            <div className="flex items-center gap-2">
               <div className="w-1.5 h-1.5 rounded-full animate-pulse bg-indigo-500"></div>
               <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                 Private Secure Chat
               </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
           <button onClick={clearHistory} className="px-6 py-3 bg-slate-50 dark:bg-white/5 text-slate-400 hover:text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-100 dark:border-white/10 transition-all flex items-center gap-2">
             <Trash2 size={14} /> Clear Chat
           </button>
           <div className="px-6 py-3 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl border border-indigo-500/20 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-sm">
             <Zap size={14} className="animate-pulse" /> Verified Node
           </div>
        </div>
      </div>

      <div className="flex-1 bg-white dark:bg-[#0B1221] backdrop-blur-[100px] rounded-[3.5rem] border border-slate-200 dark:border-white/5 shadow-2xl flex flex-col overflow-hidden">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-10 md:p-16 space-y-12 custom-scrollbar">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-4 duration-700 ease-out`}>
              <div className={`flex gap-6 max-w-[90%] md:max-w-[80%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-12 h-12 rounded-[1.25rem] flex items-center justify-center flex-shrink-0 border shadow-md ${
                  m.role === 'user' ? 'bg-slate-900 text-white' : 'bg-white dark:bg-slate-800 text-indigo-600'
                }`}>
                  {m.role === 'user' ? <User size={22} /> : <Bot size={22} />}
                </div>
                <div className={`p-8 rounded-[2.8rem] text-sm md:text-base font-medium leading-[1.7] shadow-sm ${
                  m.role === 'user' ? 'bg-slate-900 text-white rounded-tr-none' : 'bg-slate-50 dark:bg-black/40 text-slate-800 dark:text-slate-100 border border-slate-100 rounded-tl-none prose prose-slate dark:prose-invert max-w-none'
                }`}>
                  {m.role === 'bot' ? (
                    <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                      {m.text}
                    </ReactMarkdown>
                  ) : m.text}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex gap-6">
                <div className="w-12 h-12 rounded-[1.25rem] bg-white dark:bg-slate-800 text-indigo-500 flex items-center justify-center">
                  <Loader2 size={22} className="animate-spin" />
                </div>
                <div className="bg-slate-50 dark:bg-black/40 p-8 rounded-[2.8rem] rounded-tl-none border border-slate-100 flex gap-2.5 items-center">
                  <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce"></div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-10 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-black/20">
          <div className="max-w-4xl mx-auto relative group">
            <input
              type="text" value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask a question..."
              className="w-full pl-10 pr-24 py-7 bg-white dark:bg-[#050505] border border-slate-200 dark:border-white/10 rounded-[3rem] shadow-2xl outline-none focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all font-bold text-sm md:text-lg"
            />
            <button 
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-16 h-16 bg-indigo-600 text-white rounded-[1.8rem] flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-30"
            >
              <Send size={28} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SVChatbot;
