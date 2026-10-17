import React, { useEffect, useState } from 'react';
import { subscribeLipSync, LipSyncData } from '../utils/audioEffects';
import { Radio, Terminal, Zap, Shield, Database, Cloud, FileText, Activity } from 'lucide-react';

export interface OfficeAgentProps {
  id: 'alice' | 'bob' | 'carol' | 'dave';
  name: string;
  title: string;
  taskTag: string;
  avatarImage: string;
  accentColor: string;
  status: 'working_at_desk' | 'talking' | 'walking' | 'meeting' | 'drinking_water';
  currentTask: string;
  telemetrySnippet: string;
  isSpeaking: boolean;
  activeSpeechText?: string;
  activeEnglishSummary?: string;
  targetColleague?: string;
  position: { left: string; top: string };
  walkingTargetPos?: { left: string; top: string } | null;
  onSelect: () => void;
  onOpenWorkModal: () => void;
  onWalkToColleague?: (targetId: 'alice' | 'bob' | 'carol' | 'dave') => void;
}

export const AnimatedOfficeAgent: React.FC<OfficeAgentProps> = ({
  id,
  name,
  title,
  taskTag,
  avatarImage,
  accentColor,
  status,
  currentTask,
  telemetrySnippet,
  isSpeaking,
  activeSpeechText,
  activeEnglishSummary,
  targetColleague,
  position,
  walkingTargetPos,
  onSelect,
  onOpenWorkModal,
  onWalkToColleague,
}) => {
  // Real-time lip-sync state
  const [lipSync, setLipSync] = useState<LipSyncData>({
    isOpen: false,
    openRatio: 0,
    mouthWidth: 1.0,
    jawOffset: 0,
    phoneme: 'rest',
  });

  // Natural blinking
  const [isBlinking, setIsBlinking] = useState(false);

  // Keyboard typing animation toggle
  const [typingHandOffset, setTypingHandOffset] = useState(0);

  // Subscribe to real-time lip-sync broadcast from audio engine
  useEffect(() => {
    const unsub = subscribeLipSync((speakerId, data) => {
      if (speakerId === id) {
        setLipSync(data);
      }
    });
    return unsub;
  }, [id]);

  // Periodic natural blinking (every 3 to 5 seconds)
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 140);
    }, 3200 + Math.random() * 2000);
    return () => clearInterval(blinkInterval);
  }, []);

  // Continuous typing hands animation when sitting at desk
  useEffect(() => {
    if (status !== 'working_at_desk') return;
    const typingInterval = setInterval(() => {
      setTypingHandOffset((prev) => (prev === 0 ? 1 : prev === 1 ? -1 : 0));
    }, 110);
    return () => clearInterval(typingInterval);
  }, [status]);

  // Approximate relative mouth coordinates on photorealistic image (percentage of portrait)
  const mouthPositionByAgent = {
    alice: { left: '49.5%', top: '78%', width: '22%' },
    bob: { left: '50%', top: '75%', width: '24%' },
    carol: { left: '50%', top: '76%', width: '23%' },
    dave: { left: '50.5%', top: '76%', width: '24%' },
  };

  const mouthCoords = mouthPositionByAgent[id];

  // Current position (either stationary desk or walking path)
  const curPos = status === 'walking' && walkingTargetPos ? walkingTargetPos : position;

  return (
    <div
      style={{
        left: curPos.left,
        top: curPos.top,
        transform: 'translate(-50%, -70%)',
        transition: status === 'walking' ? 'all 3.5s cubic-bezier(0.4, 0, 0.2, 1)' : 'all 0.3s ease',
      }}
      className="absolute z-20 flex flex-col items-center group cursor-pointer select-none"
      onClick={onSelect}
    >
      {/* ================= FLOATING GLASS STATUS CHIP ================= */}
      <div
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border backdrop-blur-md transition-all shadow-xl mb-1.5 ${
          isSpeaking
            ? 'bg-[#041c2c]/95 border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.7)] scale-105'
            : 'bg-[#020e1a]/90 border-slate-700/80 hover:border-cyan-400'
        }`}
      >
        <span
          className="w-2 h-2 rounded-full animate-pulse"
          style={{ backgroundColor: accentColor }}
        />
        <span className="text-xs font-bold text-white tracking-wide">{name}</span>
        <span className="text-[10px] font-mono text-cyan-300">({taskTag})</span>
        <span
          className={`text-[9px] px-1.5 py-0.2 rounded font-bold border ${
            status === 'working_at_desk'
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40'
              : status === 'walking'
              ? 'bg-amber-500/20 text-amber-300 border-amber-400/40'
              : 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
          }`}
        >
          {status === 'walking' ? 'WALKING' : status === 'working_at_desk' ? 'AT DESK' : 'TALKING'}
        </span>
      </div>

      {/* ================= THE ARTICULATED WORKSTATION & REALISTIC CHARACTER ================= */}
      <div className="relative flex flex-col items-center">
        {/* Computer Chair Backrest Behind Agent */}
        <div className="absolute -top-3 w-28 md:w-32 h-36 rounded-2xl bg-gradient-to-b from-[#111827] to-[#030712] border-2 border-slate-700 shadow-2xl flex flex-col items-center pt-2">
          {/* Executive Headrest */}
          <div className="w-16 h-5 rounded-full bg-slate-800 border border-slate-600 shadow-inner" />
          {/* Ergonomic Mesh Lines */}
          <div className="w-20 h-16 mt-2 border-t border-b border-cyan-500/20 opacity-40 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:6px_6px]" />
        </div>

        {/* ================= REALISTIC CHARACTER TORSO & HEAD WITH LIP-SYNC ================= */}
        <div
          className={`relative z-10 w-24 h-28 md:w-28 md:h-32 rounded-2xl overflow-hidden border-2 transition-all duration-200 bg-slate-900 shadow-xl ${
            isSpeaking
              ? 'border-emerald-400 ring-4 ring-emerald-400/30 shadow-[0_0_30px_rgba(16,185,129,0.8)] scale-102'
              : 'border-cyan-400/50 hover:border-cyan-300'
          }`}
        >
          {/* Real High-Resolution Photorealistic Character Image */}
          <img
            src={avatarImage}
            alt={name}
            className={`w-full h-full object-cover object-top transition-transform duration-300 ${
              isSpeaking ? 'scale-103' : 'scale-100'
            }`}
          />

          {/* Natural Eye Blink Overlay */}
          {isBlinking && (
            <div className="absolute inset-0 pointer-events-none">
              <div
                style={{
                  top: '38%',
                  left: '26%',
                  width: '48%',
                  height: '8%',
                }}
                className="absolute bg-[#e2996e]/95 rounded-full"
              />
            </div>
          )}

          {/* ================= REAL-TIME ANIMATED LIP-SYNC MOUTH OVERLAY ================= */}
          {/* This renders directly on the character's face and opens/shapes realistically when speaking */}
          <div
            style={{
              position: 'absolute',
              left: mouthCoords.left,
              top: mouthCoords.top,
              width: mouthCoords.width,
              transform: `translate(-50%, -50%) scaleX(${lipSync.mouthWidth}) translateY(${lipSync.jawOffset * 0.4}px)`,
              transition: 'transform 0.05s ease-out',
            }}
            className="pointer-events-none flex flex-col items-center justify-center"
          >
            {isSpeaking && lipSync.isOpen ? (
              <div
                style={{
                  height: `${Math.max(4, Math.round(lipSync.openRatio * 16))}px`,
                  width: `${Math.round(lipSync.mouthWidth * 100)}%`,
                  borderRadius: lipSync.phoneme === 'O' ? '50%' : '35% / 60%',
                }}
                className="bg-[#240a0c] border border-[#a83244] shadow-inner flex flex-col items-center justify-between overflow-hidden relative"
              >
                {/* Upper Teeth Row */}
                <div className="w-4/5 h-[2px] bg-slate-100/90 rounded-b-xs" />
                {/* Tongue Tone */}
                <div className="w-3/5 h-[3px] bg-[#c74d5e] rounded-t-sm" />
              </div>
            ) : (
              /* Natural resting lips line */
              <div className="w-full h-[2px] bg-[#883a3a]/80 rounded-full" />
            )}
          </div>

          {/* Cybernetic HUD Reflection on Glass Corner */}
          <div className="absolute top-1 right-1 px-1 py-0.5 rounded bg-black/60 text-[8px] font-mono text-cyan-300 border border-cyan-400/30">
            {taskTag}
          </div>
        </div>

        {/* ================= DESK & MULTI-MONITORS WORKSTATION (DESK MODE) ================= */}
        {status !== 'walking' && (
          <div className="relative z-20 -mt-2 flex flex-col items-center">
            {/* Dual Holographic Curved Monitors */}
            <div className="flex items-center gap-1">
              {/* Left Monitor (Data Waterfall) */}
              <div className="w-14 h-9 rounded bg-[#021320]/95 border border-cyan-400/70 shadow-[0_0_12px_rgba(0,240,255,0.4)] p-0.5 overflow-hidden flex flex-col">
                <div className="flex items-center justify-between text-[7px] text-cyan-300 font-mono border-b border-cyan-500/30 pb-0.5">
                  <span>DISP-L</span>
                  <span className="text-emerald-400">● ON</span>
                </div>
                <div className="flex-1 text-[6px] text-cyan-200/80 font-mono leading-tight overflow-hidden">
                  <p className="truncate">{telemetrySnippet}</p>
                  <p className="text-emerald-300">PING: 8.2ms</p>
                </div>
              </div>

              {/* Right Monitor (Telemetry Graph / Visual) */}
              <div className="w-14 h-9 rounded bg-[#021320]/95 border border-cyan-400/70 shadow-[0_0_12px_rgba(0,240,255,0.4)] p-0.5 overflow-hidden flex flex-col">
                <div className="flex items-center justify-between text-[7px] text-cyan-300 font-mono border-b border-cyan-500/30 pb-0.5">
                  <span>DISP-R</span>
                  <span className="text-cyan-400">60 FPS</span>
                </div>
                <div className="flex-1 flex items-end gap-0.5 pt-0.5 px-0.5">
                  <span className="w-1 bg-cyan-400 h-2 animate-pulse rounded-t-xs" />
                  <span className="w-1 bg-emerald-400 h-4 animate-pulse rounded-t-xs" />
                  <span className="w-1 bg-cyan-400 h-3 animate-pulse rounded-t-xs" />
                  <span className="w-1 bg-amber-400 h-5 animate-pulse rounded-t-xs" />
                  <span className="w-1 bg-cyan-400 h-3 animate-pulse rounded-t-xs" />
                </div>
              </div>
            </div>

            {/* Glass Desk Surface with Keyboard and Animated Typing Hands */}
            <div className="w-32 md:w-36 h-8 -mt-1 rounded-xl bg-gradient-to-r from-cyan-950/80 via-[#031d2e]/90 to-cyan-950/80 border-t-2 border-cyan-400/80 shadow-[0_4px_20px_rgba(0,240,255,0.25)] flex items-center justify-center relative">
              {/* Mechanical RGB Keyboard with Typing Hands */}
              <div className="w-20 h-4 bg-[#010810] border border-cyan-500/40 rounded-sm flex items-center justify-between px-1 relative">
                <span className="text-[6px] text-cyan-400 font-mono">KEYBOARD</span>

                {/* Animated Typing Left & Right Hands */}
                <div
                  style={{ transform: `translateY(${typingHandOffset}px)` }}
                  className="w-2.5 h-2 rounded-full bg-[#fcd34d] border border-amber-600 shadow-xs"
                />
                <div
                  style={{ transform: `translateY(${-typingHandOffset}px)` }}
                  className="w-2.5 h-2 rounded-full bg-[#fcd34d] border border-amber-600 shadow-xs"
                />
              </div>

              {/* Glowing Laser Mouse on side */}
              <div className="w-2 h-3 ml-2 rounded-full bg-slate-800 border border-cyan-400 shadow-[0_0_6px_#00f0ff]" />
            </div>

            {/* Chrome Chair Wheeled Base on Parquet Floor */}
            <div className="w-24 h-4 -mt-1 rounded-full border border-slate-700 bg-slate-900/90 flex items-center justify-around px-2">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
              <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
              <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
            </div>
          </div>
        )}

        {/* ================= WALKING ANIMATED LEGS (WALKING MODE) ================= */}
        {status === 'walking' && (
          <div className="relative z-10 w-16 h-14 flex items-center justify-around pt-1">
            {/* Animated Striding Legs */}
            <div className="w-3 h-12 bg-slate-900 border border-slate-700 rounded-b-md animate-bounce" />
            <div className="w-3 h-12 bg-slate-900 border border-slate-700 rounded-b-md animate-bounce [animation-delay:0.18s]" />
          </div>
        )}

        {/* Circular Floor Shadow & Cyan Pedestal Glow */}
        <div
          className="w-32 h-6 -mt-2 rounded-[50%] border border-cyan-400/40 shadow-[0_0_20px_rgba(0,240,255,0.4)] pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at center, ${accentColor}33 0%, transparent 70%)`,
          }}
        />
      </div>

      {/* ================= LIVE SARAIKI / URDU SPEECH BUBBLE ================= */}
      {isSpeaking && activeSpeechText && (
        <div className="absolute left-1/2 -top-4 -translate-x-1/2 -translate-y-full w-84 p-3 rounded-xl bg-[#03182b]/98 border-2 border-emerald-400 text-emerald-100 text-xs shadow-[0_0_35px_rgba(16,185,129,0.7)] backdrop-blur-md pointer-events-none animate-in fade-in zoom-in-95 z-40">
          <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-emerald-500/30 text-[10px] font-mono text-emerald-400">
            <span className="font-bold flex items-center gap-1">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>LIVE TRANSMISSION (سیرائیکی / اردو)</span>
            </span>
            {targetColleague && <span>→ {targetColleague}</span>}
          </div>

          <p className="font-sans leading-relaxed text-white font-bold text-xs pb-1">
            "{activeSpeechText}"
          </p>

          {activeEnglishSummary && (
            <p className="text-[10px] font-mono text-cyan-300/90 italic border-t border-cyan-500/20 pt-1">
              [Intel Summary]: {activeEnglishSummary}
            </p>
          )}

          {/* Pointer Arrow to mouth */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-emerald-400" />
        </div>
      )}
    </div>
  );
};
