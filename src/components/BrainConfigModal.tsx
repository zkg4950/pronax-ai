import React, { useState, useEffect } from 'react';
import {
  X,
  Cpu,
  Key,
  Server,
  Zap,
  Volume2,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Eye,
  EyeOff,
  Globe,
  Sliders,
  Radio,
  Play,
  Square,
} from 'lucide-react';
import { BrainConfig, AIProvider } from '../types';
import { playAgentSpeech, stopAllAgentSpeech } from '../utils/audioEffects';

export const DEFAULT_BRAIN_CONFIG: BrainConfig = {
  provider: 'stonic_gemini',
  apiKey: '',
  model: 'gemini-3.8-flash',
  baseUrl: 'http://localhost:11434/v1',
  autoSpeak: true,
  voiceSpeed: 1.05,
  voicePitch: 1.0,
  voiceLanguage: 'auto',
  voiceEngine: 'gemini_neural',
  voiceClarityBoost: true,
  screenMonitorInterval: 5,
  temperature: 0.7,
};

interface BrainConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: BrainConfig;
  onSaveConfig: (newConfig: BrainConfig) => void;
}

const PROVIDER_OPTIONS: {
  id: AIProvider;
  name: string;
  badge: string;
  description: string;
  defaultModel: string;
  needsKey: boolean;
  needsBaseUrl: boolean;
}[] = [
  {
    id: 'stonic_gemini',
    name: 'Stonic Default Neural Brain (Gemini 3.8 Flash)',
    badge: 'OPTIMAL & PRE-CONFIGURED',
    description: 'Zero setup required. High-speed reasoning with full Stonic AI persona & agent network.',
    defaultModel: 'gemini-3.8-flash',
    needsKey: false,
    needsBaseUrl: false,
  },
  {
    id: 'custom_gemini',
    name: 'Google Gemini (Custom API Key)',
    badge: 'CUSTOM KEY',
    description: 'Use your personal Google AI Studio / Gemini API key with Gemini 2.5/3.8 Flash or Pro.',
    defaultModel: 'gemini-2.5-flash',
    needsKey: true,
    needsBaseUrl: false,
  },
  {
    id: 'openai',
    name: 'OpenAI (GPT-4o / o3-mini)',
    badge: 'CUSTOM KEY',
    description: 'Connect official OpenAI API key for GPT-4o, GPT-4o-mini, or reasoning models.',
    defaultModel: 'gpt-4o',
    needsKey: true,
    needsBaseUrl: false,
  },
  {
    id: 'deepseek',
    name: 'DeepSeek (DeepSeek-V3 / R1)',
    badge: 'CUSTOM KEY',
    description: 'Connect DeepSeek API for ultra-fast coding and deep reasoning chains.',
    defaultModel: 'deepseek-chat',
    needsKey: true,
    needsBaseUrl: false,
  },
  {
    id: 'anthropic',
    name: 'Anthropic Claude (Claude 3.7 Sonnet)',
    badge: 'CUSTOM KEY',
    description: 'Connect Anthropic API key for industry-leading complex code architecture.',
    defaultModel: 'claude-3-7-sonnet-20250219',
    needsKey: true,
    needsBaseUrl: false,
  },
  {
    id: 'local_ollama',
    name: 'Local Ollama AI (Localhost / Private GPU)',
    badge: '100% LOCAL & OFFLINE',
    description: 'Connect to local Ollama running on your machine (e.g. LLaMA 3.3, DeepSeek-R1, Qwen Coder).',
    defaultModel: 'llama3.3',
    needsKey: false,
    needsBaseUrl: true,
  },
  {
    id: 'custom_endpoint',
    name: 'Custom AI Endpoint / Full Source Proxy',
    badge: 'CUSTOM BACKEND',
    description: 'Connect any OpenAI-compatible server, LM Studio, vLLM, or custom enterprise AI bridge.',
    defaultModel: 'default',
    needsKey: false,
    needsBaseUrl: true,
  },
];

export const BrainConfigModal: React.FC<BrainConfigModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
}) => {
  const [localConfig, setLocalConfig] = useState<BrainConfig>(config);
  const [showKey, setShowKey] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    latencyMs?: number;
    message: string;
    models?: string[];
  } | null>(null);
  const [testingAgentId, setTestingAgentId] = useState<string | null>(null);

  useEffect(() => {
    setLocalConfig(config);
  }, [config, isOpen]);

  if (!isOpen) return null;

  const currentProviderMeta =
    PROVIDER_OPTIONS.find((p) => p.id === localConfig.provider) || PROVIDER_OPTIONS[0];

  const handleProviderChange = (providerId: AIProvider) => {
    const meta = PROVIDER_OPTIONS.find((p) => p.id === providerId);
    setLocalConfig((prev) => ({
      ...prev,
      provider: providerId,
      model: meta?.defaultModel || prev.model,
      baseUrl:
        providerId === 'local_ollama'
          ? 'http://localhost:11434/v1'
          : providerId === 'custom_endpoint' && !prev.baseUrl
          ? 'http://localhost:1234/v1'
          : prev.baseUrl,
    }));
    setTestResult(null);
  };

  const handleTestConnection = async () => {
    setTestingConnection(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/admin/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: localConfig.provider,
          apiKey: localConfig.apiKey,
          baseUrl: localConfig.baseUrl,
          model: localConfig.model,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setTestResult({
          success: true,
          latencyMs: data.latencyMs,
          message: data.message || `Connection established (${data.latencyMs}ms)`,
          models: data.models,
        });
      } else {
        setTestResult({
          success: false,
          message: data.error || 'Connection failed. Please verify endpoint or credentials.',
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err?.message || 'Network request failed. Ensure server/endpoint is reachable.',
      });
    } finally {
      setTestingConnection(false);
    }
  };

  const handleSave = () => {
    onSaveConfig(localConfig);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-xl border border-cyan-400/60 bg-[#030d17] shadow-[0_0_50px_rgba(0,240,255,0.25)] overflow-hidden text-cyan-100 font-sans">
        {/* Corner Decors */}
        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyan-300 pointer-events-none" />
        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyan-300 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-cyan-300 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-cyan-300 pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-cyan-500/30 bg-[#041424] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-cyan-500/20 border border-cyan-400">
              <Cpu className="w-5 h-5 text-cyan-300 animate-pulse" />
            </div>
            <div>
              <h2 className="font-mono-tech text-sm sm:text-base font-bold tracking-[0.2em] text-cyan-200 uppercase">
                AI BRAIN & CUSTOM API KEY HUB
              </h2>
              <p className="text-[10px] text-cyan-400/80 font-mono-tech">
                Switch neural engines, connect custom API keys, or link local Ollama/LM Studio models
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded text-cyan-400 hover:text-white hover:bg-cyan-500/20 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 font-mono-tech text-xs">
          {/* Active Engine Summary Banner */}
          <div className="p-3 rounded-lg bg-gradient-to-r from-cyan-950/60 via-[#061d30]/70 to-[#04121e]/80 border border-cyan-400/40 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-cyan-300" />
              <div>
                <span className="text-[10px] text-cyan-400 block font-bold">CURRENT ACTIVE BRAIN</span>
                <span className="text-white text-xs font-bold">{currentProviderMeta.name}</span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-200 border border-cyan-400/50 text-[9px] font-bold">
              {currentProviderMeta.badge}
            </span>
          </div>

          {/* Provider Selection */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-cyan-300 block tracking-wider uppercase flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-cyan-400" />
              <span>Select Neural Brain Provider:</span>
            </label>

            <div className="grid grid-cols-1 gap-2">
              {PROVIDER_OPTIONS.map((opt) => {
                const isSelected = localConfig.provider === opt.id;
                return (
                  <div
                    key={opt.id}
                    onClick={() => handleProviderChange(opt.id)}
                    className={`p-3 rounded-lg border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-cyan-950/70 border-cyan-300 shadow-[0_0_15px_rgba(0,240,255,0.25)] ring-1 ring-cyan-400'
                        : 'bg-[#051624]/60 border-cyan-500/20 hover:border-cyan-400/60 hover:bg-[#061b2e]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                          isSelected ? 'border-cyan-300 bg-cyan-400' : 'border-cyan-500/50'
                        }`}
                      >
                        {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-100 flex items-center gap-2">
                          <span>{opt.name}</span>
                          <span className="text-[8px] px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                            {opt.badge}
                          </span>
                        </div>
                        <div className="text-[10px] text-cyan-400/70 mt-0.5">{opt.description}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Credentials & Endpoint Config */}
          <div className="p-4 rounded-lg bg-[#041422] border border-cyan-500/30 space-y-3">
            <div className="text-xs font-bold text-cyan-200 border-b border-cyan-500/20 pb-2 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-cyan-400" />
              <span>Provider Parameters & Configuration</span>
            </div>

            {/* API Key Input (if needed) */}
            {currentProviderMeta.needsKey && (
              <div className="space-y-1">
                <label className="text-[10px] text-cyan-300 block font-bold">
                  API Key for {currentProviderMeta.name}:
                </label>
                <div className="relative">
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={localConfig.apiKey}
                    onChange={(e) => setLocalConfig({ ...localConfig, apiKey: e.target.value })}
                    placeholder={`Enter your ${localConfig.provider.toUpperCase()} API key...`}
                    className="w-full px-3 py-2 pr-10 rounded bg-[#020b13] border border-cyan-500/40 text-cyan-100 placeholder:text-cyan-700 text-xs focus:outline-none focus:border-cyan-300 font-mono-tech"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-cyan-400 hover:text-cyan-200 p-1"
                    title={showKey ? 'Hide Key' : 'Show Key'}
                  >
                    {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <p className="text-[9px] text-cyan-500">
                  Key is saved securely in your browser session and used to process Stonic AI directives.
                </p>
              </div>
            )}

            {/* Base URL (if needed for Local Ollama / LM Studio) */}
            {currentProviderMeta.needsBaseUrl && (
              <div className="space-y-1">
                <label className="text-[10px] text-cyan-300 block font-bold">
                  Local Endpoint / Server Base URL:
                </label>
                <input
                  type="text"
                  value={localConfig.baseUrl}
                  onChange={(e) => setLocalConfig({ ...localConfig, baseUrl: e.target.value })}
                  placeholder="e.g. http://localhost:11434/v1 or http://localhost:1234/v1"
                  className="w-full px-3 py-2 rounded bg-[#020b13] border border-cyan-500/40 text-cyan-100 placeholder:text-cyan-700 text-xs focus:outline-none focus:border-cyan-300 font-mono-tech"
                />
                <p className="text-[9px] text-cyan-500">
                  Default Ollama endpoint is http://localhost:11434/v1. For LM Studio use http://localhost:1234/v1.
                </p>
              </div>
            )}

            {/* Model Name */}
            <div className="space-y-1">
              <label className="text-[10px] text-cyan-300 block font-bold">
                Target Model Name:
              </label>
              <input
                type="text"
                value={localConfig.model}
                onChange={(e) => setLocalConfig({ ...localConfig, model: e.target.value })}
                placeholder={currentProviderMeta.defaultModel}
                className="w-full px-3 py-2 rounded bg-[#020b13] border border-cyan-500/40 text-cyan-100 placeholder:text-cyan-700 text-xs focus:outline-none focus:border-cyan-300 font-mono-tech"
              />
            </div>

            {/* Test Connection Button & Result */}
            <div className="pt-2 flex flex-col gap-2">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={testingConnection}
                className="w-full py-2 rounded bg-cyan-500/20 border border-cyan-400 text-cyan-200 text-xs font-bold hover:bg-cyan-500/35 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {testingConnection ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Pinging Neural Provider...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Test Connection & Check Latency</span>
                  </>
                )}
              </button>

              {testResult && (
                <div
                  className={`p-2.5 rounded text-[10px] border flex items-start gap-2 ${
                    testResult.success
                      ? 'bg-emerald-950/50 border-emerald-500/60 text-emerald-200'
                      : 'bg-red-950/50 border-red-500/60 text-red-200'
                  }`}
                >
                  {testResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <div className="font-bold">{testResult.message}</div>
                    {testResult.models && testResult.models.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        <span className="text-cyan-300">Available:</span>
                        {testResult.models.map((m) => (
                          <span
                            key={m}
                            onClick={() => setLocalConfig({ ...localConfig, model: m })}
                            className="px-1.5 py-0.2 rounded bg-black/50 border border-cyan-400/40 text-cyan-200 cursor-pointer hover:border-cyan-200"
                            title="Click to use this model"
                          >
                            {m}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Voice & Intelligence Personality Tuning */}
          <div className="p-4 rounded-lg bg-[#041422] border border-cyan-500/30 space-y-3">
            <div className="text-xs font-bold text-cyan-200 border-b border-cyan-500/20 pb-2 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>Voice Synthesis & Language Clarity Engine</span>
              </div>
              <span className="text-[9px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                PRO URDU & SARAIKI AUDIO
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Auto Speak Toggle */}
              <div className="p-2.5 rounded bg-[#020b13] border border-cyan-500/20 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-cyan-200 font-bold block">Auto-Speak Responses</span>
                  <span className="text-[8.5px] text-cyan-500">Read AI answers aloud via TTS</span>
                </div>
                <input
                  type="checkbox"
                  checked={localConfig.autoSpeak}
                  onChange={(e) => setLocalConfig({ ...localConfig, autoSpeak: e.target.checked })}
                  className="w-4 h-4 accent-cyan-400 cursor-pointer"
                />
              </div>

              {/* Speech Synthesis Engine */}
              <div className="p-2.5 rounded bg-[#020b13] border border-cyan-500/20 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-cyan-200 font-bold block">Audio Clarity Engine</span>
                  <span className="text-[8.5px] text-cyan-500">
                    {localConfig.voiceEngine === 'browser_native' ? 'Native Script-Aware' : 'Gemini Studio HD (24kHz)'}
                  </span>
                </div>
                <select
                  value={localConfig.voiceEngine || 'gemini_neural'}
                  onChange={(e) => setLocalConfig({ ...localConfig, voiceEngine: e.target.value as any })}
                  className="bg-[#030e17] border border-cyan-500/40 text-cyan-200 text-[10px] rounded px-2 py-1 focus:outline-none"
                >
                  <option value="gemini_neural">Gemini Studio Neural (Ultra Clear)</option>
                  <option value="browser_native">Native Browser Engine</option>
                </select>
              </div>
            </div>

            {/* Live Agent Voice & Pronunciation Clarity Tester */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-cyan-300 font-bold uppercase tracking-wider flex items-center gap-1">
                  <Play className="w-3 h-3 text-cyan-400" />
                  <span>Test Each Agent Voice Live (Saraiki / Roman Urdu):</span>
                </span>
                {testingAgentId && (
                  <button
                    type="button"
                    onClick={() => {
                      stopAllAgentSpeech();
                      setTestingAgentId(null);
                    }}
                    className="text-[9px] px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/40 flex items-center gap-1 hover:bg-red-500/30 cursor-pointer"
                  >
                    <Square className="w-2.5 h-2.5 fill-current" />
                    <span>Stop Speech</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {/* Alice (Female Analyst) */}
                <button
                  type="button"
                  onClick={() => {
                    const phrase = 'Sain! Sector-9 satellite orbital link lock thia hey, briefing dossier bilkul tayar hey.';
                    setTestingAgentId('alice');
                    playAgentSpeech(phrase, 'alice', {
                      customApiKey: localConfig.apiKey,
                      voiceEngine: localConfig.voiceEngine,
                      onEnd: () => setTestingAgentId(null),
                    });
                  }}
                  className={`p-2 rounded border text-left transition-all cursor-pointer ${
                    testingAgentId === 'alice'
                      ? 'bg-purple-950/60 border-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.3)]'
                      : 'bg-[#020b13] border-purple-500/30 hover:border-purple-400/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-purple-300">👩 Alice (Female)</span>
                    <span className="text-[8px] px-1 py-0.2 rounded bg-purple-500/20 text-purple-200">
                      {testingAgentId === 'alice' ? 'Speaking...' : 'Analyst Voice'}
                    </span>
                  </div>
                  <p className="text-[8px] text-slate-400 mt-1 italic line-clamp-1">
                    "Sain! Satellite link lock thia hey..."
                  </p>
                </button>

                {/* Carol (Female Data Specialist) */}
                <button
                  type="button"
                  onClick={() => {
                    const phrase = 'Ada Bob, Kafka consumer pipeline 1.4M events per second te mast chaldi payi hey!';
                    setTestingAgentId('carol');
                    playAgentSpeech(phrase, 'carol', {
                      customApiKey: localConfig.apiKey,
                      voiceEngine: localConfig.voiceEngine,
                      onEnd: () => setTestingAgentId(null),
                    });
                  }}
                  className={`p-2 rounded border text-left transition-all cursor-pointer ${
                    testingAgentId === 'carol'
                      ? 'bg-emerald-950/60 border-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.3)]'
                      : 'bg-[#020b13] border-emerald-500/30 hover:border-emerald-400/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-emerald-300">👩 Carol (Female)</span>
                    <span className="text-[8px] px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-200">
                      {testingAgentId === 'carol' ? 'Speaking...' : 'Data Specialist'}
                    </span>
                  </div>
                  <p className="text-[8px] text-slate-400 mt-1 italic line-clamp-1">
                    "Ada Bob, Kafka pipeline mast chaldi..."
                  </p>
                </button>

                {/* Bob (MALE Cyber Security Lead) */}
                <button
                  type="button"
                  onClick={() => {
                    const phrase = 'Haan Alice baji! Ingress firewall full tight hey, hacker da baap ve nai aa sakda!';
                    setTestingAgentId('bob');
                    playAgentSpeech(phrase, 'bob', {
                      customApiKey: localConfig.apiKey,
                      voiceEngine: localConfig.voiceEngine,
                      onEnd: () => setTestingAgentId(null),
                    });
                  }}
                  className={`p-2 rounded border text-left transition-all cursor-pointer ${
                    testingAgentId === 'bob'
                      ? 'bg-blue-950/60 border-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.3)]'
                      : 'bg-[#020b13] border-blue-500/30 hover:border-blue-400/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-blue-300">👨 Bob (MALE)</span>
                    <span className="text-[8px] px-1 py-0.2 rounded bg-blue-500/20 text-blue-200">
                      {testingAgentId === 'bob' ? 'Speaking...' : 'Cyber Defense'}
                    </span>
                  </div>
                  <p className="text-[8px] text-slate-400 mt-1 italic line-clamp-1">
                    "Haan Alice baji! Firewall full tight hey..."
                  </p>
                </button>

                {/* Dave (MALE Cloud DevOps Architect) */}
                <button
                  type="button"
                  onClick={() => {
                    const phrase = 'Jani Kubernetes de saray 16 pods green han, cluster full chass karwa reha hey!';
                    setTestingAgentId('dave');
                    playAgentSpeech(phrase, 'dave', {
                      customApiKey: localConfig.apiKey,
                      voiceEngine: localConfig.voiceEngine,
                      onEnd: () => setTestingAgentId(null),
                    });
                  }}
                  className={`p-2 rounded border text-left transition-all cursor-pointer ${
                    testingAgentId === 'dave'
                      ? 'bg-amber-950/60 border-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.3)]'
                      : 'bg-[#020b13] border-amber-500/30 hover:border-amber-400/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-amber-300">👨 Dave (MALE)</span>
                    <span className="text-[8px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-200">
                      {testingAgentId === 'dave' ? 'Speaking...' : 'DevOps Architect'}
                    </span>
                  </div>
                  <p className="text-[8px] text-slate-400 mt-1 italic line-clamp-1">
                    "Jani 16 pods green han, full chass..."
                  </p>
                </button>

                {/* Stonic AI (Central Core Intelligence) */}
                <button
                  type="button"
                  onClick={() => {
                    const phrase = 'Kivein o jani? Usman sahib da Stonic AI bilkul hazir hey, dasso ki hukum hey!';
                    setTestingAgentId('stonic');
                    playAgentSpeech(phrase, 'stonic', {
                      customApiKey: localConfig.apiKey,
                      voiceEngine: localConfig.voiceEngine,
                      onEnd: () => setTestingAgentId(null),
                    });
                  }}
                  className={`p-2 rounded border text-left transition-all cursor-pointer col-span-1 sm:col-span-2 md:col-span-2 ${
                    testingAgentId === 'stonic'
                      ? 'bg-cyan-950/60 border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                      : 'bg-[#020b13] border-cyan-500/30 hover:border-cyan-400/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-cyan-300">🤖 Stonic AI Central Core</span>
                    <span className="text-[8px] px-1 py-0.2 rounded bg-cyan-500/20 text-cyan-200">
                      {testingAgentId === 'stonic' ? 'Speaking...' : 'Master Intelligence'}
                    </span>
                  </div>
                  <p className="text-[8px] text-slate-400 mt-1 italic line-clamp-1">
                    "Kivein o jani? Usman sahib da Stonic AI bilkul hazir hey..."
                  </p>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-cyan-500/30 bg-[#030d17] shrink-0">
          <button
            onClick={() => {
              setLocalConfig(DEFAULT_BRAIN_CONFIG);
              setTestResult(null);
            }}
            className="px-3 py-1.5 rounded border border-cyan-500/30 text-cyan-400 text-xs font-mono-tech hover:bg-cyan-500/10 cursor-pointer"
          >
            Reset to Default Stonic
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded border border-slate-700 text-slate-300 text-xs font-mono-tech hover:bg-slate-800 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-1.5 rounded bg-cyan-500 text-slate-950 font-bold text-xs font-mono-tech hover:bg-cyan-400 shadow-[0_0_15px_#00f0ff] transition-all cursor-pointer"
            >
              Save & Apply Brain Config
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
