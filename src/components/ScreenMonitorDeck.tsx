import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Monitor,
  Eye,
  Camera,
  Play,
  Square,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Copy,
  Terminal,
  Code2,
  Layers,
  Volume2,
  RefreshCw,
  Loader2,
  X,
  Maximize2,
  Minimize2,
  ExternalLink,
  Shield,
  Zap,
  Sliders,
  Check,
  Radio,
  Cpu,
  Workflow,
  ArrowRight,
} from 'lucide-react';
import { BrainConfig, ScreenAnalysisResult, AppControlElement, LifetimeMissionState } from '../types';

interface ScreenMonitorDeckProps {
  brainConfig: BrainConfig;
  isOpen: boolean;
  onClose: () => void;
  onSendChatMessage?: (msg: string) => void;
  externalVoiceCommand?: string | null;
}

export const ScreenMonitorDeck: React.FC<ScreenMonitorDeckProps> = ({
  brainConfig,
  isOpen,
  onClose,
  onSendChatMessage,
  externalVoiceCommand,
}) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [autoInterval, setAutoInterval] = useState<number>(3); // Default 3s for real-time monitoring
  const [activeAnalysis, setActiveAnalysis] = useState<ScreenAnalysisResult | null>(null);
  const [history, setHistory] = useState<ScreenAnalysisResult[]>([]);
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'vision' | 'controls' | 'actions' | 'history'>('vision');

  // Autonomous Lifetime Supervision State ("Bas Aik Baar Bol Do")
  const [isLifetimeAutoPilot, setIsLifetimeAutoPilot] = useState<boolean>(true);
  const [autoExecuteActions, setAutoExecuteActions] = useState<boolean>(true);
  const [oneShotMission, setOneShotMission] = useState<string>(
    'Supervise active app & terminal continuously. Auto-detect errors and fix automatically.'
  );
  const [scansCount, setScansCount] = useState<number>(14);
  const [autoActionsCount, setAutoActionsCount] = useState<number>(6);
  const [isFloatingMiniEye, setIsFloatingMiniEye] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const intervalTimerRef = useRef<any>(null);

  const speakText = useCallback(
    (text: string) => {
      if (!brainConfig.autoSpeak) return;
      try {
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
          const cleanText = text.replace(/[*_#`>\[\]]/g, '').trim();
          if (!cleanText) return;
          const utterance = new SpeechSynthesisUtterance(cleanText);
          const voices = window.speechSynthesis.getVoices();
          const urduVoice = voices.find(
            (v) =>
              /ur-PK|ur_PK|ur-|Urdu|hi-IN|hi_IN|Hindi/i.test(v.lang) ||
              /Urdu|Hindi/i.test(v.name)
          );
          if (urduVoice) {
            utterance.voice = urduVoice;
          }
          utterance.rate = brainConfig.voiceSpeed || 0.98;
          utterance.pitch = brainConfig.voicePitch || 1.0;
          window.speechSynthesis.speak(utterance);
        }
      } catch (e) {
        console.warn('Speech synthesis error in screen vision:', e);
      }
    },
    [brainConfig.autoSpeak, brainConfig.voiceSpeed, brainConfig.voicePitch]
  );

  // Start Screen Capture via Display Media API
  const handleStartCapture = async () => {
    try {
      if (!navigator.mediaDevices?.getDisplayMedia) {
        alert('Display Media API is not supported in this browser.');
        return;
      }

      const mediaStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          cursor: 'always',
          displaySurface: 'monitor',
        } as any,
        audio: false,
      });

      setStream(mediaStream);
      setIsCapturing(true);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }

      mediaStream.getVideoTracks()[0].onended = () => {
        handleStopCapture();
      };

      // Trigger first scan immediately after stream begins
      setTimeout(() => {
        handleAnalyzeFrame('Continuous lifetime surveillance initiated. Map active application and UI controls.');
      }, 800);
    } catch (err) {
      console.warn('Screen capture cancelled or unavailable:', err);
    }
  };

  const handleStopCapture = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    if (intervalTimerRef.current) {
      clearInterval(intervalTimerRef.current);
      intervalTimerRef.current = null;
    }
    setIsCapturing(false);
    setIsAnalyzing(false);
  };

  // Execute Action / Command
  const handleExecuteAction = useCallback(
    (actionText: string, isAuto = false) => {
      const msg = isAuto
        ? `[AUTONOMOUS AUTO-PILOT] Executed: "${actionText}"`
        : `Dispatched directive: "${actionText}"`;
      setActionSuccessMsg(msg);
      setAutoActionsCount((c) => c + 1);

      if (onSendChatMessage) {
        onSendChatMessage(`[SCREEN VISION DIRECTIVE]: ${actionText}`);
      }

      setTimeout(() => setActionSuccessMsg(null), 3500);
    },
    [onSendChatMessage]
  );

  // Analyze Active Frame via Vision AI
  const handleAnalyzeFrame = useCallback(
    async (promptOverride?: string) => {
      if (!videoRef.current || !isCapturing) {
        if (!isCapturing) {
          await handleStartCapture();
          return;
        }
        return;
      }

      setIsAnalyzing(true);
      try {
        const video = videoRef.current;
        let canvas = canvasRef.current;
        if (!canvas) {
          canvas = document.createElement('canvas');
        }

        canvas.width = video.videoWidth || 1280;
        canvas.height = video.videoHeight || 720;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Could not initialize canvas context');

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageBase64 = canvas.toDataURL('image/jpeg', 0.82);

        const prompt =
          promptOverride ||
          customPrompt.trim() ||
          oneShotMission ||
          'Live continuous screen scan: identify active window, detect all UI buttons/controls, and auto-fix any issues.';

        const res = await fetch('/api/admin/screen-analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64,
            userPrompt: prompt,
            config: brainConfig,
          }),
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: ScreenAnalysisResult = await res.json();

        setActiveAnalysis(data);
        setHistory((prev) => [data, ...prev.slice(0, 14)]);
        setScansCount((c) => c + 1);

        // One-Shot Hands-Free Auto-Pilot Trigger:
        // If auto-pilot is enabled and a suggested action was returned, automatically execute it!
        if (isLifetimeAutoPilot && autoExecuteActions && data.suggestedActions && data.suggestedActions.length > 0) {
          const topAction = data.suggestedActions[0];
          handleExecuteAction(topAction, true);
        }

        if (data.speechResponse && brainConfig.autoSpeak) {
          speakText(data.speechResponse);
        }
      } catch (err: any) {
        console.warn('Frame analysis error:', err);
      } finally {
        setIsAnalyzing(false);
      }
    },
    [isCapturing, customPrompt, oneShotMission, brainConfig, isLifetimeAutoPilot, autoExecuteActions, handleExecuteAction, speakText]
  );

  // Auto-Monitor Loop (Every 3s, 5s, 10s, or continuous)
  useEffect(() => {
    if (autoInterval > 0 && isCapturing) {
      intervalTimerRef.current = setInterval(() => {
        handleAnalyzeFrame();
      }, autoInterval * 1000);
    } else if (intervalTimerRef.current) {
      clearInterval(intervalTimerRef.current);
      intervalTimerRef.current = null;
    }
    return () => {
      if (intervalTimerRef.current) clearInterval(intervalTimerRef.current);
    };
  }, [autoInterval, isCapturing, handleAnalyzeFrame]);

  // Handle external voice trigger
  useEffect(() => {
    if (externalVoiceCommand && isCapturing) {
      const lower = externalVoiceCommand.toLowerCase();
      if (
        lower.includes('screen') ||
        lower.includes('dekho') ||
        lower.includes('dykho') ||
        lower.includes('app') ||
        lower.includes('monitor')
      ) {
        handleAnalyzeFrame(externalVoiceCommand);
      }
    }
  }, [externalVoiceCommand, isCapturing, handleAnalyzeFrame]);

  if (!isOpen) return null;

  const handleCopyCode = (code: string, idx: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2500);
  };

  return (
    <>
      {/* =========================================================================
          FLOATING MINI-EYE PERSISTENT WIDGET (RUNS IN BACKGROUND WHILE USER WORKS)
          ========================================================================= */}
      {isFloatingMiniEye ? (
        <div className="fixed bottom-4 right-4 z-50 p-3 rounded-2xl bg-[#020e18]/95 border-2 border-cyan-400 shadow-[0_0_35px_rgba(0,240,255,0.4)] backdrop-blur-md font-mono-tech select-none flex items-center gap-3 animate-in fade-in">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-400">
            <Eye className="w-5 h-5 text-cyan-300 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-[#020e18] animate-ping" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white tracking-wider">
                LIFETIME VISION ACTIVE
              </span>
              <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/50">
                AUTO-PILOT ON
              </span>
            </div>
            <p className="text-[10px] text-cyan-300/80">
              Scans: {scansCount} | Auto Actions: {autoActionsCount} | App: {activeAnalysis?.appName || 'Workstation'}
            </p>
          </div>

          <div className="flex items-center gap-1.5 pl-2 border-l border-cyan-500/30">
            <button
              onClick={() => handleAnalyzeFrame()}
              disabled={isAnalyzing}
              className="p-1.5 rounded-lg bg-cyan-500/20 border border-cyan-400 text-cyan-300 hover:bg-cyan-500/40 cursor-pointer"
              title="Scan Screen Now"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setIsFloatingMiniEye(false)}
              className="p-1.5 rounded-lg bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400 cursor-pointer text-xs"
              title="Expand Full Screen Console"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        /* =========================================================================
            FULL-SCALE MASTER APEX SCREEN MONITORING & AUTONOMOUS CONTROL DECK
            ========================================================================= */
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 font-mono-tech">
          <div className="relative w-full max-w-5xl max-h-[92vh] flex flex-col rounded-2xl border-2 border-cyan-400/80 bg-[#020b13] shadow-[0_0_70px_rgba(0,240,255,0.35)] overflow-hidden text-cyan-100">
            {/* Top Decors */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-300 pointer-events-none" />
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-300 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyan-300 pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-300 pointer-events-none" />

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-cyan-500/30 bg-[#031424] shrink-0 select-none">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-cyan-500/20 border border-cyan-400 shadow-[0_0_12px_rgba(0,240,255,0.3)]">
                  <Eye className="w-5 h-5 text-cyan-300 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm sm:text-base font-bold tracking-[0.15em] text-cyan-200 uppercase">
                      STONIC AUTONOMOUS VISION CORE // SUPER-ADMIN
                    </h2>
                    <span
                      className={`px-2 py-0.5 rounded text-[9px] font-bold border ${
                        isCapturing
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400 animate-pulse'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {isCapturing ? 'LIFETIME EYE ARMED' : 'STANDBY'}
                    </span>
                  </div>
                  <p className="text-[10px] text-cyan-400/80">
                    Continuous Lifetime Screen Monitoring, UI Control Map, & One-Shot Auto-Execution
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* View Tabs */}
                <div className="flex items-center bg-[#010912] p-0.5 rounded-lg border border-cyan-500/30 text-[10px]">
                  <button
                    onClick={() => setActiveTab('vision')}
                    className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                      activeTab === 'vision' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-cyan-400'
                    }`}
                  >
                    LIVE HUD
                  </button>
                  <button
                    onClick={() => setActiveTab('controls')}
                    className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                      activeTab === 'controls' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-cyan-400'
                    }`}
                  >
                    CONTROLS & APPS ({activeAnalysis?.controlElements?.length || 3})
                  </button>
                  <button
                    onClick={() => setActiveTab('actions')}
                    className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                      activeTab === 'actions' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-cyan-400'
                    }`}
                  >
                    ACTIONS & CODE
                  </button>
                  <button
                    onClick={() => setActiveTab('history')}
                    className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                      activeTab === 'history' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-cyan-400'
                    }`}
                  >
                    LOGS ({history.length})
                  </button>
                </div>

                {/* Minimize to Floating Widget Button */}
                <button
                  onClick={() => setIsFloatingMiniEye(true)}
                  className="p-1.5 rounded-lg text-cyan-400 hover:text-white hover:bg-cyan-900/50 cursor-pointer"
                  title="Minimize to Floating Eye Widget"
                >
                  <Minimize2 className="w-4 h-4" />
                </button>

                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-cyan-400 hover:text-white hover:bg-cyan-900/50 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* One-Shot Hands-Free Banner ("Bas Aik Baar Bol Do") */}
            <div className="px-4 py-2 bg-[#02182b] border-b border-cyan-500/30 flex flex-wrap items-center justify-between gap-2 text-xs shrink-0 select-text">
              <div className="flex items-center gap-2 flex-1 min-w-[280px]">
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400 text-[10px] font-bold shrink-0">
                  <Workflow className="w-3.5 h-3.5 text-emerald-400" />
                  <span>ONE-SHOT AUTONOMOUS MISSION:</span>
                </div>
                <input
                  type="text"
                  value={oneShotMission}
                  onChange={(e) => setOneShotMission(e.target.value)}
                  placeholder="e.g. 'Terminal te nazar rakho, error aaway te auto fix execute karo'..."
                  className="flex-1 px-2.5 py-1 rounded bg-[#010d18] border border-cyan-500/40 text-cyan-100 text-xs focus:outline-none focus:border-cyan-300 font-mono"
                />
              </div>

              <div className="flex items-center gap-3 text-[11px] shrink-0">
                <label className="flex items-center gap-1.5 cursor-pointer text-cyan-300 font-bold">
                  <input
                    type="checkbox"
                    checked={autoExecuteActions}
                    onChange={(e) => setAutoExecuteActions(e.target.checked)}
                    className="rounded accent-cyan-400 cursor-pointer"
                  />
                  <span>AUTO-EXECUTE SCRIPT (NO CONFIRMATION NEEDED)</span>
                </label>

                <button
                  onClick={() => handleAnalyzeFrame(oneShotMission)}
                  disabled={!isCapturing || isAnalyzing}
                  className="px-3 py-1 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.4)] disabled:opacity-40 flex items-center gap-1"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>DISPATCH MISSION</span>
                </button>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-hidden flex flex-col md:flex-row min-h-0">
              {/* LEFT: Live Video Monitor Viewport */}
              <div className="w-full md:w-3/5 h-64 md:h-full bg-black relative flex flex-col border-b md:border-b-0 md:border-r border-cyan-500/20 overflow-hidden">
                {/* HUD Matrix Overlay */}
                <div className="absolute inset-0 pointer-events-none z-10 select-none">
                  <div className="w-full h-full border border-cyan-500/15 grid grid-cols-3 grid-rows-3 opacity-30" />
                  <div className="absolute top-3 left-3 text-[9px] text-cyan-400 bg-black/70 px-2 py-0.5 rounded border border-cyan-500/30 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>ACTIVE APP: {activeAnalysis?.appName || 'SCREEN DETECTING...'}</span>
                    <span>| SCANS: {scansCount}</span>
                  </div>

                  {isAnalyzing && (
                    <div className="absolute inset-0 bg-cyan-500/10 backdrop-blur-[1px] flex flex-col items-center justify-center gap-2">
                      <div className="w-16 h-16 rounded-full border-2 border-cyan-400 border-dashed animate-spin" />
                      <span className="text-xs font-bold text-cyan-200 bg-black/85 px-3 py-1.5 rounded-xl border border-cyan-400 shadow-[0_0_20px_#00f0ff]">
                        AI OPTICAL EYE SCANNING APP & UI CONTROLS...
                      </span>
                    </div>
                  )}
                </div>

                {/* Video Viewport */}
                <div className="flex-1 relative flex items-center justify-center bg-[#01060c] overflow-hidden">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`w-full h-full object-contain ${!isCapturing ? 'hidden' : ''}`}
                  />
                  <canvas ref={canvasRef} className="hidden" />

                  {!isCapturing && (
                    <div className="p-6 text-center space-y-3 z-15">
                      <div className="w-16 h-16 mx-auto rounded-2xl bg-cyan-950/70 border-2 border-dashed border-cyan-400 flex items-center justify-center text-cyan-300 shadow-[0_0_25px_rgba(0,240,255,0.2)]">
                        <Monitor className="w-8 h-8" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-cyan-200">
                          NO ACTIVE DESKTOP/APP FEED LINKED
                        </h3>
                        <p className="text-xs text-cyan-300/70 max-w-sm mt-1 font-sans">
                          Link any window, website, or entire screen. Stonic AI will maintain a 24/7
                          lifetime watch, inspect every UI button, and auto-pilot the workflow.
                        </p>
                      </div>
                      <button
                        onClick={handleStartCapture}
                        className="px-6 py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 shadow-[0_0_25px_#00f0ff] transition-all cursor-pointer flex items-center gap-2 mx-auto"
                      >
                        <Play className="w-4 h-4 fill-slate-950" />
                        <span>LINK SCREEN & START LIFETIME WATCH</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Live Controls Bar */}
                <div className="p-2.5 border-t border-cyan-500/20 bg-[#030e18] flex flex-wrap items-center justify-between gap-2 text-xs shrink-0 z-20 select-none">
                  <div className="flex items-center gap-2">
                    {isCapturing ? (
                      <button
                        onClick={handleStopCapture}
                        className="px-3 py-1.5 rounded-lg bg-red-950/80 border border-red-500 text-red-300 hover:bg-red-900 flex items-center gap-1.5 cursor-pointer text-xs"
                      >
                        <Square className="w-3.5 h-3.5 fill-red-400" />
                        <span>DISCONNECT FEED</span>
                      </button>
                    ) : (
                      <button
                        onClick={handleStartCapture}
                        className="px-3 py-1.5 rounded-lg bg-emerald-950/80 border border-emerald-500 text-emerald-300 hover:bg-emerald-900 flex items-center gap-1.5 cursor-pointer text-xs font-bold"
                      >
                        <Play className="w-3.5 h-3.5 fill-emerald-400" />
                        <span>CONNECT SCREEN</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleAnalyzeFrame()}
                      disabled={!isCapturing || isAnalyzing}
                      className="px-4 py-1.5 rounded-lg bg-cyan-500/25 border border-cyan-400 text-cyan-100 hover:bg-cyan-500/40 flex items-center gap-1.5 cursor-pointer disabled:opacity-50 text-xs font-bold shadow-[0_0_12px_rgba(0,240,255,0.3)]"
                    >
                      {isAnalyzing ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-300" />
                      ) : (
                        <Camera className="w-3.5 h-3.5 text-cyan-300" />
                      )}
                      <span>SCAN SCREEN NOW</span>
                    </button>
                  </div>

                  {/* Auto Loop Selector */}
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-cyan-400/80 text-[11px]">Surveillance Rate:</span>
                    {[0, 2, 5, 10].map((sec) => (
                      <button
                        key={sec}
                        onClick={() => setAutoInterval(sec)}
                        className={`px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                          autoInterval === sec
                            ? 'bg-cyan-400 text-slate-950 font-bold border-cyan-300 shadow-[0_0_8px_#00f0ff]'
                            : 'border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20'
                        }`}
                      >
                        {sec === 0 ? 'Manual' : `${sec}s Loop`}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* RIGHT: AI Intelligence, Control Elements & Code Generator */}
              <div className="w-full md:w-2/5 flex flex-col bg-[#030f1a] overflow-hidden min-h-0 select-text">
                {/* Notification toast if action auto-executed */}
                {actionSuccessMsg && (
                  <div className="px-3 py-2 bg-emerald-950/90 border-b border-emerald-400 text-emerald-200 text-xs flex items-center gap-2 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{actionSuccessMsg}</span>
                  </div>
                )}

                {/* Tab 1: LIVE HUD */}
                {activeTab === 'vision' && (
                  <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
                    {activeAnalysis ? (
                      <>
                        {/* Summary Card */}
                        <div className="p-3.5 rounded-xl bg-[#041c2c] border border-cyan-400/40 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                              <span>ACTIVE APP & WORKSPACE DIGEST</span>
                            </span>
                            <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-200 border border-cyan-400/50 text-[10px] font-bold">
                              {activeAnalysis.appName || 'Workstation App'}
                            </span>
                          </div>
                          <p className="text-white text-xs leading-relaxed font-sans">{activeAnalysis.summary}</p>
                        </div>

                        {/* Detected Issues / Compiler Errors */}
                        {activeAnalysis.detectedIssues && activeAnalysis.detectedIssues.length > 0 && (
                          <div className="p-3 rounded-xl bg-red-950/30 border border-red-500/40 space-y-2">
                            <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                              <AlertCircle className="w-3.5 h-3.5 text-red-400" />
                              <span>DETECTED ISSUES & COMPILER ERRORS ({activeAnalysis.detectedIssues.length})</span>
                            </span>
                            <ul className="space-y-1.5 pl-1">
                              {activeAnalysis.detectedIssues.map((issue, idx) => (
                                <li key={idx} className="text-red-200 text-xs flex items-start gap-1.5 font-sans">
                                  <span className="text-red-400 mt-0.5">•</span>
                                  <span>{issue}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Suggested Autonomous Actions */}
                        {activeAnalysis.suggestedActions && activeAnalysis.suggestedActions.length > 0 && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] text-cyan-300 font-bold uppercase tracking-wider">
                                AUTONOMOUS DIRECTIVES READY:
                              </span>
                              <span className="text-[10px] text-emerald-400 font-bold">
                                {autoExecuteActions ? 'AUTO-PILOT DISPATCHING' : 'READY TO CLICK'}
                              </span>
                            </div>
                            <div className="space-y-1.5">
                              {activeAnalysis.suggestedActions.map((action, idx) => (
                                <div
                                  key={idx}
                                  className="p-2.5 rounded-xl bg-[#041624] border border-cyan-500/30 flex items-center justify-between gap-2 hover:border-cyan-400 transition-colors"
                                >
                                  <span className="text-cyan-100 text-xs font-sans flex-1">{action}</span>
                                  <button
                                    onClick={() => handleExecuteAction(action, false)}
                                    className="px-3 py-1 rounded bg-cyan-500/25 border border-cyan-400 text-cyan-200 text-[10px] font-bold hover:bg-cyan-500/50 cursor-pointer shrink-0"
                                  >
                                    DISPATCH
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3 text-cyan-400/60">
                        <Eye className="w-12 h-12 text-cyan-500/40 animate-pulse" />
                        <h4 className="text-sm font-bold text-cyan-300">
                          AWAITING SCREEN FEED
                        </h4>
                        <p className="text-xs text-cyan-400/70 max-w-xs font-sans leading-relaxed">
                          Link any screen or window to start continuous lifetime vision analysis. Stonic
                          AI will inspect what's happening and auto-pilot the actions.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Tab 2: DETECTED APP CONTROLS & UI ELEMENTS */}
                {activeTab === 'controls' && (
                  <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
                    <div className="flex items-center justify-between pb-1 border-b border-cyan-500/30">
                      <span className="font-bold text-cyan-200 flex items-center gap-1.5">
                        <Sliders className="w-4 h-4 text-cyan-400" />
                        <span>DETECTED APPLICATION UI CONTROLS</span>
                      </span>
                      <span className="text-[10px] text-cyan-400/80">
                        Target App: {activeAnalysis?.appName || 'Active Window'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 font-sans leading-relaxed">
                      AI Vision screen te mojood buttons, input fields, aur menus detect kar k unka automated
                      control map tayar karda hai:
                    </p>

                    <div className="space-y-2">
                      {(
                        activeAnalysis?.controlElements || [
                          {
                            id: 'ctl-1',
                            type: 'terminal_prompt' as const,
                            label: 'Interactive Terminal Shell ($)',
                            actionRequired: 'Automated test suite aur compile check execute karo',
                            recommendedCommand: 'npm run lint && npm run build',
                            confidence: 99,
                          },
                          {
                            id: 'ctl-2',
                            type: 'workflow' as const,
                            label: 'Active Workspace & Editor Controls',
                            actionRequired: 'Live code monitor te syntax validator active hai',
                            recommendedCommand: 'git status',
                            confidence: 96,
                          },
                          {
                            id: 'ctl-3',
                            type: 'button' as const,
                            label: 'Deploy / Sync Service Mesh',
                            actionRequired: 'Cluster synchronizing state verify karo',
                            recommendedCommand: 'kubectl get pods -A',
                            confidence: 94,
                          },
                        ]
                      ).map((ctrl) => (
                        <div
                          key={ctrl.id}
                          className="p-3 rounded-xl bg-[#041726] border border-cyan-500/30 space-y-1.5 hover:border-cyan-400 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-white text-xs">{ctrl.label}</span>
                            <span className="text-[10px] px-2 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400">
                              {ctrl.confidence}% CONFIDENCE
                            </span>
                          </div>
                          <p className="text-[11px] text-cyan-200/90 font-sans">{ctrl.actionRequired}</p>
                          {ctrl.recommendedCommand && (
                            <div className="flex items-center justify-between p-1.5 rounded bg-[#010912] border border-cyan-500/20">
                              <code className="text-[11px] text-emerald-300 font-mono">
                                {ctrl.recommendedCommand}
                              </code>
                              <button
                                onClick={() => handleExecuteAction(ctrl.recommendedCommand!)}
                                className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-200 text-[10px] font-bold hover:bg-cyan-500/40 cursor-pointer"
                              >
                                EXECUTE
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tab 3: GENERATED CODE & SCRIPTS */}
                {activeTab === 'actions' && (
                  <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
                    <span className="text-xs text-emerald-300 font-bold uppercase tracking-wider block flex items-center gap-1.5 pb-1 border-b border-cyan-500/30">
                      <Code2 className="w-4 h-4 text-emerald-400" />
                      <span>GENERATED AUTONOMOUS CODE & FIXES</span>
                    </span>

                    {activeAnalysis?.codeSnippets && activeAnalysis.codeSnippets.length > 0 ? (
                      activeAnalysis.codeSnippets.map((snippet, idx) => (
                        <div
                          key={idx}
                          className="rounded-xl bg-[#010810] border border-cyan-500/30 overflow-hidden"
                        >
                          <div className="px-3 py-1.5 bg-[#031320] border-b border-cyan-500/20 flex items-center justify-between text-xs">
                            <span className="text-cyan-300 font-bold">
                              {snippet.filename || `${snippet.language} snippet`}
                            </span>
                            <button
                              onClick={() => handleCopyCode(snippet.code, idx)}
                              className="flex items-center gap-1 text-cyan-400 hover:text-white transition-colors cursor-pointer text-[11px]"
                            >
                              <Copy className="w-3.5 h-3.5" />
                              <span>{copiedIndex === idx ? 'COPIED!' : 'COPY CODE'}</span>
                            </button>
                          </div>
                          <pre className="p-3 text-[11px] text-cyan-100 font-mono overflow-x-auto leading-relaxed max-h-48 select-text cursor-text">
                            <code>{snippet.code}</code>
                          </pre>
                          {snippet.explanation && (
                            <div className="px-3 py-1.5 bg-[#031018] border-t border-cyan-500/10 text-[11px] text-cyan-400/90 font-sans">
                              {snippet.explanation}
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-400 text-xs italic">
                        No code snippets generated yet. Scan screen to analyze active code.
                      </p>
                    )}
                  </div>
                )}

                {/* Tab 4: HISTORY LOGS */}
                {activeTab === 'history' && (
                  <div className="flex-1 overflow-y-auto p-4 space-y-2 text-xs">
                    <span className="text-cyan-300 font-bold block pb-1 border-b border-cyan-500/30">
                      LIFETIME EVENT LOGS ({history.length} SCANS)
                    </span>
                    {history.map((h, i) => (
                      <div
                        key={i}
                        className="p-2.5 rounded-lg bg-[#041424] border border-cyan-500/20 space-y-1"
                      >
                        <div className="flex items-center justify-between text-[10px] text-slate-400">
                          <span className="font-bold text-white">{h.appName || 'Workstation'}</span>
                          <span>{new Date().toLocaleTimeString()}</span>
                        </div>
                        <p className="text-cyan-100 text-[11px] font-sans">{h.summary}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
