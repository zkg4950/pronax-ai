import React, { useState, useEffect, useRef } from 'react';
import {
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
  Radio,
  CheckCircle2,
  Sparkles,
  LayoutGrid,
  Columns,
} from 'lucide-react';
import { AgentInfo } from '../types';

import alicePortraitImg from '../assets/images/alice_portrait.jpg';
import bobPortraitImg from '../assets/images/bob_portrait.jpg';
import carolPortraitImg from '../assets/images/carol_portrait.jpg';
import davePortraitImg from '../assets/images/dave_portrait.jpg';

interface AgentWorkspaceDeckProps {
  onSelectAgent?: (agent: AgentInfo) => void;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  externalTaskTrigger?: { agentId: string; task: string } | null;
}

interface WorkspaceAgent {
  id: string;
  name: string;
  role: string;
  statusTag: string;
  taskDescription: string;
  avatarImg: string;
  accentColor: string;
  progress: number;
  metrics: { label: string; value: string; color?: string }[];
  terminalLogs: string[];
  quickTasks: string[];
}

export const AgentWorkspaceDeck: React.FC<AgentWorkspaceDeckProps> = ({
  onSelectAgent,
  isExpanded = false,
  onToggleExpand,
  externalTaskTrigger,
}) => {
  const [selectedAgentId, setSelectedAgentId] = useState<string>('alice');
  const [viewLayout, setViewLayout] = useState<'grid' | 'focus'>('grid');
  const [taskInputs, setTaskInputs] = useState<Record<string, string>>({
    alice: '',
    bob: '',
    carol: '',
    dave: '',
  });
  const [executingAgent, setExecutingAgent] = useState<string | null>(null);
  const [activeNotification, setActiveNotification] = useState<string | null>(null);
  const [tick, setTick] = useState<number>(0);

  // 4 Ultra-High-Definition Agent Workspaces
  const [agents, setAgents] = useState<Record<string, WorkspaceAgent>>({
    alice: {
      id: 'alice',
      name: 'Alice',
      role: 'Lead Intelligence Analyst',
      statusTag: 'Drafting Intel',
      taskDescription: 'Synthesizing global satellite telemetry and Sector 9 diplomatic cables',
      avatarImg: alicePortraitImg,
      accentColor: '#f472b6',
      progress: 88,
      metrics: [
        { label: 'ORBIT LOCK', value: 'SECTOR 9', color: 'text-cyan-300' },
        { label: 'SAT-LINKS', value: '14 ACTIVE', color: 'text-emerald-400' },
        { label: 'THREAT', value: '3.8 NORMAL', color: 'text-amber-400' },
      ],
      terminalLogs: [
        '[ALICE-INTEL] Locked orbital reconnaissance vector on Sector 9',
        '[ALICE-INTEL] Ingested 18 diplomatic satellite transcripts',
        '[ALICE-INTEL] Geopolitical threat score: 3.8 / Readiness Optimal',
        '[ALICE-INTEL] Generating strategic executive briefing dossier',
      ],
      quickTasks: [
        'Sector 9 Reconnaissance',
        'US-China Summit Telemetry',
        'Diplomatic Threat Audit',
      ],
    },
    bob: {
      id: 'bob',
      name: 'Bob',
      role: 'Senior Cyber Security Engineer',
      statusTag: 'Firewall Audit',
      taskDescription: 'Enforcing perimeter zero-trust architecture & TLS 1.3 packet inspection',
      avatarImg: bobPortraitImg,
      accentColor: '#38bdf8',
      progress: 94,
      metrics: [
        { label: 'TLS ENFORCE', value: 'TLS 1.3 STRICT', color: 'text-emerald-400' },
        { label: 'INTRUSIONS', value: '0 DETECTED', color: 'text-cyan-300' },
        { label: 'SNORT IDS', value: 'HARDENED', color: 'text-emerald-400' },
      ],
      terminalLogs: [
        '[BOB-SEC] Scanning external subnet 192.168.1.0/24 via nmap',
        '[BOB-SEC] Port 443 TLS 1.3 strict transport active & verified',
        '[BOB-SEC] Snort IDS state: ZERO unauthorized penetration attempts',
        '[BOB-SEC] Core firewall iptables rate-limiting applied',
      ],
      quickTasks: [
        'Firewall Port 8080 Scan',
        'DDoS SYN-Flood Defense',
        'Zero-Trust Token Check',
      ],
    },
    carol: {
      id: 'carol',
      name: 'Carol',
      role: 'Data Pipeline Specialist',
      statusTag: 'Data Pipelines',
      taskDescription: 'Streaming low-latency Kafka sensor buffers & ClickHouse aggregation',
      avatarImg: carolPortraitImg,
      accentColor: '#34d399',
      progress: 79,
      metrics: [
        { label: 'THROUGHPUT', value: '1.48M EV/S', color: 'text-emerald-400' },
        { label: 'LATENCY', value: '7.2ms', color: 'text-cyan-300' },
        { label: 'CLICKHOUSE', value: 'SYNCED', color: 'text-amber-400' },
      ],
      terminalLogs: [
        '[CAROL-ETL] Kafka topic telemetry.sensor_stream healthy',
        '[CAROL-ETL] Ingestion throughput: 1.48M events/sec (latency 7.2ms)',
        '[CAROL-ETL] ClickHouse columnar partition synchronized',
        '[CAROL-ETL] Running aggregate rollup job for 10-minute buckets',
      ],
      quickTasks: [
        'Optimize SQL ETL',
        'Kafka Buffer Flush',
        'ClickHouse Index Check',
      ],
    },
    dave: {
      id: 'dave',
      name: 'Dave',
      role: 'Cloud DevOps Architect',
      statusTag: 'Server Audit',
      taskDescription: 'Auditing high-density server blades & Cilium eBPF Kubernetes proxy',
      avatarImg: davePortraitImg,
      accentColor: '#fbbf24',
      progress: 72,
      metrics: [
        { label: 'K8S PODS', value: '16/16 READY', color: 'text-emerald-400' },
        { label: 'CPU LOAD', value: '28.4%', color: 'text-cyan-300' },
        { label: 'THERMALS', value: '41°C NOMINAL', color: 'text-emerald-400' },
      ],
      terminalLogs: [
        '[DAVE-OPS] Kubernetes cluster stonic-prod-us nodes: READY',
        '[DAVE-OPS] Envoy proxy sidecars running across 16 microservices',
        '[DAVE-OPS] Blade server thermals: 41°C / Normal Operating Range',
        '[DAVE-OPS] Cluster autoscaler configured; 0 memory pressure',
      ],
      quickTasks: [
        'Deploy K8s Proxy',
        'Check Pod Health',
        'Autoscaler Rebalance',
      ],
    },
  });

  // Continuous live tick for oscillating telemetry curves
  useEffect(() => {
    let animationId: number;
    const updateTick = () => {
      setTick((prev) => prev + 0.05);
      animationId = requestAnimationFrame(updateTick);
    };
    animationId = requestAnimationFrame(updateTick);
    return () => cancelAnimationFrame(animationId);
  }, []);

  const speakText = (text: string) => {
    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.05;
        utterance.pitch = 1.0;
        window.speechSynthesis.speak(utterance);
      }
    } catch {
      // Ignore if speech is restricted
    }
  };

  const handleSelectAgent = (agentId: string) => {
    setSelectedAgentId(agentId);
    const agent = agents[agentId];
    if (onSelectAgent && agent) {
      onSelectAgent({
        id: agent.id,
        name: agent.name,
        role: agent.role,
        status: 'active',
        task: agent.taskDescription,
      });
    }

    if (agentId === 'alice') {
      speakText('Agent Alice reporting. Drafting intelligence dossier.');
    } else if (agentId === 'bob') {
      speakText('Agent Bob online. Zero-trust firewall audit running.');
    } else if (agentId === 'carol') {
      speakText('Agent Carol active. Real-time data pipeline streaming.');
    } else if (agentId === 'dave') {
      speakText('Agent Dave on deck. High-density server cluster operational.');
    }
  };

  // Direct Execution of Real Agent Task via Backend Gemini API
  const handleExecuteAgentTask = async (agentId: string, customInstruction?: string) => {
    const inputVal = customInstruction || taskInputs[agentId]?.trim();
    if (!inputVal || executingAgent) return;

    setExecutingAgent(agentId);
    const agent = agents[agentId];
    speakText(`Agent ${agent.name} executing directive: ${inputVal}.`);
    setActiveNotification(`${agent.name}: "${inputVal.slice(0, 36)}..."`);

    try {
      const res = await fetch('/api/admin/agent-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId,
          instruction: inputVal,
          context: {
            currentTask: agent.taskDescription,
            officeState: 'operational',
          },
        }),
      });

      const data = await res.json();
      if (data && data.output) {
        setAgents((prev) => {
          const target = { ...prev[agentId] };
          target.taskDescription = inputVal;
          target.statusTag = 'Task Complete';
          target.progress = 100;
          target.terminalLogs = [
            ...target.terminalLogs,
            `[${new Date().toLocaleTimeString()}] EXECUTED: ${inputVal}`,
            ...data.output.split('\n').filter((l: string) => l.trim().length > 0).slice(0, 5),
          ];
          return { ...prev, [agentId]: target };
        });

        speakText(`Agent ${agent.name} has completed the directive successfully.`);
        setActiveNotification(`${agent.name} completed directive.`);
      }
    } catch (err) {
      console.warn('Agent task error:', err);
    } finally {
      setExecutingAgent(null);
      setTaskInputs((prev) => ({ ...prev, [agentId]: '' }));
    }
  };

  // External Task Trigger from Voice or Chat
  useEffect(() => {
    if (!externalTaskTrigger) return;
    const { agentId, task } = externalTaskTrigger;
    const lower = task.toLowerCase();

    if (agentId === 'all' || lower.includes('meeting') || lower.includes('sab')) {
      setActiveNotification('ALL-HANDS MEETING: Alice, Bob, Carol, and Dave synchronized.');
      speakText('All-Hands Meeting engaged, Sir. Synchronizing all executive agents.');
    } else if (agentId === 'carol' || lower.includes('data') || lower.includes('pipeline')) {
      handleSelectAgent('carol');
      handleExecuteAgentTask('carol', task);
    } else if (agentId === 'bob' || lower.includes('firewall') || lower.includes('security')) {
      handleSelectAgent('bob');
      handleExecuteAgentTask('bob', task);
    } else if (agentId === 'dave' || lower.includes('server') || lower.includes('cloud')) {
      handleSelectAgent('dave');
      handleExecuteAgentTask('dave', task);
    } else if (agentId === 'alice' || lower.includes('intel') || lower.includes('briefing')) {
      handleSelectAgent('alice');
      handleExecuteAgentTask('alice', task);
    }
  }, [externalTaskTrigger]);

  const focusedAgent = agents[selectedAgentId];

  return (
    <div className="relative w-full h-full flex flex-col bg-[#02070d] text-slate-100 overflow-hidden select-none border border-cyan-500/25">
      {/* ================= TOP COMMAND BAR ================= */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#03111e]/95 border-b border-cyan-500/20 shrink-0 z-20">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#00f0ff] animate-pulse" />
          <span className="font-mono-tech text-xs font-bold tracking-[0.2em] text-cyan-200">
            EXECUTIVE AGENT WORKSPACES
          </span>
          <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 text-[9px] font-mono-tech font-bold hidden sm:inline">
            4 NODES ONLINE
          </span>
        </div>

        {/* Center: Agent Fast Tabs */}
        <div className="flex items-center gap-1 bg-[#010912] p-0.5 rounded border border-cyan-500/30">
          {Object.values(agents).map((ag) => {
            const isSel = selectedAgentId === ag.id;
            return (
              <button
                key={ag.id}
                onClick={() => handleSelectAgent(ag.id)}
                className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono-tech transition-all cursor-pointer ${
                  isSel
                    ? 'bg-cyan-500/30 border border-cyan-400 text-cyan-100 font-bold shadow-[0_0_8px_rgba(0,240,255,0.4)]'
                    : 'text-cyan-400/80 hover:text-cyan-200'
                }`}
              >
                <img
                  src={ag.avatarImg}
                  alt={ag.name}
                  className="w-3.5 h-3.5 rounded-full object-cover border border-cyan-400/60"
                />
                <span>{ag.name}</span>
              </button>
            );
          })}
        </div>

        {/* View Layout Switcher (Grid vs Focus) */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-0.5 bg-[#010912] p-0.5 rounded border border-cyan-500/30 text-[9px] font-mono-tech">
            <button
              onClick={() => setViewLayout('grid')}
              className={`flex items-center gap-1 px-2 py-0.5 rounded transition-colors cursor-pointer ${
                viewLayout === 'grid'
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'text-cyan-400 hover:text-cyan-200'
              }`}
              title="Show all 4 agent workspaces in widescreen matrix"
            >
              <LayoutGrid className="w-3 h-3" />
              <span className="hidden md:inline">QUAD MATRIX</span>
            </button>
            <button
              onClick={() => setViewLayout('focus')}
              className={`flex items-center gap-1 px-2 py-0.5 rounded transition-colors cursor-pointer ${
                viewLayout === 'focus'
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'text-cyan-400 hover:text-cyan-200'
              }`}
              title="Show focused widescreen console for selected agent"
            >
              <Columns className="w-3 h-3" />
              <span className="hidden md:inline">FOCUS STATION</span>
            </button>
          </div>

          {onToggleExpand && (
            <button
              onClick={onToggleExpand}
              className="p-1 hover:text-cyan-200 text-cyan-400 transition-colors cursor-pointer"
              title={isExpanded ? 'Restore' : 'Maximize'}
            >
              {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
      </div>

      {/* Real-time Notification Banner */}
      {activeNotification && (
        <div className="absolute top-10 left-1/2 -translate-x-1/2 z-30 px-3.5 py-1 rounded-full bg-[#031524]/95 border border-cyan-400 text-cyan-100 text-[11px] font-mono-tech flex items-center gap-2 shadow-[0_0_20px_rgba(0,240,255,0.45)] pointer-events-none animate-bounce">
          <Sparkles className="w-3 h-3 text-cyan-300 animate-spin" />
          <span>{activeNotification}</span>
        </div>
      )}

      {/* ================= WORKSPACE CONTENT ================= */}
      <div className="flex-1 w-full min-h-0 overflow-y-auto p-2 scrollbar-none bg-gradient-to-b from-[#02070d] via-[#030e1a] to-[#02070d]">
        {viewLayout === 'grid' ? (
          /* ================= 4-AGENT QUAD SPLIT MATRIX ================= */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5 h-full">
            {Object.values(agents).map((agent) => {
              const isSelected = selectedAgentId === agent.id;
              const isBusy = executingAgent === agent.id;

              return (
                <div
                  key={agent.id}
                  onClick={() => handleSelectAgent(agent.id)}
                  className={`relative rounded-xl border flex flex-col justify-between p-2.5 transition-all duration-200 cursor-pointer overflow-hidden ${
                    isSelected
                      ? 'bg-[#041524]/95 border-cyan-400 shadow-[0_0_25px_rgba(0,240,255,0.25)] ring-1 ring-cyan-400/50'
                      : 'bg-[#030d17]/90 border-cyan-500/25 hover:border-cyan-400/60 hover:bg-[#041322]'
                  }`}
                >
                  {/* Subtle Top Ambient Gradient */}
                  <div
                    className="absolute top-0 left-0 right-0 h-1"
                    style={{ backgroundColor: agent.accentColor }}
                  />

                  {/* 1. AGENT EXECUTIVE HEADER */}
                  <div className="flex items-start justify-between gap-2.5 pb-2 border-b border-cyan-500/20">
                    <div className="flex items-center gap-2.5">
                      {/* High-Definition Executive Portrait */}
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-cyan-400/60 shrink-0 shadow-[0_0_12px_rgba(0,240,255,0.2)]">
                        <img
                          src={agent.avatarImg}
                          alt={agent.name}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-1 right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-black animate-pulse" />
                      </div>

                      <div className="flex flex-col text-left">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white tracking-wide font-sans leading-tight">
                            {agent.name}
                          </span>
                          <span className="px-1.5 py-0.2 rounded bg-cyan-500/20 border border-cyan-400/40 text-[9px] font-mono-tech text-cyan-200">
                            {agent.statusTag}
                          </span>
                        </div>
                        <span className="text-[11px] text-cyan-300 font-mono-tech">
                          {agent.role}
                        </span>
                        <span className="text-[10px] text-slate-300/80 truncate max-w-[240px] sm:max-w-[320px]">
                          {agent.taskDescription}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar & Audio Trigger */}
                    <div className="flex flex-col items-end gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          speakText(`Agent ${agent.name} status: ${agent.taskDescription}.`);
                        }}
                        className="p-1 rounded bg-cyan-500/10 hover:bg-cyan-500/30 text-cyan-300 cursor-pointer"
                        title="Voice Audio Status"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                      <div className="text-[9px] font-mono-tech text-emerald-400 font-bold">
                        {agent.progress}% DONE
                      </div>
                    </div>
                  </div>

                  {/* 2. LIVE COMPUTER SCREEN VIEWPORT (DUAL MONITOR DISPLAY) */}
                  <div className="my-2 grid grid-cols-1 sm:grid-cols-2 gap-1.5 rounded-lg overflow-hidden border border-cyan-500/30 bg-[#010811] p-1.5 shadow-inner">
                    {/* Left Pane: Glowing Monospace Terminal Code Stream */}
                    <div className="h-28 bg-[#020b13] rounded p-1.5 flex flex-col justify-between overflow-hidden border border-cyan-500/20 font-mono-tech text-[9px] leading-tight">
                      <div className="flex items-center justify-between text-[8px] text-cyan-400 font-bold border-b border-cyan-500/20 pb-0.5">
                        <span className="flex items-center gap-1">
                          <Terminal className="w-2.5 h-2.5 text-cyan-300" />
                          <span>SYS_STREAM.LOG</span>
                        </span>
                        <span className="text-emerald-400">ACTIVE</span>
                      </div>

                      <div className="space-y-0.5 my-auto overflow-hidden">
                        {agent.terminalLogs.slice(-3).map((line, idx) => (
                          <div key={idx} className="truncate text-cyan-200/90">
                            <span className="text-cyan-400">&gt;</span> {line}
                          </div>
                        ))}
                        <div className="text-emerald-300 truncate">
                          <span className="text-cyan-400">&gt;</span> INGEST_CHUNK_{Math.floor(tick * 5) % 99}: NOMINAL
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[7.5px] text-slate-400 pt-0.5 border-t border-cyan-500/20">
                        <span>CPU: 24% | RAM: 3.4GB</span>
                        <span className="text-cyan-300 animate-pulse">● STREAMING</span>
                      </div>
                    </div>

                    {/* Right Pane: Live Streaming Telemetry Vector Graph */}
                    <div className="h-28 bg-[#020d18] rounded p-1.5 flex flex-col justify-between overflow-hidden border border-cyan-500/20 font-mono-tech">
                      <div className="flex items-center justify-between text-[8px] text-amber-300 font-bold border-b border-cyan-500/20 pb-0.5">
                        <span className="flex items-center gap-1">
                          <Activity className="w-2.5 h-2.5 text-amber-400" />
                          <span>TELEMETRY OSCILLATION</span>
                        </span>
                        <span className="text-cyan-300">6.4ms</span>
                      </div>

                      {/* Animated SVG Spline Curve */}
                      <svg className="w-full h-14 my-auto" viewBox="0 0 200 60">
                        {/* Background Grid */}
                        <line x1="0" y1="30" x2="200" y2="30" stroke="rgba(0, 240, 255, 0.15)" strokeWidth="1" strokeDasharray="4 2" />
                        <line x1="100" y1="0" x2="100" y2="60" stroke="rgba(0, 240, 255, 0.15)" strokeWidth="1" strokeDasharray="4 2" />

                        {/* Oscillating Spline Path */}
                        <path
                          d={`M 0,${30 + Math.sin(tick * 3) * 12} 
                             Q 50,${30 + Math.sin(tick * 3 + 1) * 18} 100,${30 + Math.cos(tick * 2) * 14} 
                             T 200,${30 + Math.sin(tick * 3 + 2) * 16}`}
                          fill="none"
                          stroke={agent.accentColor}
                          strokeWidth="2.5"
                        />

                        {/* Live Blip Point */}
                        <circle
                          cx="180"
                          cy={30 + Math.sin(tick * 3 + 1.8) * 15}
                          r="3"
                          fill="#ffffff"
                          className="animate-ping"
                        />
                      </svg>

                      {/* Metric Badges */}
                      <div className="flex items-center justify-between text-[8px] text-cyan-300">
                        {agent.metrics.map((m, mIdx) => (
                          <div key={mIdx} className="flex flex-col items-center">
                            <span className="text-[7px] text-slate-400">{m.label}</span>
                            <span className={`font-bold ${m.color || 'text-cyan-200'}`}>{m.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 3. QUICK ACTION DIRECTIVES & TASK INPUT */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center gap-1 overflow-x-auto scrollbar-none text-[8.5px] font-mono-tech">
                      <span className="text-cyan-400/80 font-bold shrink-0">EXEC:</span>
                      {agent.quickTasks.map((q, qIdx) => (
                        <button
                          key={qIdx}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleExecuteAgentTask(agent.id, q);
                          }}
                          disabled={isBusy}
                          className="px-2 py-0.5 rounded bg-cyan-500/15 border border-cyan-400/35 hover:bg-cyan-500/30 text-cyan-200 cursor-pointer shrink-0 disabled:opacity-40"
                        >
                          {q}
                        </button>
                      ))}
                    </div>

                    {/* Instant Directive Input Form */}
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleExecuteAgentTask(agent.id);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1.5 pt-0.5"
                    >
                      <input
                        type="text"
                        value={taskInputs[agent.id] || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setTaskInputs((prev) => ({ ...prev, [agent.id]: val }));
                        }}
                        placeholder={`Assign task to ${agent.name}...`}
                        disabled={isBusy}
                        className="flex-1 px-2.5 py-1 rounded bg-[#010912] border border-cyan-500/35 text-cyan-100 text-[10px] font-mono-tech focus:outline-none focus:border-cyan-300"
                      />
                      <button
                        type="submit"
                        disabled={isBusy || !taskInputs[agent.id]?.trim()}
                        className="flex items-center gap-1 px-2.5 py-1 rounded bg-cyan-500/30 border border-cyan-400 text-cyan-100 text-[10px] font-mono-tech font-bold hover:bg-cyan-500/50 cursor-pointer disabled:opacity-40"
                      >
                        {isBusy ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                        <span>DISPATCH</span>
                      </button>
                    </form>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* ================= FOCUSED WIDESCREEN WORKSTATION ================= */
          <div className="h-full flex flex-col justify-between p-3 rounded-xl border border-cyan-400 bg-[#031322] shadow-[0_0_30px_rgba(0,240,255,0.2)]">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-cyan-500/30">
              <div className="flex items-center gap-3">
                <img
                  src={focusedAgent.avatarImg}
                  alt={focusedAgent.name}
                  className="w-16 h-16 rounded-xl object-cover border-2 border-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.4)]"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-white font-sans">{focusedAgent.name}</span>
                    <span className="px-2 py-0.5 rounded bg-cyan-500/20 border border-cyan-400 text-xs font-mono-tech text-cyan-200">
                      {focusedAgent.statusTag}
                    </span>
                  </div>
                  <div className="text-sm font-mono-tech text-cyan-300">{focusedAgent.role}</div>
                  <div className="text-xs text-slate-300 mt-0.5">{focusedAgent.taskDescription}</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => speakText(`Agent ${focusedAgent.name} operational. ${focusedAgent.taskDescription}.`)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded bg-cyan-500/20 border border-cyan-400/50 text-cyan-200 hover:bg-cyan-500/40 cursor-pointer text-xs font-mono-tech"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>VOICE REPORT</span>
                </button>
              </div>
            </div>

            {/* Widescreen Dual-Screen Viewport */}
            <div className="my-3 grid grid-cols-1 md:grid-cols-2 gap-3 flex-1 min-h-[220px]">
              {/* Screen 1: Terminal Matrix Stream */}
              <div className="bg-[#010912] rounded-xl border border-cyan-500/30 p-3 flex flex-col justify-between font-mono-tech shadow-inner">
                <div className="flex items-center justify-between border-b border-cyan-500/30 pb-1.5 text-xs text-cyan-300 font-bold">
                  <span>TERMINAL STREAM // LIVE INGESTION</span>
                  <span className="text-emerald-400">STATUS: GREEN</span>
                </div>
                <div className="space-y-1.5 my-2 overflow-y-auto text-xs text-cyan-100/90 leading-relaxed">
                  {focusedAgent.terminalLogs.map((log, idx) => (
                    <div key={idx} className="flex items-start gap-1">
                      <span className="text-cyan-400">&gt;</span>
                      <span>{log}</span>
                    </div>
                  ))}
                  <div className="flex items-center gap-1 text-emerald-400 animate-pulse">
                    <span className="text-cyan-400">&gt;</span>
                    <span>ACTIVE_STREAM_INSPECTION_TICK_{Math.floor(tick * 4)}: OK</span>
                  </div>
                </div>
                <div className="text-[10px] text-cyan-400/70 border-t border-cyan-500/20 pt-1 flex justify-between">
                  <span>MEMORY: 4.2GB | CPU: 28%</span>
                  <span>ENCRYPTED TLS 1.3</span>
                </div>
              </div>

              {/* Screen 2: High-Resolution Telemetry Vector Graph */}
              <div className="bg-[#010912] rounded-xl border border-cyan-500/30 p-3 flex flex-col justify-between font-mono-tech shadow-inner">
                <div className="flex items-center justify-between border-b border-cyan-500/30 pb-1.5 text-xs text-amber-300 font-bold">
                  <span>TACTICAL TELEMETRY VECTOR GRAPH</span>
                  <span className="text-cyan-300">REAL-TIME SYNC</span>
                </div>

                <svg className="w-full h-32 my-auto" viewBox="0 0 300 100">
                  <line x1="0" y1="50" x2="300" y2="50" stroke="rgba(0, 240, 255, 0.15)" strokeWidth="1" strokeDasharray="5 3" />
                  <line x1="150" y1="0" x2="150" y2="100" stroke="rgba(0, 240, 255, 0.15)" strokeWidth="1" strokeDasharray="5 3" />
                  <path
                    d={`M 0,${50 + Math.sin(tick * 3) * 20} 
                       Q 75,${50 + Math.sin(tick * 3 + 1) * 30} 150,${50 + Math.cos(tick * 2) * 25} 
                       T 300,${50 + Math.sin(tick * 3 + 2) * 28}`}
                    fill="none"
                    stroke={focusedAgent.accentColor}
                    strokeWidth="3.5"
                  />
                  <circle cx="270" cy={50 + Math.sin(tick * 3 + 1.8) * 26} r="4" fill="#ffffff" className="animate-ping" />
                </svg>

                <div className="grid grid-cols-3 gap-2 border-t border-cyan-500/20 pt-1.5 text-center text-xs">
                  {focusedAgent.metrics.map((m, idx) => (
                    <div key={idx} className="bg-[#02111d] p-1.5 rounded border border-cyan-500/20">
                      <div className="text-[9px] text-slate-400">{m.label}</div>
                      <div className={`font-bold ${m.color || 'text-cyan-200'}`}>{m.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Actions Form */}
            <div className="space-y-2 pt-2 border-t border-cyan-500/25">
              <div className="flex items-center gap-2 overflow-x-auto text-xs font-mono-tech">
                <span className="text-cyan-400 font-bold">QUICK DIRECTIVES:</span>
                {focusedAgent.quickTasks.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleExecuteAgentTask(focusedAgent.id, q)}
                    disabled={executingAgent === focusedAgent.id}
                    className="px-3 py-1 rounded bg-cyan-500/20 border border-cyan-400/40 hover:bg-cyan-500/40 text-cyan-100 cursor-pointer disabled:opacity-40"
                  >
                    {q}
                  </button>
                ))}
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleExecuteAgentTask(focusedAgent.id);
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={taskInputs[focusedAgent.id] || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    setTaskInputs((prev) => ({ ...prev, [focusedAgent.id]: val }));
                  }}
                  placeholder={`Assign custom operational directive to ${focusedAgent.name} (English, Urdu, or Roman Urdu)...`}
                  disabled={executingAgent === focusedAgent.id}
                  className="flex-1 px-3 py-2 rounded-lg bg-[#010912] border border-cyan-500/40 text-cyan-100 text-xs font-mono-tech focus:outline-none focus:border-cyan-300"
                />
                <button
                  type="submit"
                  disabled={executingAgent === focusedAgent.id || !taskInputs[focusedAgent.id]?.trim()}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-cyan-500/30 border border-cyan-400 text-cyan-100 text-xs font-mono-tech font-bold hover:bg-cyan-500/50 cursor-pointer disabled:opacity-40"
                >
                  {executingAgent === focusedAgent.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  <span>DISPATCH DIRECTIVE</span>
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
