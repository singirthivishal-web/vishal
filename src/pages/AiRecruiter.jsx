import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Bot, User, Mic } from 'lucide-react';

export default function AiRecruiter() {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'ai', text: "Hello! I'm CareerOS AI Recruiter. I see you're applying for Senior React Developer roles. Are you ready to start our mock interview? Tell me a little bit about your background to begin." }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { id: Date.now(), sender: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Mock AI Response
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [
        ...prev, 
        { id: Date.now(), sender: 'ai', text: "That's impressive. You mentioned you led a team to migrate to a new architecture. Can you tell me about the biggest technical challenge you faced during that migration and how you overcame it?" }
      ]);
    }, 2000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col space-y-4"
    >
      <div>
        <h1 className="text-2xl font-bold text-textMain tracking-tight">AI Recruiter Simulation</h1>
        <p className="text-textMuted mt-1">Practice interviews tailored to your target role and resume.</p>
      </div>

      <div className="flex-1 bg-surface border border-surfaceHighlight rounded-2xl flex flex-col overflow-hidden">
        <div className="p-4 border-b border-surfaceHighlight bg-surfaceHighlight/30 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Bot className="text-white" size={24} />
          </div>
          <div>
            <h3 className="font-semibold text-textMain">Tech Recruiter Bot</h3>
            <p className="text-xs text-textMuted flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-success"></span> Online
            </p>
          </div>
        </div>

        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-4 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                msg.sender === 'ai' ? 'bg-primary/20 text-primary' : 'bg-surfaceHighlight text-textMuted'
              }`}>
                {msg.sender === 'ai' ? <Bot size={18} /> : <User size={18} />}
              </div>
              <div className={`px-4 py-3 rounded-2xl max-w-[80%] ${
                msg.sender === 'user' 
                  ? 'bg-primary text-white rounded-tr-none' 
                  : 'bg-surfaceHighlight text-textMain rounded-tl-none'
              }`}>
                <p className="text-sm leading-relaxed">{msg.text}</p>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0">
                <Bot size={18} />
              </div>
              <div className="px-4 py-3 rounded-2xl bg-surfaceHighlight rounded-tl-none flex items-center gap-1">
                <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-2 h-2 bg-textMuted rounded-full" />
                <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-2 h-2 bg-textMuted rounded-full" />
                <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-2 h-2 bg-textMuted rounded-full" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 bg-surface border-t border-surfaceHighlight">
          <form onSubmit={handleSend} className="flex items-center gap-2 relative">
            <button type="button" className="p-3 text-textMuted hover:text-textMain transition-colors">
              <Mic size={20} />
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your response..."
              className="flex-1 bg-background border border-surfaceHighlight rounded-xl py-3 px-4 text-sm text-textMain focus:outline-none focus:border-primary transition-colors"
            />
            <button 
              type="submit"
              disabled={!input.trim() || isTyping}
              className="bg-primary hover:bg-primaryHover disabled:opacity-50 disabled:cursor-not-allowed text-white p-3 rounded-xl transition-colors shadow-lg shadow-primary/20"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </motion.div>
  );
}
