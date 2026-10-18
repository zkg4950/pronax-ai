import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Terminal,
  Activity,
  Send,
  Loader2,
  X,
  Volume2,
  Maximize2,
  Minimize2,
  Users,
  Shield,
  Layers,
  Database,
  Cpu,
  RefreshCw,
  Globe,
  Coffee,
  CheckCircle2,
} from 'lucide-react';
import { AgentInfo } from '../types';

import officeOverviewImg from '../assets/images/office_overview.jpg';
import alicePortraitImg from '../assets/images/alice_portrait.jpg';
import bobPortraitImg from '../assets/images/bob_portrait.jpg';
import carolPortraitImg from '../assets/images/carol_portrait.jpg';
import davePortraitImg from '../assets/images/dave_portrait.jpg';

interface AgentOfficeStudioProps {
  onSelectAgent?: (agent: AgentInfo) => void;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  externalTaskTrigger?: { agentId: string; task: string } | null;
}

interface StudioAgent {
  id: string;
  name: string;
  role: string;
  taskTag: string;
  taskDescription: string;
  avatarImg: string;
  clothingDescription: string;
  hudPosition: { top: string; left: string };
  monitorPosition: { top: string; left: string; width: string; height: string };
  status: 'active' | 'busy' | 'meeting' | 'break';
  progress: number;
  terminalLogs: string[];
}

export const AgentOfficeStudio: React.FC<AgentOfficeStudioProps> = ({
  onSelectAgent,
  isExpanded = false,
  onToggleExpand,
  externalTaskTrigger,
}) => {
  const [selectedAgentId, setSelectedAgentId] = useState<string>('alice');
  const [isTerminalOpen, setIsTerminalOpen] = useState<boolean>(false);
  const [activeNotification, setActiveNotification] = useState<string | null>(null);
  const [taskInput, setTaskInput] = useState<string>('');
  const [isExecutingTask, setIsExecutingTask] = useState<boolean>(false);
  const [showWhiteboardModal, setShowWhiteboardModal] = useState<boolean>(false);
  const [showGlobeModal, setShowGlobeModal] = useState<boolean>(false);
  const [meetingActive, setMeetingActive] = useState<boolean>(false);

  // Exact 4 Agents matching user screenshot
  const [agents, setAgents] = useState<Record<string, StudioAgent>>({
    alice: {
      id: 'alice',
      name: 'Alice',
      role: 'Lead Intelligence Analyst',
      taskTag: 'Drafting Intel',
      taskDescription: 'Analyzing diplomatic cables & satellite telemetry for Sector 9',
      avatarImg: alicePortraitImg,
      clothingDescription: 'Beige blazer, dark trousers, hair in sleek updo',
      hudPosition: { top: '21%', left: '16%' },
      monitorPosition: { top: '44%', left: '23%', width: '19%', height: '14%' },
      status: 'active',
      progress: 88,
      terminalLogs: [
        '[ALICE-INTEL] Orbital link locked on Sector 9 surveillance grid',
        '[ALICE-INTEL] Parsing 18 diplomatic satellite transcripts',
        '[ALICE-INTEL] Threat assessment matrix: 3.8 / Readiness Optimal',
        '[ALICE-INTEL] Drafting comprehensive summit intelligence dossier',
      ],
    },
    bob: {
      id: 'bob',
      name: 'Bob',
      role: 'Senior Cyber Security Engineer',
      taskTag: 'Firewall Audit',
      taskDescription: 'Perimeter Intrusion Detection & TLS 1.3 firewall rules audit',
      avatarImg: bobPortraitImg,
      clothingDescription: 'Grey suit jacket, modern glasses, dark trousers',
      hudPosition: { top: '9%', left: '42%' },
      monitorPosition: { top: '24%', left: '42%', width: '14%', height: '10%' },
      status: 'active',
      progress: 94,
      terminalLogs: [
        '[BOB-SEC] Scanning external subnet 192.168.1.0/24',
        '[BOB-SEC] Port 443 TLS 1.3 strict transport active & verified',
        '[BOB-SEC] Snort IDS state: ZERO unauthorized penetration attempts',
        '[BOB-SEC] Core firewall iptables rate-limiting applied',
      ],
    },
    carol: {
      id: 'carol',
      name: 'Carol',
      role: 'Data Pipeline Specialist',
      taskTag: 'Data Pipelines',
      taskDescription: 'Real-time telemetry streams ETL & ClickHouse DB optimization',
      avatarImg: carolPortraitImg,
      clothingDescription: 'White collared blouse, long wavy auburn hair',
      hudPosition: { top: '9%', left: '64%' },
      monitorPosition: { top: '20%', left: '62%', width: '12%', height: '9%' },
      status: 'active',
      progress: 79,
      terminalLogs: [
        '[CAROL-ETL] Kafka topic telemetry.sensor_stream healthy',
        '[CAROL-ETL] Ingestion rate: 1.48M events/sec (latency: 7.2ms)',
        '[CAROL-ETL] ClickHouse storage partition synchronized',
        '[CAROL-ETL] Running aggregate rollup job for 10-minute buckets',
      ],
    },
    dave: {
      id: 'dave',
      name: 'Dave',
      role: 'Cloud DevOps Architect',
      taskTag: 'Server Audit',
      taskDescription: 'High-density server blade diagnostic & Kubernetes pods audit',
      avatarImg: davePortraitImg,
      clothingDescription: 'Royal navy blue tailored suit, blue slacks, brown oxfords',
      hudPosition: { top: '11%', left: '85%' },
      monitorPosition: { top: '35%', left: '67%', width: '18%', height: '14%' },
      status: 'active',
      progress: 72,
      terminalLogs: [
        '[DAVE-OPS] Kubernetes cluster stonic-prod-us nodes: READY',
        '[DAVE-OPS] Envoy proxy sidecars running across 16 microservices',
        '[DAVE-OPS] Blade server thermals: 41°C / Normal Operating Range',
        '[DAVE-OPS] Cluster autoscaler configured; 0 memory pressure',
      ],
    },
  });

  const speakText = (text: string) => {
    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const cleanText = text.replace(/[*_#`>\[\]]/g, '').trim();
        if (!cleanText) return;
        const utterance = new SpeechSynthesisUtterance(cleanText);
        const voices = window.speechSynthesis.getVoices();
        const urduVoice = voices.find((v) => /ur-PK|ur_PK|ur-|Urdu|hi-IN|hi_IN|Hindi/i.test(v.lang) || /Urdu|Hindi/i.test(v.name));
        if (urduVoice) {
          utterance.voice = urduVoice;
        }
        utterance.rate = 0.95;
        utterance.pitch = 1.0;
        window.speechSynthesis.speak(utterance);
      }
    } catch {
      // Ignore if speech is restricted
    }
  };

  const handleSelectAgent = (id: string) => {
    setSelectedAgentId(id);
    const agent = agents[id];
    if (onSelectAgent && agent) {
      onSelectAgent({
        id: agent.id,
        name: agent.name,
        role: agent.role,
        status: 'active',
        task: agent.taskDescription,
      });
    }

    if (id === 'alice') {
      speakText('Haa jani, Agent Alice hazir hai! Sector 9 te satellite intelligence report tayar kar rahi haan.');
    } else if (id === 'bob') {
      speakText('Agent Bob online hai jani! Network firewall te port security bilkul tight chal rahi hai.');
    } else if (id === 'carol') {
      speakText('Agent Carol hazir hai bhai! Data pipelines te ClickHouse sync fit chal riha hai.');
    } else if (id === 'dave') {
      speakText('Agent Dave hazir hai jani! Cloud Kubernetes clusters te servers sab green chal ray ne.');
    }
  };

  // Direct Execution of Real Agent Task via Backend Gemini API
  const handleExecuteAgentTask = async (customInstruction?: string) => {
    const instruction = customInstruction || taskInput.trim();
    if (!instruction || isExecutingTask) return;

    setIsExecutingTask(true);
    const agent = agents[selectedAgentId];
    speakText(`Hukum samajh gaya jani! ${agent.name} abhi kam execute kar riha hai.`);
    setActiveNotification(`${agent.name}: "${instruction.slice(0, 36)}..." execute kar riha hai`);

    try {
      const res = await fetch('/api/admin/agent-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: selectedAgentId,
          instruction,
          context: {
            currentTask: agent.taskDescription,
            officeState: 'operational',
          },
        }),
      });

      const data = await res.json();
      if (data && data.output) {
        setAgents((prev) => {
          const target = { ...prev[selectedAgentId] };
          target.taskDescription = instruction;
          target.taskTag = 'Mukammal Ho Gaya';
          target.progress = 100;
          target.terminalLogs = [
            ...target.terminalLogs,
            `[${new Date().toLocaleTimeString()}] EXECUTED: ${instruction}`,
            ...data.output.split('\n').filter((l: string) => l.trim().length > 0).slice(0, 5),
          ];
          return { ...prev, [selectedAgentId]: target };
        });

        speakText(`${agent.name} ne kam mukammal kar lita hai jani!`);
        setActiveNotification(`${agent.name} da kam mukammal ho gaya hai.`);
      }
    } catch (err) {
      console.warn('Agent task error:', err);
    } finally {
      setIsExecutingTask(false);
      setTaskInput('');
    }
  };

  // External trigger from Voice or Chat
  useEffect(() => {
    if (!externalTaskTrigger) return;
    const { agentId, task } = externalTaskTrigger;
    const lower = task.toLowerCase();

    if (agentId === 'all' || lower.includes('meeting') || lower.includes('sab') || lower.includes('conference')) {
      triggerMeeting();
    } else if (agentId === 'carol' || lower.includes('water') || lower.includes('data')) {
      handleSelectAgent('carol');
      handleExecuteAgentTask(task);
    } else if (agentId === 'bob' || lower.includes('firewall') || lower.includes('security')) {
      handleSelectAgent('bob');
      handleExecuteAgentTask(task);
    } else if (agentId === 'dave' || lower.includes('server') || lower.includes('cloud')) {
      handleSelectAgent('dave');
      handleExecuteAgentTask(task);
    } else if (agentId === 'alice' || lower.includes('briefing') || lower.includes('intel')) {
      handleSelectAgent('alice');
      handleExecuteAgentTask(task);
    }
  }, [externalTaskTrigger]);

  const triggerMeeting = () => {
    setMeetingActive(true);
    setActiveNotification('ALL-HANDS MEETING: Alice, Bob, Carol te Dave conference table te ikathay ho gaye hin.');
    speakText('All-Hands meeting shuru ho gayi hai jani! Chaaroon agents conference table te briefing wastey hazir hin.');
    setAgents((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((k) => {
        next[k] = {
          ...next[k],
          status: 'meeting',
          taskTag: 'In Meeting',
        };
      });
      return next;
    });

    setTimeout(() => {
      setActiveNotification('Whiteboard te strategy briefing chal rahi hai.');
    }, 4000);
  };

  const endMeeting = () => {
    setMeetingActive(false);
    setActiveNotification('Saare agents wapis apni workstations te chalay gaye hin.');
    speakText('Saare agents wapis apni workstations te chalay gaye ne jani.');
    setAgents((prev) => ({
      ...prev,
      alice: { ...prev.alice, status: 'active', taskTag: 'Drafting Intel' },
      bob: { ...prev.bob, status: 'active', taskTag: 'Firewall Audit' },
      carol: { ...prev.carol, status: 'active', taskTag: 'Data Pipelines' },
      dave: { ...prev.dave, status: 'active', taskTag: 'Server Audit' },
    }));
  };

  const activeAgent = agents[selectedAgentId];

  return (
    <div className="relative w-full h-full flex flex-col bg-[#02070c] overflow-hidden select-none">
      {/* ================= STUDIO OFFICE VIEWPORT ================= */}
      <div className="relative flex-1 w-full h-full overflow-hidden bg-[#02070c]">
        {/* Photorealistic Office Canvas (Exact visual match from screenshot) */}
        <div className="relative w-full h-full">
          <img
            src={officeOverviewImg}
            alt="Stonic AI Corporate Agent Office"
            className="w-full h-full object-cover object-center pointer-events-none filter brightness-[0.98] contrast-[1.03]"
          />

          {/* Soft ambient vignette & twilight neon atmospheric tint */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#02070c]/50 via-transparent to-[#02070c]/20 pointer-events-none" />

          {/* ================= 1. FLOATING 3D HOLOGRAPHIC DIGITAL GLOBE ================= */}
          <div
            onClick={() => setShowGlobeModal(true)}
            className="absolute top-[28%] left-[34%] -translate-x-1/2 -translate-y-1/2 w-28 h-28 sm:w-36 sm:h-36 rounded-full cursor-pointer group flex items-center justify-center z-15"
            title="Click to inspect 3D Tactical Holographic Globe Telemetry"
          >
            {/* Outer Cyan Energy Ring */}
            <div className="absolute inset-0 rounded-full border-2 border-cyan-400/40 animate-ping opacity-30" />
            <div className="absolute inset-1.5 rounded-full border border-cyan-300/60 shadow-[0_0_25px_rgba(0,240,255,0.45)] group-hover:shadow-[0_0_40px_rgba(0,240,255,0.8)] transition-all" />

            {/* Rotating Latitude/Longitude Rings */}
            <div className="absolute inset-3 rounded-full border border-cyan-400/50 border-dashed animate-spin [animation-duration:18s]" />
            <div className="absolute inset-5 rounded-full border border-emerald-400/40 border-dotted animate-spin [animation-duration:12s] [animation-direction:reverse]" />

            {/* Orbiting Satellite Data Bead */}
            <div className="absolute w-2 h-2 rounded-full bg-cyan-200 shadow-[0_0_12px_#00f0ff] animate-ping" />

            {/* Hover Badge */}
            <div className="absolute -bottom-6 px-2 py-0.5 rounded bg-black/85 border border-cyan-400/70 text-[9px] font-mono-tech text-cyan-200 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-[0_0_12px_rgba(0,240,255,0.6)]">
              HOLO-ORBIT // SECTOR 9
            </div>
          </div>

          {/* ================= 2. STRATEGY WHITEBOARD INTERACTIVE HOTSPOT ================= */}
          <div
            onClick={() => setShowWhiteboardModal(true)}
            className="absolute top-[18%] left-[2%] w-[14%] h-[26%] cursor-pointer group rounded-lg z-15 flex items-center justify-center"
            title="Click to view Strategy Whiteboard"
          >
            <div className="absolute inset-0 border border-cyan-400/0 group-hover:border-cyan-400/70 group-hover:bg-cyan-500/10 rounded transition-all shadow-[0_0_15px_rgba(0,240,255,0.2)]" />
            <div className="px-2 py-0.5 rounded bg-black/85 border border-cyan-400/60 text-[9px] font-mono-tech text-cyan-200 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-[0_0_10px_rgba(0,240,255,0.5)]">
              STRATEGY WHITEBOARD
            </div>
          </div>

          {/* ================= 3. FOUR EXACT FLOATING HUD HOLOGRAPHIC CARDS ================= */}
          {/* Card 1: Alice (Drafting Intel) */}
          <div
            onClick={() => handleSelectAgent('alice')}
            className={`absolute top-[20%] left-[12%] sm:left-[14%] -translate-y-1/2 z-20 cursor-pointer transition-all duration-200 group ${
              selectedAgentId === 'alice' ? 'scale-105 ring-2 ring-cyan-400/90' : 'hover:scale-102'
            }`}
          >
            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[#0a1420]/85 backdrop-blur-md border border-cyan-500/40 shadow-[0_4px_20px_rgba(0,0,0,0.8),0_0_15px_rgba(0,240,255,0.25)] group-hover:border-cyan-300">
              {/* Avatar Portrait */}
              <div className="relative w-7 h-7 sm:w-8 sm:h-8 rounded overflow-hidden border border-cyan-400/60 shrink-0">
                <img src={alicePortraitImg} alt="Alice" className="w-full h-full object-cover" />
                <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-400 border border-black animate-pulse" />
              </div>

              {/* Minimal Wireframe Silhouette Icon */}
              <div className="hidden xs:flex flex-col items-center justify-center text-cyan-400/80 px-0.5">
                <div className="w-1.5 h-1.5 rounded-full border border-cyan-400/80" />
                <div className="w-3 h-3.5 border-t border-cyan-400/80 border-x rounded-t-xs" />
              </div>

              {/* Name & Task in Parentheses matching screenshot */}
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold text-white tracking-wide font-sans leading-none flex items-center gap-1.5">
                  Alice
                  {selectedAgentId === 'alice' && (
                    <span className="text-[9px] px-1 py-0.2 rounded bg-cyan-500/30 text-cyan-200 font-mono-tech">
                      ACTIVE
                    </span>
                  )}
                </span>
                <span className="text-[10px] text-cyan-300/90 font-mono-tech mt-0.5">
                  ({agents.alice.taskTag})
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Bob (Firewall Audit) */}
          <div
            onClick={() => handleSelectAgent('bob')}
            className={`absolute top-[8%] left-[38%] sm:left-[41%] -translate-y-1/2 z-20 cursor-pointer transition-all duration-200 group ${
              selectedAgentId === 'bob' ? 'scale-105 ring-2 ring-cyan-400/90' : 'hover:scale-102'
            }`}
          >
            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[#0a1420]/85 backdrop-blur-md border border-cyan-500/40 shadow-[0_4px_20px_rgba(0,0,0,0.8),0_0_15px_rgba(0,240,255,0.25)] group-hover:border-cyan-300">
              {/* Avatar Portrait */}
              <div className="relative w-7 h-7 sm:w-8 sm:h-8 rounded overflow-hidden border border-cyan-400/60 shrink-0">
                <img src={bobPortraitImg} alt="Bob" className="w-full h-full object-cover" />
                <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-400 border border-black animate-pulse" />
              </div>

              {/* Minimal Wireframe Silhouette Icon */}
              <div className="hidden xs:flex flex-col items-center justify-center text-cyan-400/80 px-0.5">
                <div className="w-1.5 h-1.5 rounded-full border border-cyan-400/80" />
                <div className="w-3 h-3.5 border-t border-cyan-400/80 border-x rounded-t-xs" />
              </div>

              {/* Name & Task */}
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold text-white tracking-wide font-sans leading-none flex items-center gap-1.5">
                  Bob
                  {selectedAgentId === 'bob' && (
                    <span className="text-[9px] px-1 py-0.2 rounded bg-cyan-500/30 text-cyan-200 font-mono-tech">
                      ACTIVE
                    </span>
                  )}
                </span>
                <span className="text-[10px] text-cyan-300/90 font-mono-tech mt-0.5">
                  ({agents.bob.taskTag})
                </span>
              </div>
            </div>
          </div>

          {/* Card 3: Carol (Data Pipelines) */}
          <div
            onClick={() => handleSelectAgent('carol')}
            className={`absolute top-[8%] left-[61%] sm:left-[64%] -translate-y-1/2 z-20 cursor-pointer transition-all duration-200 group ${
              selectedAgentId === 'carol' ? 'scale-105 ring-2 ring-cyan-400/90' : 'hover:scale-102'
            }`}
          >
            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[#0a1420]/85 backdrop-blur-md border border-cyan-500/40 shadow-[0_4px_20px_rgba(0,0,0,0.8),0_0_15px_rgba(0,240,255,0.25)] group-hover:border-cyan-300">
              {/* Avatar Portrait */}
              <div className="relative w-7 h-7 sm:w-8 sm:h-8 rounded overflow-hidden border border-cyan-400/60 shrink-0">
                <img src={carolPortraitImg} alt="Carol" className="w-full h-full object-cover" />
                <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-400 border border-black animate-pulse" />
              </div>

              {/* Minimal Wireframe Silhouette Icon */}
              <div className="hidden xs:flex flex-col items-center justify-center text-cyan-400/80 px-0.5">
                <div className="w-1.5 h-1.5 rounded-full border border-cyan-400/80" />
                <div className="w-3 h-3.5 border-t border-cyan-400/80 border-x rounded-t-xs" />
              </div>

              {/* Name & Task */}
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold text-white tracking-wide font-sans leading-none flex items-center gap-1.5">
                  Carol
                  {selectedAgentId === 'carol' && (
                    <span className="text-[9px] px-1 py-0.2 rounded bg-cyan-500/30 text-cyan-200 font-mono-tech">
                      ACTIVE
                    </span>
                  )}
                </span>
                <span className="text-[10px] text-cyan-300/90 font-mono-tech mt-0.5">
                  ({agents.carol.taskTag})
                </span>
              </div>
            </div>
          </div>

          {/* Card 4: Dave (Server Audit) */}
          <div
            onClick={() => handleSelectAgent('dave')}
            className={`absolute top-[10%] left-[82%] sm:left-[84%] -translate-y-1/2 z-20 cursor-pointer transition-all duration-200 group ${
              selectedAgentId === 'dave' ? 'scale-105 ring-2 ring-cyan-400/90' : 'hover:scale-102'
            }`}
          >
            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[#0a1420]/85 backdrop-blur-md border border-cyan-500/40 shadow-[0_4px_20px_rgba(0,0,0,0.8),0_0_15px_rgba(0,240,255,0.25)] group-hover:border-cyan-300">
              {/* Avatar Portrait */}
              <div className="relative w-7 h-7 sm:w-8 sm:h-8 rounded overflow-hidden border border-cyan-400/60 shrink-0">
                <img src={davePortraitImg} alt="Dave" className="w-full h-full object-cover" />
                <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-400 border border-black animate-pulse" />
              </div>

              {/* Minimal Wireframe Silhouette Icon */}
              <div className="hidden xs:flex flex-col items-center justify-center text-cyan-400/80 px-0.5">
                <div className="w-1.5 h-1.5 rounded-full border border-cyan-400/80" />
                <div className="w-3 h-3.5 border-t border-cyan-400/80 border-x rounded-t-xs" />
              </div>

              {/* Name & Task */}
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold text-white tracking-wide font-sans leading-none flex items-center gap-1.5">
                  Dave
                  {selectedAgentId === 'dave' && (
                    <span className="text-[9px] px-1 py-0.2 rounded bg-cyan-500/30 text-cyan-200 font-mono-tech">
                      ACTIVE
                    </span>
                  )}
                </span>
                <span className="text-[10px] text-cyan-300/90 font-mono-tech mt-0.5">
                  ({agents.dave.taskTag})
                </span>
              </div>
            </div>
          </div>

          {/* ================= 4. REAL-TIME INTERACTIVE CURVED SCREEN OVERLAYS ================= */}
          {/* Alice's Monitor Overlay (Foreground Left) */}
          <div
            onClick={() => {
              handleSelectAgent('alice');
              setIsTerminalOpen(true);
            }}
            className="absolute top-[42%] left-[23%] w-[19%] h-[13%] rounded cursor-pointer group z-10 overflow-hidden border border-cyan-500/30 hover:border-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.2)] bg-black/40 flex"
            title="Alice's Curved Ultrawide Display - Click to Open Terminal"
          >
            {/* Left Screen: Scrolling Green Matrix Code */}
            <div className="w-1/2 h-full bg-[#031018]/90 p-1 font-mono-tech text-[6px] sm:text-[7px] text-emerald-400/90 overflow-hidden leading-tight border-r border-cyan-500/20">
              <div className="text-cyan-300 font-bold truncate">ORBITAL DRAFT</div>
              <div className="truncate">REC_SECTOR_9: 24.58°N</div>
              <div className="truncate">SAT_LINK: LOCKED</div>
              <div className="truncate text-amber-300">DIPLOMATIC_CABLE: SYNC</div>
              <div className="truncate animate-pulse">&gt; STATUS: DRAFTING</div>
            </div>

            {/* Right Screen: Dynamic Red/Cyan Trajectory Line Curve */}
            <div className="w-1/2 h-full bg-[#051522]/90 p-1 flex flex-col justify-between overflow-hidden relative">
              <div className="text-[6px] sm:text-[7px] font-mono-tech text-cyan-300 font-bold">THREAT RADAR</div>
              <svg className="w-full h-8" viewBox="0 0 100 40">
                <path
                  d="M 5,35 Q 30,30 50,20 T 95,8"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="2.5"
                  className="animate-pulse"
                />
                <circle cx="95" cy="8" r="3" fill="#00f0ff" className="animate-ping" />
              </svg>
              <div className="text-[5px] text-cyan-400 font-mono-tech self-end">SCORE: 3.8</div>
            </div>
          </div>

          {/* Dave's Monitor Overlay (Foreground Right) */}
          <div
            onClick={() => {
              handleSelectAgent('dave');
              setIsTerminalOpen(true);
            }}
            className="absolute top-[35%] left-[67%] w-[18%] h-[13%] rounded cursor-pointer group z-10 overflow-hidden border border-cyan-500/30 hover:border-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.2)] bg-black/40 flex"
            title="Dave's Curved Ultrawide Display - Click to Open Terminal"
          >
            {/* Left: Server Telemetry */}
            <div className="w-1/2 h-full bg-[#031018]/90 p-1 font-mono-tech text-[6px] sm:text-[7px] text-cyan-300 overflow-hidden leading-tight border-r border-cyan-500/20">
              <div className="text-amber-300 font-bold truncate">K8S CLUSTER</div>
              <div className="truncate">PODS: 16/16 READY</div>
              <div className="truncate">CPU: 28% | MEM: 4.2G</div>
              <div className="truncate text-emerald-400">ENVOY: HEALTHY</div>
            </div>

            {/* Right: Architectural Node Matrix Grid */}
            <div className="w-1/2 h-full bg-[#051522]/90 p-1 flex flex-col justify-between overflow-hidden">
              <div className="text-[6px] sm:text-[7px] font-mono-tech text-cyan-300 font-bold">BLADE SERVERS</div>
              <div className="grid grid-cols-4 gap-0.5 my-auto">
                {Array.from({ length: 8 }).map((_, idx) => (
                  <div key={idx} className="h-2 rounded-xs bg-cyan-500/40 border border-cyan-400/60 animate-pulse" />
                ))}
              </div>
              <div className="text-[5px] text-emerald-400 font-mono-tech self-end">TEMP: 41°C</div>
            </div>
          </div>

          {/* Real-time Notification Banner */}
          {activeNotification && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 px-3.5 py-1 rounded-full bg-[#031626]/90 border border-cyan-400 text-cyan-100 text-[11px] font-mono-tech flex items-center gap-2 shadow-[0_0_20px_rgba(0,240,255,0.45)] pointer-events-none animate-bounce">
              <Sparkles className="w-3.5 h-3.5 text-cyan-300 animate-spin" />
              <span>{activeNotification}</span>
            </div>
          )}

          {/* Quick Action Dock (Bottom Bar) */}
          <div className="absolute bottom-2.5 left-2.5 right-2.5 z-25 flex flex-wrap items-center justify-between gap-2 p-1.5 rounded-lg bg-[#030d17]/90 backdrop-blur-md border border-cyan-500/30 text-xs font-mono-tech">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-cyan-200 font-bold hidden sm:inline">CURRENT AGENT:</span>
              <span className="px-2 py-0.5 rounded bg-cyan-500/20 border border-cyan-400/50 text-cyan-100 font-bold">
                {activeAgent.name.toUpperCase()} // {activeAgent.taskTag}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsTerminalOpen(!isTerminalOpen)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded border transition-colors cursor-pointer ${
                  isTerminalOpen
                    ? 'bg-emerald-500/30 border-emerald-400 text-emerald-200 shadow-[0_0_10px_#10b981]'
                    : 'bg-cyan-500/20 border-cyan-400/50 hover:bg-cyan-500/30 text-cyan-100'
                }`}
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>TERMINAL</span>
              </button>

              {meetingActive ? (
                <button
                  onClick={endMeeting}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-rose-500/20 border border-rose-400/50 text-rose-200 hover:bg-rose-500/30 cursor-pointer"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>DISMISS MEETING</span>
                </button>
              ) : (
                <button
                  onClick={triggerMeeting}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-amber-500/20 border border-amber-400/50 text-amber-200 hover:bg-amber-500/30 cursor-pointer"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>ALL-HANDS MEETING</span>
                </button>
              )}

              <button
                onClick={() => setShowWhiteboardModal(true)}
                className="hidden md:flex items-center gap-1 px-2.5 py-1 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 cursor-pointer"
              >
                <span>WHITEBOARD</span>
              </button>

              {onToggleExpand && (
                <button
                  onClick={onToggleExpand}
                  className="p-1 text-cyan-400 hover:text-cyan-200 transition-colors cursor-pointer"
                  title={isExpanded ? 'Restore' : 'Maximize'}
                >
                  {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ================= INTERACTIVE LIVE AGENT WORKSTATION TERMINAL ================= */}
      {isTerminalOpen && (
        <div className="absolute inset-x-2 bottom-12 max-h-[58%] z-40 bg-[#030d17]/95 border border-cyan-400/80 rounded-xl flex flex-col overflow-hidden shadow-[0_0_35px_rgba(0,240,255,0.3)] font-mono-tech">
          {/* Terminal Header */}
          <div className="flex items-center justify-between px-3 py-1.5 bg-[#021524] border-b border-cyan-500/30">
            <div className="flex items-center gap-2 text-xs text-cyan-200 font-bold">
              <img
                src={activeAgent.avatarImg}
                alt={activeAgent.name}
                className="w-5 h-5 rounded-full object-cover border border-cyan-400"
              />
              <span>{activeAgent.name.toUpperCase()} // LIVE WORKSTATION TERMINAL</span>
              <span className="text-[10px] text-emerald-400 ml-2">● ONLINE (GEMINI 3.8 FLASH ENGINE)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-cyan-400/80 hidden sm:inline">
                STATUS: {activeAgent.taskTag.toUpperCase()} | PROGRESS: {activeAgent.progress}%
              </span>
              <button
                onClick={() => setIsTerminalOpen(false)}
                className="text-cyan-400 hover:text-cyan-200 p-0.5 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Domain Actions */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#04192b]/80 border-b border-cyan-500/20 overflow-x-auto text-[10px]">
            <span className="text-cyan-400/70 shrink-0 font-bold">DISPATCH DIRECTIVES:</span>
            {selectedAgentId === 'bob' && (
              <>
                <button
                  onClick={() => handleExecuteAgentTask('Audit firewall port 8080 and enforce iptables drop rules')}
                  className="px-2 py-0.5 rounded bg-cyan-500/20 border border-cyan-400/40 hover:bg-cyan-500/40 text-cyan-200 cursor-pointer shrink-0"
                >
                  Firewall Port Scan
                </button>
                <button
                  onClick={() => handleExecuteAgentTask('Mitigate high-volume SYN flood attack on perimeter')}
                  className="px-2 py-0.5 rounded bg-cyan-500/20 border border-cyan-400/40 hover:bg-cyan-500/40 text-cyan-200 cursor-pointer shrink-0"
                >
                  DDoS Mitigation
                </button>
              </>
            )}
            {selectedAgentId === 'alice' && (
              <>
                <button
                  onClick={() => handleExecuteAgentTask('Compile global satellite reconnaissance report for Sector 9')}
                  className="px-2 py-0.5 rounded bg-pink-500/20 border border-pink-400/40 hover:bg-pink-500/40 text-pink-200 cursor-pointer shrink-0"
                >
                  Sector 9 Briefing
                </button>
                <button
                  onClick={() => handleExecuteAgentTask('Analyze US-China summit military telemetry')}
                  className="px-2 py-0.5 rounded bg-pink-500/20 border border-pink-400/40 hover:bg-pink-500/40 text-pink-200 cursor-pointer shrink-0"
                >
                  Summit Telemetry
                </button>
              </>
            )}
            {selectedAgentId === 'carol' && (
              <>
                <button
                  onClick={() => handleExecuteAgentTask('Run SQL validation and optimize ClickHouse sensor ingestion query')}
                  className="px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-400/40 hover:bg-emerald-500/40 text-emerald-200 cursor-pointer shrink-0"
                >
                  Optimize SQL ETL
                </button>
                <button
                  onClick={() => handleExecuteAgentTask('Check Kafka streaming buffer and reduce consumer lag')}
                  className="px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-400/40 hover:bg-emerald-500/40 text-emerald-200 cursor-pointer shrink-0"
                >
                  Buffer Health
                </button>
              </>
            )}
            {selectedAgentId === 'dave' && (
              <>
                <button
                  onClick={() => handleExecuteAgentTask('Deploy Kubernetes ingress proxy with Cilium eBPF mesh')}
                  className="px-2 py-0.5 rounded bg-amber-500/20 border border-amber-400/40 hover:bg-amber-500/40 text-amber-200 cursor-pointer shrink-0"
                >
                  Deploy K8s Proxy
                </button>
                <button
                  onClick={() => handleExecuteAgentTask('Check Docker container health and restart failing pods')}
                  className="px-2 py-0.5 rounded bg-amber-500/20 border border-amber-400/40 hover:bg-amber-500/40 text-amber-200 cursor-pointer shrink-0"
                >
                  Pod Health Check
                </button>
              </>
            )}
          </div>

          {/* Real Live Console Logs */}
          <div className="flex-1 p-3 overflow-y-auto space-y-1 text-[11px] leading-relaxed bg-[#020b12] max-h-48">
            {activeAgent.terminalLogs.map((log, i) => (
              <div key={i} className="text-cyan-200/90 font-mono">
                {log.startsWith('[') ? (
                  <span className="text-cyan-400 font-bold">{log.slice(0, log.indexOf(']') + 1)}</span>
                ) : null}
                <span className="ml-1">{log.startsWith('[') ? log.slice(log.indexOf(']') + 1) : log}</span>
              </div>
            ))}
            {isExecutingTask && (
              <div className="flex items-center gap-2 text-cyan-300 font-bold animate-pulse pt-1">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Executing directive via Stonic Neural Engine...</span>
              </div>
            )}
          </div>

          {/* Directive Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleExecuteAgentTask();
            }}
            className="flex items-center gap-2 p-2 bg-[#021524] border-t border-cyan-500/30"
          >
            <input
              type="text"
              value={taskInput}
              onChange={(e) => setTaskInput(e.target.value)}
              placeholder={`Assign custom task to ${activeAgent.name} (English, Urdu, or Roman Urdu)...`}
              disabled={isExecutingTask}
              className="flex-1 px-3 py-1.5 rounded bg-[#010810] border border-cyan-500/40 text-cyan-100 text-xs focus:outline-none focus:border-cyan-300"
            />
            <button
              type="submit"
              disabled={isExecutingTask || !taskInput.trim()}
              className="flex items-center gap-1 px-3 py-1.5 rounded bg-cyan-500/30 border border-cyan-400 text-cyan-100 text-xs font-bold hover:bg-cyan-500/50 cursor-pointer disabled:opacity-40"
            >
              <Send className="w-3.5 h-3.5" />
              <span>DISPATCH</span>
            </button>
          </form>
        </div>
      )}

      {/* ================= STRATEGY WHITEBOARD MODAL ================= */}
      {showWhiteboardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-2xl bg-[#031320] border border-cyan-400/80 rounded-xl overflow-hidden shadow-[0_0_40px_rgba(0,240,255,0.3)]">
            <div className="flex items-center justify-between px-4 py-2.5 bg-[#020d17] border-b border-cyan-500/30">
              <div className="flex items-center gap-2 text-cyan-200 font-bold font-mono-tech">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                <span>OFFICE STRATEGY WHITEBOARD // Q3 EXECUTION</span>
              </div>
              <button
                onClick={() => setShowWhiteboardModal(false)}
                className="text-cyan-400 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 bg-slate-900/60 font-mono-tech space-y-4">
              <div className="border border-cyan-500/40 rounded-lg p-4 bg-[#051827]">
                <h3 className="text-emerald-400 font-bold text-sm mb-2">&gt; MISSION OBJECTIVE:</h3>
                <p className="text-cyan-100 text-xs leading-relaxed">
                  Autonomous sci-fi desktop intelligence orchestration across 4 specialized nodes:
                  Alice (Dossiers), Bob (Firewalls), Carol (Data Streams), and Dave (Cloud Infrastructure).
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded bg-[#02101a] border border-cyan-500/20">
                  <div className="text-cyan-400 font-bold mb-1">ALICE // DRAFTING INTEL</div>
                  <div className="text-slate-300 text-[11px]">Real-time diplomatic analysis, Sector 9 satellite telemetry locked.</div>
                </div>
                <div className="p-3 rounded bg-[#02101a] border border-cyan-500/20">
                  <div className="text-cyan-400 font-bold mb-1">BOB // FIREWALL AUDIT</div>
                  <div className="text-slate-300 text-[11px]">Strict TLS 1.3 transport, Snort intrusion detection active.</div>
                </div>
                <div className="p-3 rounded bg-[#02101a] border border-cyan-500/20">
                  <div className="text-cyan-400 font-bold mb-1">CAROL // DATA PIPELINES</div>
                  <div className="text-slate-300 text-[11px]">1.48M events/sec Kafka stream, ClickHouse partitioned rollups.</div>
                </div>
                <div className="p-3 rounded bg-[#02101a] border border-cyan-500/20">
                  <div className="text-cyan-400 font-bold mb-1">DAVE // SERVER AUDIT</div>
                  <div className="text-slate-300 text-[11px]">16 microservices reporting healthy, temperature 41°C.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= 3D HOLOGRAPHIC GLOBE MODAL ================= */}
      {showGlobeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-xl bg-[#031320] border border-cyan-400/80 rounded-xl overflow-hidden shadow-[0_0_40px_rgba(0,240,255,0.3)]">
            <div className="flex items-center justify-between px-4 py-2.5 bg-[#020d17] border-b border-cyan-500/30">
              <div className="flex items-center gap-2 text-cyan-200 font-bold font-mono-tech">
                <Globe className="w-4 h-4 text-cyan-400 animate-spin" />
                <span>3D TACTICAL HOLOGRAPHIC GLOBE // ORBITAL TELEMETRY</span>
              </div>
              <button
                onClick={() => setShowGlobeModal(false)}
                className="text-cyan-400 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 font-mono-tech text-xs text-cyan-100 space-y-3">
              <div className="flex justify-between p-2 rounded bg-[#020f1c] border border-cyan-500/20">
                <span>ORBITAL INCLINATION:</span>
                <span className="text-emerald-400 font-bold">51.64° PROGRADE</span>
              </div>
              <div className="flex justify-between p-2 rounded bg-[#020f1c] border border-cyan-500/20">
                <span>ACTIVE GEO-SATELLITES:</span>
                <span className="text-cyan-300 font-bold">14 LOCKED</span>
              </div>
              <div className="flex justify-between p-2 rounded bg-[#020f1c] border border-cyan-500/20">
                <span>SECTOR 9 SURVEILLANCE:</span>
                <span className="text-amber-400 font-bold">OPTIMAL RECONNAISSANCE</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
