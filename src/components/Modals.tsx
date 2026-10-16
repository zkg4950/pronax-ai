import React from 'react';
import {
  X,
  Globe,
  BookOpen,
  Shield,
  Settings,
  Cpu,
  Layers,
  Database,
  Volume2,
  ExternalLink,
  CheckCircle,
} from 'lucide-react';

interface ModalProps {
  activeModal: 'memory' | 'skills' | 'character' | 'setting' | 'info' | null;
  onClose: () => void;
}

export const Modals: React.FC<ModalProps> = ({ activeModal, onClose }) => {
  if (!activeModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-lg border border-cyan-400 bg-[#04121e] shadow-[0_0_40px_rgba(0,240,255,0.25)] p-5 overflow-hidden text-cyan-100 font-sans">
        {/* Corner Decors */}
        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyan-300" />
        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyan-300" />
        <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-cyan-300" />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-cyan-300" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-cyan-500/30 pb-3 mb-4">
          <div className="flex items-center gap-2">
            {activeModal === 'memory' && <Globe className="w-5 h-5 text-cyan-400" />}
            {activeModal === 'skills' && <BookOpen className="w-5 h-5 text-emerald-400" />}
            {activeModal === 'character' && <Shield className="w-5 h-5 text-red-400" />}
            {activeModal === 'setting' && <Settings className="w-5 h-5 text-slate-300" />}
            {activeModal === 'info' && <Cpu className="w-5 h-5 text-cyan-300" />}

            <h2 className="font-mono-tech text-base font-bold tracking-[0.2em] text-cyan-200 uppercase">
              {activeModal === 'memory' && 'NEURAL MEMORY VAULT'}
              {activeModal === 'skills' && 'STONIC AI SKILLS MATRIX'}
              {activeModal === 'character' && 'CHARACTER & IDENTITY MANIFEST'}
              {activeModal === 'setting' && 'CORE SYSTEM CONFIGURATION'}
              {activeModal === 'info' && 'STONIC AI ARCHITECTURE & ATTRIBUTION'}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded text-cyan-400 hover:text-white hover:bg-cyan-500/20 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1 font-mono-tech text-xs">
          {activeModal === 'memory' && (
            <div className="space-y-3">
              <div className="p-3 rounded bg-cyan-950/40 border border-cyan-500/30">
                <span className="text-cyan-400 font-bold block mb-1">LONG-TERM CONTEXT CORE</span>
                <p className="text-cyan-100 text-xs leading-relaxed">
                  Stonic AI persists cross-session operational memory, preferences of Inventor Usman,
                  and global incident histories across geopolitical, weather, and cyber telemetry.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded bg-[#061928] border border-cyan-500/20">
                  <span className="text-[10px] text-cyan-400 block">ACTIVE SECTORS</span>
                  <span className="text-cyan-100 font-bold">Sector 9 // Uplink 99.2%</span>
                </div>
                <div className="p-2.5 rounded bg-[#061928] border border-cyan-500/20">
                  <span className="text-[10px] text-cyan-400 block">MEMORY BUFFER</span>
                  <span className="text-emerald-400 font-bold">4.2 GB / 8.0 GB (Allocated)</span>
                </div>
              </div>

              <div className="p-3 rounded bg-[#061928] border border-cyan-500/20 space-y-1">
                <span className="text-[10px] text-cyan-400 block">RECENT INDEXED ENTRIES:</span>
                <div className="text-[11px] text-cyan-200">1. US-China Summit bilateral military channels</div>
                <div className="text-[11px] text-cyan-200">2. Red Sea maritime commerce advisory</div>
                <div className="text-[11px] text-cyan-200">3. Australia Medicare breach forensic trail</div>
              </div>
            </div>
          )}

          {activeModal === 'skills' && (
            <div className="space-y-3">
              <div className="p-3 rounded bg-emerald-950/40 border border-emerald-500/40">
                <span className="text-emerald-400 font-bold block mb-1">OPERATIONAL CAPABILITIES</span>
                <p className="text-emerald-100 text-xs leading-relaxed">
                  Stonic AI executes high-level directives by combining autonomous reasoning with sub-agent micro-routines.
                </p>
              </div>

              <div className="space-y-2">
                {[
                  { name: 'Desktop Orchestration', desc: 'Execute system commands, process scripts, and coordinate windows.' },
                  { name: 'SAT-LINK Reconnaissance', desc: 'Analyze real-time orbital feeds, atmospheric fronts, and hotspots.' },
                  { name: 'Sub-Agent Swarm Router', desc: 'Direct Alice, Bob, Carol, and Dave in parallel work streams.' },
                  { name: 'Gemini Live Multimodal Voice', desc: 'Low-latency natural audio conversation with reasoning models.' },
                ].map((s) => (
                  <div key={s.name} className="p-2.5 rounded bg-[#061c20] border border-emerald-500/30 flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-emerald-300 font-bold">{s.name}</div>
                      <div className="text-[11px] text-emerald-100/80">{s.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeModal === 'character' && (
            <div className="space-y-3">
              <div className="p-3 rounded bg-red-950/40 border border-red-500/40">
                <span className="text-red-400 font-bold block mb-1">PERSONA & ORIGIN</span>
                <p className="text-red-100 text-xs leading-relaxed">
                  I am Stonic AI, created by the Stonic AI team and owned by Inventor Usman.
                  Designed to embody quiet elegance, sci-fi desktop intelligence, and absolute loyalty to the operator.
                </p>
              </div>

              <div className="space-y-2">
                <div className="p-2.5 rounded bg-[#1a080d] border border-red-500/20">
                  <span className="text-[10px] text-red-400 block">CREATOR & TEAM</span>
                  <span className="text-red-200">Stonic AI Engineering Team</span>
                </div>
                <div className="p-2.5 rounded bg-[#1a080d] border border-red-500/20">
                  <span className="text-[10px] text-red-400 block">PROPRIETOR</span>
                  <span className="text-red-200 font-bold">Inventor Usman</span>
                </div>
                <div className="p-2.5 rounded bg-[#1a080d] border border-red-500/20">
                  <span className="text-[10px] text-red-400 block">OFFICIAL PLATFORM</span>
                  <a
                    href="https://stonicai.com/"
                    target="_blank"
                    rel="noreferrer"
                    className="text-cyan-300 hover:underline flex items-center gap-1"
                  >
                    https://stonicai.com/ <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          )}

          {activeModal === 'setting' && (
            <div className="space-y-3">
              <div className="p-3 rounded bg-slate-900 border border-slate-600">
                <span className="text-slate-300 font-bold block mb-1">SYSTEM CONTROLS</span>
                <p className="text-slate-300 text-xs">
                  Fine-tune speech synthesis, thinking latency, and telemetry frequency.
                </p>
              </div>

              <div className="space-y-2">
                <div className="p-3 rounded bg-[#0b141f] border border-slate-700 flex items-center justify-between">
                  <div>
                    <span className="text-slate-200 font-bold block">Voice Synthesis Engine</span>
                    <span className="text-[10px] text-slate-400">Natural Urdu & English neural TTS</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px]">
                    ACTIVE
                  </span>
                </div>

                <div className="p-3 rounded bg-[#0b141f] border border-slate-700 flex items-center justify-between">
                  <div>
                    <span className="text-slate-200 font-bold block">Reasoning Engine</span>
                    <span className="text-[10px] text-slate-400">gemini-3.8-flash via Server-side proxy</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px]">
                    CONNECTED
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeModal === 'info' && (
            <div className="space-y-3">
              <div className="p-3 rounded bg-cyan-950/60 border border-cyan-400/50">
                <div className="flex items-center gap-2 text-cyan-300 font-bold text-sm mb-1">
                  <Cpu className="w-4 h-4 text-cyan-400" />
                  <span>STONIC AI v4.2 TELEMETRY MATRIX</span>
                </div>
                <p className="text-cyan-100 text-xs leading-relaxed">
                  Welcome, Sir. This interface represents the ultimate desktop intelligence command deck
                  modeled after Stonic AI (stonicai.com), created for Inventor Usman.
                </p>
              </div>

              <div className="p-3 rounded bg-[#051824] border border-cyan-500/30 space-y-2 text-xs">
                <div className="text-cyan-300 font-bold">Core Features Synchronized:</div>
                <ul className="list-disc pl-4 space-y-1 text-cyan-200">
                  <li><strong>SAT-LINK Feed:</strong> Global tactical 2D/3D map with drought & cyclone hotspots.</li>
                  <li><strong>Neural Core:</strong> 3D Fibonacci particle orb with interactive thinking bus traces.</li>
                  <li><strong>Agent Town:</strong> 16-bit RPG office simulation with Alice, Bob, Carol, and Dave.</li>
                  <li><strong>Voice Console:</strong> Multimodal conversational intelligence with audio speech synthesis.</li>
                </ul>
              </div>

              <div className="p-3 rounded bg-[#051824] border border-cyan-500/30 flex items-center justify-between">
                <div>
                  <span className="text-cyan-400 font-bold block">Visit Official Source</span>
                  <span className="text-[10px] text-cyan-500">Explore Stonic AI ecosystem</span>
                </div>
                <a
                  href="https://stonicai.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1 bg-cyan-500/20 border border-cyan-400 text-cyan-200 rounded hover:bg-cyan-500/40 flex items-center gap-1 transition-colors"
                >
                  stonicai.com <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="mt-5 pt-3 border-t border-cyan-500/30 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-cyan-500/20 border border-cyan-400 text-cyan-200 text-xs font-mono-tech hover:bg-cyan-500/40 transition-colors"
          >
            DISMISS [X]
          </button>
        </div>
      </div>
    </div>
  );
};
