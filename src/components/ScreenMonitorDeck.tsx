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
} from 'lucide-react';
import { BrainConfig, ScreenAnalysisResult } from '../types';

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
  const [autoInterval, setAutoInterval] = useState<number>(0); // 0 = manual, or 5s, 10s
  const [activeAnalysis, setActiveAnalysis] = useState<ScreenAnalysisResult | null>(null);
  const [history, setHistory] = useState<ScreenAnalysisResult[]>([]);
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'vision' | 'actions' | 'history'>('vision');

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
          const urduVoice = voices.find((v) => /ur-PK|ur_PK|ur-|Urdu|hi-IN|hi_IN|Hindi/i.test(v.lang) || /Urdu|Hindi/i.test(v.name));
          if (urduVoice) {
            utterance.voice = urduVoice;
          }
          utterance.rate = brainConfig.voiceSpeed || 0.95;
          utterance.pitch = brainConfig.voicePitch || 1.0;
          window.speechSynthesis.speak(utterance);
        }
      } catch (e) {
        console.warn('Speech synthesis error:', e);
      }
    },
    [brainConfig.autoSpeak, brainConfig.voiceSpeed, brainConfig.voicePitch]
  );

  // Start Screen Capture
  const handleStartCapture = async () => {
    try {
      if (!navigator.mediaDevices?.getDisplayMedia) {
        alert('Screen capture API is not supported in this browser.');
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
        videoRef.current.play();
      }

      mediaStream.getVideoTracks()[0].onended = () => {
        handleStopCapture();
      };

      speakText('Haa jani, screen link connect ho gaya hai! Dasso ki check karaan?');
    } catch (err: any) {
      console.warn('Screen share canceled or failed:', err);
    }
  };

  const handleStopCapture = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setStream(null);
    setIsCapturing(false);
    if (intervalTimerRef.current) {
      clearInterval(intervalTimerRef.current);
      intervalTimerRef.current = null;
    }
    speakText('Jani screen monitor stop kar ditta hai.');
  };

  // Capture Frame & Analyze via AI Vision
  const handleAnalyzeFrame = useCallback(
    async (promptOverride?: string) => {
      if (!videoRef.current || !isCapturing) {
        if (!isCapturing) {
          // If not capturing yet, trigger capture prompt
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
        if (!ctx) throw new Error('Could not get canvas context');

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageBase64 = canvas.toDataURL('image/jpeg', 0.85);

        const prompt =
          promptOverride ||
          customPrompt.trim() ||
          'Jani meri screen live scan karo, dekho keri application khuli hai aur code ya terminal te koi bug hai taan labho te fix dasso.';

        const res = await fetch('/api/admin/screen-analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64,
            userPrompt: prompt,
            config: brainConfig,
          }),
        });

        if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
        const data: ScreenAnalysisResult = await res.json();

        setActiveAnalysis(data);
        setHistory((prev) => [data, ...prev.slice(0, 9)]);

        if (data.speechResponse) {
          speakText(data.speechResponse);
        }
      } catch (err: any) {
        console.error('Frame analysis failed:', err);
      } finally {
        setIsAnalyzing(false);
      }
    },
    [isCapturing, customPrompt, brainConfig, speakText]
  );

  // Auto-Monitor interval
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

  // Voice Command Trigger (e.g. user says "screen dekho")
  useEffect(() => {
    if (externalVoiceCommand && isCapturing) {
      const lower = externalVoiceCommand.toLowerCase();
      if (
        lower.includes('screen') ||
        lower.includes('dekho') ||
        lower.includes('dykho') ||
        lower.includes('bug') ||
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

  const handleExecuteAction = (actionText: string) => {
    setActionSuccessMsg(`Action dispatched to terminal: "${actionText}"`);
    speakText(`Executing directive: ${actionText}`);
    if (onSendChatMessage) {
      onSendChatMessage(`Execute desktop action based on screen vision: ${actionText}`);
    }
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-xl border border-cyan-400/80 bg-[#020b13] shadow-[0_0_60px_rgba(0,240,255,0.3)] overflow-hidden text-cyan-100 font-sans">
        {/* Sci-Fi Corner Decors */}
        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyan-300 pointer-events-none" />
        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyan-300 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-cyan-300 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-cyan-300 pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-cyan-500/30 bg-[#041424] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-cyan-500/20 border border-cyan-400">
              <Monitor className="w-5 h-5 text-cyan-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-mono-tech text-sm sm:text-base font-bold tracking-[0.2em] text-cyan-200 uppercase">
                  STONIC OPTICAL SCREEN VISION CORE
                </h2>
                <span
                  className={`px-2 py-0.2 rounded text-[9px] font-mono-tech font-bold border ${
                    isCapturing
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400 animate-pulse'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  {isCapturing ? 'VISION FEED ACTIVE' : 'FEED STANDBY'}
                </span>
              </div>
              <p className="text-[10px] text-cyan-400/80 font-mono-tech">
                Autonomous Screen Monitoring, Bug Detection, Tab & Coding Intelligence
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View tabs */}
            <div className="flex items-center bg-[#020b13] p-0.5 rounded border border-cyan-500/30 text-[10px] font-mono-tech">
              <button
                onClick={() => setActiveTab('vision')}
                className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  activeTab === 'vision' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-cyan-400'
                }`}
              >
                LIVE HUD
              </button>
              <button
                onClick={() => setActiveTab('actions')}
                className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  activeTab === 'actions' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-cyan-400'
                }`}
              >
                ACTIONS & CODE
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  activeTab === 'history' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-cyan-400'
                }`}
              >
                LOGS ({history.length})
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded text-cyan-400 hover:text-white hover:bg-cyan-500/20 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row min-h-0">
          {/* LEFT: Live Video Monitor Feed */}
          <div className="w-full md:w-3/5 h-64 md:h-full bg-black relative flex flex-col border-b md:border-b-0 md:border-r border-cyan-500/20 overflow-hidden">
            {/* Crosshair & HUD Overlay */}
            <div className="absolute inset-0 pointer-events-none z-10">
              <div className="w-full h-full border border-cyan-500/20 grid grid-cols-3 grid-rows-3 opacity-30" />
              <div className="absolute top-3 left-3 text-[9px] font-mono-tech text-cyan-400/80 bg-black/60 px-2 py-0.5 rounded border border-cyan-500/30">
                OPTICAL_MATRIX // RES: 1080P // STREAM_FPS: {isCapturing ? '60' : '0'}
              </div>
              {isAnalyzing && (
                <div className="absolute inset-0 bg-cyan-500/10 backdrop-blur-[1px] flex flex-col items-center justify-center gap-2">
                  <div className="w-16 h-16 rounded-full border-2 border-cyan-400 border-dashed animate-spin" />
                  <span className="text-xs font-mono-tech font-bold text-cyan-200 bg-black/80 px-3 py-1 rounded border border-cyan-400">
                    AI VISION SCANNING ACTIVE SCREEN...
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
                  <div className="w-14 h-14 mx-auto rounded-full bg-cyan-950/60 border-2 border-dashed border-cyan-400/60 flex items-center justify-center text-cyan-300">
                    <Monitor className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-cyan-200 font-mono-tech">
                      NO SCREEN STREAM ATTACHED
                    </h3>
                    <p className="text-[11px] text-cyan-400/70 max-w-sm mt-1">
                      Link your desktop screen or window so Stonic AI can autonomously monitor your
                      coding, tabs, and errors.
                    </p>
                  </div>
                  <button
                    onClick={handleStartCapture}
                    className="px-5 py-2 rounded-lg bg-cyan-500 text-slate-950 font-bold text-xs font-mono-tech hover:bg-cyan-400 shadow-[0_0_20px_#00f0ff] transition-all cursor-pointer flex items-center gap-2 mx-auto"
                  >
                    <Play className="w-4 h-4 fill-slate-950" />
                    <span>START SCREEN MONITORING</span>
                  </button>
                </div>
              )}
            </div>

            {/* Video Control Bar */}
            <div className="p-2 border-t border-cyan-500/20 bg-[#030e18] flex flex-wrap items-center justify-between gap-2 text-xs font-mono-tech shrink-0 z-20">
              <div className="flex items-center gap-2">
                {isCapturing ? (
                  <button
                    onClick={handleStopCapture}
                    className="px-3 py-1 rounded bg-red-950/80 border border-red-500 text-red-300 hover:bg-red-900 transition-colors flex items-center gap-1.5 cursor-pointer text-[11px]"
                  >
                    <Square className="w-3 h-3 fill-red-400" />
                    <span>DISCONNECT FEED</span>
                  </button>
                ) : (
                  <button
                    onClick={handleStartCapture}
                    className="px-3 py-1 rounded bg-emerald-950/80 border border-emerald-500 text-emerald-300 hover:bg-emerald-900 transition-colors flex items-center gap-1.5 cursor-pointer text-[11px]"
                  >
                    <Play className="w-3 h-3 fill-emerald-400" />
                    <span>CONNECT SCREEN</span>
                  </button>
                )}

                <button
                  onClick={() => handleAnalyzeFrame()}
                  disabled={!isCapturing || isAnalyzing}
                  className="px-3.5 py-1 rounded bg-cyan-500/20 border border-cyan-400 text-cyan-100 hover:bg-cyan-500/35 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50 text-[11px] font-bold shadow-[0_0_10px_rgba(0,240,255,0.2)]"
                >
                  {isAnalyzing ? (
                    <Loader2 className="w-3 h-3 animate-spin text-cyan-300" />
                  ) : (
                    <Camera className="w-3 h-3 text-cyan-300" />
                  )}
                  <span>INSPECT SCREEN NOW</span>
                </button>
              </div>

              {/* Auto Loop Selector */}
              <div className="flex items-center gap-1 text-[10px]">
                <span className="text-cyan-400/80">Auto Scan:</span>
                {[0, 5, 10].map((sec) => (
                  <button
                    key={sec}
                    onClick={() => setAutoInterval(sec)}
                    className={`px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                      autoInterval === sec
                        ? 'bg-cyan-400 text-slate-950 font-bold border-cyan-300'
                        : 'border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20'
                    }`}
                  >
                    {sec === 0 ? 'Manual' : `${sec}s`}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: AI Analysis, Code Generation & Actions */}
          <div className="w-full md:w-2/5 flex flex-col bg-[#030f1a] overflow-hidden min-h-0">
            {/* Custom Directive Input */}
            <div className="p-3 border-b border-cyan-500/20 bg-[#041626] shrink-0">
              <label className="text-[10px] text-cyan-300 block font-mono-tech font-bold mb-1">
                Direct Stonic AI on what to inspect:
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAnalyzeFrame()}
                  placeholder="e.g. Find code bug on screen, inspect terminal..."
                  className="flex-1 px-2.5 py-1.5 rounded bg-[#020b13] border border-cyan-500/40 text-cyan-100 placeholder:text-cyan-700 text-xs focus:outline-none focus:border-cyan-300 font-mono-tech"
                />
                <button
                  onClick={() => handleAnalyzeFrame()}
                  disabled={!isCapturing || isAnalyzing}
                  className="px-3 py-1.5 rounded bg-cyan-500 text-slate-950 font-bold text-xs font-mono-tech hover:bg-cyan-400 transition-colors disabled:opacity-40 cursor-pointer"
                >
                  SCAN
                </button>
              </div>
            </div>

            {/* Notification message */}
            {actionSuccessMsg && (
              <div className="px-3 py-1.5 bg-emerald-950/80 border-b border-emerald-500 text-emerald-200 text-[10px] font-mono-tech flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>{actionSuccessMsg}</span>
              </div>
            )}

            {/* Scrollable Intelligence Details */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono-tech text-xs">
              {activeAnalysis ? (
                <>
                  {/* Summary Card */}
                  <div className="p-3 rounded-lg bg-[#051c2e] border border-cyan-400/40 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3 text-cyan-300" />
                        <span>SCREEN INTELLIGENCE DIGEST</span>
                      </span>
                      {activeAnalysis.appName && (
                        <span className="px-2 py-0.2 rounded bg-cyan-500/20 text-cyan-200 border border-cyan-400/50 text-[9px]">
                          {activeAnalysis.appName}
                        </span>
                      )}
                    </div>
                    <p className="text-white text-xs leading-relaxed">{activeAnalysis.summary}</p>
                  </div>

                  {/* Detected Issues / Bugs */}
                  {activeAnalysis.detectedIssues && activeAnalysis.detectedIssues.length > 0 && (
                    <div className="p-3 rounded-lg bg-red-950/30 border border-red-500/40 space-y-2">
                      <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-red-400" />
                        <span>DETECTED VULNERABILITIES / ISSUES</span>
                      </span>
                      <ul className="space-y-1.5 pl-2">
                        {activeAnalysis.detectedIssues.map((issue, idx) => (
                          <li key={idx} className="text-red-200 text-[11px] flex items-start gap-1.5">
                            <span className="text-red-400 mt-0.5">•</span>
                            <span>{issue}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Suggested Actions */}
                  {activeAnalysis.suggestedActions && activeAnalysis.suggestedActions.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[10px] text-cyan-300 font-bold uppercase tracking-wider block">
                        SUGGESTED DESKTOP ACTIONS:
                      </span>
                      <div className="space-y-1.5">
                        {activeAnalysis.suggestedActions.map((action, idx) => (
                          <div
                            key={idx}
                            className="p-2 rounded bg-[#061826] border border-cyan-500/30 flex items-center justify-between gap-2 hover:border-cyan-400 transition-colors"
                          >
                            <span className="text-cyan-100 text-[11px]">{action}</span>
                            <button
                              onClick={() => handleExecuteAction(action)}
                              className="px-2.5 py-1 rounded bg-cyan-500/20 border border-cyan-400/60 text-cyan-200 text-[9px] font-bold hover:bg-cyan-500/40 cursor-pointer shrink-0"
                            >
                              DISPATCH
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Generated Code Snippets */}
                  {activeAnalysis.codeSnippets && activeAnalysis.codeSnippets.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block flex items-center gap-1.5">
                        <Code2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>GENERATED CODE & SCRIPTS:</span>
                      </span>

                      {activeAnalysis.codeSnippets.map((snippet, idx) => (
                        <div
                          key={idx}
                          className="rounded-lg bg-[#010810] border border-cyan-500/30 overflow-hidden"
                        >
                          <div className="px-3 py-1.5 bg-[#031320] border-b border-cyan-500/20 flex items-center justify-between text-[10px]">
                            <span className="text-cyan-300 font-bold font-mono-tech">
                              {snippet.filename || `${snippet.language} snippet`}
                            </span>
                            <button
                              onClick={() => handleCopyCode(snippet.code, idx)}
                              className="flex items-center gap-1 text-cyan-400 hover:text-white transition-colors cursor-pointer"
                            >
                              <Copy className="w-3 h-3" />
                              <span>{copiedIndex === idx ? 'COPIED!' : 'COPY'}</span>
                            </button>
                          </div>
                          <pre className="p-3 text-[10px] text-cyan-100 font-mono-tech overflow-x-auto leading-relaxed max-h-48">
                            <code>{snippet.code}</code>
                          </pre>
                          {snippet.explanation && (
                            <div className="px-3 py-1.5 bg-[#031018] border-t border-cyan-500/10 text-[9px] text-cyan-400/80">
                              {snippet.explanation}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2 text-cyan-400/60">
                  <Eye className="w-10 h-10 text-cyan-500/40 animate-pulse" />
                  <p className="text-xs font-mono-tech text-cyan-300 font-bold">
                    AWAITING SCREEN SCAN DIRECTIVE
                  </p>
                  <p className="text-[10px] max-w-xs leading-relaxed text-cyan-400/70">
                    Click &quot;Inspect Screen Now&quot; or say &quot;Stonic, screen dekho&quot; to
                    analyze your active workspace, code, or terminal errors.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
