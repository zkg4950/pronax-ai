import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SatLinkFeed } from './components/SatLinkFeed';
import { NeuralCore } from './components/NeuralCore';
import { AgentTown } from './components/AgentTown';
import { VoiceConsole } from './components/VoiceConsole';
import { Modals } from './components/Modals';
import { ChatMessage, AgentInfo } from './types';
import {
  Maximize2,
  Minimize2,
  Satellite,
  Bot,
  Box,
  MessageSquare,
} from 'lucide-react';

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-1',
    role: 'assistant',
    content:
      'I am Stonic AI, created by the Stonic AI team and owned by Inventor Usman. I am at your service, Sir, to assist with any tasks you require.',
    timestamp: new Date(Date.now() - 1000 * 60 * 12),
  },
  {
    id: 'msg-2',
    role: 'user',
    content: 'Introduce your capabilities.',
    timestamp: new Date(Date.now() - 1000 * 60 * 10),
  },
  {
    id: 'msg-3',
    role: 'assistant',
    content:
      'I am here to manage your digital world, Sir. My capabilities include executing desktop commands, managing your files and tasks, and handling communications. For more complex matters, I can coordinate with your specialized agents.',
    timestamp: new Date(Date.now() - 1000 * 60 * 8),
  },
  {
    id: 'msg-4',
    role: 'user',
    content: 'Introduce yourself and introduce your capabilities in details full explanation.',
    timestamp: new Date(Date.now() - 1000 * 60 * 6),
  },
  {
    id: 'msg-5',
    role: 'assistant',
    content:
      'I am Stonic AI, created by the Stonic AI team and owned by Inventor Usman. My purpose is to serve as your ultimate, sci-fi desktop intelligence, managing your world with quiet elegance and precision. Allow me to elaborate on my capabilities for you, Sir.',
    timestamp: new Date(Date.now() - 1000 * 60 * 4),
    actions: [
      {
        type: 'open_info_panel',
        description: 'Initialized capabilities matrix & core agent telemetry',
      },
    ],
  },
  {
    id: 'msg-6',
    role: 'assistant',
    content:
      'I operate across several domains to streamline your workflow, Sir. This includes full desktop control, managing your files and applications, and coordinating with your network of agents for complex research or communication needs. I also handle task automation and retain our context to ensure every interaction is uniquely tailored to your needs.',
    timestamp: new Date(Date.now() - 1000 * 60 * 2),
  },
];

export default function App() {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [isLoading, setIsLoading] = useState(false);
  const [thinking, setThinking] = useState(true);
  const [micEnabled, setMicEnabled] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [activeModal, setActiveModal] = useState<'memory' | 'skills' | 'character' | 'setting' | 'info' | null>(null);

  // Dynamic 3D Human Task Trigger (When user speaks or commands, 3D agent responds physically)
  const [externalTaskTrigger, setExternalTaskTrigger] = useState<{ agentId: string; task: string } | null>(null);

  // Balanced responsive panel dimensions (fit 100% inside screen without overflow)
  const [leftWidth, setLeftWidth] = useState(250);
  const [rightWidth, setRightWidth] = useState(330);
  const [neuralCoreHeightRatio, setNeuralCoreHeightRatio] = useState(0.48);

  const [maximizedPanel, setMaximizedPanel] = useState<'left' | 'neural' | 'agents' | 'right' | null>(null);
  const [activeMobileTab, setActiveMobileTab] = useState<'satlink' | 'neural' | 'agents' | 'voice'>('agents');
  const [isCompactScreen, setIsCompactScreen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingLeft = useRef(false);
  const isDraggingRight = useRef(false);
  const isDraggingCenterSplit = useRef(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const checkSize = () => {
      // Only switch to compact mobile tab view on small phone screens (< 768px wide)
      setIsCompactScreen(window.innerWidth < 768);
      // Ensure left and right panels scale dynamically so center column always has ample space
      if (window.innerWidth < 1200) {
        setLeftWidth(Math.max(210, Math.min(260, Math.floor(window.innerWidth * 0.22))));
        setRightWidth(Math.max(250, Math.min(300, Math.floor(window.innerWidth * 0.26))));
      }
    };
    checkSize();
    window.addEventListener('resize', checkSize);
    return () => window.removeEventListener('resize', checkSize);
  }, []);

  const startDragLeft = (e: React.MouseEvent) => {
    e.preventDefault();
    isDraggingLeft.current = true;
    document.body.style.cursor = 'col-resize';
  };

  const startDragRight = (e: React.MouseEvent) => {
    e.preventDefault();
    isDraggingRight.current = true;
    document.body.style.cursor = 'col-resize';
  };

  const startDragCenterSplit = (e: React.MouseEvent) => {
    e.preventDefault();
    isDraggingCenterSplit.current = true;
    document.body.style.cursor = 'row-resize';
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDraggingLeft.current && containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const newWidth = Math.max(180, Math.min(340, e.clientX - containerRect.left));
      setLeftWidth(newWidth);
    } else if (isDraggingRight.current && containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const newWidth = Math.max(250, Math.min(450, containerRect.right - e.clientX));
      setRightWidth(newWidth);
    } else if (isDraggingCenterSplit.current && containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const relativeY = (e.clientY - containerRect.top) / containerRect.height;
      setNeuralCoreHeightRatio(Math.max(0.35, Math.min(0.65, relativeY)));
    }
  }, []);

  const handleMouseUp = useCallback(() => {
    isDraggingLeft.current = false;
    isDraggingRight.current = false;
    isDraggingCenterSplit.current = false;
    document.body.style.cursor = 'default';
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  const speak = (text: string) => {
    if (!soundEnabled || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*_#`>\[\]]/g, '').trim();
    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    const voices = window.speechSynthesis.getVoices();
    const chosenVoice =
      voices.find((v) => /Google UK English Female|Microsoft Zira|Samantha|Victoria/i.test(v.name)) ||
      voices.find((v) => /female/i.test(v.name)) ||
      voices[0];

    if (chosenVoice) utterance.voice = chosenVoice;
    utterance.pitch = 1.0;
    utterance.rate = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  const toggleMic = () => {
    if (micEnabled) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setMicEnabled(false);
    } else {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        alert('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
        return;
      }

      try {
        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.interimResults = false;

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setMicEnabled(false);
          handleSendMessage(transcript);
        };

        recognition.onerror = () => setMicEnabled(false);
        recognition.onend = () => setMicEnabled(false);

        recognitionRef.current = recognition;
        recognition.start();
        setMicEnabled(true);
      } catch (err) {
        console.error('Speech recognition failed to start:', err);
        setMicEnabled(false);
      }
    }
  };

  const handleTerminate = () => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    if (recognitionRef.current) recognitionRef.current.stop();
    setMicEnabled(false);
    setThinking(false);
    setIsLoading(false);

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'All active neural processes terminated upon your instruction, Sir. Ready for next command.',
        timestamp: new Date(),
      },
    ]);
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const lower = text.toLowerCase();

    // Direct 3D physical agent behaviors in the office
    if (lower.includes('meeting') || lower.includes('sab') || lower.includes('conference') || lower.includes('ikatha')) {
      setExternalTaskTrigger({ agentId: 'all', task: 'All-Hands Conference Meeting' });
    } else if (lower.includes('bob') || lower.includes('coffee') || lower.includes('espresso')) {
      setExternalTaskTrigger({ agentId: 'bob', task: text });
    } else if (lower.includes('alice') || lower.includes('briefing') || lower.includes('summit')) {
      setExternalTaskTrigger({ agentId: 'alice', task: text });
    } else if (lower.includes('carol') || lower.includes('water') || lower.includes('paani')) {
      setExternalTaskTrigger({ agentId: 'carol', task: text });
    } else if (lower.includes('dave') || lower.includes('scan') || lower.includes('server') || lower.includes('cloud')) {
      setExternalTaskTrigger({ agentId: 'dave', task: text });
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setThinking(true);

    try {
      const res = await fetch('/api/admin/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          conversationHistory: messages.slice(-8).map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const data = await res.json();
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
        actions: data.actions && data.actions.length > 0 ? data.actions : undefined,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      speak(data.response);
    } catch (err) {
      console.warn('Chat request failed, generating intelligent client fallback:', err);

      let fallbackText =
        'Instruction acknowledged, Sir. All specialized sub-agents and SAT-LINK feeds are executing under Inventor Usman’s directives.';
      if (lower.includes('capabilities') || lower.includes('introduce')) {
        fallbackText =
          'I am Stonic AI, created by the Stonic AI team and owned by Inventor Usman. My purpose is to serve as your ultimate, sci-fi desktop intelligence, managing your files, desktop commands, and specialized agent networks with absolute precision.';
      } else if (lower.includes('meeting') || lower.includes('sab')) {
        fallbackText = 'All-Hands Meeting engaged, Sir. Alice, Bob, Carol, and Dave are convening at the central conference table.';
      } else if (lower.includes('bob')) {
        fallbackText = 'Directing Agent Bob to address cyber defense and network telemetry at once, Sir.';
      } else if (lower.includes('alice')) {
        fallbackText = 'Agent Alice has engaged tactical intelligence briefing routines, Sir.';
      }

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: fallbackText,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      speak(fallbackText);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 w-screen h-screen max-w-screen max-h-screen overflow-hidden box-border p-1 bg-[#02070e] text-[#dcf4fb] flex flex-col font-sans select-none"
    >
      {/* Top Header Navigation Tabs Matching Reference Image */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-cyan-500/30 bg-[#030d17]/95 shrink-0 mb-1 rounded-lg text-xs font-mono-tech shadow-[0_0_20px_rgba(0,240,255,0.06)] z-40">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_#00f0ff] animate-pulse" />
          <span className="font-bold tracking-widest text-cyan-200 hidden sm:inline">STONIC AI</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 hidden md:inline">
            v4.2 PRO
          </span>
        </div>

        {/* Center Navigation Tabs (Matching Image 1: SAT-LINK, NEURAL CORE, AGENTS 3D, VOICE) */}
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => {
              setMaximizedPanel('left');
              setActiveMobileTab('satlink');
            }}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all cursor-pointer font-bold ${
              maximizedPanel === 'left' || (!maximizedPanel && activeMobileTab === 'satlink' && isCompactScreen)
                ? 'bg-cyan-500/30 text-cyan-100 border border-cyan-400 shadow-[0_0_12px_rgba(0,240,255,0.4)]'
                : 'text-cyan-400/80 hover:text-cyan-200 hover:bg-cyan-950/40'
            }`}
          >
            <Satellite className="w-3.5 h-3.5 text-cyan-400" />
            <span className="tracking-wider">SAT-LINK</span>
          </button>

          <button
            onClick={() => {
              setMaximizedPanel('neural');
              setActiveMobileTab('neural');
            }}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all cursor-pointer font-bold ${
              maximizedPanel === 'neural' || (!maximizedPanel && activeMobileTab === 'neural' && isCompactScreen)
                ? 'bg-cyan-500/30 text-cyan-100 border border-cyan-400 shadow-[0_0_12px_rgba(0,240,255,0.4)]'
                : 'text-cyan-400/80 hover:text-cyan-200 hover:bg-cyan-950/40'
            }`}
          >
            <Bot className="w-3.5 h-3.5 text-cyan-400" />
            <span className="tracking-wider">NEURAL CORE</span>
          </button>

          <button
            onClick={() => {
              setMaximizedPanel('agents');
              setActiveMobileTab('agents');
            }}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all cursor-pointer font-bold ${
              maximizedPanel === 'agents' || (!maximizedPanel && activeMobileTab === 'agents' && isCompactScreen)
                ? 'bg-cyan-500/30 text-cyan-100 border-2 border-cyan-300 shadow-[0_0_15px_rgba(0,240,255,0.6)]'
                : 'text-cyan-400/80 hover:text-cyan-200 hover:bg-cyan-950/40'
            }`}
          >
            <Box className="w-3.5 h-3.5 text-emerald-400" />
            <span className="tracking-wider text-emerald-300">AGENTS 3D</span>
          </button>

          <button
            onClick={() => {
              setMaximizedPanel('right');
              setActiveMobileTab('voice');
            }}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all cursor-pointer font-bold ${
              maximizedPanel === 'right' || (!maximizedPanel && activeMobileTab === 'voice' && isCompactScreen)
                ? 'bg-cyan-500/30 text-cyan-100 border border-cyan-400 shadow-[0_0_12px_rgba(0,240,255,0.4)]'
                : 'text-cyan-400/80 hover:text-cyan-200 hover:bg-cyan-950/40'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
            <span className="tracking-wider">VOICE</span>
          </button>
        </div>

        {/* Right Toggle: Dashboard 3-Column Split Mode */}
        <div className="flex items-center gap-2">
          {!isCompactScreen && (
            <button
              onClick={() => setMaximizedPanel(maximizedPanel ? null : 'agents')}
              className={`px-2.5 py-1 rounded text-[11px] font-bold border transition-all cursor-pointer ${
                !maximizedPanel
                  ? 'bg-cyan-500/20 text-cyan-200 border-cyan-400'
                  : 'bg-[#04121d] text-cyan-400/70 border-cyan-500/30 hover:text-cyan-200'
              }`}
              title="Toggle between 3-Column Command Dashboard and Focused View"
            >
              {!maximizedPanel ? '3-COL SPLIT' : 'RESTORE DASHBOARD'}
            </button>
          )}
        </div>
      </div>

      {/* Maximized View */}
      {maximizedPanel ? (
        <div className="h-full w-full relative min-h-0 overflow-hidden flex-1">
          <button
            onClick={() => setMaximizedPanel(null)}
            className="absolute top-2.5 right-2.5 z-50 px-3 py-1 bg-cyan-950/90 border border-cyan-400 text-cyan-200 rounded text-xs font-mono-tech flex items-center gap-1 shadow-[0_0_15px_rgba(0,240,255,0.4)] hover:bg-cyan-900 cursor-pointer"
          >
            <Minimize2 className="w-3.5 h-3.5" />
            <span>RESTORE DASHBOARD</span>
          </button>

          {maximizedPanel === 'left' && <SatLinkFeed isExpanded onToggleExpand={() => setMaximizedPanel(null)} />}
          {maximizedPanel === 'neural' && (
            <NeuralCore
              thinking={thinking}
              setThinking={setThinking}
              isLoading={isLoading}
              micEnabled={micEnabled}
              toggleMic={toggleMic}
              onTerminate={handleTerminate}
              onOpenModal={(modal) => setActiveModal(modal)}
              isExpanded
              onToggleExpand={() => setMaximizedPanel(null)}
            />
          )}
          {maximizedPanel === 'agents' && (
            <AgentTown
              onSelectAgent={(agent) => {
                handleSendMessage(`Inquire status of Agent ${agent.name} regarding "${agent.task}".`);
              }}
              isExpanded
              onToggleExpand={() => setMaximizedPanel(null)}
              externalTaskTrigger={externalTaskTrigger}
              onBackToDashboard={() => setMaximizedPanel(null)}
            />
          )}
          {maximizedPanel === 'right' && (
            <VoiceConsole
              messages={messages}
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              soundEnabled={soundEnabled}
              setSoundEnabled={setSoundEnabled}
              onOpenInfoPanel={() => setActiveModal('info')}
              isExpanded
              onToggleExpand={() => setMaximizedPanel(null)}
            />
          )}
        </div>
      ) : isCompactScreen ? (
        /* Single Active Mobile View: 100% Fit & Zero Overflow */
        <div className="flex-1 w-full min-h-0 overflow-hidden">
          {activeMobileTab === 'satlink' && <SatLinkFeed onToggleExpand={() => setMaximizedPanel('left')} />}
          {activeMobileTab === 'neural' && (
            <NeuralCore
              thinking={thinking}
              setThinking={setThinking}
              isLoading={isLoading}
              micEnabled={micEnabled}
              toggleMic={toggleMic}
              onTerminate={handleTerminate}
              onOpenModal={(modal) => setActiveModal(modal)}
              onToggleExpand={() => setMaximizedPanel('neural')}
            />
          )}
          {activeMobileTab === 'agents' && (
            <AgentTown
              onSelectAgent={(agent) => {
                handleSendMessage(`Inquire status of Agent ${agent.name} regarding "${agent.task}".`);
              }}
              onToggleExpand={() => setMaximizedPanel('agents')}
              externalTaskTrigger={externalTaskTrigger}
            />
          )}
          {activeMobileTab === 'voice' && (
            <VoiceConsole
              messages={messages}
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              soundEnabled={soundEnabled}
              setSoundEnabled={setSoundEnabled}
              onOpenInfoPanel={() => setActiveModal('info')}
              onToggleExpand={() => setMaximizedPanel('right')}
            />
          )}
        </div>
      ) : (
        /* Full 3-Column Desktop Layout: 100% Containment, Zero Window Overflow */
        <div className="flex-1 w-full flex min-h-0 min-w-0 overflow-hidden relative">
          {/* LEFT: SAT-LINK FEED */}
          <div
            style={{ width: `${leftWidth}px` }}
            className="h-full flex flex-col min-h-0 shrink-0 transition-all duration-75 overflow-hidden"
          >
            <SatLinkFeed onToggleExpand={() => setMaximizedPanel('left')} />
          </div>

          {/* Draggable Vertical Splitter 1 */}
          <div
            onMouseDown={startDragLeft}
            className="w-1.5 flex items-center justify-center cursor-col-resize group hover:bg-cyan-500/20 active:bg-cyan-500/40 transition-colors mx-0.5 z-30 shrink-0"
            title="Drag to resize Left Panel"
          >
            <div className="w-0.5 h-8 rounded-full bg-cyan-500/40 group-hover:bg-cyan-300 group-hover:shadow-[0_0_8px_#00f0ff] transition-all" />
          </div>

          {/* CENTER: NEURAL CORE (top) + AGENT TOWN 3D (bottom) */}
          <div className="flex-1 flex flex-col min-h-0 min-w-0 px-0.5 overflow-hidden">
            {/* Top: Neural Core */}
            <div
              style={{ flex: neuralCoreHeightRatio }}
              className="min-h-0 flex flex-col transition-all duration-75 overflow-hidden"
            >
              <NeuralCore
                thinking={thinking}
                setThinking={setThinking}
                isLoading={isLoading}
                micEnabled={micEnabled}
                toggleMic={toggleMic}
                onTerminate={handleTerminate}
                onOpenModal={(modal) => setActiveModal(modal)}
                onToggleExpand={() => setMaximizedPanel('neural')}
              />
            </div>

            {/* Draggable Horizontal Splitter */}
            <div
              onMouseDown={startDragCenterSplit}
              className="h-1.5 flex items-center justify-center cursor-row-resize group hover:bg-cyan-500/20 active:bg-cyan-500/40 transition-colors my-0.5 z-30 shrink-0"
              title="Drag to resize Neural Core vs Agent Town"
            >
              <div className="h-0.5 w-12 rounded-full bg-cyan-500/40 group-hover:bg-cyan-300 group-hover:shadow-[0_0_8px_#00f0ff] transition-all" />
            </div>

            {/* Bottom: Agent Town with Autonomous 3D Real Humans */}
            <div
              style={{ flex: 1 - neuralCoreHeightRatio }}
              className="min-h-0 flex flex-col transition-all duration-75 overflow-hidden"
            >
              <AgentTown
                onSelectAgent={(agent: AgentInfo) => {
                  handleSendMessage(`Inquire status of Agent ${agent.name} regarding "${agent.task}".`);
                }}
                onToggleExpand={() => setMaximizedPanel('agents')}
                externalTaskTrigger={externalTaskTrigger}
              />
            </div>
          </div>

          {/* Draggable Vertical Splitter 2 */}
          <div
            onMouseDown={startDragRight}
            className="w-1.5 flex items-center justify-center cursor-col-resize group hover:bg-cyan-500/20 active:bg-cyan-500/40 transition-colors mx-0.5 z-30 shrink-0"
            title="Drag to resize Right Console"
          >
            <div className="w-0.5 h-8 rounded-full bg-cyan-500/40 group-hover:bg-cyan-300 group-hover:shadow-[0_0_8px_#00f0ff] transition-all" />
          </div>

          {/* RIGHT: VOICE / ASSISTANT CONSOLE */}
          <div
            style={{ width: `${rightWidth}px` }}
            className="h-full flex flex-col min-h-0 shrink-0 transition-all duration-75 overflow-hidden"
          >
            <VoiceConsole
              messages={messages}
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              soundEnabled={soundEnabled}
              setSoundEnabled={setSoundEnabled}
              onOpenInfoPanel={() => setActiveModal('info')}
              onToggleExpand={() => setMaximizedPanel('right')}
            />
          </div>
        </div>
      )}

      {/* Cyber Modals for Memory, Skills, Character, Settings, and Info */}
      <Modals activeModal={activeModal} onClose={() => setActiveModal(null)} />
    </div>
  );
}
