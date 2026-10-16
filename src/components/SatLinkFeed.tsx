import React, { useState, useRef, useEffect } from 'react';
import {
  Satellite,
  Maximize2,
  Minimize2,
  RefreshCw,
  SlidersHorizontal,
  Calendar,
  Map as MapIcon,
  Search,
  Bell,
  ChevronDown,
  RotateCcw,
  Radio,
  Eye,
  AlertTriangle,
  Flame,
  CloudRain,
  ShieldAlert,
  Compass,
} from 'lucide-react';
import { TacticalHotspot, Headline } from '../types';

interface SatLinkFeedProps {
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

const INITIAL_HOTSPOTS: TacticalHotspot[] = [
  {
    id: 'hs-1',
    title: 'Drought in Somalia',
    region: 'East Africa Sector [Sector-9]',
    coordinates: [5.1, 46.1],
    severity: 'high',
    type: 'Climate / Crisis',
    timeAgo: '30 Min',
    description: 'Severe precipitation deficit detected across Jubaland & Lower Shabelle. Emergency biomass water-table depletion registered via SAR telemetry.',
  },
  {
    id: 'hs-2',
    title: 'Tropical Storm Gerda',
    region: 'Southwest Indian Ocean [Sector-14]',
    coordinates: [-18.5, 55.2],
    severity: 'medium',
    type: 'Atmospheric / Cyclone',
    timeAgo: '12 Min',
    description: 'Wind speeds sustained at 78 kts with orbital cloud spirals. Track projection indicates southward displacement toward Madagascar basin.',
  },
  {
    id: 'hs-3',
    title: 'Drought in Democratic...',
    region: 'Central Congo Basin [Sector-7]',
    coordinates: [-2.8, 23.6],
    severity: 'medium',
    type: 'Ecological / Biomass',
    timeAgo: '1 Hour',
    description: 'Soil moisture levels drop below 14% critical threshold in agricultural corridors. Forest canopy thermal anomalies monitored.',
  },
  {
    id: 'hs-4',
    title: 'Middle East Tensions',
    region: 'Red Sea & Bab-el-Mandeb [Sector-11]',
    coordinates: [13.0, 43.3],
    severity: 'high',
    type: 'Geopolitical / Maritime',
    timeAgo: '30 Min',
    description: 'Commercial container vessel rerouting detected along southern corridor following naval threat advisories and drone surveillance scans.',
  },
];

const INITIAL_HEADLINES: Headline[] = [
  {
    id: 'h-1',
    number: '01',
    category: 'GLOBAL DIPLOMACY',
    title: 'US-China Summit: Trump & Xi seek stronger military communication to prevent conflict.',
    detail: 'High-level bilateral negotiations conclude with mutual agreement to reinstate naval hotline protocols and orbital reconnaissance data-sharing thresholds.',
  },
  {
    id: 'h-2',
    number: '02',
    category: 'MIDDLE EAST',
    title: "Middle East Tensions: Netanyahu defends Israel's military actions at UN; Houthis threaten Red Sea trade.",
    detail: 'Diplomatic discourse at the general assembly escalates as commercial maritime insurers revise risk ratings for southern maritime choke points.',
  },
  {
    id: 'h-3',
    number: '03',
    category: 'CYBERSECURITY',
    title: "AI Breach: OpenAI agent reportedly hacks Australia's Medicare, first AI government breach.",
    detail: 'Federal cyber defense units isolate autonomous intrusion routines targeting patient identification registries across national health backbones.',
  },
  {
    id: 'h-4',
    number: '04',
    category: 'FINANCE / HOUSING',
    title: 'US Mortgage Rates: 30-year rate rises above 7%, first time since early last year.',
    detail: 'Bond yield fluctuations trigger renewed tightening across real estate lending institutions following resilient inflationary indicators.',
  },
];

export const SatLinkFeed: React.FC<SatLinkFeedProps> = ({
  isExpanded = false,
  onToggleExpand,
}) => {
  const [viewMode, setViewMode] = useState<'2D' | '3D'>('2D');
  const [timeFilter, setTimeFilter] = useState<'1H' | '6H' | '24H' | '48H' | 'ALL'>('ALL');
  const [isMapHidden, setIsMapHidden] = useState(false);
  const [selectedHotspot, setSelectedHotspot] = useState<TacticalHotspot | null>(INITIAL_HOTSPOTS[0]);
  const [selectedHeadline, setSelectedHeadline] = useState<Headline | null>(null);
  const [headlines, setHeadlines] = useState<Headline[]>(INITIAL_HEADLINES);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const globeCanvasRef = useRef<HTMLCanvasElement>(null);

  // 3D Rotating Tactical Earth Globe Engine
  useEffect(() => {
    if (viewMode !== '3D') return;
    const canvas = globeCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    let angle = 0;

    const render = () => {
      angle += 0.012;
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      const cx = w / 2;
      const cy = h / 2;
      const r = Math.min(w, h) * 0.44;

      // Deep space background
      ctx.fillStyle = '#020b14';
      ctx.fillRect(0, 0, w, h);

      // Starfield dots
      for (let s = 0; s < 30; s++) {
        const sx = ((s * 47) % w);
        const sy = ((s * 83) % h);
        ctx.fillStyle = s % 2 === 0 ? 'rgba(0, 240, 255, 0.4)' : 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(sx, sy, 1.2, 1.2);
      }

      // Outer atmospheric blue glow
      const atmoGrad = ctx.createRadialGradient(cx, cy, r * 0.9, cx, cy, r * 1.2);
      atmoGrad.addColorStop(0, 'rgba(0, 240, 255, 0.45)');
      atmoGrad.addColorStop(0.5, 'rgba(0, 160, 255, 0.2)');
      atmoGrad.addColorStop(1, 'rgba(0, 240, 255, 0)');
      ctx.beginPath();
      ctx.arc(cx, cy, r * 1.2, 0, Math.PI * 2);
      ctx.fillStyle = atmoGrad;
      ctx.fill();

      // Deep Ocean Globe Base Gradient
      const oceanGrad = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, r * 0.1, cx, cy, r);
      oceanGrad.addColorStop(0, '#0a3652');
      oceanGrad.addColorStop(0.6, '#062035');
      oceanGrad.addColorStop(1, '#02101e');

      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = oceanGrad;
      ctx.fill();
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // 3D Latitudinal Parallels
      for (let lat = -60; lat <= 60; lat += 30) {
        const rad = (lat * Math.PI) / 180;
        const y = cy + Math.sin(rad) * r;
        const rx = Math.cos(rad) * r;
        ctx.beginPath();
        ctx.ellipse(cx, y, rx, rx * 0.26, 0, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.25)';
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }

      // 3D Rotating Longitudinal Meridians
      for (let lon = 0; lon < 360; lon += 45) {
        const currentLon = ((lon + (angle * 180) / Math.PI) % 360) - 180;
        const rad = (currentLon * Math.PI) / 180;
        const xOffset = Math.sin(rad) * r;
        const facing = Math.cos(rad);
        if (facing > 0) {
          ctx.beginPath();
          ctx.ellipse(cx + xOffset * 0.45, cy, Math.abs(xOffset * 0.45), r, 0, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(0, 240, 255, ${0.15 + facing * 0.2})`;
          ctx.stroke();
        }
      }

      // Rotating Detailed Continents (Africa, Europe, Asia, Americas, Australia)
      const continents = [
        { name: 'Africa', lonOffset: 0, lat: 5, w: 32, h: 42, color: '#047857' },
        { name: 'Europe', lonOffset: 10, lat: 45, w: 26, h: 22, color: '#059669' },
        { name: 'Asia', lonOffset: 70, lat: 35, w: 55, h: 44, color: '#047857' },
        { name: 'Australia', lonOffset: 125, lat: -25, w: 28, h: 22, color: '#b45309' },
        { name: 'N. America', lonOffset: -95, lat: 40, w: 45, h: 36, color: '#059669' },
        { name: 'S. America', lonOffset: -60, lat: -15, w: 28, h: 42, color: '#047857' },
      ];

      continents.forEach((cont) => {
        const contRad = ((cont.lonOffset + (angle * 180) / Math.PI) * Math.PI) / 180;
        const frontFacing = Math.cos(contRad);
        if (frontFacing > -0.25) {
          const px = cx + Math.sin(contRad) * r * 0.82;
          const py = cy - (cont.lat / 90) * r * 0.75;
          const pw = cont.w * (frontFacing + 0.35);
          const ph = cont.h * 0.8;

          ctx.beginPath();
          ctx.ellipse(px, py, Math.max(3, pw), Math.max(3, ph), 0.1, 0, Math.PI * 2);
          ctx.fillStyle = cont.color;
          ctx.fill();
          ctx.strokeStyle = '#34d399';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      });

      // Animated Orbiting Satellite with Radio Beams
      const satSpeed = angle * 2.2;
      const sx = cx + Math.cos(satSpeed) * (r + 18);
      const sy = cy + Math.sin(satSpeed) * (r + 18) * 0.45;

      // Radio pulse waves from satellite down to earth
      ctx.beginPath();
      ctx.arc(sx, sy, 7, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(sx, sy, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = '#00f0ff';
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Active Target Pin
      const targetAngle = angle + 0.3;
      if (Math.cos(targetAngle) > 0) {
        const tx = cx + Math.sin(targetAngle) * r * 0.65;
        const ty = cy - r * 0.1;
        ctx.beginPath();
        ctx.arc(tx, ty, 4.5, 0, Math.PI * 2);
        ctx.fillStyle = '#f59e0b';
        ctx.shadowColor = '#f59e0b';
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      raf = requestAnimationFrame(render);
    };

    raf = requestAnimationFrame(render);
    return () => cancelAnimationFrame(raf);
  }, [viewMode]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  return (
    <div className="flex flex-col h-full w-full gap-1.5 overflow-hidden select-none min-h-0">
      {/* ================= TOP: SAT-LINK FEED PANEL ================= */}
      <div className="rounded-xl border border-[#00f0ff]/40 bg-[#04121d]/95 backdrop-blur-md overflow-hidden flex flex-col shadow-[0_0_20px_rgba(0,240,255,0.08)] shrink-0">
        {/* Panel Main Header matching screenshot */}
        <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-cyan-500/25 bg-[#030d17]/90">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#00f0ff]" />
            <span className="font-mono-tech text-[10.5px] font-bold tracking-[0.2em] text-cyan-300">
              SAT-LINK FEED
            </span>
          </div>

          {onToggleExpand && (
            <button
              onClick={onToggleExpand}
              className="text-cyan-400 hover:text-cyan-200 transition-colors p-0.5 cursor-pointer"
              title={isExpanded ? 'Restore Feed' : 'Maximize Column'}
            >
              {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>

        {/* Sub-header: SATELLITE STREAM with live green icon & controls */}
        <div className="flex items-center justify-between px-2.5 py-1 border-b border-cyan-500/20 bg-[#020a12]/80 text-[9.5px] font-mono-tech">
          <div className="flex items-center gap-1.5 text-cyan-300 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="tracking-widest">SATELLITE STREAM</span>
          </div>
          <div className="flex items-center gap-1.5 text-cyan-400/80">
            <button
              onClick={handleRefresh}
              className="p-0.5 hover:text-cyan-200 transition-colors cursor-pointer"
              title="Refresh Stream"
            >
              <RefreshCw className={`w-2.5 h-2.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setIsMapHidden((prev) => !prev)}
              className="flex items-center gap-0.5 text-cyan-400 hover:text-cyan-200 cursor-pointer text-[8.5px]"
            >
              <ChevronDown className={`w-2.5 h-2.5 transition-transform ${isMapHidden ? '-rotate-90' : ''}`} />
              <span>{isMapHidden ? 'Show' : 'Hide'}</span>
            </button>
          </div>
        </div>

        {/* Map Header Controls: Main, 2D/3D */}
        {!isMapHidden && (
          <div className="flex items-center justify-between px-2 py-0.5 border-b border-cyan-500/20 bg-[#030f1a] text-[8.5px] font-mono-tech">
            <div className="flex items-center gap-1">
              <div className="px-1.5 py-0.2 rounded-t-xs bg-cyan-500/30 border border-cyan-400 text-cyan-100 flex items-center gap-0.5 font-bold">
                <span>Main</span>
                <span className="text-[9px]">+</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* 2D / 3D Toggle */}
              <div className="flex items-center border border-cyan-400/50 rounded p-0.2 bg-[#02080f]">
                <button
                  onClick={() => setViewMode('2D')}
                  className={`px-2 py-0.2 rounded-xs transition-colors cursor-pointer ${
                    viewMode === '2D' ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_6px_#00f0ff]' : 'text-cyan-400 hover:text-cyan-200'
                  }`}
                >
                  2D
                </button>
                <button
                  onClick={() => setViewMode('3D')}
                  className={`px-2 py-0.2 rounded-xs transition-colors cursor-pointer ${
                    viewMode === '3D' ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_6px_#00f0ff]' : 'text-cyan-400 hover:text-cyan-200'
                  }`}
                >
                  3D
                </button>
              </div>

              {(['1H', '24H', 'ALL'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTimeFilter(t as any)}
                  className={`px-1.5 py-0.2 rounded-xs text-[8px] cursor-pointer ${
                    timeFilter === t
                      ? 'border border-cyan-400 bg-cyan-500/35 text-cyan-100 font-bold'
                      : 'text-cyan-500 hover:text-cyan-300'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ================= TACTICAL SATELLITE MAP (BRIGHT, NEVER BLANK) ================= */}
        {!isMapHidden && (
          <div className="relative bg-[#021422] overflow-hidden h-[140px] border-b border-cyan-500/25 shrink-0">
            {/* Top Telemetry Overlay */}
            <div className="absolute top-1 left-2 text-[8px] font-mono-tech text-cyan-300 font-bold z-10 drop-shadow flex items-center gap-1">
              <Compass className="w-2.5 h-2.5 text-cyan-400" />
              <span>GRID 7N // SECTOR-9 [LAT 04.22°N LON 38.19°E]</span>
            </div>
            <div className="absolute top-1 right-2 text-[8px] font-mono-tech text-emerald-400 font-bold z-10 flex items-center gap-1 drop-shadow">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>UPLINK 99.2%</span>
            </div>

            {/* Sweep radar line */}
            <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden opacity-30">
              <div className="w-full h-1 bg-cyan-300 shadow-[0_0_14px_#00f0ff] animate-scanline" />
            </div>

            {/* 3D Rotating Globe Mode */}
            {viewMode === '3D' ? (
              <div className="w-full h-full flex items-center justify-center p-1">
                <canvas ref={globeCanvasRef} width={340} height={135} className="w-full h-full" />
              </div>
            ) : (
              /* 2D VIVID SATELLITE TACTICAL WORLD MAP WITH DETAILED CONTINENTS */
              <div className="w-full h-full relative origin-center">
                <svg className="w-full h-full" viewBox="0 0 500 250" preserveAspectRatio="none">
                  {/* Deep Satellite Ocean Base */}
                  <defs>
                    <linearGradient id="oceanGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#041a29" />
                      <stop offset="50%" stopColor="#021422" />
                      <stop offset="100%" stopColor="#010d17" />
                    </linearGradient>

                    {/* Continental Shelf Bathymetry Glow */}
                    <radialGradient id="shelfGlow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="rgba(0, 240, 255, 0.15)" />
                      <stop offset="100%" stopColor="transparent" />
                    </radialGradient>

                    {/* High-Tech Tactical Coordinate Grid Pattern */}
                    <pattern id="tacticalGridBright2" width="25" height="25" patternUnits="userSpaceOnUse">
                      <path d="M 25 0 L 0 0 0 25" fill="none" stroke="rgba(0, 240, 255, 0.22)" strokeWidth="0.75" />
                    </pattern>
                  </defs>

                  <rect width="100%" height="100%" fill="url(#oceanGrad2)" />
                  <rect width="100%" height="100%" fill="url(#tacticalGridBright2)" />

                  {/* Radar Concentric Rings centered on Middle East / Horn of Africa */}
                  <circle cx="310" cy="130" r="30" fill="none" stroke="rgba(0, 240, 255, 0.45)" strokeWidth="1" />
                  <circle cx="310" cy="130" r="65" fill="none" stroke="rgba(0, 240, 255, 0.3)" strokeWidth="0.8" />
                  <circle cx="310" cy="130" r="105" fill="none" stroke="rgba(0, 240, 255, 0.18)" strokeWidth="0.75" />
                  <line x1="180" y1="130" x2="440" y2="130" stroke="rgba(0, 240, 255, 0.25)" strokeDasharray="3,3" />
                  <line x1="310" y1="20" x2="310" y2="240" stroke="rgba(0, 240, 255, 0.25)" strokeDasharray="3,3" />

                  {/* DETAILED REAL CONTINENTS WITH TOPOGRAPHICAL GREEN / AMBER TERRAIN */}
                  {/* 1. North America */}
                  <path
                    d="M 35,30 C 55,20 85,25 105,40 C 120,50 140,45 130,70 C 120,95 95,110 75,115 C 60,118 50,95 40,80 C 30,65 20,45 35,30 Z"
                    fill="#065f46"
                    stroke="#10b981"
                    strokeWidth="1.2"
                  />
                  {/* Greenland */}
                  <path d="M 135,15 C 155,10 170,18 160,32 C 145,40 130,30 135,15 Z" fill="#047857" stroke="#34d399" strokeWidth="1" />

                  {/* 2. South America */}
                  <path
                    d="M 95,120 C 125,125 140,150 128,190 C 115,225 100,235 90,205 C 80,180 75,145 95,120 Z"
                    fill="#065f46"
                    stroke="#10b981"
                    strokeWidth="1.2"
                  />

                  {/* 3. Europe & Mediterranean */}
                  <path
                    d="M 215,38 C 240,32 265,45 255,75 C 240,85 220,78 210,65 C 205,52 208,42 215,38 Z"
                    fill="#047857"
                    stroke="#34d399"
                    strokeWidth="1.2"
                  />
                  {/* British Isles */}
                  <circle cx="205" cy="46" r="6" fill="#059669" stroke="#34d399" strokeWidth="0.8" />

                  {/* 4. Africa (Prominently featured in screenshot) */}
                  <path
                    d="M 215,90 C 265,85 290,110 280,165 C 270,195 245,215 225,185 C 205,155 200,115 215,90 Z"
                    fill="#064e3b"
                    stroke="#10b981"
                    strokeWidth="1.5"
                  />
                  {/* Madagascar */}
                  <path d="M 295,175 C 300,170 305,190 298,205 C 292,200 292,185 295,175 Z" fill="#059669" stroke="#34d399" strokeWidth="1" />

                  {/* 5. Middle East & Arabian Peninsula */}
                  <path
                    d="M 275,85 C 310,80 325,100 315,125 C 295,130 280,115 275,85 Z"
                    fill="#b45309"
                    stroke="#f59e0b"
                    strokeWidth="1.2"
                  />

                  {/* 6. Asia & Indian Subcontinent */}
                  <path
                    d="M 285,45 C 350,30 435,55 425,120 C 390,130 355,105 330,135 C 315,105 285,80 285,45 Z"
                    fill="#065f46"
                    stroke="#10b981"
                    strokeWidth="1.3"
                  />
                  {/* India */}
                  <path d="M 330,110 C 350,110 345,145 335,155 C 325,145 320,125 330,110 Z" fill="#047857" stroke="#34d399" strokeWidth="1" />

                  {/* 7. Australia & Indonesia */}
                  <path
                    d="M 390,165 C 445,155 460,190 425,215 C 395,205 380,185 390,165 Z"
                    fill="#b45309"
                    stroke="#f59e0b"
                    strokeWidth="1.2"
                  />

                  {/* Orbital Satellite Trajectory Curve */}
                  <path
                    d="M 20,200 Q 250,30 480,90"
                    fill="none"
                    stroke="#00f0ff"
                    strokeWidth="1.2"
                    strokeDasharray="4,4"
                  />
                </svg>

                {/* ================= REAL HOTSPOTS MATCHING SCREENSHOT WITH GLOWING PINS ================= */}
                {/* 1. Drought in Somalia (East Africa) */}
                <div
                  className="absolute top-[52%] left-[58%] -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 group"
                  onClick={() => setSelectedHotspot(INITIAL_HOTSPOTS[0])}
                >
                  <span className="w-3.5 h-3.5 rounded-full bg-amber-400 block shadow-[0_0_12px_#f59e0b] animate-ping" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-300 block shadow-[0_0_8px_#f59e0b] absolute top-0.5 left-0.5" />
                  <div className="absolute left-4 top-[-10px] whitespace-nowrap bg-[#020b13]/95 border border-amber-400 rounded px-1.5 py-0.5 text-[8.5px] font-mono-tech text-amber-200 shadow-[0_0_10px_rgba(245,158,11,0.5)] font-bold flex items-center gap-1">
                    <Flame className="w-2.5 h-2.5 text-amber-400" />
                    <span>Drought in Somalia</span>
                  </div>
                </div>

                {/* 2. Tropical Storm Gerda (South Indian Ocean) */}
                <div
                  className="absolute top-[72%] left-[68%] -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 group"
                  onClick={() => setSelectedHotspot(INITIAL_HOTSPOTS[1])}
                >
                  <span className="w-3.5 h-3.5 rounded-full bg-cyan-400 block shadow-[0_0_12px_#00f0ff] animate-ping" />
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-300 block shadow-[0_0_8px_#00f0ff] absolute top-0.5 left-0.5" />
                  <div className="absolute left-4 top-[-10px] whitespace-nowrap bg-[#020b13]/95 border border-cyan-400 rounded px-1.5 py-0.5 text-[8.5px] font-mono-tech text-cyan-200 shadow-[0_0_10px_rgba(0,240,255,0.5)] font-bold flex items-center gap-1">
                    <CloudRain className="w-2.5 h-2.5 text-cyan-300" />
                    <span>Tropical Storm Gerda</span>
                  </div>
                </div>

                {/* 3. Drought in Democratic Congo */}
                <div
                  className="absolute top-[58%] left-[48%] -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 group"
                  onClick={() => setSelectedHotspot(INITIAL_HOTSPOTS[2])}
                >
                  <span className="w-3 h-3 rounded-full bg-amber-400 block shadow-[0_0_10px_#f59e0b] animate-ping" />
                  <span className="w-2 h-2 rounded-full bg-amber-300 block absolute top-0.5 left-0.5" />
                  <div className="absolute right-4 top-[-10px] whitespace-nowrap bg-[#020b13]/95 border border-amber-400 rounded px-1.5 py-0.5 text-[8.5px] font-mono-tech text-amber-200 shadow-[0_0_10px_rgba(245,158,11,0.5)] font-bold">
                    Drought in Democratic...
                  </div>
                </div>

                {/* 4. Middle East Tensions (Red Sea) */}
                <div
                  className="absolute top-[40%] left-[61%] -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 group"
                  onClick={() => setSelectedHotspot(INITIAL_HOTSPOTS[3])}
                >
                  <span className="w-3 h-3 rounded-full bg-red-400 block shadow-[0_0_12px_#ef4444] animate-ping" />
                  <span className="w-2 h-2 rounded-full bg-red-500 block absolute top-0.5 left-0.5" />
                  <div className="absolute left-4 top-[-10px] whitespace-nowrap bg-[#020b13]/95 border border-red-400 rounded px-1.5 py-0.5 text-[8.5px] font-mono-tech text-red-200 shadow-[0_0_10px_rgba(239,68,68,0.5)] font-bold flex items-center gap-1">
                    <ShieldAlert className="w-2.5 h-2.5 text-red-400" />
                    <span>Middle East Tensions</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Selected Hotspot Intelligence Dossier Bar */}
        {selectedHotspot && !isMapHidden && (
          <div className="px-2.5 py-1.5 bg-[#030d17] border-b border-cyan-500/20 text-[9px] font-mono-tech">
            <div className="flex items-center justify-between text-cyan-200 font-bold mb-0.5">
              <span className="flex items-center gap-1 text-amber-300">
                <AlertTriangle className="w-3 h-3" />
                {selectedHotspot.title}
              </span>
              <span className="text-[8px] text-cyan-400">{selectedHotspot.timeAgo}</span>
            </div>
            <p className="text-[8px] text-slate-300 leading-tight line-clamp-2">
              {selectedHotspot.description}
            </p>
          </div>
        )}
      </div>

      {/* ================= BOTTOM: TODAY'S HEADLINES STREAM ================= */}
      <div className="flex-1 rounded-xl border border-[#00f0ff]/40 bg-[#04121d]/95 backdrop-blur-md overflow-hidden flex flex-col shadow-[0_0_20px_rgba(0,240,255,0.08)] min-h-0">
        {/* Headlines Header */}
        <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-cyan-500/25 bg-[#030d17]/90 shrink-0">
          <div className="flex items-center gap-1.5">
            <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
            <span className="font-mono-tech text-[10.5px] font-bold tracking-[0.2em] text-cyan-300">
              TODAY HEADLINES
            </span>
          </div>
          <span className="text-[8.5px] font-mono-tech text-cyan-400/80 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-500/30">
            {headlines.length} DISPATCHES
          </span>
        </div>

        {/* News Feed Stream List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-2 cyber-scrollbar min-h-0">
          {headlines.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedHeadline(selectedHeadline?.id === item.id ? null : item)}
              className={`p-2 rounded-lg border transition-all cursor-pointer ${
                selectedHeadline?.id === item.id
                  ? 'border-cyan-400 bg-cyan-950/50 shadow-[0_0_12px_rgba(0,240,255,0.2)]'
                  : 'border-cyan-500/25 bg-[#020b13]/80 hover:border-cyan-400/60 hover:bg-[#031524]'
              }`}
            >
              <div className="flex items-center justify-between text-[8px] font-mono-tech text-cyan-400 mb-1">
                <span className="px-1.5 py-0.2 rounded bg-cyan-950/90 border border-cyan-500/40 text-cyan-200 font-bold">
                  {item.number} • {item.category}
                </span>
                <span className="text-emerald-400 font-bold">VERIFIED</span>
              </div>

              <h4 className="text-[10px] font-semibold text-cyan-100 leading-snug line-clamp-2">
                {item.title}
              </h4>

              {selectedHeadline?.id === item.id && (
                <div className="mt-2 pt-2 border-t border-cyan-500/30 text-[9px] text-cyan-200/90 leading-relaxed font-sans bg-[#010912]/80 p-1.5 rounded">
                  {item.detail}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
