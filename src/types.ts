export interface ActionBadge {
  type: string;
  description: string;
  executionTime?: string;
}

export interface ChatMessage {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  timestamp: Date;
  actions?: ActionBadge[];
  isTyping?: boolean;
  agentId?: string;
  agentName?: string;
}

export interface TacticalHotspot {
  id: string;
  title: string;
  region: string;
  coordinates: [number, number]; // lat, lng
  severity: 'high' | 'medium' | 'low';
  type: string;
  timeAgo: string;
  description: string;
}

export interface Headline {
  id: string;
  number: string;
  category: string;
  title: string;
  detail: string;
}

export interface AgentInfo {
  id: string;
  name: string;
  role: string;
  color?: string;
  avatarBg?: string;
  avatarColor?: string;
  status: 'active' | 'busy' | 'idle' | 'online';
  activity?: string;
  task: string;
  x?: number;
  y?: number;
  currentLocation?: string;
}

export interface InterAgentMessage {
  id: string;
  senderId: string;
  recipientId: string;
  senderName: string;
  recipientName: string;
  content: string;
  category?: string;
  timestamp: string;

  // Inter-agent dialogue compatibility
  speakerId?: string;
  speakerName?: string;
  targetId?: string;
  text?: string;
}

export type AIProvider =
  | 'stonic_gemini'
  | 'custom_gemini'
  | 'openai'
  | 'deepseek'
  | 'anthropic'
  | 'local_ollama'
  | 'custom_endpoint';

export interface BrainConfig {
  provider: AIProvider;
  apiKey: string;
  model: string;
  baseUrl: string;
  autoSpeak: boolean;
  voiceSpeed: number;
  voicePitch: number;
  voiceLanguage: string;
  voiceEngine?: 'gemini_neural' | 'browser_native';
  voiceClarityBoost?: boolean;
  screenMonitorInterval: number;
  temperature: number;
}

export interface ScreenCodeSnippet {
  language: string;
  filename?: string;
  code: string;
  explanation?: string;
}

export interface ScreenAnalysisResult {
  summary: string;
  appName?: string;
  detectedIssues: string[];
  suggestedActions: string[];
  codeSnippets: ScreenCodeSnippet[];
  speechResponse?: string;
  timestamp?: string;
  controlElements?: AppControlElement[];
}

export interface AppControlElement {
  id: string;
  type: 'button' | 'input' | 'tab' | 'error_box' | 'terminal_prompt' | 'workflow';
  label: string;
  actionRequired?: string;
  recommendedCommand?: string;
  confidence: number;
}

export interface LifetimeMissionState {
  missionGoal: string;
  isActive: boolean;
  startTime: string;
  scansPerformed: number;
  actionsAutoExecuted: number;
  lastAppDetected: string;
  supervisedWindow: string;
}

export interface OwnerVoiceProfile {
  ownerName: string;
  voiceSignature: string;
  enrolledAt: string;
  passphrase: string;
  dominantFrequencyHz: number;
  tolerance: number;
  guardArmed: boolean;
}

export interface SecurityBreachEvent {
  id: string;
  timestamp: string;
  type: 'UNAUTHORIZED_TOUCH' | 'VOICE_MISMATCH' | 'PORT_INTRUSION';
  detail: string;
  preventedAction: string;
}

export interface OwnerSecurityProfile {
  ownerName: string;
  isEnrolled: boolean;
  enrolledDate?: string;
  baseFrequencyHz: number;
  varianceThreshold: number;
  voicePassphrase: string;
  securityPin: string;
  sentryArmed: boolean;
  sensitivity: 'low' | 'medium' | 'high';
  customVoiceWarning: string;
}

export interface CryptoAsset {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  high24h: number;
  low24h: number;
  volume: string;
  rsi: number;
  macd: 'bullish' | 'bearish' | 'neutral';
  trend: 'STRONG_BUY' | 'BUY' | 'NEUTRAL' | 'SELL' | 'STRONG_SELL';
  support: number;
  resistance: number;
  marketCap: string;
  sparkline: number[];
}

export interface CryptoMarketingCampaign {
  id?: string;
  tokenSymbol: string;
  narrative: string;
  audience: 'degen' | 'institutional' | 'solana_community' | 'general';
  platform: 'twitter' | 'telegram' | 'kol_pitch' | 'meme_viral';
  content: string;
  generatedAt?: string;
}

export type UserEmotion =
  | 'worried_anxious'
  | 'excited_bullish'
  | 'frustrated_angry'
  | 'curious_analytical'
  | 'neutral_chill';

export interface EmotionAnalysis {
  emotion: UserEmotion;
  label: string;
  emoji: string;
  confidence: number;
  triggerWords: string[];
  recommendedTone: string;
  agentEmpathyQuote: string;
}
