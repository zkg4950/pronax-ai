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
  speakerId: 'alice' | 'bob' | 'carol' | 'dave';
  speakerName: string;
  targetId?: 'alice' | 'bob' | 'carol' | 'dave' | 'all';
  text: string;
  timestamp: string;
}

