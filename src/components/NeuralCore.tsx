import React from 'react';
import {
  Bot,
  Mic,
  MicOff,
  Globe,
  BookOpen,
  Shield,
  Settings,
  Maximize2,
  Minimize2,
  Cpu,
  Monitor,
  Zap,
} from 'lucide-react';
import { NeuralOrb } from './NeuralOrb';

interface NeuralCoreProps {
  thinking: boolean;
  setThinking: (val: boolean | ((prev: boolean) => boolean)) => void;
  isLoading: boolean;
  micEnabled: boolean;
  toggleMic: () => void;
  onTerminate: () => void;
  onOpenModal: (modalName: 'memory' | 'skills' | 'character' | 'setting') => void;
  onOpenBrainConfig?: () => void;
  onOpenScreenMonitor?: () => void;
  activeBrainProvider?: string;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

export const NeuralCore: React.FC<NeuralCoreProps> = ({
  thinking,
  setThinking,
  isLoading,
  micEnabled,
  toggleMic,
  onTerminate,
  onOpenModal,
  onOpenBrainConfig,
  onOpenScreenMonitor,
  activeBrainProvider = 'Stonic Gemini 3.8',
  isExpanded = false,
  onToggleExpand,
}) => {
  return (
    <div
      className={`relative rounded-xl border border-[#00f0ff]/30 bg-[#04121d]/95 backdrop-blur-md overflow-hidden flex flex-col justify-between shadow-[0_0_20px_rgba(0,240,255,0.06)] min-h-0 ${
        isExpanded ? 'h-full' : 'flex-1'
      }`}
    >
      {/* Outer corner cut details matching screenshot */}
      <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2 border-cyan-400 pointer-events-none" />
      <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t-2 border-r-2 border-cyan-400 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b-2 border-l-2 border-cyan-400 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2 border-cyan-400 pointer-events-none" />

      {/* Top Thinking Bar & Expand Toggle */}
      <div className="w-full relative flex items-center justify-center pt-2 px-3 z-20 shrink-0">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/40 bg-[#020b13]/90 shadow-[0_0_12px_rgba(0,240,255,0.15)]">
          <Bot className="w-3 h-3 text-cyan-400" />
          <span className="text-[10px] font-bold tracking-[0.25em] text-cyan-200 font-mono-tech">
            THINKING
          </span>
          <button
            onClick={() => setThinking((t) => !t)}
            className={`w-8 h-4 rounded-full relative transition-colors duration-200 cursor-pointer ${
              thinking || isLoading
                ? 'bg-cyan-500/40 border border-cyan-400'
                : 'bg-slate-800 border border-slate-700'
            }`}
          >
            <span
              className={`absolute top-0.5 w-3 h-3 rounded-full transition-all duration-200 ${
                thinking || isLoading
                  ? 'left-[16px] bg-cyan-300 shadow-[0_0_8px_rgba(0,240,255,0.9)]'
                  : 'left-0.5 bg-slate-400'
              }`}
            />
          </button>
        </div>

        {onToggleExpand && (
          <button
            onClick={onToggleExpand}
            className="absolute right-3 text-cyan-400 hover:text-cyan-200 transition-colors p-1"
            title={isExpanded ? 'Restore Panel' : 'Maximize Neural Core'}
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>

      {/* Main stage with circuit lines, buttons and 3D orb */}
      <div className="relative w-full flex-1 min-h-0 flex items-center justify-center">
        {/* Left cyber buttons */}
        <div className="absolute left-3 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-2.5">
          {/* MEMORY */}
          <button
            onClick={() => onOpenModal('memory')}
            className="group relative flex items-center gap-1.5 pl-2.5 pr-4 py-1.5 bg-[#041624]/95 border border-[#00f0ff] text-cyan-300 shadow-[0_0_12px_rgba(0,240,255,0.2)] hover:bg-cyan-500/20 active:scale-98 transition-all cursor-pointer font-mono-tech font-bold text-[9.5px] tracking-[0.2em]"
            style={{
              clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)',
            }}
          >
            <Globe className="w-3 h-3 text-cyan-300" />
            <span>MEMORY</span>
            <span className="absolute -right-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rotate-45 bg-[#00f0ff] shadow-[0_0_6px_#00f0ff]" />
          </button>

          {/* SKILLS */}
          <button
            onClick={() => onOpenModal('skills')}
            className="group relative flex items-center gap-1.5 pl-2.5 pr-4 py-1.5 bg-[#031c18]/95 border border-[#10b981] text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.2)] hover:bg-emerald-500/20 active:scale-98 transition-all cursor-pointer font-mono-tech font-bold text-[9.5px] tracking-[0.2em]"
            style={{
              clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)',
            }}
          >
            <BookOpen className="w-3 h-3 text-emerald-300" />
            <span>SKILLS</span>
            <span className="absolute -right-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rotate-45 bg-[#10b981] shadow-[0_0_6px_#10b981]" />
          </button>

          {/* CHARACTER */}
          <button
            onClick={() => onOpenModal('character')}
            className="group relative flex items-center gap-1.5 pl-2.5 pr-4 py-1.5 bg-[#1c080b]/95 border border-[#ef4444] text-red-400 shadow-[0_0_12px_rgba(239,68,68,0.2)] hover:bg-red-500/20 active:scale-98 transition-all cursor-pointer font-mono-tech font-bold text-[9.5px] tracking-[0.2em]"
            style={{
              clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)',
            }}
          >
            <Shield className="w-3 h-3 text-red-400" />
            <span>CHARACTER</span>
            <span className="absolute -right-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rotate-45 bg-[#ef4444] shadow-[0_0_6px_#ef4444]" />
          </button>

          {/* SETTING */}
          <button
            onClick={() => (onOpenBrainConfig ? onOpenBrainConfig() : onOpenModal('setting'))}
            className="group relative flex items-center gap-1.5 pl-2.5 pr-4 py-1.5 bg-[#141b24]/95 border border-[#cbd5e1] text-slate-200 shadow-[0_0_12px_rgba(203,213,225,0.15)] hover:bg-slate-300/20 active:scale-98 transition-all cursor-pointer font-mono-tech font-bold text-[9.5px] tracking-[0.2em]"
            style={{
              clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)',
            }}
          >
            <Settings className="w-3 h-3 text-slate-300" />
            <span>SETTING</span>
            <span className="absolute -right-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rotate-45 bg-[#cbd5e1] shadow-[0_0_6px_#ffffff]" />
          </button>
        </div>

        {/* Right cyber buttons: AI BRAIN & SCREEN VISION */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-2.5">
          {/* AI BRAIN HUB */}
          <button
            onClick={onOpenBrainConfig}
            className="group relative flex items-center gap-1.5 pr-2.5 pl-4 py-1.5 bg-[#031c26]/95 border border-[#00f0ff] text-cyan-200 shadow-[0_0_15px_rgba(0,240,255,0.25)] hover:bg-cyan-500/25 active:scale-98 transition-all cursor-pointer font-mono-tech font-bold text-[9.5px] tracking-[0.15em]"
            style={{
              clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))',
            }}
            title="Configure Custom AI Provider, API Key, or Local Ollama/LM Studio"
          >
            <span className="absolute -left-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rotate-45 bg-[#00f0ff] shadow-[0_0_6px_#00f0ff]" />
            <Cpu className="w-3 h-3 text-cyan-300 animate-pulse" />
            <span>AI BRAIN</span>
          </button>

          {/* SCREEN VISION */}
          <button
            onClick={onOpenScreenMonitor}
            className="group relative flex items-center gap-1.5 pr-2.5 pl-4 py-1.5 bg-[#031d1c]/95 border border-[#10b981] text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.25)] hover:bg-emerald-500/25 active:scale-98 transition-all cursor-pointer font-mono-tech font-bold text-[9.5px] tracking-[0.15em]"
            style={{
              clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))',
            }}
            title="Live Screen Monitoring, OCR Bug Detection & Desktop Automation"
          >
            <span className="absolute -left-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rotate-45 bg-[#10b981] shadow-[0_0_6px_#10b981]" />
            <Monitor className="w-3 h-3 text-emerald-300" />
            <span>SCREEN VISION</span>
          </button>
        </div>

        {/* High-tech SVG Circuit Bus */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-10"
          viewBox="0 0 1000 600"
          preserveAspectRatio="none"
        >
          <polyline points="180,185 340,185 450,290 510,290" fill="none" stroke="#00f0ff" strokeWidth="2.5" strokeOpacity="0.85" strokeLinecap="round" />
          <circle cx="510" cy="290" r="3" fill="#00f0ff" />
          <polyline points="180,250 360,250 450,295 510,295" fill="none" stroke="#10b981" strokeWidth="2.5" strokeOpacity="0.85" strokeLinecap="round" />
          <circle cx="510" cy="295" r="3" fill="#10b981" />
          <polyline points="180,350 360,350 450,305 510,305" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeOpacity="0.85" strokeLinecap="round" />
          <circle cx="510" cy="305" r="3" fill="#ef4444" />
          <polyline points="180,415 340,415 450,310 510,310" fill="none" stroke="#cbd5e1" strokeWidth="2.5" strokeOpacity="0.85" strokeLinecap="round" />
          <circle cx="510" cy="310" r="3" fill="#cbd5e1" />
        </svg>

        {/* 3D Neural Particle Orb (Canvas scales automatically to fill available space) */}
        <div className="relative w-full h-full max-w-[340px] max-h-[260px] flex items-center justify-center">
          <NeuralOrb active={thinking || isLoading} />
        </div>
      </div>

      {/* Bottom control row: TERMINATE & Microphone */}
      <div className="w-full flex items-center justify-center gap-3 pb-2 z-20 shrink-0">
        <button
          onClick={onTerminate}
          className="relative px-6 py-1.5 bg-[#200508]/95 border-2 border-red-500 text-red-400 font-mono-tech text-[10.5px] font-bold tracking-[0.25em] shadow-[0_0_15px_rgba(239,68,68,0.4)] hover:bg-red-500/20 active:scale-95 transition-all cursor-pointer"
          style={{
            clipPath: 'polygon(10px 0, calc(100% - 10px) 0, 100% 50%, calc(100% - 10px) 100%, 10px 100%, 0 50%)',
          }}
        >
          TERMINATE
        </button>

        <button
          onClick={toggleMic}
          className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer ${
            micEnabled
              ? 'border-cyan-300 bg-cyan-500/30 text-cyan-200 shadow-[0_0_16px_rgba(0,240,255,0.7)] animate-pulse'
              : 'border-cyan-400/80 bg-[#041420]/90 text-cyan-300 hover:border-cyan-300 hover:bg-cyan-500/15'
          }`}
          title={micEnabled ? 'Stop Listening' : 'Start Voice Input'}
        >
          {micEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};
