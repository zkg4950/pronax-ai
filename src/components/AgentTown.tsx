import React, { useState } from 'react';
import { AgentInfo } from '../types';
import { AgentTown3D } from './AgentTown3D';
import {
  RefreshCw,
  LayoutGrid,
  MessageSquare,
  Maximize2,
  Minimize2,
  Box,
  Layers,
  Sparkles,
} from 'lucide-react';

interface AgentTownProps {
  onSelectAgent?: (agent: AgentInfo) => void;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  externalTaskTrigger?: { agentId: string; task: string } | null;
}

const AGENTS_LIST: AgentInfo[] = [
  {
    id: 'alice',
    name: 'Alice',
    role: 'Intelligence Dossiers',
    status: 'online',
    currentLocation: 'Workstation 1',
    task: 'Analyzing US-China military communication hotline',
    avatarColor: '#f9a8d4', // Peach/Pink
  },
  {
    id: 'bob',
    name: 'Bob',
    role: 'Cyber Perimeter',
    status: 'online',
    currentLocation: 'Espresso Bar',
    task: 'Auditing cyber penetration telemetry',
    avatarColor: '#d97706', // Brown/Amber
  },
  {
    id: 'carol',
    name: 'Carol',
    role: 'Data Pipeline',
    status: 'online',
    currentLocation: 'Hydration Station',
    task: 'Getting fresh water & data stream check',
    avatarColor: '#ec4899', // Pink
  },
  {
    id: 'dave',
    name: 'Dave',
    role: 'Cloud Orchestrator',
    status: 'online',
    currentLocation: 'Server Cluster',
    task: 'Orchestrating background container diagnostics',
    avatarColor: '#06b6d4', // Cyan
  },
];

export const AgentTown: React.FC<AgentTownProps> = ({
  onSelectAgent,
  isExpanded = false,
  onToggleExpand,
  externalTaskTrigger,
}) => {
  const [renderMode, setRenderMode] = useState<'3d_human' | 'pixel'>('3d_human');
  const [selectedAgent, setSelectedAgent] = useState<string>('alice');

  return (
    <div
      className={`relative rounded-xl border border-[#00f0ff]/30 bg-[#04121d]/95 backdrop-blur-md overflow-hidden flex flex-col shadow-[0_0_30px_rgba(0,240,255,0.06)] min-h-0 ${
        isExpanded ? 'h-full' : 'flex-1'
      }`}
    >
      {/* ================= HEADER MATCHING SCREENSHOT ================= */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-cyan-500/20 bg-[#030d17]/95 select-none shrink-0 z-30">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#00f0ff] animate-pulse" />
          <span className="font-mono-tech text-[11px] font-bold tracking-[0.2em] text-cyan-300">
            AGENT TOWN
          </span>
          <span className="px-1.5 py-0.2 border border-emerald-500/60 text-emerald-400 text-[8px] font-mono-tech font-bold rounded bg-emerald-500/10 shadow-[0_0_8px_rgba(16,185,129,0.2)]">
            READY
          </span>
        </div>

        {/* Center: Agent Chips matching screenshot (Alice, Bob, Carol, Dave) */}
        <div className="hidden sm:flex items-center gap-1.5 bg-[#020a12] p-0.5 rounded border border-cyan-500/30">
          {AGENTS_LIST.map((ag) => (
            <button
              key={ag.id}
              onClick={() => {
                setSelectedAgent(ag.id);
                if (onSelectAgent) onSelectAgent(ag);
              }}
              className={`flex items-center gap-1 px-2 py-0.5 rounded text-[8.5px] font-mono-tech transition-all cursor-pointer ${
                selectedAgent === ag.id
                  ? 'bg-cyan-500/30 border border-cyan-400 text-cyan-100 font-bold shadow-[0_0_6px_rgba(0,240,255,0.4)]'
                  : 'text-cyan-400/80 hover:text-cyan-200'
              }`}
            >
              <span
                className="w-2 h-2 rounded-full inline-block"
                style={{ backgroundColor: ag.avatarColor }}
              />
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>{ag.name}</span>
            </button>
          ))}
        </div>

        {/* Right Controls: 3D / 2D Switcher & Expand */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1 bg-[#020a12]/90 border border-cyan-400/50 rounded p-0.5 shadow-[0_0_10px_rgba(0,240,255,0.2)]">
            <button
              onClick={() => setRenderMode('3d_human')}
              className={`flex items-center gap-1 px-2 py-0.5 rounded text-[8.5px] font-mono-tech transition-all cursor-pointer ${
                renderMode === '3d_human'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_8px_#00f0ff]'
                  : 'text-cyan-400 hover:text-cyan-200'
              }`}
              title="Full 3D Real Humans & Penthouse Scenery"
            >
              <Box className="w-3 h-3" />
              <span>3D OFFICE</span>
            </button>

            <button
              onClick={() => setRenderMode('pixel')}
              className={`flex items-center gap-1 px-2 py-0.5 rounded text-[8.5px] font-mono-tech transition-all cursor-pointer ${
                renderMode === 'pixel'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_8px_#00f0ff]'
                  : 'text-cyan-400 hover:text-cyan-200'
              }`}
              title="2D Pixel RPG Mode"
            >
              <Layers className="w-3 h-3" />
              <span>2D PIXEL</span>
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

      {/* ================= VIEWPORT CONTENT ================= */}
      {renderMode === '3d_human' ? (
        <AgentTown3D
          onSelectAgent={onSelectAgent}
          isExpanded={isExpanded}
          onToggleExpand={onToggleExpand}
          externalTaskTrigger={externalTaskTrigger}
        />
      ) : (
        /* 2D Pixel Office Canvas matching screenshot */
        <div className="relative w-full h-full flex flex-col min-h-0">
          <div className="relative flex-1 bg-[#091520] overflow-hidden m-1 rounded border border-cyan-500/20">
            <svg className="w-full h-full" viewBox="0 0 600 320" preserveAspectRatio="none">
              <rect width="600" height="320" fill="#0c1b26" />
              <path d="M 20,20 L 580,20 L 580,300 L 20,300 Z" fill="none" stroke="#1e3a4f" strokeWidth="4" />
              <line x1="380" y1="20" x2="380" y2="150" stroke="#1e3a4f" strokeWidth="4" />
              <line x1="380" y1="190" x2="380" y2="300" stroke="#1e3a4f" strokeWidth="4" />
              <rect x="70" y="50" width="80" height="35" rx="2" fill="#142636" stroke="#00f0ff" strokeWidth="1.2" />
              <rect x="95" y="55" width="30" height="10" rx="1" fill="#38bdf8" />
              <rect x="170" y="50" width="80" height="35" rx="2" fill="#142636" stroke="#00f0ff" strokeWidth="1.2" />
              <rect x="195" y="55" width="30" height="10" rx="1" fill="#34d399" />
              <rect x="420" y="45" width="22" height="34" rx="2" fill="#0284c7" stroke="#38bdf8" strokeWidth="1" />
              <circle cx="431" cy="55" r="5" fill="#bae6fd" />
            </svg>

            {/* Carol walking with Getting water bubble */}
            <div className="absolute top-[24%] left-[74%] cursor-pointer z-20">
              <div className="absolute -top-7 -left-7 px-2 py-0.5 bg-[#020b12]/95 border border-cyan-400 rounded text-[9px] font-mono-tech text-cyan-200 whitespace-nowrap shadow-[0_0_8px_rgba(0,240,255,0.4)] animate-pulse">
                Getting water
              </div>
              <div className="w-5 h-6 relative flex flex-col items-center">
                <div className="w-3.5 h-3 bg-[#e879f9] rounded-t-xs border border-purple-950" />
                <div className="w-4 h-2.5 bg-[#f472b6] border border-pink-950" />
                <div className="flex gap-0.5">
                  <div className="w-1 h-1.5 bg-slate-700" />
                  <div className="w-1 h-1.5 bg-slate-700" />
                </div>
              </div>
            </div>
          </div>

          {/* Status bar */}
          <div className="flex items-center justify-between px-3 py-1 border-t border-cyan-500/20 bg-[#030d17]/95 text-[9px] font-mono-tech">
            <span className="text-cyan-300">Online • 4/7 seat • 0/4 busy</span>
            <span className="text-amber-300 font-bold">CHAT</span>
          </div>
        </div>
      )}
    </div>
  );
};
