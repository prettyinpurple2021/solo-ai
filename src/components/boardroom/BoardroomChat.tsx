import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Crown, Send, Users, MessageSquare } from 'lucide-react';
import { AGENTS } from '../../constants';

interface Message {
  agentId: string;
  content: string;
  isStreaming?: boolean;
}

export const BoardroomChat: React.FC<{ sessionId: string }> = ({ sessionId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const newSocket = io("http://localhost:5000/boardroom");
    setSocket(newSocket);

    newSocket.on("connect", () => {
      newSocket.emit("join-session", sessionId);
    });

    newSocket.on("agent-chunk", (data: { chunk: string, done: boolean }) => {
      setMessages(prev => {
        const lastMessage = prev[prev.length - 1];
        if (lastMessage && lastMessage.isStreaming) {
          const updated = [...prev];
          updated[updated.length - 1] = {
            ...lastMessage,
            content: lastMessage.content + data.chunk,
            isStreaming: !data.done
          };
          return updated;
        } else {
          return [...prev, { agentId: 'agent-1', content: data.chunk, isStreaming: !data.done }];
        }
      });
    });

    return () => {
      newSocket.disconnect();
    };
  }, [sessionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const [targetAgent, setTargetAgent] = useState<string>('all');

  const handleSend = () => {
    if (!input.trim() || !socket) return;
    
    setMessages(prev => [...prev, { agentId: 'user', content: input }]);
    socket.emit("test-trigger-stream", { 
      sessionId, 
      text: targetAgent === 'all' 
        ? "I hear you. Let me coordinate with the team." 
        : `Understood. I will address this with ${AGENTS[targetAgent as keyof typeof AGENTS]?.name || targetAgent}.`,
      targetAgentId: targetAgent === 'all' ? undefined : targetAgent
    });
    setInput('');
  };

  const handleConclude = () => {
    if (!socket) return;
    setMessages(prev => [...prev, { agentId: 'user', content: "[SESSION CONCLUDED BY CEO]" }]);
    socket.emit("test-trigger-stream", { 
      sessionId, 
      text: "The board meeting is now adjourned. We will prepare the final executive summary and action plan immediately." 
    });
  };

  return (
    <div className="flex flex-col h-[600px] bg-dark-card border-2 border-gray-700 rounded-sm overflow-hidden shadow-2xl">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-700 bg-black/40 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Users size={18} className="text-neon-cyan" />
          <span className="font-orbitron font-bold text-white uppercase tracking-wider text-sm">Active Discussion</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            {Object.values(AGENTS).slice(0, 3).map(agent => (
              <img 
                key={agent.id} 
                src={agent.avatar} 
                className={`w-6 h-6 rounded-full border ${targetAgent === agent.id ? 'border-neon-cyan scale-110 shadow-[0_0_10px_rgba(11,228,236,0.5)]' : 'border-gray-600 grayscale hover:grayscale-0'} transition-all cursor-pointer`}
                title={agent.name}
                onClick={() => setTargetAgent(targetAgent === agent.id ? 'all' : agent.id)}
              />
            ))}
          </div>
          <button 
            onClick={handleConclude}
            className="text-[10px] font-mono font-bold text-neon-magenta border border-neon-magenta/50 px-2 py-1 hover:bg-neon-magenta/10 transition-colors uppercase tracking-tighter"
          >
            Conclude
          </button>
        </div>
      </div>

      {/* Message Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-sm custom-scrollbar">
        {messages.map((m, i) => {
          const agent = m.agentId === 'user' ? null : AGENTS[m.agentId as keyof typeof AGENTS] || AGENTS['roxy'];
          return (
            <div key={i} className={`flex ${m.agentId === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-3 rounded-sm border ${
                m.agentId === 'user' 
                  ? 'bg-neon-cyan/10 border-neon-cyan text-neon-cyan shadow-[0_0_10px_rgba(11,228,236,0.1)]' 
                  : 'bg-gray-800/50 border-gray-700 text-gray-300'
              }`}>
                {agent && (
                  <div className={`text-[10px] font-bold uppercase mb-1 ${agent.color}`}>
                    {agent.name}
                  </div>
                )}
                <div className="leading-relaxed whitespace-pre-wrap">
                  {m.content}
                  {m.isStreaming && <span className="animate-pulse inline-block w-2 h-4 bg-neon-cyan ml-1" />}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-black/20 border-t border-gray-700">
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center text-[10px] font-mono uppercase tracking-widest text-gray-500 px-1">
            <span>Target: <span className={targetAgent === 'all' ? 'text-gray-400' : 'text-neon-cyan'}>{targetAgent === 'all' ? 'Entire Board' : AGENTS[targetAgent as keyof typeof AGENTS]?.name}</span></span>
            {targetAgent !== 'all' && <button onClick={() => setTargetAgent('all')} className="hover:text-white transition-colors">[Clear]</button>}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="DIRECTIVE..."
              className="flex-1 bg-black/40 border border-gray-700 p-3 font-mono text-xs text-white focus:outline-none focus:border-neon-cyan transition-colors placeholder:opacity-30"
            />
            <button
              onClick={handleSend}
              className="bg-neon-cyan/20 border border-neon-cyan text-neon-cyan px-6 hover:bg-neon-cyan/40 transition-all flex items-center justify-center group"
            >
              <Send size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
