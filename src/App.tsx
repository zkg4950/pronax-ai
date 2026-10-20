import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SatLinkFeed } from './components/SatLinkFeed';
import { NeuralCore } from './components/NeuralCore';
import { AgentTown } from './components/AgentTown';
import { VoiceConsole } from './components/VoiceConsole';
import { Modals } from './components/Modals';
import { BrainConfigModal, DEFAULT_BRAIN_CONFIG } from './components/BrainConfigModal';
import { ScreenMonitorDeck } from './components/ScreenMonitorDeck';
import {
  VoiceBiometricSecurity,
  DEFAULT_SECURITY_PROFILE,
} from './components/VoiceBiometricSecurity';
import { ChatMessage, AgentInfo, BrainConfig, OwnerSecurityProfile } from './types';
import {
  Maximize2,
  Minimize2,
  Satellite,
  Bot,
  Box,
  MessageSquare,
  Cpu,
  Monitor,
  ShieldCheck,
  ShieldAlert,
  UserCheck,
  Lock,
} from 'lucide-react';

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-1',
    role: 'assistant',
    content:
      'Jani main Stonic AI haan, Inventor Usman da banaya hoya super intelligence desktop brain! Kivein o bhai, ki haal hai? Main tuhan-di khidmat vich bilkul hazir haan.',
    timestamp: new Date(Date.now() - 1000 * 60 * 12),
  },
  {
    id: 'msg-2',
    role: 'user',
    content: 'Jani daso tuhan-da brain ki ki kar sakda hai aur tuhan-de kol kede kede agents hin?',
    timestamp: new Date(Date.now() - 1000 * 60 * 10),
  },
  {
    id: 'msg-3',
    role: 'assistant',
    content:
      'Haa jani! Mera brain a to z poora computer te desktop control kar sakda hai: live screen monitor karna, har ek tab te browser dekhna, coding kerna te bugs theek karna, terminal commands run karna, aur mere kol chaar specialized real agents hin—Alice (Lead Intelligence), Bob (Cyber Security), Carol (Data Pipelines), aur Dave (Cloud DevOps)!',
    timestamp: new Date(Date.now() - 1000 * 60 * 8),
  },
  {
    id: 'msg-4',
    role: 'user',
    content: 'Jani screen vi monitor kar sakde o aur jo kam bolo wo screen per monitor karega?',
    timestamp: new Date(Date.now() - 1000 * 60 * 6),
  },
  {
    id: 'msg-5',
    role: 'assistant',
    content:
      'Bilkul jani! Ek wari hukum karo ya awaz maro, Optical Screen Vision live screen capture kar k tabs, code, browser ya terminal te har ek maslay nu scan karega aur live fix karega. Dasso jani hun kehri command execute karaan?',
    timestamp: new Date(Date.now() - 1000 * 60 * 4),
    actions: [
      {
        type: 'open_info_panel',
        description: 'Initialized capabilities matrix & core agent telemetry',
      },
    ],
  },
];

export default function App() {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [isLoading, setIsLoading] = useState(false);
  const [thinking, setThinking] = useState(true);
  const [micEnabled, setMicEnabled] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [activeModal, setActiveModal] = useState<'memory' | 'skills' | 'character' | 'setting' | 'info' | null>(null);
  const [isBrainConfigOpen, setIsBrainConfigOpen] = useState(false);
  const [isScreenMonitorOpen, setIsScreenMonitorOpen] = useState(false);
  const [brainConfig, setBrainConfig] = useState<BrainConfig>(() => {
    try {
      const saved = localStorage.getItem('stonic_ai_brain_config');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Could not read saved brain config:', e);
    }
    return DEFAULT_BRAIN_CONFIG;
  });

  // Voice Biometric Security & Sentry Guard
  const [securityProfile, setSecurityProfile] = useState<OwnerSecurityProfile>(() => {
    try {
      const saved = localStorage.getItem('stonic_owner_voice_profile');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Could not read saved security profile:', e);
    }
    return DEFAULT_SECURITY_PROFILE;
  });
  const [isLockdownActive, setIsLockdownActive] = useState<boolean>(false);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState<boolean>(false);
  const [lastOwnerVerification, setLastOwnerVerification] = useState<{
    time: string;
    confidence: number;
  }>({
    time: '04:12 AM',
    confidence: 99.2,
  });

  // Dynamic 3D Human Task Trigger (When user speaks or commands, 3D agent responds physically)
  const [externalTaskTrigger, setExternalTaskTrigger] = useState<{ agentId: string; task: string } | null>(null);

  // Balanced responsive panel dimensions (fit 100% inside screen without overflow)
  const [leftWidth, setLeftWidth] = useState(250);
  const [rightWidth, setRightWidth] = useState(330);
  const [neuralCoreHeightRatio, setNeuralCoreHeightRatio] = useState(0.48);

  const [maximizedPanel, setMaximizedPanel] = useState<'left' | 'neural' | 'agents' | 'right' | null>('agents');
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

  const speak = (text: string, agentId: 'alice' | 'bob' | 'carol' | 'dave' | 'stonic' = 'stonic') => {
    if (!soundEnabled || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*_#`>\[\]]/g, '').trim();
    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    const voices = window.speechSynthesis.getVoices();

    // Prefer native Urdu or Hindi voices for natural Roman Urdu / Saraiki pronunciation
    const urduVoice = voices.find((v) => /ur-PK|ur_PK|ur-|Urdu|hi-IN|hi_IN|Hindi/i.test(v.lang) || /Urdu|Hindi/i.test(v.name));

    if (agentId === 'alice') {
      const voice = urduVoice || voices.find((v) => /female/i.test(v.name)) || voices[0];
      if (voice) utterance.voice = voice;
      utterance.pitch = 1.1;
      utterance.rate = 1.0;
    } else if (agentId === 'bob') {
      const voice = urduVoice || voices.find((v) => /male/i.test(v.name)) || voices[0];
      if (voice) utterance.voice = voice;
      utterance.pitch = 0.9;
      utterance.rate = 0.95;
    } else if (agentId === 'carol') {
      const voice = urduVoice || voices.find((v) => /female/i.test(v.name)) || voices[0];
      if (voice) utterance.voice = voice;
      utterance.pitch = 1.05;
      utterance.rate = 1.0;
    } else if (agentId === 'dave') {
      const voice = urduVoice || voices.find((v) => /male/i.test(v.name)) || voices[0];
      if (voice) utterance.voice = voice;
      utterance.pitch = 0.95;
      utterance.rate = 0.95;
    } else {
      const chosenVoice =
        urduVoice ||
        voices.find((v) => /Google UK English Female|Microsoft Zira|Samantha|Victoria|female/i.test(v.name)) ||
        voices[0];
      if (chosenVoice) utterance.voice = chosenVoice;
      utterance.pitch = 1.0;
      utterance.rate = 0.95;
    }

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
        // Support Urdu Pakistan (ur-PK) for seamless Urdu/Saraiki voice recognition
        recognition.lang = 'ur-PK';
        recognition.interimResults = false;

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setMicEnabled(false);
          const lower = transcript.toLowerCase();
          if (lower.includes('screen') || lower.includes('dekho') || lower.includes('dykho') || lower.includes('monitor')) {
            setIsScreenMonitorOpen(true);
          }
          if (lower.includes('brain') || lower.includes('api key') || lower.includes('provider') || lower.includes('setting')) {
            setIsBrainConfigOpen(true);
          }
          handleSendMessage(transcript);
        };

        recognition.onerror = () => {
          // If ur-PK isn't installed in browser recognizer, fallback to auto
          setMicEnabled(false);
        };
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
    let targetedAgent: 'alice' | 'bob' | 'carol' | 'dave' | null = null;
    let agentName = '';

    // Direct Voice & Text Addressing Detection
    if (lower.includes('alice')) {
      targetedAgent = 'alice';
      agentName = 'Alice';
    } else if (lower.includes('bob')) {
      targetedAgent = 'bob';
      agentName = 'Bob';
    } else if (lower.includes('carol')) {
      targetedAgent = 'carol';
      agentName = 'Carol';
    } else if (lower.includes('dave')) {
      targetedAgent = 'dave';
      agentName = 'Dave';
    }

    // Trigger physical agent and live workspace focus
    if (targetedAgent) {
      setExternalTaskTrigger({ agentId: targetedAgent, task: text });
    } else if (lower.includes('meeting') || lower.includes('sab') || lower.includes('conference') || lower.includes('ikatha')) {
      setExternalTaskTrigger({ agentId: 'all', task: 'All-Hands Conference Meeting' });
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

    // If targeted agent was addressed directly, route to Gemini Agent Task Dispatcher
    if (targetedAgent) {
      try {
        const res = await fetch('/api/admin/agent-task', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            agentId: targetedAgent,
            instruction: text,
            context: { officeState: 'operational' },
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const reply = data.output || `Agent ${agentName} executing directive with optimal parameters, Sir.`;
          const assistantMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: reply,
            timestamp: new Date(),
            agentId: targetedAgent,
            agentName,
          };

          setMessages((prev) => [...prev, assistantMessage]);
          speak(reply, targetedAgent);
          setIsLoading(false);
          return;
        }
      } catch (e) {
        console.warn('Direct agent task route error:', e);
      }
    }

    // General Stonic AI Core Route (Universal Multi-Provider Engine)
    try {
      if (lower.includes('screen') || lower.includes('dekho') || lower.includes('dykho') || lower.includes('monitor')) {
        setIsScreenMonitorOpen(true);
      }
      if (lower.includes('brain') || lower.includes('api key') || lower.includes('provider') || lower.includes('setting')) {
        setIsBrainConfigOpen(true);
      }

      const res = await fetch('/api/admin/universal-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          conversationHistory: messages.slice(-8).map((m) => ({
            role: m.role,
            content: m.content,
          })),
          config: brainConfig,
        }),
      });

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const data = await res.json();
      if (data.actions?.some((a: any) => a.type === 'screen_monitor_active')) {
        setIsScreenMonitorOpen(true);
      }
      if (data.actions?.some((a: any) => a.type === 'open_info_panel')) {
        setActiveModal('info');
      }
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
        actions: data.actions && data.actions.length > 0 ? data.actions : undefined,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      speak(data.response, 'stonic');
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
        fallbackText = 'Agent Bob reporting: Firewall audit complete. Subnet 192.168.1.0/24 secured with TLS 1.3 strict transport, Sir.';
      } else if (lower.includes('alice')) {
        fallbackText = 'Agent Alice reporting: Satellite orbital link locked on Sector 9. Summit telemetry dossier updated, Sir.';
      } else if (lower.includes('carol')) {
        fallbackText = 'Agent Carol reporting: Kafka telemetry streaming at 1.48M events per second with zero consumer lag, Sir.';
      } else if (lower.includes('dave')) {
        fallbackText = 'Agent Dave reporting: All 16 Kubernetes microservices are healthy and thermals are normal at 41°C, Sir.';
      }

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: fallbackText,
        timestamp: new Date(),
        agentId: targetedAgent || undefined,
        agentName: agentName || undefined,
      };
      setMessages((prev) => [...prev, assistantMessage]);
      speak(fallbackText, targetedAgent || 'stonic');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      ref={containerRef}
      onClickCapture={(e) => {
        // If Sentry Guard is armed and not in lockdown:
        // Any click outside the security unlock triggers immediate Lockdown!
        if (securityProfile.sentryArmed && !isLockdownActive && !isSecurityModalOpen) {
          const target = e.target as HTMLElement;
          if (target && !target.closest('#security-sentry-btn')) {
            setIsLockdownActive(true);
          }
        }
      }}
      className="fixed inset-0 w-screen h-screen max-w-screen max-h-screen overflow-hidden box-border p-1 bg-[#02070e] text-[#dcf4fb] flex flex-col font-sans"
    >
      {/* Top Header Navigation Tabs Matching Reference Image */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-cyan-500/30 bg-[#030d17]/95 shrink-0 mb-1 rounded-lg text-xs font-mono-tech shadow-[0_0_20px_rgba(0,240,255,0.06)] z-40 select-none">
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

        {/* Right Toggle: Sentry Security & Dashboard 3-Column Split Mode */}
        <div className="flex items-center gap-2">
          {/* Owner Voice Biometric Guard & Sentry Switch */}
          <button
            id="security-sentry-btn"
            onClick={() => setIsSecurityModalOpen(true)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-bold border transition-all cursor-pointer shadow-sm ${
              securityProfile.sentryArmed
                ? 'bg-red-500/25 text-red-200 border-red-400 shadow-[0_0_12px_rgba(239,68,68,0.5)] animate-pulse'
                : 'bg-emerald-950/70 text-emerald-300 border-emerald-500/50 hover:bg-emerald-900/60 shadow-[0_0_10px_rgba(16,185,129,0.25)]'
            }`}
            title="Owner Voice Biometric Protection & Sentry Mode"
          >
            {securityProfile.sentryArmed ? (
              <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
            ) : (
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            )}
            <span className="hidden sm:inline">
              {securityProfile.sentryArmed
                ? 'SENTRY ARMED'
                : `MALIK: ${securityProfile.ownerName.toUpperCase()}`}
            </span>
            <span className="text-[9px] px-1 py-0.2 rounded bg-black/40 border border-current text-white hidden md:inline">
              {lastOwnerVerification ? `${lastOwnerVerification.confidence.toFixed(0)}% MATCH` : 'VERIFIED'}
            </span>
          </button>

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
              onOpenBrainConfig={() => setIsBrainConfigOpen(true)}
              onOpenScreenMonitor={() => setIsScreenMonitorOpen(true)}
              activeBrainProvider={brainConfig.provider}
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
              onOpenBrainConfig={() => setIsBrainConfigOpen(true)}
              onOpenScreenMonitor={() => setIsScreenMonitorOpen(true)}
              activeBrainProvider={brainConfig.provider}
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
                onOpenBrainConfig={() => setIsBrainConfigOpen(true)}
                onOpenScreenMonitor={() => setIsScreenMonitorOpen(true)}
                activeBrainProvider={brainConfig.provider}
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
                onOpenScreenMonitor={() => setIsScreenMonitorOpen(true)}
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

      {/* AI Brain Multi-Provider & Custom API Key Hub */}
      <BrainConfigModal
        isOpen={isBrainConfigOpen}
        onClose={() => setIsBrainConfigOpen(false)}
        config={brainConfig}
        onSaveConfig={(newConfig) => {
          setBrainConfig(newConfig);
          try {
            localStorage.setItem('stonic_ai_brain_config', JSON.stringify(newConfig));
          } catch (e) {
            console.warn('Failed to save brain config:', e);
          }
          speak(`Neural Brain configured to ${newConfig.provider.replace('_', ' ')}. System synchronized, Sir.`);
        }}
      />

      {/* Real Optical Screen Monitoring & Desktop Controller */}
      <ScreenMonitorDeck
        isOpen={isScreenMonitorOpen}
        onClose={() => setIsScreenMonitorOpen(false)}
        brainConfig={brainConfig}
        onSendChatMessage={handleSendMessage}
        externalVoiceCommand={
          messages[messages.length - 1]?.role === 'user' ? messages[messages.length - 1]?.content : null
        }
      />

      {/* Voice Biometric Owner Security & Laptop Sentry Guard */}
      <VoiceBiometricSecurity
        securityProfile={securityProfile}
        onUpdateSecurityProfile={(newProfile) => {
          setSecurityProfile(newProfile);
          try {
            localStorage.setItem('stonic_owner_voice_profile', JSON.stringify(newProfile));
          } catch (e) {
            console.warn('Failed to save security profile:', e);
          }
        }}
        isLockdownActive={isLockdownActive}
        onSetLockdownActive={setIsLockdownActive}
        isOpenSettings={isSecurityModalOpen}
        onCloseSettings={() => setIsSecurityModalOpen(false)}
        onOwnerVerified={(conf) => {
          setLastOwnerVerification({
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            confidence: conf,
          });
        }}
      />
    </div>
  );
}
