"use client";
import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { Bot, Send, User, Sparkles, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import Markdown from 'react-markdown';

const itemVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } }
};

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
}

export const AIAssistant: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'model',
      text: 'Hello! I am your MediBed AI Assistant. I can help you understand your medical reports, track your vitals, find hospitals, or answer general health-related questions. How can I assist you today?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { id: Date.now().toString(), role: 'user', text: input.trim() };
    const currentMessages = [...messages, userMessage];
    setMessages(currentMessages);
    setInput('');
    setIsLoading(true);

    try {
      const geo = localStorage.getItem('medibed_geo');
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: currentMessages,
          context: { geo: geo ? JSON.parse(geo) : null }
        }),
      });

      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = '';

      setMessages(prev => [...prev, { id: Date.now().toString() + 'ai', role: 'model', text: '' }]);
      setIsLoading(false); // Enable typing effect UI

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ') && !line.includes('[DONE]')) {
             try {
                const data = JSON.parse(line.replace('data: ', ''));
                assistantMessage += data.text;
                setMessages(prev => {
                  const newMsgs = [...prev];
                  newMsgs[newMsgs.length - 1].text = assistantMessage;
                  return newMsgs;
                });
             } catch (e) {
                // Ignore parse errors on chunks
             }
          }
        }
      }
    } catch (error) {
      console.error('AI Error:', error);
      setIsLoading(false);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        text: 'Sorry, I encountered an error. Please try again later.'
      }]);
    }
  };

  return (
    <div className="max-w-5xl mx-auto h-[calc(100vh-10rem)] flex flex-col">
      <motion.section variants={itemVariants} className="mb-6">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary border border-primary/30 shadow-[0_0_30px_rgba(194,155,255,0.2)]">
            <Bot size={24} />
          </div>
          <div>
            <h1 className="text-4xl font-extrabold font-headline tracking-tight text-on-surface flex items-center gap-2">
              MediBed AI <Sparkles size={20} className="text-tertiary" />
            </h1>
            <p className="text-on-surface-variant mt-1">Your personal health assistant for simple and easy responses.</p>
          </div>
        </div>
      </motion.section>

      <motion.section variants={itemVariants} className="flex-1 bg-surface-low/60 glass-panel rounded-3xl border border-outline-variant shadow-2xl flex flex-col overflow-hidden">
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg) => (
            <div key={msg.id} className={cn("flex gap-4", msg.role === 'user' ? "flex-row-reverse" : "flex-row")}>
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                msg.role === 'user' ? "bg-tertiary/20 text-tertiary border border-tertiary/30" : "bg-primary/20 text-primary border border-primary/30"
              )}>
                {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
              </div>
              <div className={cn(
                "max-w-[80%] rounded-2xl p-4",
                msg.role === 'user' 
                  ? "bg-tertiary/10 border border-tertiary/20 text-on-surface" 
                  : "bg-surface-container/50 border border-outline-variant text-on-surface-variant"
              )}>
                {msg.role === 'model' ? (
                  <div className="markdown-body prose prose-p:leading-relaxed prose-pre:bg-surface-high prose-pre:border prose-pre:border-outline-variant">
                    <Markdown>{msg.text}</Markdown>
                  </div>
                ) : (
                  <p className="leading-relaxed">{msg.text}</p>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-4 flex-row">
              <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary border border-primary/30 flex items-center justify-center shrink-0">
                <Bot size={20} />
              </div>
              <div className="bg-surface-container/50 border border-outline-variant rounded-2xl p-4 flex items-center gap-2">
                <Loader2 size={16} className="animate-spin text-primary" />
                <span className="text-sm text-on-surface-variant">Thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-surface-container/40 border-t border-outline-variant backdrop-blur-md">
          <div className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about your symptoms, reports, or hospitals..."
              className="w-full bg-surface-high border border-outline-variant rounded-2xl py-4 pl-6 pr-16 text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="absolute right-2 p-3 bg-primary text-black rounded-xl hover:bg-primary-dim transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </motion.section>
    </div>
  );
};
