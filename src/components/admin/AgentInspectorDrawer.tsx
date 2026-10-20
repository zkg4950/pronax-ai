import React, { useState } from 'react';
import {
  X,
  Terminal,
  Send,
  Loader2,
  Volume2,
  Copy,
  Check,
  Shield,
  FileText,
  Database,
  Cloud,
  Activity,
  Play,
  RotateCw,
  Cpu,
} from 'lucide-react';

interface AgentInspectorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  agentId: 'alice' | 'bob' | 'carol' | 'dave';
  agentMeta: {
    id: 'alice' | 'bob' | 'carol' | 'dave';
    name: string;
    role: string;
    statusTag: string;
    dotColor: string;
    currentTask: string;
    telemetry: string;
  };
  onDispatchDirective: (instruction: string) => Promise<void>;
  onTriggerVoice: (urduText: string, englishText: string) => void;
  onFlyToAgent: () => void;
  isExecuting: boolean;
  lastExecutionOutput?: string;
}

export const AgentInspectorDrawer: React.FC<AgentInspectorDrawerProps> = ({
  isOpen,
  onClose,
  agentId,
  agentMeta,
  onDispatchDirective,
  onTriggerVoice,
  onFlyToAgent,
  isExecuting,
  lastExecutionOutput,
}) => {
  const [inputText, setInputText] = useState('');
  const [copied, setCopied] = useState(false);
  const [activeToolRunning, setActiveToolRunning] = useState<string | null>(null);
  const [toolReport, setToolReport] = useState<any | null>(null);

  if (!isOpen) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isExecuting) return;
    const cmd = inputText.trim();
    setInputText('');
    await onDispatchDirective(cmd);
  };

  const handleRunTool = async (toolName: string) => {
    setActiveToolRunning(toolName);
    setToolReport(null);
    try {
      const res = await fetch('/api/admin/tools/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toolName,
          agentId,
          parameters: { targetSubnet: '192.168.1.0/24', cluster: 'stonic-prod-cluster' },
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setToolReport(data);
      }
    } catch (e) {
      console.warn(e);
    } finally {
      setActiveToolRunning(null);
    }
  };

  const copyLog = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getAgentToolSpec = () => {
    if (agentId === 'bob') {
      return {
        toolName: 'security_scanner',
        buttonLabel: 'Run Subnet 192.168.1.0/24 Firewall Audit',
        icon: <Shield className="w-3.5 h-3.5 text-sky-400" />,
      };
    } else if (agentId === 'carol') {
      return {
        toolName: 'data_pipeline_builder',
        buttonLabel: 'Benchmark ClickHouse & Kafka Stream (1.42M/s)',
        icon: <Database className="w-3.5 h-3.5 text-emerald-400" />,
      };
    } else if (agentId === 'dave') {
      return {
        toolName: 'k8s_deployer',
        buttonLabel: 'Probe Kubernetes 16-Pod Node Health',
        icon: <Cloud className="w-3.5 h-3.5 text-amber-400" />,
      };
    }
    return {
      toolName: 'system_status',
      buttonLabel: 'Compile Sector-9 Reconnaissance Dossier',
      icon: <FileText className="w-3.5 h-3.5 text-pink-400" />,
    };
  };

  const toolSpec = getAgentToolSpec();

  return (
    <div className="absolute top-12 right-2 bottom-12 w-96 max-w-[94vw] z-40 bg-[#020d18]/98 border border-cyan-400/80 rounded-xl flex flex-col overflow-hidden shadow-[0_0_40px_rgba(0,240,255,0.35)] font-mono-tech backdrop-blur-md animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-[#031c2e] border-b border-cyan-500/30">
        <div className="flex items-center gap-2 text-xs text-cyan-200 font-bold">
          <span
            className="w-3 h-3 rounded-full animate-pulse"
            style={{ backgroundColor: agentMeta.dotColor }}
          />
          <span className="text-white text-sm uppercase">{agentMeta.name}</span>
          <span className="text-[10px] text-cyan-400">({agentMeta.statusTag})</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onFlyToAgent}
            className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[10px] hover:bg-cyan-500/40 cursor-pointer"
            title="Focus 3D Camera on this agent"
          >
            FOCUS CAM
          </button>
          <button
            onClick={onClose}
            className="text-cyan-400 hover:text-white p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 p-3 overflow-y-auto space-y-3 text-xs leading-relaxed bg-[#010a12]">
        {/* Role & Telemetry Banner */}
        <div className="p-2.5 rounded-lg bg-[#021422] border border-cyan-500/30 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400">ASSIGNED ROLE:</span>
            <span className="text-cyan-200 font-bold">{agentMeta.role}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400">LIVE TELEMETRY:</span>
            <span className="text-emerald-300 text-[10px]">{agentMeta.telemetry}</span>
          </div>
          <div className="pt-1 border-t border-cyan-500/20 text-[11px] text-slate-300">
            <span className="text-slate-400 block text-[10px]">CURRENT DIRECTIVE:</span>
            "{agentMeta.currentTask}"
          </div>
        </div>

        {/* Quick Voice Line Button */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() =>
              onTriggerVoice(
                `Ji Janab! ${agentMeta.name} operational hey te system bilkul fit chal riha hey!`,
                `Agent ${agentMeta.name} reporting active duty status.`
              )
            }
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-[#031d33] border border-cyan-500/40 text-cyan-200 text-[11px] hover:bg-cyan-900/40 cursor-pointer font-bold"
          >
            <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>PLAY VOICE BRIEFING</span>
          </button>
        </div>

        {/* Specialized Tool Execution Button */}
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-cyan-400 block">AUTHORIZED TOOL EXECUTION:</span>
          <button
            onClick={() => handleRunTool(toolSpec.toolName)}
            disabled={activeToolRunning !== null}
            className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-cyan-500/20 border border-cyan-400 text-cyan-100 hover:bg-cyan-500/35 transition-all cursor-pointer font-bold disabled:opacity-40"
          >
            {activeToolRunning ? (
              <Loader2 className="w-4 h-4 animate-spin text-cyan-300" />
            ) : (
              toolSpec.icon
            )}
            <span className="text-[11px]">{toolSpec.buttonLabel}</span>
          </button>
        </div>

        {/* Tool Output if executed */}
        {toolReport && (
          <div className="p-2.5 rounded-lg bg-[#021a15] border border-emerald-400 text-[10px] text-emerald-100 font-mono-tech whitespace-pre-wrap">
            <div className="flex items-center justify-between pb-1 mb-1 border-b border-emerald-500/30 text-emerald-300 font-bold">
              <span>TOOL REPORT ({toolReport.executionDuration})</span>
              <button
                onClick={() => copyLog(JSON.stringify(toolReport.result, null, 2))}
                className="hover:text-white cursor-pointer"
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
            {JSON.stringify(toolReport.result, null, 2)}
          </div>
        )}

        {/* Live Execution Output from Task */}
        {lastExecutionOutput && (
          <div className="p-2.5 rounded-lg bg-[#01111d] border border-cyan-400 text-[10px] text-cyan-100 font-mono-tech whitespace-pre-wrap">
            <div className="flex items-center justify-between pb-1 mb-1 border-b border-cyan-500/30 text-cyan-300 font-bold">
              <span>LATEST TASK OUTPUT</span>
              <button
                onClick={() => copyLog(lastExecutionOutput)}
                className="hover:text-white cursor-pointer"
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
            {lastExecutionOutput}
          </div>
        )}

        {/* Loading Indicator */}
        {isExecuting && (
          <div className="flex items-center gap-2 p-2 rounded bg-cyan-950/60 border border-cyan-400 text-cyan-200 text-[11px] font-bold animate-pulse">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Agent {agentMeta.name} is computing & executing directive...</span>
          </div>
        )}
      </div>

      {/* Footer Directive Dispatch Box */}
      <form onSubmit={handleSend} className="p-2 bg-[#021524] border-t border-cyan-500/30 flex gap-1.5">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={`Directive for ${agentMeta.name} (e.g. "Check port 8080", "Generate ClickHouse query")...`}
          disabled={isExecuting}
          className="flex-1 px-3 py-1.5 rounded bg-[#010810] border border-cyan-500/40 text-cyan-100 text-xs focus:outline-none focus:border-cyan-300 font-sans"
        />
        <button
          type="submit"
          disabled={isExecuting || !inputText.trim()}
          className="px-3 py-1.5 rounded bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400 transition-all cursor-pointer disabled:opacity-40"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
