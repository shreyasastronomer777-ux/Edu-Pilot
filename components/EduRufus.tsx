
import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, Loader2, Sparkles } from 'lucide-react';
// Corrected import to match the exported members in services/geminiService.ts
import { chatWithEduAssistant } from '../services/geminiService';

const EduRufus: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'bot', text: string}[]>([
    { role: 'bot', text: "Hi! I'm EduRufus. How can I help with your studies or teaching today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      // Map history to Gemini format
      const history = messages.map(m => ({
        role: m.role === 'bot' ? 'model' : 'user',
        parts: [{ text: m.text }]
      }));

      // Get user role from storage to provide context for the AI assistant
      const userRole = localStorage.getItem('edupilot_role') as 'teacher' | 'student' | null;

      // Fixed: chatWithEduAssistant expects 3 arguments: message, history, and userRole
      const botResponse = await chatWithEduAssistant(userMsg, history, userRole);
      setMessages(prev => [...prev, { role: 'bot', text: botResponse }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'bot', text: "Sorry, I'm having trouble connecting. Try again?" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 group relative"
        >
          <div className="absolute inset-0 rounded-full bg-indigo-500 animate-ping opacity-20 group-hover:hidden"></div>
          <Sparkles size={24} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="bg-white dark:bg-slate-900 w-[350px] h-[500px] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="bg-indigo-600 p-4 text-white flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-white/20 rounded-lg">
                <Bot size={20} />
              </div>
              <span className="font-bold">EduRufus AI</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded-md transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-950/50">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                  m.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-tr-none shadow-md' 
                    : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-700 rounded-tl-none shadow-sm'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-slate-800 p-3 rounded-2xl rounded-tl-none border border-slate-100 dark:border-slate-700 shadow-sm">
                  <Loader2 size={16} className="animate-spin text-indigo-500" />
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask me anything..."
                className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white px-4 py-2 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-md"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EduRufus;
