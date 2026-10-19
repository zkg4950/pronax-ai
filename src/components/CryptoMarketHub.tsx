import React, { useState, useEffect, useRef } from 'react';
import {
  TrendingUp,
  TrendingDown,
  BarChart2,
  Share2,
  Copy,
  Check,
  Sparkles,
  Zap,
  Volume2,
  VolumeX,
  X,
  Shield,
  Send,
  RefreshCw,
  Search,
  ExternalLink,
  Flame,
  MessageCircle,
  Twitter,
  Target,
  DollarSign,
  Activity,
  Heart,
  Sliders,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Cpu,
} from 'lucide-react';
import { CryptoAsset, CryptoMarketingCampaign, EmotionAnalysis } from '../types';
import { playAgentSpeech, playConfirmChime } from '../utils/audioEffects';

interface CryptoMarketHubProps {
  isOpen: boolean;
  onClose: () => void;
  userEmotion?: EmotionAnalysis;
  initialTab?: 'analysis' | 'marketing';
  onExecuteCommand?: (cmd: string) => void;
}

const DEFAULT_ASSETS: CryptoAsset[] = [
  {
    symbol: 'BTC',
    name: 'Bitcoin',
    price: 67840.5,
    change24h: 3.42,
    high24h: 68450.0,
    low24h: 65210.0,
    volume: '$38.4B',
    rsi: 63.8,
    macd: 'bullish',
    trend: 'STRONG_BUY',
    support: 65500,
    resistance: 68900,
    marketCap: '$1.33T',
    sparkline: [65200, 65800, 66100, 65900, 66700, 67200, 67840],
  },
  {
    symbol: 'ETH',
    name: 'Ethereum',
    price: 3542.2,
    change24h: 2.15,
    high24h: 3590.0,
    low24h: 3420.0,
    volume: '$19.2B',
    rsi: 58.2,
    macd: 'bullish',
    trend: 'BUY',
    support: 3400,
    resistance: 3620,
    marketCap: '$425B',
    sparkline: [3420, 3450, 3480, 3440, 3500, 3520, 3542],
  },
  {
    symbol: 'SOL',
    name: 'Solana',
    price: 182.6,
    change24h: 7.84,
    high24h: 186.2,
    low24h: 168.0,
    volume: '$7.8B',
    rsi: 71.4,
    macd: 'bullish',
    trend: 'STRONG_BUY',
    support: 170,
    resistance: 190,
    marketCap: '$84B',
    sparkline: [168, 171, 174, 172, 177, 180, 182.6],
  },
  {
    symbol: 'BNB',
    name: 'BNB Chain',
    price: 594.8,
    change24h: 1.12,
    high24h: 602.0,
    low24h: 586.0,
    volume: '$1.4B',
    rsi: 54.1,
    macd: 'neutral',
    trend: 'BUY',
    support: 580,
    resistance: 610,
    marketCap: '$88B',
    sparkline: [586, 589, 592, 590, 593, 595, 594.8],
  },
  {
    symbol: 'XRP',
    name: 'Ripple',
    price: 0.584,
    change24h: -1.24,
    high24h: 0.602,
    low24h: 0.578,
    volume: '$1.8B',
    rsi: 48.6,
    macd: 'bearish',
    trend: 'NEUTRAL',
    support: 0.56,
    resistance: 0.62,
    marketCap: '$32B',
    sparkline: [0.598, 0.595, 0.59, 0.582, 0.58, 0.586, 0.584],
  },
  {
    symbol: 'DOGE',
    name: 'Dogecoin',
    price: 0.142,
    change24h: 5.48,
    high24h: 0.148,
    low24h: 0.134,
    volume: '$2.1B',
    rsi: 66.2,
    macd: 'bullish',
    trend: 'BUY',
    support: 0.13,
    resistance: 0.155,
    marketCap: '$20.8B',
    sparkline: [0.134, 0.136, 0.139, 0.138, 0.141, 0.143, 0.142],
  },
  {
    symbol: 'PEPE',
    name: 'Pepe',
    price: 0.0000098,
    change24h: 11.2,
    high24h: 0.0000104,
    low24h: 0.0000087,
    volume: '$1.2B',
    rsi: 74.8,
    macd: 'bullish',
    trend: 'STRONG_BUY',
    support: 0.0000088,
    resistance: 0.0000115,
    marketCap: '$4.1B',
    sparkline: [0.0000087, 0.000009, 0.0000092, 0.0000091, 0.0000095, 0.0000097, 0.0000098],
  },
];

export const CryptoMarketHub: React.FC<CryptoMarketHubProps> = ({
  isOpen,
  onClose,
  userEmotion,
  initialTab = 'analysis',
  onExecuteCommand,
}) => {
  const [activeTab, setActiveTab] = useState<'analysis' | 'marketing'>(initialTab);
  const [selectedAsset, setSelectedAsset] = useState<CryptoAsset>(DEFAULT_ASSETS[0]);
  const [timeframe, setTimeframe] = useState<'15M' | '1H' | '4H' | '24H' | '7D'>('1H');
  const [customTokenSearch, setCustomTokenSearch] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [isSpeakingAnalysis, setIsSpeakingAnalysis] = useState(false);
  const [isGeneratingCampaign, setIsGeneratingCampaign] = useState(false);

  // Marketing Generator State
  const [marketingToken, setMarketingToken] = useState('$STONIC');
  const [marketingNarrative, setMarketingNarrative] = useState('Autonomous 3D AI Agents & Crypto Quant Intelligence');
  const [marketingAudience, setMarketingAudience] = useState<'degen' | 'institutional' | 'solana_community' | 'general'>('solana_community');
  const [campaignPlatform, setCampaignPlatform] = useState<'twitter' | 'telegram' | 'kol_pitch' | 'meme_viral'>('twitter');
  const [generatedContent, setGeneratedContent] = useState<string>('');
  const [blastStatus, setBlastStatus] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  // Generate initial marketing copy when opened
  useEffect(() => {
    generateDefaultCampaign();
  }, [marketingToken, campaignPlatform, marketingAudience]);

  // Live Chart Drawer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let offset = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Background grid
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.07)';
      ctx.lineWidth = 1;

      const numRows = 6;
      for (let i = 0; i <= numRows; i++) {
        const y = (canvas.height / numRows) * i;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      const numCols = 8;
      for (let j = 0; j <= numCols; j++) {
        const x = (canvas.width / numCols) * j;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }

      // Generate simulated candlesticks & smoothed line
      const points = 24;
      const step = canvas.width / (points - 1);
      const isPositive = selectedAsset.change24h >= 0;
      const lineColor = isPositive ? '#10b981' : '#f43f5e';
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, isPositive ? 'rgba(16, 185, 129, 0.35)' : 'rgba(244, 63, 94, 0.35)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

      // Seed pseudo-random curve based on price
      const basePrice = selectedAsset.price;
      const wavePoints: { x: number; y: number; open: number; close: number; high: number; low: number }[] = [];

      for (let i = 0; i < points; i++) {
        const x = i * step;
        const noise = Math.sin((i + offset * 0.05) * 0.8) * 18 + Math.cos(i * 0.4) * 12;
        const trendSlope = isPositive ? (i / points) * 35 : -(i / points) * 30;
        const y = canvas.height * 0.5 - trendSlope + noise;
        const candleHeight = 12 + Math.abs(Math.sin(i * 3)) * 25;
        const high = y - candleHeight * 0.6;
        const low = y + candleHeight * 0.6;
        const open = y - (Math.sin(i) > 0 ? candleHeight * 0.4 : -candleHeight * 0.4);
        const close = y + (Math.sin(i) > 0 ? candleHeight * 0.4 : -candleHeight * 0.4);

        wavePoints.push({ x, y, open, close, high, low });
      }

      // Draw Candlesticks in background
      wavePoints.forEach((pt) => {
        const candleGreen = pt.close <= pt.open;
        ctx.strokeStyle = candleGreen ? '#10b981' : '#f43f5e';
        ctx.fillStyle = candleGreen ? 'rgba(16, 185, 129, 0.65)' : 'rgba(244, 63, 94, 0.65)';
        ctx.lineWidth = 1.2;

        // Wick
        ctx.beginPath();
        ctx.moveTo(pt.x, pt.high);
        ctx.lineTo(pt.x, pt.low);
        ctx.stroke();

        // Body
        const top = Math.min(pt.open, pt.close);
        const height = Math.max(4, Math.abs(pt.close - pt.open));
        ctx.fillRect(pt.x - 4, top, 8, height);
      });

      // Draw EMA Trend Ribbon Line
      ctx.beginPath();
      ctx.moveTo(wavePoints[0].x, wavePoints[0].y);
      for (let i = 1; i < wavePoints.length; i++) {
        const xc = (wavePoints[i].x + wavePoints[i - 1].x) / 2;
        const yc = (wavePoints[i].y + wavePoints[i - 1].y) / 2;
        ctx.quadraticCurveTo(wavePoints[i - 1].x, wavePoints[i - 1].y, xc, yc);
      }
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 10;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Area fill
      ctx.lineTo(canvas.width, canvas.height);
      ctx.lineTo(0, canvas.height);
      ctx.closePath();
      ctx.fillStyle = gradient;
      ctx.fill();

      // Current Price Pointer & Pulse Dot
      const last = wavePoints[wavePoints.length - 1];
      ctx.beginPath();
      ctx.arc(last.x - 4, last.y, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(last.x - 4, last.y, 9 + Math.sin(offset * 0.1) * 3, 0, Math.PI * 2);
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 2;
      ctx.stroke();

      offset += 0.8;
      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [selectedAsset, timeframe]);

  const generateDefaultCampaign = () => {
    let copy = '';
    if (campaignPlatform === 'twitter') {
      copy = `🚨 ALPHA ALERT: Why $STONIC is poised to disrupt the AI Agent narrative in 2026 🧵👇\n\n1/ The market is evolving from basic chatbots into fully autonomous, 3D spatial multi-agent operating systems that trade, analyze, and execute.\n\n2/ Meet the crew:\n🔹 Alice: On-Chain Whale & Intel Sentinel\n🔹 Bob: Smart Contract & Zero-Trust Firewall\n🔹 Carol: High-Velocity Stream Architect\n🔹 Dave: Autonomous Crypto Growth & Market Maker\n\n3/ Metrics & Tokenomics:\n💎 100% Locked Liquidity Pool\n⚡ Zero Buy/Sell Taxes\n🌐 Real-Time Dual Voice (Urdu / Saraiki / English)\n\n4/ Bullish setup forming on 4H chart with RSI breaking 64. Whales accumulating. Don't fade the autonomous office supercycle.\n\n🔗 Join the revolution: t.me/StonicAI\n#CryptoAlpha #AIAgents #Solana #Bitcoin #100xGem`;
    } else if (campaignPlatform === 'telegram') {
      copy = `🔥 [OFFICIAL STONIC AI ANNOUNCEMENT] 🔥\n\n🚀 BREAKING: QUANT SCANNER HAS DETECTED MAJOR INFLOWS!\n\nAll systems operational across the 3D Agent Office. Bob has verified security clearance on all smart contracts, and Dave is launching viral marketing round 2!\n\n📊 Live Stats:\n• Liquidity: 100% Locked\n• Autonomous AI Office: ACTIVE\n• Sentiment Index: 78% EXTREME GREED\n• Voice Synthesis: Studio Clarity Active\n\n👉 CA: 7xK...ston1c99\n📈 Chart: dexscreener.com/solana/stonic\n\n💎 Diamond hands only. Jani chill mahol vich pump enjoy karo! 🚀`;
    } else if (campaignPlatform === 'kol_pitch') {
      copy = `Subject: Strategic Alpha Collaboration: $STONIC AI (Autonomous Multi-Agent Office)\n\nHey Alpha Caller,\n\nCame across your recent high-conviction breakdown on AI narratives. Loved your thesis.\n\nWe’re launching Stonic AI—the world's first interactive 3D spatial multi-agent trading office with real-time Roman Urdu / Saraiki voice synthesis, automated technical analysis, and live crypto marketing execution.\n\nKey Highlights:\n- Working live product (No vaporware)\n- 100% fair launch, locked LP\n- Dedicated marketing treasury & custom allocation for top tier KOLs\n\nWould love to offer you an early advisory allocation and whitelist spot for your private community.\n\nDeck & Live demo: https://stonic.ai\nTelegram: @StonicAlphaDesk\n\nBest,\nDave // Head of Crypto Growth`;
    } else {
      copy = `POV: You told your friends to buy $STONIC at $0.0001 and now they think you have insider connections with autonomous AI agents 😂\n\nAgent Dave: "Market pump ho riha hey jani!"\nAgent Alice: "Stop-loss trail karke profit lock kar lo!"\n\nMemes are utility. Autonomous offices are the endgame. 🚀\n#SolanaMeme #AIAgents #CryptoComedy #ToTheMoon`;
    }
    setGeneratedContent(copy);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedContent);
    setIsCopied(true);
    playConfirmChime();
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleSimulateBlast = () => {
    playConfirmChime();
    setBlastStatus('Broadcasting campaign across 18 crypto alpha channels & Twitter bot swarm...');
    playAgentSpeech(
      'Dave bol riha hey jani! Marketing campaign foran crypto channels te blast kar ditti hey, viral hype live shuru ho chuki hey!',
      'dave'
    );
    setTimeout(() => {
      setBlastStatus('✅ Campaign Live! Estimated Impressions: 24,800 | CTR: 6.8% | 142 Retweets');
    }, 2500);
  };

  const handleSpeakAnalysis = () => {
    setIsSpeakingAnalysis(true);
    const speechText =
      selectedAsset.change24h >= 0
        ? `Jani ${selectedAsset.name} da analysis bilkul bullish hey! Current price ${selectedAsset.price} dollars hey te RSI 64 te support mazboot hey. Dave aur Alice suggest kar rahay han key stop loss safe rakho te profit targets trail karo!`
        : `Jani ${selectedAsset.name} filhal consolidation te minor dip vich hey. Support ${selectedAsset.support} dollars te mojood hey. Bob security audit karke fikar door kar riha hey, panic sell bilkul na karna!`;

    playAgentSpeech(speechText, 'alice', {
      onEnd: () => setIsSpeakingAnalysis(false),
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200 font-mono-tech">
      <div className="relative w-full max-w-6xl max-h-[95vh] bg-[#020b14] border border-[#00f0ff]/40 rounded-2xl shadow-[0_0_50px_rgba(0,240,255,0.25)] flex flex-col overflow-hidden text-cyan-100">
        {/* Top Header Bar */}
        <div className="flex flex-wrap items-center justify-between px-4 py-3 bg-[#031626] border-b border-cyan-500/30 gap-2 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-400 flex items-center justify-center shadow-[0_0_15px_#00f0ff]">
              <Cpu className="w-5 h-5 text-cyan-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm tracking-wider text-white">STONIC QUANT // CRYPTO TERMINAL</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">
                  LIVE INTELLIGENCE
                </span>
              </div>
              <p className="text-[11px] text-cyan-400/80">
                Autonomous Multi-Agent Technical Analysis & Viral Growth Suite
              </p>
            </div>
          </div>

          {/* User Emotion Indicator */}
          {userEmotion && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-cyan-950/60 border border-cyan-500/40 rounded-lg text-xs">
              <span className="text-sm">{userEmotion.emoji}</span>
              <div>
                <span className="text-slate-400 text-[10px] block">USER FEELING:</span>
                <span className="text-cyan-200 font-bold">{userEmotion.label}</span>
              </div>
            </div>
          )}

          {/* Tab Selector & Close */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-[#020d18] p-1 rounded-xl border border-cyan-500/40">
              <button
                onClick={() => {
                  setActiveTab('analysis');
                  playConfirmChime();
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'analysis'
                    ? 'bg-cyan-500 text-slate-950 shadow-[0_0_12px_#00f0ff]'
                    : 'text-cyan-300 hover:text-white'
                }`}
              >
                <BarChart2 className="w-3.5 h-3.5" />
                <span>MARKET ANALYSIS</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab('marketing');
                  playConfirmChime();
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'marketing'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-[0_0_12px_#f59e0b]'
                    : 'text-amber-300 hover:text-white'
                }`}
              >
                <Flame className="w-3.5 h-3.5" />
                <span>CRYPTO MARKETING</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-cyan-950/40 hover:bg-rose-950/60 border border-cyan-500/40 hover:border-rose-400 text-cyan-300 hover:text-rose-200 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-4">
          {activeTab === 'analysis' ? (
            /* =================== TAB 1: CRYPTO MARKET & ANALYSIS =================== */
            <div className="space-y-4">
              {/* Asset Strip */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
                {DEFAULT_ASSETS.map((asset) => {
                  const isSelected = selectedAsset.symbol === asset.symbol;
                  const isUp = asset.change24h >= 0;
                  return (
                    <button
                      key={asset.symbol}
                      onClick={() => {
                        setSelectedAsset(asset);
                        playConfirmChime();
                      }}
                      className={`flex flex-col p-2.5 rounded-xl border min-w-[130px] shrink-0 transition-all cursor-pointer text-left ${
                        isSelected
                          ? 'bg-[#03233b] border-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.3)]'
                          : 'bg-[#021321] border-cyan-500/20 hover:border-cyan-500/50'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="font-bold text-xs text-white">{asset.symbol}</span>
                        <span
                          className={`text-[10px] font-bold flex items-center ${
                            isUp ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {isUp ? '+' : ''}
                          {asset.change24h}%
                        </span>
                      </div>
                      <span className="text-sm font-bold text-cyan-200 mt-1">
                        ${asset.price.toLocaleString()}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Main Chart & Live Indicators Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* 2-Columns: Realtime Canvas Chart */}
                <div className="lg:col-span-2 bg-[#02111d] border border-cyan-500/30 rounded-2xl p-4 flex flex-col relative overflow-hidden">
                  <div className="flex flex-wrap items-center justify-between pb-3 border-b border-cyan-500/20 gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-white tracking-wide">
                          {selectedAsset.name} ({selectedAsset.symbol}/USDT)
                        </h3>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            selectedAsset.trend === 'STRONG_BUY'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/50'
                              : 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50'
                          }`}
                        >
                          {selectedAsset.trend}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs mt-1">
                        <span className="text-2xl font-bold text-white tracking-tight">
                          ${selectedAsset.price.toLocaleString()}
                        </span>
                        <span
                          className={`font-bold flex items-center gap-0.5 ${
                            selectedAsset.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {selectedAsset.change24h >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                          {selectedAsset.change24h}% (24h)
                        </span>
                      </div>
                    </div>

                    {/* Timeframe Selectors */}
                    <div className="flex items-center gap-1 bg-[#010810] p-1 rounded-lg border border-cyan-500/30">
                      {(['15M', '1H', '4H', '24H', '7D'] as const).map((tf) => (
                        <button
                          key={tf}
                          onClick={() => setTimeframe(tf)}
                          className={`px-2.5 py-1 rounded text-[11px] font-bold cursor-pointer transition-colors ${
                            timeframe === tf
                              ? 'bg-cyan-500 text-slate-950 shadow-[0_0_8px_#00f0ff]'
                              : 'text-cyan-400 hover:text-white'
                          }`}
                        >
                          {tf}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Interactive Chart Canvas */}
                  <div className="relative w-full h-[260px] sm:h-[300px] mt-2">
                    <canvas
                      ref={canvasRef}
                      width={800}
                      height={300}
                      className="w-full h-full block rounded-lg"
                    />
                    <div className="absolute top-2 left-2 text-[10px] bg-slate-950/80 px-2 py-1 rounded border border-cyan-500/30 text-cyan-300">
                      EMA(20) Ribbon | Stochastic RSI: {selectedAsset.rsi} | Volume: {selectedAsset.volume}
                    </div>
                  </div>

                  {/* Support / Resistance Footer */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-cyan-500/20 text-xs mt-2">
                    <div className="p-2 rounded-lg bg-[#010912] border border-cyan-500/20">
                      <span className="text-[10px] text-slate-400 block">SUPPORT LEVEL</span>
                      <span className="text-emerald-300 font-bold">${selectedAsset.support.toLocaleString()}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-[#010912] border border-cyan-500/20">
                      <span className="text-[10px] text-slate-400 block">RESISTANCE LEVEL</span>
                      <span className="text-rose-300 font-bold">${selectedAsset.resistance.toLocaleString()}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-[#010912] border border-cyan-500/20">
                      <span className="text-[10px] text-slate-400 block">24H HIGH / LOW</span>
                      <span className="text-cyan-200 font-bold">
                        ${selectedAsset.high24h.toLocaleString()} / ${selectedAsset.low24h.toLocaleString()}
                      </span>
                    </div>
                    <div className="p-2 rounded-lg bg-[#010912] border border-cyan-500/20">
                      <span className="text-[10px] text-slate-400 block">MARKET CAP</span>
                      <span className="text-cyan-200 font-bold">{selectedAsset.marketCap}</span>
                    </div>
                  </div>
                </div>

                {/* 1-Column: Deep AI Multi-Agent Intel & Voice Briefing */}
                <div className="bg-[#02111d] border border-cyan-500/30 rounded-2xl p-4 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between pb-2 border-b border-cyan-500/20">
                      <span className="text-xs font-bold text-cyan-200 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                        AI CREW DEEP ANALYSIS
                      </span>
                      <button
                        onClick={handleSpeakAnalysis}
                        disabled={isSpeakingAnalysis}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-500/20 border border-cyan-400 text-cyan-200 hover:bg-cyan-500/40 text-[10px] font-bold cursor-pointer disabled:opacity-50"
                      >
                        <Volume2 className="w-3.5 h-3.5 text-cyan-300" />
                        <span>{isSpeakingAnalysis ? 'SPEAKING...' : 'VOICE BRIEF'}</span>
                      </button>
                    </div>

                    {/* Agent Perspectives */}
                    <div className="mt-3 space-y-2.5 text-xs">
                      {/* Alice: Intel & Whale Tracker */}
                      <div className="p-2.5 rounded-xl bg-[#031d33] border border-cyan-500/40">
                        <div className="flex items-center justify-between text-[11px] text-cyan-300 font-bold mb-1">
                          <span className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-cyan-400" />
                            Alice // Intel & On-Chain Whales
                          </span>
                          <span className="text-emerald-400 font-mono">BULLISH INFLOW</span>
                        </div>
                        <p className="text-slate-300 text-[11px] leading-relaxed">
                          Whale clusters on {selectedAsset.symbol} ne last 24 ghante vich 12,400 coins absorb kitay
                          ne. Exchange reserves te drop show ho riha hey, accumulation strong hey!
                        </p>
                      </div>

                      {/* Bob: Security & Liquidity Audit */}
                      <div className="p-2.5 rounded-xl bg-[#021626] border border-sky-500/40">
                        <div className="flex items-center justify-between text-[11px] text-sky-300 font-bold mb-1">
                          <span className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-sky-400" />
                            Bob // Security & Smart Contract
                          </span>
                          <span className="text-emerald-400 font-mono">0 VULNERABILITIES</span>
                        </div>
                        <p className="text-slate-300 text-[11px] leading-relaxed">
                          Honeypot audit clear hey, liquidity multisig te 100% locked hey. Port verification te zero
                          anomalies miliyan han.
                        </p>
                      </div>

                      {/* Dave: Trading Strategy & Alpha Scalp */}
                      <div className="p-2.5 rounded-xl bg-[#1f1505] border border-amber-500/40">
                        <div className="flex items-center justify-between text-[11px] text-amber-300 font-bold mb-1">
                          <span className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-amber-400" />
                            Dave // Alpha & Growth Strategist
                          </span>
                          <span className="text-amber-400 font-mono">BREAKOUT TARGET</span>
                        </div>
                        <p className="text-slate-300 text-[11px] leading-relaxed">
                          Next breakout target ${selectedAsset.resistance.toLocaleString()} ban riha hey. Entry plan
                          tayar hey, stop-loss strict ${selectedAsset.support.toLocaleString()} rakho!
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Quick Action Button to Open Marketing */}
                  <button
                    onClick={() => {
                      setMarketingToken(`$${selectedAsset.symbol}`);
                      setActiveTab('marketing');
                      playConfirmChime();
                    }}
                    className="w-full py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 hover:brightness-110 shadow-[0_0_15px_rgba(0,240,255,0.4)] cursor-pointer"
                  >
                    <Flame className="w-4 h-4" />
                    <span>LAUNCH MARKETING CAMPAIGN FOR {selectedAsset.symbol}</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* =================== TAB 2: CRYPTO MARKETING SUITE =================== */
            <div className="space-y-4">
              <div className="p-3 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-transparent border border-amber-500/30 rounded-xl flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-amber-300 flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-orange-400 animate-bounce" />
                    AUTONOMOUS CRYPTO VIRAL MARKETING ENGINE ("CRYPTO MAI MARKITE KARE")
                  </h3>
                  <p className="text-xs text-slate-400">
                    Dave aur Carol da customized viral growth tool: Twitter threads, Telegram announcements, KOL pitches & meme marketing.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      playAgentSpeech(
                        'Dave hazir hey jani! Crypto marketing campaign full hype te viral reach wastey tayar hey. Copy karo ya direct blast karo!',
                        'dave'
                      );
                    }}
                    className="px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-400 text-amber-300 hover:bg-amber-500/40 text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>DAVE VOICE PITCH</span>
                  </button>
                </div>
              </div>

              {/* Campaign Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-[#021321] border border-cyan-500/30">
                  <label className="text-[11px] text-cyan-300 font-bold block mb-1">TARGET TOKEN / COIN</label>
                  <input
                    type="text"
                    value={marketingToken}
                    onChange={(e) => setMarketingToken(e.target.value)}
                    placeholder="e.g. $STONIC, $SOL, $PEPE..."
                    className="w-full px-3 py-1.5 rounded-lg bg-[#010912] border border-cyan-500/40 text-white text-xs focus:outline-none focus:border-cyan-300"
                  />
                </div>

                <div className="p-3 rounded-xl bg-[#021321] border border-cyan-500/30">
                  <label className="text-[11px] text-cyan-300 font-bold block mb-1">PLATFORM FORMAT</label>
                  <select
                    value={campaignPlatform}
                    onChange={(e) => setCampaignPlatform(e.target.value as any)}
                    className="w-full px-3 py-1.5 rounded-lg bg-[#010912] border border-cyan-500/40 text-white text-xs focus:outline-none focus:border-cyan-300"
                  >
                    <option value="twitter">🐦 Twitter / X Alpha Thread</option>
                    <option value="telegram">💬 Telegram & Discord Hype Blast</option>
                    <option value="kol_pitch">🎯 KOL & Influencer Outreach DM</option>
                    <option value="meme_viral">🐸 Meme Lore & Degen Hype</option>
                  </select>
                </div>

                <div className="p-3 rounded-xl bg-[#021321] border border-cyan-500/30">
                  <label className="text-[11px] text-cyan-300 font-bold block mb-1">TARGET AUDIENCE</label>
                  <select
                    value={marketingAudience}
                    onChange={(e) => setMarketingAudience(e.target.value as any)}
                    className="w-full px-3 py-1.5 rounded-lg bg-[#010912] border border-cyan-500/40 text-white text-xs focus:outline-none focus:border-cyan-300"
                  >
                    <option value="solana_community">Solana & Degen Alpha Community</option>
                    <option value="institutional">Institutional & Serious Tech Investors</option>
                    <option value="degen">High-Octane Meme Traders</option>
                    <option value="general">Global Crypto Retail</option>
                  </select>
                </div>
              </div>

              {/* Generated Marketing Campaign Display */}
              <div className="bg-[#02111d] border border-cyan-500/30 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-cyan-500/20">
                  <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    AUTONOMOUS CAMPAIGN COPY // READY TO POST
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopy}
                      className="flex items-center gap-1 px-3 py-1 rounded-lg bg-cyan-500/20 border border-cyan-400 text-cyan-200 hover:bg-cyan-500/40 text-xs font-bold cursor-pointer transition-colors"
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{isCopied ? 'COPIED!' : 'COPY TO CLIPBOARD'}</span>
                    </button>
                    <button
                      onClick={generateDefaultCampaign}
                      className="p-1 rounded-lg bg-cyan-950 border border-cyan-500/40 hover:bg-cyan-800 text-cyan-300 cursor-pointer"
                      title="Regenerate copy"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <textarea
                  value={generatedContent}
                  onChange={(e) => setGeneratedContent(e.target.value)}
                  rows={10}
                  className="w-full p-3 rounded-xl bg-[#010912] border border-cyan-500/30 text-slate-100 text-xs leading-relaxed focus:outline-none focus:border-cyan-300 font-mono"
                />

                {/* Blast Simulation Status */}
                {blastStatus && (
                  <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-400/50 text-emerald-200 text-xs flex items-center gap-2 animate-in fade-in">
                    <Zap className="w-4 h-4 text-emerald-300 animate-pulse" />
                    <span>{blastStatus}</span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>Viral Potential: 94/100 (High Engagement Probability)</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSimulateBlast}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 font-bold text-xs hover:brightness-110 shadow-[0_0_15px_rgba(245,158,11,0.4)] cursor-pointer"
                    >
                      <Zap className="w-4 h-4" />
                      <span>SIMULATE CAMPAIGN BLAST</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
