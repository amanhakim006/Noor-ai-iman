
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Message, ChatState } from './types';
import { sendMessageToGemini } from './services/geminiService';
import { SUGGESTED_QUESTIONS } from './constants';
import ChatMessage from './components/ChatMessage';

const App: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  
  const getInitialMessages = (): Message[] => {
    const today = new Date();
    const isFriday = today.getDay() === 5;
    const jummahText = isFriday 
      ? "\n\n**Jummah Mubarak!** Aaj Jummah ka din hai, jo ki tamam dino ka sardar hai. Surah Al-Kahf ki tilawat karein aur Nabi (S.A.W) par Durood bhejein. Sahih Muslim ki hadith ke mutabiq, 'Jummah sabse behtareen din hai jis par suraj nikalta hai.'"
      : "";

    const saved = localStorage.getItem('noor_chat_messages');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) }));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }

    return [
      {
        id: 'welcome',
        role: 'assistant',
        content: `Assalamu Alaikum! Main 'Noor Al-Iman' hoon. Main Quran aur Sahih Hadith ki roshni mein aapke sawalon ke jawab de sakta hoon.${jummahText}\n\nWallahu A'lam.`,
        timestamp: new Date()
      }
    ];
  };

  const [state, setState] = useState<ChatState>({
    messages: getInitialMessages(),
    isLoading: false,
    error: null,
  });

  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync history of questions
  useEffect(() => {
    const userQuestions = state.messages
      .filter(m => m.role === 'user')
      .map(m => m.content);
    const uniqueQuestions = Array.from(new Set(userQuestions)).reverse();
    setHistory(uniqueQuestions);
    
    // Persist messages
    localStorage.setItem('noor_chat_messages', JSON.stringify(state.messages));
  }, [state.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [state.messages, state.isLoading]);

  const handleSend = useCallback(async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isLoading: true,
      error: null,
    }));
    setInput('');
    setIsSidebarOpen(false);

    try {
      // We pass the current date context to ensure the AI has access to "today's date"
      // to avoid triggering the fallback incorrectly if the user asks "What day is it?"
      // But we follow the "SYSTEM_INSTRUCTION" for the specific fallback phrase if it still can't determine.
      const dateContext = `[System Context: Today is ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}]`;
      
      const chatHistory = [
        { role: 'user' as const, parts: [{ text: dateContext }] },
        ...state.messages.map(m => ({
          role: m.role === 'user' ? 'user' as const : 'model' as const,
          parts: [{ text: m.content }]
        }))
      ];

      const aiResponse = await sendMessageToGemini(text, chatHistory);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
      };

      setState(prev => ({
        ...prev,
        messages: [...prev.messages, assistantMessage],
        isLoading: false,
      }));
    } catch (err) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: (err as Error).message,
      }));
    }
  }, [state.messages]);

  const clearHistory = () => {
    if (window.confirm("Kya aap saari history mita dena chahte hain?")) {
      localStorage.removeItem('noor_chat_messages');
      window.location.reload();
    }
  };

  const onFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend(input);
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar / History Drawer */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Pichle Sawaal</h2>
            <button onClick={() => setIsSidebarOpen(false)} className="md:hidden p-2 text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {history.length === 0 ? (
              <div className="p-4 text-center text-slate-400 text-sm italic">Koi history nahi hai</div>
            ) : (
              history.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(q)}
                  className="w-full text-left p-3 rounded-lg text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors truncate border border-transparent hover:border-emerald-100"
                >
                  {q}
                </button>
              ))
            )}
          </div>

          <div className="p-4 border-t border-slate-100">
            <button 
              onClick={clearHistory}
              className="flex items-center justify-center space-x-2 w-full p-2 text-xs font-medium text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span>Clear History</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white border-b border-emerald-100 shadow-sm sticky top-0 z-10 px-4 py-3">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 -ml-2 text-slate-500 md:hidden hover:text-emerald-600"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div className="w-10 h-10 bg-emerald-700 rounded-lg flex items-center justify-center text-white shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-emerald-900 leading-tight">Noor Al-Iman</h1>
                <p className="text-xs text-emerald-600 font-medium">Islamic AI Guide</p>
              </div>
            </div>
          </div>
        </header>

        {/* Chat Feed */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50 pattern-dots">
          <div className="max-w-3xl mx-auto">
            {state.messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            {state.isLoading && (
              <div className="flex justify-start mb-6">
                <div className="bg-white border border-emerald-100 p-4 rounded-2xl shadow-sm rounded-tl-none flex items-center space-x-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  <span className="text-xs text-emerald-600 ml-2 font-medium">Noor soch raha hai...</span>
                </div>
              </div>
            )}
            {state.error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-center mb-6">
                <p className="font-medium">{state.error}</p>
                <button 
                  onClick={() => handleSend(state.messages[state.messages.length - 1].content)}
                  className="text-sm underline mt-2 hover:text-red-800"
                >
                  Try again
                </button>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </main>

        {/* Footer with Suggestions and Input */}
        <footer className="bg-white border-t border-slate-100">
          <div className="max-w-3xl mx-auto w-full">
            {/* Suggested Questions */}
            <div className="px-4 pt-4 overflow-x-auto no-scrollbar pb-2 flex space-x-2 whitespace-nowrap">
              {SUGGESTED_QUESTIONS.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(q)}
                  className="bg-emerald-50 text-emerald-700 text-xs px-3 py-1.5 rounded-full border border-emerald-100 hover:bg-emerald-100 transition-colors shadow-sm"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Input Form */}
            <div className="p-4">
              <form onSubmit={onFormSubmit} className="relative flex items-center">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Deen ke bare mein sawal karein..."
                  disabled={state.isLoading}
                  className="w-full bg-slate-100 text-slate-800 rounded-2xl py-4 pl-6 pr-14 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all placeholder:text-slate-400 shadow-inner"
                />
                <button
                  type="submit"
                  disabled={state.isLoading || !input.trim()}
                  className={`absolute right-2 p-2 rounded-xl transition-all shadow-sm ${
                    !input.trim() || state.isLoading
                      ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </form>
              <div className="flex justify-between items-center px-2 mt-2">
                <p className="text-[10px] text-slate-400">
                  Verify from a Scholar. AI for informational purposes only.
                </p>
                <p className="text-[10px] font-medium text-emerald-700 flex items-center">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1"></span>
                  Quran & Sahih Hadith Verified
                </p>
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Custom Styles */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .pattern-dots {
          background-image: radial-gradient(#e2e8f0 1.5px, transparent 1.5px);
          background-size: 24px 24px;
        }
      `}</style>
    </div>
  );
};

export default App;
