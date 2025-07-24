'use client';

import { useEffect, useRef, useState } from 'react';

const OLLAMA_API_URL = 'http://localhost:11434/api/chat';

const Chatbot = () => {
  const [messages, setMessages] = useState([
    { 
      role: 'system', 
      content: 'You are InterviewIQ, an AI specialized in conducting technical interviews. Focus on coding problems, system design, and interview techniques.'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setLoading(true);
    setInput('');

    try {
      const response = await fetch(OLLAMA_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          model: 'interviewAi', 
          messages: newMessages, 
          stream: true,
          options: {
            temperature: 0.7,
            num_ctx: 4096
          }
        }),
      });

      if (!response.ok) throw new Error('Failed to fetch');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder('utf-8');
      let assistantReply = '';

      if (!reader) throw new Error('No response body');

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        chunk.split('\n').forEach((line) => {
          if (!line.trim()) return;
          try {
            const parsed = JSON.parse(line);
            if (parsed?.message?.content) {
              assistantReply += parsed.message.content;
              setMessages(prev => [
                ...newMessages,
                { role: 'assistant', content: assistantReply }
              ]);
            }
          } catch (e) {
            console.warn('Stream parse error:', e);
          }
        });
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Error connecting to the interview assistant.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 text-gray-100">

      {/* Messages Container with fixed scroll */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar"
        style={{ maxHeight: 'calc(100vh - 180px)' }}
      >
        {messages.filter(m => m.role !== 'system').length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="w-24 h-24 mb-4 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2">Start your interview practice</h2>
            <p className="text-gray-400 max-w-md">
              Begin with "I'd like to practice [language/technology]" or ask for a specific type of interview question.
            </p>
          </div>
        ) : (
          messages.filter(m => m.role !== 'system').map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-lg px-4 py-3 ${msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-br-none' 
                : 'bg-gray-700 text-gray-100 rounded-bl-none'
              }`}>
                <div className="font-medium text-s opacity-80">
                  {msg.role === 'user' ? 'You' : 'InterviewIQ'}
                </div>
                <div className="whitespace-pre-wrap">{msg.content}</div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-700 bg-gray-800">
        <div className="relative">
          <textarea
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Type your interview question or response..."
            className="w-full px-4 py-3 pr-12 bg-gray-700 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className={`absolute right-2 bottom-4 p-1 rounded-md ${
              !loading && input.trim() 
                ? 'text-blue-400 hover:text-blue-300' 
                : 'text-gray-500'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
        {loading && (
          <div className="flex items-center mt-2 text-sm text-gray-400">
            <div className="flex space-x-1 mr-2">
              <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
            InterviewIQ is responding...
          </div>
        )}
      </div>

      {/* Global Styles */}
      <style jsx global>{`
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(255,255,255,0.1) rgba(255,255,255,0.05);
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.05);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(255,255,255,0.1);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: rgba(255,255,255,0.2);
        }
      `}</style>
    </div>
  );
};

export default Chatbot;