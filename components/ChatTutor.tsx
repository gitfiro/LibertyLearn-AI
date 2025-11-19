import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage } from '../types';
import { createTutorChat } from '../services/geminiService';
import { Chat } from '@google/genai';

interface ChatTutorProps {
  isPremium: boolean;
  onUpgrade: () => void;
}

const ChatTutor: React.FC<ChatTutorProps> = ({ isPremium, onUpgrade }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'Hello! I am your Civics Tutor. Ask me anything about US History, the Constitution, or the application process.', timestamp: Date.now() }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatSession = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isPremium) {
       chatSession.current = createTutorChat();
    }
  }, [isPremium]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !chatSession.current) return;
    
    const userMsg: ChatMessage = { role: 'user', text: input, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const result = await chatSession.current.sendMessage({ message: userMsg.text });
      const responseText = result.text || "I'm sorry, I didn't catch that. Could you rephrase?";
      
      setMessages(prev => [...prev, { role: 'model', text: responseText, timestamp: Date.now() }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', text: "I'm having trouble connecting right now. Please try again.", timestamp: Date.now() }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isPremium) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] bg-white rounded-xl shadow-md border border-gray-200 p-8 text-center">
        <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-6">
          <i className="fas fa-graduation-cap text-4xl text-patriot-blue"></i>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-3">Personal AI Tutor Locked</h2>
        <p className="text-gray-600 mb-8 max-w-md">
          Upgrade to Premium to chat with our advanced AI tutor. Get instant answers, explanations, and study help 24/7.
        </p>
        <button
          onClick={onUpgrade}
          className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-8 py-3 rounded-full font-bold text-lg shadow-lg hover:scale-105 transition flex items-center gap-2"
        >
          <i className="fas fa-crown"></i> Unlock AI Tutor
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
      <div className="bg-patriot-blue p-4 text-white flex items-center gap-3">
        <div className="bg-white/10 p-2 rounded-full">
            <i className="fas fa-graduation-cap"></i>
        </div>
        <div>
            <h3 className="font-bold">Civics Tutor AI</h3>
            <p className="text-xs text-blue-200">Ask about "The Federalist Papers" or "Rule of Law"</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-2xl text-sm sm:text-base ${
              msg.role === 'user' 
              ? 'bg-patriot-blue text-white rounded-tr-none' 
              : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none shadow-sm'
            }`}>
               {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
             <div className="bg-white border border-gray-200 p-3 rounded-2xl rounded-tl-none shadow-sm">
                <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                </div>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white border-t border-gray-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your question here..."
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-patriot-blue focus:border-transparent outline-none"
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="bg-patriot-red text-white px-6 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <i className="fas fa-paper-plane"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatTutor;