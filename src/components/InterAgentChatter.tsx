import React, { useState, useEffect, useRef } from 'react';
import {
  Radio,
  Sparkles,
  Volume2,
  VolumeX,
  Play,
  RotateCw,
  MessageSquare,
  Shield,
  Layers,
  Database,
  Cpu,
  Loader2,
  Send,
} from 'lucide-react';
import { InterAgentMessage } from '../types';

import alicePortraitImg from '../assets/images/alice_portrait.jpg';
import bobPortraitImg from '../assets/images/bob_portrait.jpg';
import carolPortraitImg from '../assets/images/carol_portrait.jpg';
import davePortraitImg from '../assets/images/dave_portrait.jpg';

interface InterAgentChatterProps {
  onAgentFocus?: (agentId: string) => void;
  className?: string;
  compact?: boolean;
}

const AGENT_AVATARS: Record<string, string> = {
  alice: alicePortraitImg,
  bob: bobPortraitImg,
  carol: carolPortraitImg,
  dave: davePortraitImg,
};

const AGENT_COLORS: Record<string, string> = {
  alice: '#f472b6',
  bob: '#38bdf8',
  carol: '#34d399',
  dave: '#fbbf24',
};

export const InterAgentChatter: React.FC<InterAgentChatterProps> = ({
  onAgentFocus,
  className = '',
  compact = false,
}) => {
  const [messages, setMessages] = useState<InterAgentMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [radioAudioEnabled, setRadioAudioEnabled] = useState<boolean>(false);
  const [customTopic, setCustomTopic] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch chatter stream
  const fetchChatter = async () => {
    try {
      const res = await fetch('/api/admin/inter-agent-chatter');
      if (res.ok) {
        const data = await res.json();
        if (data && data.messages) {
          setMessages(data.messages);
        }
      }
    } catch (e) {
      console.warn('Failed to fetch inter-agent chatter:', e);
    }
  };

  useEffect(() => {
    fetchChatter();
  }, []);

  const speakChatter = (msg: InterAgentMessage) => {
    if (!radioAudioEnabled || !('speechSynthesis' in window)) return;
    try {
      const utterance = new SpeechSynthesisUtterance(`${msg.senderName} to ${msg.recipientName}: ${msg.content}`);
      utterance.rate = 1.05;
      utterance.pitch = msg.senderId === 'alice' ? 1.15 : msg.senderId === 'bob' ? 0.85 : msg.senderId === 'carol' ? 1.05 : 0.95;
      window.speechSynthesis.speak(utterance);
    } catch {
      // Audio speech synthesis suppressed
    }
  };

  // Simulate or trigger new autonomous conversation turn
  const handleSimulateTurn = async (topic?: string) => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      const res = await fetch('/api/admin/inter-agent-chatter/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: topic || customTopic }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data && data.message) {
          setMessages((prev) => [...prev, data.message]);
          speakChatter(data.message);
          setCustomTopic('');
        }
      }
    } catch (err) {
      console.warn('Simulation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Autonomous periodic dialogue turn every 28 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      handleSimulateTurn();
    }, 28000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div
      className={`flex flex-col h-full bg-[#020b14] border border-cyan-500/25 rounded-xl overflow-hidden font-mono-tech ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#031320] border-b border-cyan-500/20 shrink-0">
        <div className="flex items-center gap-2">
          <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span className="text-xs font-bold text-cyan-200 tracking-wider">
            AGENT CHATTER // COORDINATION STREAM
          </span>
          <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 text-[9px] font-bold">
            LIVE RADIO
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => setRadioAudioEnabled(!radioAudioEnabled)}
            className={`flex items-center gap-1 px-2 py-0.5 rounded border transition-colors cursor-pointer text-[10px] ${
              radioAudioEnabled
                ? 'bg-cyan-500/30 border-cyan-400 text-cyan-100 shadow-[0_0_8px_rgba(0,240,255,0.4)]'
                : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle Live Audio Radio Narration"
          >
            {radioAudioEnabled ? <Volume2 className="w-3 h-3 text-cyan-300" /> : <VolumeX className="w-3 h-3" />}
            <span className="hidden sm:inline">{radioAudioEnabled ? 'AUDIO ON' : 'AUDIO OFF'}</span>
          </button>

          <button
            onClick={() => handleSimulateTurn()}
            disabled={isLoading}
            className="flex items-center gap-1 px-2 py-0.5 rounded bg-cyan-500/20 border border-cyan-400/40 text-cyan-200 hover:bg-cyan-500/30 text-[10px] cursor-pointer disabled:opacity-40"
            title="Trigger an autonomous inter-agent dialogue turn"
          >
            {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
            <span className="hidden sm:inline">COORDINATE NOW</span>
          </button>
        </div>
      </div>

      {/* Live Chatter Dialogue List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 min-h-0 bg-[#010811] scrollbar-none">
        {messages.map((msg) => {
          const senderAvatar = AGENT_AVATARS[msg.senderId] || alicePortraitImg;
          const senderColor = AGENT_COLORS[msg.senderId] || '#00f0ff';
          const recipientColor = AGENT_COLORS[msg.recipientId] || '#00f0ff';

          return (
            <div
              key={msg.id}
              onClick={() => onAgentFocus && onAgentFocus(msg.senderId)}
              className="p-2.5 rounded-lg bg-[#031322]/90 border border-cyan-500/20 hover:border-cyan-400/50 transition-all cursor-pointer group shadow-sm"
            >
              {/* Message Header: Sender -> Recipient */}
              <div className="flex items-center justify-between text-[11px] mb-1.5 pb-1 border-b border-cyan-500/15">
                <div className="flex items-center gap-1.5">
                  <img
                    src={senderAvatar}
                    alt={msg.senderName}
                    className="w-5 h-5 rounded-full object-cover border"
                    style={{ borderColor: senderColor }}
                  />
                  <span className="font-bold text-white tracking-wide" style={{ color: senderColor }}>
                    {msg.senderName}
                  </span>
                  <span className="text-slate-500">➔</span>
                  <span className="font-bold" style={{ color: recipientColor }}>
                    {msg.recipientName}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[9px] text-slate-400">
                  <span className="px-1 py-0.2 rounded bg-cyan-950 border border-cyan-800 text-cyan-300 uppercase">
                    {msg.category}
                  </span>
                  <span>{msg.timestamp}</span>
                </div>
              </div>

              {/* Message Content */}
              <p className="text-xs text-cyan-100/90 leading-relaxed pl-1 font-sans">
                {msg.content}
              </p>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-2 p-2 text-cyan-400 text-xs animate-pulse">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Agents Alice, Bob, Carol, and Dave collaborating via neural uplink...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Bottom Topic Injection Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (customTopic.trim()) handleSimulateTurn(customTopic.trim());
        }}
        className="flex items-center gap-1.5 p-2 bg-[#021220] border-t border-cyan-500/25"
      >
        <input
          type="text"
          value={customTopic}
          onChange={(e) => setCustomTopic(e.target.value)}
          placeholder="Inject topic for agent coordination (e.g. 'Firewall anomaly', 'Sector 9 satellite')..."
          disabled={isLoading}
          className="flex-1 px-2.5 py-1.5 rounded bg-[#010912] border border-cyan-500/40 text-cyan-100 text-xs focus:outline-none focus:border-cyan-300"
        />
        <button
          type="submit"
          disabled={isLoading || !customTopic.trim()}
          className="flex items-center gap-1 px-3 py-1.5 rounded bg-cyan-500/30 border border-cyan-400 text-cyan-100 text-xs font-bold hover:bg-cyan-500/50 cursor-pointer disabled:opacity-40"
        >
          <Send className="w-3.5 h-3.5" />
          <span>INJECT</span>
        </button>
      </form>
    </div>
  );
};
