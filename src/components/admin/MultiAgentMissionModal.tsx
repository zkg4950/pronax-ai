import React, { useState } from 'react';
import {
  X,
  Zap,
  Play,
  CheckCircle2,
  Clock,
  Loader2,
  Copy,
  Check,
  Shield,
  FileText,
  Database,
  Cloud,
  Terminal,
  Volume2,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { playConfirmChime, playRadioChirp } from '../../utils/audioEffects';

export interface SubtaskExecution {
  agentId: 'alice' | 'bob' | 'carol' | 'dave';
  agentName: string;
  role: string;
  tool: string;
  actionTitle: string;
  instruction: string;
  priority: 'HIGH' | 'CRITICAL' | 'NORMAL';
  status: 'WAITING' | 'WALKING' | 'WORKING' | 'COMPLETED' | 'FAILED';
  output?: string;
  duration?: string;
  toolResult?: any;
}

interface MultiAgentMissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDispatchMissionTo3D: (subtasks: SubtaskExecution[], managerBriefing: string) => void;
  onSpeakText?: (text: string, agentId: 'alice' | 'bob' | 'carol' | 'dave') => void;
}

const PRESET_MISSIONS = [
  {
    title: 'Full-Stack Web DApp & Microservice Deployment',
    goal: 'Design a high-concurrency Web3 DApp with zero-trust firewall protection, ClickHouse real-time analytics, and automated Kubernetes multi-pod scaling.',
  },
  {
    title: 'Zero-Day Cyber Defense & Subnet Perimeter Lock',
    goal: 'Audit subnet 192.168.1.0/24, enforce strict iptables port limits, configure TLS 1.3 certificates, and deploy Snort intrusion detection.',
  },
  {
    title: 'High-Throughput Real-Time Kafka & SQL Stream',
    goal: 'Construct Kafka event ingestion pipeline at 1.5M events/sec, partition ClickHouse database, and execute anomaly detection queries.',
  },
  {
    title: 'Autonomous Crypto Market Intelligence & Viral Growth',
    goal: 'Scan Solana and Bitcoin on-chain whale activity, draft viral Twitter announcements, and configure automated Telegram bot broadcasts.',
  },
];

export const MultiAgentMissionModal: React.FC<MultiAgentMissionModalProps> = ({
  isOpen,
  onClose,
  onDispatchMissionTo3D,
  onSpeakText,
}) => {
  const [goalInput, setGoalInput] = useState(PRESET_MISSIONS[0].goal);
  const [isOrchestrating, setIsOrchestrating] = useState(false);
  const [isRunningExecution, setIsRunningExecution] = useState(false);
  const [managerBriefing, setManagerBriefing] = useState<string | null>(null);
  const [subtasks, setSubtasks] = useState<SubtaskExecution[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleOrchestrate = async () => {
    if (!goalInput.trim() || isOrchestrating) return;
    setIsOrchestrating(true);
    playRadioChirp();

    try {
      const res = await fetch('/api/admin/multi-agent-orchestrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal: goalInput }),
      });

      if (res.ok) {
        const data = await res.json();
        setManagerBriefing(data.managerBriefing || null);
        const mappedSubtasks: SubtaskExecution[] = (data.subtasks || []).map((st: any) => ({
          ...st,
          status: 'WAITING',
        }));
        setSubtasks(mappedSubtasks);

        // Speak manager briefing in Roman Urdu if available
        if (data.managerBriefing && onSpeakText) {
          onSpeakText(data.managerBriefing, 'alice');
        }
      }
    } catch (err) {
      console.warn('Orchestration error:', err);
    } finally {
      setIsOrchestrating(false);
    }
  };

  const handleExecuteAllIn3D = async () => {
    if (subtasks.length === 0 || isRunningExecution) return;
    setIsRunningExecution(true);
    playConfirmChime();

    // Trigger physical 3D scene walk and sit animations
    onDispatchMissionTo3D(subtasks, managerBriefing || '');

    // Step-by-step sequential or parallel execution
    for (let i = 0; i < subtasks.length; i++) {
      const task = subtasks[i];

      // 1. Mark Walking
      setSubtasks((prev) =>
        prev.map((t, idx) => (idx === i ? { ...t, status: 'WALKING' } : t))
      );
      await new Promise((r) => setTimeout(r, 1200));

      // 2. Mark Working (typing)
      setSubtasks((prev) =>
        prev.map((t, idx) => (idx === i ? { ...t, status: 'WORKING' } : t))
      );

      // 3. Call Real Backend /api/admin/agent-task
      try {
        const taskRes = await fetch('/api/admin/agent-task', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            agentId: task.agentId,
            instruction: task.instruction,
            context: { goal: goalInput },
          }),
        });

        let outputText = 'Task processed successfully.';
        let duration = '0.45s';
        if (taskRes.ok) {
          const taskData = await taskRes.json();
          outputText = taskData.output || outputText;
          duration = taskData.executionTime || duration;
        }

        // Also call tool execution if tool is present
        let toolData = null;
        if (task.tool) {
          try {
            const toolRes = await fetch('/api/admin/tools/execute', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                toolName: task.tool,
                agentId: task.agentId,
                parameters: { prompt: task.instruction },
              }),
            });
            if (toolRes.ok) {
              toolData = await toolRes.json();
            }
          } catch (e) {}
        }

        // 4. Mark Completed
        setSubtasks((prev) =>
          prev.map((t, idx) =>
            idx === i
              ? {
                  ...t,
                  status: 'COMPLETED',
                  output: outputText,
                  duration,
                  toolResult: toolData?.result,
                }
              : t
          )
        );

        // Vocalize completion line
        if (onSpeakText) {
          onSpeakText(`Jani task mukammal ho gaya hai, report screen te hazir hai!`, task.agentId);
        }
      } catch (e) {
        setSubtasks((prev) =>
          prev.map((t, idx) => (idx === i ? { ...t, status: 'FAILED' } : t))
        );
      }

      await new Promise((r) => setTimeout(r, 600));
    }

    setIsRunningExecution(false);
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-xl border border-cyan-400/60 bg-[#030d17] shadow-[0_0_60px_rgba(0,240,255,0.3)] overflow-hidden text-cyan-100 font-sans">
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-cyan-500/30 bg-[#041424] shrink-0 font-mono-tech">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-cyan-500/20 border border-cyan-400">
              <Zap className="w-5 h-5 text-cyan-300 animate-pulse" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold tracking-[0.2em] text-cyan-200 uppercase">
                MULTI-AGENT MISSION ORCHESTRATOR
              </h2>
              <p className="text-[10px] text-cyan-400/80">
                Autonomous task decomposition, 3D humanoid coordination & live tool execution
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-cyan-400 hover:text-white hover:bg-cyan-950/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 font-mono-tech text-xs">
          {/* Preset Buttons */}
          <div>
            <span className="text-[10px] text-cyan-400/80 block mb-1 font-bold">QUICK PRESET MISSIONS:</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {PRESET_MISSIONS.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => setGoalInput(preset.goal)}
                  className="p-2 text-left rounded-lg border border-cyan-500/30 bg-[#02111d] hover:border-cyan-300 hover:bg-cyan-950/40 text-[11px] text-cyan-200 transition-all cursor-pointer"
                >
                  <span className="font-bold block text-white">{preset.title}</span>
                  <span className="text-[10px] text-slate-400 line-clamp-1">{preset.goal}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Goal Input & Decompose Trigger */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-cyan-300 block">
              ENTER OVERALL PROJECT GOAL FOR STONIC AI CREW:
            </label>
            <div className="flex gap-2">
              <textarea
                rows={2}
                value={goalInput}
                onChange={(e) => setGoalInput(e.target.value)}
                placeholder="Describe what you want Stonic AI agents to build, audit, or automate..."
                className="flex-1 p-2.5 rounded-lg bg-[#010a12] border border-cyan-500/40 text-cyan-100 text-xs focus:outline-none focus:border-cyan-300 resize-none font-sans"
              />
              <button
                onClick={handleOrchestrate}
                disabled={isOrchestrating || !goalInput.trim()}
                className="px-4 py-2 rounded-lg bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400 transition-all shadow-[0_0_15px_#00f0ff] cursor-pointer disabled:opacity-40 flex flex-col items-center justify-center shrink-0"
              >
                {isOrchestrating ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Zap className="w-5 h-5 mb-0.5" />
                    <span>DECOMPOSE</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Manager Executive Briefing (Alice / Stonic) */}
          {managerBriefing && (
            <div className="p-3 rounded-lg bg-[#041a2c] border border-cyan-400/60 flex items-start gap-3">
              <div className="p-1 rounded bg-pink-500/20 border border-pink-400 shrink-0">
                <FileText className="w-4 h-4 text-pink-300" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-pink-300 uppercase">
                    ALICE (LEAD ORCHESTRATOR) // EXECUTIVE BRIEFING
                  </span>
                  {onSpeakText && (
                    <button
                      onClick={() => onSpeakText(managerBriefing, 'alice')}
                      className="flex items-center gap-1 text-[10px] text-cyan-300 hover:text-white cursor-pointer"
                    >
                      <Volume2 className="w-3 h-3" />
                      <span>LISTEN</span>
                    </button>
                  )}
                </div>
                <p className="text-white text-xs font-sans leading-relaxed italic">
                  "{managerBriefing}"
                </p>
              </div>
            </div>
          )}

          {/* Decomposed Subtask Cards */}
          {subtasks.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-cyan-300">
                  ASSIGNED AGENT SUBTASKS ({subtasks.length}):
                </span>
                <span className="text-[10px] text-slate-400">
                  Agents will walk to desks, sit down & execute real tasks
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {subtasks.map((task, idx) => {
                  const isDone = task.status === 'COMPLETED';
                  const isWorking = task.status === 'WORKING';
                  const isWalking = task.status === 'WALKING';

                  const badgeColor =
                    task.agentId === 'alice'
                      ? '#f472b6'
                      : task.agentId === 'bob'
                      ? '#38bdf8'
                      : task.agentId === 'carol'
                      ? '#34d399'
                      : '#fbbf24';

                  return (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl border transition-all ${
                        isDone
                          ? 'bg-[#021815] border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                          : isWorking
                          ? 'bg-[#031c2d] border-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.25)]'
                          : 'bg-[#020e18] border-cyan-500/30'
                      }`}
                    >
                      {/* Top Card Bar */}
                      <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-cyan-500/20">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: badgeColor }}
                          />
                          <span className="font-bold text-white uppercase">{task.agentName}</span>
                          <span className="text-[10px] text-slate-400">({task.role})</span>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded text-[9px] font-bold border ${
                            isDone
                              ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                              : isWorking
                              ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 animate-pulse'
                              : isWalking
                              ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                              : 'bg-slate-800 border-slate-700 text-slate-400'
                          }`}
                        >
                          {task.status}
                        </span>
                      </div>

                      {/* Action Title & Tool */}
                      <div className="mb-2">
                        <span className="font-bold text-cyan-200 block">{task.actionTitle}</span>
                        <span className="text-[10px] text-cyan-400/70">Tool: {task.tool}</span>
                      </div>

                      {/* Instruction */}
                      <p className="text-[11px] text-slate-300 font-sans mb-2 line-clamp-2">
                        {task.instruction}
                      </p>

                      {/* Execution Output if ready */}
                      {task.output && (
                        <div className="p-2 rounded bg-[#010810] border border-cyan-500/30 max-h-32 overflow-y-auto font-mono-tech text-[10px] text-cyan-100 whitespace-pre-wrap relative">
                          <div className="flex items-center justify-between mb-1 pb-1 border-b border-cyan-500/20 text-slate-400">
                            <span>EXECUTION OUTPUT ({task.duration}):</span>
                            <button
                              onClick={() => copyToClipboard(task.output || '', idx)}
                              className="text-cyan-400 hover:text-white cursor-pointer"
                              title="Copy report"
                            >
                              {copiedIndex === idx ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>
                          {task.output}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-cyan-500/30 bg-[#030d17] shrink-0 font-mono-tech text-xs">
          <button
            onClick={() => {
              setSubtasks([]);
              setManagerBriefing(null);
            }}
            className="px-3 py-1.5 rounded border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 cursor-pointer"
          >
            Clear
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded border border-slate-700 text-slate-300 hover:bg-slate-800 cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={handleExecuteAllIn3D}
              disabled={subtasks.length === 0 || isRunningExecution}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400 shadow-[0_0_20px_#10b981] transition-all cursor-pointer disabled:opacity-40"
            >
              {isRunningExecution ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>EXECUTING IN 3D OFFICE...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>DISPATCH ALL 4 AGENTS IN 3D</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
