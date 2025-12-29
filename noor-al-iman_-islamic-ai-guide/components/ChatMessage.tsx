
import React from 'react';
import { Message } from '../types';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isAssistant = message.role === 'assistant';

  // Basic markdown parser for bold, blockquotes, and Arabic text detection
  const renderContent = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, idx) => {
      // Check if line contains Arabic characters
      const isArabic = /[\u0600-\u06FF]/.test(line);
      
      if (line.startsWith('>')) {
        return (
          <blockquote key={idx} className="border-l-4 border-emerald-500 pl-4 py-1 my-2 bg-emerald-50 italic text-slate-700">
            {line.substring(1).trim()}
          </blockquote>
        );
      }

      if (isArabic) {
        return (
          <p key={idx} className="arabic-font text-2xl py-3 text-right text-emerald-900 font-medium leading-relaxed">
            {line}
          </p>
        );
      }

      // Handle basic bolding **text**
      const bolded = line.split(/\*\*(.*?)\*\*/g).map((part, i) => 
        i % 2 === 1 ? <strong key={i} className="font-bold text-emerald-800">{part}</strong> : part
      );

      return <p key={idx} className="mb-2 leading-relaxed text-slate-800">{bolded}</p>;
    });
  };

  return (
    <div className={`flex w-full mb-6 ${isAssistant ? 'justify-start' : 'justify-end'}`}>
      <div className={`flex max-w-[85%] md:max-w-[75%] ${isAssistant ? 'flex-row' : 'flex-row-reverse'}`}>
        <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center shadow-sm ${
          isAssistant ? 'bg-emerald-700 text-white' : 'bg-amber-100 text-amber-700'
        }`}>
          {isAssistant ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          )}
        </div>
        
        <div className={`mx-3 p-4 rounded-2xl shadow-sm ${
          isAssistant 
            ? 'bg-white border border-emerald-100 rounded-tl-none' 
            : 'bg-emerald-600 text-white rounded-tr-none'
        }`}>
          <div className={!isAssistant ? 'text-emerald-50' : ''}>
            {isAssistant ? renderContent(message.content) : message.content}
          </div>
          <div className={`text-[10px] mt-2 opacity-60 flex justify-end`}>
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
