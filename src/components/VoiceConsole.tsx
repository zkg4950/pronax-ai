import React, { useState, useRef, useEffect } from 'react';
import {
  Plus,
  Volume2,
  VolumeX,
  ChevronRight,
  Maximize2,
  Minimize2,
  Paperclip,
  ArrowUp,
  Loader2,
  Sliders,
  Radio,
  Sparkles,
  Bot,
  Copy,
  Check,
  Monitor,
  Eye,
} from 'lucide-react';
import { ChatMessage } from '../types';
import { InterAgentChatter } from './InterAgentChatter';

import alicePortraitImg from '../assets/images/alice_portrait.jpg';
import bobPortraitImg from '../assets/images/bob_portrait.jpg';
import carolPortraitImg from '../assets/images/carol_portrait.jpg';
import davePortraitImg from '../assets/images/dave_portrait.jpg';

interface VoiceConsoleProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  soundEnabled: boolean;
  setSoundEnabled: (val: boolean) => void;
  onOpenInfoPanel: () => void;
  onOpenScreenMonitor?: () => void;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  onSelectAgent?: (agentId: string) => void;
}

const AGENT_PORTRAITS: Record<string, string> = {
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

export const VoiceConsole: React.FC<VoiceConsoleProps> = ({
  messages,
  onSendMessage,
  isLoading,
  soundEnabled,
  setSoundEnabled,
  onOpenInfoPanel,
  isExpanded = false,
  onToggleExpand,
  onSelectAgent,
}) => {
  const [activeTab, setActiveTab] = useState<'voice' | 'inter-agent' | 'notes'>('voice');
  const [inputText, setInputText] = useState('');
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [notes, setNotes] = useState<string>(
    `# STONIC AI MISSION DIRECTIVES\n- Creator: Stonic AI Team\n- Owner: Inventor Usman (https://stonicai.com/)\n- Status: Desktop AI Active\n- Sub-agents: Alice, Bob, Carol, Dave\n- Sector: 9 / Uplink 99.2%`
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  return (
    <div
      className={`flex flex-col h-full rounded-xl border border-[#00f0ff]/30 bg-[#04121d]/95 backdrop-blur-md overflow-hidden shadow-[0_0_30px_rgba(0,240,255,0.06)] select-none ${
        isExpanded ? 'w-full' : ''
      }`}
    >
      {/* Top Header & Tabs matching screenshot */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-cyan-500/20 bg-[#030d17]/90">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setActiveTab('voice')}
            className={`font-mono-tech text-[11px] font-bold tracking-[0.25em] pb-1 border-b-2 transition-all cursor-pointer ${
              activeTab === 'voice'
                ? 'border-cyan-400 text-cyan-200 shadow-[0_2px_8px_rgba(0,240,255,0.3)]'
                : 'border-transparent text-cyan-600 hover:text-cyan-400'
            }`}
          >
            VOICE
          </button>
          <button
            onClick={() => setActiveTab('inter-agent')}
            className={`flex items-center gap-1 font-mono-tech text-[11px] font-bold tracking-[0.25em] pb-1 border-b-2 transition-all cursor-pointer ${
              activeTab === 'inter-agent'
                ? 'border-cyan-400 text-cyan-200 shadow-[0_2px_8px_rgba(0,240,255,0.3)]'
                : 'border-transparent text-cyan-600 hover:text-cyan-400'
            }`}
          >
            <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
            <span>INTER-AGENT</span>
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`font-mono-tech text-[11px] font-bold tracking-[0.25em] pb-1 border-b-2 transition-all cursor-pointer ${
              activeTab === 'notes'
                ? 'border-cyan-400 text-cyan-200 shadow-[0_2px_8px_rgba(0,240,255,0.3)]'
                : 'border-transparent text-cyan-600 hover:text-cyan-400'
            }`}
          >
            NOTES
          </button>
        </div>

        {/* Right action icons */}
        <div className="flex items-center gap-3 text-cyan-400/80">
          <button
            onClick={() => onSendMessage('Introduce your capabilities.')}
            className="hover:text-cyan-200 transition-colors p-1"
            title="New Dialogue"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="hover:text-cyan-200 transition-colors p-1"
            title={soundEnabled ? 'Mute Stonic Voice' : 'Unmute Stonic Voice'}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
          </button>
          <ChevronRight className="w-3.5 h-3.5 hover:text-cyan-200 cursor-pointer" />
          {onToggleExpand && (
            <button
              onClick={onToggleExpand}
              className="text-cyan-400 hover:text-cyan-200 transition-colors p-1"
              title={isExpanded ? 'Restore Console' : 'Maximize Console'}
            >
              {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
      </div>

      {/* Tab 1: VOICE CHAT FEED */}
      {activeTab === 'voice' && (
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {messages.map((msg, index) => {
            const agentPortrait = msg.agentId ? AGENT_PORTRAITS[msg.agentId] : null;
            const agentColor = msg.agentId ? AGENT_COLORS[msg.agentId] : '#00f0ff';

            return (
              <div key={msg.id} className="space-y-1">
                {msg.role === 'assistant' ? (
                  /* Assistant / Agent Message */
                  <div className="space-y-1">
                    {/* Header Tag with Agent Avatar if addressing an agent */}
                    <div className="flex items-center gap-2 text-cyan-300 font-mono-tech text-[10px] font-bold tracking-widest pt-1">
                      {agentPortrait ? (
                        <div className="flex items-center gap-1.5">
                          <img
                            src={agentPortrait}
                            alt={msg.agentName || 'Agent'}
                            className="w-4 h-4 rounded-full object-cover border"
                            style={{ borderColor: agentColor }}
                          />
                          <span style={{ color: agentColor }}>
                            AGENT {msg.agentName ? msg.agentName.toUpperCase() : 'AGENT'}
                          </span>
                        </div>
                      ) : (
                        index !== 0 && (
                          <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#00f0ff]" />
                            <span>STONIC AI // CORE</span>
                          </div>
                        )
                      )}
                    </div>

                    {/* Module action box if present */}
                    {msg.actions && msg.actions.length > 0 && (
                      <div className="my-1.5">
                        {msg.actions.map((act, i) => (
                          <div
                            key={i}
                            onClick={onOpenInfoPanel}
                            className="flex items-center justify-between px-3 py-1.5 rounded bg-[#031d28]/90 border border-cyan-400/50 text-cyan-300 font-mono-tech text-[10px] cursor-pointer hover:border-cyan-300 transition-all shadow-[0_0_12px_rgba(0,240,255,0.15)]"
                          >
                            <div className="flex items-center gap-2">
                              <Sliders className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                              <span>
                                Module: <strong className="text-white font-mono">{act.type}</strong>
                              </span>
                            </div>
                            <div className="flex items-center gap-1 text-cyan-400/80">
                              <span>&gt; 0.4s &gt;</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="relative group">
                      <div
                        className="p-3.5 rounded-lg border text-cyan-50 text-[12.5px] leading-relaxed shadow-[0_0_15px_rgba(0,240,255,0.04)] font-sans whitespace-pre-line select-text cursor-text"
                        style={{
                          backgroundColor: msg.agentId ? 'rgba(3, 20, 32, 0.85)' : 'rgba(6, 30, 41, 0.7)',
                          borderColor: msg.agentId ? `${agentColor}50` : 'rgba(6, 182, 212, 0.25)',
                        }}
                      >
                        {msg.content}
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(msg.content);
                          setCopiedMsgId(msg.id);
                          setTimeout(() => setCopiedMsgId(null), 2000);
                        }}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1.5 rounded bg-[#010912]/80 border border-cyan-500/40 text-cyan-300 hover:text-white transition-opacity select-none cursor-pointer shadow-sm"
                        title="Copy message"
                      >
                        {copiedMsgId === msg.id ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  /* User Message */
                  <div className="flex flex-col items-end space-y-1 pt-1">
                    <div className="flex items-center gap-1.5 text-cyan-400/80 font-mono-tech text-[9.5px] font-bold tracking-widest select-none">
                      <span>YOU</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    </div>
                    <div className="relative group max-w-[88%]">
                      <div className="p-3 rounded-lg bg-[#041924]/90 border border-cyan-500/20 text-cyan-100 text-[12.5px] leading-relaxed text-left font-sans select-text cursor-text">
                        {msg.content}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(msg.content);
                          setCopiedMsgId(msg.id);
                          setTimeout(() => setCopiedMsgId(null), 2000);
                        }}
                        className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 p-1 rounded bg-[#010912]/80 border border-cyan-500/40 text-cyan-300 hover:text-white transition-opacity select-none cursor-pointer"
                        title="Copy"
                      >
                        {copiedMsgId === msg.id ? (
                          <Check className="w-2.5 h-2.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-2.5 h-2.5" />
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex items-center gap-2 text-cyan-400/90 font-mono-tech text-xs p-2">
              <Loader2 className="w-4 h-4 animate-spin text-cyan-300" />
              <span className="tracking-widest">STONIC AI JAWAB TYAR KAR REHA HAI...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Tab 2: INTER-AGENT CHATTER FEED */}
      {activeTab === 'inter-agent' && (
        <div className="flex-1 overflow-hidden p-1 min-h-0">
          <InterAgentChatter
            onAgentFocus={(id) => {
              if (onSelectAgent) onSelectAgent(id);
            }}
          />
        </div>
      )}

      {/* Tab 3: NOTES */}
      {activeTab === 'notes' && (
        <div className="flex-1 p-3 flex flex-col font-mono-tech">
          <div className="text-[10px] text-cyan-400 mb-1 flex items-center justify-between">
            <span>TACTICAL SCRATCHPAD // STONIC AI</span>
            <span className="text-emerald-400">AUTO-SAVED</span>
          </div>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="flex-1 w-full p-2.5 bg-[#020b13] border border-cyan-500/30 rounded text-cyan-100 text-xs focus:outline-none focus:border-cyan-400 resize-none font-mono-tech leading-relaxed"
          />
        </div>
      )}

      {/* Quick Action Chips in Roman Urdu & Saraiki */}
      <div className="px-3 py-1 flex items-center gap-1.5 overflow-x-auto no-scrollbar border-t border-cyan-500/10 bg-[#020912]">
        <button
          type="button"
          onClick={() => onSendMessage('Jani meri screen dekho aur active window te code check karo')}
          className="px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-[9px] font-mono-tech hover:bg-cyan-500/25 whitespace-nowrap cursor-pointer transition-colors"
        >
          🖥️ Screen Dekho Jani
        </button>
        <button
          type="button"
          onClick={() => onSendMessage('Jani apna full intro karao aur daso ki ki taqat hai tuhan-day brain kol?')}
          className="px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-[9px] font-mono-tech hover:bg-cyan-500/25 whitespace-nowrap cursor-pointer transition-colors"
        >
          🧠 Stonic Brain Intro
        </button>
        <button
          type="button"
          onClick={() => onSendMessage('Jani code bug fix karo aur terminal command run karo')}
          className="px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-[9px] font-mono-tech hover:bg-cyan-500/25 whitespace-nowrap cursor-pointer transition-colors"
        >
          💻 Code Fix & Run
        </button>
        <button
          type="button"
          onClick={() => onSendMessage('Bob bhai: network firewall te port security audit karo')}
          className="px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-[9px] font-mono-tech hover:bg-cyan-500/25 whitespace-nowrap cursor-pointer transition-colors"
        >
          🛡️ Bob: Firewall Scan
        </button>
        <button
          type="button"
          onClick={() => onSendMessage('Kivein o jani? Haal sunao te saraiki vich gall karo!')}
          className="px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-[9px] font-mono-tech hover:bg-cyan-500/25 whitespace-nowrap cursor-pointer transition-colors"
        >
          🗣️ Saraiki / Roman Urdu
        </button>
      </div>

      {/* Bottom Capsule Input matching screenshot */}
      <div className="p-2.5 bg-[#030d17]/90">
        <form onSubmit={handleSubmit} className="relative flex items-center">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Hukum karo jani (e.g. 'Screen dekho', 'Bob firewall check kar', 'Coding karo')..."
            disabled={isLoading}
            className="w-full pl-4 pr-20 py-2.5 rounded-full bg-[#020a12]/95 border border-cyan-500/40 text-cyan-50 placeholder-cyan-600/70 text-xs font-sans focus:outline-none focus:border-cyan-300 shadow-[inset_0_0_15px_rgba(0,240,255,0.06)]"
          />

          {/* Action icons on right inside capsule */}
          <div className="absolute right-2 flex items-center gap-1.5">
            <button
              type="button"
              onClick={onOpenInfoPanel}
              className="p-1 text-cyan-500 hover:text-cyan-200 transition-colors cursor-pointer"
              title="Attach Specification"
            >
              <Paperclip className="w-3.5 h-3.5" />
            </button>

            <button
              type="submit"
              disabled={isLoading || !inputText.trim()}
              className="w-7 h-7 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center hover:bg-cyan-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-[0_0_10px_rgba(0,240,255,0.6)] cursor-pointer"
            >
              <ArrowUp className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
