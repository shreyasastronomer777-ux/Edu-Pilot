import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageSquare, ChevronDown, Trash2, Bot, Sparkles, X, ChevronUp, Zap, BrainCircuit, Lightbulb } from 'lucide-react';
import { chatWithEduAssistant } from '../services/geminiService';
import { auth } from '../firebaseConfig';
import { Role } from '../types';
import ReactMarkdown from 'react-markdown';

const EduAssistant: React.FC = () => {
  const userId = auth.currentUser?.uid || 'guest';
  const storageKey = `svgpt_assistant_${userId}`;

  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'bot', text: string}[]>(() => {
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : [];
  });
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const suggestions = [
    "Summarize this topic",
    "Create a quiz for me",
    "Explain like I'm 5",
    "Key takeaways?"
  ];

  // Initialize greeting if session is new
  useEffect(() => {
    if (messages.length === 0 && isExpanded) {
      const role = localStorage.getItem('sv-role') as Role | null;
      let initialMsg = "I'm ready to help. What are we working on?";
      
      if (role === 'teacher') {
        initialMsg = "Ready to assist with lesson planning or grading, Professor.";
      }
      setMessages([{ role: 'bot', text: initialMsg }]);
    }
  }, [isExpanded, messages.length]);

  // Persist messages scoped to current user
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(storageKey, JSON.stringify(messages));
    }
  }, [messages, storageKey]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isLoading, isExpanded]);

  const handleSend = async (textOverride?: string) => {
    const textToSend = textOverride || input.trim();
    if (!textToSend || isLoading) return;
    
    setInput('');
    if (!isExpanded) setIsExpanded(true);
    
    // Prepare history context
    const historyForAI = messages.map(m => ({
      role: m.role === 'bot' ? 'model' : 'user',
      parts: [{ text: m.text }]
    }));

    setMessages(prev => [...prev, { role: 'user', text: textToSend }]);
    setIsLoading(true);

    try {
      const userRole = localStorage.getItem('sv-role') as Role | null;
      const botResponse = await chatWithEduAssistant(textToSend, historyForAI, userRole);
      setMessages(prev => [...prev, { role: 'bot', text: botResponse }]);
    } catch (error: any) {
      console.error("Assistant Error:", error);
      setMessages(prev => [...prev, { role: 'bot', text: `Connection restricted: ${error.message || "Attempt re-sync."}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  const resetAssistant = () => {
    setMessages([]);
    localStorage.removeItem(storageKey);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-4 font-sans">
      
      {/* Expanded Chat Window */}
      {isExpanded && (
        <div className="w-[calc(100vw-3rem)] md:w-[400px] h-[500px] md:h-[600px] bg-white dark:bg-[#0B1221] rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-white/10 flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300 origin-bottom-right">
          
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-slate-50/80 dark:bg-white/5 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg">
                <BrainCircuit size={16} />
              </div>
              <div>
                <h3 className="font-black text-slate-900 dark:text-white text-sm uppercase tracking-tight">EduRufus AI</h3>
                <span className="text-[9px] font-bold text-indigo-500 uppercase tracking-widest flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> Online
                </span>
              </div>
            </div>
            <div className="flex gap-1">
              <button onClick={resetAssistant} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all" title="Clear Chat">
                <Trash2 size={16} />
              </button>
              <button onClick={() => setIsExpanded(false)} className="p-2 text-slate-400 hover:text-indigo-500 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-all">
                <ChevronDown size={18} />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-hidden relative">
            <div ref={scrollRef} className="absolute inset-0 overflow-y-auto p-5 space-y-5 custom-scrollbar">
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-40 p-4">
                  <Sparkles size={48} className="text-indigo-400 mb-4" />
                  <p className="text-xs font-black uppercase tracking-widest">Awaiting Neural Input</p>
                </div>
              )}
              
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}>
                  <div className={`max-w-[85%] p-4 rounded-2xl text-xs md:text-sm font-medium leading-relaxed shadow-sm ${
                    m.role === 'user' 
                      ? 'bg-indigo-600 text-white rounded-tr-sm' 
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-white/5 rounded-tl-sm'
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
                <div className="flex justify-start">
                  <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-white/5 p-4 rounded-2xl rounded-tl-sm flex gap-2 items-center shadow-sm">
                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"></div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Suggestions */}
          <div className="px-5 pt-3 pb-2 bg-white dark:bg-[#0B1221] border-t border-slate-100 dark:border-white/5">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
              {suggestions.map((s, i) => (
                <button 
                  key={i} 
                  onClick={() => handleSend(s)}
                  className="whitespace-nowrap px-4 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-full text-[10px] font-bold text-slate-500 hover:text-indigo-600 hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-all flex items-center gap-2"
                >
                  <Sparkles size={10} /> {s}
                </button>
              ))}
            </div>
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white dark:bg-[#0B1221]">
            <div className="relative flex items-center bg-slate-100 dark:bg-black/40 rounded-[1.5rem] border border-slate-200 dark:border-white/10 px-2 py-2 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask EduRufus anything..."
                className="flex-1 bg-transparent border-none outline-none px-4 text-sm font-bold text-slate-800 dark:text-white placeholder:text-slate-400"
                autoFocus={isExpanded}
              />
              <button 
                onClick={() => handleSend()} 
                disabled={!input.trim() || isLoading}
                className="p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow-lg transition-all disabled:opacity-50 disabled:scale-95 active:scale-90"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Persistent Pill Trigger (Rufus Style) */}
      {!isExpanded && (
        <button 
          onClick={() => setIsExpanded(true)}
          className="group flex items-center gap-3 pl-4 pr-2 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgba(99,102,241,0.25)] transition-all duration-300 hover:-translate-y-1"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white animate-pulse-slow">
              <Bot size={16} />
            </div>
            <div className="flex flex-col items-start mr-2">
              <span className="text-xs font-black text-slate-800 dark:text-white">Ask EduRufus</span>
              <span className="text-[9px] font-bold text-slate-400">AI Assistant</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white transition-colors text-slate-400">
            <ChevronUp size={20} />
          </div>
        </button>
      )}
    </div>
  );
};

export default EduAssistant;