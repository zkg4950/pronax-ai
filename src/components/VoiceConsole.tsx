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
} from 'lucide-react';
import { ChatMessage } from '../types';

interface VoiceConsoleProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  soundEnabled: boolean;
  setSoundEnabled: (val: boolean) => void;
  onOpenInfoPanel: () => void;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

export const VoiceConsole: React.FC<VoiceConsoleProps> = ({
  messages,
  onSendMessage,
  isLoading,
  soundEnabled,
  setSoundEnabled,
  onOpenInfoPanel,
  isExpanded = false,
  onToggleExpand,
}) => {
  const [activeTab, setActiveTab] = useState<'voice' | 'agent' | 'notes'>('voice');
  const [inputText, setInputText] = useState('');
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
        <div className="flex items-center gap-5">
          {(['voice', 'agent', 'notes'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`font-mono-tech text-[11px] font-bold tracking-[0.25em] pb-1 border-b-2 transition-all cursor-pointer ${
                activeTab === tab
                  ? 'border-cyan-400 text-cyan-200 shadow-[0_2px_8px_rgba(0,240,255,0.3)]'
                  : 'border-transparent text-cyan-600 hover:text-cyan-400'
              }`}
            >
              {tab.toUpperCase()}
            </button>
          ))}
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
          {messages.map((msg, index) => (
            <div key={msg.id} className="space-y-1">
              {msg.role === 'assistant' ? (
                /* Assistant Message */
                <div className="space-y-1">
                  {/* First message in screenshot doesn't show • STONIC AI tag above it */}
                  {index !== 0 && (
                    <div className="flex items-center gap-1.5 text-cyan-300 font-mono-tech text-[9.5px] font-bold tracking-widest pt-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#00f0ff]" />
                      <span>STONIC AI</span>
                    </div>
                  )}

                  {/* Module action box if present (e.g. open_info_panel) */}
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

                  <div className="p-3.5 rounded-lg bg-[#061e29]/70 border border-cyan-500/25 text-cyan-50 text-[12.5px] leading-relaxed shadow-[0_0_15px_rgba(0,240,255,0.04)] font-sans whitespace-pre-line">
                    {msg.content}
                  </div>
                </div>
              ) : (
                /* User Message */
                <div className="flex flex-col items-end space-y-1 pt-1">
                  <div className="flex items-center gap-1.5 text-cyan-400/80 font-mono-tech text-[9.5px] font-bold tracking-widest">
                    <span>YOU</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  </div>
                  <div className="p-3 rounded-lg bg-[#041924]/90 border border-cyan-500/20 text-cyan-100 text-[12.5px] leading-relaxed max-w-[88%] text-left font-sans">
                    {msg.content}
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex items-center gap-2 text-cyan-400/90 font-mono-tech text-xs p-2">
              <Loader2 className="w-4 h-4 animate-spin text-cyan-300" />
              <span className="tracking-widest">STONIC AI IS SYNTHESIZING RESPONSE...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Tab 2: AGENT MANAGEMENT */}
      {activeTab === 'agent' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono-tech text-xs">
          <div className="p-3 rounded bg-[#031d28]/70 border border-cyan-500/30">
            <span className="text-cyan-400 font-bold block mb-1">COGNITIVE AGENT NETWORK</span>
            <p className="text-cyan-200 text-[11px] leading-relaxed">
              Stonic AI autonomously routes high-dimensional reasoning tasks to specialized agents:
              Alice (Intelligence), Bob (Cyber Security), Carol (Data Pipelines), and Dave (Automation).
            </p>
          </div>

          <div className="space-y-2">
            {[
              { name: 'Alice', spec: 'Intelligence Analyst', status: 'Online - Monitoring Sector 9' },
              { name: 'Bob', spec: 'Network Sentinel', status: 'Online - Scanning Government Registries' },
              { name: 'Carol', spec: 'Data Stream Moderator', status: 'Active - Hydration Routine' },
              { name: 'Dave', spec: 'Orbital Choreographer', status: 'Active - Telemetry Queued' },
            ].map((ag) => (
              <div key={ag.name} className="p-2.5 rounded bg-[#051624] border border-cyan-500/20 flex items-center justify-between">
                <div>
                  <div className="text-cyan-300 font-bold">{ag.name} // {ag.spec}</div>
                  <div className="text-[10px] text-cyan-400/70">{ag.status}</div>
                </div>
                <button
                  onClick={() => onSendMessage(`Tell agent ${ag.name} to compile a briefing for Inventor Usman.`)}
                  className="px-2 py-1 rounded bg-cyan-500/20 border border-cyan-400/60 text-cyan-200 text-[10px] hover:bg-cyan-500/40 cursor-pointer"
                >
                  Dispatch
                </button>
              </div>
            ))}
          </div>
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

      {/* Ambient Audio Waveform Dot right above capsule input */}
      <div className="flex justify-end px-6 py-0.5">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#00f0ff]" />
      </div>

      {/* Bottom Capsule Input matching screenshot */}
      <div className="p-3 border-t border-cyan-500/20 bg-[#030d17]/90">
        <form onSubmit={handleSubmit} className="relative flex items-center">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type to Assistant (Gemini Live)..."
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
